
import { useState } from "react";
import { Upload, FileType, ArrowDownToLine, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { extractTextFromFile } from "@/api/backend-api";

interface FileUploadProps {
  onFileProcessed: (text: string, filename: string) => void;
}

const FileUpload = ({ onFileProcessed }: FileUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMessage(null);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    
    try {
      // Use our backend API to extract text
      const extractedText = await extractTextFromFile(selectedFile);
      if (!extractedText) {
        throw new Error("No text was extracted from the file");
      }
      onFileProcessed(extractedText, selectedFile.name);
      toast.success("File processed successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      
      // Provide more specific error messages
      const errorMsg = error.message || "Failed to process file";
      setErrorMessage(errorMsg);
      
      // Check if it's likely a connection issue
      if (errorMsg.includes("Failed to fetch") || errorMsg.includes("Network Error")) {
        toast.error("Cannot connect to backend server. Make sure the Flask server is running at http://localhost:5000");
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6 w-full">
      <div className="flex flex-col items-center justify-center w-full">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 w-full flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary transition-colors"
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          <Upload size={48} className="text-gray-500" />
          <div className="text-center">
            <h3 className="font-medium text-lg">Upload your document</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Drag and drop or click to upload PDF, Word, Image or Text files
            </p>
          </div>
          
          <input
            id="fileInput"
            type="file"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileChange}
          />
          
          {selectedFile && (
            <div className="mt-2 text-sm font-medium">
              Selected: {selectedFile.name}
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm">
            <strong>Error:</strong> {errorMessage}
            <div className="mt-1">
              <strong>Troubleshooting:</strong>
              <ul className="list-disc pl-5 mt-1 text-xs">
                <li>Ensure the Flask backend server is running on port 5000</li>
                <li>Check that the file format is supported</li>
                <li>Verify the correct API endpoints are configured</li>
              </ul>
            </div>
          </div>
        )}

        <Button 
          className="mt-4 w-full"
          disabled={!selectedFile || isUploading}
          onClick={uploadFile}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              Extract Text
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default FileUpload;

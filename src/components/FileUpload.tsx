
import { useState } from "react";
import { Upload, FileType, ArrowDownToLine, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface FileUploadProps {
  onFileProcessed: (text: string, filename: string) => void;
}

const FileUpload = ({ onFileProcessed }: FileUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    
    // Create form data to send the file
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // In a real implementation, this would point to your Flask backend
      // For now, we'll simulate a successful API response
      setTimeout(() => {
        // Simulating text extraction result
        const simulatedText = "This is extracted text from " + selectedFile.name;
        onFileProcessed(simulatedText, selectedFile.name);
        toast.success("File processed successfully");
        setIsUploading(false);
      }, 2000);
      
      /* Actual API implementation would be:
      const response = await fetch('http://your-flask-api/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process file');
      }

      const data = await response.json();
      onFileProcessed(data.extractedText, selectedFile.name);
      */
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to process file");
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

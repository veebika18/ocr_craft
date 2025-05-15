
import { useState } from "react";
import { Upload, ArrowDownToLine, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { extractTextFromFile } from "@/api/backend-api";
import { Progress } from "@/components/ui/progress";

interface FileUploadProps {
  onFileProcessed: (text: string, filename: string) => void;
}

const FileUpload = ({ onFileProcessed }: FileUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMessage(null);
      // Reset progress
      setUploadProgress(0);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress > 70 ? 70 : newProgress; // Max 70% until real completion
      });
    }, 300);
    
    try {
      // Use our backend API to extract text
      const extractedText = await extractTextFromFile(selectedFile);
      if (!extractedText) {
        throw new Error("No text was extracted from the file");
      }
      
      // Complete the progress bar
      setUploadProgress(100);
      
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
      clearInterval(progressInterval);
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6 w-full border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-background">
      <div className="flex flex-col items-center justify-center w-full">
        <div 
          className="border-2 border-dashed border-primary/30 rounded-lg p-8 w-full flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/70 transition-colors bg-white/50 backdrop-blur-sm"
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          <div className="p-4 rounded-full bg-primary/10 text-primary">
            <Upload size={32} />
          </div>
          
          <div className="text-center">
            <h3 className="font-medium text-xl text-primary">Upload Document</h3>
            <p className="text-sm text-muted-foreground mt-1">
              PDF, Word, Image or Text files supported
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
            <div className="mt-2 flex items-center gap-2 text-sm font-medium bg-primary/10 px-3 py-2 rounded-full">
              <FileText size={16} className="text-primary" />
              {selectedFile.name}
            </div>
          )}
        </div>

        {uploadProgress > 0 && (
          <div className="w-full mt-4">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-right">{Math.round(uploadProgress)}%</p>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm">
            <strong>Error:</strong> {errorMessage}
            <div className="mt-1">
              <strong>Troubleshooting:</strong>
              <ul className="list-disc pl-5 mt-1 text-xs">
                <li>Ensure the Flask backend server is running on port 5000</li>
                <li>Check that the file format is supported</li>
              </ul>
            </div>
          </div>
        )}

        <Button 
          className="mt-4 w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
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

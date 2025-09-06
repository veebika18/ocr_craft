import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, CheckCheck, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { convertTextToFormat } from "@/api/backend-api";

interface ExtractedContentProps {
  text: string;
  filename: string;
}

const ExtractedContent = ({ text, filename }: ExtractedContentProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentFormat, setCurrentFormat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success("Text copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
      toast.error("Failed to copy text");
    }
  };

  const downloadAs = async (format: string) => {
    try {
      setError(null);
      setIsDownloading(true);
      setCurrentFormat(format);
      
      // Generate a default filename if none is provided
      const baseFilename = filename && filename.trim() ? 
        filename.split('.')[0].replace(/[^a-zA-Z0-9_\- ]/g, '') : 
        'extracted';
      
      console.log(`Starting download as ${format}. Filename: ${baseFilename}`);
      
      // Call the backend to convert and get the file
      const blob = await convertTextToFormat(text, format, baseFilename);
      
      console.log(`Download blob received, size: ${blob.size} bytes, type: ${blob.type}`);
      
      if (blob.size === 0) {
        throw new Error("Received empty file from server");
      }
      
      // Create a download link and trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseFilename}.${format}`;
      
      // Append, click, and remove (in a way that works in most browsers)
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log("Download cleanup completed");
      }, 100);
      
      toast.success(`Downloaded as ${format.toUpperCase()}`);
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error";
      console.error(`Failed to download as ${format}:`, error);
      setError(`Failed to download as ${format}: ${errorMessage}`);
      toast.error(`Failed to download as ${format}: ${errorMessage}`);
    } finally {
      setIsDownloading(false);
      setCurrentFormat(null);
    }
  };

  return (
    <Card className="p-6 w-full mt-6 border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-background backdrop-blur-sm">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-medium text-primary">Extracted Text</h3>
          <Button variant="outline" size="sm" onClick={copyToClipboard} className="hover:bg-primary/10">
            {isCopied ? <CheckCheck className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {isCopied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        
        <div className="bg-white/80 p-4 rounded-md max-h-64 overflow-y-auto whitespace-pre-wrap border border-muted shadow-inner">
          {text || "No text extracted yet."}
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <div className="mt-2">
          <h4 className="text-sm font-medium mb-2 text-primary/80">Download as:</h4>
          <div className="flex flex-wrap gap-2">
            {['txt', 'pdf', 'doc'].map(format => (
              <Button 
                key={format}
                variant="outline" 
                size="sm" 
                onClick={() => downloadAs(format)}
                disabled={isDownloading}
                className="bg-white/70 hover:bg-primary/10"
              >
                {isDownloading && currentFormat === format ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-1" />
                )}
                {format.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExtractedContent;
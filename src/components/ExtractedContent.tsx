
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { convertTextToFormat } from "@/api/backend-api";

interface ExtractedContentProps {
  text: string;
  filename: string;
}

const ExtractedContent = ({ text, filename }: ExtractedContentProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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
      setIsDownloading(true);
      
      // Call the backend to convert and get the file
      const blob = await convertTextToFormat(text, format, filename);
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename.split('.')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error(`Failed to download as ${format}:`, error);
      toast.error(`Failed to download as ${format}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="p-6 w-full mt-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Extracted Text</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              {isCopied ? <CheckCheck className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {isCopied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
        
        <div className="bg-muted p-4 rounded-md max-h-64 overflow-y-auto whitespace-pre-wrap">
          {text || "No text extracted yet."}
        </div>
        
        <div className="mt-2">
          <h4 className="text-sm font-medium mb-2">Download as:</h4>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => downloadAs('txt')}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4 mr-1" /> TXT
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => downloadAs('pdf')}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4 mr-1" /> PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => downloadAs('doc')}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4 mr-1" /> DOC
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => downloadAs('image')}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4 mr-1" /> Image
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExtractedContent;

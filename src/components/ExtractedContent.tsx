
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, CheckCheck } from "lucide-react";
import { toast } from "sonner";

interface ExtractedContentProps {
  text: string;
  filename: string;
}

const ExtractedContent = ({ text, filename }: ExtractedContentProps) => {
  const [isCopied, setIsCopied] = useState(false);

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

  const downloadAs = (format: string) => {
    // In a real implementation, this would call the backend API to convert
    // For now, we simulate text download
    const fileExtension = format.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'txt': 'text/plain',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'image': 'image/png',
    };
    
    if (format === 'txt') {
      // For TXT we can create it directly in the browser
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename.split('.')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded as ${fileExtension.toUpperCase()}`);
    } else {
      // For other formats, in a real implementation we would call the backend
      toast.info(`In a real implementation, the text would be downloaded as ${fileExtension.toUpperCase()}`);
      
      /* Actual implementation would be:
      fetch('http://your-flask-api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          format,
          filename,
        }),
      })
        .then(response => response.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename.split('.')[0]}.${fileExtension}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      */
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
            <Button variant="outline" size="sm" onClick={() => downloadAs('txt')}>
              <Download className="h-4 w-4 mr-1" /> TXT
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadAs('pdf')}>
              <Download className="h-4 w-4 mr-1" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadAs('doc')}>
              <Download className="h-4 w-4 mr-1" /> DOC
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadAs('image')}>
              <Download className="h-4 w-4 mr-1" /> Image
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExtractedContent;

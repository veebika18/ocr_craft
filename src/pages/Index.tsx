
import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import ExtractedContent from "@/components/ExtractedContent";
import AlgorithmInfo from "@/components/AlgorithmInfo";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const [extractedText, setExtractedText] = useState("");
  const [processedFilename, setProcessedFilename] = useState("");

  const handleFileProcessed = (text: string, filename: string) => {
    setExtractedText(text);
    setProcessedFilename(filename);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold">Advanced Text Extraction</h1>
          <p className="mt-2 text-primary-foreground/90">
            Extract text from multiple document types with high accuracy
          </p>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto py-8 px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Upload Document</h2>
            <FileUpload onFileProcessed={handleFileProcessed} />
            
            {extractedText && (
              <ExtractedContent 
                text={extractedText} 
                filename={processedFilename} 
              />
            )}
          </div>
          
          <div className="md:col-span-1">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-medium text-lg">Supported File Formats</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                  PDF Documents
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                  Word Documents (.doc, .docx)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span>
                  Images (.jpg, .png, .jpeg)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                  Text Files (.txt)
                </li>
              </ul>
              
              <Separator className="my-4" />
              
              <h3 className="font-medium text-lg">Processing Steps</h3>
              <ol className="mt-2 space-y-2 list-decimal list-inside text-sm">
                <li>Upload your document</li>
                <li>Automatic format detection</li>
                <li>Pre-processing optimization</li>
                <li>Multi-algorithm text extraction</li>
                <li>Intelligent post-processing</li>
                <li>Download in your preferred format</li>
              </ol>
            </div>
            
            <AlgorithmInfo />
          </div>
        </div>
      </main>
      
      <footer className="border-t mt-12 py-6">
        <div className="container max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Advanced Text Extraction Tool &copy; 2025</p>
          <p className="mt-1">Using Transformer-based OCR and CNN processing</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;


import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import ExtractedContent from "@/components/ExtractedContent";

const Index = () => {
  const [extractedText, setExtractedText] = useState("");
  const [processedFilename, setProcessedFilename] = useState("");

  const handleFileProcessed = (text: string, filename: string) => {
    setExtractedText(text);
    setProcessedFilename(filename);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold">Text Extractor</h1>
          <p className="mt-2 text-primary-foreground/90">
            Extract text from any document type in seconds
          </p>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto py-10 px-4">
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-primary">Upload Your Document</h2>
            <FileUpload onFileProcessed={handleFileProcessed} />
          </section>
          
          {extractedText && (
            <section>
              <ExtractedContent 
                text={extractedText} 
                filename={processedFilename} 
              />
            </section>
          )}

          <section className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/50 p-6 rounded-lg shadow-sm border border-primary/10 backdrop-blur-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="text-lg font-medium mb-2">Upload Any Format</h3>
                <p className="text-sm text-muted-foreground">
                  Support for PDF, Word, Images and Text files
                </p>
              </div>
              <div className="bg-white/50 p-6 rounded-lg shadow-sm border border-primary/10 backdrop-blur-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="text-lg font-medium mb-2">Smart Extraction</h3>
                <p className="text-sm text-muted-foreground">
                  Multi-algorithm processing for optimal accuracy
                </p>
              </div>
              <div className="bg-white/50 p-6 rounded-lg shadow-sm border border-primary/10 backdrop-blur-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="text-lg font-medium mb-2">Instant Download</h3>
                <p className="text-sm text-muted-foreground">
                  Export extracted text in multiple formats
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <footer className="border-t mt-12 py-6 bg-white/30 backdrop-blur-sm">
        <div className="container max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Advanced Text Extraction Tool &copy; 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

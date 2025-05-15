
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AlgorithmInfo = () => {
  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle>Text Extraction Technologies</CardTitle>
        <CardDescription>Advanced techniques used for accurate text extraction</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transformer">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="transformer">Transformer</TabsTrigger>
            <TabsTrigger value="cnn">CNN</TabsTrigger>
            <TabsTrigger value="preprocessing">Pre-processing</TabsTrigger>
            <TabsTrigger value="postprocessing">Post-processing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transformer" className="space-y-4">
            <h4 className="font-medium">Transformer-based OCR</h4>
            <p className="text-sm text-muted-foreground">
              Utilizes attention mechanisms to recognize complex text patterns. Our system implements 
              models like EasyOCR and Tesseract v5 that use BERT-like architectures to achieve high 
              accuracy across multiple languages and font styles.
            </p>
          </TabsContent>
          
          <TabsContent value="cnn" className="space-y-4">
            <h4 className="font-medium">Convolutional Neural Networks</h4>
            <p className="text-sm text-muted-foreground">
              CNNs excel at feature extraction from images. Our implementation uses 
              specialized convolutional layers to detect text regions, character shapes, 
              and handle various document layouts automatically.
            </p>
          </TabsContent>
          
          <TabsContent value="preprocessing" className="space-y-4">
            <h4 className="font-medium">Advanced Pre-processing</h4>
            <p className="text-sm text-muted-foreground">
              Documents undergo intelligent pre-processing including:
              <ul className="list-disc pl-5 mt-2">
                <li>Adaptive thresholding for varied lighting conditions</li>
                <li>Deskewing and rotation correction</li>
                <li>Noise reduction and background removal</li>
                <li>Resolution enhancement for low-quality documents</li>
              </ul>
            </p>
          </TabsContent>
          
          <TabsContent value="postprocessing" className="space-y-4">
            <h4 className="font-medium">Intelligent Post-processing</h4>
            <p className="text-sm text-muted-foreground">
              Extracted text is refined through:
              <ul className="list-disc pl-5 mt-2">
                <li>Language-specific spell checking</li>
                <li>Context-aware error correction</li>
                <li>Structural formatting preservation</li>
                <li>Natural language processing for ambiguous characters</li>
              </ul>
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AlgorithmInfo;

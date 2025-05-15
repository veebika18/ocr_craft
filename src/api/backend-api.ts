
// This file contains integration points for the Flask backend API

/**
 * Sends a file to the backend for text extraction
 * 
 * @param file The file to extract text from
 * @returns Promise with the extracted text
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  
  try {
    console.log("Sending file to backend:", file.name, file.type, file.size);
    
    // Call the Flask backend API
    const response = await fetch('http://localhost:5000/api/extract-text', {
      method: 'POST',
      body: formData,
    });
    
    console.log("Backend response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Text extraction successful, received data:", data);
    return data.extractedText || "";
  } catch (error) {
    console.error("Error extracting text:", error);
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
};

/**
 * Converts extracted text to the requested format
 * 
 * @param text The text to convert
 * @param format The target format (pdf, doc, txt, image)
 * @param filename Original filename
 * @returns Promise with a blob for download
 */
export const convertTextToFormat = async (
  text: string,
  format: string,
  filename: string
): Promise<Blob> => {
  try {
    console.log(`Converting text to ${format} format for file ${filename}`);
    
    // Call the Flask backend API for conversion
    const response = await fetch('http://localhost:5000/api/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        format,
        filename,
      }),
    });
    
    console.log("Conversion response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    return await response.blob();
  } catch (error) {
    console.error("Error converting text:", error);
    throw new Error(`Failed to convert text to ${format}: ${error.message}`);
  }
};

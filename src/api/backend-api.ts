const API_BASE_URL = 'http://127.0.0.1:5000/api'; // Must match backend route prefix

export const extractTextFromFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    console.log("Sending file to API for text extraction:", file.name);
    const response = await fetch(`${API_BASE_URL}/extract-text`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.extractedText || "";
  } catch (error: any) {
    console.error("Text extraction error:", error);
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
};

export const convertTextToFormat = async (
  text: string,
  format: string,
  filename: string
): Promise<Blob> => {
  try {
    if (!text || text.trim() === "") {
      throw new Error("No text to convert");
    }
    
    console.log(`Converting to ${format}. Text length: ${text.length}, Filename: ${filename}`);
    
    const response = await fetch(`${API_BASE_URL}/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text, 
        format, 
        filename: filename || 'output'
      }),
    });

    if (!response.ok) {
      let errorText = "";
      try {
        const errorData = await response.json();
        errorText = errorData.error || `Status ${response.status}`;
      } catch (e) {
        errorText = await response.text() || `Status ${response.status}`;
      }
      throw new Error(`API conversion failed: ${errorText}`);
    }

    // NEW: Process base64 encoded data from response
    const data = await response.json();
    
    if (!data.fileData) {
      throw new Error("Response missing file data");
    }
    
    // Convert base64 to blob
    const byteCharacters = atob(data.fileData);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    const blob = new Blob(byteArrays, { type: data.mimeType });
    
    if (blob.size === 0) {
      throw new Error("Received empty file data");
    }
    
    console.log(`Received ${format} blob, size: ${blob.size} bytes, type: ${blob.type}`);
    return blob;
  } catch (error: any) {
    console.error(`Text conversion error (${format}):`, error);
    throw new Error(`Failed to convert text to ${format}: ${error.message}`);
  }
};
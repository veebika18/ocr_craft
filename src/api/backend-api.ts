const API_BASE_URL = 'http://127.0.0.1:5000/api'; // Must match backend route prefix

export const extractTextFromFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
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
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
};

export const convertTextToFormat = async (
  text: string,
  format: string,
  filename: string
): Promise<Blob> => {
  try {
    const response = await fetch(`${API_BASE_URL}/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, format, filename }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    return await response.blob();
  } catch (error: any) {
    throw new Error(`Failed to convert text to ${format}: ${error.message}`);
  }
};

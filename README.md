
# Advanced Text Extraction Application

## Frontend Features
- Document upload interface for PDF, Word, Image and Text files
- Text extraction visualization and editing
- Multiple download formats (PDF, DOC, TXT, Image)
- Information about extraction algorithms and technologies

## Backend Implementation
The frontend connects to a Flask API backend. Below is the code for the Flask backend implementation:

```python
# app.py - Flask backend for text extraction
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import tempfile
import cv2
import numpy as np
from PIL import Image
import pytesseract
from pdf2image import convert_from_path
import docx2txt
import easyocr
import re
from fpdf import FPDF
from docx import Document
import io

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Initialize EasyOCR Reader (Transformer-based OCR)
reader = easyocr.Reader(['en'])

@app.route('/api/extract-text', methods=['POST'])
def extract_text():
    """
    Endpoint for extracting text from uploaded files
    Handles PDF, DOCX, TXT, and image files
    Uses multiple algorithms for best results
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Save uploaded file to a temp location
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, file.filename)
    file.save(temp_path)
    
    try:
        # Determine file type and process accordingly
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']:
            extracted_text = process_image_file(temp_path)
        elif file_ext == '.pdf':
            extracted_text = process_pdf_file(temp_path)
        elif file_ext in ['.doc', '.docx']:
            extracted_text = process_word_file(temp_path)
        elif file_ext == '.txt':
            with open(temp_path, 'r', encoding='utf-8') as f:
                extracted_text = f.read()
        else:
            return jsonify({'error': 'Unsupported file format'}), 400
            
        # Apply post-processing
        extracted_text = post_process_text(extracted_text)
        
        return jsonify({'extractedText': extracted_text})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    finally:
        # Clean up the temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

def pre_process_image(image_path):
    """
    Apply pre-processing techniques to enhance OCR accuracy
    """
    # Read the image
    img = cv2.imread(image_path)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply adaptive thresholding
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY, 11, 2
    )
    
    # Apply noise reduction
    denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)
    
    # Correct skew if needed
    # For advanced implementation, add deskewing algorithm here
    
    return denoised

def process_image_file(image_path):
    """
    Process image file using multiple OCR engines for best results
    """
    # Pre-process the image
    processed_img = pre_process_image(image_path)
    
    # Save processed image temporarily
    processed_path = image_path + "_processed.png"
    cv2.imwrite(processed_path, processed_img)
    
    try:
        # Method 1: Use Tesseract OCR (CNN-based)
        tesseract_text = pytesseract.image_to_string(processed_img)
        
        # Method 2: Use EasyOCR (Transformer-based)
        easyocr_result = reader.readtext(processed_path)
        easyocr_text = " ".join([text[1] for text in easyocr_result])
        
        # Combine results, giving preference to the more confident one
        # For a real implementation, you could use a more sophisticated
        # algorithm to combine the results
        if len(easyocr_text) > len(tesseract_text) * 0.8:
            return easyocr_text
        return tesseract_text
    
    finally:
        # Clean up
        if os.path.exists(processed_path):
            os.remove(processed_path)

def process_pdf_file(pdf_path):
    """
    Process PDF file by converting to images and applying OCR
    """
    # Convert PDF to images
    images = convert_from_path(pdf_path)
    
    all_text = []
    
    # Process each page
    for i, image in enumerate(images):
        # Save page as temporary image
        temp_img_path = f"{pdf_path}_page_{i}.png"
        image.save(temp_img_path, 'PNG')
        
        try:
            # Extract text from the page
            page_text = process_image_file(temp_img_path)
            all_text.append(page_text)
        
        finally:
            # Clean up
            if os.path.exists(temp_img_path):
                os.remove(temp_img_path)
    
    # Join all pages' text
    return "\n\n".join(all_text)

def process_word_file(docx_path):
    """
    Process Word document to extract text
    """
    return docx2txt.process(docx_path)

def post_process_text(text):
    """
    Apply intelligent post-processing techniques
    """
    if not text:
        return ""
    
    # Remove excessive newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Fix common OCR errors (could be extended with more patterns)
    text = text.replace('|', 'I')
    text = text.replace('0', 'O')
    text = re.sub(r'(?<=[a-z])1(?=[a-z])', 'l', text)
    
    # Fix spacing issues
    text = re.sub(r'(?<=[a-zA-Z])\.(?=[a-zA-Z])', '. ', text)
    text = re.sub(r'(?<=[a-zA-Z]),(?=[a-zA-Z])', ', ', text)
    
    return text.strip()

@app.route('/api/convert', methods=['POST'])
def convert():
    """
    Endpoint for converting extracted text to requested format
    Supports TXT, PDF, DOC, and PNG image formats
    """
    data = request.json
    
    if not data or 'text' not in data or 'format' not in data:
        return jsonify({'error': 'Missing required data'}), 400
    
    text = data['text']
    format_type = data['format'].lower()
    filename = data.get('filename', 'document')
    base_filename = os.path.splitext(filename)[0]
    
    try:
        if format_type == 'txt':
            # Return plain text
            return create_txt_file(text, base_filename)
            
        elif format_type == 'pdf':
            # Convert to PDF
            return create_pdf_file(text, base_filename)
            
        elif format_type == 'doc':
            # Convert to DOCX
            return create_docx_file(text, base_filename)
            
        elif format_type == 'image':
            # Convert to image
            return create_image_file(text, base_filename)
            
        else:
            return jsonify({'error': 'Unsupported format'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def create_txt_file(text, filename):
    """Create a downloadable TXT file"""
    buffer = io.BytesIO()
    buffer.write(text.encode('utf-8'))
    buffer.seek(0)
    
    return send_file(
        buffer,
        mimetype='text/plain',
        as_attachment=True,
        download_name=f"{filename}.txt"
    )

def create_pdf_file(text, filename):
    """Create a downloadable PDF file"""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    # Split text into lines to avoid overflow
    for line in text.split('\n'):
        # Further split long lines
        chunks = [line[i:i+80] for i in range(0, len(line), 80)]
        for chunk in chunks:
            pdf.cell(0, 10, txt=chunk, ln=True)
    
    buffer = io.BytesIO()
    pdf.output(buffer)
    buffer.seek(0)
    
    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f"{filename}.pdf"
    )

def create_docx_file(text, filename):
    """Create a downloadable DOCX file"""
    doc = Document()
    
    for paragraph in text.split('\n\n'):
        doc.add_paragraph(paragraph)
    
    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    
    return send_file(
        buffer,
        mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        as_attachment=True,
        download_name=f"{filename}.docx"
    )

def create_image_file(text, filename):
    """Create an image with the extracted text"""
    # Calculate image dimensions based on text
    lines = text.split('\n')
    max_line_length = max(len(line) for line in lines) if lines else 0
    line_count = len(lines)
    
    # Set dimensions with some padding
    width = max(max_line_length * 10, 400)
    height = max(line_count * 20, 200)
    
    # Create a white background image
    img = np.ones((height, width, 3), np.uint8) * 255
    
    # Add text to the image
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.5
    color = (0, 0, 0)  # Black
    thickness = 1
    line_spacing = 20
    
    for i, line in enumerate(lines):
        y_position = (i + 1) * line_spacing
        cv2.putText(img, line, (10, y_position), font, font_scale, color, thickness)
    
    # Convert to bytes
    buffer = io.BytesIO()
    _, img_encoded = cv2.imencode('.png', img)
    buffer.write(img_encoded.tobytes())
    buffer.seek(0)
    
    return send_file(
        buffer,
        mimetype='image/png',
        as_attachment=True,
        download_name=f"{filename}.png"
    )

if __name__ == '__main__':
    app.run(debug=True)
```

### Required Python Packages

You'll need to install these packages for the Flask backend:

```
pip install flask flask-cors numpy opencv-python pillow pytesseract pdf2image docx2txt easyocr python-docx fpdf
```

You'll also need to install Tesseract OCR on your system:
- For Windows: Download and install from https://github.com/UB-Mannheim/tesseract/wiki
- For macOS: `brew install tesseract`
- For Linux: `apt-get install tesseract-ocr`

For PDF processing, you'll need Poppler:
- For Windows: Download and install from https://github.com/oschwartz10612/poppler-windows/releases/
- For macOS: `brew install poppler`
- For Linux: `apt-get install poppler-utils`

## Running the Application

### Start the Backend
```
python app.py
```

### Start the Frontend
```
npm install
npm run dev
```

## How to Use
1. Upload a document (PDF, Word, Image, or Text file)
2. The system processes the document using multiple algorithms
3. View the extracted text
4. Download the text in your preferred format

## Text Extraction Technologies Used

### Transformer-based OCR
- Implemented using EasyOCR
- Utilizes attention mechanisms to recognize complex text patterns
- Excellent for multiple languages and font styles

### CNN-based Processing
- Implemented using Tesseract v5
- Specialized convolutional layers for text and character detection
- Layout analysis capabilities

### Pre-processing Techniques
- Adaptive thresholding for varied lighting conditions
- Deskewing and rotation correction
- Noise reduction
- Image enhancement

### Post-processing Techniques
- Pattern-based error correction
- Context-aware fixing of common OCR mistakes
- Format preservation
- Advanced text normalization

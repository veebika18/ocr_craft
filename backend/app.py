from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from ocr.ocr_model import extract_text_from_file  # Your multi-format extraction function
import mimetypes
import os
import base64
import io
import time
from fpdf import FPDF
from docx import Document

app = Flask(__name__)
# Enable CORS with more explicit settings
CORS(app, resources={r"/api/*": {"origins": "*", "supports_credentials": True}})

@app.route('/api/extract-text', methods=['POST'])
def extract_text():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    try:
        # Extract text from any supported file type (pdf, docx, image, txt)
        text = extract_text_from_file(file)
        return jsonify({"extractedText": text})
    except Exception as e:
        print(f"Extraction error: {str(e)}")
        return jsonify({"error": f"Extraction failed: {str(e)}"}), 500

# Return base64 encoded file data instead of using send_file
@app.route('/api/convert', methods=['POST'])
def convert_text():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        text = data.get('text', '')
        fmt = data.get('format', '')
        filename = data.get('filename', 'output')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
            
        if fmt not in ['txt', 'pdf', 'doc']:
            return jsonify({"error": f"Unsupported format: {fmt}"}), 400

        # Ensure the filename doesn't contain invalid characters
        base_filename = os.path.basename(filename).split('.')[0]
        safe_filename = ''.join(c for c in base_filename if c.isalnum() or c in (' ', '_', '-')).strip()
        if not safe_filename:
            safe_filename = 'output'
        
        print(f"Starting conversion to {fmt} for filename {safe_filename}")
        
        # Create the file in memory instead of on disk
        file_data = convert_text_to_format_in_memory(text, fmt)
        
        # Create response with base64 encoded data
        mimetype = {
            'txt': 'text/plain',
            'pdf': 'application/pdf',
            'doc': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }.get(fmt, 'application/octet-stream')
        
        response = {
            "fileData": base64.b64encode(file_data).decode('utf-8'),
            "filename": f"{safe_filename}.{fmt}",
            "mimeType": mimetype
        }
        
        print(f"Successfully converted to {fmt}, data size: {len(file_data)} bytes")
        return jsonify(response)
        
    except Exception as e:
        print(f"Conversion error: {str(e)}")
        return jsonify({"error": f"Conversion failed: {str(e)}"}), 500
    
def convert_text_to_format_in_memory(text, fmt):
    """Convert text to specified format and return the file data as bytes"""
    try:
        if fmt == "txt":
            # For text files, simply encode the text as UTF-8
            return text.encode('utf-8')

        elif fmt == "pdf":
            # Create PDF in memory - fixed to handle BytesIO properly
            pdf = FPDF()
            pdf.add_page()
            pdf.set_auto_page_break(auto=True, margin=15)
            pdf.set_font('Arial', size=11)
            
            # Process text by lines
            lines = text.split('\n')
            for line in lines:
                try:
                    # Replace any problematic characters
                    clean_line = ''.join(c if ord(c) < 128 else ' ' for c in line)
                    pdf.multi_cell(0, 10, txt=clean_line)
                except:
                    pdf.multi_cell(0, 10, txt="[Content omitted due to encoding issues]")
            
            # Create a BytesIO object
            pdf_buffer = io.BytesIO()
            # Output to the buffer
            pdf.output(name=pdf_buffer)
            # Get the value from the buffer
            pdf_buffer.seek(0)
            return pdf_buffer.read()

        elif fmt == "doc":
            # Create docx in memory
            doc = Document()
            for line in text.split('\n'):
                doc.add_paragraph(line) 
            
            # Save to a bytes buffer
            docx_buffer = io.BytesIO()
            doc.save(docx_buffer)
            docx_buffer.seek(0)
            return docx_buffer.read()
            
    except Exception as e:
        print(f"Memory conversion error: {str(e)}")
        raise Exception(f"Failed to convert to {fmt}: {str(e)}")

@app.after_request
def add_header(response):
    """Add headers to prevent caching and ensure CORS works"""
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

if __name__ == '__main__':
    app.run(debug=True, port=5000)
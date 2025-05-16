from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from ocr.ocr_model import extract_text_from_file  # Your multi-format extraction function
from utils.converter import convert_text_to_file
import mimetypes

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/extract-text', methods=['POST'])
def extract_text():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']

    try:
        # Extract text from any supported file type (pdf, docx, image, txt)
        text = extract_text_from_file(file)
        return jsonify({"extractedText": text})
    except Exception as e:
        return jsonify({"error": f"Extraction failed: {str(e)}"}), 500

@app.route('/api/convert', methods=['POST'])
def convert_text():
    data = request.get_json()
    text = data.get('text', '')
    fmt = data.get('format', '')
    filename = data.get('filename', 'output')

    try:
        output_file = convert_text_to_file(text, fmt, filename)

        mimetype = mimetypes.guess_type(output_file)[0] or 'application/octet-stream'
        return send_file(
            output_file,
            as_attachment=True,
            download_name=f"{filename}.{fmt}",
            mimetype=mimetype
        )
    except Exception as e:
        return jsonify({"error": f"Conversion failed: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

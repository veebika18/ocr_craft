import os
from io import BytesIO
from PIL import Image
import pytesseract
import PyPDF2
import pdfplumber
import docx

def extract_text_from_file(file_storage):
    filename = file_storage.filename.lower()

    if filename.endswith('.pdf'):
        # Using pdfplumber (better accuracy)
        with pdfplumber.open(file_storage) as pdf:
            full_text = ""
            for page in pdf.pages:
                full_text += page.extract_text() + "\n"
        return full_text.strip()

    elif filename.endswith('.docx'):
        doc = docx.Document(file_storage)
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        return "\n".join(full_text).strip()

    elif filename.endswith('.txt'):
        # Read text directly
        text = file_storage.read().decode('utf-8')
        return text.strip()

    elif filename.endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
        # Image OCR
        image = Image.open(file_storage).convert('RGB')
        text = pytesseract.image_to_string(image)
        return text.strip()

    else:
        raise ValueError(f"Unsupported file type: {filename}")

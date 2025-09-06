import tempfile
import os
import time
from fpdf import FPDF
from docx import Document

def convert_text_to_file(text, fmt, filename):
    # Create a unique temporary filename
    temp_dir = tempfile.gettempdir()
    unique_id = str(time.time()).replace('.', '')  # Use timestamp for uniqueness
    temp_filename = os.path.join(temp_dir, f"{filename}_{unique_id}.{fmt}")
    
    try:
        if fmt == "txt":
            with open(temp_filename, "w", encoding="utf-8") as f:
                f.write(text)

        elif fmt == "pdf":
            # Create PDF with safer settings
            pdf = FPDF()
            pdf.add_page()
            pdf.set_auto_page_break(auto=True, margin=15)
            
            # Use standard Arial font instead of trying to load DejaVu
            # This removes the dependency on an external font file
            pdf.set_font('Arial', size=11)
            
            # Process text by lines to avoid encoding issues
            lines = text.split('\n')
            for line in lines:
                # Handle potential encoding issues more aggressively
                try:
                    # Replace any problematic characters
                    clean_line = ''.join(c if ord(c) < 128 else '?' for c in line)
                    pdf.multi_cell(0, 10, txt=clean_line)
                except Exception as e:
                    print(f"Line processing error: {str(e)}")
                    pdf.multi_cell(0, 10, txt="[Content omitted due to encoding issues]")
            
            # Output the PDF with explicit file closing
            pdf.output(temp_filename)
            # Force a small delay to ensure complete file writing
            time.sleep(0.1)

        elif fmt == "doc":
            # Create a simple docx file
            doc = Document()
            for line in text.split('\n'):
                doc.add_paragraph(line)
            doc.save(temp_filename)
            # Force a small delay to ensure complete file writing
            time.sleep(0.1)

        # Verify the file exists and has content
        if not os.path.exists(temp_filename):
            raise Exception(f"Failed to create {fmt} file")
            
        file_size = os.path.getsize(temp_filename)
        if file_size == 0:
            raise Exception(f"Created {fmt} file is empty")
            
        print(f"Successfully created {fmt} file at {temp_filename}, size: {file_size} bytes")
        return temp_filename
        
    except Exception as e:
        print(f"Error in convert_text_to_file: {str(e)}")
        # Clean up the temp file if there was an error
        if os.path.exists(temp_filename):
            try:
                os.unlink(temp_filename)
            except Exception as cleanup_error:
                print(f"Failed to clean up temp file: {str(cleanup_error)}")
        raise Exception(f"Error converting to {fmt}: {str(e)}")
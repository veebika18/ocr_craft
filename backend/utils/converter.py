import tempfile
from fpdf import FPDF

def convert_text_to_file(text, fmt, filename):
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=f".{fmt}")

    if fmt == "txt":
        with open(temp_file.name, "w", encoding="utf-8") as f:
            f.write(text)

    elif fmt == "pdf":
        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.set_font("Arial", size=12)

        for line in text.split('\n'):
            pdf.cell(0, 10, txt=line, ln=1)

        pdf.output(temp_file.name)

    # Add more formats (docx, image) here as needed

    return temp_file.name

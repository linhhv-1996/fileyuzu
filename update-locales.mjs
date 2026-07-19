import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src', 'lib', 'i18n', 'locales');
const files = fs.readdirSync(localesDir);

const newKeys = {
    "epub_to_pdf.hero.title": "Ebook to PDF Converter",
    "epub_to_pdf.hero.description": "Convert EPUB, MOBI, AZW3, FB2 and other ebook formats to PDF directly in your browser. No files uploaded to any server.",
    "epub_to_pdf.seo.title": "Convert Ebook to PDF Free Online",
    "epub_to_pdf.seo.description": "Fast and private ebook to PDF converter. Supports EPUB, MOBI, AZW3, FB2 to PDF. Works locally in your browser without uploading.",
    
    "epub_to_pdf.upload.title": "Drop an ebook file here to convert",
    "epub_to_pdf.upload.subtitle": "EPUB, MOBI, AZW3, FB2 & more · browser-based conversion",
    "epub_to_pdf.upload.btn_select": "Select ebook file",
    "epub_to_pdf.upload.hint": "Select one ebook file to convert to PDF",
    
    "epub_to_pdf.btn.convert": "Convert to PDF",
    "epub_to_pdf.btn.download": "Download PDF",
    "epub_to_pdf.btn.convert_new": "Convert Another File",
    "epub_to_pdf.proc.converting": "Converting ebook...",
    "epub_to_pdf.proc.reading": "Reading file...",
    "epub_to_pdf.proc.initializing": "Initializing converter...",
    
    "epub_to_pdf.error": "An error occurred during conversion."
};

files.forEach(file => {
    if (!file.endsWith('.json')) return;
    const filePath = path.join(localesDir, file);
    let data = {};
    try {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch(e) {}
    
    for (const [k, v] of Object.entries(newKeys)) {
        if (!data[k]) {
            data[k] = v;
        }
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    console.log(`Updated ${file}`);
});

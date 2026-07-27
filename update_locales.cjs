const fs = require('fs');
const path = require('path');

const locales = ['en', 'ja', 'ko', 'zh-tw'];
const dir = path.join(__dirname, 'src/lib/i18n/locales');

const newKeys = {
    "ebook_converter.hero.title": "Ebook Converter",
    "ebook_converter.hero.description": "Convert EPUB, MOBI, AZW3, FB2, PDF ebooks instantly, right in your browser. No uploads, no signup, 100% private.",
    "ebook_converter.seo.title": "Ebook Converter – Free, Private, No Upload",
    "ebook_converter.seo.description": "Convert EPUB, MOBI, AZW3, FB2 and PDF ebooks for free, entirely in your browser. No uploads, no account, no file size limits — just drop and download.",
    "ebook_converter.upload.title": "Drop an ebook file here to convert",
    "ebook_converter.upload.subtitle": "PDF, EPUB, MOBI, AZW3, FB2 \u0026 more · browser-based conversion",
    "ebook_converter.upload.btn_select": "Select ebook file",
    "ebook_converter.upload.hint": "Select one ebook file to convert",
    "ebook_converter.btn.sample": "Load sample",
    "ebook_converter.btn.convert": "Convert to {format}",
    "ebook_converter.btn.download": "Download {format}",
    "ebook_converter.btn.convert_new": "Convert Another File",
    "ebook_converter.proc.converting": "Converting ebook...",
    "ebook_converter.proc.reading": "Reading file...",
    "ebook_converter.proc.initializing": "Initializing converter...",
    "ebook_converter.error": "An error occurred during conversion.",
    "ebook_converter.format.select_output": "Select output format:"
};

for (const locale of locales) {
    const file = path.join(dir, `${locale}.json`);
    if (fs.existsSync(file)) {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        Object.assign(data, newKeys);
        fs.writeFileSync(file, JSON.stringify(data, null, 4));
        console.log(`Updated ${locale}.json`);
    }
}

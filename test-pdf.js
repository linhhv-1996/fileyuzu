import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function run() {
    try {
        const data = fs.readFileSync('static/sample_pdf.pdf');
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(data) });
        const pdf = await loadingTask.promise;
        console.log("PAGES:", pdf.numPages);
    } catch (e) {
        console.error("ERROR:", e);
    }
}
run();

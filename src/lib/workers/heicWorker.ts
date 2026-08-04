if (typeof window === 'undefined') {
    (self as any).window = self;
}
if (typeof document === 'undefined') {
    (self as any).document = { 
        createElement: (tag: string) => {
            if (tag.toLowerCase() === 'canvas') {
                const canvas = new OffscreenCanvas(1, 1);
                (canvas as any).toBlob = function(callback: any, type: any, quality: any) {
                    this.convertToBlob({ type, quality }).then(callback).catch((e: any) => console.error(e));
                };
                (canvas as any).setAttribute = () => {};
                (canvas as any).style = {};
                return canvas;
            }
            return { setAttribute: () => {}, style: {} };
        } 
    };
}

import { jsPDF } from "jspdf";

self.onmessage = async (e) => {
    const { id, type, payload } = e.data;
    try {
        if (type === 'CONVERT_IMAGE') {
            const { file, outputFormat, maxWidth } = payload;
            const mimeType = outputFormat === 'jpg' ? 'image/jpeg' : 'image/png';
            
            const heic2anyModule = await import("heic2any");
            const heic2any = heic2anyModule.default || heic2anyModule;

            let blobResult = await heic2any({
                blob: file,
                toType: mimeType,
                quality: 0.9
            });

            if (Array.isArray(blobResult)) {
                blobResult = blobResult[0];
            }

            if (maxWidth > 0) {
                const bmp = await createImageBitmap(blobResult as Blob);
                if (bmp.width > maxWidth) {
                    const scale = maxWidth / bmp.width;
                    const newWidth = maxWidth;
                    const newHeight = Math.round(bmp.height * scale);
                    
                    const canvas = new OffscreenCanvas(newWidth, newHeight);
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(bmp, 0, 0, newWidth, newHeight);
                        blobResult = await canvas.convertToBlob({ type: mimeType, quality: 0.9 });
                    }
                }
                bmp.close();
            }

            self.postMessage({ id, status: 'success', data: blobResult });
        } else if (type === 'MERGE_PDF') {
            const { files } = payload; // Array of { blob }
            
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            for (let i = 0; i < files.length; i++) {
                if (i > 0) pdf.addPage();
                
                const imgBlob = files[i].blob;
                const bmp = await createImageBitmap(imgBlob);
                
                const arrayBuffer = await imgBlob.arrayBuffer();
                const uint8array = new Uint8Array(arrayBuffer);
                const imgType = imgBlob.type === 'image/jpeg' ? 'JPEG' : 'PNG';
                
                const imgRatio = bmp.width / bmp.height;
                let renderWidth = pdfWidth;
                let renderHeight = pdfWidth / imgRatio;

                if (renderHeight > pdfHeight) {
                    renderHeight = pdfHeight;
                    renderWidth = pdfHeight * imgRatio;
                }

                const x = (pdfWidth - renderWidth) / 2;
                const y = (pdfHeight - renderHeight) / 2;

                pdf.addImage(uint8array, imgType, x, y, renderWidth, renderHeight);
                bmp.close();
            }

            const finalPdfBlob = new Blob([pdf.output('blob')], { type: 'application/pdf' });
            self.postMessage({ id, status: 'success', data: finalPdfBlob });
        }
    } catch (error: any) {
        self.postMessage({ id, status: 'error', error: error.message || String(error) });
    }
};

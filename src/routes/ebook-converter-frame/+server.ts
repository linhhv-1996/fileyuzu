import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Ebook Converter Background Frame</title>
</head>
<body>
    <script type="module">
        let worker = null;
        let requestId = 0;

        function initWorker() {
            try {
                // Load from our proxy endpoint which sets COOP/COEP/CORP and Cache-Control headers
                worker = new Worker('/api/ebook-convert/worker.mjs?v=20260721', { type: 'module' });
                
                worker.onmessage = (e) => {
                    // Forward all messages back to the parent
                    window.parent.postMessage(e.data, '*');
                };
                
                worker.onerror = (err) => {
                    window.parent.postMessage({ type: 'error', error: err.message || 'Worker error' }, '*');
                };
            } catch (err) {
                window.parent.postMessage({ type: 'error', error: err.message }, '*');
            }
        }

        window.addEventListener('message', async (e) => {
            const data = e.data;
            if (!data) return;

            if (data.type === 'init') {
                if (!worker) initWorker();
            } else if (data.type === 'convert' && data.fileBuffer) {
                if (!worker) initWorker();
                
                const targetExt = data.targetFormat ? data.targetFormat.toLowerCase() : 'pdf';
                const outputFileName = data.outputFile || (data.fileName.replace(/\\.[^.]+$/, '') + '.' + targetExt);

                worker.postMessage({
                    type: 'convert',
                    id: ++requestId,
                    inputData: new Uint8Array(data.fileBuffer),
                    inputName: data.fileName,
                    outputFile: outputFileName,
                    options: {},
                });
            }
        });

        // Notify parent that the frame is ready to receive messages
        window.parent.postMessage({ type: 'frame_ready' }, '*');
    </script>
</body>
</html>`;

    return new Response(html, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin'
        }
    });
};

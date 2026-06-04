let ocrEngine: any = null;

const WASM_PATHS = "https://xprofilebooster.xyz/ocr/";

export async function initOcrEngine() {
    if (ocrEngine) return ocrEngine;

    try {
        const ort = await import("onnxruntime-web");
        const { default: ImportedLib } = await import("@gutenye/ocr-browser");

        ort.env.wasm.proxy = true;
        ort.env.wasm.wasmPaths = WASM_PATHS;

        ocrEngine = await ImportedLib.create({
            models: {
                detectionPath: WASM_PATHS + "ch_PP-OCRv4_det_infer.onnx",
                recognitionPath: WASM_PATHS + "ch_PP-OCRv4_rec_infer.onnx",
                dictionaryPath: WASM_PATHS + "ppocr_keys_v1.txt",
            },
        });
        return ocrEngine;
    } catch (error) {
        console.error("Failed to initialize OCR engine:", error);
        throw error;
    }
}

export async function processImage(imageUrl: string): Promise<string> {
    const engine = await initOcrEngine();
    try {
        const result = await engine.detect(imageUrl);
        if (Array.isArray(result)) {
            return result.map((r: any) => r.text).join("\n");
        }
        return result.text || result;
    } catch (error) {
        console.error("Failed to process image:", error);
        throw error;
    }
}

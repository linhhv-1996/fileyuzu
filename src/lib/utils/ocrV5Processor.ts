import type { PaddleOcrService } from "ppu-paddle-ocr/web";

let ortLoaded = false;
let PaddleOcrServiceConstructor: typeof PaddleOcrService | null = null;

async function loadDependencies() {
    if (!ortLoaded) {
        const ort = await import("onnxruntime-web");
        
        // Configure ONNX Runtime to load WASM files from CDN instead of local assets.
        // This bypasses Cloudflare Pages 25MB limit while allowing WebGPU (jsep) support!
        const CDN_PREFIX = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.26.0/dist/";
        ort.env.wasm.wasmPaths = CDN_PREFIX;
        
        try {
            // Pre-fetch and cache the WASM binary manually to avoid redownloading
            const wasmBuffer = await fetchCachedBuffer(`${CDN_PREFIX}ort-wasm-simd-threaded.jsep.wasm`);
            ort.env.wasm.wasmBinary = new Uint8Array(wasmBuffer);
        } catch (e) {
            console.warn("[OCR] Failed to pre-fetch wasm binary, falling back to default", e);
        }
        
        ortLoaded = true;
    }
    if (!PaddleOcrServiceConstructor) {
        const mod = await import("ppu-paddle-ocr/web");
        PaddleOcrServiceConstructor = mod.PaddleOcrService;
    }
}

const MODEL_BASE_URL =
    "https://media.githubusercontent.com/media/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models/main";
const DICT_BASE_URL =
    "https://raw.githubusercontent.com/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models/main";

const DETECTION_MODEL_URL = `${MODEL_BASE_URL}/detection/PP-OCRv5_mobile_det_infer.ort`;

const LATIN_MODEL = {
    recognition: `${MODEL_BASE_URL}/recognition/multi/latin/v5/latin_PP-OCRv5_mobile_rec_infer.onnx`,
    charactersDictionary: `${DICT_BASE_URL}/recognition/multi/latin/v5/ppocrv5_latin_dict.txt`,
};

const MODELS: Record<string, { recognition: string; charactersDictionary: string }> = {
    zh: {
        recognition: `${MODEL_BASE_URL}/recognition/PP-OCRv5_mobile_rec_infer.onnx`,
        charactersDictionary: `${DICT_BASE_URL}/recognition/ppocrv5_dict.txt`,
    },
    ja: {
        recognition: `${MODEL_BASE_URL}/recognition/multi/japan/v3/japan_PP-OCRv3_mobile_rec_infer.onnx`,
        charactersDictionary: `${DICT_BASE_URL}/recognition/multi/japan/v3/japan_dict.txt`,
    },
    ko: {
        recognition: `${MODEL_BASE_URL}/recognition/multi/korean/v5/korean_PP-OCRv5_mobile_rec_infer.onnx`,
        charactersDictionary: `${DICT_BASE_URL}/recognition/multi/korean/v5/ppocrv5_korean_dict.txt`,
    },
    th: {
        recognition: `${MODEL_BASE_URL}/recognition/multi/th/v5/th_PP-OCRv5_mobile_rec_infer.onnx`,
        charactersDictionary: `${DICT_BASE_URL}/recognition/multi/th/v5/ppocrv5_th_dict.txt`,
    },
    cyrillic: {
        recognition: `${MODEL_BASE_URL}/recognition/multi/cyrillic/v5/cyrillic_PP-OCRv5_mobile_rec_infer.onnx`,
        charactersDictionary: `${DICT_BASE_URL}/recognition/multi/cyrillic/v5/ppocrv5_cyrillic_dict.txt`,
    },
};

// ─── State ────────────────────────────────────────────────────────────────────

let ocrEngine: PaddleOcrService | null = null;
let currentLang: string | null = null;
let initPromise: Promise<PaddleOcrService> | null = null;

// ─── Cache helpers ────────────────────────────────────────────────────────────

const CACHE_NAME = "ocr-models-cache-v1";

async function fetchCachedBuffer(url: string): Promise<ArrayBuffer> {
    let cache: Cache | null = null;

    try {
        cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(url);
        if (cached?.ok) {
            return cached.arrayBuffer();
        }
    } catch (e) {
        console.warn("[OCR] Cache API unavailable, fetching directly", e);
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`[OCR] Failed to fetch model: ${url} (${response.statusText})`);
    }

    const buffer = await response.clone().arrayBuffer();

    if (cache) {
        try {
            await cache.put(url, response);
        } catch (e) {
            console.warn("[OCR] Failed to store model in cache", e);
        }
    }

    return buffer;
}

// ─── Engine lifecycle ─────────────────────────────────────────────────────────

function normalise(lang: string): string {
    if (lang.startsWith("zh")) return "zh";
    if (lang === "auto") return "latin";
    return lang in MODELS ? lang : "latin";
}

async function destroyEngine(): Promise<void> {
    if (!ocrEngine) return;
    try {
        await ocrEngine.destroy();
    } catch (e) {
        console.warn("[OCR] Error while destroying engine", e);
    } finally {
        ocrEngine = null;
        currentLang = null;
    }
}

async function _doInit(targetLang: string): Promise<PaddleOcrService> {
    await destroyEngine();

    await loadDependencies();

    const config = MODELS[targetLang] ?? LATIN_MODEL;

    const [detModel, recModel, dictModel] = await Promise.all([
        fetchCachedBuffer(DETECTION_MODEL_URL),
        fetchCachedBuffer(config.recognition),
        fetchCachedBuffer(config.charactersDictionary),
    ]);

    if (!PaddleOcrServiceConstructor) {
        throw new Error("[OCR] Failed to load PaddleOcrService constructor");
    }

    const engine = new PaddleOcrServiceConstructor({
        model: {
            detection: detModel,
            recognition: recModel,
            charactersDictionary: dictModel,
        },
    });

    await engine.initialize();

    ocrEngine = engine;
    currentLang = targetLang;

    return engine;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function initOcrEngine(lang: string = "en"): Promise<PaddleOcrService> {
    const targetLang = normalise(lang);

    if (ocrEngine && currentLang === targetLang) return ocrEngine;

    if (initPromise) {
        try {
            await initPromise;
        } catch {
            // in-flight failed, start fresh below
        }
        if (ocrEngine && currentLang === targetLang) return ocrEngine;
    }

    initPromise = _doInit(targetLang).finally(() => {
        initPromise = null;
    });

    return initPromise;
}

export async function processImage(imageUrl: string, lang: string = "en"): Promise<string> {
    console.log("[OCR] processImage called", { imageUrl: imageUrl.slice(0, 50), lang });
    const engine = await initOcrEngine(lang);
    console.log("[OCR] engine ready, currentLang=", currentLang);

    // Fetch the image as ArrayBuffer for the OCR engine
    const response = await fetch(imageUrl);
    const input = await response.arrayBuffer();
    console.log("[OCR] fetched image as ArrayBuffer, byteLength=", input.byteLength);

    const result = await engine.recognize(input, { noCache: true });
    console.log("[OCR] result=", result);
    return result.text ?? "";
}

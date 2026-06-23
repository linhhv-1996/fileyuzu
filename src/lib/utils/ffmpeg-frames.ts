import type { FFmpeg } from '@ffmpeg/ffmpeg';

// ─────────────────────────────────────────────────────────────────────────────
// Formats the browser can decode natively (no FFmpeg needed)
// ─────────────────────────────────────────────────────────────────────────────
const NATIVE_EXTENSIONS = new Set([
    'mp4', 'm4v', 'mov', 'webm', 'ogv', 'ogg', '3gp'
]);

function getExtension(file: File): string {
    return (file.name.split('.').pop() || '').toLowerCase();
}

function isBrowserNative(file: File): boolean {
    return NATIVE_EXTENSIONS.has(getExtension(file));
}

// ─────────────────────────────────────────────────────────────────────────────
// FFmpeg singleton helpers
// ─────────────────────────────────────────────────────────────────────────────
let ffmpeg: FFmpeg | null = null;

function killFFmpeg() {
    if (ffmpeg) {
        try { ffmpeg.terminate(); } catch (_) {}
        ffmpeg = null;
    }
}

async function fetchWithCache(filename: string, mimeType: string): Promise<string> {
    const cache = await caches.open('ffmpeg-core-cache-v3');
    const cdns = [
        'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm',
        'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm'
    ];
    for (const cdn of cdns) {
        const url = `${cdn}/${filename}`;
        const cached = await cache.match(url);
        if (cached) {
            const blob = await cached.blob();
            return URL.createObjectURL(new Blob([blob], { type: mimeType }));
        }
    }
    for (const cdn of cdns) {
        const url = `${cdn}/${filename}`;
        try {
            const response = await fetch(url);
            if (response.ok) {
                await cache.put(url, response.clone());
                const blob = await response.blob();
                return URL.createObjectURL(new Blob([blob], { type: mimeType }));
            }
        } catch (e) {
            console.warn(`[ffmpeg-cache] Failed from ${cdn}`, e);
        }
    }
    throw new Error(`Failed to fetch ${filename} from all CDNs`);
}

async function getFFmpeg(): Promise<FFmpeg> {
    if (!ffmpeg) {
        const { FFmpeg } = await import('@ffmpeg/ffmpeg');
        ffmpeg = new FFmpeg();
        ffmpeg.on('log', ({ message }) => console.log('[ffmpeg-frames]', message));
        const coreURL = await fetchWithCache('ffmpeg-core.js', 'text/javascript');
        const wasmURL = await fetchWithCache('ffmpeg-core.wasm', 'application/wasm');
        await ffmpeg.load({ coreURL, wasmURL });
    }
    return ffmpeg;
}

function safeInputName(file: File, prefix: string): string {
    const ext = getExtension(file) || 'mp4';
    return `${prefix}.${ext}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Canvas-based helpers (zero WASM memory usage)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a hidden HTMLVideoElement backed by a blob URL.
 * Returns [videoEl, cleanup].
 */
async function createHiddenVideo(file: File): Promise<[HTMLVideoElement, () => void]> {
    const blobUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = blobUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error(`Browser cannot decode this video file (${file.name})`));
        // Timeout safety
        setTimeout(() => reject(new Error('Video metadata load timeout')), 15_000);
    });

    const cleanup = () => URL.revokeObjectURL(blobUrl);
    return [video, cleanup];
}

async function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
    if (Math.abs(video.currentTime - time) < 0.05) return;
    return new Promise<void>((resolve, reject) => {
        const onSeeked = () => { video.removeEventListener('seeked', onSeeked); resolve(); };
        const onError = () => { video.removeEventListener('error', onError); reject(new Error('Seek failed')); };
        video.addEventListener('seeked', onSeeked);
        video.addEventListener('error', onError);
        video.currentTime = time;
    });
}

function videoFrameToBlob(
    video: HTMLVideoElement,
    outputFormat: 'image/jpeg' | 'image/png',
    quality = 0.95
): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error('Canvas toBlob returned null')),
            outputFormat,
            quality
        );
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// getVideoInfo
// ─────────────────────────────────────────────────────────────────────────────
export async function getVideoInfo(file: File): Promise<{ duration: number }> {
    // Try native first
    if (isBrowserNative(file)) {
        try {
            const blobUrl = URL.createObjectURL(file);
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.src = blobUrl;
            const duration = await new Promise<number>((resolve, reject) => {
                video.onloadedmetadata = () => resolve(video.duration);
                video.onerror = () => reject(new Error('Cannot read metadata'));
                setTimeout(() => reject(new Error('Timeout')), 15_000);
            });
            URL.revokeObjectURL(blobUrl);
            if (duration && isFinite(duration)) return { duration };
        } catch (_) { /* fall through to FFmpeg */ }
    }

    // FFmpeg fallback for non-native formats
    killFFmpeg();
    const ff = await getFFmpeg();
    const safeName = safeInputName(file, 'probe_in');
    const { fetchFile } = await import('@ffmpeg/util');
    await ff.writeFile(safeName, await fetchFile(file));

    let duration = 0;
    const logHandler = ({ message }: { message: string }) => {
        const match = message.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
        if (match) {
            duration = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3]);
        }
    };
    ff.on('log', logHandler);
    try { await ff.exec(['-threads', '1', '-i', safeName]); } catch (_) {}
    ff.off('log', logHandler);
    try { await ff.deleteFile(safeName); } catch (_) {}
    killFFmpeg();

    return { duration };
}

// ─────────────────────────────────────────────────────────────────────────────
// extractSingleFrame
// ─────────────────────────────────────────────────────────────────────────────
export async function extractSingleFrame(
    file: File,
    timestamp: number,
    outputFormat: 'image/jpeg' | 'image/png'
): Promise<Blob> {
    // Canvas path for native formats
    if (isBrowserNative(file)) {
        try {
            const [video, cleanup] = await createHiddenVideo(file);
            await seekVideo(video, timestamp);
            const blob = await videoFrameToBlob(video, outputFormat);
            cleanup();
            return blob;
        } catch (e) {
            console.warn('[ffmpeg-frames] Canvas single frame failed, falling back to FFmpeg:', e);
        }
    }

    // FFmpeg fallback
    killFFmpeg();
    const ff = await getFFmpeg();
    const safeName = safeInputName(file, 'single_in');
    const { fetchFile } = await import('@ffmpeg/util');
    await ff.writeFile(safeName, await fetchFile(file));

    const ext = outputFormat === 'image/jpeg' ? 'jpg' : 'png';
    const outName = `out_single.${ext}`;

    let exitCode: number;
    try {
        exitCode = await ff.exec([
            '-y', '-threads', '1',
            '-ss', timestamp.toString(),
            '-i', safeName,
            '-map', '0:v:0',
            '-vframes', '1',
            ...(outputFormat === 'image/jpeg' ? ['-q:v', '2'] : []),
            '-update', '1',
            outName
        ]);
    } catch (e) {
        killFFmpeg();
        throw new Error(`FFmpeg crashed during single frame extraction: ${e}`);
    }

    if (exitCode !== 0) {
        try { await ff.deleteFile(safeName); } catch (_) {}
        killFFmpeg();
        throw new Error(`Frame extraction failed (exit code ${exitCode})`);
    }

    try {
        const data = await ff.readFile(outName);
        const blob = new Blob([data as unknown as ArrayBuffer], { type: outputFormat });
        try { await ff.deleteFile(outName); } catch (_) {}
        try { await ff.deleteFile(safeName); } catch (_) {}
        killFFmpeg();
        return blob;
    } catch (err) {
        try { await ff.deleteFile(safeName); } catch (_) {}
        killFFmpeg();
        throw new Error(`Failed to read output file: ${err}`);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// extractFramesBulk
// ─────────────────────────────────────────────────────────────────────────────
export async function extractFramesBulk(
    file: File,
    mode: 'interval' | 'evenly',
    value: number,
    duration: number,
    outputFormat: 'image/jpeg' | 'image/png',
    onProgress: (progress: number) => void
): Promise<{ blob: Blob; name: string }[]> {

    const basename = file.name.split('.').slice(0, -1).join('.') || 'video';
    const ext = outputFormat === 'image/jpeg' ? 'jpg' : 'png';

    // Build timestamp list
    const timestamps = buildTimestamps(mode, value, duration);
    if (timestamps.length === 0) {
        throw new Error('No frames to extract. Check your interval / frame count settings.');
    }

    // ── Canvas path (native formats: MP4, MOV, WebM, …) ──────────────────────
    if (isBrowserNative(file)) {
        try {
            return await extractViaCanvas(file, timestamps, basename, ext, outputFormat, onProgress);
        } catch (e) {
            console.warn('[ffmpeg-frames] Canvas bulk failed, falling back to FFmpeg:', e);
            // fall through to FFmpeg
        }
    }

    // ── FFmpeg path (MKV, AVI, FLV, etc.) ────────────────────────────────────
    return await extractViaFFmpeg(file, mode, value, duration, basename, ext, outputFormat, onProgress);
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildTimestamps(mode: 'interval' | 'evenly', value: number, duration: number): number[] {
    const stamps: number[] = [];
    if (mode === 'interval') {
        const interval = Math.max(value, 0.5);
        for (let t = 0; t < duration - 0.1; t += interval) {
            stamps.push(parseFloat(t.toFixed(3)));
        }
    } else {
        const count = Math.max(value, 1);
        const step = duration / count;
        for (let i = 0; i < count; i++) {
            stamps.push(parseFloat((i * step).toFixed(3)));
        }
    }
    return stamps;
}

async function extractViaCanvas(
    file: File,
    timestamps: number[],
    basename: string,
    ext: string,
    outputFormat: 'image/jpeg' | 'image/png',
    onProgress: (p: number) => void
): Promise<{ blob: Blob; name: string }[]> {
    onProgress(5);
    const [video, cleanup] = await createHiddenVideo(file);
    onProgress(10);

    const frames: { blob: Blob; name: string }[] = [];

    for (let i = 0; i < timestamps.length; i++) {
        await seekVideo(video, timestamps[i]);
        const blob = await videoFrameToBlob(video, outputFormat);
        const numStr = (i + 1).toString().padStart(4, '0');
        frames.push({ blob, name: `${basename}_frame_${numStr}.${ext}` });
        onProgress(10 + Math.round(((i + 1) / timestamps.length) * 88));
    }

    cleanup();
    onProgress(100);
    return frames;
}

async function extractViaFFmpeg(
    file: File,
    mode: 'interval' | 'evenly',
    value: number,
    duration: number,
    basename: string,
    ext: string,
    outputFormat: 'image/jpeg' | 'image/png',
    onProgress: (p: number) => void
): Promise<{ blob: Blob; name: string }[]> {

    // Warn if file is very large
    const MB = file.size / 1024 / 1024;
    if (MB > 400) {
        throw new Error(
            `File is ${MB.toFixed(0)} MB — too large for browser-based FFmpeg. ` +
            `Convert to MP4/MOV first or use a smaller clip.`
        );
    }

    killFFmpeg();
    const ff = await getFFmpeg();
    const safeName = safeInputName(file, 'bulk_in');

    onProgress(5);
    const { fetchFile } = await import('@ffmpeg/util');
    await ff.writeFile(safeName, await fetchFile(file));
    onProgress(10);

    let fpsStr: string;
    if (mode === 'interval') {
        fpsStr = `1/${Math.max(value, 0.5)}`;
    } else {
        fpsStr = `${Math.max(value, 1)}/${duration > 0 ? duration : 1}`;
    }

    const qArgs = outputFormat === 'image/jpeg' ? ['-q:v', '2'] : [];
    const args = [
        '-y', '-threads', '1',
        '-i', safeName,
        '-vf', `fps=${fpsStr}`,
        ...qArgs,
        `out_%04d.${ext}`
    ];

    const progressHandler = ({ progress }: { progress: number }) => {
        if (progress > 0 && progress <= 1) {
            onProgress(10 + Math.round(progress * 75));
        }
    };
    ff.on('progress', progressHandler);

    let exitCode = 1;
    try {
        exitCode = await ff.exec(args);
    } catch (e) {
        ff.off('progress', progressHandler);
        killFFmpeg();
        const msg = String(e);
        if (msg.includes('memory access out of bounds') || msg.includes('RuntimeError')) {
            throw new Error(
                `FFmpeg WASM out of memory. This format (${getExtension(file).toUpperCase()}) ` +
                `requires FFmpeg but the file is too large for browser processing. ` +
                `Convert to MP4 first.`
            );
        }
        throw e;
    }

    ff.off('progress', progressHandler);

    if (exitCode !== 0) {
        try { await ff.deleteFile(safeName); } catch (_) {}
        killFFmpeg();
        throw new Error(`FFmpeg failed with exit code ${exitCode}`);
    }

    onProgress(85);

    const frames: { blob: Blob; name: string }[] = [];
    let index = 1;
    while (true) {
        const numStr = index.toString().padStart(4, '0');
        const outName = `out_${numStr}.${ext}`;
        try {
            const data = await ff.readFile(outName);
            frames.push({
                blob: new Blob([data as unknown as ArrayBuffer], { type: outputFormat }),
                name: `${basename}_frame_${numStr}.${ext}`
            });
            await ff.deleteFile(outName);
            index++;
            if (mode === 'evenly' && frames.length >= value) break;
        } catch (_) {
            break;
        }
    }

    try { await ff.deleteFile(safeName); } catch (_) {}
    killFFmpeg();

    if (frames.length === 0) {
        throw new Error('FFmpeg produced 0 frames. The video may be too short for the chosen interval.');
    }

    onProgress(100);
    return frames;
}

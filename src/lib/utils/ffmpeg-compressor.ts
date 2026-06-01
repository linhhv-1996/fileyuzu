import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export async function compressWithFFmpeg(
  file: File,
  targetSizeMB: number,
  onProgress: (progress: number) => void
): Promise<File> {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    
    ffmpeg.on('progress', ({ progress, time }) => {
      // progress is usually between 0 and 1
      onProgress(Math.round(progress * 100));
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
  }

  const { name } = file;
  const safeName = name.replace(/[^a-zA-Z0-9.]/g, '_');
  const outName = `compressed_${safeName}.mp4`;

  await ffmpeg.writeFile(safeName, await fetchFile(file));

  // Determine bitrate based on target size
  // Target Size (MB) * 8192 = Target Size (kbps) * duration (s)
  // Without duration, we can use a moderate CRF
  // If we really need exact size, we'd do a 2-pass or get duration via ffprobe.
  // For simplicity and client-side performance, we use a constant rate factor (CRF).
  // A higher CRF means lower quality and smaller size.
  // We'll map the target size inversely to CRF (just a heuristic, as exact size needs duration).
  
  let crf = '28';
  if (targetSizeMB <= 10) crf = '34';
  else if (targetSizeMB <= 25) crf = '30';
  else if (targetSizeMB <= 50) crf = '28';
  else crf = '24';

  await ffmpeg.exec([
    '-i', safeName,
    '-vcodec', 'libx264',
    '-crf', crf,
    '-preset', 'ultrafast', // ultrafast for browser performance
    outName
  ]);

  const data = await ffmpeg.readFile(outName);
  
  // Clean up
  await ffmpeg.deleteFile(safeName);
  await ffmpeg.deleteFile(outName);

  // Use 'as any' to bypass TypeScript pedantic mismatch with SharedArrayBuffer in File/BlobPart
  return new File([data as any], outName, { type: 'video/mp4' });
}

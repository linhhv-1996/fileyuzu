import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export async function convertWithFFmpeg(
  file: File,
  targetFormat: string,
  onProgress: (progress: number) => void
): Promise<File> {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    
    ffmpeg.on('progress', ({ progress, time }) => {
      onProgress(Math.round(progress * 100));
    });

    ffmpeg.on('log', ({ message }) => {
      console.log('FFmpeg:', message);
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
  }

  const { name } = file;
  const safeName = name.replace(/[^a-zA-Z0-9.]/g, '_');
  const ext = targetFormat.toLowerCase();
  const outName = `converted_${safeName}.${ext}`;

  await ffmpeg.writeFile(safeName, await fetchFile(file));

  // Determine ffmpeg arguments based on target format
  const args = ['-i', safeName];

  if (ext === 'mp3') {
    args.push('-vn');
  } else if (ext === 'webm') {
    args.push('-c:v', 'libvpx-vp9', '-crf', '30', '-b:v', '0', '-c:a', 'libopus');
  } else if (ext === 'mp4' || ext === 'mkv' || ext === 'mov') {
    args.push('-c:v', 'libx264', '-crf', '23', '-preset', 'ultrafast', '-c:a', 'aac');
  } else {
    // Generic fallback for any other format
    args.push('-c:v', 'copy', '-c:a', 'copy');
  }
  
  args.push(outName);

  const exitCode = await ffmpeg.exec(args);
  if (exitCode !== 0) {
    throw new Error(`FFmpeg failed with exit code ${exitCode}`);
  }

  const data = await ffmpeg.readFile(outName);
  
  // Clean up
  await ffmpeg.deleteFile(safeName);
  await ffmpeg.deleteFile(outName);

  let mimeType = 'video/mp4';
  if (ext === 'webm') mimeType = 'video/webm';
  if (ext === 'mkv') mimeType = 'video/x-matroska';
  if (ext === 'mov') mimeType = 'video/quicktime';
  if (ext === 'mp3') mimeType = 'audio/mpeg';

  return new File([data as any], outName, { type: mimeType });
}

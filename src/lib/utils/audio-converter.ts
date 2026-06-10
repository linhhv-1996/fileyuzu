import { convertWithFFmpeg } from './ffmpeg-converter';

export async function convertAudioFile(
  file: File,
  targetFormat: string,
  onProgress: (progress: number) => void
): Promise<File> {
  try {
    return await convertWithFFmpeg(file, targetFormat, onProgress);
  } catch (err) {
    console.error('Audio conversion failed:', err);
    throw err;
  }
}

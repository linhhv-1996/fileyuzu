import { compressWithMediaBunny } from './mediabunny-compressor';
import { compressWithFFmpeg } from './ffmpeg-compressor';

export async function compressVideoFile(
  file: File,
  targetSizeMB: number,
  onProgress: (progress: number) => void
): Promise<File> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  // mediabunny is optimized for standard web formats (mp4, webm, mov).
  // Fallback to ffmpeg for unsupported formats like avi.
  const unsupportedByMediabunny = ['avi', 'wmv', 'flv', 'mpeg', 'mpg', '3gp'];
  
  if (extension && unsupportedByMediabunny.includes(extension)) {
    console.warn(`Format .${extension} not supported by mediabunny. Falling back to ffmpeg...`);
    try {
      return await compressWithFFmpeg(file, targetSizeMB, onProgress);
    } catch (err) {
      console.error('FFmpeg compression failed:', err);
      throw err;
    }
  }

  try {
    return await compressWithMediaBunny(file, targetSizeMB, onProgress);
  } catch (err) {
    console.error('MediaBunny compression failed, falling back to ffmpeg:', err);
    try {
      return await compressWithFFmpeg(file, targetSizeMB, onProgress);
    } catch (ffmpegErr) {
      console.error('FFmpeg compression also failed:', ffmpegErr);
      throw ffmpegErr;
    }
  }
}

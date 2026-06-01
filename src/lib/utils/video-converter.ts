import { convertWithMediaBunny } from './mediabunny-converter';
import { convertWithFFmpeg } from './ffmpeg-converter';

export async function convertVideoFile(
  file: File,
  targetFormat: string,
  onProgress: (progress: number) => void
): Promise<File> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  // MediaBunny generally has a broader support for inputs (mp4, webm, mov, etc.)
  const unsupportedByMediabunny = ['avi', 'wmv', 'flv', 'mpeg', 'mpg', '3gp'];
  
  if ((extension && unsupportedByMediabunny.includes(extension)) || targetFormat === 'mp3') {
    console.warn(`Input format .${extension} or target format ${targetFormat} not supported by mediabunny. Falling back to ffmpeg...`);
    try {
      return await convertWithFFmpeg(file, targetFormat, onProgress);
    } catch (err) {
      console.error('FFmpeg conversion failed:', err);
      throw err;
    }
  }

  try {
    return await convertWithMediaBunny(file, targetFormat, onProgress);
  } catch (err) {
    console.warn('MediaBunny conversion failed or unsupported output, falling back to ffmpeg:', err);
    try {
      return await convertWithFFmpeg(file, targetFormat, onProgress);
    } catch (ffmpegErr) {
      console.error('FFmpeg conversion also failed:', ffmpegErr);
      throw ffmpegErr;
    }
  }
}

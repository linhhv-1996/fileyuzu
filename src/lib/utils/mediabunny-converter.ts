import {
	Input,
	ALL_FORMATS,
	BlobSource,
	Output,
	BufferTarget,
	Mp4OutputFormat,
	WebMOutputFormat,
	MovOutputFormat,
	MkvOutputFormat,
	Mp3OutputFormat,
	Conversion,
	OutputFormat,
	canEncodeAudio
} from 'mediabunny';
import { registerMp3Encoder } from '@mediabunny/mp3-encoder';

function getOutputFormat(format: string): OutputFormat {
	switch (format.toLowerCase()) {
		case 'webm': return new WebMOutputFormat();
		case 'mov': return new MovOutputFormat();
		case 'mkv': return new MkvOutputFormat();
		case 'mp3': return new Mp3OutputFormat();
		case 'mp4': 
		default: return new Mp4OutputFormat();
	}
}

export async function convertWithMediaBunny(
	file: File,
	targetFormat: string,
	onProgress: (progress: number) => void
): Promise<File> {
	if (targetFormat.toLowerCase() === 'mp3' && !(await canEncodeAudio('mp3'))) {
		registerMp3Encoder();
	}

	const source = new BlobSource(file);
	const input = new Input({ source, formats: ALL_FORMATS });
	
	const outFormat = getOutputFormat(targetFormat);
	const output = new Output({ target: new BufferTarget(), format: outFormat });

	const isAudioOnly = targetFormat.toLowerCase() === 'mp3';

	const conversionOptions: any = {
		input,
		output,
		audio: {
			forceTranscode: true, // often necessary for format shifts
		}
	};

	if (!isAudioOnly) {
		conversionOptions.video = {
			forceTranscode: true, // force transcode for format changes to ensure compatibility
			hardwareAcceleration: 'prefer-software',
		};
	}

	const conversion = await Conversion.init(conversionOptions);

	if (!conversion.isValid) {
		throw new Error('error.videoUnsupportedForConversion');
	}

	let progress = 0;
	conversion.onProgress = (p) => { progress = p; };

	const intervalId = window.setInterval(() => {
		onProgress(Math.round(progress * 100));
	}, 100);

	try {
		await conversion.execute();
	} finally {
		clearInterval(intervalId);
	}

	onProgress(100);

	const buffer = output.target.buffer!;
	const resultBlob = new Blob([buffer], { type: output.format.mimeType });
	
	const extMatch = file.name.lastIndexOf('.');
	const baseName = extMatch !== -1 ? file.name.substring(0, extMatch) : file.name;
	const ext = targetFormat.toLowerCase();
	
	return new File([resultBlob], `${baseName}-converted.${ext}`, { type: resultBlob.type });
}

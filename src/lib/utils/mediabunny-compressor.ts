import {
	Input,
	ALL_FORMATS,
	BlobSource,
	Output,
	BufferTarget,
	Mp4OutputFormat,
	Conversion
} from 'mediabunny';

function alignTo(value: number, align: number): number {
	return Math.floor(value / align) * align;
}

const RESOLUTION_TIERS = [
	{ shortSide: 1080, minVideoBitrateKbps: 1500, audioBitrateKbps: 192 },
	{ shortSide: 720,  minVideoBitrateKbps: 700,  audioBitrateKbps: 160 },
	{ shortSide: 480,  minVideoBitrateKbps: 400,  audioBitrateKbps: 160 },
	{ shortSide: 360,  minVideoBitrateKbps: 280,  audioBitrateKbps: 160 },
	{ shortSide: 240,  minVideoBitrateKbps: 250,  audioBitrateKbps: 160 },
] as const;

function getShortAndLong(w: number, h: number) {
	return { shortSide: Math.min(w, h), longSide: Math.max(w, h) };
}

function resolveTargetWidth(
	originalWidth: number,
	originalHeight: number,
	targetShortSide: number,
): number | undefined {
	const isPortrait = originalHeight > originalWidth;
	const { shortSide, longSide } = getShortAndLong(originalWidth, originalHeight);

	if (targetShortSide >= shortSide) return undefined;

	const finalShortSide = alignTo(targetShortSide, 2);
	const finalLongSide  = alignTo(Math.round(finalShortSide * (longSide / shortSide)), 2);

	return isPortrait ? finalShortSide : finalLongSide;
}

interface EncodeTarget {
	videoKbps: number;
	audioKbps: number;
	targetWidth: number | undefined;
}

function calcTargetMbTarget(
	targetMb: number,
	durationSec: number,
	originalWidth: number,
	originalHeight: number,
	originalVideoBitrateKbps: number,
): EncodeTarget {
	const totalKbps = Math.floor((targetMb * 1024 * 1024 * 8) / durationSec / 1000);
	const { shortSide: originalShortSide } = getShortAndLong(originalWidth, originalHeight);

	for (const tier of RESOLUTION_TIERS) {
		if (tier.shortSide > originalShortSide) continue;

		const audioKbps = tier.audioBitrateKbps;
		const videoBudget = totalKbps - audioKbps;

		if (videoBudget >= tier.minVideoBitrateKbps) {
			const videoKbps = Math.round(Math.min(videoBudget, originalVideoBitrateKbps * 0.95));
			return {
				videoKbps,
				audioKbps,
				targetWidth: resolveTargetWidth(originalWidth, originalHeight, tier.shortSide),
			};
		}
	}

	const lastTier = RESOLUTION_TIERS[RESOLUTION_TIERS.length - 1];
	return {
		videoKbps: lastTier.minVideoBitrateKbps,
		audioKbps: lastTier.audioBitrateKbps,
		targetWidth: resolveTargetWidth(originalWidth, originalHeight, lastTier.shortSide),
	};
}

function getVideoMetadata(file: File): Promise<{ duration: number; width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const video = document.createElement('video');
		video.preload = 'metadata';
		video.onloadedmetadata = () => {
			URL.revokeObjectURL(video.src);
			resolve({ duration: video.duration, width: video.videoWidth, height: video.videoHeight });
		};
		video.onerror = () => reject(new Error('error.videoMetadataReadFailed'));
		video.src = URL.createObjectURL(file);
	});
}

export async function compressWithMediaBunny(
	file: File,
	targetSizeMB: number,
	onProgress: (progress: number) => void
): Promise<File> {
	const metadata = await getVideoMetadata(file);
	const originalSize = file.size;

	let duration = metadata.duration;
	if (!duration || !isFinite(duration) || duration === 0) {
		duration = Math.max(1, originalSize / 174_000);
	}

	const originalTotalKbps = (originalSize * 8) / duration / 1000;
	const originalVideoBitrateKbps = Math.max(originalTotalKbps - 192, 100);

	const targetBytes = targetSizeMB * 1024 * 1024;
	if (targetBytes >= originalSize) {
		return file;
	}

	const encodeTarget = calcTargetMbTarget(
		targetSizeMB,
		duration,
		metadata.width,
		metadata.height,
		originalVideoBitrateKbps,
	);

	const { videoKbps, audioKbps, targetWidth } = encodeTarget;
	
	console.log('[MediaBunny Compressor] encode target:', {
		targetMb: targetSizeMB,
		originalSize: `${(originalSize / 1024 / 1024).toFixed(1)}MB`,
		originalVideoBitrateKbps: Math.round(originalVideoBitrateKbps),
		originalDimensions: `${metadata.width}×${metadata.height}`,
		targetWidth: targetWidth ?? 'unchanged',
		videoKbps, audioKbps,
	});

	const source = new BlobSource(file);
	const input  = new Input({ source, formats: ALL_FORMATS });
	const output = new Output({ target: new BufferTarget(), format: new Mp4OutputFormat() });

	const conversion = await Conversion.init({
		input,
		output,
		tracks: 'primary',
		video: {
			width:                targetWidth,
			bitrate:              videoKbps * 1000,
			forceTranscode:       true,
			hardwareAcceleration: 'prefer-software',
		},
		audio: {
			bitrate: audioKbps * 1000,
		},
	});

	if (!conversion.isValid) {
		throw new Error('error.videoUnsupportedForCompression');
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
	
	// Cắt phần đuôi .xxx cũ, thêm suffix -compressed.mp4
	const extMatch = file.name.lastIndexOf('.');
	const baseName = extMatch !== -1 ? file.name.substring(0, extMatch) : file.name;
	
	return new File([resultBlob], `${baseName}-compressed.mp4`, { type: resultBlob.type });
}

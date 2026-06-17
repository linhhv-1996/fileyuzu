import { pipeline, env, type PipelineType, type ProgressCallback, WhisperTextStreamer } from "@huggingface/transformers";

// Disable local models
env.allowLocalModels = false;
// Enable browser caching for models explicitly to fix F5 reloading
env.useBrowserCache = true;
// (Optional) Configure thread limits if needed
// env.backends.onnx.wasm.numThreads = 1;

// Define model factories
// Ensures only one model is created of each type
class PipelineFactory {
    static task: string = "";
    static model: string | null = null;
    static quantized: boolean | null = null;
    static instance: Promise<any> | null = null;

    static async getInstance(progress_callback?: ProgressCallback) {
        if (this.instance === null) {
            this.instance = pipeline(this.task as PipelineType, this.model as string, {
                progress_callback,
                dtype: "fp32", // Using fp32 bypasses the QDQ missing scale bug in ORT 1.26.0
                device: "webgpu", // Safely use WebGPU for insane speed since fp32 won't crash
                // For medium models, we need to load the `no_attentions` revision to avoid running out of memory
                revision: this.model?.includes("/whisper-medium") ? "no_attentions" : "main"
            });
        }

        return this.instance;
    }
}

class AutomaticSpeechRecognitionPipelineFactory extends PipelineFactory {
    static task = "automatic-speech-recognition";
    static model: string | null = null;
    static quantized: boolean | null = null;
}

const transcribe = async (
    audio: Float32Array,
    model: string,
    multilingual: boolean,
    quantized: boolean,
    subtask: string,
    language: string,
) => {

    const isDistilWhisper = model.startsWith("distil-whisper/");

    let modelName = model;
    if (!isDistilWhisper && !multilingual) {
        modelName += ".en";
    }

    const p = AutomaticSpeechRecognitionPipelineFactory;
    if (p.model !== modelName || p.quantized !== quantized) {
        // Invalidate model if different
        p.model = modelName;
        p.quantized = quantized;

        if (p.instance !== null) {
            const instance = await p.getInstance();
            if (instance && typeof instance.dispose === 'function') {
                instance.dispose();
            }
            p.instance = null;
        }
    }

    // Load transcriber model
    let transcriber = await p.getInstance((data: any) => {
        self.postMessage(data);
    });

    // Explicitly notify the main thread that the model is ready and processing has started
    // This handles the case where the model is already cached and the pipeline doesn't emit progress events
    self.postMessage({ status: "ready" });

    const time_precision =
        transcriber.processor.feature_extractor.config.chunk_length /
        transcriber.model.config.max_source_positions;

    // Accumulate timestamp-delimited chunks for streaming updates
    let streamedChunks: { text: string; timestamp: [number, number | null] }[] = [];
    let currentChunkText = "";
    let currentChunkStart: number | null = null;

    const streamer = new WhisperTextStreamer(transcriber.tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
        time_precision: time_precision,

        callback_function: (text: string) => {
            // Accumulate decoded text for the current timestamp segment
            currentChunkText += text;

            // Build a snapshot of all chunks so far (finalized + in-progress)
            const chunks = [...streamedChunks];
            if (currentChunkStart !== null && currentChunkText.length > 0) {
                chunks.push({
                    text: currentChunkText,
                    timestamp: [currentChunkStart, null],
                });
            }

            self.postMessage({
                status: "update",
                task: "automatic-speech-recognition",
                data: { chunks },
            });
        },

        on_chunk_start: (time: number) => {
            currentChunkText = "";
            currentChunkStart = time;
        },

        on_chunk_end: (time: number) => {
            if (currentChunkStart !== null && currentChunkText.length > 0) {
                streamedChunks.push({
                    text: currentChunkText,
                    timestamp: [currentChunkStart, time],
                });
            }
            currentChunkText = "";
            currentChunkStart = null;
        },

        on_finalize: () => {
            // Flush any remaining text when a sliding window finishes
            if (currentChunkStart !== null && currentChunkText.length > 0) {
                streamedChunks.push({
                    text: currentChunkText,
                    timestamp: [currentChunkStart, null],
                });
                currentChunkText = "";
                currentChunkStart = null;
            }
        },
    });

    const transcriberOptions: any = {
        // Greedy
        top_k: 0,
        do_sample: false,

        // Sliding window
        chunk_length_s: isDistilWhisper ? 20 : 30,
        stride_length_s: isDistilWhisper ? 3 : 5,

        // Return timestamps
        return_timestamps: true,
        force_full_sequences: false,

        // V4 WhisperTextStreamer
        streamer: streamer,
    };

    if (multilingual) {
        transcriberOptions.language = language;
        transcriberOptions.task = subtask;
    }

    // Actually run transcription
    let output = await transcriber(audio, transcriberOptions).catch((error: any) => {
        self.postMessage({
            status: "error",
            task: "automatic-speech-recognition",
            data: error,
        });
        return null;
    });

    return output;
};

self.addEventListener("message", async (event: MessageEvent) => {
    const message = event.data;

    let transcript = await transcribe(
        message.audio,
        message.model,
        message.multilingual,
        message.quantized,
        message.subtask,
        message.language,
    );
    if (transcript === null) return;

    // Send the result back to the main thread
    self.postMessage({
        status: "complete",
        task: "automatic-speech-recognition",
        data: transcript,
    });
});

<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { tick } from "svelte";

    interface Props {
        texts?: any;
        inputFormats?: string;
        sampleAudioPath?: string;
    }

    let { 
        texts = {}, 
        inputFormats = "audio/*,video/*",
        sampleAudioPath = "/ENG_US_M_DaveL.mp3"
    }: Props = $props();

    let status = $state<"idle" | "file" | "loading_model" | "proc" | "done">(
        "idle",
    );
    let fileInput = $state<HTMLInputElement | undefined>();
    let selectedFile = $state<File | null>(null);
    let mediaUrl = $state<string | null>(null);
    let isDragging = $state(false);
    let isLoadingSample = $state(false);

    let progress = $state(0);
    let extractError = $state<string | null>(null);
    let modelLoadingProgress = $state(0);
    let worker = $state<Worker | null>(null);
    let transcribedText = $state<
        { text: string; timestamp: [number, number | null] }[]
    >([]);

    let model = $state("onnx-community/whisper-tiny");
    let multilingual = $state(true);
    let quantized = $state(false); // FORCED FALSE to bypass ORT 1.26 QDQ bug
    let subtask = $state("transcribe");
    let language = $state("english");

    let downloadStats: Record<string, {loaded: number, total: number}> = {};

    onMount(() => {
        // Initialize worker dynamically
        import("$lib/workers/audio2text.worker.ts?worker").then(
            (WorkerModule) => {
                worker = new WorkerModule.default();
                worker.onmessage = (event) => {
                    const message = event.data;
                    switch (message.status) {
                        case "progress":
                            // Track total progress across all model files
                            if (message.file) {
                                downloadStats[message.file] = { loaded: message.loaded, total: message.total };
                                let totalLoaded = 0;
                                let totalSize = 0;
                                for (const file in downloadStats) {
                                    totalLoaded += downloadStats[file].loaded;
                                    totalSize += downloadStats[file].total;
                                }
                                if (totalSize > 0) {
                                    modelLoadingProgress = Math.round((totalLoaded / totalSize) * 100);
                                }
                            }
                            break;
                        case "init":
                            status = "loading_model";
                            if (message.file && !downloadStats[message.file]) {
                                downloadStats[message.file] = { loaded: 0, total: 0 };
                            }
                            break;
                        case "ready":
                            status = "proc";
                            modelLoadingProgress = 100;
                            break;
                        case "update":
                            // Partial transcript update (V3 _decode_asr returns [text, { chunks }])
                            if (
                                Array.isArray(message.data) &&
                                message.data.length === 2 &&
                                message.data[1]?.chunks
                            ) {
                                transcribedText = message.data[1].chunks;
                            } else if (message.data && message.data.chunks) {
                                transcribedText = message.data.chunks;
                            }
                            break;
                        case "complete":
                            // Final transcript (V3 pipeline returns {text, chunks} or [{text, chunks}])
                            if (message.data && message.data.chunks) {
                                transcribedText = message.data.chunks;
                            } else if (
                                Array.isArray(message.data) &&
                                message.data[0]?.chunks
                            ) {
                                transcribedText = message.data[0].chunks;
                            } else if (
                                Array.isArray(message.data) &&
                                message.data.length === 2 &&
                                Array.isArray(message.data[1])
                            ) {
                                transcribedText = message.data[1];
                            }
                            status = "done";
                            break;
                        case "error":
                            extractError =
                                message.data?.message ||
                                "An error occurred during transcription.";
                            status = "file";
                            break;
                    }
                };
            },
        );
    });

    onDestroy(() => {
        if (worker) {
            worker.terminate();
        }
        if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    });

    async function setFile(file: File) {
        selectedFile = file;
        if (mediaUrl) URL.revokeObjectURL(mediaUrl);
        mediaUrl = URL.createObjectURL(file);

        status = "file";
        transcribedText = [];
        progress = 0;
        extractError = null;
    }

    function handleFileChange(e: Event) {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            setFile(target.files[0]);
        }
    }

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        isDragging = true;
    }

    function handleDragLeave(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        isDragging = false;
    }

    function handleDrop(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        isDragging = false;
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (
                file.type.startsWith("audio/") ||
                file.type.startsWith("video/")
            ) {
                setFile(file);
            } else {
                alert("Please drop an audio or video file.");
            }
        }
    }

    function removeFile() {
        selectedFile = null;
        if (mediaUrl) {
            URL.revokeObjectURL(mediaUrl);
            mediaUrl = null;
        }
        transcribedText = [];
        if (fileInput) fileInput.value = "";
        status = "idle";
    }

    async function decodeAudio(file: File): Promise<Float32Array> {
        return new Promise(async (resolve, reject) => {
            try {
                const ctx = new AudioContext({ sampleRate: 16000 });
                const arrayBuffer = await file.arrayBuffer();
                const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
                const channelData = audioBuffer.getChannelData(0); // Whisper expects mono
                resolve(channelData);
            } catch (err) {
                reject(err);
            }
        });
    }

    async function startTranscription() {
        if (!selectedFile || !worker) return;

        status = "loading_model"; // Will be instantly overridden to 'proc' if model is cached
        extractError = null;
        transcribedText = [];
        downloadStats = {}; // Reset download stats for new run
        modelLoadingProgress = 0;

        try {
            // Give UI a moment to update
            await tick();

            // 1. Decode audio to Float32Array at 16kHz
            const audioData = await decodeAudio(selectedFile);

            // 2. Send to worker
            worker.postMessage({
                audio: audioData,
                model,
                multilingual,
                quantized,
                subtask,
                language: multilingual ? language : "english",
            });
        } catch (e: any) {
            console.error("Extraction failed", e);
            extractError =
                e?.message ||
                "Failed to process audio. Please try another file.";
            status = "file";
        }
    }

    function formatTimestamp(timestamp: [number, number | null]): string {
        const formatTime = (time: number) => {
            const date = new Date(0);
            date.setSeconds(time);
            return date.toISOString().substr(11, 8);
        };
        const start = formatTime(timestamp[0]);
        const end = timestamp[1] !== null ? formatTime(timestamp[1]) : "...";
        return `[${start} -> ${end}]`;
    }

    function downloadText() {
        const textContent = transcribedText
            .map((chunk) => chunk.text)
            .join(" ");
        const blob = new Blob([textContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const basename =
            selectedFile?.name.split(".").slice(0, -1).join(".") ||
            "transcript";
        a.download = `${basename}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
</script>

<div class="card">
    <div class="tool-body">
        {#if status === "idle"}
            <div
                class="upload-box"
                class:drag-over={isDragging}
                onclick={() => fileInput?.click()}
                role="button"
                tabindex="0"
                aria-label={texts.uploadTitle}
                onkeydown={(e) => e.key === "Enter" && fileInput?.click()}
                ondragover={handleDragOver}
                ondragleave={handleDragLeave}
                ondrop={handleDrop}
            >
                <i class="ti ti-cloud-upload ico" aria-hidden="true"></i>
                <p class="ttl">{texts.uploadTitle || "Upload Audio/Video"}</p>
                <p class="sub">{texts.uploadSubtitle || "Drag & drop an audio file"}</p>
                <div class="btn-row">
                    <button class="btn-primary btn-download-all" onclick={(e) => { e.stopPropagation(); fileInput?.click(); }}>
                        <i class="ti ti-upload" aria-hidden="true"></i> {texts.btnSelect || "Select File"}
                    </button>
                    <button class="btn-default" disabled={isLoadingSample} onclick={(e) => { e.stopPropagation();
                        isLoadingSample = true;
                        fetch(sampleAudioPath)
                            .then(res => {
                                if (!res.ok) throw new Error('Sample not found, using mock.');
                                return res.blob();
                            })
                            .then(blob => {
                                setFile(new File([blob], sampleAudioPath.split('/').pop() || 'sample.mp3', { type: "audio/mpeg" }));
                            })
                            .catch(() => {
                                setFile(new File(["sample content"], sampleAudioPath.split('/').pop() || 'sample.mp3', { type: "audio/mpeg" }));
                            })
                            .finally(() => {
                                isLoadingSample = false;
                            });
                    }}>
                        {#if isLoadingSample}
                            <span class="spin" aria-hidden="true"><i class="ti ti-loader-2"></i></span> {texts.btnSample || ''}
                        {:else}
                            <i class="ti ti-music" aria-hidden="true"></i> {texts.btnSample || ''}
                        {/if}
                    </button>
                </div>
                <p class="hint hint-desktop">{texts.hint || ''}</p>
            </div>

            <div class="settings">
                <button class="btn-cta" disabled
                    ><i class="ti ti-wand" aria-hidden="true"></i>
                    {texts?.btn?.transcribe || "Transcribe to Text"}</button
                >
            </div>
        {/if}

        {#if status !== "idle"}
            <div
                style="height: auto; padding-bottom: 6px; display: flex; flex-direction: column; gap: 8px;"
            >
                <div
                    class="preview-main"
                    style="flex: none; padding: 12px; border-radius: 8px; background: var(--bg-color); border: 1px dashed var(--border-color); display: flex; align-items: center; justify-content: center; text-align: center; position: relative;"
                >
                    <div style="width: 100%; display: flex; flex-direction: column; align-items: center; max-width: 100%; overflow: hidden; padding: 0 16px; box-sizing: border-box;">
                        <i
                            class="ti ti-file-music"
                            style="font-size: 32px; margin-bottom: 12px; display: block; opacity: 0.8;"
                            aria-hidden="true"
                        ></i>
                        <p style="margin: 0; font-weight: 500; margin-bottom: 12px; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            {selectedFile?.name}
                        </p>
                        {#if mediaUrl}
                            <!-- svelte-ignore a11y_media_has_caption -->
                            <audio src={mediaUrl} controls style="width: 100%; max-width: 300px; height: 40px;"></audio>
                        {/if}
                    </div>
                    {#if status === "file" || status === "done"}
                        <button
                            class="btn-rm"
                            aria-label="Remove file"
                            onclick={removeFile}
                            style="z-index: 10;"
                            ><i class="ti ti-x" aria-hidden="true"></i></button
                        >
                    {/if}
                </div>
            </div>
        {/if}

        {#if extractError}
            <div class="error-banner" role="alert">
                <i
                    class="ti ti-alert-triangle"
                    aria-hidden="true"
                    style="flex-shrink:0;"
                ></i>
                <span>{extractError}</span>
                <button
                    class="error-dismiss"
                    onclick={() => (extractError = null)}
                    aria-label="Dismiss error"
                >
                    <i class="ti ti-x" aria-hidden="true"></i>
                </button>
            </div>
        {/if}

        {#if status === "file" || status === "loading_model" || status === "proc" || status === "done"}
            <div class="settings">
                <div class="setting-row format-row">
                    <div class="setting-lbl">
                        {texts?.settings?.model || "AI Model"}
                    </div>
                    <div class="setting-ctl" style="flex: 1;">
                        <select
                            class="size-input"
                            bind:value={model}
                            disabled={status !== "file" && status !== "done"}
                            style="width: 100%;"
                        >
                            <option value="onnx-community/whisper-tiny"
                                >Whisper Tiny (Fastest)</option
                            >
                            <option value="onnx-community/whisper-base"
                                >Whisper Base</option
                            >
                            <option value="onnx-community/whisper-small"
                                >Whisper Small (Best)</option
                            >
                        </select>
                    </div>
                </div>

                <div class="setting-row format-row">
                    <div class="setting-lbl">
                        {texts?.settings?.language || "Language"}
                    </div>
                    <div class="setting-ctl" style="flex: 1;">
                        <select
                            class="size-input"
                            bind:value={language}
                            disabled={status !== "file" && status !== "done"}
                            style="width: 100%;"
                        >
                            <option value="english">English</option>
                            <option value="vietnamese">Vietnamese</option>
                            <option value="french">French</option>
                            <option value="spanish">Spanish</option>
                            <option value="japanese">Japanese</option>
                            <option value="korean">Korean</option>
                            <option value="chinese">Chinese</option>
                            <option value="german">German</option>
                            <option value="italian">Italian</option>
                            <option value="portuguese">Portuguese</option>
                            <option value="russian">Russian</option>
                            <option value="thai">Thai</option>
                            <option value="arabic">Arabic</option>
                            <option value="hindi">Hindi</option>
                            <option value="turkish">Turkish</option>
                        </select>
                    </div>
                </div>

                <hr class="settings-divider" />

                {#if status === "loading_model"}
                    <button
                        class="btn-cta processing"
                        disabled
                        style="background: linear-gradient(to right, var(--ac) {modelLoadingProgress}%, #bccfe0 {modelLoadingProgress}%); color: #fff; border-color: transparent;"
                    >
                        <span class="spin" aria-hidden="true"
                            ><i class="ti ti-loader-2"></i></span
                        >
                        <span class="cta-desktop"
                            >{modelLoadingProgress}% — {texts?.proc
                                ?.loading_model || "Loading AI Model..."}</span
                        >
                        <span class="cta-mobile" style="display:none"
                            >{modelLoadingProgress}% — {texts?.proc
                                ?.loading_model || "Loading Model..."}</span
                        >
                    </button>
                {:else if status === "proc"}
                    <button class="btn-cta processing" disabled>
                        <span class="spin" aria-hidden="true"
                            ><i class="ti ti-loader-2"></i></span
                        >
                        <span class="cta-desktop"
                            >{texts?.proc?.transcribing ||
                                "Transcribing..."}</span
                        >
                        <span class="cta-mobile" style="display:none"
                            >{texts?.proc?.transcribing ||
                                "Transcribing..."}</span
                        >
                    </button>
                {:else}
                    <button class="btn-cta" onclick={startTranscription}>
                        <i class="ti ti-wand" aria-hidden="true"></i>
                        <span class="cta-desktop"
                            >{texts?.btn?.transcribe ||
                                "Transcribe to Text"}</span
                        >
                        <span class="cta-mobile" style="display:none"
                            >{texts?.btn?.transcribe ||
                                "Transcribe to Text"}</span
                        >
                    </button>
                {/if}
            </div>
        {/if}

        {#if transcribedText.length > 0 || status === "done"}
            <div class="extracted-frames-container">
                <div class="transcript-box">
                    {#if transcribedText.length > 0}
                        {#each transcribedText as chunk}
                            <span
                                class="transcript-chunk"
                                title={formatTimestamp(chunk.timestamp)}
                                >{chunk.text}</span
                            >
                        {/each}
                    {:else if status === "done"}
                        <span style="opacity: 0.6; font-style: italic;"
                            >{texts?.results?.no_speech ||
                                "No speech detected."}</span
                        >
                    {/if}
                    {#if status === "proc"}
                        <span class="cursor-blink" aria-hidden="true">|</span>
                    {/if}
                </div>
                {#if status === "done"}
                    <div
                        style="margin-top: 16px; display: flex; justify-content: right; gap: 8px;"
                    >
                        {#if transcribedText.length > 0}
                            <button
                                class="btn-primary"
                                onclick={downloadText}
                            >
                                <i class="ti ti-download" aria-hidden="true"
                                ></i>
                                {texts?.btn?.download || "Download Text"}
                            </button>
                        {/if}
                        <button
                            class="btn-default"
                            onclick={() => {
                                status = "file";
                                transcribedText = [];
                            }}
                        >
                            <i class="ti ti-reload" aria-hidden="true"></i>
                            {texts?.btn?.start_over || "Start Over"}
                        </button>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>

<input
    type="file"
    bind:this={fileInput}
    accept={inputFormats}
    style="display:none"
    onchange={handleFileChange}
/>

<style>
    .extracted-frames-container {
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid var(--border-color, #e2e8f0);
    }
    .transcript-box {
        padding: 0px;
        background: var(--bg-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        font-size: 15px;
        line-height: 1.6;
        color: var(--text-color);
        max-height: 400px;
        overflow-y: auto;
    }
    .transcript-chunk {
        display: inline;
        margin-right: 4px;
        transition: background-color 0.2s;
    }
    .transcript-chunk:hover {
        background-color: rgba(74, 144, 226, 0.1);
        border-radius: 4px;
        cursor: help;
    }
    .cursor-blink {
        animation: blink 1s step-end infinite;
        font-weight: bold;
        color: var(--ac);
    }
    @keyframes blink {
        50% {
            opacity: 0;
        }
    }
    .error-banner {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 8px;
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #b91c1c;
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 12px;
    }
    :global([data-theme="dark"]) .error-banner {
        background: rgba(185, 28, 28, 0.15);
        border-color: rgba(185, 28, 28, 0.4);
        color: #fca5a5;
    }
    .error-dismiss {
        margin-left: auto;
        flex-shrink: 0;
        background: none;
        border: none;
        cursor: pointer;
        color: inherit;
        padding: 0;
        line-height: 1;
        opacity: 0.7;
    }
    .error-dismiss:hover {
        opacity: 1;
    }

    .setting-row {
        flex-direction: row !important;
        flex-wrap: nowrap !important;
        align-items: center !important;
        padding: 6px 0;
        gap: 12px;
    }
    .setting-lbl {
        white-space: nowrap;
        flex-shrink: 0;
    }
    .setting-ctl {
        flex: 1;
        min-width: 0;
        padding: 0 !important;
    }
</style>

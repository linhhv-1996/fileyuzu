<script lang="ts">
    import { toolUi } from "$lib/data/toolUi";
    import { siteConfig, type SupportedLang } from "$lib/data/siteConfig";
    import { page } from "$app/state";
    import Dropzone from "$lib/components/tool/Dropzone.svelte";
    import {
        Copy,
        Check,
        Trash2,
        Loader2,
        Maximize2,
        X,
        Plus,
        Play,
        WrapText,
        Wand2,
    } from "lucide-svelte";
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { pwaState } from "$lib/state/pwa.svelte";

    const currentLang = $derived(
        (siteConfig.languages.find(
            (l) => l.path === page.params.lang?.toLowerCase(),
        )?.id || siteConfig.defaultLang) as SupportedLang,
    );
    const t = $derived(toolUi[currentLang]);

    let queue = $state<any[]>([]);
    let isProcessing = $state(false);
    let ocrEngine = $state<any>(null);
    let zoomImage = $state<string | null>(null);
    let fileInput: HTMLInputElement;
    let expandedItemIndex = $state<number>(0);

    let OcrLib: any = null;
    let isLibLoaded = $state(false);
    let isModelLoading = $state(false);
    let isSampleLoading = $state(false);

    const wasmPaths = "https://xprofilebooster.xyz/ocr/";

    onMount(() => {
        if (!browser) return;
    });

    async function ensureEngineReady() {
        if (ocrEngine) return; // Nếu đã init rồi thì bỏ qua

        isModelLoading = true;
        try {
            // Chỉ tải thư viện và OpenCV (10MB) khi user bắt đầu dùng
            const ort = await import("onnxruntime-web");
            const { default: ImportedLib } = await import(
                "@gutenye/ocr-browser"
            );

            ort.env.wasm.proxy = true;
            ort.env.wasm.wasmPaths = wasmPaths;

            ocrEngine = await ImportedLib.create({
                models: {
                    detectionPath: wasmPaths + "ch_PP-OCRv4_det_infer.onnx",
                    recognitionPath: wasmPaths + "ch_PP-OCRv4_rec_infer.onnx",
                    dictionaryPath: wasmPaths + "ppocr_keys_v1.txt",
                },
            });
            isLibLoaded = true;
        } catch (e) {
            console.error("OCR Init Error:", e);
        } finally {
            isModelLoading = false;
        }
    }

    $effect(() => {
        if (ocrEngine && queue.length > 0) {
            // Kiểm tra xem có item nào ở trạng thái 'pending' không
            const hasPending = queue.some((item) => item.status === "pending");
            if (hasPending && !isProcessing) {
                processAll();
            }
        }
    });

    // Case đặc biệt: Paste từ clipboard -> Hiện preview chờ
    function handlePaste(e: ClipboardEvent) {
        const items = e.clipboardData?.items;
        if (!items) return;

        const imageFiles: File[] = [];
        for (const item of items) {
            if (item.type.indexOf("image") !== -1) {
                const blob = item.getAsFile();
                if (blob) {
                    const file = new File([blob], `pasted-${Date.now()}.png`, {
                        type: blob.type,
                    });
                    imageFiles.push(file);
                }
            }
        }
        if (imageFiles.length > 0) {
            handleFiles(imageFiles, true);
        }
    }

    // Logic xử lý file: Tách biệt ảnh dán và ảnh upload
    async function handleFiles(files: File[], isPaste = false) {
        const newItems = files.map((f) => ({
            file: f,
            text: "",
            // Các biến lưu snapshot ngay lúc click
            prevCleanText: "",
            prevJoinText: "",
            isCleaned: false,
            isJoined: false,
            // Nếu là paste thì để trạng thái 'waiting' để hiện preview, ngược lại 'pending' để auto-run
            status: isPaste ? "waiting" : "pending",
            previewUrl: URL.createObjectURL(f),
            copied: false,
        }));
        queue = [...queue, ...newItems];

        await ensureEngineReady();

        // Chỉ tự động chạy OCR cho những ảnh không phải từ Paste
        processAll();
    }

    async function processAll() {
        if (isProcessing || !ocrEngine) return;
        isProcessing = true;

        try {
            for (let item of queue) {
                // Chỉ xử lý các item 'pending' (từ upload/sample)
                if (item.status !== "pending") continue;

                item.status = "processing"; // [cite: 17]
                const res = await ocrEngine.detect(item.previewUrl);
                item.text = Array.isArray(res)
                    ? res.map((r: any) => r.text).join("\n") // [cite: 18]
                    : res.text || res;
                item.status = "done"; // [cite: 19]
            }
        } finally {
            isProcessing = false;
            pwaState.trigger();
        }
    }

    // Hàm riêng để kích hoạt xử lý cho ảnh dán (Trạng thái 'waiting')
    async function startManualProcess(index: number) {
        const item = queue[index];
        if (!item || item.status !== "waiting" || !isLibLoaded) return;

        // Đổi sang 'pending' và gọi processAll để tái sử dụng logic
        item.status = "pending";
        processAll();
    }

    async function loadSample(fileName: string) {
        if (isSampleLoading) return;
        isSampleLoading = true;
        try {
            const response = await fetch(`/samples/ocr/${fileName}.jpg`);
            const blob = await response.blob();
            const file = new File([blob], "sample-ocr.jpg", {
                type: "image/jpeg",
            });
            handleFiles([file], false);
        } catch (e) {
            console.error(e);
        } finally {
            isSampleLoading = false;
        }
    }

    function copyItem(item: any) {
        navigator.clipboard.writeText(item.text); // [cite: 24]
        item.copied = true;
        setTimeout(() => (item.copied = false), 2000);
    }

    function clearQueue() {
        queue = []; // [cite: 25]
        expandedItemIndex = 0;
    }

    function removeItem(index: number, e?: MouseEvent) {
        // Ngăn chặn sự kiện click lan ra làm trigger chọn ảnh (nếu đặt nút trên thumbnail)
        e?.stopPropagation();

        // Thu hồi URL để tránh rò rỉ bộ nhớ
        URL.revokeObjectURL(queue[index].previewUrl);

        // Xoá item
        queue = queue.filter((_, i) => i !== index);

        // Điều chỉnh index hiển thị
        if (expandedItemIndex >= queue.length) {
            expandedItemIndex = Math.max(0, queue.length - 1);
        }
    }

    const isAllDone = $derived(
        queue.length > 0 && queue.every((item) => item.status === "done"),
    );

    let copiedAll = $state(false);

    function copyAll() {
        if (!isAllDone) return;
        const imageLabel = t.common.image;

        const allText = queue
            .map(
                (item, index) =>
                    `[${imageLabel} ${index + 1}]\n${item.text || ""}`,
            )
            .join("\n\n");

        navigator.clipboard.writeText(allText);

        copiedAll = true;
        setTimeout(() => (copiedAll = false), 2000);
    }

    function toggleClean(index: number) {
        const item = queue[index];
        if (!item.isCleaned) {
            // CHỤP SNAPSHOT: Lưu lại text hiện tại (dù đã sửa tay hay chưa)
            item.prevCleanText = item.text;
            item.text = item.text.replace(/\s+/g, " ").trim();
            item.isCleaned = true;
        } else {
            // UNDO: Trả lại đúng cái text ngay trước khi nhấn Clean
            item.text = item.prevCleanText;
            item.isCleaned = false;
        }
    }

    function toggleJoin(index: number) {
        const item = queue[index];
        if (!item.isJoined) {
            // CHỤP SNAPSHOT: Lưu lại text hiện tại
            item.prevJoinText = item.text;
            item.text = item.text
                .split("\n")
                .map((line: any) => line.trim())
                .join(" ");
            item.isJoined = true;
        } else {
            // UNDO: Trả lại text trước khi Join
            item.text = item.prevJoinText;
            item.isJoined = false;
        }
    }
</script>

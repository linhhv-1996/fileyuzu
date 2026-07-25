<script lang="ts">
    import { onMount, tick } from "svelte";
    import type { AdSize } from "$lib/config/ads";

    const SIZE_MAP: Record<AdSize, { width: number; height: number }> = {
        "300x250": { width: 300, height: 250 },
        "320x50": { width: 320, height: 50 },
        "728x90": { width: 728, height: 90 },
        "320x100": { width: 320, height: 100 },
    };

    let {
        adKey,
        size = "300x250" as AdSize,
        reloadAfter,
    }: {
        adKey: string;
        size?: AdSize;
        reloadAfter?: number; // seconds
    } = $props();

    const dimensions = $derived(SIZE_MAP[size]);

    let cycle = $state(0);
    let loading = $state(true);
    let failed = $state(false);

    function injectAd(container: HTMLDivElement) {
        loading = true;
        failed = false;

        const renderToId = `yandex_rtb_${adKey}_${cycle}`;
        
        let observer: MutationObserver | null = null;

        tick().then(() => {
            const targetDiv = container.querySelector(`#${renderToId}`);
            if (!targetDiv) return;

            observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.addedNodes.length > 0) {
                        loading = false;
                        observer?.disconnect();
                        return;
                    }
                }
            });
            observer.observe(targetDiv, { childList: true, subtree: true });

            const execRender = () => {
                (window as any).yaContextCb = (window as any).yaContextCb || [];
                
                if (!document.querySelector('script[src="https://yandex.ru/ads/system/context.js"]')) {
                    const script = document.createElement("script");
                    script.type = "text/javascript";
                    script.src = "https://yandex.ru/ads/system/context.js";
                    script.async = true;
                    document.head.appendChild(script);
                }

                (window as any).yaContextCb.push(() => {
                    if ((window as any).Ya && (window as any).Ya.Context && (window as any).Ya.Context.AdvManager) {
                        (window as any).Ya.Context.AdvManager.render({
                            blockId: adKey,
                            renderTo: renderToId
                        });
                    }
                });
            };

            // Delay script injection until after window load to prevent tab spinning
            if (document.readyState === 'complete') {
                setTimeout(execRender, 50);
            } else {
                window.addEventListener('load', execRender, { once: true });
            }
        });

        const fallbackTimer = setTimeout(() => {
            if (loading) {
                loading = false;
                failed = true;
                if (observer) observer.disconnect();
            }
        }, 15000);

        return {
            destroy() {
                clearTimeout(fallbackTimer);
                if (observer) observer.disconnect();
            }
        };
    }

    onMount(() => {
        let reloadInterval: ReturnType<typeof setInterval> | undefined;

        if (reloadAfter && reloadAfter > 0) {
            reloadInterval = setInterval(() => {
                cycle++;
            }, reloadAfter * 1000);
        }

        return () => {
            if (reloadInterval) clearInterval(reloadInterval);
        };
    });
</script>

<div
    class="banner-ads-wrapper"
    class:is-loading={loading}
    class:is-failed={failed}
    style="width: {dimensions.width}px; height: {dimensions.height}px;"
>
    {#key cycle}
        <div
            class="banner-ads-container"
            style="width: {dimensions.width}px; height: {dimensions.height}px;"
            use:injectAd
        >
            <div id="yandex_rtb_{adKey}_{cycle}"></div>
        </div>
    {/key}

    {#if loading}
        <div
            class="banner-ads-skeleton"
            style="width: {dimensions.width}px; height: {dimensions.height}px;"
        >
            <div class="skeleton-pulse"></div>
            <div class="skeleton-shimmer"></div>
            <span class="skeleton-label">Ad</span>
        </div>
    {/if}
</div>

<style>
    .banner-ads-wrapper {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 auto;
        overflow: hidden;
        border-radius: 3px;
    }

    .banner-ads-wrapper.is-failed {
        display: none !important;
    }

    .banner-ads-container {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
    }

    .banner-ads-skeleton {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
        border-radius: 3px;
        overflow: hidden;
        background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 50%, #f0f0f0 100%);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    :global(.dark) .banner-ads-skeleton {
        background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 50%, #1e1e1e 100%);
    }

    .skeleton-pulse {
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%);
        background-size: 200% 200%;
        animation: pulse 2s ease-in-out infinite;
    }

    :global(.dark) .skeleton-pulse {
        background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 50%, #1e1e1e 100%);
        background-size: 200% 200%;
    }

    .skeleton-shimmer {
        position: absolute;
        inset: 0;
        background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.08) 20%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0.08) 80%,
            transparent 100%
        );
        animation: shimmer 2s ease-in-out infinite;
    }

    :global(.dark) .skeleton-shimmer {
        background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.02) 20%,
            rgba(255, 255, 255, 0.06) 50%,
            rgba(255, 255, 255, 0.02) 80%,
            transparent 100%
        );
    }

    .skeleton-label {
        position: relative;
        z-index: 1;
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.5px;
        color: #b0b0b0;
        user-select: none;
        pointer-events: none;
    }

    :global(.dark) .skeleton-label {
        color: #555;
    }

    @keyframes pulse {
        0%, 100% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
    }

    @keyframes shimmer {
        0% {
            transform: translateX(-100%);
        }
        100% {
            transform: translateX(100%);
        }
    }
</style>

<script lang="ts">
    import { onMount } from "svelte";

    // svelte-ignore non_reactive_update
    let container: HTMLDivElement;
    let status = $state<"loading" | "loaded" | "failed">("loading");

    function waitForAclib(cb: () => void, onFail: () => void, retries = 40) {
        const ready =
            typeof (window as any).aclib !== "undefined" &&
            typeof (window as any).aclib.runBanner === "function";

        if (ready) {
            cb();
            return;
        }
        if (retries <= 0) {
            onFail();
            return;
        }
        setTimeout(() => waitForAclib(cb, onFail, retries - 1), 250);
    }

    onMount(() => {
        let observer: MutationObserver | null = null;
        waitForAclib(
            () => {
                const s = document.createElement("script");
                s.type = "text/javascript";
                s.text = "aclib.runBanner({ zoneId: '11765042' });";
                
                observer = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                        for (let i = 0; i < mutation.addedNodes.length; i++) {
                            const node = mutation.addedNodes[i];
                            if (node.nodeName !== "SCRIPT") {
                                status = "loaded";
                                observer?.disconnect();
                                return;
                            }
                        }
                    }
                });
                if (container) {
                    observer.observe(container, { childList: true, subtree: true });
                }
                
                container.appendChild(s);
            },
            () => {
                console.warn("aclib.runBanner failed to load, hiding banner");
                status = "failed";
            }
        );
        
        return () => {
            if (observer) observer.disconnect();
        };
    });
</script>

<div bind:this={container} class="banner-ads-wrapper" style="width: 300px; height: 250px;">
    {#if status === "loading"}
        <div
            class="banner-ads-skeleton"
            style="width: 300px; height: 250px;"
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
        width: 300px;
        height: 250px;
        margin: 0 auto;
        overflow: hidden;
        border-radius: 0px;
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

<script lang="ts">
    import { onMount } from "svelte";
    let { adUnitId = "" } = $props();
    // let { adUnitId = "" } = $props();

    let loadAd = $state(false);

    onMount(() => {
        // Đẩy việc load iframe ra khỏi luồng render chính của trình duyệt
        // Giúp web mượt mà ngay khi mới mở mà vẫn load được ads (không cần đợi scroll)
        const timer = setTimeout(() => {
            loadAd = true;
        }, 500);
        return () => clearTimeout(timer);
    });
</script>

<div class="banner-ads-wrapper" style="width: 250px; height: 250px;">
    {#if adUnitId && loadAd}
        <iframe
            data-aa={adUnitId}
            src={`//ad.a-ads.com/${adUnitId}?size=250x250`}
            style="width:250px; height:250px; border: 1px solid var(--bd-lt, #ccc); border-radius: 3px; padding:0; overflow:hidden; background-color: transparent; position: relative; z-index: 1;"
            allowtransparency={true}
            title="AAds Banner"
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
        ></iframe>
    {:else}
        <div
            class="banner-ads-skeleton"
            style="width: 250px; height: 250px;"
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
        width: 250px;
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

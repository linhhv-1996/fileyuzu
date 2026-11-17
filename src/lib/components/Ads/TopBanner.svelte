<script lang="ts">
    import { onMount } from 'svelte';
    import AdcashBanner from './AdcashBanner.svelte';
    import { adsConfig } from '$lib/config/ads';

    // Banner 728x90 đặt phía trên khung tool.
    // Chỉ mount khi container đủ rộng (>= 728px + border) để không bị tràn,
    // và không gọi ads vào vùng ẩn/quá hẹp (mobile/tablet) → tránh impression ảo.
    let probe: HTMLDivElement | undefined = $state();
    let show = $state(false);

    onMount(() => {
        const check = () => {
            if (show) return;
            if (probe && probe.clientWidth >= 730) show = true;
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    });
</script>

<div class="top-banner-probe" bind:this={probe}></div>

{#if show}
    <div class="top-banner">
        <AdcashBanner
            adKey={adsConfig.adcash_banner_top.id}
            size={adsConfig.adcash_banner_top.size}
            reloadAfter={adsConfig.adcash_banner_top.reload_after}
        />
    </div>
{/if}

<style>
    .top-banner-probe {
        width: 100%;
        height: 0;
    }
    .top-banner {
        margin-bottom: 14px;
    }
    .top-banner:has(:global(.is-failed)) {
        display: none;
    }
</style>

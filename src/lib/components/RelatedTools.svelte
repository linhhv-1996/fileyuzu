<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { t, langUrl } from '$lib/i18n/config';
    import type { ToolConfig } from '$lib/config/tools';
    import AdcashBanner from './Ads/AdcashBanner.svelte';
    import { adsConfig } from '$lib/config/ads';
    // import BannerMondiads from './Ads/BannerMondiads.svelte';

    let { title = '', tools = [], mobile = false }: { title?: string, tools?: ToolConfig[], mobile?: boolean } = $props();

    let dict = $derived($page.data.dict);
    let lang = $derived($page.data.lang || 'en');
    let filteredTools = $derived(tools.filter(t => !t.markets || t.markets.includes(lang)));

    // Chỉ mount banner sidebar trên desktop (sidebar bị display:none dưới 769px,
    // tránh gọi ads vào container ẩn → impression ảo)
    let showSidebarAd = $state(false);
    onMount(() => {
        showSidebarAd = !mobile && window.matchMedia('(min-width: 769px)').matches;
    });
</script>

{#if showSidebarAd}
    <AdcashBanner
        adKey={adsConfig.adcash_banner_sidebar.id}
        size={adsConfig.adcash_banner_sidebar.size}
        reloadAfter={adsConfig.adcash_banner_sidebar.reload_after}
    />
{/if}

<div class="card" style={mobile ? "margin-top:14px" : ""}>
    <h2 class="sb-title">{t('related_tools.title', dict)}</h2>
    <div class="rel-list" style={mobile ? "display:grid;grid-template-columns:1fr 1fr" : ""}>
        {#each filteredTools as tool, i}
            <a href={langUrl(lang, `/${tool.slug}`)} class="rel-item" style={mobile && i % 2 === 0 ? "border-right:1px solid var(--bd-lt)" : ""}>
                <i class="ti ti-{tool.icon}" aria-hidden="true"></i>
                <div>
                    <span class="rel-name">{t(tool.titleKey, dict)}</span>
                    <span class="rel-sub">{t(tool.shortDescriptionKey, dict)}</span>
                </div>
            </a>
        {/each}
    </div>
</div>

<!-- <div class="mt-4">
    <BannerMondiads />
</div> -->

<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import Transliteration from '$lib/components/tools/Transliteration.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    import SEOContent from '$lib/components/SEOContent.svelte';
    import AdcashBanner from '$lib/components/Ads/AdcashBanner.svelte';
    import BannerAds from '$lib/components/Ads/BannerAds.svelte';
    import { adsConfig } from '$lib/config/ads';

    let dict = $derived($page.data.dict);

    let componentTexts = $derived({
        placeholder: t('transliteration.placeholder', dict) || 'Type or paste your text here to transliterate...',
        outputPlaceholder: t('transliteration.outputPlaceholder', dict) || 'Transliterated text will appear here...',
        clearBtn: t('transliteration.clearBtn', dict) || 'Clear',
        copyBtn: t('transliteration.copyBtn', dict) || 'Copy to Clipboard',
    });

    let relatedTools = $derived(getRelatedTools('transliteration'));
</script>

<Seo 
    title={t('tool.transliteration.seo.title', dict) || 'Free Online Transliteration Tool'} 
    description={t('tool.transliteration.seo.description', dict) || 'Transliterate text from various alphabets to Latin script instantly for free.'}
/>

<div class="hero">
    <h1>{t('tool.transliteration.hero.title', dict) || 'Free Online Transliteration'}</h1>
    <p>{t('tool.transliteration.hero.description', dict) || 'Convert text from any language into Latin characters instantly in your browser.'}</p>
</div>

<div class="grid">
    <main>
        <Transliteration texts={componentTexts} />
        
        {#if $page.data.seoContent}
            <SEOContent content={$page.data.seoContent} />
        {/if}
    </main>

    <!-- SIDEBAR (desktop only via CSS) -->
    <aside class="sidebar">
        <RelatedTools title={t('related_tools.title', dict) || 'Related Tools'} tools={relatedTools} />
        <div class="mt-4">
            <BannerAds 
                adKey={adsConfig.banner_sidebar.id} 
                reloadAfter={adsConfig.banner_sidebar.reload_after} 
                size={adsConfig.banner_sidebar.size}
            />
        </div>
    </aside>
</div>

<!-- SIDEBAR MOBILE (below main content on mobile) -->
<div class="sidebar-mobile">
    <RelatedTools title={t('related_tools.title', dict) || 'Related Tools'} tools={relatedTools} mobile={true} />
</div>

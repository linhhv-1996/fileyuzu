<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import ExtractFrames from '$lib/components/tools/ExtractFrames.svelte';
    import HowToUse from '$lib/components/HowToUse.svelte';
    import WhyUse from '$lib/components/WhyUse.svelte';
    import Faq from '$lib/components/Faq.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    import Affiliate from '$lib/components/Affiliate.svelte';
    
    let dict = $derived($page.data.dict);
    
    let extractTexts = $derived({
        uploadTitle: t('extract_frames.upload.title', dict),
        uploadSubtitle: t('extract_frames.upload.subtitle', dict),
        btnSelect: t('extract_frames.upload.btn_select', dict),
        btnSample: t('extract_frames.upload.btn_sample', dict),
        hint: t('extract_frames.upload.hint', dict),
        
        mode: {
            title: t('extract_frames.mode.title', dict),
            current: t('extract_frames.mode.current', dict),
            interval: t('extract_frames.mode.interval', dict),
            evenly: t('extract_frames.mode.evenly', dict),
        },
        settings: {
            format: t('extract_frames.settings.format', dict),
            interval: t('extract_frames.settings.interval', dict),
            interval_custom: t('extract_frames.settings.interval_custom', dict),
            frames: t('extract_frames.settings.frames', dict),
            frames_custom: t('extract_frames.settings.frames_custom', dict),
        },
        btn: {
            save_current: t('extract_frames.btn.save_current', dict),
            extract_zip: t('extract_frames.btn.extract_zip', dict),
            new: t('extract_frames.btn.new', dict),
            download_all: t('extract_frames.btn.download_all', dict),
            clear_all: t('extract_frames.btn.clear_all', dict),
            extract: t('extract_frames.btn.extract', dict),
        },
        proc: {
            extracting: t('extract_frames.proc.extracting', dict),
        },
        results: {
            extracted_frames: t('extract_frames.results.extracted_frames', dict),
        },
        preview: {
            not_available: t('extract_frames.preview.not_available', dict),
            unsupported_format: t('extract_frames.preview.unsupported_format', dict),
            fallback_hint: t('extract_frames.preview.fallback_hint', dict),
        }
    });
    
    let relatedTools = $derived(getRelatedTools('extract-frames-from-video'));
</script>

<Seo title={t('extract_frames.seo.title', dict)} description={t('extract_frames.seo.description', dict)} />

<div class="hero">
    <h1>{t('extract_frames.hero.title', dict)}</h1>
    <p>{t('extract_frames.hero.description', dict)}</p>
</div>

<div class="grid">
    <main>
        <ExtractFrames texts={extractTexts} />
        <HowToUse title={t('extract_frames.how_to_use.title', dict)} steps={Array.isArray(t('extract_frames.how_to_use.steps', dict)) ? t('extract_frames.how_to_use.steps', dict) : []} />
        <WhyUse title={t('extract_frames.why_use.title', dict)} benefits={Array.isArray(t('extract_frames.why_use.benefits', dict)) ? t('extract_frames.why_use.benefits', dict) : []} />
        <Faq title={t('extract_frames.faq.title', dict)} items={Array.isArray(t('extract_frames.faq.items', dict)) ? t('extract_frames.faq.items', dict) : []} />
    </main>

    <!-- SIDEBAR (desktop only via CSS) -->
    <aside class="sidebar">
        <div class="mt-4">
            <Affiliate offer="nordvpn" />
        </div>
        <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} />
    </aside>
</div>

<!-- SIDEBAR MOBILE (below main content on mobile) -->
<div class="sidebar-mobile">
    <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} mobile={true} />
</div>

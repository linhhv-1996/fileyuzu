<script lang="ts">
    import { page } from '$app/stores';
    import { t, langUrl, SUPPORTED_LANGUAGES } from '$lib/i18n/config';

    let lang = $derived($page.params.lang || 'en');
    let dict = $derived($page.data.dict);
    
    let currentLang = $derived(SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0]);

    let navOpen = $state(false);
    let langOpen = $state(false);

    function toggleNav(e: Event) {
        e.stopPropagation();
        navOpen = !navOpen;
        langOpen = false;
    }

    function toggleLang(e: Event) {
        e.stopPropagation();
        langOpen = !langOpen;
        navOpen = false;
    }
    
    // Close dropdowns when clicking outside (using action in real app, here simple window click is fine)
</script>

<svelte:window onclick={() => { navOpen = false; langOpen = false; }} />

<header class="hdr">
    <div class="hdr-inner">
        <a href={langUrl(lang, '/')} class="logo">
            <svg width="18" height="18" viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="1.5" y="2.5" width="14" height="12" rx="2" />
                <polyline points="6.5,6.5 11.5,8.5 6.5,10.5" />
            </svg>
            FileYuzu
        </a>

        <nav class="hdr-nav" aria-label="Main navigation">
            <div class="nav-dd" class:open={navOpen}>
                <button class="nav-trigger" type="button" aria-haspopup="true" aria-expanded={navOpen} onclick={toggleNav}>
                    <i class="ti ti-layout-grid" aria-hidden="true"></i>
                    {t('common.tools', dict)}
                    <i class="ti ti-chevron-down chev" aria-hidden="true"></i>
                </button>
                <div class="dd-menu" role="menu">
                    <a href={langUrl(lang, '/')} class="dd-item" role="menuitem">
                        <i class="ti ti-movie" aria-hidden="true"></i>
                        <span><span class="dd-title">{t('tool.compress_video.title', dict)}</span><span class="dd-sub">{t('tool.compress_video.description', dict)}</span></span>
                    </a>
                    <a href={langUrl(lang, '/pdf-compressor')} class="dd-item" role="menuitem">
                        <i class="ti ti-file-type-pdf" aria-hidden="true"></i>
                        <span><span class="dd-title">{t('tool.pdf_compressor.title', dict)}</span><span class="dd-sub">{t('tool.pdf_compressor.description', dict)}</span></span>
                    </a>
                    <a href={langUrl(lang, '/video-converter')} class="dd-item" role="menuitem">
                        <i class="ti ti-arrows-right-left" aria-hidden="true"></i>
                        <span><span class="dd-title">{t('tool.video_converter.title', dict)}</span><span class="dd-sub">{t('tool.video_converter.description', dict)}</span></span>
                    </a>
                </div>
            </div>
        </nav>

        <div class="hdr-r">
            <div class="lang-dd" class:open={langOpen}>
                <button class="lang-trigger" type="button" aria-haspopup="listbox" aria-expanded={langOpen} onclick={toggleLang}>
                    <span class="lang-flag">{currentLang.flag}</span>
                    <span class="lang-current">{currentLang.name}</span>
                    <i class="ti ti-chevron-down chev" aria-hidden="true"></i>
                </button>
                <div class="dd-menu" role="listbox" aria-label={t('common.language', dict)}>
                    {#each SUPPORTED_LANGUAGES as l}
                        <a href={langUrl(l.code, $page.url.pathname.replace(`/${lang}`, '').replace(/^\/$/, '') || '/')} class="dd-item lang-option" data-sveltekit-reload role="option" aria-selected={l.code === lang}>
                            <span class="lang-flag">{l.flag}</span><span>{l.name}</span>
                        </a>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</header>

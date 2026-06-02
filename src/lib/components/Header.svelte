<script lang="ts">
    import { page } from '$app/stores';
    import { t, langUrl, SUPPORTED_LANGUAGES } from '$lib/i18n/config';

    let lang = $derived($page.params.lang || 'en');
    let dict = $derived($page.data.dict);
    
    let currentLang = $derived(SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0]);

    let navOpen = $state(false);
    let langOpen = $state(false);
    let mobileMenuOpen = $state(false);

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
    
    function toggleMobileMenu(e: Event) {
        e.stopPropagation();
        mobileMenuOpen = !mobileMenuOpen;
        navOpen = false;
        langOpen = false;
    }
    
    // Close dropdowns when clicking outside
</script>

<svelte:window onclick={() => { navOpen = false; langOpen = false; mobileMenuOpen = false; }} />

<header class="hdr">
    <div class="hdr-inner">
        <a href={langUrl(lang, '/')} class="logo">
            uploadless.app
        </a>

        <div class="hdr-menu" class:open={mobileMenuOpen} onclick={(e) => e.stopPropagation()} role="presentation">
            <nav class="hdr-nav" aria-label="Main navigation">
                <a href={langUrl(lang, '/blog')} class="nav-trigger" style="text-decoration: none;" onclick={() => mobileMenuOpen = false}>
                    <i class="ti ti-article" aria-hidden="true"></i>
                    {t('common.blog', dict) || 'Blog'}
                </a>

                <div class="nav-dd" class:open={navOpen}>
                    <button class="nav-trigger" type="button" aria-haspopup="true" aria-expanded={navOpen} onclick={toggleNav}>
                        <i class="ti ti-layout-grid" aria-hidden="true"></i>
                        {t('common.tools', dict)}
                        <i class="ti ti-chevron-down chev" aria-hidden="true"></i>
                    </button>
                    <div class="dd-menu" role="menu">
                        <a href={langUrl(lang, '/compress-video')} class="dd-item" role="menuitem" onclick={() => mobileMenuOpen = false}>
                            <i class="ti ti-movie" aria-hidden="true"></i>
                            <span><span class="dd-title">{t('tool.compress_video.title', dict)}</span><span class="dd-sub">{t('tool.compress_video.description', dict)}</span></span>
                        </a>
                        <a href={langUrl(lang, '/compress-pdf')} class="dd-item" role="menuitem" onclick={() => mobileMenuOpen = false}>
                            <i class="ti ti-file-type-pdf" aria-hidden="true"></i>
                            <span><span class="dd-title">{t('tool.pdf_compressor.title', dict)}</span><span class="dd-sub">{t('tool.pdf_compressor.description', dict)}</span></span>
                        </a>
                        <a href={langUrl(lang, '/video-converter')} class="dd-item" role="menuitem" onclick={() => mobileMenuOpen = false}>
                            <i class="ti ti-arrows-right-left" aria-hidden="true"></i>
                            <span><span class="dd-title">{t('tool.video_converter.title', dict)}</span><span class="dd-sub">{t('tool.video_converter.description', dict)}</span></span>
                        </a>
                    </div>
                </div>
            </nav>
        </div>

        <div class="hdr-r">
            <div class="lang-dd" class:open={langOpen}>
                <button class="lang-trigger" type="button" aria-haspopup="listbox" aria-expanded={langOpen} onclick={toggleLang}>
                    <span class="lang-flag">{currentLang.flag}</span>
                    <span class="lang-current">{currentLang.name}</span>
                    <i class="ti ti-chevron-down chev" aria-hidden="true"></i>
                </button>
                <div class="dd-menu" role="listbox" aria-label={t('common.language', dict)}>
                    {#each SUPPORTED_LANGUAGES as l}
                        {@const targetPath = $page.url.pathname.includes('/blog') ? '/' : ($page.url.pathname.replace(`/${lang}`, '').replace(/^\/$/, '') || '/')}
                        <a href={langUrl(l.code, targetPath)} class="dd-item lang-option" data-sveltekit-reload role="option" aria-selected={l.code === lang} onclick={() => mobileMenuOpen = false}>
                            <span class="lang-flag">{l.flag}</span><span>{l.name}</span>
                        </a>
                    {/each}
                </div>
            </div>
        </div>

        <button class="mobile-toggle" type="button" aria-expanded={mobileMenuOpen} aria-label="Toggle menu" onclick={toggleMobileMenu}>
            <i class="ti {mobileMenuOpen ? 'ti-x' : 'ti-menu-2'}" aria-hidden="true"></i>
        </button>
    </div>
</header>

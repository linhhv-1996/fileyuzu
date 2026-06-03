<script lang="ts">
    import { page } from '$app/stores';
    import { t, langUrl, SUPPORTED_LANGUAGES } from '$lib/i18n/config';
    import { tools } from '$lib/config/tools';

    let lang = $derived($page.data.lang || 'en');
    let dict = $derived($page.data.dict);
    
    let currentLang = $derived(SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0]);

    let navOpen = $state(false);
    let langOpen = $state(false);
    let mobileMenuOpen = $state(false);

    let filteredTools = $derived(tools.filter(tool => !tool.markets || tool.markets.includes(lang)));

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
                        {#each filteredTools as tool}
                            <a href={langUrl(lang, `/${tool.slug}`)} class="dd-item" role="menuitem" onclick={() => mobileMenuOpen = false}>
                                <i class="ti ti-{tool.icon}" aria-hidden="true"></i>
                                <span><span class="dd-title">{t(tool.titleKey, dict)}</span><span class="dd-sub">{t(tool.shortDescriptionKey || tool.descriptionKey, dict)}</span></span>
                            </a>
                        {/each}
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
                        <a href={langUrl(l.code, '/')} class="dd-item lang-option" data-sveltekit-reload role="option" aria-selected={l.code === lang} onclick={() => mobileMenuOpen = false}>
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

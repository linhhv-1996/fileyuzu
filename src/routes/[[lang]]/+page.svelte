<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t, langUrl } from '$lib/i18n/config';
    import { tools } from '$lib/config/tools';
    import Donate from '$lib/components/Donate.svelte';

    let dict = $derived($page.data.dict);
    let lang = $derived($page.data.lang || 'en');

    let searchQuery = $state('');

    let filteredTools = $derived(
        tools.filter(tool => {
            if (tool.markets && !tool.markets.includes(lang)) return false;
            
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            const title = String(t(tool.titleKey, dict) || '').toLowerCase();
            const desc = String(t(tool.descriptionKey, dict) || '').toLowerCase();
            const tags = (tool.tags || []).join(' ').toLowerCase();
            return title.includes(query) || desc.includes(query) || tags.includes(query);
        })
    );
</script>

<Seo title={t('home.seo.title', dict)} description={t('home.seo.description', dict)} />

<!-- Hero -->
<section class="hero">
    <h1>{t('home.hero.title', dict)}</h1>
    <p>{t('home.hero.description', dict)}</p>

    <div class="trust-pills">
        <span class="pill">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            {t('home.pill.private', dict)}
        </span>
        <span class="pill">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {t('home.pill.instant', dict)}
        </span>
        <span class="pill">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"/></svg>
            {t('home.pill.free', dict)}
        </span>
    </div>
</section>

<div class="home-layout">
    <div class="home-main">
        <div class="search-container">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
                type="text" 
                bind:value={searchQuery} 
                placeholder={t('home.search.placeholder', dict) !== 'home.search.placeholder' ? t('home.search.placeholder', dict) : 'Search tools...'} 
                class="search-input"
            />
        </div>

        <!-- Tools grid -->
        <section class="tools-section">
            <div class="tools-grid">
                {#each filteredTools as tool}
                    <a href={langUrl(lang, `/${tool.slug}`)} class="tool-card">
                        <div class="tool-card-main">
                            <span class="tool-card-title">{t(tool.titleKey, dict)}</span>
                            <span class="tool-card-desc">{t(tool.descriptionKey, dict)}</span>
                        </div>
                        <i class="ti ti-chevron-right card-arrow" aria-hidden="true"></i>
                    </a>
                {/each}
            </div>
        </section>

        <!-- FAQ -->
        <section class="faq-section">
            <h2>{t('home.faq.title', dict)}</h2>
            <div class="faq-list">
                {#each Array.isArray(t('home.faq.items', dict)) ? t('home.faq.items', dict) : [] as item}
                    <div class="faq-item">
                        <h3>{item.q}</h3>
                        <p>{item.a}</p>
                    </div>
                {/each}
            </div>
        </section>
    </div>

    <aside class="home-sidebar">
        <div class="sidebar-widget">
            <Donate {dict} />
        </div>

        <section class="sidebar-why">
            <div class="why-card">
                <div class="why-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <strong>{t('home.why.private.title', dict)}</strong>
                <p>{t('home.why.private.desc', dict)}</p>
            </div>
            <div class="why-card">
                <div class="why-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <strong>{t('home.why.instant.title', dict)}</strong>
                <p>{t('home.why.instant.desc', dict)}</p>
            </div>
            <div class="why-card">
                <div class="why-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <strong>{t('home.why.device.title', dict)}</strong>
                <p>{t('home.why.device.desc', dict)}</p>
            </div>
        </section>
    </aside>
</div>

<style>
    /* ── Layout ── */
    .home-layout {
        display: flex;
        gap: 16px;
        align-items: flex-start;
    }

    .home-main {
        flex: 1;
        min-width: 0;
    }

    .home-sidebar {
        width: 250px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
        position: sticky;
        top: 60px;
        height: fit-content;
    }

    .sidebar-widget {
        width: 100%;
    }

    @media (max-width: 900px) {
        .home-layout {
            flex-direction: column;
        }
        .home-sidebar {
            width: 100%;
        }
    }

    /* ── Hero ── */
    .hero {
        padding: 0px 0 24px;
        text-align: left;
    }

    .hero h1 {
        font-size: clamp(28px, 5vw, 42px);
        font-weight: 700;
        color: var(--tx);
        margin-bottom: 12px;
        line-height: 1.15;
        letter-spacing: -0.02em;
    }

    .hero p {
        font-size: 16.5px;
        color: var(--tx-sub);
        max-width: 520px;
        margin: 0 0 24px;
        line-height: 1.6;
    }

    .trust-pills {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 13.5px;
        color: var(--tx-sub);
        background: var(--bg-sub);
        border: 1px solid var(--bd-lt);
        border-radius: 999px;
        padding: 4px 12px;
    }

    .pill svg {
        color: var(--green);
        flex-shrink: 0;
    }

    /* ── Tools grid ── */
    .tools-section {
        margin-bottom: 20px;
    }

    .search-container {
        position: relative;
        width: 100%;
        margin-bottom: 16px;
    }

    .search-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--tx-sub);
        pointer-events: none;
    }

    .search-input {
        width: 100%;
        box-sizing: border-box;
        padding: 8px 16px 8px 38px;
        font-size: 14px;
        color: var(--tx);
        background: var(--bg);
        border: 1px solid var(--bd);
        border-radius: 99px;
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
    }

    .search-input:focus {
        border-color: var(--ac);
        box-shadow: 0 0 0 3px var(--ac-soft);
    }
    
    .search-input::placeholder {
        color: var(--tx-mt);
    }

    .tools-grid {
        column-count: 2;
        column-gap: 8px;
    }

    @media (max-width: 768px) {
        .tools-grid {
            column-count: 1;
            column-gap: 6px;
        }
        .tool-card {
            margin-bottom: 6px !important;
        }
    }

    /* Tool card */
    .tool-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        text-decoration: none;
        color: inherit;
        border: 1px solid var(--bd);
        border-radius: var(--r);
        background: var(--bg);
        transition: background 0.12s, border-color 0.12s, box-shadow 0.12s;
        position: relative;
        min-width: 0;
        break-inside: avoid;
        margin-bottom: 8px;
    }

    .tool-card:hover {
        background: var(--bg-sub);
        text-decoration: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .tool-card-main {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .tool-card-title {
        font-size: 17px;
        font-weight: 650;
        color: var(--tx);
        transition: color 0.15s ease;
        margin-bottom: 4px;
    }

    .tool-card:hover .tool-card-title {
        color: var(--ac);
        text-decoration: underline;
        text-underline-offset: 2px;
    }

    .tool-card-desc {
        font-size: 14.5px;
        color: var(--tx-sub);
        line-height: 1.5;
    }

    .card-arrow {
        font-size: 14px;
        color: var(--tx-mt);
        flex-shrink: 0;
        transition: transform 0.12s, color 0.12s;
    }

    .tool-card:hover .card-arrow {
        color: var(--ac);
        transform: translateX(2px);
    }

    /* ── Why (Sidebar) ── */
    .sidebar-why {
        display: flex;
        flex-direction: column;
        gap: 0;
        background: var(--bg);
        border: 1px solid var(--bd);
        border-radius: var(--r);
        overflow: hidden;
    }

    .why-card {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        border-bottom: 1px solid var(--bd-lt);
    }

    .why-card:last-child {
        border-bottom: none;
    }

    .why-icon {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        background: var(--ac-soft);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: var(--ac);
        margin-bottom: 4px;
    }

    .why-card strong {
        display: block;
        font-size: 15px;
        font-weight: 650;
        color: var(--tx);
    }

    .why-card p {
        margin: 0;
        font-size: 14px;
        color: var(--tx-sub);
        line-height: 1.55;
    }

    /* ── FAQ — full-width, 1 per row ── */
    .faq-section {
        border-top: 1px solid var(--bd-lt);
        padding: 24px 0 16px;
    }

    .faq-section h2 {
        font-size: 18px;
        font-weight: 650;
        color: var(--tx);
        margin: 0 0 16px;
    }

    .faq-list {
        display: flex;
        flex-direction: column;
        gap: 0;
        border: 1px solid var(--bd);
        border-radius: var(--r);
        overflow: hidden;
    }

    .faq-item {
        padding: 12px 16px;
        border-bottom: 1px solid var(--bd-lt);
    }

    .faq-item:last-child {
        border-bottom: none;
    }

    .faq-item h3 {
        font-size: 15px;
        font-weight: 600;
        color: var(--tx);
        margin: 0 0 5px;
        line-height: 1.4;
    }

    .faq-item p {
        margin: 0;
        font-size: 14px;
        color: var(--tx-sub);
        line-height: 1.6;
    }
</style>

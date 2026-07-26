<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t, langUrl } from '$lib/i18n/config';
    import { tools, type ToolConfig } from '$lib/config/tools';
    import Affiliate from '$lib/components/Affiliate.svelte';
    import BannerAds from '$lib/components/Ads/BannerAds.svelte';
    import AdcashBanner from '$lib/components/Ads/AdcashBanner.svelte';
    import { adsConfig } from '$lib/config/ads';
    import YandexBanner from '$lib/components/Ads/YandexBanner.svelte';
    import AdsterraBanner from '$lib/components/Ads/AdsterraBanner.svelte';
    import EXOBanner from '$lib/components/Ads/EXOBanner.svelte';

    let dict = $derived($page.data.dict);
    let lang = $derived($page.data.lang || 'en');

    let searchQuery = $state('');
    let activeCategory = $state('all');

    const categoryMeta: Record<string, { label: string; icon: string }> = {
        video: { label: 'Video', icon: 'movie' },
        pdf:   { label: 'PDF & Image', icon: 'file-type-pdf' },
        audio: { label: 'Audio', icon: 'music' },
        text:  { label: 'Text', icon: 'list-check' },
    };

    let availableCategories = $derived(
        ['video', 'pdf', 'audio', 'text'].filter(cat =>
            tools.some(tool =>
                tool.category === cat &&
                (!tool.markets || tool.markets.includes(lang))
            )
        )
    );

    let popularSlugs = ['barcode-generator', 'image-to-text', 'word-counter', 'compress-video', 'video-converter'];
    let popularTools = $derived(
        popularSlugs
            .map(slug => tools.find(tool => tool.slug === slug))
            .filter(tool => tool && (!tool.markets || tool.markets.includes(lang)))
    );

    let filteredTools = $derived(
        tools.filter(tool => {
            if (tool.markets && !tool.markets.includes(lang)) return false;
            if (activeCategory !== 'all' && tool.category !== activeCategory) return false;
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            const title = String(t(tool.titleKey, dict) || '').toLowerCase();
            const desc = String(t(tool.descriptionKey, dict) || '').toLowerCase();
            const tags = (tool.tags || []).join(' ').toLowerCase();
            return title.includes(query) || desc.includes(query) || tags.includes(query);
        }).sort((a, b) => {
            const aIndex = popularSlugs.indexOf(a.slug);
            const bIndex = popularSlugs.indexOf(b.slug);
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return 0;
        })
    );
</script>

<Seo title={t('home.seo.title', dict)} description={t('home.seo.description', dict)} />

<!-- Hero -->
<section class="hero">
    <h1>{t('home.hero.title', dict)}</h1>
    <p class="hero-desc">{t('home.hero.description', dict)}</p>
</section>

<!-- Toolbar: search + category tabs -->
<div class="toolbar">
    <div class="search-wrap">
        <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
            type="text"
            bind:value={searchQuery}
            placeholder={String(t('home.search.placeholder', dict)) !== 'home.search.placeholder' ? String(t('home.search.placeholder', dict)) : 'Search tools...'}
            class="search-input"
        />
    </div>
    <div class="cat-tabs" role="tablist">
        <button
            class="cat-tab"
            class:active={activeCategory === 'all'}
            onclick={() => activeCategory = 'all'}
            role="tab"
        >{t('home.category.all', dict) || 'All'}</button>
        {#each availableCategories as catId}
            <button
                class="cat-tab"
                class:active={activeCategory === catId}
                onclick={() => activeCategory = catId}
                role="tab"
            >
                <i class="ti ti-{categoryMeta[catId]?.icon || 'tool'}" aria-hidden="true"></i>
                {t(`home.category.${catId}`, dict) || categoryMeta[catId]?.label || catId}
            </button>
        {/each}
    </div>
</div>

<div class="home-layout">
    <div class="home-main">
        <!-- Tools Grid -->
        <section class="tools-section">
    {#if filteredTools.length === 0}
        <div class="empty-state">
            <i class="ti ti-search-off" aria-hidden="true"></i>
            <p>No tools found</p>
        </div>
    {:else}
        {#snippet ToolCard(tool: ToolConfig)}
            <a href={langUrl(lang, `/${tool.slug}`)} class="tool-card" class:popular={popularSlugs.includes(tool.slug)}>
                <div class="tool-header">
                    <i class="ti ti-{tool.icon}" aria-hidden="true"></i>
                    <span class="tool-title">{t(tool.titleKey, dict)}</span>
                    {#if popularSlugs.includes(tool.slug)}
                        <span class="popular-label" aria-label="Popular Tool">{t('home.popular', dict) || 'Popular'}</span>
                    {/if}
                </div>
                <div class="tool-info">
                    <span class="tool-desc">{t(tool.descriptionKey, dict)}</span>
                </div>
                <!-- {#if tool.tags?.length}
                    <div class="tool-tags">
                        {#each tool.tags.slice(0, 3) as tag}
                            <span class="tool-tag">{tag}</span>
                        {/each}
                    </div>
                {/if} -->
            </a>
        {/snippet}

        <div class="tools-grid-masonry cols-2">
            <div class="masonry-col">
                {#each filteredTools.filter((_, i) => i % 2 === 0) as tool}
                    {@render ToolCard(tool)}
                {/each}
            </div>
            <div class="masonry-col">
                {#each filteredTools.filter((_, i) => i % 2 === 1) as tool}
                    {@render ToolCard(tool)}
                {/each}
            </div>
        </div>

        <div class="tools-grid-masonry cols-1">
            <div class="masonry-col">
                {#each filteredTools as tool}
                    {@render ToolCard(tool)}
                {/each}
            </div>
        </div>
    {/if}
</section>

<!-- Labs Section -->
{#if $page.data.recentLabs && $page.data.recentLabs.length > 0}
<section class="labs-section">
    <div class="labs-header">
        <h2 class="section-title">{t('common.labs', dict) || 'Labs'}</h2>
        <p class="labs-desc">{t('home.labs_description', dict) || 'Deep-dives, real-world tests, and technical experiments from our labs.'}</p>
    </div>
    <div class="labs-list">
        {#each $page.data.recentLabs as lab}
            <article class="lab-card">
                <div class="lab-meta">
                    <time class="lab-date">{new Date(lab.date).toLocaleDateString(lang, { year: 'numeric', month: 'short', day: 'numeric' })}</time>
                </div>
                <a href={langUrl(lang, `/labs/${lab.slug}`)} class="lab-card-title-link">
                    <h3 class="lab-title">{lab.title}</h3>
                </a>
                <div class="lab-snippet">
                    {@html lab.contentSnippet}
                </div>
                <a href={langUrl(lang, `/labs/${lab.slug}`)} class="lab-read-more">{dict['blog.read_article'] || 'Read article'} &rarr;</a>
            </article>
        {/each}
    </div>
</section>
{/if}

<!-- Trust Strip -->
<div class="trust-strip">
    <div class="trust-item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>{t('home.pill.private', dict)}</span>
    </div>
    <span class="trust-dot"></span>
    <div class="trust-item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        <span>{t('home.pill.instant', dict)}</span>
    </div>
    <span class="trust-dot"></span>
    <div class="trust-item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"/></svg>
        <span>{t('home.pill.free', dict)}</span>
    </div>
</div>

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
        <h3 class="sidebar-title">{t("common.blog", dict) || "Latest Blog"}</h3>
        <div class="sidebar-posts">
            {#if $page.data.recentPosts}
                {#each $page.data.recentPosts as post}
                    <a href={langUrl(lang, `/blog/${post.slug}`)} class="sidebar-post-item">
                        <h4 class="sidebar-post-title">{post.title || post.slug}</h4>
                        {#if post.date}
                            <span class="sidebar-post-date">
                                {new Date(post.date).toLocaleDateString(lang, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                        {/if}
                    </a>
                {/each}
            {/if}
        </div>
        <div class="sidebar-ad">
            <YandexBanner 
                adKey={adsConfig.yandex_banner_sidebar_home.id} 
                reloadAfter={adsConfig.yandex_banner_sidebar_home.reload_after} 
                size={adsConfig.yandex_banner_sidebar_home.size}
            />
            <!-- <AdsterraBanner 
                adKey="85c87dc7bfff537a2e642741cb7ba59a" 
                size="300x250" 
                reloadAfter={20}
            /> -->
            <!-- <AdcashBanner 
                adKey="11765042"
                reloadAfter={20} 
                size={"300x250"}
            /> -->
            <!-- <AdcashBanner adKey={"11765042"} reloadAfter={30}/> -->
            <!-- <BannerAds 
                adKey={adsConfig.banner_sidebar.id} 
                reloadAfter={adsConfig.banner_sidebar.reload_after} 
                size={adsConfig.banner_sidebar.size}
            /> -->
        </div>
    </aside>
</div>

<style>
    /* ── Layout ── */
    .home-layout {
        display: flex;
        gap: 20px;
        align-items: flex-start;
    }
    
    .home-main {
        flex: 1;
        min-width: 0;
    }
    
    .home-sidebar {
        width: 300px;
        flex-shrink: 0;
        position: sticky;
        top: 24px;
    }
    
    .sidebar-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--tx);
        margin: 0 0 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--bd-lt);
    }
    
    .sidebar-posts {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .sidebar-post-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        text-decoration: none;
        padding-bottom: 16px;
        border-bottom: 1px dashed var(--bd-lt);
        transition: opacity 0.2s;
    }

    .sidebar-post-item:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }
    
    .sidebar-post-item:hover {
        opacity: 0.85;
    }
    
    .sidebar-post-title {
        margin: 0;
        font-size: 13px;
        font-weight: 500;
        color: var(--tx);
        line-height: 1.4;
        transition: color 0.2s;
    }
    
    .sidebar-post-item:hover .sidebar-post-title {
        color: var(--ac);
    }
    
    .sidebar-post-date {
        font-size: 12px;
        color: var(--tx-sub);
    }

    @media (max-width: 900px) {
        .home-layout {
            flex-direction: column;
        }
        .home-sidebar {
            width: 100%;
            position: static;
            margin-top: 32px;
        }
    }

    /* ── Hero ── */
    .hero {
        padding: 0 0 20px;
        text-align: left;
    }

    .hero h1 {
        font-size: clamp(26px, 4.5vw, 38px);
        font-weight: 750;
        color: var(--tx);
        margin-bottom: 8px;
        line-height: 1.15;
        letter-spacing: -0.025em;
    }

    .hero-desc {
        font-size: 16px;
        color: var(--tx-sub);
        max-width: 860px;
        line-height: 1.6;
        margin: 0;
    }

    /* ── Toolbar ── */
    .toolbar {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        margin-bottom: 24px;
        flex-wrap: wrap;
    }

    .search-wrap {
        position: relative;
        flex: 1;
        /* min-width: 220px;
        max-width: 280px; */
    }

    .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--tx-mt);
        pointer-events: none;
        width: 14px;
        height: 14px;
    }

    .search-input {
        width: 100%;
        box-sizing: border-box;
        padding: 6px 14px 6px 34px;
        font-size: 13.5px;
        color: var(--tx);
        background: var(--bg);
        border: 1px solid var(--bd);
        border-radius: var(--r);
        outline: none;
        transition: all 0.15s ease;
    }

    .search-input:focus {
        border-color: var(--ac);
        box-shadow: var(--shadow-glow);
    }

    .search-input::placeholder {
        color: var(--tx-mt);
    }

    /* ── Category Tabs ── */
    .cat-tabs {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
    }

    .cat-tab {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 14px;
        font-size: 13px;
        font-weight: 500;
        color: var(--tx-sub);
        background: var(--bg);
        border: 1px solid var(--bd);
        border-radius: 3px;
        cursor: pointer;
        font-family: var(--font);
        transition: all 0.12s;
        white-space: nowrap;
    }

    .cat-tab:hover {
        border-color: var(--ac);
        color: var(--ac);
        background: var(--ac-soft);
    }

    .cat-tab.active {
        background: var(--ac);
        color: #fff;
        border-color: var(--ac);
    }

    .cat-tab i {
        font-size: 14px;
    }

    /* ── Tools Grid ── */
    .tools-section {
        margin-bottom: 24px;
    }

    .section-title {
        font-size: 18px;
        font-weight: 650;
        color: var(--tx);
        margin: 0 0 16px;
    }

    .section-title.mt-4 {
        margin-top: 24px;
    }

    .popular-section {
        margin-bottom: 24px;
    }

    .tools-grid-masonry {
        display: flex;
        gap: 10px;
        align-items: flex-start;
    }

    .masonry-col {
        display: flex;
        flex-direction: column;
        gap: 10px;
        flex: 1;
        min-width: 0;
    }

    .tools-grid-masonry.cols-2 { display: flex; }
    .tools-grid-masonry.cols-1 { display: none; }

    /* ── Tool Card ── */
    .tool-card {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 12px;
        text-decoration: none;
        color: inherit;
        border: 1px solid var(--bd-lt);
        border-radius: var(--r);
        background: var(--bg);
        transition: all 0.15s ease-in-out;
    }

    .tool-card.popular {
        background: linear-gradient(135deg, var(--ac-soft) 0%, var(--bg) 100%);
        border-color: var(--ac);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .tool-card.popular:hover {
        background: linear-gradient(135deg, var(--ac-soft) 0%, var(--bg-sub) 100%);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transform: translateY(-1px);
    }

    .tool-card.popular .tool-title {
        font-size: 17px;
        font-weight: 800;
        color: var(--ac);
    }

    .tool-card.popular .tool-header i {
        color: var(--ac);
        font-size: 22px;
    }

    .tool-card:hover {
        border-color: var(--bd);
        background: var(--bg-sub);
        text-decoration: none;
    }

    .tool-header {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--tx);
    }

    .popular-label {
        margin-left: auto;
        font-size: 9px;
        font-weight: 650;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        padding: 2px 5px;
        border-radius: 3px;
        background: var(--ac-soft);
        color: var(--ac);
        border: 1px solid var(--ac);
        user-select: none;
        white-space: nowrap;
        opacity: 0.95;
    }

    .tool-header i {
        font-size: 18px;
        color: var(--tx-sub);
    }

    .tool-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
    }

    .tool-title {
        font-size: 14.5px;
        font-weight: 600;
        color: var(--tx);
    }

    .tool-desc {
        font-size: 14px;
        color: var(--tx-sub);
        line-height: 1.45;
    }

    .tool-tags {
        display: flex;
        gap: 4px;
        margin-top: 2px;
    }

    .tool-tag {
        font-size: 10.5px;
        font-weight: 500;
        padding: 2px 6px;
        border-radius: 2px;
        background: var(--bd-lt);
        color: var(--tx-sub);
    }

    /* ── Trust Strip ── */
    .trust-strip {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 12px 0;
        margin-bottom: 4px;
        border-top: 1px solid var(--bd-lt);
        border-bottom: 1px solid var(--bd-lt);
    }

    .trust-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12.5px;
        color: var(--tx-sub);
        font-weight: 500;
    }

    .trust-item svg {
        color: var(--tx-sub);
        flex-shrink: 0;
    }

    .trust-dot {
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: var(--tx-mt);
        flex-shrink: 0;
    }

    /* ── FAQ ── */
    .faq-section {
        padding: 20px 0 16px;
    }

    .faq-section h2 {
        font-size: 17px;
        font-weight: 650;
        color: var(--tx);
        margin: 0 0 12px;
    }

    .faq-list {
        display: flex;
        flex-direction: column;
        gap: 0;
        border: 1px solid var(--bd-lt);
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
        font-size: 14px;
        font-weight: 600;
        color: var(--tx);
        margin: 0 0 4px;
        line-height: 1.4;
    }

    .faq-item p {
        margin: 0;
        font-size: 13.5px;
        color: var(--tx-sub);
        line-height: 1.55;
    }

    /* ── Donate ── */
    .home-donate {
        max-width: 420px;
        margin: 0 auto;
        padding: 8px 0 0;
    }

    /* ── Empty State ── */
    .empty-state {
        text-align: center;
        padding: 48px 16px;
        color: var(--tx-mt);
    }

    .empty-state i {
        font-size: 32px;
        margin-bottom: 8px;
        display: block;
    }

    .empty-state p {
        font-size: 14px;
        margin: 0;
    }

    /* ── Responsive ── */
    @media (max-width: 900px) {
        .tools-grid-masonry.cols-2 { display: flex; }
    }

    @media (max-width: 540px) {
        .toolbar {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
        }

        .search-wrap {
            max-width: none;
        }

        .tools-grid-masonry.cols-2 { display: none; }
        .tools-grid-masonry.cols-1 { display: flex; }

        .trust-strip {
            gap: 12px;
        }

        .trust-dot {
            display: none;
        }

        .cat-tab {
            padding: 5px 11px;
            font-size: 12.5px;
        }

        .hero h1 {
            font-size: 24px;
        }

        .hero-desc {
            font-size: 14.5px;
        }
    }

    .labs-section {
        margin: 40px 0;
        padding-top: 24px;
        border-top: 1px solid var(--bd-lt);
    }

    .labs-header .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 0px;
    }

    .labs-desc {
        font-size: 14.5px;
        color: var(--tx-sub);
        margin: 0 0 20px 0;
        line-height: 1.5;
    }

    .labs-list {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .lab-card {
        padding: 16px;
        border: 1px solid var(--bd-lt);
        border-radius: var(--r);
        background: var(--bg);
        transition: border-color 0.2s, box-shadow 0.2s;
    }

    .lab-card:hover {
        border-color: var(--bd);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    }

    .lab-meta {
        margin-bottom: 8px;
    }

    .lab-date {
        font-size: 13px;
        font-weight: 500;
        color: var(--tx-sub);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .lab-card-title-link {
        text-decoration: none;
        color: inherit;
        display: inline-block;
        margin-bottom: 12px;
    }

    .lab-title {
        font-size: 20px;
        font-weight: 750;
        color: var(--tx);
        margin: 0;
        line-height: 1.3;
        transition: color 0.15s ease;
    }

    .lab-card-title-link:hover .lab-title {
        color: var(--ac);
    }

    .lab-snippet {
        font-size: 14.5px;
        color: var(--tx-sub);
        line-height: 1.6;
        margin-bottom: 16px;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Formats for rendered HTML inside the snippet */
    :global(.lab-snippet h1, .lab-snippet h2, .lab-snippet h3) {
        font-size: 16px;
        margin: 12px 0 8px;
        color: var(--tx);
        font-weight: 700;
        line-height: 1.3;
    }
    :global(.lab-snippet p) {
        margin: 0 0 12px;
    }
    :global(.lab-snippet p:last-child) {
        margin-bottom: 0;
    }
    :global(.lab-snippet a) {
        color: #2465cb;
        text-decoration: underline;
        text-underline-offset: 3px;
    }
    :global(.lab-snippet strong) {
        font-weight: 700;
        color: var(--tx);
    }
    :global(.lab-snippet code) {
        font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
        font-size: 0.9em;
        background: var(--surface, rgba(0,0,0,0.06));
        padding: 0.2em 0.4em;
        border-radius: 4px;
        color: var(--tx);
    }
    :global(.lab-snippet ul),
    :global(.lab-snippet ol) {
        margin: 0 0 12px 0;
        padding-left: 1.5rem;
    }
    :global(.lab-snippet li) {
        margin-bottom: 4px;
    }
    :global(.lab-snippet blockquote) {
        border-left: 3px solid var(--ac);
        margin: 12px 0;
        padding: 8px 0 8px 12px;
        color: var(--tx-sub);
        font-style: italic;
        background: linear-gradient(to right, var(--bg), transparent);
        border-radius: 0 8px 8px 0;
    }
    :global(.lab-snippet img) {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        margin: 12px 0;
        border: 1px solid var(--bd-lt);
        display: block;
    }
    :global(.lab-snippet pre, .lab-snippet table, .lab-snippet iframe, .lab-snippet hr) {
        display: none !important; /* Hide heavy elements in snippet */
    }

    .lab-read-more {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        font-weight: 600;
        color: var(--ac);
        text-decoration: none;
        transition: color 0.15s;
    }

    .lab-read-more:hover {
        color: #1d52a8;
        text-decoration: underline;
        text-underline-offset: 4px;
    }

    @media (max-width: 540px) {
        .labs-section {
            margin: 32px 0;
        }
        .lab-title {
            font-size: 18px;
        }
        .lab-card {
            padding: 16px;
        }
    }
</style>

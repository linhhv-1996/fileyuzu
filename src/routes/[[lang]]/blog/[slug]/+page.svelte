<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t, langUrl } from '$lib/i18n/config';
    import { tools } from '$lib/config/tools';

    let { data } = $props();
    let dict = $derived($page.data.dict);
    let lang = $derived($page.data.lang || 'en');
    let ctaToolConfig = $derived(data.ctaTool ? tools.find(t => t.slug === data.ctaTool) : null);

    let activeTocId: string = $state('');

    $effect(() => {
        // Re-run this block whenever the user navigates to a new blog post
        const _trigger = data.content;

        const headings = document.querySelectorAll('.article-content h2, .article-content h3');
        const headingsArray = Array.from(headings);
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    let currentId = '';
                    // Iterate in reverse to find the first heading that has scrolled past the top offset
                    for (let i = headingsArray.length - 1; i >= 0; i--) {
                        const heading = headingsArray[i];
                        const rect = heading.getBoundingClientRect();
                        // 150px offset to account for any sticky headers and provide a good reading margin
                        if (rect.top <= 150) {
                            currentId = heading.id;
                            break;
                        }
                    }

                    // If at the very top, default to the first heading
                    if (!currentId && headingsArray.length > 0) {
                        currentId = headingsArray[0].id;
                    }

                    if (currentId && currentId !== activeTocId) {
                        activeTocId = currentId;
                        const activeEl = document.querySelector(`.toc-item a[href="#${activeTocId}"]`) as HTMLElement;
                        const container = document.querySelector('.toc-list') as HTMLElement;
                        if (activeEl && container) {
                            const scrollPos = activeEl.offsetTop - container.offsetTop - (container.clientHeight / 2) + (activeEl.clientHeight / 2);
                            container.scrollTo({ top: scrollPos, behavior: 'smooth' });
                        }
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        // Initial check
        setTimeout(handleScroll, 100);
        
        return () => window.removeEventListener('scroll', handleScroll);
    });
</script>

<Seo title="{data.title} - UploadLess" description={data.description} noHreflang={true} />

<main class="article-page">
    <div class="article-container">
        <div class="article-grid">
            <!-- Left Column: Article -->
            <article class="article-main">
                <!-- Article header -->
                <header class="article-header">
                    <div class="article-meta">
                        <time class="article-date">
                            {new Date(data.date).toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </time>
                    </div>
                    <h1 class="article-title">{data.title}</h1>
                    {#if data.description}
                        <p class="article-description">{data.description}</p>
                    {/if}
                </header>

                <!-- Divider -->
                <hr class="article-divider" />

                <!-- Content -->
                <div class="article-content">
                    {@html data.content}
                </div>

                {#if ctaToolConfig}
                <div class="article-text-cta">
                    <strong>{dict[ctaToolConfig.titleKey] || ctaToolConfig.slug}:</strong> 
                    {dict[ctaToolConfig.shortDescriptionKey]} 
                    <a href={langUrl(lang, `/${ctaToolConfig.slug}`)} class="cta-link">
                        {dict['common.try_now'] || 'Try Now'} &rarr;
                    </a>
                </div>
                {/if}

                <!-- Author Box -->
                <div class="author-box">
                    <div class="author-avatar">
                        <img src="/favicon.svg" alt="J.Julian" />
                    </div>
                    <div class="author-info">
                        <h3 class="author-name">J.Julian</h3>
                        <p class="author-bio">{dict['blog.author_bio']}</p>
                    </div>
                </div>

            </article>

            <!-- Right Column: Sidebar -->
            <aside class="article-sidebar">
                {#if data.toc && data.toc.length > 0}
                <div class="toc-container">
                    <h3 class="toc-title">{dict['blog.toc'] || 'Table of Contents'}</h3>
                    <ul class="toc-list">
                        {#each data.toc as item}
                            <li class="toc-item toc-level-{item.level}">
                                <a href="#{item.id}" class:active={activeTocId === item.id}>{item.text}</a>
                            </li>
                        {/each}
                    </ul>
                </div>
                {/if}

                {#if data.relatedPosts && data.relatedPosts.length > 0}
                    <div class="related-posts">
                        <h3 class="related-title">{dict['blog.also_read'] || 'Also Read'}</h3>
                        <div class="related-list">
                            {#each data.relatedPosts as post}
                                <a href={langUrl(lang, `/blog/${post.slug}`)} class="related-item">
                                    <h4 class="related-item-title">{post.title}</h4>
                                    <time class="related-item-date">{new Date(post.date).toLocaleDateString(lang, { year: 'numeric', month: 'short', day: 'numeric' })}</time>
                                </a>
                            {/each}
                        </div>
                    </div>
                {/if}
            </aside>
        </div>

    </div>
</main>

<style>

    .article-container {
        max-width: 1100px;
        margin: 0 auto;
    }

    /* ── Article Grid ── */
    .article-grid {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 24px;
        align-items: start;
    }

    .article-main {
        min-width: 0;
    }

    /* ── Article Header ── */
    .article-header {
        margin-bottom: 2rem;
    }

    .article-meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1.25rem;
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--ac);
    }


    .article-title {
        font-size: 2.5rem;
        font-weight: 800;
        color: var(--tx);
        margin: 0 0 1rem 0;
        line-height: 1.2;
        letter-spacing: -0.02em;
    }

    .article-description {
        font-size: 1.125rem;
        color: var(--tx-sub);
        margin: 0;
        line-height: 1.5;
    }

    /* ── Divider ── */
    .article-divider {
        border: none;
        border-top: 1px solid var(--bd);
        margin: 1rem 0;
    }

    /* ── Article Content ── */
    .article-content {
        color: var(--tx);
        font-size: 15.5px;
        line-height: 1.5;
    }

    :global(.article-content h2) {
        font-size: 22px;
        font-weight: 700;
        color: var(--tx);
        margin: 1rem 0 1rem 0;
        letter-spacing: -0.02em;
        line-height: 1.3;
    }

    :global(.article-content h3) {
        font-size: 18px;
        font-weight: 700;
        color: var(--tx);
        margin: 1.5rem 0 0.75rem 0;
        letter-spacing: -0.01em;
        line-height: 1.4;
    }

    :global(.article-content h4) {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--tx);
        margin: 1.25rem 0 0.5rem 0;
        line-height: 1.5;
    }

    :global(.article-content p) {
        margin: 0 0 1.25rem 0;
        color: var(--tx);
    }

    :global(.article-content > blockquote > p) {
margin-bottom: 0;
    }

    :global(.article-content ul),
    :global(.article-content ol) {
        margin: 0 0 1.25rem 0;
        padding-left: 1.5rem;
    }

    :global(.article-content li) {
        margin-bottom: 0.5rem;
        line-height: 1.5;
    }

    :global(.article-content a) {
        color: #2465cb;
        text-decoration: underline;
        text-underline-offset: 3px;
        transition: color 0.15s;
    }

    :global(.article-content strong) {
        font-weight: 700;
        color: var(--tx);
    }

    :global(.article-content code) {
        font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
        font-size: 0.9em;
        background: var(--surface, rgba(0,0,0,0.06));
        padding: 0.2em 0.4em;
        border-radius: 4px;
        color: var(--tx);
    }

    :global(.article-content pre) {
        background: var(--surface, rgba(0,0,0,0.06));
        border: 1px solid var(--bd);
        border-radius: 12px;
        padding: 1.25rem;
        overflow-x: auto;
        margin: 1.5rem 0;
        font-size: 0.9em;
        line-height: 1.5;
    }

    :global(.article-content pre code) {
        background: none;
        padding: 0;
        font-size: inherit;
    }

    :global(.article-content blockquote) {
        border-left: 4px solid var(--ac);
        margin: 1.5rem 0;
        padding: 1rem 0 1rem 1.5rem;
        color: var(--tx-sub);
        font-style: italic;
        background: linear-gradient(to right, var(--bg), transparent);
        border-radius: 0 8px 8px 0;
    }

    :global(.article-content hr) {
        border: none;
        border-top: 1px solid var(--bd);
        margin: 1rem 0;
    }

    :global(.article-content img) {
        max-width: 100%;
        height: auto;
        border-radius: 12px;
        margin: 1rem 0;
        border: 1px solid var(--bd);
    }

    /* ── Table ── */
    :global(.article-content table) {
        width: 100%;
        border-collapse: collapse;
        margin: 1.5rem 0;
        font-size: 1rem;
        text-align: left;
        display: block;
        overflow-x: auto;
        white-space: nowrap;
    }

    :global(.article-content th),
    :global(.article-content td) {
        padding: 12px 16px;
        border: 1px solid var(--bd);
    }

    :global(.article-content th) {
        background: var(--surface, rgba(0,0,0,0.04));
        font-weight: 700;
        color: var(--tx);
    }

    :global(.article-content tbody tr:nth-of-type(even)) {
        background: var(--surface, rgba(0,0,0,0.015));
    }

    /* ── Author Box ── */
    .author-box {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        padding: 16px;
        margin-top: 3rem;
        background: var(--bg);
        border: 1px solid var(--bd);
        border-radius: var(--r);
    }

    .author-avatar {
        flex-shrink: 0;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        overflow: hidden;
        background: var(--surface, rgba(0,0,0,0.02));
        border: 1px solid var(--bd);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px;
    }

    .author-avatar img {
        width: 130%;
        height: 130%;
        object-fit: contain;
    }

    .author-info {
        flex-grow: 1;
    }

    .author-name {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--tx);
        margin: 0 0 0.5rem 0;
    }

    .author-bio {
        font-size: 1rem;
        color: var(--tx-sub);
        margin: 0;
        line-height: 1.5;
    }

    /* ── Sidebar & Author Card ── */
    .article-sidebar {
        position: sticky;
        top: 6rem;
    }

    /* ── Text Link CTA ── */
    .article-text-cta {
        margin: 3rem 0;
        padding: 1.25rem 1.5rem;
        background: var(--surface, rgba(0,0,0,0.03));
        border-left: 4px solid var(--ac);
        border-radius: 0 var(--r) var(--r) 0;
        font-size: 1.05rem;
        line-height: 1.5;
        color: var(--tx);
    }
    
    .cta-link {
        color: var(--ac);
        font-weight: 600;
        text-decoration: underline;
        text-underline-offset: 4px;
        transition: color 0.2s;
        margin-left: 0.5rem;
        white-space: nowrap;
    }
    
    .cta-link:hover {
        color: #1d52a8;
    }

    /* ── TOC ── */
    .toc-container {
        background: var(--bg);
        border: 1px solid var(--bd);
        border-radius: var(--r);
        padding: 16px;
        margin-bottom: 15px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        max-height: calc(100vh - 20rem);
        display: flex;
        flex-direction: column;
    }
    
    .toc-title {
        flex-shrink: 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--tx);
        margin: 0 0 1rem 0;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--bd);
    }
    
    .toc-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        overflow-y: auto;
        padding-right: 4px;
        scrollbar-width: thin;
        scrollbar-color: var(--bd) transparent;
    }

    .toc-list::-webkit-scrollbar {
        width: 4px;
    }

    .toc-list::-webkit-scrollbar-track {
        background: transparent;
    }

    .toc-list::-webkit-scrollbar-thumb {
        background-color: var(--bd);
        border-radius: 4px;
    }
    
    .toc-item {
        line-height: 1.4;
    }
    
    .toc-level-2 {
        padding-left: 0;
    }
    
    .toc-level-3 {
        padding-left: 1rem;
        font-size: 0.9em;
    }
    
    .toc-item a {
        color: var(--tx-sub);
        text-decoration: none;
        transition: color 0.2s ease;
        display: inline-block;
    }
    
    .toc-item a:hover {
        color: var(--ac);
    }
    
    .toc-item a.active {
        color: var(--ac);
        font-weight: 600;
    }

    /* ── Related Posts ── */
    .related-posts {
        margin-top: 15px;
        background: var(--bg);
        border: 1px solid var(--bd);
        border-radius: var(--r);
        padding: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    }

    .related-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--tx);
        margin: 0 0 1rem 0;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--bd);
    }

    .related-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .related-item {
        display: flex;
        flex-direction: column;
        text-decoration: none;
        color: inherit;
        transition: transform 0.2s ease;
    }

    .related-item-title {
        font-size: 13px;
        font-weight: 400;
        color: var(--tx);
        margin: 0 0 0.25rem 0;
        line-height: 1.4;
        transition: color 0.15s ease;
    }


    .related-item-date {
        font-size: 12px;
        color: var(--tx-sub);
    }

    /* ── Responsive ── */
    @media (max-width: 900px) {
        .article-grid {
            grid-template-columns: 1fr;
            gap: 24px;
        }

        .article-sidebar {
            position: static;
        }

        .toc-container {
            display: none;
        }
    }

    @media (max-width: 640px) {
        .author-box {
            flex-direction: column;
            text-align: center;
            padding: 16px;
        }

        .article-title {
            font-size: 2rem;
        }
    }
</style>

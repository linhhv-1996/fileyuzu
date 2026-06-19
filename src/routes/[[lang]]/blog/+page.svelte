<script lang="ts">
    import Seo from "$lib/components/Seo.svelte";
    import { page } from "$app/stores";
    import { t, langUrl } from "$lib/i18n/config";

    let { data } = $props();
    let dict = $derived($page.data.dict);
    let lang = $derived($page.data.lang || "en");
    let posts = $derived(data.posts || []);
</script>

<Seo
    title={t("common.blog", dict) || "Blog"}
    description={t("common.blog", dict) || "Blog"}
/>

<div class="blog-container">
    <section class="blog-hero">
        <h1 class="hero-title">{t("common.blog", dict) || "Blog"}</h1>
        <p class="hero-subtitle">
            {t("blog.subtitle", dict) || "Discover our latest updates, guides, and stories."}
        </p>
    </section>

    <section class="posts-grid">
        {#each posts as post}
            <a href={langUrl(lang, `/blog/${post.slug}`)} class="post-card">
                <div class="post-card-inner">
                    {#if post.date}
                        <div class="post-meta">
                            <span class="post-date">
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    ><rect
                                        x="3"
                                        y="4"
                                        width="18"
                                        height="18"
                                        rx="2"
                                        ry="2"
                                    ></rect><line x1="16" y1="2" x2="16" y2="6"
                                    ></line><line x1="8" y1="2" x2="8" y2="6"
                                    ></line><line x1="3" y1="10" x2="21" y2="10"
                                    ></line></svg
                                >
                                {new Date(post.date).toLocaleDateString(lang, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                    {/if}
                    <h2 class="post-title">{post.title || post.slug}</h2>
                    {#if post.description}
                        <p class="post-desc">{post.description}</p>
                    {/if}
                    <div class="post-footer">
                        <span class="read-more">{t("blog.read_article", dict) || "Read article"} &rarr;</span>
                    </div>
                </div>
            </a>
        {/each}
    </section>
</div>

<style>
    .blog-container {
        /* max-width: 1000px; */
        margin: 0 auto;
        padding: 15px 0px 80px;
    }

    .blog-hero {
        text-align: center;
        margin-bottom: 40px;
    }

    .hero-title {
        font-size: clamp(36px, 5vw, 56px);
        font-weight: 800;
        color: var(--tx);
        margin: 0 0 16px 0;
        line-height: 1.1;
        letter-spacing: -0.03em;
    }

    .hero-subtitle {
        font-size: 18px;
        color: var(--tx-sub);
        max-width: 600px;
        margin: 0 auto;
        line-height: 1.6;
    }

    .posts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 12px;
    }

    .post-card {
        display: flex;
        flex-direction: column;
        text-decoration: none;
        background: var(--bg);
        border: 1px solid var(--bd);
        border-radius: 8px;
        transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
        position: relative;
        overflow: hidden;
    }

    .post-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
        border-color: var(--bd-lt);
    }

    .post-card-inner {
        padding: 24px;
        display: flex;
        flex-direction: column;
        height: 100%;
        box-sizing: border-box;
    }

    .post-meta {
        margin-bottom: 16px;
    }

    .post-date {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 600;
        color: var(--ac);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        background: var(--surface, rgba(0, 0, 0, 0.04));
        padding: 4px 10px;
        border-radius: 6px;
    }

    .post-title {
        font-size: 20px;
        font-weight: 700;
        color: var(--tx);
        margin: 0 0 12px 0;
        line-height: 1.4;
        transition: color 0.2s ease;
    }

    .post-card:hover .post-title {
        color: var(--ac);
    }

    .post-desc {
        font-size: 15px;
        color: var(--tx-sub);
        line-height: 1.6;
        margin: 0 0 24px 0;
        flex-grow: 1;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .post-footer {
        display: flex;
        align-items: center;
        margin-top: auto;
        padding-top: 16px;
        border-top: 1px solid var(--bd-lt);
        color: var(--tx-sub);
        font-size: 14px;
        font-weight: 500;
    }

    .read-more {
        color: var(--ac);
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
        transition: gap 0.2s;
    }

    .post-card:hover .read-more {
        gap: 10px;
    }

    @media (max-width: 640px) {
        .posts-grid {
            grid-template-columns: 1fr;
        }
    }
</style>

<script lang="ts">
    import { page } from "$app/stores";
    import { SUPPORTED_LANGUAGES, langUrl } from "$lib/i18n/config";
    import { tools } from "$lib/config/tools";

    let {
        title,
        description,
    } = $props<{
        title: string;
        description?: string;
    }>();

    let currentLang = $derived(($page.data.lang || 'en').toLowerCase());
    let origin = $derived($page.url.origin);
    let pathname = $derived($page.url.pathname);
    let canonicalPathname = $derived(pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname);

    let basePath = $derived.by(() => {
        if (currentLang === 'en') {
            return pathname;
        }
        if (pathname === `/${currentLang}` || pathname.startsWith(`/${currentLang}/`)) {
            return pathname.substring(currentLang.length + 1) || '/';
        }
        return pathname;
    });

    let slug = $derived(basePath === "/" ? "" : basePath.replace(/^\//, ""));
    let toolConfig = $derived(tools.find((t) => t.slug === slug));
    let allowedMarkets = $derived(toolConfig?.markets);

    let ogImageUrl = $derived(`${origin}/og/${currentLang}.png`);
</script>

<svelte:head>
    <title>{title}</title>
    {#if description}
        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
        <meta name="twitter:description" content={description} />
    {/if}
    
    <!-- Open Graph / Social -->
    <meta property="og:title" content={title} />
    <meta property="og:image" content={ogImageUrl} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="{origin}{pathname}" />
    
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:image" content={ogImageUrl} />

    <!-- Canonical URL -->
    <link rel="canonical" href="{origin}{canonicalPathname}" />

    {#if !allowedMarkets || allowedMarkets.length > 1}
        {#each SUPPORTED_LANGUAGES as lang}
            {#if !allowedMarkets || allowedMarkets.includes(lang.code)}
                {@const targetPath = langUrl(lang.code, basePath)}
                {@const finalPath = targetPath.endsWith('/') && targetPath.length > 1 ? targetPath.slice(0, -1) : targetPath}
                <link rel="alternate" hreflang={lang.code} href="{origin}{finalPath}" />
            {/if}
        {/each}
        {#if !allowedMarkets || allowedMarkets.includes('en')}
            {@const defaultPath = langUrl('en', basePath)}
            {@const finalDefaultPath = defaultPath.endsWith('/') && defaultPath.length > 1 ? defaultPath.slice(0, -1) : defaultPath}
            <link rel="alternate" hreflang="x-default" href="{origin}{finalDefaultPath}" />
        {/if}
    {/if}
</svelte:head>

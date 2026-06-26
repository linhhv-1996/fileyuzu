<script lang="ts">
    import "../../app.css";
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
    // import { afterNavigate } from '$app/navigation';
    // import { page } from '$app/stores';
    // import { tick } from 'svelte';

    let { children } = $props();

    // afterNavigate(async () => {
    //     if (typeof window === 'undefined') return;
    //     if (typeof (window as any).gtag !== 'function') return;

    //     await tick(); 

    //     console.log('[GA]', {
    //         page_location: $page.url.href,
    //         page_path: $page.url.pathname,
    //         page_title: document.title,
    //         page_referrer: document.referrer
    //     });

    //     (window as any).gtag('event', 'page_view', {
    //         page_location: $page.url.href,
    //         page_path: $page.url.pathname,
    //         page_title: document.title,
    //         page_referrer: document.referrer
    //     });
    // });
</script>

<Header />
<div class="page">
    {@render children()}
</div>
<Footer />

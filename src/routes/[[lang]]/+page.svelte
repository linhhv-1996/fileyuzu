<script lang="ts">
    import { page } from '$app/stores';
    import { langUrl } from '$lib/i18n/config';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';

    let lang = $derived($page.params.lang || 'en');
    
    $effect(() => {
        if (browser) {
            goto(langUrl(lang, '/compress-video'));
        }
    });
</script>

<div style="padding: 40px; text-align: center; color: var(--tx-sub);">
    Redirecting to Video Compressor...
    <br><br>
    <a href={langUrl(lang, '/compress-video')} style="color: var(--ac);">Click here if you are not redirected</a>
</div>

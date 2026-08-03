<script lang="ts">
    import { page } from '$app/stores';
    import { t, langUrl, SUPPORTED_LANGUAGES } from '$lib/i18n/config';

    let dict = $derived($page.data.dict);
    let lang = $derived($page.data.lang || 'en');
</script>

<footer class="ftr">
    <div class="ftr-inner">
        <span class="ftr-copy">{t('common.footer.copyright', dict)}</span>
        <div class="ftr-links">
            <a href={langUrl(lang, '/about')}>{t('common.footer.about', dict)}</a>
            <a href={langUrl(lang, '/privacy')}>{t('common.footer.privacy', dict)}</a>
            <a href={langUrl(lang, '/term')}>{t('common.footer.terms', dict)}</a>
            <a href={langUrl(lang, '/contact')}>{t('common.footer.contact', dict)}</a>
            <a href="/sitemap.xml">Sitemap</a>
        </div>
        <div class="ftr-links ftr-langs" style="margin-top: 1rem; display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
            {#each SUPPORTED_LANGUAGES as l}
                <a href={l.code === 'en' ? '/' : `/${l.code}`} class:active={lang === l.code}>{l.name}</a>
            {/each}
        </div>
    </div>
</footer>

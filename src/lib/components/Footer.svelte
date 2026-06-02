<script lang="ts">
    import { page } from '$app/stores';
    import { t, langUrl } from '$lib/i18n/config';

    let dict = $derived($page.data.dict);
    let lang = $derived($page.data.lang || 'en');
</script>

<footer class="ftr">
    <div class="ftr-inner">
        <span class="ftr-copy">{t('common.footer.copyright', dict)}</span>
        <div class="ftr-links">
            <a href={langUrl(lang, '/privacy')}>{t('common.footer.privacy', dict)}</a>
            <a href={langUrl(lang, '/term')}>{t('common.footer.terms', dict)}</a>
            <a href={langUrl(lang, '/contact')}>{t('common.footer.contact', dict)}</a>
        </div>
    </div>
</footer>

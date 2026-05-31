<script lang="ts">
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';

    let dict = $derived($page.data.dict);
</script>

<footer class="ftr">
    <div class="ftr-inner">
        <span class="ftr-copy">{t('common.footer.copyright', dict)}</span>
        <div class="ftr-links">
            <a href="#">{t('common.footer.privacy', dict)}</a>
            <a href="#">{t('common.footer.terms', dict)}</a>
            <a href="#">{t('common.footer.contact', dict)}</a>
        </div>
    </div>
</footer>

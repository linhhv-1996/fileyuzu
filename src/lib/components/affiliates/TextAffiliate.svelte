<script lang="ts">
    import { page } from '$app/stores';
    import affiliateData from '$lib/config/affiliate.json';

    let { offer = 'elevenlabs' } = $props<{ offer?: keyof typeof affiliateData }>();
    
    let lang = $derived($page.params.lang || 'en');
    let offerData = $derived(affiliateData[offer as keyof typeof affiliateData]);
    // @ts-ignore
    let affiliate = $derived(offerData ? (offerData[lang] || offerData['en']) : null);
</script>

{#if affiliate && affiliate.text}
<div class="text-affiliate">
    <a href={affiliate.link} target="_blank" rel="noopener noreferrer">
        {affiliate.text}
    </a>
</div>
{/if}

<style>
    .text-affiliate {
        margin-top: 8px;
        width: 100%;
    }
    
    .text-affiliate a {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 6px;
        font-size: 13.5px;
        font-weight: 600;
        color: var(--ac);
        text-decoration: none;
        padding: 6px 12px;
        background: rgba(74, 144, 217, 0.08);
        border: 1px solid rgba(74, 144, 217, 0.3);
        border-radius: 0;
        transition: all 0.2s ease;
        width: 100%;
        box-sizing: border-box;
    }
    
    .text-affiliate a:hover {
        background: rgba(74, 144, 217, 0.15);
        border-color: var(--ac);
        box-shadow: 0 4px 12px rgba(74, 144, 217, 0.1);
        transform: translateY(-1px);
    }
</style>

<script lang="ts">
    import { page } from '$app/stores';
    import affiliateData from '$lib/config/affiliate.json';

    let { offer = 'nordvpn' } = $props<{ offer?: keyof typeof affiliateData }>();

    let lang = $derived($page.params.lang || 'en');
    let offerData = $derived(affiliateData[offer as keyof typeof affiliateData]);
    let affiliate = $derived(offerData ? (offerData[lang as keyof typeof offerData] || offerData['en']) : null);
</script>

{#if affiliate}
<!-- svelte-ignore a11y_invalid_attribute -->
<a href={affiliate.link} target="_blank" rel="noopener noreferrer" class="affiliate-box">
    <span class="badge">{affiliate.badge}</span>
    <div class="content">
        <strong class="brand">{affiliate.brand}</strong>
        <p class="desc">{affiliate.desc}</p>
    </div>
    <div class="cta-btn">{affiliate.btn || ''}</div>
</a>
{/if}

<style>
    .affiliate-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 250px;
        box-sizing: border-box;
        background: var(--ac-soft);
        border: 1px solid rgba(74, 144, 217, 0.25);
        border-radius: var(--r);
        padding: 16px;
        margin: 0px auto;
        gap: 12px;
        text-decoration: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        text-align: center;
    }

    .affiliate-box:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(74, 144, 217, 0.15);
        border-color: rgba(74, 144, 217, 0.5);
        text-decoration: none;
    }

    .badge {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--ac);
        background: #fff;
        border: 1px solid rgba(74, 144, 217, 0.2);
        padding: 4px 10px;
        border-radius: 20px;
        letter-spacing: 0.5px;
    }

    .content {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        overflow: hidden;
    }

    .brand {
        color: var(--tx);
        font-size: 18px;
        font-weight: 700;
    }

    .desc {
        color: var(--tx-sub);
        font-size: 14px;
        margin: 0;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .cta-btn {
        background: var(--ac);
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        padding: 8px 24px;
        border-radius: var(--r);
        width: 100%;
        box-sizing: border-box;
        transition: background 0.2s;
    }
    
    .affiliate-box:hover .cta-btn {
        background: var(--ac-hover, #3a7bc8);
    }
</style>

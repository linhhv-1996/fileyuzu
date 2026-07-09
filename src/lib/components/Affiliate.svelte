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
        <span class="desc"> — {affiliate.desc}</span>
    </div>
</a>
{/if}

<style>
    .affiliate-box {
        display: flex;
        align-items: center;
        background: var(--ac-soft);
        border: 1px solid rgba(74, 144, 217, 0.25);
        border-radius: var(--r);
        padding: 10px 14px;
        margin: 20px 0;
        gap: 12px;
        text-decoration: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
        transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    }

    .affiliate-box:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(74, 144, 217, 0.12);
        border-color: rgba(74, 144, 217, 0.4);
        text-decoration: none;
    }

    .badge {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--ac);
        background: #fff;
        border: 1px solid rgba(74, 144, 217, 0.2);
        padding: 2px 6px;
        border-radius: var(--r);
        letter-spacing: 0.5px;
    }

    .content {
        flex: 1;
        font-size: 14px;
        color: var(--tx);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .brand {
        color: var(--tx);
        font-weight: 600;
    }

    .desc {
        color: var(--tx-sub);
    }

    @media (max-width: 600px) {
        .affiliate-box {
            flex-wrap: wrap;
            padding: 12px;
            gap: 10px;
        }
        .content {
            white-space: normal;
            min-width: 100%;
            order: 3;
            margin-top: 2px;
        }
    }
</style>

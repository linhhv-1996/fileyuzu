<script lang="ts">
    import { onMount } from "svelte";
    // Bạn có thể truyền adUnitId hoặc thay đổi trực tiếp trong iframe
    let { adUnitId = "2447450" } = $props(); // Bạn có thể thay đổi ID này

    let loadAd = $state(false);

    onMount(() => {
        // Đẩy việc load iframe ra khỏi luồng render chính của trình duyệt
        // Giúp web mượt mà ngay khi mới mở mà vẫn load được ads (không cần đợi scroll)
        const timer = setTimeout(() => {
            loadAd = true;
        }, 500);
        return () => clearTimeout(timer);
    });
</script>

<div class="aads-banner-container">
    {#if adUnitId && loadAd}
        <iframe
            data-aa={adUnitId}
            src={`//ad.a-ads.com/${adUnitId}?size=250x250`}
            style="width:250px; height:250px; border: 1px solid var(--bd-lt, #ccc); border-radius: 3px; padding:0; overflow:hidden; background-color: transparent;"
            allowtransparency={true}
            title="AAds Banner"
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        ></iframe>
    {:else}
        <!-- Giữ sẵn không gian (placeholder) để không bị giật khung hình (Cumulative Layout Shift) -->
        <div style="width:250px; height:250px;"></div>
    {/if}
</div>

<style>
    .aads-banner-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        margin-top: 0;
    }
</style>

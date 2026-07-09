<script lang="ts">
    // Bạn có thể truyền adUnitId hoặc thay đổi trực tiếp trong iframe
    let { adUnitId = "2447450" } = $props(); // Bạn có thể thay đổi ID này
</script>

<div class="aads-banner-container">
    {#if adUnitId}
        <iframe
            data-aa={adUnitId}
            src={`//ad.a-ads.com/${adUnitId}?size=250x250`}
            style="width:250px; height:250px; border: 1px solid var(--bd-lt, #ccc); border-radius: 3px; padding:0; overflow:hidden; background-color: transparent;"
            allowtransparency={true}
            title="AAds Banner"
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        ></iframe>
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

<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import Audio2Text from '$lib/components/tools/Audio2Text.svelte';
    import HowToUse from '$lib/components/HowToUse.svelte';
    import WhyUse from '$lib/components/WhyUse.svelte';
    import Faq from '$lib/components/Faq.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    import Affiliate from '$lib/components/Affiliate.svelte';
    import Adcash250Banner from '$lib/components/Ads/Adcash250Banner.svelte';
    
    let dict = $derived($page.data.dict);
    
    let videoTexts = $derived({
        uploadTitle: t('video_to_text.upload.title', dict) || 'Upload Video',
        uploadSubtitle: t('video_to_text.upload.subtitle', dict) || 'MP4, MOV, WebM, MKV, AVI, etc.',
        btnSelect: t('video_to_text.upload.btn_select', dict) || 'Select File',
        hint: t('video_to_text.upload.hint', dict) || '',
        btnSample: t('video_to_text.btn.load_sample', dict) || '',
        
        settings: {
            model: t('video_to_text.settings.model', dict) || 'AI Model',
            multilingual: t('video_to_text.settings.multilingual', dict) || 'Multilingual',
            language: t('video_to_text.settings.language', dict) || 'Language'
        },
        btn: {
            transcribe: t('video_to_text.btn.transcribe', dict) || 'Transcribe to Text',
            download: t('video_to_text.btn.download', dict) || 'Download Text',
            start_over: t('video_to_text.btn.start_over', dict) || 'Start Over',
        },
        proc: {
            loading_model: t('video_to_text.proc.loading_model', dict) || 'Loading AI Model...',
            transcribing: t('video_to_text.proc.transcribing', dict) || 'Transcribing video...',
        },
        results: {
            transcription: t('video_to_text.results.transcription', dict) || 'Transcription Result',
            no_speech: t('video_to_text.results.no_speech', dict) || 'No speech detected.',
        }
    });
    
    let relatedTools = $derived(getRelatedTools('video-to-text') || []);
</script>

<Seo title={t('video_to_text.seo.title', dict) || 'Video to Text Converter (Whisper AI)'} description={t('video_to_text.seo.description', dict) || 'Convert your video files into text accurately using AI directly in your browser. No server uploads needed.'} />

<div class="hero">
    <h1>{t('video_to_text.hero.title', dict) || 'Video to Text AI Converter'}</h1>
    <p>{t('video_to_text.hero.description', dict) || 'Transcribe speech to text offline in your browser using Whisper AI.'}</p>
</div>

<div class="grid">
    <main>
        <Audio2Text texts={videoTexts} sampleAudioPath="/Wintershall-DEA_Media_360p.mp4" />
        
        <HowToUse 
            title={t('video_to_text.how_to_use.title', dict) || 'How to Transcribe Video'} 
            steps={Array.isArray(t('video_to_text.how_to_use.steps', dict)) ? t('video_to_text.how_to_use.steps', dict) : [
                { title: 'Upload File', content: 'Select a video file from your device.' },
                { title: 'Select Settings', content: 'Choose the AI model size and language options.' },
                { title: 'Transcribe', content: 'Click "Transcribe to Text". The AI model will download to your browser and process the video.' },
                { title: 'Download', content: 'Once completed, you can copy the text or download it as a .txt file.' }
            ]} 
        />
        
        <WhyUse 
            title={t('video_to_text.why_use.title', dict) || 'Why use our Video to Text tool?'} 
            benefits={Array.isArray(t('video_to_text.why_use.benefits', dict)) ? t('video_to_text.why_use.benefits', dict) : [
                { title: '100% Private & Secure', content: 'All processing happens locally in your browser. Your files are never uploaded to any server.' },
                { title: 'Powered by AI', content: 'Uses the state-of-the-art Whisper AI model for highly accurate transcriptions.' },
                { title: 'Free & Unlimited', content: 'No subscription required, and no limits on file length or usage.' },
                { title: 'Multilingual Support', content: 'Can transcribe multiple languages or translate them to English.' }
            ]} 
        />
        
        <Faq 
            title={t('video_to_text.faq.title', dict) || 'Frequently Asked Questions'} 
            items={Array.isArray(t('video_to_text.faq.items', dict)) ? t('video_to_text.faq.items', dict) : [
                { question: 'Is my data safe?', answer: 'Yes, your video never leaves your device. Everything is processed locally in your browser.' },
                { question: 'Why does it say "Loading AI Model"?', answer: 'The first time you use the tool, it needs to download the Whisper AI model to your browser. This may take a few seconds depending on your internet speed.' },
                { question: 'What file formats are supported?', answer: 'We support all common video formats that your browser can read, such as MP4, WebM, MKV, MOV, and AVI.' }
            ]} 
        />
    </main>

    <!-- SIDEBAR (desktop only via CSS) -->
    <aside class="sidebar">
        <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} />
        <div class="mt-4">
            <Adcash250Banner />
        </div>
    </aside>
</div>

<!-- SIDEBAR MOBILE (below main content on mobile) -->
<div class="sidebar-mobile">
    <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} mobile={true} />
</div>

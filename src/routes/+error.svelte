<script lang="ts">
    import { page } from '$app/stores';
    import Seo from '$lib/components/Seo.svelte';
</script>

<Seo title="Page Not Found" description="The page you're looking for doesn't exist." isToolPage={false} />

<div class="error-page">
    <div class="visual-container">
        <!-- Cinematic Glowing Orbs -->
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        
        <!-- Premium Frosted Glass Card -->
        <div class="glass-card">
            <div class="icon-wrapper">
                <!-- Cute Sad File Icon -->
                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" class="premium-icon">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" class="draw-anim"/>
                    <polyline points="14 2 14 8 20 8" class="fade-in-anim"/>
                    <!-- Sad eyes (curved down) -->
                    <path d="M8.5 12 Q9.5 13 10.5 12" class="bounce-anim-1"/>
                    <path d="M13.5 12 Q14.5 13 15.5 12" class="bounce-anim-2"/>
                    <!-- Sad mouth -->
                    <path d="M10 16 Q12 14.5 14 16" class="bounce-anim-3"/>
                </svg>
            </div>
            <div class="glow-shadow"></div>
        </div>
    </div>

    <a href="/" class="btn-return">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Home
    </a>
</div>

<style>
    .error-page {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 85vh;
        overflow: hidden;
        gap: 1rem;
        padding: 2rem;
    }

    .visual-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 320px;
        height: 320px;
    }

    /* Cinematic Ambient Lighting */
    .orb {
        position: absolute;
        width: 220px;
        height: 220px;
        border-radius: 50%;
        filter: blur(50px);
        opacity: 0.5;
        animation: drift 12s ease-in-out infinite alternate;
        z-index: 0;
        pointer-events: none;
    }

    .orb-1 {
        /* background: linear-gradient(135deg, #00C9FF, #92FE9D); */
        top: -10%;
        left: -10%;
        animation-delay: 0s;
    }

    .orb-2 {
        /* background: linear-gradient(135deg, #f6d365, #fda085); */
        bottom: -10%;
        right: -10%;
        animation-delay: -4s;
    }

    .orb-3 {
        /* background: linear-gradient(135deg, #a18cd1, #fbc2eb); */
        top: 30%;
        left: 20%;
        width: 160px;
        height: 160px;
        opacity: 0.4;
        animation-delay: -8s;
    }

    /* Exquisite Frosted Glass Card */
    .glass-card {
        position: relative;
        z-index: 10;
        width: 220px;
        height: 220px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(128, 128, 128, 0.08);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(128, 128, 128, 0.15);
        border-radius: 48px;
        box-shadow: 
            0 30px 60px rgba(0, 0, 0, 0.05), 
            inset 0 0 0 1px rgba(255, 255, 255, 0.1);
        animation: hover-float 6s ease-in-out infinite;
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
    }

    .glass-card:hover {
        transform: scale(1.05) translateY(-10px);
        box-shadow: 
            0 40px 80px rgba(0, 0, 0, 0.08), 
            inset 0 0 0 1px rgba(255, 255, 255, 0.2);
    }

    .icon-wrapper {
        color: var(--tx, #1a1a1a);
        filter: drop-shadow(0 10px 15px rgba(0,0,0,0.08));
    }

    .premium-icon {
        width: 100px;
        height: 100px;
    }

    .glow-shadow {
        position: absolute;
        bottom: -45px;
        width: 120px;
        height: 20px;
        background: rgba(0, 0, 0, 0.06);
        border-radius: 50%;
        filter: blur(8px);
        animation: shadow-scale 6s ease-in-out infinite;
    }

    /* Premium Button */
    .btn-return {
        position: relative;
        z-index: 10;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 42px;
        background: var(--tx, #111);
        color: var(--bg, #fff);
        border-radius: 999px;
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 0.2px;
        text-decoration: none;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        overflow: hidden;
    }
    
    .btn-return::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
        transition: all 0.6s ease;
    }

    .btn-return:hover {
        transform: translateY(-4px);
        box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        text-decoration: none;
    }

    .btn-return:hover::after {
        left: 100%;
    }

    .btn-return:active {
        transform: translateY(0);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    /* Keyframe Animations */
    @keyframes hover-float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-16px) rotate(2deg); }
    }

    @keyframes shadow-scale {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(0.7); opacity: 0.4; }
    }

    @keyframes drift {
        0% { transform: scale(1) translate(0, 0) rotate(0deg); }
        50% { transform: scale(1.15) translate(40px, -20px) rotate(45deg); }
        100% { transform: scale(0.9) translate(-20px, 30px) rotate(90deg); }
    }

    /* SVG Animations */
    .draw-anim {
        stroke-dasharray: 80;
        stroke-dashoffset: 80;
        animation: draw 2.5s ease-out forwards;
    }
    
    .fade-in-anim {
        opacity: 0;
        animation: fade-in 1.5s ease-out 1s forwards;
    }
    
    .bounce-anim-1 { animation: mini-bounce 3s ease-in-out infinite alternate; animation-delay: 0s; }
    .bounce-anim-2 { animation: mini-bounce 3s ease-in-out infinite alternate; animation-delay: 0.2s; }
    .bounce-anim-3 { animation: mini-bounce 3s ease-in-out infinite alternate; animation-delay: 0.4s; }

    @keyframes draw {
        100% { stroke-dashoffset: 0; }
    }

    @keyframes fade-in {
        100% { opacity: 1; }
    }

    @keyframes mini-bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
    }
</style>

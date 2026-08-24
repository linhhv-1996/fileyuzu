import { logger } from './eventLogger';

export type GlobalAdsConfig = {
    cooldownSeconds: number;   // Thời gian chờ tối thiểu giữa 2 lần hiện ads (giây) - Tính chung cho tất cả các màn
    defaultProbability: number;// Xác suất hiện ads mặc định nếu không truyền vào (từ 0.0 đến 1.0)
    maxPerSession?: number;    // Tối đa số lần hiện ads trong 1 session (tổng cộng tất cả các màn)
};

export type AdsState = {
    count: number;
    lastShown: number;
};

class AdsManager {
    private config: GlobalAdsConfig;
    private sessionKey = '_app_prefs_v1'; // Đặt tên giả để che giấu mục đích lưu trữ ads
    
    constructor(config: GlobalAdsConfig) {
        this.config = config;
    }

    private getState(): AdsState {
        if (typeof window === 'undefined') return { count: 0, lastShown: 0 };
        const stored = sessionStorage.getItem(this.sessionKey);
        try {
            return stored ? JSON.parse(stored) : { count: 0, lastShown: 0 };
        } catch {
            return { count: 0, lastShown: 0 };
        }
    }

    private saveState(state: AdsState) {
        if (typeof window === 'undefined') return;
        sessionStorage.setItem(this.sessionKey, JSON.stringify(state));
    }

    /**
     * Giải mã base64 URLs để tránh bị adblock nhận diện tĩnh
     */
    private decodeUrl(encodedUrl: string): string {
        try {
            return atob(encodedUrl);
        } catch {
            return encodedUrl; // Nếu không phải base64 thì trả về gốc
        }
    }

    public getAdUrl(targetUrls: string | string[], probabilityOverride?: number): string | null {
        if (typeof window === 'undefined' || !targetUrls) return null;
        const urls = Array.isArray(targetUrls) ? targetUrls : [targetUrls];
        if (urls.length === 0) return null;

        const state = this.getState();
        const now = Date.now();

        if (this.config.maxPerSession && state.count >= this.config.maxPerSession) return null;
        const timeSinceLast = (now - state.lastShown) / 1000;
        if (timeSinceLast < this.config.cooldownSeconds) return null;

        const prob = probabilityOverride !== undefined ? probabilityOverride : this.config.defaultProbability;
        if (Math.random() > prob) return null;

        const rawUrl = urls[Math.floor(Math.random() * urls.length)];
        return this.decodeUrl(rawUrl);
    }

    public recordAdShown(placement: string = 'unknown') {
        const state = this.getState();
        this.updateState(state, Date.now());
        logger.log('ad_trigger_success', { placement, method: 'native_link' });
    }

    public triggerAd(targetUrls: string | string[], placement: string = 'unknown', probabilityOverride?: number): boolean {
        // Log intent (User clicked a button that has ads attached)
        const urls = Array.isArray(targetUrls) ? targetUrls : [targetUrls];
        logger.log('ad_intent', { placement, total_urls: urls.length });

        const url = this.getAdUrl(targetUrls, probabilityOverride);
        if (!url) {
            logger.log('ad_skip', { placement, reason: 'logic_check_failed' });
            return false;
        }

        try {
            // Dùng trick mở window rỗng trước để bypass một số popup blocker
            const newWindow = window.open('', '_blank');
            
            if (newWindow) {
                newWindow.opener = null;
                newWindow.location.href = url;
                
                this.recordAdShown(placement);
                return true;
            } else {
                const a = document.createElement('a');
                a.href = url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                this.recordAdShown(placement);
                return true;
            }
        } catch (e) {
            console.error('Action aborted');
            logger.log('ad_trigger_error', { placement });
            return false;
        }
    }

    private updateState(state: AdsState, now: number) {
        state.count += 1;
        state.lastShown = now;
        this.saveState(state);
    }
}

// Khởi tạo AdsManager quản lý giới hạn CHUNG toàn site
export const adsManager = new AdsManager({
    cooldownSeconds: 30,         // Cách <n> giây mới nhảy popup 1 lần bất kể ở màn nào
    defaultProbability: 1,    // <n>% cơ hội nhảy ads (nếu màn không truyền xác suất riêng)
    maxPerSession: 100           // 1 phiên truy cập ăn tối đa <n> ads tổng cộng
});

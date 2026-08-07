import { logger } from './eventLogger';

export type GlobalAdsConfig = {
    cooldownMinutes: number;   // Thời gian chờ tối thiểu giữa 2 lần hiện ads (phút) - Tính chung cho tất cả các màn
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

    /**
     * Hàm trigger ads. BẮT BUỘC phải được gọi đồng bộ (synchronous) 
     * bên trong event handler (ví dụ on:click).
     * 
     * @param targetUrls 1 URL (string) hoặc 1 danh sách URLs (mảng string) riêng cho màn này. Nên mã hóa base64.
     * @param probabilityOverride Tùy chỉnh xác suất riêng cho màn này (0.0 -> 1.0).
     * @returns boolean true nếu ads được mở thành công.
     */
    public triggerAd(targetUrls: string | string[], placement: string = 'unknown', probabilityOverride?: number): boolean {
        if (typeof window === 'undefined' || !targetUrls) return false;

        const urls = Array.isArray(targetUrls) ? targetUrls : [targetUrls];
        if (urls.length === 0) return false;

        // Log intent (User clicked a button that has ads attached)
        logger.log('ad_intent', { placement, total_urls: urls.length });

        const state = this.getState();
        const now = Date.now();

        // 1. Kiểm tra CAP (số lần tối đa mỗi session trên TOÀN SITE)
        if (this.config.maxPerSession && state.count >= this.config.maxPerSession) {
            logger.log('ad_skip', { placement, reason: 'cap_reached' });
            return false;
        }

        // 2. Kiểm tra Cooldown (thời gian nghỉ giữa các lần hiển thị trên TOÀN SITE)
        const timeSinceLast = (now - state.lastShown) / (1000 * 60);
        if (timeSinceLast < this.config.cooldownMinutes) {
            logger.log('ad_skip', { placement, reason: 'cooldown' });
            return false;
        }

        // 3. Kiểm tra Xác suất (Probability)
        const prob = probabilityOverride !== undefined ? probabilityOverride : this.config.defaultProbability;
        if (Math.random() > prob) {
            logger.log('ad_skip', { placement, reason: 'probability' });
            return false;
        }

        // Chọn ngẫu nhiên 1 link từ danh sách link của màn này và giải mã
        const rawUrl = urls[Math.floor(Math.random() * urls.length)];
        const url = this.decodeUrl(rawUrl);

        try {
            const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
            
            if (newWindow) {
                // Popup thành công
                this.updateState(state, now);
                logger.log('ad_trigger_success', { placement, method: 'window_open' });
                return true;
            } else {
                // Popup bị chặn -> Thử phương pháp dự phòng
                const a = document.createElement('a');
                a.href = url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                this.updateState(state, now);
                logger.log('ad_trigger_success', { placement, method: 'fallback_click' });
                return true;
            }
        } catch (e) {
            console.error('Action aborted'); // Đổi log để tránh bị detect
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
    cooldownMinutes: 15,         // Cách <n> phút mới nhảy popup 1 lần bất kể ở màn nào
    defaultProbability: 1,    // <n>% cơ hội nhảy ads (nếu màn không truyền xác suất riêng)
    maxPerSession: 10           // 1 phiên truy cập ăn tối đa <n> ads tổng cộng
});

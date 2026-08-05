declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
        dataLayer?: any[];
    }
}

export type EventParams = Record<string, any>;

class EventLogger {
    /**
     * Gửi event lên Google Analytics (GA4 / GTM) một cách an toàn.
     * Hàm này chạy bất đồng bộ và sẽ không làm gián đoạn luồng chính nếu mạng chậm hoặc GA bị Adblock chặn.
     */
    public log(eventName: string, params: EventParams = {}): void {
        if (typeof window === 'undefined') return;

        // Bọc trong setTimeout để đẩy nó ra khỏi Main Thread, chạy bất đồng bộ hoàn toàn
        // giúp không ảnh hưởng đến tốc độ của hành động click/download
        setTimeout(() => {
            try {
                // Cách 1: Dành cho Google Analytics 4 (cài qua thẻ gtag.js)
                if (typeof window.gtag === 'function') {
                    window.gtag('event', eventName, params);
                } 
                // Cách 2: Dành cho Google Tag Manager (GTM)
                else if (window.dataLayer && Array.isArray(window.dataLayer)) {
                    window.dataLayer.push({
                        event: eventName,
                        ...params
                    });
                } 
                
                // Môi trường Dev: Log ra console để dễ debug
                if (import.meta.env?.DEV) {
                    console.info(`[Event Logger] ${eventName}`, params);
                }
            } catch (e) {
                // Try-catch đảm bảo nếu có lỗi gì cũng không chết app
                console.warn('Analytics logging failed', e);
            }
        }, 0);
    }
}

export const logger = new EventLogger();

export type AdSize = "300x250" | "320x50" | "728x90";

export interface AdConfig {
    id: string;
    size: AdSize;
    reload_after?: number;
}

export const adsConfig = {
    banner_sidebar: {
        id: "",
        size: "300x250",
        reload_after: 20
    },
    adcash_banner_sidebar: {
        id: "",
        size: "300x250",
        reload_after: 30
    }
} as const satisfies Record<string, AdConfig>;

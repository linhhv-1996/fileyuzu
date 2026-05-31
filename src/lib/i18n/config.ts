export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
    { code: 'th', name: 'ไทย', flag: '🇹🇭' }
];

export function t(key: string, dict: Record<string, any>): any {
    if (!dict) return key;
    
    // Check if flat key exists
    if (key in dict) {
        return dict[key];
    }

    // Check nested key
    const keys = key.split('.');
    let value: any = dict;
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return key;
        }
    }
    return typeof value === 'string' ? value : key;
}

export function langUrl(lang: string, path: string): string {
    const basePath = lang === 'en' ? '' : `/${lang}`;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${basePath}${normalizedPath}`;
    return url === '' ? '/' : url;
}

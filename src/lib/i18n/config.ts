export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
    { code: 'th', name: 'ไทย', flag: '🇹🇭' },
    { code: 'ru', name: 'Русский', flag: '🇰🇿' }
];

export function t(key: string, dict: Record<string, any>): any {
    if (!dict) return key;

    // Check flat key first (most common case, fastest path)
    if (key in dict) {
        return dict[key];
    }

    // Tokenize: split on '.' then unwrap [n] array indices
    // "home.faq.items[2].q" → ["home.faq.items", "2", "q"]
    const tokens = key.split('.').flatMap(part => {
        const m = part.match(/^([^\[]+)(?:\[(\d+)\])?$/);
        if (!m) return [part];
        return m[2] !== undefined ? [m[1], m[2]] : [m[1]];
    });

    let value: any = dict;
    for (const token of tokens) {
        if (value == null) return key;
        if (Array.isArray(value)) {
            const idx = Number(token);
            if (!isNaN(idx) && idx < value.length) {
                value = value[idx];
            } else {
                return key;
            }
        } else if (typeof value === 'object' && token in value) {
            value = value[token];
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

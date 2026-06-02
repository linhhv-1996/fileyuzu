export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh-tw', name: '繁體中文', flag: '🇹🇼' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'pt-br', name: 'Português', flag: '🇧🇷' },
    { code: 'th', name: 'ไทย', flag: '🇹🇭' },
    { code: 'ru', name: 'Русский', flag: '🇰🇿' }
];

export function getCanonicalLang(lang: string | undefined): string {
    if (!lang) return 'en';
    const l = lang.toLowerCase();
    const found = SUPPORTED_LANGUAGES.find(sl => sl.code.toLowerCase() === l);
    return found ? found.code : 'en';
}

export function isValidLang(lang: string | undefined): boolean {
    if (!lang) return false;
    const l = lang.toLowerCase();
    return SUPPORTED_LANGUAGES.some(sl => sl.code.toLowerCase() === l);
}

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
    const urlLang = lang.toLowerCase();
    const basePath = urlLang === 'en' ? '' : `/${urlLang}`;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${basePath}${normalizedPath}`;
    return url === '' ? '/' : url;
}

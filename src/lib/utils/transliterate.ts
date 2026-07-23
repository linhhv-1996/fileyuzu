// Google Input Tools API integration
export async function getTransliterationSuggestions(text: string, langCode: string): Promise<string[]> {
    if (!text || !text.trim()) return [];
    
    // Support specific long-tail languages based on search volume
    const langMap: Record<string, string> = {
        'ru': 'ru-t-i0-und',
        'ur': 'ur-t-i0-und',
        'ta': 'ta-t-i0-und',
        'pa': 'pa-t-i0-und',
        'ar': 'ar-t-i0-und',
        'gu': 'gu-t-i0-und',
        'mr': 'mr-t-i0-und',
        'bn': 'bn-t-i0-und',
        'si': 'si-t-i0-und',
        'hi': 'hi-t-i0-und'
    };

    const itc = langMap[langCode];
    if (!itc) return [text];

    try {
        const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=${itc}&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1]) {
            return data[1][0][1]; // Array of suggestions
        }
    } catch (e) {
        console.error("Transliteration API error", e);
    }
    
    return [text];
}

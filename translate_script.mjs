import fs from 'fs';
import path from 'path';

const localesDir = 'src/lib/i18n/locales';
const enPath = path.join(localesDir, 'en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const locales = fs.readdirSync(localesDir).filter(f => f.endsWith('.json') && f !== 'en.json');

async function translateText(text, tl) {
    if (text.startsWith('================')) return text; // don't translate comments
    if (tl === 'pt-BR') tl = 'pt';
    if (tl === 'zh-TW') tl = 'zh-TW'; // Should work for Google Translate
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const data = await res.json();
        return data[0].map(x => x[0]).join('');
    } catch (e) {
        console.error(`Error translating "${text}" to ${tl}`, e.message);
        return text;
    }
}

// Function to recursively fill missing keys
async function fillMissing(baseObj, targetObj, tl, prefix = '') {
    for (const key in baseObj) {
        if (key.startsWith('_comment_')) {
            targetObj[key] = baseObj[key]; // Just copy comments
            continue;
        }

        if (typeof baseObj[key] === 'object' && baseObj[key] !== null) {
            if (!targetObj[key] || typeof targetObj[key] !== 'object') {
                targetObj[key] = Array.isArray(baseObj[key]) ? [] : {};
            }
            await fillMissing(baseObj[key], targetObj[key], tl, prefix + key + '.');
        } else {
            if (targetObj[key] === undefined || targetObj[key] === '') {
                console.log(`Translating [${tl}] ${prefix}${key} ...`);
                const translated = await translateText(baseObj[key], tl);
                targetObj[key] = translated;
                // Add a small delay to avoid rate limit
                await new Promise(r => setTimeout(r, 200));
            }
        }
    }
}

// Ensure the target object keys are ordered exactly as the base object keys
function orderKeys(baseObj, targetObj) {
    if (typeof baseObj !== 'object' || baseObj === null) return targetObj;
    
    const ordered = Array.isArray(baseObj) ? [] : {};
    for (const key in baseObj) {
        if (targetObj.hasOwnProperty(key)) {
            if (typeof baseObj[key] === 'object' && baseObj[key] !== null) {
                ordered[key] = orderKeys(baseObj[key], targetObj[key]);
            } else {
                ordered[key] = targetObj[key];
            }
        }
    }
    return ordered;
}

async function main() {
    for (const locale of locales) {
        const tl = locale.replace('.json', '');
        console.log(`\nProcessing locale: ${tl}`);
        const targetPath = path.join(localesDir, locale);
        let targetData = {};
        try {
            targetData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
        } catch(e) {}

        await fillMissing(enData, targetData, tl);
        
        // Reorder keys to match English base
        const orderedData = orderKeys(enData, targetData);

        fs.writeFileSync(targetPath, JSON.stringify(orderedData, null, 2) + '\n', 'utf8');
        console.log(`Saved ${locale}`);
    }
    console.log('Done.');
}

main().catch(console.error);

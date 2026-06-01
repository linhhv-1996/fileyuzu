const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'lib', 'i18n', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
    'en': 'Blog',
    'ja': 'ブログ',
    'ko': '블로그',
    'pt-BR': 'Blog',
    'ru': 'Блог',
    'th': 'บล็อก',
    'zh-TW': '部落格'
};

files.forEach(file => {
    const lang = file.replace('.json', '');
    const filePath = path.join(localesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Parse the JSON
    // Note: We'll use a string replacement to maintain the order and not mess up formatting
    const translation = translations[lang] || 'Blog';
    
    // Add "common.blog" after "common.tools"
    if (content.includes('"common.tools":') && !content.includes('"common.blog":')) {
        const newContent = content.replace(
            /"common\.tools":\s*"(.*?)",/,
            `"common.tools": "$1",\n  "common.blog": "${translation}",`
        );
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Added common.blog to ${file}`);
    }
});

import { getCanonicalLang } from '$lib/i18n/config';
import type { PageServerLoad } from './$types';
import { parseFrontmatter as matter } from '$lib/utils/markdown';
import { marked } from 'marked';

export const load: PageServerLoad = async ({ params }) => {
    const lang = getCanonicalLang(params.lang);
    const urlLang = lang.toLowerCase();
    const slug = 'ebook-converter';
    
    // Glob all markdown files for seo
    const modules = import.meta.glob('/src/lib/contents/seo/**/*.md', { query: '?raw', import: 'default' });
    
    // Try to find the exact language file, fallback to 'en'
    let filePath = `/src/lib/contents/seo/${urlLang}/${slug}.md`;
    let rawContent = '';

    try {
        if (modules[filePath]) {
            rawContent = await modules[filePath]() as string;
        } else {
            // Fallback to en
            filePath = `/src/lib/contents/seo/en/${slug}.md`;
            if (modules[filePath]) {
                rawContent = await modules[filePath]() as string;
            }
        }
    } catch (e) {
        // If file not found or error reading, ignore and just use empty content
        console.error("Error loading SEO content for", slug, e);
    }

    let finalHtmlContent = '';
    let toc: { id: string; text: string; level: number }[] = [];

    if (rawContent) {
        // Since we may not have frontmatter in these simple SEO files, 
        // we can still pass it through matter() just in case.
        const parsed = matter(rawContent);
        const htmlContentRaw = await marked.parse(parsed.content || rawContent) as string;
        
        const usedIds = new Set<string>();
        
        finalHtmlContent = htmlContentRaw.replace(/<h([23])[^>]*>(.*?)<\/h\1>/gs, (match, levelStr, innerHtml) => {
            const level = parseInt(levelStr);
            const text = innerHtml.replace(/<[^>]*>?/gm, '').trim();
            
            let baseId = text.toLowerCase()
                             .replace(/[^\p{L}\p{N}]+/gu, '-')
                             .replace(/(^-|-$)/g, '');
            
            if (!baseId) baseId = `heading`;
            
            let uniqueId = baseId;
            let counter = 1;
            while (usedIds.has(uniqueId)) {
                uniqueId = `${baseId}-${counter}`;
                counter++;
            }
            usedIds.add(uniqueId);
            
            toc.push({
                id: uniqueId,
                text: text,
                level
            });
            
            return `<h${level} id="${uniqueId}">${innerHtml}</h${level}>`;
        });
    }

    return {
        seoContent: finalHtmlContent,
        seoToc: toc
    };
};

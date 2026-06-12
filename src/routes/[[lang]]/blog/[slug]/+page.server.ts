import { getCanonicalLang } from '$lib/i18n/config';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { parseFrontmatter as matter } from '$lib/utils/markdown';
import { marked } from 'marked';

export const load: PageServerLoad = async ({ params }) => {
    const lang = getCanonicalLang(params.lang);
    const urlLang = lang.toLowerCase();
    const slug = params.slug;
    
    // Glob all markdown files to find the correct one
    const modules = import.meta.glob('/src/lib/contents/blog/**/*.md', { query: '?raw', import: 'default' });
    
    const filePath = `/src/lib/contents/blog/${urlLang}/${slug}.md`;
    
    if (!modules[filePath]) {
        throw error(404, 'Blog post not found');
    }
    
    const rawContent = await modules[filePath]() as string;
    const parsed = matter(rawContent);
    const htmlContentRaw = await marked.parse(parsed.content) as string;
    
    // Generate TOC and inject IDs into headings for SEO
    const toc: { id: string; text: string; level: number }[] = [];
    const usedIds = new Set<string>();
    
    const finalHtmlContent = htmlContentRaw.replace(/<h([23])[^>]*>(.*?)<\/h\1>/gs, (match, levelStr, innerHtml) => {
        const level = parseInt(levelStr);
        // Strip nested HTML tags to get pure text
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
    
    // Load related posts (other posts in the same language)
    const relatedPosts = [];
    for (const path in modules) {
        if (path.includes(`/blog/${urlLang}/`) && path !== filePath) {
            const relatedRawContent = await modules[path]() as string;
            const relatedParsed = matter(relatedRawContent);
            const relatedFilename = path.split('/').pop() || '';
            const relatedSlug = relatedFilename.replace('.md', '');
            
            relatedPosts.push({
                slug: relatedSlug,
                title: relatedParsed.data.title || 'Untitled',
                date: relatedParsed.data.date || ''
            });
        }
    }
    
    // Sort related posts by date descending
    relatedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return {
        slug,
        title: parsed.data.title || 'Untitled',
        description: parsed.data.description || '',
        date: parsed.data.date || '',
        content: finalHtmlContent,
        toc,
        ctaTool: parsed.data.ctaTool || null,
        relatedPosts: relatedPosts.slice(0, 5) // Get top 5 recent related posts
    };
};

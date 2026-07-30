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
    const modules = import.meta.glob('/src/lib/contents/labs/**/*.md', { query: '?raw', import: 'default' });
    
    const filePath = `/src/lib/contents/labs/${urlLang}/${slug}.md`;
    
    if (!modules[filePath]) {
        throw error(404, 'Lab post not found');
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
    
    const posts: { slug: string; title: string; date: string }[] = [];
    
    for (const path in modules) {
        if (path.includes(`/labs/${urlLang}/`)) {
            const fileRaw = await modules[path]() as string;
            const fileParsed = matter(fileRaw);
            const filename = path.split('/').pop() || '';
            const fileSlug = filename.replace('.md', '');
            
            posts.push({
                slug: fileSlug,
                title: fileParsed.data.title || 'Untitled',
                date: fileParsed.data.date || '1970-01-01'
            });
        }
    }
    
    // Sort by date descending
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const currentIndex = posts.findIndex(p => p.slug === slug);
    let prevPost = null;
    let nextPost = null;
    
    if (currentIndex !== -1) {
        // Since array is sorted descending (newest first)
        // Previous post is older (index + 1)
        if (currentIndex < posts.length - 1) {
            prevPost = posts[currentIndex + 1];
        }
        // Next post is newer (index - 1)
        if (currentIndex > 0) {
            nextPost = posts[currentIndex - 1];
        }
    }
    
    return {
        slug,
        title: parsed.data.title || 'Untitled',
        description: parsed.data.description || '',
        date: parsed.data.date || '',
        content: finalHtmlContent,
        toc,
        ctaTool: parsed.data.ctaTool || null,
        prevPost,
        nextPost
    };
};

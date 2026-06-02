import { getCanonicalLang } from '$lib/i18n/config';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import matter from 'gray-matter';
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
    const htmlContent = marked.parse(parsed.content);
    
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
        content: htmlContent,
        ctaTool: parsed.data.ctaTool || null,
        relatedPosts: relatedPosts.slice(0, 5) // Get top 5 recent related posts
    };
};

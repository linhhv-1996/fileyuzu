import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import matter from 'gray-matter';
import { marked } from 'marked';

export const load: PageServerLoad = async ({ params }) => {
    const lang = params.lang || 'en';
    const slug = params.slug;
    
    // Glob all markdown files to find the correct one
    const modules = import.meta.glob('/src/lib/contents/blog/**/*.md', { query: '?raw', import: 'default' });
    
    const filePath = `/src/lib/contents/blog/${lang}/${slug}.md`;
    
    if (!modules[filePath]) {
        throw error(404, 'Blog post not found');
    }
    
    const rawContent = await modules[filePath]() as string;
    const parsed = matter(rawContent);
    const htmlContent = marked.parse(parsed.content);
    
    return {
        slug,
        title: parsed.data.title || 'Untitled',
        description: parsed.data.description || '',
        date: parsed.data.date || '',
        content: htmlContent
    };
};

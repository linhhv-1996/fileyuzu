import { getCanonicalLang } from '$lib/i18n/config';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import matter from 'gray-matter';
import { marked } from 'marked';

export const load: PageServerLoad = async ({ params }) => {
    const lang = getCanonicalLang(params.lang);
    // Glob all markdown files to find the correct one
    const modules = import.meta.glob('/src/lib/contents/legal/**/*.md', { query: '?raw', import: 'default' });
    
    const filePath = `/src/lib/contents/legal/${lang}/privacy.md`;
    
    if (!modules[filePath]) {
        throw error(404, 'Page not found');
    }
    
    const rawContent = await modules[filePath]() as string;
    const parsed = matter(rawContent);
    const htmlContent = marked.parse(parsed.content);
    
    return {
        title: parsed.data.title || 'Privacy Policy',
        content: htmlContent
    };
};

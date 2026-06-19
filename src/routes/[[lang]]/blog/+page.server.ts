import { getCanonicalLang } from '$lib/i18n/config';
import type { PageServerLoad } from './$types';
import { parseFrontmatter as matter } from '$lib/utils/markdown';

export const load: PageServerLoad = async ({ params }) => {
    const lang = getCanonicalLang(params.lang);
    const urlLang = lang.toLowerCase();
    
    // We must use import.meta.glob statically without dynamic variables inside the glob string.
    // glob all markdown files and filter by lang.
    const modules = import.meta.glob('/src/lib/contents/blog/**/*.md', { query: '?raw', import: 'default' });
    
    const posts = [];
    
    for (const path in modules) {
        if (path.includes(`/blog/${urlLang}/`)) {
            const rawContent = await modules[path]() as string;
            const parsed = matter(rawContent);
            
            // Extract slug from filename
            const filename = path.split('/').pop() || '';
            const slug = filename.replace('.md', '');
            
            posts.push({
                slug,
                title: parsed.data.title || '',
                description: parsed.data.description || '',
                date: parsed.data.date || ''
            });
        }
    }
    
    // Sort by date descending
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return {
        posts,
        lang: urlLang
    };
};

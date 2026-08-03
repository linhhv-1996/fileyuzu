import { getCanonicalLang } from '$lib/i18n/config';
import type { PageServerLoad } from './$types';
import { parseFrontmatter as matter } from '$lib/utils/markdown';
import { marked } from 'marked';

export const load: PageServerLoad = async ({ params }) => {
    const lang = getCanonicalLang(params.lang);
    const urlLang = lang.toLowerCase();
    
    // We must use import.meta.glob statically without dynamic variables inside the glob string.
    const blogModules = import.meta.glob('/src/lib/contents/blog/**/*.md', { query: '?raw', import: 'default' });
    const labModules = import.meta.glob('/src/lib/contents/labs/**/*.md', { query: '?raw', import: 'default' });
    
    const posts = [];
    for (const path in blogModules) {
        if (path.includes(`/blog/${urlLang}/`)) {
            const rawContent = await blogModules[path]() as string;
            const parsed = matter(rawContent);
            const slug = path.split('/').pop()?.replace('.md', '') || '';
            
            const contentLen = parsed.content.length;
            const snipLen = Math.floor(contentLen * 0.1);
            let snippet = parsed.content.substring(0, snipLen);
            const lastNewLine = snippet.lastIndexOf('\n');
            if (lastNewLine > 0) {
                snippet = snippet.substring(0, lastNewLine);
            }
            snippet += '\n\n...';
            const htmlSnippet = await marked.parse(snippet) as string;
            
            posts.push({
                slug,
                title: parsed.data.title || '',
                description: parsed.data.description || '',
                date: parsed.data.date || '',
                contentSnippet: htmlSnippet
            });
        }
    }
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const labs = [];
    for (const path in labModules) {
        if (path.includes(`/labs/${urlLang}/`)) {
            const rawContent = await labModules[path]() as string;
            const parsed = matter(rawContent);
            const slug = path.split('/').pop()?.replace('.md', '') || '';
            
            // Extract ~40% of content
            const contentLen = parsed.content.length;
            const snipLen = Math.floor(contentLen * 0.4);
            let snippet = parsed.content.substring(0, snipLen);
            const lastNewLine = snippet.lastIndexOf('\n');
            if (lastNewLine > 0) {
                snippet = snippet.substring(0, lastNewLine);
            }
            snippet += '\n\n...';
            const htmlSnippet = await marked.parse(snippet) as string;
            
            labs.push({
                slug,
                title: parsed.data.title || '',
                date: parsed.data.date || '',
                contentSnippet: htmlSnippet
            });
        }
    }
    labs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return {
        recentPosts: posts.slice(0, 4),
        recentLabs: labs.slice(0, 3)
    };
};

export interface ToolConfig {
    slug: string;
    titleKey: string;
    descriptionKey: string;
    icon: string;
    related_tools: string[];
    category: string;   // e.g. 'video', 'pdf'
    tags?: string[];    // format chips shown on home page
}

export interface CategoryConfig {
    id: string;
    labelKey: string;   // i18n key for category name
}

export const categories: CategoryConfig[] = [
    { id: 'video', labelKey: 'home.category.video' },
    { id: 'pdf',   labelKey: 'home.category.pdf'   },
];

export const tools: ToolConfig[] = [
    {
        slug: 'compress-video',
        titleKey: 'tool.compress_video.title',
        descriptionKey: 'tool.compress_video.description',
        icon: 'movie',
        related_tools: ['pdf-compressor', 'video-converter', 'compress-mp4', 'reduce-video-size'],
        category: 'video',
        tags: ['MP4', 'MOV', 'AVI'],
    },
    {
        slug: 'compress-mp4',
        titleKey: 'tool.compress_mp4.title',
        descriptionKey: 'tool.compress_mp4.description',
        icon: 'movie',
        related_tools: ['compress-video', 'reduce-video-size'],
        category: 'video',
        tags: ['MP4'],
    },
    {
        slug: 'reduce-video-size',
        titleKey: 'tool.reduce_video_size.title',
        descriptionKey: 'tool.reduce_video_size.description',
        icon: 'movie',
        related_tools: ['compress-video', 'compress-mp4'],
        category: 'video',
        tags: ['MP4', 'MOV', 'WebM'],
    },
    {
        slug: 'video-converter',
        titleKey: 'tool.video_converter.title',
        descriptionKey: 'tool.video_converter.description',
        icon: 'arrows-right-left',
        related_tools: ['compress-video'],
        category: 'video',
        tags: ['MP4', 'WebM', 'MP3'],
    },
    {
        slug: 'pdf-compressor',
        titleKey: 'tool.pdf_compressor.title',
        descriptionKey: 'tool.pdf_compressor.description',
        icon: 'file-type-pdf',
        related_tools: ['compress-mp4', 'video-converter', 'compress-video', 'reduce-video-size'],
        category: 'pdf',
        tags: ['PDF'],
    },
    {
        slug: 'mov-to-mp4',
        titleKey: 'tool.mov_to_mp4.title',
        descriptionKey: 'tool.mov_to_mp4.description',
        icon: 'arrows-right-left',
        related_tools: ['video-converter', 'compress-mp4', 'video-to-mp3'],
        category: 'video',
        tags: ['MOV', 'MP4'],
    },
    {
        slug: 'avi-to-mp4',
        titleKey: 'tool.avi_to_mp4.title',
        descriptionKey: 'tool.avi_to_mp4.description',
        icon: 'arrows-right-left',
        related_tools: ['video-converter', 'compress-mp4', 'video-to-mp3'],
        category: 'video',
        tags: ['AVI', 'MP4'],
    },
    {
        slug: 'mkv-to-mp4',
        titleKey: 'tool.mkv_to_mp4.title',
        descriptionKey: 'tool.mkv_to_mp4.description',
        icon: 'arrows-right-left',
        related_tools: ['video-converter', 'compress-mp4', 'video-to-mp3'],
        category: 'video',
        tags: ['MKV', 'MP4'],
    },
    {
        slug: 'webm-to-mp4',
        titleKey: 'tool.webm_to_mp4.title',
        descriptionKey: 'tool.webm_to_mp4.description',
        icon: 'arrows-right-left',
        related_tools: ['video-converter', 'compress-mp4', 'video-to-mp3'],
        category: 'video',
        tags: ['WebM', 'MP4'],
    },
    {
        slug: 'video-to-mp3',
        titleKey: 'tool.video_to_mp3.title',
        descriptionKey: 'tool.video_to_mp3.description',
        icon: 'music',
        related_tools: ['video-converter', 'compress-mp4', 'mov-to-mp4'],
        category: 'video',
        tags: ['Video', 'MP3'],
    },
];

export function getRelatedTools(currentSlug: string): ToolConfig[] {
    const current = tools.find(t => t.slug === currentSlug);
    if (!current) return [];
    return current.related_tools
        .map(slug => tools.find(t => t.slug === slug))
        .filter(Boolean) as ToolConfig[];
}

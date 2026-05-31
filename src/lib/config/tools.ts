export interface ToolConfig {
    slug: string;
    titleKey: string;
    descriptionKey: string;
    icon: string;
    related_tools: string[];
}

export const tools: ToolConfig[] = [
    {
        slug: 'compress-video',
        titleKey: 'tool.compress_video.title',
        descriptionKey: 'tool.compress_video.description',
        icon: 'movie',
        related_tools: ['pdf-compressor', 'video-converter']
    },
    {
        slug: 'pdf-compressor',
        titleKey: 'tool.pdf_compressor.title',
        descriptionKey: 'tool.pdf_compressor.description',
        icon: 'file-type-pdf',
        related_tools: []
    },
    {
        slug: 'video-converter',
        titleKey: 'tool.video_converter.title',
        descriptionKey: 'tool.video_converter.description',
        icon: 'arrows-right-left',
        related_tools: []
    },
];

export function getRelatedTools(currentSlug: string): ToolConfig[] {
    const current = tools.find(t => t.slug === currentSlug);
    if (!current) return [];
    return current.related_tools
        .map(slug => tools.find(t => t.slug === slug))
        .filter(Boolean) as ToolConfig[];
}

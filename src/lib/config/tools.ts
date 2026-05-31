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
        related_tools: ['video-trimmer', 'video-converter', 'gif-maker', 'remove-audio', 'image-compressor', 'video-rotator', 'video-cropper']
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
    {
        slug: 'video-trimmer',
        titleKey: 'tool.video_trimmer.title',
        descriptionKey: 'tool.video_trimmer.description',
        icon: 'cut',
        related_tools: []
    },
    {
        slug: 'gif-maker',
        titleKey: 'tool.gif_maker.title',
        descriptionKey: 'tool.gif_maker.description',
        icon: 'movie',
        related_tools: []
    },
    {
        slug: 'remove-audio',
        titleKey: 'tool.remove_audio.title',
        descriptionKey: 'tool.remove_audio.description',
        icon: 'volume-off',
        related_tools: []
    },
    {
        slug: 'image-compressor',
        titleKey: 'tool.image_compressor.title',
        descriptionKey: 'tool.image_compressor.description',
        icon: 'photo',
        related_tools: []
    },
    {
        slug: 'video-rotator',
        titleKey: 'tool.video_rotator.title',
        descriptionKey: 'tool.video_rotator.description',
        icon: 'rotate',
        related_tools: []
    },
    {
        slug: 'video-cropper',
        titleKey: 'tool.video_cropper.title',
        descriptionKey: 'tool.video_cropper.description',
        icon: 'crop',
        related_tools: []
    }
];

export function getRelatedTools(slugs: string[]): ToolConfig[] {
    return slugs.map(slug => tools.find(t => t.slug === slug)).filter(Boolean) as ToolConfig[];
}

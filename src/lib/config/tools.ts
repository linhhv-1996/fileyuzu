export interface ToolConfig {
    slug: string;
    titleKey: string;
    descriptionKey: string;
    shortDescriptionKey: string;
    icon: string;
    related_tools: string[];
    category: string;   // e.g. 'video', 'pdf'
    tags?: string[];    // format chips shown on home page
    markets?: string[]; // undefined = all markets, else only specified languages
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
        shortDescriptionKey: 'tool.compress_video.short_description',
        icon: 'movie',
        related_tools: [
            'compress-mp4',
            'video-converter',
            'mov-to-mp4',
            'compress-pdf',
        ],
        category: 'video',
        tags: ['MP4', 'MOV', 'AVI'],
    },
    {
        slug: 'compress-mp4',
        titleKey: 'tool.compress_mp4.title',
        descriptionKey: 'tool.compress_mp4.description',
        shortDescriptionKey: 'tool.compress_mp4.short_description',
        icon: 'movie',
        related_tools: [
            'compress-video',
            'mp4-converter',
            'mov-to-mp4',
            'webm-to-mp4',
        ],
        category: 'video',
        tags: ['MP4'],
    },
    {
        slug: 'reduce-video-size',
        titleKey: 'tool.reduce_video_size.title',
        descriptionKey: 'tool.reduce_video_size.description',
        shortDescriptionKey: 'tool.reduce_video_size.short_description',
        icon: 'movie',
        related_tools: [
            'compress-video',
            'video-converter',
            'mov-to-mp4',
            'webm-to-mp4',
        ],
        category: 'video',
        tags: ['MP4', 'MOV', 'WebM'],
    },
    {
        slug: 'video-converter',
        titleKey: 'tool.video_converter.title',
        descriptionKey: 'tool.video_converter.description',
        shortDescriptionKey: 'tool.video_converter.short_description',
        icon: 'arrows-right-left',
        related_tools: [
            'mov-to-mp4',
            'avi-to-mp4',
            'mkv-to-mp4',
            'webm-to-mp4',
        ],
        category: 'video',
        tags: ['MP4', 'WebM', 'MP3'],
    },
    {
        slug: 'compress-pdf',
        titleKey: 'tool.pdf_compressor.title',
        descriptionKey: 'tool.pdf_compressor.description',
        shortDescriptionKey: 'tool.pdf_compressor.short_description',
        icon: 'file-type-pdf',
        related_tools: [
            'compress-video',
            'reduce-video-size',
            'compress-mp4',
            'video-converter',
        ],
        category: 'pdf',
        tags: ['PDF'],
    },
    {
        slug: 'mov-to-mp4',
        titleKey: 'tool.mov_to_mp4.title',
        descriptionKey: 'tool.mov_to_mp4.description',
        shortDescriptionKey: 'tool.mov_to_mp4.short_description',
        icon: 'arrows-right-left',
        related_tools: [
            'video-converter',
            'mkv-to-mp4',
            'avi-to-mp4',
            'compress-mp4',
        ],
        category: 'video',
        tags: ['MOV', 'MP4'],
    },
    {
        slug: 'avi-to-mp4',
        titleKey: 'tool.avi_to_mp4.title',
        descriptionKey: 'tool.avi_to_mp4.description',
        shortDescriptionKey: 'tool.avi_to_mp4.short_description',
        icon: 'arrows-right-left',
        related_tools: [
            'video-converter',
            'mkv-to-mp4',
            'mov-to-mp4',
            'compress-mp4',
        ],
        category: 'video',
        tags: ['AVI', 'MP4'],
    },
    {
        slug: 'mkv-to-mp4',
        titleKey: 'tool.mkv_to_mp4.title',
        descriptionKey: 'tool.mkv_to_mp4.description',
        shortDescriptionKey: 'tool.mkv_to_mp4.short_description',
        icon: 'arrows-right-left',
        related_tools: [
            'video-converter',
            'mov-to-mp4',
            'avi-to-mp4',
            'compress-mp4',
        ],
        category: 'video',
        tags: ['MKV', 'MP4'],
    },
    {
        slug: 'webm-to-mp4',
        titleKey: 'tool.webm_to_mp4.title',
        descriptionKey: 'tool.webm_to_mp4.description',
        shortDescriptionKey: 'tool.webm_to_mp4.short_description',
        icon: 'arrows-right-left',
        related_tools: [
            'video-converter',
            'mkv-to-mp4',
            'avi-to-mp4',
            'compress-mp4',
        ],
        category: 'video',
        tags: ['WebM', 'MP4'],
    },
    {
        slug: 'video-to-mp3',
        titleKey: 'tool.video_to_mp3.title',
        descriptionKey: 'tool.video_to_mp3.description',
        shortDescriptionKey: 'tool.video_to_mp3.short_description',
        icon: 'music',
        related_tools: [
            'video-converter',
            'mkv-to-mp4',
            'avi-to-mp4',
            'compress-mp4',
        ],
        category: 'video',
        tags: ['Video', 'MP3'],
    },
    {
        slug: 'mp4-converter',
        titleKey: 'tool.mp4_converter.title',
        descriptionKey: 'tool.mp4_converter.description',
        shortDescriptionKey: 'tool.mp4_converter.short_description',
        icon: 'arrows-right-left',
        related_tools: [
            'mov-to-mp4',
            'mkv-to-mp4',
            'avi-to-mp4',
            'webm-to-mp4',
        ],
        category: 'video',
        tags: ['Video', 'MP4'],
    },
    {
        slug: 'barcode-generator',
        titleKey: 'tool.barcode_generator.title',
        descriptionKey: 'tool.barcode_generator.description',
        shortDescriptionKey: 'tool.barcode_generator.short_description',
        icon: 'barcode',
        related_tools: [
            'jan-code-generator',
            'compress-pdf',
            'compress-video',
            'video-converter',
            'mp4-converter',
        ],
        category: 'pdf',
        tags: ['Barcode', 'QR Code'],
        markets: ['en', 'ja', 'ko', 'pt-br', 'zh-tw', 'th'],
    },
    {
        slug: 'jan-code-generator',
        titleKey: 'tool.jan_code_generator.title',
        descriptionKey: 'tool.jan_code_generator.description',
        shortDescriptionKey: 'tool.jan_code_generator.short_description',
        icon: 'barcode',
        related_tools: [
            'barcode-generator',
            'compress-pdf',
            'compress-video',
            'video-converter',
        ],
        category: 'pdf',
        tags: ['JAN', 'EAN-13'],
        markets: ['ja'],
    },
    {
        slug: 'image-to-text',
        titleKey: 'tool.image_to_text.title',
        descriptionKey: 'tool.image_to_text.description',
        shortDescriptionKey: 'tool.image_to_text.short_description',
        icon: 'text-recognition',
        related_tools: [
            'handwriting-ocr',
            'video-converter',
            'barcode-generator',
            'compress-pdf',
            'compress-video',
        ],
        category: 'pdf',
        tags: ['OCR', 'Image to Text'],
        markets: ['en', 'ja', 'ko', 'zh-tw'],
    },
    {
        slug: 'handwriting-ocr',
        titleKey: 'tool.handwriting_ocr.title',
        descriptionKey: 'tool.handwriting_ocr.description',
        shortDescriptionKey: 'tool.handwriting_ocr.short_description',
        icon: 'text-recognition',
        related_tools: [
            'image-to-text',
            'barcode-generator',
            'compress-pdf',
            'compress-video',
        ],
        category: 'pdf',
        tags: ['OCR', 'Handwriting to Text'],
        markets: ['en', 'ja', 'ko'],
    },
    {
        slug: 'compare-two-lists',
        titleKey: 'tool.compare_two_lists.title',
        descriptionKey: 'tool.compare_two_lists.description',
        shortDescriptionKey: 'tool.compare_two_lists.short_description',
        icon: 'list-check',
        related_tools: [
            'image-to-text',
            'barcode-generator',
            'compress-pdf',
            'video-converter',
        ],
        category: 'text',
        tags: ['List', 'Compare', 'Text'],
        markets: ['en'],
    },
];

export function getRelatedTools(currentSlug: string): ToolConfig[] {
    const current = tools.find(tool => tool.slug === currentSlug);
    if (!current) return [];

    const seen = new Set<string>();

    return current.related_tools
        .filter(slug => {
            if (slug === currentSlug) return false;
            if (seen.has(slug)) return false;

            seen.add(slug);
            return true;
        })
        .map(slug => tools.find(tool => tool.slug === slug))
        .filter((tool): tool is ToolConfig => Boolean(tool));
}

export function validateRelatedTools(): string[] {
    const toolSlugs = new Set(tools.map(tool => tool.slug));
    const errors: string[] = [];

    for (const tool of tools) {
        const seen = new Set<string>();

        for (const relatedSlug of tool.related_tools) {
            if (relatedSlug === tool.slug) {
                errors.push(`${tool.slug}: related_tools contains itself`);
            }

            if (!toolSlugs.has(relatedSlug)) {
                errors.push(`${tool.slug}: related tool "${relatedSlug}" does not exist`);
            }

            if (seen.has(relatedSlug)) {
                errors.push(`${tool.slug}: duplicate related tool "${relatedSlug}"`);
            }

            seen.add(relatedSlug);
        }

        if (tool.related_tools.length < 4) {
            errors.push(`${tool.slug}: should have at least 4 related tools`);
        }

        if (tool.related_tools.length > 6) {
            errors.push(`${tool.slug}: should have at most 6 related tools`);
        }
    }

    return errors;
}

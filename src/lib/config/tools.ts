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
    { id: 'audio', labelKey: 'home.category.audio' },
    { id: 'text',  labelKey: 'home.category.text'  },
];

export const tools: ToolConfig[] = [
    {
        slug: 'bulk-file-renamer',
        titleKey: 'tool.bulk_file_renamer.title',
        descriptionKey: 'tool.bulk_file_renamer.description',
        shortDescriptionKey: 'tool.bulk_file_renamer.short_description',
        icon: 'file-text',
        related_tools: [
            'compare-two-lists',
            'compress-pdf',
            'video-converter',
            'image-to-text',
            'word-counter',
        ],
        category: 'text',
        tags: ['Rename', 'Bulk'],
        markets: ['en', 'ja', 'zh-tw', 'ko'],
    },
    {
        slug: 'compress-video',
        titleKey: 'tool.compress_video.title',
        descriptionKey: 'tool.compress_video.description',
        shortDescriptionKey: 'tool.compress_video.short_description',
        icon: 'movie',
        related_tools: [
            'video-converter',
            'compress-pdf',
            'video-to-mp3',
            'extract-frames-from-video',
        ],
        category: 'video',
        tags: ['MP4', 'MOV', 'AVI'],
    },
    {
        slug: 'video-converter',
        titleKey: 'tool.video_converter.title',
        descriptionKey: 'tool.video_converter.description',
        shortDescriptionKey: 'tool.video_converter.short_description',
        icon: 'arrows-right-left',
        related_tools: [
            'compress-video',
            'video-to-mp3',
            'extract-frames-from-video',
            'audio-converter',
        ],
        category: 'video',
        tags: ['MP4', 'MOV', 'AVI', 'MKV', 'WebM'],
    },
    {
        slug: 'compress-pdf',
        titleKey: 'tool.pdf_compressor.title',
        descriptionKey: 'tool.pdf_compressor.description',
        shortDescriptionKey: 'tool.pdf_compressor.short_description',
        icon: 'file-type-pdf',
        related_tools: [
            'compress-video',
            'video-converter',
            'merge-pdf',
            'image-to-text',
        ],
        category: 'pdf',
        tags: ['PDF'],
    },
    {
        slug: 'video-to-mp3',
        titleKey: 'tool.video_to_mp3.title',
        descriptionKey: 'tool.video_to_mp3.description',
        shortDescriptionKey: 'tool.video_to_mp3.short_description',
        icon: 'music',
        related_tools: [
            'video-converter',
            'compress-video',
            'audio-converter',
            'audio-to-text',
        ],
        category: 'video',
        tags: ['Video', 'MP3'],
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
        ],
        category: 'pdf',
        tags: ['Barcode', 'QR Code'],
        markets: ['en', 'ja', 'ko', 'zh-tw'],
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
            'video-converter',
            'barcode-generator',
            'compress-pdf',
            'compress-video',
        ],
        category: 'pdf',
        tags: ['OCR', 'Image to Text', 'Handwriting to Text'],
        markets: ['en', 'ja', 'ko', 'zh-tw'],
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
            'word-counter',
        ],
        category: 'text',
        tags: ['List', 'Compare', 'Text'],
        markets: ['en', 'ja', 'zh-tw'],
    },
    {
        slug: 'audio-converter',
        titleKey: 'tool.audio_converter.title',
        descriptionKey: 'tool.audio_converter.description',
        shortDescriptionKey: 'tool.audio_converter.short_description',
        icon: 'music',
        related_tools: [
            'video-converter',
            'video-to-mp3',
            'audio-to-text',
            'compress-video',
        ],
        category: 'audio',
        tags: ['Audio', 'MP3', 'WAV', 'FLAC', 'M4A', 'OGG'],
        markets: ['en', 'ja', 'ko'],
    },
    {
        slug: 'extract-frames-from-video',
        titleKey: 'tool.extract_frames.title',
        descriptionKey: 'tool.extract_frames.description',
        shortDescriptionKey: 'tool.extract_frames.short_description',
        icon: 'camera',
        related_tools: [
            'video-converter',
            'compress-video',
            'video-to-mp3',
            'video-to-text',
        ],
        category: 'video',
        tags: ['Video', 'Frame', 'Image', 'JPG', 'PNG'],
        markets: ['en', 'ja', 'zh-tw'],
    },
    {
        slug: 'audio-to-text',
        titleKey: 'tool.audio_to_text.title',
        descriptionKey: 'tool.audio_to_text.description',
        shortDescriptionKey: 'tool.audio_to_text.short_description',
        icon: 'microphone',
        related_tools: [
            'audio-converter',
            'video-converter',
            'video-to-mp3',
            'video-to-text',
        ],
        category: 'audio',
        tags: ['Audio', 'Text', 'Transcribe', 'AI'],
        markets: ['en', 'ja', 'zh-tw', 'ko'],
    },
    {
        slug: 'video-to-text',
        titleKey: 'tool.video_to_text.title',
        descriptionKey: 'tool.video_to_text.description',
        shortDescriptionKey: 'tool.video_to_text.short_description',
        icon: 'microphone',
        related_tools: [
            'audio-to-text',
            'video-converter',
            'video-to-mp3',
            'extract-frames-from-video',
        ],
        category: 'video',
        tags: ['Video', 'Text', 'Transcribe', 'AI'],
        markets: ['en', 'ja', 'zh-tw', 'ko'],
    },
    {
        slug: 'png-to-pdf',
        titleKey: 'tool.png_to_pdf.title',
        descriptionKey: 'tool.png_to_pdf.description',
        shortDescriptionKey: 'tool.png_to_pdf.short_description',
        icon: 'file-type-pdf',
        related_tools: [
            'jpg-to-pdf',
            'image-to-text',
            'merge-pdf',
            'barcode-generator',
        ],
        category: 'pdf',
        tags: ['PNG', 'JPG', 'PDF'],
        markets: ['en', 'ja', 'ko'],
    },
    {
        slug: 'jpg-to-pdf',
        titleKey: 'tool.jpg_to_pdf.title',
        descriptionKey: 'tool.jpg_to_pdf.description',
        shortDescriptionKey: 'tool.jpg_to_pdf.short_description',
        icon: 'file-type-pdf',
        related_tools: [
            'png-to-pdf',
            'image-to-text',
            'merge-pdf',
            'barcode-generator',
        ],
        category: 'pdf',
        tags: ['JPG', 'JPEG', 'PDF'],
        markets: ['en', 'ja', 'ko', 'zh-tw'],
    },
    {
        slug: 'merge-pdf',
        titleKey: 'tool.merge_pdf.title',
        descriptionKey: 'tool.merge_pdf.description',
        shortDescriptionKey: 'tool.merge_pdf.short_description',
        icon: 'layers-linked',
        related_tools: [
            'jpg-to-pdf',
            'png-to-pdf',
            'image-to-text',
            'compress-pdf',
            'word-counter',
        ],
        category: 'pdf',
        tags: ['Merge', 'PDF', 'Images'],
        markets: ['en', 'ja', 'zh-tw', 'ko'],
    },
    {
        slug: 'word-counter',
        titleKey: 'tool.word_counter.title',
        descriptionKey: 'tool.word_counter.description',
        shortDescriptionKey: 'tool.word_counter.short_description',
        icon: 'file-text',
        related_tools: [
            'compare-two-lists',
            'bulk-file-renamer',
            'image-to-text',
            'video-to-text',
        ],
        category: 'text',
        tags: ['Word', 'Character', 'Count', 'Text'],
        markets: ['en', 'ja', 'zh-tw', 'ko'],
    }
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

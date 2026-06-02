export function parseFrontmatter(rawContent: string) {
    const lines = rawContent.split(/\r?\n/);
    const data: Record<string, string> = {};
    let contentStartLine = 0;
    
    if (lines[0] && lines[0].trim() === '---') {
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '---') {
                contentStartLine = i + 1;
                break;
            }
            // Match key: "value" or key: value
            const match = lines[i].match(/^([\w-]+):\s*(.*)$/);
            if (match) {
                let value = match[2].trim();
                // Remove surrounding quotes if they exist
                if ((value.startsWith('"') && value.endsWith('"')) || 
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                data[match[1]] = value;
            }
        }
    }
    
    const content = lines.slice(contentStartLine).join('\n');
    return { data, content };
}

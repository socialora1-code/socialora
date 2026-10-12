export interface FontConfig {
  limit?: { label: string; max: number }
  featured?: readonly string[]
  only?: readonly string[]
  example: string
  previewLabel: string
  accent: string
  cheat?: { title: string; rows: readonly (readonly [string, string])[] }
}

export const FONT_CONFIGS: Record<string, FontConfig> = {
  'instagram-font-generator': {
    limit: { label: 'Bio', max: 150 },
    featured: ['bold', 'script', 'bubble', 'small-caps', 'serif-bold-italic'],
    example: 'Travel | Food | Good Vibes',
    previewLabel: 'Bio',
    accent: '#E1306C',
  },
  'tiktok-font-generator': {
    limit: { label: 'Bio', max: 80 },
    featured: ['bold-script', 'bubble-filled', 'wide', 'bold', 'sparkle'],
    example: 'Daily dance videos',
    previewLabel: 'Bio',
    accent: '#111827',
  },
  'discord-font-generator': {
    limit: { label: 'Nickname', max: 32 },
    featured: ['monospace', 'small-caps', 'wide', 'gothic', 'bold'],
    example: 'Night Owl',
    previewLabel: 'Nickname',
    accent: '#5865F2',
    cheat: {
      title: 'Discord built-in formatting',
      rows: [
        ['Bold', '**text**'],
        ['Italic', '*text*'],
        ['Underline', '__text__'],
        ['Strikethrough', '~~text~~'],
        ['Code', '`text`'],
      ],
    },
  },
  'whatsapp-font-generator': {
    limit: { label: 'About', max: 139 },
    featured: ['bold', 'italic', 'monospace', 'bubble', 'small-caps'],
    example: 'Available',
    previewLabel: 'About',
    accent: '#25D366',
    cheat: {
      title: 'WhatsApp built-in formatting',
      rows: [
        ['Bold', '*text*'],
        ['Italic', '_text_'],
        ['Strikethrough', '~text~'],
        ['Monospace', '```text```'],
      ],
    },
  },
  'x-font-generator': {
    limit: { label: 'Bio', max: 160 },
    featured: ['bold', 'italic', 'bold-italic', 'monospace', 'double-struck'],
    example: 'Building in public',
    previewLabel: 'Bio',
    accent: '#111111',
  },
  'facebook-font-generator': {
    limit: { label: 'Intro', max: 101 },
    featured: ['bold', 'italic', 'serif-bold', 'script', 'bubble'],
    example: 'Coffee lover and weekend traveler',
    previewLabel: 'Intro',
    accent: '#1877F2',
  },
  'snapchat-font-generator': {
    featured: ['bubble-filled', 'square-filled', 'wide', 'bold-script', 'sparkle'],
    example: 'Maya',
    previewLabel: 'Display name',
    accent: '#F5A100',
  },
  'linkedin-font-generator': {
    limit: { label: 'Headline', max: 220 },
    only: ['bold', 'italic', 'bold-italic', 'serif-bold', 'serif-italic', 'sans', 'monospace', 'small-caps'],
    featured: ['bold', 'italic', 'bold-italic'],
    example: 'Product Designer | Helping teams ship faster',
    previewLabel: 'Headline',
    accent: '#0A66C2',
  },
  'threads-font-generator': {
    limit: { label: 'Bio', max: 150 },
    featured: ['bold', 'italic', 'script', 'small-caps', 'bubble'],
    example: 'Words, coffee, repeat',
    previewLabel: 'Bio',
    accent: '#111111',
  },
  'twitch-font-generator': {
    limit: { label: 'About', max: 300 },
    featured: ['bold', 'gothic', 'wide', 'small-caps', 'square-filled'],
    example: 'ABOUT ME',
    previewLabel: 'Panel',
    accent: '#9146FF',
  },
}

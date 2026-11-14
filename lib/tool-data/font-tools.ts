import type { ToolDef } from '@/lib/tool-data/types'

export const FONT_TOOLS: readonly ToolDef[] = [
  {
    slug: 'instagram-font-generator',
    kind: 'font',
    group: 'Font Generators',
    platform: 'Instagram',
    name: 'Instagram Font Generator',
    title: 'Instagram Font Generator - Copy & Paste Fancy Text',
    h1: 'Instagram Font Generator',
    description:
      'Free Instagram font generator. Type your text, pick a fancy style and copy it into your bio, captions or comments. No app, no sign-up.',
    intro:
      'Make your Instagram bio, captions and comments stand out with fancy text. Type your words below, pick a style and copy it. It works in your browser, with no app and no sign-up.',
    tips: [
      'Use fancy text for one or two key words, like your name or a short tagline. A bio written fully in decorative letters is hard to read.',
      'Keep your username and the searchable Name field in plain text, because decorative symbols may not match what people type in search.',
      'Save your bio, then open your profile on another phone. Some older devices show empty boxes instead of certain symbols.',
    ],
    faqs: [
      {
        q: 'Are these real fonts?',
        a: 'No. They are special Unicode characters that look like different fonts. That is why you can paste them almost anywhere that accepts text, without installing anything.',
      },
      {
        q: 'Why do some styles show boxes on my phone?',
        a: 'Not every device has every symbol. If a style shows boxes, pick another one. Bold and italic styles are usually the safest choice.',
      },
      {
        q: 'Can screen readers read unicode fancy text?',
        a: 'Screen readers often interpret unicode decorative characters letter-by-letter or as mathematical symbols. For accessibility, keep your primary username and essential bio info in standard text and use decorative fonts for short accents or headers.',
      }
    ],
    cta: {
      text: 'Want your profile to get noticed by more people? See our Instagram growth services.',
      href: '/instagram',
      label: 'See Instagram services',
    },
  },
  {
    slug: 'tiktok-font-generator',
    kind: 'font',
    group: 'Font Generators',
    platform: 'TikTok',
    name: 'TikTok Font Generator',
    title: 'TikTok Font Generator - Fancy Text for Bio & Captions',
    h1: 'TikTok Font Generator',
    description:
      'Free TikTok font generator. Create fancy text for your TikTok bio, captions and comments, then copy and paste it in one tap.',
    intro:
      'Give your TikTok bio and captions a style of their own. Type your text, choose a look and copy it. Nothing to install and no account needed.',
    tips: [
      'TikTok usernames only allow letters, numbers, underscores and periods, so use fancy text in your bio and captions instead.',
      'Try styling just the first line of a caption, so the hook looks different from the rest of the text.',
      'Symbols can look slightly different on iPhone and Android. Check your bio on both if you can.',
    ],
    faqs: [
      {
        q: 'Can I use these in my TikTok username?',
        a: 'No. Usernames only accept plain characters. Use the generated text in your bio, captions or comments.',
      },
      {
        q: 'Does fancy text get me more views?',
        a: 'There is no proof that decorative text changes how TikTok shows your videos. Treat it as a style choice, not a growth trick.',
      },
      {
        q: 'Will fancy fonts affect my TikTok search discoverability?',
        a: 'TikTok search indexes standard text best. If you want your profile to appear when users search for your niche keywords, keep your main username and primary bio keywords in regular text, and style your display name or secondary callouts.',
      }
    ],
    cta: {
      text: 'Want a stronger start for your next video? See our TikTok services.',
      href: '/tiktok',
      label: 'See TikTok services',
    },
  },
  {
    slug: 'discord-font-generator',
    kind: 'font',
    group: 'Font Generators',
    platform: 'Discord',
    name: 'Discord Font Generator',
    title: 'Discord Font Generator | Free, No Login',
    h1: 'Discord Font Generator',
    description:
      'Try the free Discord font generator for instant text styles. Copy and paste Discord fonts into nicknames, profiles or messages. No login needed.',
    intro:
      'Stand out in your Discord server with a fancy nickname or a styled announcement. Type your text, pick a style and paste it into Discord.',
    tips: [
      'Many servers have nickname rules. Hard to read or hard to mention names may be changed by moderators, so check the rules first.',
      'For long messages, use Discord formatting instead: two asterisks for bold, one for italic. Fancy text works best for short headings.',
      'Test your nickname by typing it in the member search of your server, so you know people can still find you.',
    ],
    faqs: [
      {
        q: 'How do I copy and paste Discord fonts?',
        a: 'Type your text here, use Copy next to the style you want, and paste it into the Discord message or nickname field. Preview the result before saving.',
      },
      {
        q: 'Can I use fancy text in my Discord nickname?',
        a: 'In most cases yes, because nicknames accept most Unicode characters. Server rules can still limit it, so check with the moderators.',
      },
      {
        q: 'Does Discord have its own text formatting?',
        a: 'Yes. You can use simple symbols around your text for bold, italic, underline and strikethrough. Fancy fonts are a different option that changes the letters themselves.',
      },
      {
        q: 'Can I use custom fonts in Discord channel names?',
        a: 'Discord channel names support small caps, sans-serif unicode, and symbols, but spaces are automatically converted to hyphens. Server admins often use styled unicode characters to organize channel category headers.',
      }
    ],
  },
  {
    slug: 'whatsapp-font-generator',
    kind: 'font',
    group: 'Font Generators',
    platform: 'WhatsApp',
    name: 'WhatsApp Font Generator',
    title: 'WhatsApp Font Generator - Fancy Text for Status & About',
    h1: 'WhatsApp Font Generator',
    description:
      'Free WhatsApp font generator. Create stylish text for your About, status and group descriptions, then copy and paste it in seconds.',
    intro:
      'Add some style to your WhatsApp About, status or group description. Type your text, pick a look and copy it. It is free and works right in your browser.',
    tips: [
      'WhatsApp also has built-in formatting: asterisks around a word make it bold, underscores make it italic and tildes make it crossed out.',
      'Use fancy text for a short status or a group name, not for long messages that people need to read quickly.',
      'The people you chat with see the same characters, as long as their phone supports them.',
    ],
    faqs: [
      {
        q: 'Can I use fancy text in my WhatsApp About?',
        a: 'Yes. Paste the text like any other text. It also works in statuses, group descriptions and chat messages.',
      },
      {
        q: 'Will my contacts see the same style?',
        a: 'Usually yes, because these are text characters, not images. Very old phones may show boxes for rare symbols.',
      },
      {
        q: 'Can I format bold and italic text directly in WhatsApp messages?',
        a: 'Yes. WhatsApp natively supports asterisks for bold, underscores for italic, and tildes for strikethrough. This font generator creates stylized unicode characters that you can paste anywhere without special markdown markers.',
      }
    ],
  },
  {
    slug: 'x-font-generator',
    kind: 'font',
    group: 'Font Generators',
    platform: 'X',
    name: 'X (Twitter) Font Generator',
    title: 'Twitter / X Font Generator - Fancy Text for Posts & Bio',
    h1: 'Twitter / X Font Generator',
    description:
      'Free Twitter and X font generator. Make fancy text for your posts, bio and display name, then copy and paste it.',
    intro:
      'Make a post or your X bio look different with fancy text. Type your words below, choose a style and copy it into X.',
    tips: [
      'Many of these symbols may count as more than one character on X, so a long post can reach the limit sooner than you expect.',
      'Style one key phrase in a post, such as a headline, and keep the rest plain so the post stays easy to read.',
      'Your display name can look unique with fancy text, but keep your @handle in plain letters.',
    ],
    faqs: [
      {
        q: 'Do fancy characters count toward the X character limit?',
        a: 'They can take up more space than normal letters. If you are close to the limit, check the counter in X before you post.',
      },
      {
        q: 'Can I change my @handle with this tool?',
        a: 'No. Handles only accept plain characters. Use fancy text in your display name, bio and posts.',
      },
      {
        q: 'Can I search for posts written with custom unicode fonts on X?',
        a: 'Search engines and the X search bar may not always match stylized unicode characters with normal keyboard text. It is best to use fancy text on prominent hook words while keeping important hashtags and search keywords in standard letters.',
      }
    ],
    cta: {
      text: 'Want your X profile to look more established? See our X services.',
      href: '/x',
      label: 'See X services',
    },
  },
  {
    slug: 'facebook-font-generator',
    kind: 'font',
    group: 'Font Generators',
    platform: 'Facebook',
    name: 'Facebook Font Generator',
    title: 'Facebook Font Generator - Fancy Text for Posts & Bio',
    h1: 'Facebook Font Generator',
    description:
      'Free Facebook font generator. Create fancy text for posts, your bio and your page intro, then copy and paste it.',
    intro:
      'Add style to your Facebook posts, bio or page intro. Type your text, pick a style you like and copy it in one tap.',
    tips: [
      'Use fancy text for post headlines and short intros. Long paragraphs in decorative letters are tiring to read.',
      'Your account name has to follow the naming rules of Facebook, so use the styles in posts, bio and intro instead.',
      'Add emoji and symbols to a post only when they help people scan it, not to fill space.',
    ],
    faqs: [
      {
        q: 'Where can I use the text on Facebook?',
        a: 'In posts, comments, your bio and intro, and your page description. Each place accepts normal text, so you can paste it as usual.',
      },
      {
        q: 'Can I use it for my profile name?',
        a: 'Facebook has rules for profile names, and decorative characters may not be accepted. It is safer to keep your profile name plain.',
      },
      {
        q: 'Will fancy text look normal on both desktop and mobile Facebook?',
        a: 'Yes. The characters generated are universal Unicode symbols supported by all modern operating systems including iOS, Android, macOS, and Windows. They render consistently across Facebook feeds and groups.',
      }
    ],
  },
  {
    slug: 'snapchat-font-generator',
    kind: 'font',
    group: 'Font Generators',
    platform: 'Snapchat',
    name: 'Snapchat Font Generator',
    title: 'Snapchat Font Generator - Fancy Text for Names & Bio',
    h1: 'Snapchat Font Generator',
    description:
      'Free Snapchat font generator. Make cool text for your display name, bio and messages, then copy and paste it.',
    intro:
      'Get a display name and bio that people remember. Type your text, pick a style and copy it into Snapchat.',
    tips: [
      'Use fancy text for your display name, which you can edit, and keep your username plain so friends can search for you.',
      'Short names look best. Long names in decorative letters can get cut off on small screens.',
      'Try two or three styles in your chat first and keep the one that stays easiest to read.',
    ],
    faqs: [
      {
        q: 'Can I put fancy text in my Snapchat display name?',
        a: 'Usually yes. Paste the text in your display name field, and check how it looks on your profile afterwards.',
      },
      {
        q: 'Will my friends see the same characters?',
        a: 'In most cases yes. If a friend sees boxes, their device may not support that symbol, and a different style will fix it.',
      },
      {
        q: 'Can I paste stylized fonts into Snapchat Stories and Snaps?',
        a: 'Yes. You can copy the generated text and paste it directly into the Snapchat caption tool or text sticker editor on any photo or video Snap.',
      }
    ],
  },
  {
    slug: 'linkedin-font-generator',
    kind: 'font',
    group: 'Font Generators',
    platform: 'LinkedIn',
    name: 'LinkedIn Font Generator',
    title: 'LinkedIn Font Generator - Bold & Italic Text for Posts',
    h1: 'LinkedIn Font Generator',
    description:
      'Free LinkedIn font generator. Make bold and italic text for posts, your headline and your About section, then copy and paste it.',
    intro:
      'LinkedIn does not have a bold button for posts. Type your text here, pick bold or italic and paste it into your post, headline or About section.',
    tips: [
      'Use bold for one key line in a post, such as the first sentence. Too much styling looks unprofessional.',
      'Recruiters search for plain keywords in headlines. Fancy text may not match those searches, so keep your main job title in normal letters.',
      'Bold and italic styles are safer than decorative ones for a professional audience.',
    ],
    faqs: [
      {
        q: 'Is fancy text professional on LinkedIn?',
        a: 'It depends on your field. Creative industries are fine with a little style, while formal ones may prefer plain text. Use it lightly.',
      },
      {
        q: 'Will it affect how people find my profile?',
        a: 'It can. Search looks for normal letters, so decorative text in your headline may not match. Keep key skills and titles plain.',
      },
      {
        q: 'Where is the best place to use stylized text on LinkedIn?',
        a: 'Many creators use bold unicode text for headline hooks, section dividers, or key bullet points in text posts. Avoid styling your legal name or job title so recruiters can search for you without issues.',
      }
    ],
  },
  {
    slug: 'threads-font-generator',
    kind: 'font',
    group: 'Font Generators',
    platform: 'Threads',
    name: 'Threads Font Generator',
    title: 'Threads Font Generator - Fancy Text for Posts & Bio',
    h1: 'Threads Font Generator',
    description:
      'Free Threads font generator. Create fancy text for your Threads posts and bio, then copy and paste it in seconds.',
    intro:
      'Make your Threads posts and bio look different. Type your text, choose a style and paste it into Threads.',
    tips: [
      'Threads posts are short, so one styled line at the start can grab attention without making the post hard to read.',
      'Keep names and hashtags in plain text so people can find and tap them.',
      'Use one style across your bio and posts. A consistent look feels more like a brand.',
    ],
    faqs: [
      {
        q: 'Does Threads show these styles?',
        a: 'Threads accepts normal Unicode text, so most styles paste in without trouble. Some symbols can look a little different from device to device.',
      },
      {
        q: 'Can I use them in my Threads username?',
        a: 'No. Usernames use plain characters. Use fancy text in your bio and posts instead.',
      },
      {
        q: 'Does Threads penalize posts that use custom unicode fonts?',
        a: 'No. Threads displays standard unicode characters without issue. However, using too many stylized words can reduce readability, so using styled text on the opening hook word or title works best.',
      }
    ],
  },
  {
    slug: 'twitch-font-generator',
    kind: 'font',
    group: 'Font Generators',
    platform: 'Twitch',
    name: 'Twitch Font Generator',
    title: 'Twitch Font Generator - Fancy Text for Panels & Titles',
    h1: 'Twitch Font Generator',
    description:
      'Free Twitch font generator. Make fancy text for your panels, stream title and About section, then copy and paste it.',
    intro:
      'Give your Twitch panels, stream title and About section some style. Type your text, pick a look and copy it.',
    tips: [
      'Use fancy text for panel headings like About, Schedule and Rules, so viewers can scan your page quickly.',
      'Keep your channel name plain because viewers type it to find you.',
      'Some channels block messages with many special symbols in chat, so check the chat rules before you use it there.',
    ],
    faqs: [
      {
        q: 'Where can I use fancy text on Twitch?',
        a: 'In your channel About section, panel text, stream title and chat. Each accepts normal text, so you can paste it directly.',
      },
      {
        q: 'Can chat moderators block fancy text?',
        a: 'Yes, some channels filter messages with many special symbols. If your message does not appear, try a simpler style.',
      },
      {
        q: 'Can I use custom fonts in Twitch stream titles?',
        a: 'Yes. Streamers frequently paste stylized fonts into their stream titles, about panel headers, and offline banners to make key announcement words stand out in Twitch directory listings.',
      }
    ],
  },
]

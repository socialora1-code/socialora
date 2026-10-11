import type { ToolDef } from '@/lib/tool-data/types'

export const GEN_TOOLS: readonly ToolDef[] = [
  {
    slug: 'instagram-bio-generator',
    kind: 'gen',
    group: 'Bio Generators',
    platform: 'Instagram',
    name: 'Instagram Bio Generator',
    title: 'Instagram Bio Generator - Free Bio Ideas',
    h1: 'Instagram Bio Generator',
    description:
      'Free Instagram bio generator. Type what you do and get short bio ideas you can copy, edit and paste into your profile.',
    intro:
      'Not sure what to write in your bio? Tell us what you do or post about and get a few ready-to-edit ideas that are short enough for the bio box. Press More ideas for a fresh batch.',
    widget: 'bio-instagram',
    tips: [
      'Say who you are and what people get from following you in the first few words.',
      'Add one clear next step, such as a link or "DM for collabs", not five.',
      'Update your bio when your focus changes so it stays honest.',
    ],
    faqs: [
      {
        q: 'Are these bios unique?',
        a: 'They are built from templates and your own words, so other people may get similar lines. Edit the result so it sounds like you.',
      },
      {
        q: 'How long can an Instagram bio be?',
        a: 'The bio box has a short limit that can change over time. The ideas here are kept short, but check the limit shown in your app.',
      },
    ],
    cta: {
      text: 'Want your profile to get noticed by more people? See our Instagram growth services.',
      href: '/instagram',
      label: 'See Instagram services',
    },
  },
  {
    slug: 'tiktok-bio-generator',
    kind: 'gen',
    group: 'Bio Generators',
    platform: 'TikTok',
    name: 'TikTok Bio Generator',
    title: 'TikTok Bio Generator - Short Bio Ideas',
    h1: 'TikTok Bio Generator',
    description:
      'Free TikTok bio generator. Enter what your videos are about and get short bio ideas to copy and paste into your profile.',
    intro:
      'A TikTok bio is tiny, so every word counts. Tell us what you make videos about and get short ideas that fit. Press More ideas to see another batch.',
    widget: 'bio-tiktok',
    tips: [
      'Lead with what your videos are about, so new visitors know in one second why to follow.',
      'Mention how often you post if you stick to a schedule. It sets expectations.',
      'Keep the link in the link field and use the bio for the pitch.',
    ],
    faqs: [
      {
        q: 'Can I use emoji in my TikTok bio?',
        a: 'Yes, one or two can add personality. Too many can make a short bio hard to read.',
      },
      {
        q: 'Do I need to change my bio often?',
        a: 'Not often. Update it when your content changes, or when you want to point people to a new series or link.',
      },
    ],
    cta: {
      text: 'Give your next video a stronger start. See our TikTok services.',
      href: '/tiktok',
      label: 'See TikTok services',
    },
  },
  {
    slug: 'twitter-bio-generator',
    kind: 'gen',
    group: 'Bio Generators',
    platform: 'X',
    name: 'Twitter / X Bio Generator',
    title: 'Twitter / X Bio Generator - Free Bio Ideas',
    h1: 'Twitter / X Bio Generator',
    description:
      'Free Twitter and X bio generator. Type your topic and get bio ideas that are short enough for your X profile.',
    intro:
      'Your X bio is the first thing people read before they follow. Enter your topic, get a few clear bio ideas and edit them to fit your voice.',
    widget: 'bio-x',
    tips: [
      'Say what you post about and who it is for. Vague bios get fewer follows.',
      'A little personality helps, but clarity comes first.',
      'Pin your best post, so the bio and the pinned post work together.',
    ],
    faqs: [
      {
        q: 'What should a good X bio include?',
        a: 'Your topic, a reason to follow you, and maybe one personal detail. Skip long lists of titles.',
      },
      {
        q: 'Should I add hashtags to my bio?',
        a: 'It is usually not needed. Plain words read better, and your posts are where hashtags matter.',
      },
    ],
    cta: {
      text: 'Want your X profile to look more established? See our X services.',
      href: '/x',
      label: 'See X services',
    },
  },
  {
    slug: 'facebook-bio-generator',
    kind: 'gen',
    group: 'Bio Generators',
    platform: 'Facebook',
    name: 'Facebook Bio Generator',
    title: 'Facebook Bio Generator - Short Intro Ideas',
    h1: 'Facebook Bio Generator',
    description:
      'Free Facebook bio generator. Enter your interests and get short intro ideas you can copy into your profile.',
    intro:
      'Facebook intros are short and friendly. Tell us what you are into and get a few ideas to copy, tweak and paste into your profile.',
    widget: 'bio-facebook',
    tips: [
      'Keep it warm and simple. Facebook is more personal than most platforms.',
      'Use the bio for one or two interests, not your whole life story.',
      'Check who can see your intro in the privacy settings.',
    ],
    faqs: [
      {
        q: 'Is a Facebook bio the same as the About section?',
        a: 'No. The bio (intro) is a short line at the top of your profile. The About section has more room for details like work and places.',
      },
      {
        q: 'Can I use these for a Facebook page?',
        a: 'You can adapt them. Pages usually need a clearer description of what the business or project does.',
      },
    ],
  },
  {
    slug: 'discord-bio-generator',
    kind: 'gen',
    group: 'Bio Generators',
    platform: 'Discord',
    name: 'Discord Bio Generator',
    title: 'Discord Bio Generator - About Me Ideas',
    h1: 'Discord Bio Generator',
    description:
      'Free Discord bio generator. Type your interests and get About Me ideas for your Discord profile.',
    intro:
      'Give your Discord profile a short About Me that sounds like you. Enter what you are into and press More ideas until one feels right.',
    widget: 'bio-discord',
    tips: [
      'Mention the games, topics or communities you enjoy, so people find common ground.',
      'Keep it light. A bio that is easy to read gets more friendly messages.',
      'Do not share private information such as your address or school.',
    ],
    faqs: [
      {
        q: 'Where do I put my Discord bio?',
        a: 'Open your profile settings and look for the About Me section. Paste your text there and save.',
      },
      {
        q: 'Can I use Discord formatting in my bio?',
        a: 'Basic formatting like bold and italic works in many places. Test how it looks on your profile after saving.',
      },
    ],
  },
  {
    slug: 'instagram-hashtag-generator',
    kind: 'gen',
    group: 'Hashtag Generators',
    platform: 'Instagram',
    name: 'Instagram Hashtag Generator',
    title: 'Instagram Hashtag Generator - Free Hashtag Ideas',
    h1: 'Instagram Hashtag Generator',
    description:
      'Free Instagram hashtag generator. Type a topic and get hashtag ideas you can copy and paste under your post.',
    intro:
      'Enter your topic and get sets of hashtag ideas built from your keyword. Copy a set, paste it under your post and swap out any tag that does not fit.',
    widget: 'hashtag-instagram',
    tips: [
      'Mix broad and specific tags. Very broad tags are crowded, very narrow ones reach few people.',
      'Use tags that truly describe the post. Relevance matters more than quantity.',
      'Check how active a hashtag is by searching it in the app before you use it.',
    ],
    faqs: [
      {
        q: 'Do these hashtags show what is trending?',
        a: 'No. They are ideas built from your keyword. Search each tag in the app to see how active it is.',
      },
      {
        q: 'How many hashtags should I use?',
        a: 'Instagram’s advice can change, so check its current guidance. A small set of relevant tags is a safe place to start.',
      },
    ],
    cta: {
      text: 'Want your posts to start stronger? See our Instagram services.',
      href: '/instagram',
      label: 'See Instagram services',
    },
  },
  {
    slug: 'facebook-hashtag-generator',
    kind: 'gen',
    group: 'Hashtag Generators',
    platform: 'Facebook',
    name: 'Facebook Hashtag Generator',
    title: 'Facebook Hashtag Generator - Free Hashtag Ideas',
    h1: 'Facebook Hashtag Generator',
    description:
      'Free Facebook hashtag generator. Enter your topic and get short sets of hashtag ideas to copy into your posts.',
    intro:
      'Facebook posts work best with only a few hashtags. Enter your topic and get small sets built from your keyword.',
    widget: 'hashtag-facebook',
    tips: [
      'Use two or three relevant tags, not a long wall of them.',
      'Put hashtags at the end of the post so the text stays easy to read.',
      'Create one branded tag for your page and use it consistently.',
    ],
    faqs: [
      {
        q: 'Do hashtags matter on Facebook?',
        a: 'They help a little with grouping posts by topic, but they matter less than on Instagram. Good content comes first.',
      },
      {
        q: 'Are the hashtags checked for popularity?',
        a: 'No. They are built from your keyword. Search them on Facebook to see if they are active.',
      },
    ],
  },
  {
    slug: 'instagram-username-generator',
    kind: 'gen',
    group: 'Name & Idea Generators',
    platform: 'Instagram',
    name: 'Instagram Username Generator',
    title: 'Instagram Username Generator - Name Ideas',
    h1: 'Instagram Username Generator',
    description:
      'Free Instagram username generator. Enter a name or word and get username ideas that fit the 30 character limit.',
    intro:
      'Looking for a username that is clean and easy to remember? Enter your name or a word you like, add a niche if you want, and get ideas that fit Instagram’s length limit.',
    widget: 'username-instagram',
    tips: [
      'Short and easy to spell beats clever. People need to type it from memory.',
      'Avoid long strings of numbers. They look like spam and are hard to remember.',
      'Use the same username on other platforms when you can, so people find you easily.',
    ],
    faqs: [
      {
        q: 'Does the tool check if a name is available?',
        a: 'No. Search each idea in the Instagram app. If it is taken, add a small change like a period or a word.',
      },
      {
        q: 'Can I change my Instagram username later?',
        a: 'Yes, but old links and tags may stop working, so think about it before you build an audience.',
      },
    ],
    cta: {
      text: 'Ready to grow your new profile? See our Instagram services.',
      href: '/instagram',
      label: 'See Instagram services',
    },
  },
  {
    slug: 'tiktok-caption-generator',
    kind: 'gen',
    group: 'Caption Generators',
    platform: 'TikTok',
    name: 'TikTok Caption Generator',
    title: 'TikTok Caption Generator - Free Caption Ideas',
    h1: 'TikTok Caption Generator',
    description:
      'Free TikTok caption generator. Enter your video topic and get short caption ideas you can copy in one tap.',
    intro:
      'Short captions that spark curiosity get more people to watch till the end. Enter your video topic and get caption ideas to tweak and use.',
    widget: 'caption-tiktok',
    tips: [
      'Open a loop in the caption, such as "wait for the end", and pay it off in the video.',
      'Ask a question people can answer in one line. It makes commenting easy.',
      'Keep captions short so they are not cut off.',
    ],
    faqs: [
      {
        q: 'Do captions affect views?',
        a: 'Captions help viewers understand and react to a video, but nobody can promise more views from them. Great video content matters most.',
      },
      {
        q: 'Should I add hashtags to the caption?',
        a: 'A few relevant hashtags can help describe the video. Use our hashtag ideas, or pick tags from the app’s search.',
      },
    ],
    cta: {
      text: 'Give your next video a stronger start. See our TikTok services.',
      href: '/tiktok',
      label: 'See TikTok services',
    },
  },
  {
    slug: 'facebook-caption-generator',
    kind: 'gen',
    group: 'Caption Generators',
    platform: 'Facebook',
    name: 'Facebook Caption Generator',
    title: 'Facebook Caption Generator - Free Post Ideas',
    h1: 'Facebook Caption Generator',
    description:
      'Free Facebook caption generator. Enter your post topic and get friendly caption ideas to copy and use.',
    intro:
      'Facebook captions that ask a question or tell a short story get more replies. Enter your post topic and get ideas you can edit.',
    widget: 'caption-facebook',
    tips: [
      'End with a question. Posts that invite replies tend to feel more alive.',
      'Write like you talk. Friendly and simple works best on Facebook.',
      'Add one photo or video. Posts with media usually stand out more in the feed.',
    ],
    faqs: [
      {
        q: 'How long should a Facebook caption be?',
        a: 'Short is fine. A line or two with a clear point works well. Longer posts are good for stories people care about.',
      },
      {
        q: 'Can I use these for my business page?',
        a: 'Yes. Adjust the tone to match your brand, and add a clear next step if you want people to act.',
      },
    ],
  },
  {
    slug: 'snapchat-caption-generator',
    kind: 'gen',
    group: 'Caption Generators',
    platform: 'Snapchat',
    name: 'Snapchat Caption Generator',
    title: 'Snapchat Caption Generator - Short Caption Ideas',
    h1: 'Snapchat Caption Generator',
    description:
      'Free Snapchat caption generator. Type a topic and get short, fun caption ideas for your snaps and stories.',
    intro:
      'Snaps need short captions that fit the moment. Enter what you are posting about and get quick ideas you can copy.',
    widget: 'caption-snapchat',
    tips: [
      'Keep it to a few words. Long text covers the picture.',
      'Match the mood of the snap. A short, honest caption beats a clever one.',
      'Use contrast: put light text on dark photos and dark text on bright ones.',
    ],
    faqs: [
      {
        q: 'Can I use these for Stories too?',
        a: 'Yes. They work for snaps, Stories and Spotlight, as long as they match the content.',
      },
      {
        q: 'Do the captions work on other platforms?',
        a: 'Many of them do. Short lines like these also fit Instagram Stories and TikTok text overlays.',
      },
    ],
  },
  {
    slug: 'youtube-tag-generator',
    kind: 'gen',
    group: 'Name & Idea Generators',
    platform: 'YouTube',
    name: 'YouTube Tag Generator',
    title: 'YouTube Tag Generator - Free Tag Ideas for Videos',
    h1: 'YouTube Tag Generator',
    description:
      'Free YouTube tag generator. Enter your video topic and get tag ideas you can copy into YouTube Studio.',
    intro:
      'Tags help describe what your video is about. Enter your topic and get comma-separated tag ideas to paste into YouTube Studio. Keep the ones that fit your video.',
    widget: 'youtube-tags',
    tips: [
      'Put your main topic first, then add related phrases people could actually search.',
      'Only use tags that describe the video. Unrelated tags can hurt trust and may break the rules.',
      'Your title, thumbnail and first seconds matter more than tags. Treat tags as a small extra.',
    ],
    faqs: [
      {
        q: 'Do YouTube tags still matter?',
        a: 'They play a small role, mostly for spelling variations and context. Titles, descriptions and viewer reaction matter more.',
      },
      {
        q: 'Are these tags based on search data?',
        a: 'No. They are keyword ideas built from your topic. Check YouTube’s search suggestions to see what people really type.',
      },
    ],
    cta: {
      text: 'Working toward monetization? See our YouTube views, watch time and subscribers.',
      href: '/youtube',
      label: 'See YouTube services',
    },
  },
  {
    slug: 'youtube-channel-name-generator',
    kind: 'gen',
    group: 'Name & Idea Generators',
    platform: 'YouTube',
    name: 'YouTube Channel Name Generator',
    title: 'YouTube Channel Name Generator - Name Ideas',
    h1: 'YouTube Channel Name Generator',
    description:
      'Free YouTube channel name generator. Enter your topic and get channel name ideas to check and use.',
    intro:
      'Picking a channel name is hard. Enter your topic, add your name if you like, and get a list of ideas. Press More ideas for new ones.',
    widget: 'youtube-channel-names',
    tips: [
      'Choose a name that is easy to say and spell. People will search it from memory.',
      'Think about the future. A name tied to one narrow topic can limit you later.',
      'Search the name on YouTube and other platforms before you commit.',
    ],
    faqs: [
      {
        q: 'Can I change my channel name later?',
        a: 'Yes, but a change can confuse your audience, so it is better to pick well from the start.',
      },
      {
        q: 'Should my name include a keyword?',
        a: 'It can help people understand your topic, but a memorable name matters more than stuffing keywords.',
      },
    ],
    cta: {
      text: 'Starting a new channel? See our YouTube services.',
      href: '/youtube',
      label: 'See YouTube services',
    },
  },
  {
    slug: 'instagram-content-ideas-generator',
    kind: 'gen',
    group: 'Name & Idea Generators',
    platform: 'Instagram',
    name: 'Instagram Content Ideas Generator',
    title: 'Instagram Content Ideas Generator - Post & Reel Ideas',
    h1: 'Instagram Content Ideas Generator',
    description:
      'Free Instagram content ideas generator. Enter your niche and get post and Reel ideas you can use this week.',
    intro:
      'Out of ideas? Enter your niche and get post and Reel ideas to try. Press More ideas for another batch, then pick the ones that feel natural for you.',
    widget: 'content-ideas-instagram',
    tips: [
      'Turn one idea into several formats: a Reel, a carousel and a Story.',
      'Answer real questions from your comments and messages. They are the best source of topics.',
      'Plan a week at a time so you are not stuck deciding every day.',
    ],
    faqs: [
      {
        q: 'Are these ideas unique?',
        a: 'They are common formats that work across many niches. Your own experience and examples are what make them unique.',
      },
      {
        q: 'How often should I post?',
        a: 'Pick a pace you can keep up. Steady posting beats a burst of posts followed by silence.',
      },
    ],
    cta: {
      text: 'Want your next post to start stronger? See our Instagram services.',
      href: '/instagram',
      label: 'See Instagram services',
    },
  },
]

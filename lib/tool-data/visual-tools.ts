import type { ToolDef } from '@/lib/tool-data/types'

export const VISUAL_TOOLS: readonly ToolDef[] = [
  {
    slug: 'instagram-grid-maker',
    kind: 'grid',
    group: 'Visual Tools',
    platform: 'Instagram',
    name: 'Instagram Grid Maker',
    title: 'Instagram Grid Maker - Split a Photo into a 3x3 Grid',
    h1: 'Instagram Grid Maker',
    description:
      'Free Instagram grid maker. Split one photo into a 3x3, 3x2 or 3x1 grid of tiles and download them to post as a giant picture on your profile.',
    intro:
      'Turn one big photo into a grid of tiles for your profile. Pick your photo, choose the grid size and download every tile. Your photo stays on your device.',
        about: [
      'A split grid turns one photo into a single large picture across your profile. Visitors see a bigger, more memorable image, and it works well for launches, announcements and portfolio covers.',
      'Instagram profile tiles are shown in a 3-column layout, so 3x3 gives you nine posts, 3x2 six posts and 3x1 a clean three-post banner. Choose the portrait 3:4 shape if your profile shows the newer tall grid, or the square shape for the classic look.',
      'Post the tiles in reverse order, last tile first, so Post 1 lands in the top-left corner. Everything runs in your browser, so your original photo is never uploaded.',
    ],
    tips: [
      'Post the tiles in reverse order, starting with the last one, so the picture lines up on your profile.',
      'Pick a photo with a clear subject in the middle. Tiny details get lost when the photo is split.',
      'Use a large, sharp photo. Small photos look blurry once they are cut into pieces.',
    ],
    faqs: [
      {
        q: 'Is my photo uploaded anywhere?',
        a: 'No. The photo is cut right in your browser and never leaves your device.',
      },
      {
        q: 'In what order should I post the tiles?',
        a: 'Start with the last tile and finish with the first one. That way the first tile ends up in the top left corner of your profile.',
      },
      {
        q: 'Which grid sizes can I make?',
        a: 'You can split a photo into 3x3, 3x2 or 3x1 tiles.',
      },
    ],
  },
  {
    slug: 'social-media-photo-resizer',
    kind: 'resize',
    group: 'Visual Tools',
    platform: 'Social Media',
    name: 'Social Media Photo Resizer',
    title: 'Social Media Photo Resizer - Instagram, Story, YouTube and X Sizes',
    h1: 'Social Media Photo Resizer',
    description:
      'Free social media photo resizer. Crop and resize any photo to the right size for Instagram posts, Stories, TikTok, YouTube thumbnails, YouTube banners and X headers.',
    intro:
      'Pick your photo, choose where you want to post it and download it at the right size. Everything happens in your browser, so your photo stays private.',
    tips: [
      'Keep the important part of your photo near the center, because the edges are cropped to fit.',
      'Start with a big, sharp photo. Enlarging a small photo makes it look blurry.',
      'Use the Story and TikTok size for any vertical video cover or Reels cover.',
    ],
    faqs: [
      {
        q: 'Is my photo uploaded anywhere?',
        a: 'No. Resizing happens on your device and nothing is sent to a server.',
      },
      {
        q: 'Why does the photo look cropped?',
        a: 'Each platform uses a different shape. The tool fills the new shape and trims whatever does not fit.',
      },
      {
        q: 'Which sizes are included?',
        a: 'Instagram post, Instagram square, Instagram and TikTok Story, YouTube thumbnail, YouTube banner and X header.',
      },
    ],
  },
  {
    slug: 'copy-paste-symbols',
    kind: 'symbols',
    group: 'Visual Tools',
    platform: 'Social Media',
    name: 'Copy and Paste Symbols',
    title: 'Copy and Paste Symbols - Cool Symbols for Bios and Captions',
    h1: 'Copy and Paste Symbols',
    description:
      'Free copy and paste symbols for Instagram bios, TikTok, captions and usernames. Tap any symbol to copy hearts, stars, arrows, lines and more.',
    intro:
      'Tap any symbol to copy it, then paste it into your bio, caption or name. Pick a category to find what you need fast.',
    tips: [
      'Use a few symbols as line dividers in your bio. Too many make it hard to read.',
      'Check how a symbol looks on your phone. Some devices draw symbols a little differently.',
      'Arrows and hearts work well at the start of a line to point people to your link.',
    ],
    faqs: [
      {
        q: 'How do I copy a symbol?',
        a: 'Tap the symbol. It is copied to your clipboard, and you can paste it anywhere.',
      },
      {
        q: 'Do these work on Instagram and TikTok?',
        a: 'Yes. They are normal text characters, so you can paste them into bios, captions, comments and names.',
      },
      {
        q: 'Why does a symbol look different on another phone?',
        a: 'Each device has its own font, so the same symbol can look slightly different.',
      },
    ],
  },
  {
    slug: 'follower-goal-calculator',
    kind: 'goal',
    group: 'Visual Tools',
    platform: 'Instagram',
    name: 'Follower Goal Calculator',
    title: 'Follower Goal Calculator - How Long to Reach Your Follower Goal',
    h1: 'Follower Goal Calculator',
    description:
      'Free follower goal calculator. Enter your followers, your goal and how many you gain each week to see how long it takes and how your growth looks on a chart.',
    intro:
      'Find out how long it takes to reach your follower goal. Enter where you are, where you want to be and how many followers you gain per week.',
    tips: [
      'Use your real average from the last month, not your best week.',
      'Growth is rarely steady. Treat the result as a rough estimate.',
      'Set smaller goals along the way, like your next 1,000. They keep you going.',
    ],
    faqs: [
      {
        q: 'Is the result exact?',
        a: 'No. It is an estimate based on steady growth, and real growth goes up and down.',
      },
      {
        q: 'What if I gain a different number each week?',
        a: 'Use your average over the last few weeks.',
      },
      {
        q: 'Does it work for TikTok, YouTube and X?',
        a: 'Yes. It only uses numbers, so you can use it for any platform.',
      },
    ],
    cta: {
      text: 'Want to move faster? See our services for Instagram, TikTok, YouTube and X.',
      href: '/instagram',
      label: 'See Instagram services',
    },
  },
  {
    slug: 'instagram-no-crop-blur-background',
    kind: 'fit',
    group: 'Visual Tools',
    platform: 'Instagram',
    name: 'Instagram No Crop Photo Maker',
    title: 'Instagram No Crop Tool - Fit Any Photo with a Blur Background',
    h1: 'Instagram No Crop Photo Maker (Blur Background)',
    description:
      'Free tool to fit any photo or screenshot into an Instagram post, Story or Reel without cropping. The empty space is filled with a blurred copy of your photo.',
    intro:
      'Post your whole photo without cutting anything off. Choose your photo and where you will post it, and the empty space is filled with a soft blurred background. Your photo stays on your device.',
    tips: [
      'Use the 4:5 size for feed posts. It takes up more of the screen than a square.',
      'For Stories and Reels, try all three blur strengths and keep the one that matches your photo best.',
      'Start with a large, sharp photo. Your photo is placed at full quality, only the background is blurred.',
    ],
    faqs: [
      {
        q: 'Is my photo uploaded anywhere?',
        a: 'No. Everything happens in your browser and nothing is sent to a server.',
      },
      {
        q: 'Why is there a blurred background?',
        a: 'When your photo does not match the shape of a post or Story, there is empty space. The tool fills it with a blurred copy of the same photo so nothing has to be cropped.',
      },
      {
        q: 'Which sizes can I make?',
        a: 'Instagram post 4:5, Story, Reels and TikTok 9:16, square 1:1 and YouTube thumbnail 16:9.',
      },
    ],
  },
  {
    slug: 'reels-tiktok-safe-zone-guide',
    kind: 'safezone',
    group: 'Visual Tools',
    platform: 'Instagram',
    name: 'Reels and TikTok Safe Zone Guide',
    title: 'Reels, TikTok and Shorts Safe Zone Guide - Free Overlay',
    h1: 'Reels, TikTok and YouTube Shorts Safe Zone Guide',
    description:
      'Free safe zone guide for Instagram Reels, TikTok and YouTube Shorts. See where buttons and captions cover your video and download a transparent overlay for your editor.',
    intro:
      'Keep your text and faces out of the areas the app covers with buttons and captions. Pick a platform, add a frame from your video if you like, and download a transparent guide to place over your video in any editor.',
    tips: [
      'Put titles, subtitles and calls to action inside the green box.',
      'Download the overlay, place it on top of your video in your editor, then remove it before you export.',
      'Apps change their layouts from time to time, so check your video in the app preview before you post.',
    ],
    faqs: [
      {
        q: 'Are the safe zones exact?',
        a: 'No. They are approximate guides. Each app can change its layout, and phones have different screen shapes, so leave a little extra space.',
      },
      {
        q: 'Is my image uploaded anywhere?',
        a: 'No. The guide is drawn in your browser and nothing is sent to a server.',
      },
      {
        q: 'How do I use the overlay?',
        a: 'Download the transparent PNG and add it as the top layer in your editor, such as CapCut or Canva. Place your text inside the green box, then delete the overlay before you export your video.',
      },
    ],
  },
  {
    slug: 'video-frame-to-thumbnail',
    kind: 'frame',
    group: 'Visual Tools',
    platform: 'YouTube',
    name: 'Video Frame to Thumbnail Maker',
    title: 'Video Frame to Thumbnail - Pick a Frame and Save It as an Image',
    h1: 'Video Frame to Thumbnail Maker',
    description:
      'Free tool to pick any frame from your video and save it as a thumbnail or cover image for YouTube, Reels or TikTok. Your video stays on your device.',
    intro:
      'Find the best moment in your video and save it as a cover image. Choose your video file, move to the frame you like and save it in the size you need. Your video never leaves your device.',
    tips: [
      'Pick a frame where the face is clear and the eyes are open.',
      'Avoid frames with motion blur. Use the 0.1 second buttons to step to a sharper frame.',
      'Leave some empty space in the frame, so you can add text later.',
    ],
    faqs: [
      {
        q: 'Is my video uploaded anywhere?',
        a: 'No. The frame is taken in your browser, so your video stays on your device and large files are fine.',
      },
      {
        q: 'Which video files work?',
        a: 'Files your browser can play, which includes most MP4 videos. If a file does not open, try converting it to MP4.',
      },
      {
        q: 'The image looks black. What should I do?',
        a: 'Wait until the video has loaded, move the slider a little and capture the frame again.',
      },
    ],
    cta: {
      text: 'Working on your channel? See our YouTube views, watch time and subscribers.',
      href: '/youtube',
      label: 'See YouTube services',
    },
  },
]

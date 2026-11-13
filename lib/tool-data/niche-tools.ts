import type { ToolFaq } from '@/lib/tool-data/types'

const GENERATOR_NAMES = {
  'instagram-bio-generator': 'Instagram Bio Generator',
  'instagram-hook-generator': 'Instagram Hook Generator',
  'instagram-hashtag-generator': 'Instagram Hashtag Generator',
  'instagram-caption-generator': 'Instagram Caption Generator',
  'instagram-username-generator': 'Instagram Username Generator',
} as const

type GeneratorSlug = keyof typeof GENERATOR_NAMES

interface NicheContent {
  niche: string
  audience: string
  description: string
  inputs: [string, string?]
  example: string
  faq: ToolFaq
  nextStep: string
  captions?: string[]
  tags?: string[]
}

const NICHES: Record<GeneratorSlug, readonly NicheContent[]> = {
  'instagram-bio-generator': [
    {
      niche: 'real-estate', audience: 'Real Estate Agents',
      description: 'Write an Instagram bio that tells buyers where you work, which homes you specialize in and how to book a viewing.',
      inputs: ['Austin first-time buyer agent', 'East Austin homes'],
      example: 'Helping first-time buyers in East Austin | DM VIEWING for this week’s openings',
      faq: { q: 'What should a real estate agent put in an Instagram bio?', a: 'Use a market, a buyer or seller specialty and one contact action. Include your brokerage or license details where your local rules require them.' },
      nextStep: 'Send your bio to someone outside your market. See if they can name your service area and explain how they would book a viewing.',
    },
    {
      niche: 'beauty-salon', audience: 'Beauty Salons',
      description: 'Create an Instagram bio that names your signature salon service, location and booking option in a few lines.',
      inputs: ['Balayage and color correction', 'Portland, Pearl District'],
      example: 'Balayage + color correction in Portland | Book a color consultation below',
      faq: { q: 'How do I fit multiple salon services in one bio?', a: 'Lead with the service you most want to book. Put the full menu in your booking link or a pinned service post.' },
      nextStep: 'Tap your booking link on a phone and check that the signature service named in the bio is easy to find.',
    },
    {
      niche: 'tattoo-studio', audience: 'Tattoo Studios',
      description: 'Draft a tattoo studio Instagram bio that names your style, neighborhood and consultation process.',
      inputs: ['Fine line botanical tattoos', 'Brooklyn appointments'],
      example: 'Fine line botanical tattoos in Brooklyn | Submit placement, size and references for a quote',
      faq: { q: 'Should my tattoo bio say whether I take walk-ins?', a: 'Yes. State walk-in or appointment-only availability and link to a brief explaining how to request a design and estimate.' },
      nextStep: 'Check that your booking form asks for the same details your bio tells clients to prepare.',
    },
    {
      niche: 'interior-design', audience: 'Interior Designers',
      description: 'Write an Instagram bio that shows your design specialty, project area and how clients can request a consultation.',
      inputs: ['Small space interior design', 'Chicago condos'],
      example: 'Space planning for Chicago condos | Book a layout consultation',
      faq: { q: 'Should a designer list a city or a project type first?', a: 'Lead with the qualifier that matters most to clients. Local installation needs a clear city. A remote consultation can lead with the type of project.' },
      nextStep: 'Pin one project that matches the service named in your bio so visitors can see your approach before enquiring.',
    },
    {
      niche: 'pet-groomer', audience: 'Pet Groomers',
      description: 'Build a pet groomer Instagram bio that explains your services, service area and how owners can request an appointment.',
      inputs: ['Dog grooming and puppy trims', 'North Raleigh'],
      example: 'Puppy trims + dog grooming in North Raleigh | Request a first visit below',
      faq: { q: 'What details help first-time grooming clients?', a: 'Name the pet type, service area and booking method. Put vaccine requirements, pricing and appointment prep on the booking page.' },
      nextStep: 'Open your booking page as a new client and check that it explains how to prepare for a puppy’s first groom.',
    },
  ],
  'instagram-hook-generator': [
    {
      niche: 'fitness-coach', audience: 'Fitness Coaches',
      description: 'Draft the opening line of a coaching Reel around a specific form cue, exercise demo or training mistake.',
      inputs: ['Squat heel lift'],
      example: 'Heels lifting on squats? Film one rep from the side and check where your weight shifts.',
      faq: { q: 'What makes a useful fitness Reel hook?', a: 'Show one observable cue in the first clip, then demonstrate how to check it. Use a training cue and avoid promising a result or treating pain.' },
      nextStep: 'Place the hook over the first side-view rep so viewers can see the movement cue immediately.',
    },
    {
      niche: 'saas', audience: 'SaaS Teams',
      description: 'Write Instagram Reel hooks for product demos that show a real task, workflow shortcut or feature before explaining it.',
      inputs: ['Invoice approval queue'],
      example: 'Still chasing invoice approvals in chat? Watch what happens when a request enters one queue.',
      faq: { q: 'How can a SaaS team hook viewers without a big performance claim?', a: 'Name a familiar workflow problem, then show one click and its result. Use measured time savings only when you can reproduce them.' },
      nextStep: 'Record the exact workflow in the hook with sample data and cut the loading time from the clip.',
    },
    {
      niche: 'gaming', audience: 'Gaming Creators',
      description: 'Create opening lines for gaming Reels about a rank decision, loadout tradeoff or quick replay breakdown.',
      inputs: ['A late rotation on Ascent'],
      example: 'We lost this round before the fight. Watch the minimap when I leave mid.',
      faq: { q: 'How much match context belongs in the hook?', a: 'Give only the cue needed to follow the replay, such as the map, rank or decision. Show the clip before explaining the entire round.' },
      nextStep: 'Check the minimap at phone size and move any caption that covers the relevant player icon.',
    },
    {
      niche: 'crypto', audience: 'Crypto Educators',
      description: 'Draft educational Reel hooks that explain crypto concepts, such as wallet approvals, gas fees and transaction history.',
      inputs: ['Token approvals in a wallet'],
      example: 'What does a token approval let an app do? Here is the permission I check on a demo wallet.',
      faq: { q: 'Can I write a crypto hook without price predictions?', a: 'Yes. Start with a concrete concept or interface action, then show it using sample data or a demo wallet. Keep account details and recovery phrases out of the recording.' },
      nextStep: 'Use a test wallet and review the recording for private information before sharing it.',
    },
    {
      niche: 'home-renovation', audience: 'Home Renovation Pros',
      description: 'Write a renovation Reel hook that points to a measurable detail in a site walkthrough, finish comparison or installation demo.',
      inputs: ['Cabinet door clearances'],
      example: 'Before ordering a wider cabinet, open this door all the way and measure the clearance.',
      faq: { q: 'What can I show instead of a finished room reveal?', a: 'Show the decision behind the result, such as checking door swing before choosing a cabinet width. Keep the measurement in frame.' },
      nextStep: 'Open with a close-up of the clearance and keep the tape visible when the caption appears.',
    },
  ],
  'instagram-hashtag-generator': [
    {
      niche: 'wedding-photography', audience: 'Wedding Photographers',
      description: 'Generate Instagram hashtag ideas around a wedding venue, city or photography style to review before you publish.',
      inputs: ['Seattle weddings', 'Courthouse ceremony'],
      example: '#seattleweddings #courthouseceremony #seattleweddingscourthouseceremony',
      faq: { q: 'Should wedding photographers use venue hashtags?', a: 'A venue tag is useful when the venue is actually in the photos and local couples use the tag. Check the results in Instagram before posting.' },
      nextStep: 'Keep the tags that match the venue or style shown, then put the venue name in the caption where people can read it.',
    },
    {
      niche: 'ecommerce', audience: 'Ecommerce Brands',
      description: 'Generate Instagram hashtag ideas from your product category and the use case buyers would recognize.',
      inputs: ['Packing cubes', 'Carry on travel'],
      example: '#packingcubes #carryontravel #packingcubescarryontravel',
      faq: { q: 'Do product hashtags work better than store hashtags?', a: 'They serve different jobs. A product tag describes what someone sees in the post. A store tag groups your own posts and customer photos.' },
      nextStep: 'Choose tags based on the item shown, then check that the product page uses the same product name as the post.',
    },
    {
      niche: 'coffee-shop', audience: 'Coffee Shops',
      description: 'Generate Instagram hashtag ideas from your cafe neighborhood, drink special or brewing method.',
      inputs: ['Capitol Hill coffee', 'Iced matcha'],
      example: '#capitolhillcoffee #icedmatcha #capitolhillcoffeeicedmatcha',
      faq: { q: 'How specific should coffee shop hashtags be?', a: 'Start with the neighborhood and the drink or event shown. Browse the results to see whether locals use the tag and whether the posts match your subject.' },
      nextStep: 'Add the neighborhood in the caption and use the correct location tag so people can find your shop.',
    },
    {
      niche: 'yoga-studio', audience: 'Yoga Studios',
      description: 'Generate Instagram hashtag ideas for a yoga class by combining the practice, neighborhood and intended class level.',
      inputs: ['Restorative yoga', 'South Loop'],
      example: '#restorativeyoga #southloop #restorativeyogasouthloop',
      faq: { q: 'What should I tag on a beginner yoga class post?', a: 'Use the class style and neighborhood, and mention beginner level in the caption. Use a beginner tag only if the class actually welcomes first-time students.' },
      nextStep: 'Check that the booking page lists the same class style, level and location as the Instagram post.',
    },
    {
      niche: 'handmade-jewelry', audience: 'Handmade Jewelry Makers',
      description: 'Generate Instagram hashtag ideas using the metal, technique or item shown in a handmade jewelry post.',
      inputs: ['Silver stacking rings', 'Hammered texture'],
      example: '#silverstackingrings #hammeredtexture #silverstackingringshammeredtexture',
      faq: { q: 'Should I tag the material or the style of my jewelry?', a: 'Use both when accurate. Material helps describe the piece and style gives context, such as stacking rings or minimalist earrings.' },
      nextStep: 'Check that the photos and product page support each material or process you mention.',
    },
  ],
  'instagram-caption-generator': [
    {
      niche: 'restaurant', audience: 'Restaurants',
      description: 'Write Instagram captions for a menu special, new dish or reservation post with a concrete detail and a next step.',
      inputs: ['Friday mushroom risotto'],
      example: 'Friday’s mushroom risotto is on the dinner menu. Reserve a table through the link in our profile.',
      faq: { q: 'What belongs in a caption for a limited menu special?', a: 'Name the dish, when it is available and how to book or order. Only mention quantities or dietary details you can verify.' },
      nextStep: 'Test the reservation link and check that the day mentioned in the caption is available.',
      captions: ['Tonight on the menu: {t}. Book a table through our profile.', 'Meet {t}. Ask your server about this week’s menu.', 'Planning dinner? {t} is on the menu. See our hours and reservations in the bio.'],
      tags: ['restaurantspecial', 'dinnermenu', 'restaurantmenu'],
    },
    {
      niche: 'event-planner', audience: 'Event Planners',
      description: 'Draft Instagram captions for event walkthroughs and portfolio reveals that show a planning decision and invite an enquiry.',
      inputs: ['Garden reception layout'],
      example: 'This garden reception kept the bar off the main path so guests could reach their seats easily. Ask us about planning a similar layout.',
      faq: { q: 'How can an event planner describe a client project?', a: 'Explain one planning decision and get permission for names, locations and identifiable photos. Give prospective clients a clear way to enquire.' },
      nextStep: 'Pair the caption with the photo that makes the layout decision visible.',
      captions: ['A look at {t}. Tell us your guest count and venue if you want help with a similar setup.', 'Behind the scenes of {t}. Swipe to see how the space was organized.', 'Planning something like {t}? Use the enquiry link in our profile to share your date.'],
      tags: ['eventplanning', 'eventdesign', 'eventlayout'],
    },
    {
      niche: 'dog-trainer', audience: 'Dog Trainers',
      description: 'Write Instagram captions for a dog training demo that identifies the exercise and gives owners an appropriate next step.',
      inputs: ['Loose leash practice'],
      example: 'Loose leash practice starts here with one calm step and a reward. Try it in a quiet area before adding distractions.',
      faq: { q: 'How specific should a dog training caption be?', a: 'Describe the behavior shown and a simple practice condition, such as a quiet hallway. For fearful or reactive dogs, point readers to individual guidance.' },
      nextStep: 'Watch the clip without audio and check whether a viewer can identify the moment you reward.',
      captions: ['Today’s demo: {t}. Start somewhere quiet and keep the session short.', 'Here is how we set up {t}. Watch for the moment the reward is delivered.', 'Working on {t}? Save this clip and contact us if you need help adapting the exercise.'],
      tags: ['dogtraining', 'dogtrainingtips', 'positivedogtraining'],
    },
    {
      niche: 'bakery', audience: 'Bakeries',
      description: 'Generate Instagram captions for bakery preorders and small batches with a pickup detail or a clear order link.',
      inputs: ['Saturday pistachio croissants'],
      example: 'Saturday pistachio croissants are open for preorder. Choose your pickup time in the order form.',
      faq: { q: 'How can I reduce questions about bakery preorders?', a: 'Include the order cutoff, pickup window and a link to the form. Put ingredient and allergen details in the listing and use verified wording.' },
      nextStep: 'Make sure the preorder form shows the same product and pickup date as the caption.',
      captions: ['Preorders are open for {t}. Choose your pickup time through our profile.', 'Fresh batch on the menu: {t}. Check the order form for pickup details.', 'Want to reserve {t}? Open the preorder link for available pickup slots.'],
      tags: ['bakerypreorder', 'localbakery', 'freshbaked'],
    },
    {
      niche: 'online-course', audience: 'Online Course Creators',
      description: 'Draft Instagram captions for lesson previews and enrollment posts that show what learners will actually practice.',
      inputs: ['Spreadsheet budgeting lesson'],
      example: 'In the spreadsheet budgeting lesson, you build a weekly expense tracker from sample data. The lesson outline is in our profile.',
      faq: { q: 'What should I include in an enrollment caption?', a: 'Mention a concrete exercise, the audience it suits and where to find the syllabus. Check the enrollment dates and prerequisites before posting.' },
      nextStep: 'Link to the lesson outline or course page and check that the exercise shown is included.',
      captions: ['Preview: {t}. Check the course outline for the full exercise and prerequisites.', 'Here is one exercise from {t}. Save the post if you want to try it later.', 'Curious about {t}? See the lesson outline and current enrollment details in our profile.'],
      tags: ['onlinelearning', 'coursepreview', 'onlinecourse'],
    },
  ],
  'instagram-username-generator': [
    {
      niche: 'podcast', audience: 'Podcasters',
      description: 'Generate Instagram username ideas using your show name and topic so listeners can find you from an episode mention.',
      inputs: ['Studio Notes', 'Design'],
      example: 'studionotes.design',
      faq: { q: 'Should my podcast username match the show name?', a: 'Keep the distinctive words from the show title. If it is taken, add a short qualifier listeners can spell when they hear it.' },
      nextStep: 'Say the handle out loud as you would on an episode, then ask someone to type it without looking.',
    },
    {
      niche: 'travel-agency', audience: 'Travel Agencies',
      description: 'Generate Instagram handle ideas for a travel agency using its name, destination niche or type of itinerary.',
      inputs: ['Map Room', 'Rail Trips'],
      example: 'maproom.railtrips',
      faq: { q: 'Should a travel agency use a destination in its handle?', a: 'Use a destination if it is the long-term focus. If you serve several places, keep the brand name in the handle and list destinations in the bio.' },
      nextStep: 'Check that the handle and agency name match the spelling on your booking page.',
    },
    {
      niche: 'nail-tech', audience: 'Nail Techs',
      description: 'Create Instagram username ideas for a nail business using your name, specialty or studio identity.',
      inputs: ['Maya', 'Nail Art'],
      example: 'nailart.by.maya',
      faq: { q: 'Should I use a city in my nail tech username?', a: 'A city can make a local business easier to recognize. If you plan to move or expand, consider using the city in your bio and booking page instead.' },
      nextStep: 'Check the handle in Instagram and make sure a client can spell it from an appointment reminder.',
    },
    {
      niche: 'music-producer', audience: 'Music Producers',
      description: 'Draft Instagram handle ideas that keep your producer alias recognizable and leave room for a genre or studio qualifier.',
      inputs: ['North Loop', 'Beats'],
      example: 'northloop.beats',
      faq: { q: 'How can I choose a handle that works across music platforms?', a: 'Start with your producer alias and check the same spelling on Instagram and the platforms where you share tracks or sell beats.' },
      nextStep: 'Compare the shortlisted handle with your artist credits and beat store spelling before choosing it.',
    },
    {
      niche: 'thrift-shop', audience: 'Thrift Shops',
      description: 'Generate Instagram handle ideas for a resale shop with its store name, vintage specialty or neighborhood.',
      inputs: ['Second Rack', 'Vintage'],
      example: 'secondrack.vintage',
      faq: { q: 'What should a thrift store add if its name is already taken?', a: 'Try a distinctive category or neighborhood that customers associate with the shop. Check that the result is easy to say and is available.' },
      nextStep: 'Read the handle aloud and check how it looks on a printed tag or pickup confirmation.',
    },
  ],
}

export const NICHE_TOOL_PAGES = (Object.keys(GENERATOR_NAMES) as GeneratorSlug[]).flatMap((toolSlug) =>
  NICHES[toolSlug].map((entry) => {
    const name = `${GENERATOR_NAMES[toolSlug]} for ${entry.audience}`
    return { ...entry, toolSlug, name, path: `/tools/${toolSlug}/${entry.niche}` }
  }),
)

export type NicheToolPage = (typeof NICHE_TOOL_PAGES)[number]

export function getNicheToolPage(toolSlug: string, niche: string) {
  return NICHE_TOOL_PAGES.find((page) => page.toolSlug === toolSlug && page.niche === niche)
}

export function getToolNiches(toolSlug: string) {
  return NICHE_TOOL_PAGES.filter((page) => page.toolSlug === toolSlug)
}

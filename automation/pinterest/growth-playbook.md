# Socialora Pinterest — Global Organic Growth Playbook
Updated 2026-11-10. Account: @socialoratools (BUSINESS). Website: https://www.getsocialora.com/tools.

## Objective and audience
Verified outbound website clicks to specific free creator tools; support with saves and organic impressions. Do not use follower count alone as the main success measure. Global English-speaking creators, freelancers and small businesses; do not target the U.S. exclusively.

## Publishing cadence
Publish up to FOUR distinctly original Pins per day across 03:30, 09:30, 15:30, 21:30 Europe/Istanbul to test global UTC dayparts. These are test slots, not verified best times.
Never more than 1 Pin per scheduled slot or 4 per Europe/Istanbul date; enforce at least 3 hours between confirmed Pins. If quality or verified destinations are insufficient, skip rather than fill quota.
Do not automatically add a fifth daily slot until sufficient unique assets and performance evidence support that experiment.
Rotate five topic boards: Instagram/Photo, Reels/TikTok, YouTube, Captions/Content Ideas, Social Media Calculators. Prefer diverse board and URL choices within a day.

## Pins that get saved and clicked
Each Pin should ANSWER a real question in the image itself, with a free relevant tool as the logical next step. Avoid product-only billboards.
Creative structures: real illustrative before/after (no fake claim), a clear 3-step how-to, annotated original example, checklist, filmstrip selection, simple formula explainer, storyboard, or short bio/caption rewrite.
Use 1000x1500 (2:3) images with phone-readable typography and visual hierarchy; 4–7 words max for natural cover hook, brief explanatory text, tiny Socialora signature. No stock watermarks, fake platform screenshots, irrelevant gradients or exaggerated promises.
Vary composition/palette. Editorial cream and charcoal, expressive photo comparison, clean violet-based illustration, infographic, and realistic UI-inspired educational concept should look unmistakably different. Never reuse one simplistic neon-purple cover template for every Pin.
Actual site screenshots are preferred only when verified as authentic. AI mockups should never imply genuine analytics. Avoid fake testimonials, fake platform endorsement, fake growth data, and unsupported monetary estimates.
Cover examples: Stop Cropping Your Best Photos; Keep Captions Off the Buttons; Make Your Bio Clear; Find a Better Thumbnail Frame; Look Beyond Likes.

## Organic search and copy
Put the accurate search topic near the start of the title, especially its first 40 characters. Natural English title and 2–3 sentence caption: one common problem, one concrete tip, one optional next step. Do not overload hashtags or keyword repeat.
Link to the EXACT related live free tool with a unique UTM campaign. Provide accurate accessible alt text and match the board search intent. Make each post genuinely useful even without a click.

## Weekly review
Read actual Pinterest per-Pin IMPRESSION, SAVE, OUTBOUND_CLICK. Compare topics and visual styles. Double down with genuinely NEW angles for topics that produce verified outbound clicks; do not repeat the same image or URL many times in a row.
New business-account historical data may show BEFORE_BUSINESS_CREATED and have reporting delays. UTM URLs do not prove visits without analytics. The 3-day report must distinguish confirmed performance from projections.
Claiming the website is separate from just placing a URL in the profile and may require a verification token. Never claim it as verified without evidence.

## No-spam rules
No automated mass-follow, bot comments, purchased traffic, engagement swaps, misleading follow tricks, ads, or rate-limit workarounds. Pause and investigate API errors; do not build a browser/Termux automation to circumvent Pinterest limits.

Reference: https://help.pinterest.com/en/business/article/pin-performance-and-distribution
Reference: https://business.pinterest.com/en-us/blog/how-to-build-audience-pinterest/


## Screenshot-first premium visual engine — effective immediately
A scheduled Pin may only use a new **verified asset** or a demonstrably superior, independently checked original design. Do not silently fall back to another purple gradient or an unverified generated UI illustration.

**Automatic preproduction:** GitHub Actions `.github/workflows/socialora-pinterest-assets.yml` runs `automation/pinterest/build_visual_assets.py` daily and on playbook/script updates. Playwright visits the REAL public tool page and verifies 200 response and readable H1; Pillow crops the authentic UI and composes an original mobile-readable 1000×1500 PNG. Generated image files live at `public/pinterest/{queue_id}.png`, and independent audit records live at `public/pinterest/visual-manifest.json`. This job creates VISUAL ASSETS ONLY; it never calls Pinterest, updates a published status, or sets a Pin ID. Wait for GitHub Action success and the publicly accessible file before treating it as ready. Missing/unreadable screenshot = SKIP, not fabricated UI.

**At each scheduled posting run:**
1. Read current queue + this playbook and verify the connected `@socialoratools` Pinterest profile, list of recent Pins, and 3-hour / 4-per-day / board-rotation gates. Do not duplicate a pending Pin just because a prior queue write failed.
2. Select the strongest eligible draft with a fresh topic and exact tool URL. Check `https://www.getsocialora.com/pinterest/visual-manifest.json` has the entry and `https://www.getsocialora.com/pinterest/{id}.png` serves a genuine image; compare source URL in manifest with the draft URL without UTM, status `asset_only_not_published`, dimensions `1000x1500` and cover hook. If Vercel has not deployed it or the image fails review, skip this slot and use no older fallback artwork.
3. **Visual QA:** view the image if tooling supports it. Big 4–7-word specific claim, 1 actionable tip, actual readable crop of the relevant tool, clear screenshot provenance, original color/layout, small brand signature, no false metrics or watermarks. Reject empty/awkward screenshots, clipped text and tiny illegible tips. Styles should rotate between bright editorial, photo/device contextual examples (when authentic), helpful comparisons, annotated walkthroughs and clean infographics. A screenshot is a component, NOT an excuse to paste an unedited website screenshot as the entire Pin. No contrived Before/After results.
4. Give an accurate English search-title whose first 40 chars carry the specific user intent, a natural 2–3-sentence description with concrete advice and no keyword stuffing, a precise real-image ALT_TEXT, matching board and original UTM destination. Publish at MOST ONE using official `PINTEREST_CREATE_PIN` with URL media source. A real returned ID + media URL are required before updating queue; check account Pins after ambiguous network failures to prevent a duplicate.
5. On confirmed success update **only** the selected pin entry with status, id, time, returned image URL, exact title and description. Never alter the existing published items, Telegram, or FivePicked. If the asset is pending, keep the draft, do not claim success.

**Search and creative strategy:** The hook sells an idea, not fabricated results: e.g. "Make Your Instagram Bio Clearer" over "Gain 10K Followers". Real screenshots should use clean crop and contrasting colorful framing, varied screenshot position and prominent short practical text. Use the target tool name + problem keyword naturally in title/description, and choose 1 related phrase; do not repeat brand/hashtags to fill space.

**Organic performance diagnostic:** A few new Pins with zero impressions are not proof of a permanent reach problem. Before aggressive creative or frequency changes check public Pin visibility, website claiming/verification, indexed images/landing pages and reporting latency. After 7–14 days compare actual impressions, saves, outbound clicks by visual and topic and revise based on evidence; never invent impressions or visits.

**Failure isolation:** GitHub Actions asset generation is independent of the existing scheduled Pinterest publisher. Generation commits must touch only `public/pinterest/`. The publisher may only create a Pin once a validated asset is available; do not add a second automatic publisher or a fifth daily publishing slot.

## Enforced visual diversity and outbound-click review (2026-11-10)
The production asset renderer is **v3-layouts** and makes six genuinely different compositions: `editorial_split`, `mobile_showcase`, `tutorial_steps`, `magazine_feature`, `browser_insight`, `gallery_feature`. Every one uses a verified screenshot of the corresponding real tool. The current visual-manifest includes `composition`, `alt_text`, `source_url`, `renderer_version` and `status` and the public image. Use these rather than inventing or reusing visual content. No adjacent same composition when alternative ready drafts are available; never just recolor one layout and call it new.

**Traffic-first selection:** Choose a distinct high-intent creator need for which the destination tool demonstrably provides a solution. Pin must teach one practical thing on-image, then clearly invite viewers to explore the EXACT matching free tool; the caption should naturally use the tool/topic keyword, a relevant problem phrase, and one concrete idea, not keyword stuffing. Use a destination deep-link with the existing UTM, not generic homepage. Alt text should describe the screenshot and useful educational idea, not the brand logo alone. If any tool's actual screenshot is unsuitable, HOLD the draft for redesign instead of publishing an irrelevant illustration.

**Weekly test and improvement:** After sufficient actual Pinterest data accumulate, record valid Pin impressions, saves, outbound clicks (and optionally outbound-click rate when impressions > 0) per creative style and board. Test one factor at a time (composition, hook/topic, or destination). Prefer new angles on topics with real saves/clicks; do not repeatedly post the same screenshot, board, or deep-link. Fresh accounts can report 0 and lag; zero does not justify fake engagement tactics or artificial clicks.

**Checks before publishing:** manifest image status is `asset_only_not_published`, `renderer_version` equals `2026-11-10-v3-layouts`, composition exists, screenshot from verified `https://www.getsocialora.com/tools/<slug>`, cover hook matches queue, target image URL returns genuine image, and UI is readable. Pin should use only one original prepared asset for its draft ID. Publisher validates time/board/destination limits first, and never uses a second fallback publisher.

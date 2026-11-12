#!/usr/bin/env python3
"""Build Socialora Pinterest 2026-11-11-v4-editorial Curiosity Gap drafts. Never publishes Pins."""
import argparse
import io
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps, ImageStat
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
QUEUE = ROOT / "automation/pinterest/content-queue.json"
OUT = ROOT / "public/pinterest"
MANIFEST = OUT / "visual-manifest.json"
RENDERER_VERSION = "2026-11-11-v4-editorial"

PALETTES = {
    "coral_cream": ("#FFF8F1", "#111827", "#EA580C", "#FFEDD5", "#111827"),
    "sage_emerald": ("#F2FBF7", "#0B221B", "#059669", "#D1FAE5", "#064E3B"),
    "sand_indigo": ("#F6F7FF", "#111827", "#4F46E5", "#E0E7FF", "#1E1B4B"),
    "oat_terracotta": ("#FDF6F0", "#1C1917", "#C2410C", "#FED7AA", "#292524"),
    "sky_cobalt": ("#F3F8FF", "#0F172A", "#2563EB", "#DBEAFE", "#0F172A"),
}


def font(size, bold=False):
    for candidate in (
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ):
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def wrap(draw, value, face, max_width, max_lines=None):
    words = str(value or "").split()
    lines, line = [], ""
    for word in words:
        candidate = (line + " " + word).strip()
        if line and draw.textbbox((0, 0), candidate, font=face)[2] > max_width:
            lines.append(line)
            line = word
        else:
            line = candidate
    if line:
        lines.append(line)
    if max_lines is not None and len(lines) > max_lines:
        return lines[:max_lines]
    return lines


def actual_screenshot(page, url):
    parsed = urlsplit(url)
    if parsed.scheme != "https" or parsed.netloc not in {"www.getsocialora.com", "getsocialora.com"} or not parsed.path.startswith("/tools/"):
        raise ValueError("Unapproved tool URL")
    clean = urlunsplit((parsed.scheme, parsed.netloc, parsed.path, "", ""))
    page.set_viewport_size({"width": 1120, "height": 1000})
    response = page.goto(clean, wait_until="domcontentloaded", timeout=45000)
    if not response or response.status != 200:
        raise ValueError(f"Tool page unavailable: {response.status if response else 'no response'}")
    page.locator("h1").first.wait_for(timeout=15000)
    heading = page.locator("h1").first.inner_text().strip()
    if len(heading) < 6 or "404" in heading.lower() or "not found" in heading.lower():
        raise ValueError("Could not verify real tool heading")
    page.evaluate(
        """() => {
          const hdr = document.querySelector('header');
          if (hdr) hdr.style.display = 'none';
        }"""
    )
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(500)
    shot = Image.open(io.BytesIO(page.screenshot(type="png", full_page=True, animations="disabled"))).convert("RGB")
    main_box = page.locator("main").first.bounding_box()
    top = max(0, int(main_box["y"])) if main_box else 0
    cropped = shot.crop((140, top, min(980, shot.width), min(shot.height, top + 780)))
    if max(ImageStat.Stat(cropped).stddev) < 11:
        raise ValueError("Blank screenshot quality gate")
    return cropped, heading, clean


def draw_curiosity_gap(pin, shot_img, clean_url):
    bg, ink, accent, soft_tint, pill_bg = PALETTES.get(pin.get("visual_style"), PALETTES["sand_indigo"])
    canvas = Image.new("RGB", (1000, 1500), bg)
    d = ImageDraw.Draw(canvas)
    d.rectangle((0, 0, 1000, 12), fill=accent)

    # Eyebrow row
    d.rounded_rectangle((48, 42, 420, 88), radius=23, fill="#FFFFFF", outline="#CBD5E1", width=2)
    d.text((70, 54), "SOCIALORA CREATOR TOOLKIT", font=font(16, True), fill=ink)

    # First 38 chars large mobile SEO headline
    title_str = str(pin.get("title", "")).strip()
    lead38 = title_str[:38].strip()
    if len(title_str) > 38 and title_str[38] != " " and " " in lead38:
        lead38 = lead38.rsplit(" ", 1)[0].strip()
    rest = title_str[len(lead38):].lstrip(" :,-")

    y = 116
    for line in wrap(d, lead38, font(54, True), 904, 2):
        d.text((48, y), line, font=font(54, True), fill=ink)
        y += 62
    if rest:
        for line in wrap(d, rest, font(24, True), 904, 2):
            d.text((48, y + 6), line, font=font(24, True), fill="#475569")
            y += 32

    # DON'T DO THIS (Red) vs DO THIS (Green)
    cmp = pin.get("comparison") or {}
    dont_text = cmp.get("dont") or "Guess without checking safe zones or ratios"
    do_text = cmp.get("do") or "Verify specs in browser before publishing"

    cmp_top = max(310, y + 22)
    cmp_bot = cmp_top + 260
    d.rounded_rectangle((48, cmp_top, 488, cmp_bot), radius=24, fill="#FEF2F2", outline="#FCA5A5", width=3)
    d.rounded_rectangle((70, cmp_top + 22, 260, cmp_top + 60), radius=19, fill="#DC2626")
    d.text((88, cmp_top + 30), "DON'T DO THIS", font=font(16, True), fill="#FFFFFF")
    ty = cmp_top + 80
    for line in wrap(d, dont_text, font(23, True), 392, 4):
        d.text((70, ty), line, font=font(23, True), fill="#7F1D1D")
        ty += 31

    d.rounded_rectangle((512, cmp_top, 952, cmp_bot), radius=24, fill="#ECFDF5", outline="#6EE7B7", width=3)
    d.rounded_rectangle((534, cmp_top + 22, 680, cmp_top + 60), radius=19, fill="#059669")
    d.text((554, cmp_top + 30), "DO THIS", font=font(16, True), fill="#FFFFFF")
    ty = cmp_top + 80
    for line in wrap(d, do_text, font(23, True), 392, 4):
        d.text((534, ty), line, font=font(23, True), fill="#064E3B")
        ty += 31

    # Bottom Left: Steps 1 & 2 clear + Step 3 teaser
    steps = pin.get("steps") or [
        "Open the free browser tool and input your details",
        "Check key creator ratios before hitting upload",
        "Unlock Step 3 & live score inside the tool",
    ]
    row_top = cmp_bot + 32
    sy = row_top
    for idx, label in enumerate(("01  STEP ONE", "02  STEP TWO")):
        d.rounded_rectangle((48, sy, 470, sy + 205), radius=22, fill="#FFFFFF", outline="#CBD5E1", width=2)
        d.text((70, sy + 18), label, font=font(15, True), fill=accent)
        by = sy + 52
        for line in wrap(d, steps[idx], font(20, True), 376, 4):
            d.text((70, by), line, font=font(20, True), fill=ink)
            by += 28
        sy += 222

    # Step 3 curiosity lock card
    d.rounded_rectangle((48, sy, 470, 1456), radius=22, fill=soft_tint, outline=accent, width=2)
    d.text((70, sy + 18), "03  STEP THREE & LIVE SCORE", font=font(15, True), fill=accent)
    d.rounded_rectangle((70, sy + 64, 380, sy + 104), radius=20, fill=pill_bg)
    d.text((88, sy + 74), "UNLOCK STEP 3 IN BROWSER ->", font=font(14, True), fill="#FFFFFF")

    # Bottom Right: real /tools/... crop with lower half blurred + Pill CTA
    shot_box = (494, row_top, 952, 1300)
    d.rounded_rectangle(shot_box, radius=24, fill="#FFFFFF", outline="#CBD5E1", width=2)
    d.text((514, row_top + 14), clean_url.replace("https://www.", ""), font=font(13, True), fill="#475569")
    inner_w = 434
    inner_h = 1280 - (row_top + 48)
    fitted = ImageOps.fit(shot_img, (inner_w, inner_h), method=Image.Resampling.LANCZOS, centering=(0.5, 0.0))
    split_h = int(inner_h * 0.54)
    lower = fitted.crop((0, split_h, inner_w, inner_h)).filter(ImageFilter.GaussianBlur(radius=8))
    fitted.paste(lower, (0, split_h))
    canvas.paste(fitted, (506, row_top + 44))
    d.rounded_rectangle((566, row_top + 44 + split_h + 36, 880, row_top + 44 + split_h + 78), radius=21, fill=accent)
    d.text((590, row_top + 44 + split_h + 48), "STEP 3 & SCORE PREVIEW", font=font(15, True), fill="#FFFFFF")

    # Bottom Right Pill CTA
    d.rounded_rectangle((494, 1320, 952, 1456), radius=22, fill="#FFFFFF", outline=accent, width=3)
    d.rounded_rectangle((510, 1336, 936, 1396), radius=30, fill=pill_bg)
    d.text((528, 1354), "Run Free Browser Check -> getsocialora.com/tools", font=font(15, True), fill="#FFFFFF")
    d.text((626, 1414), "100% FREE | NO LOGIN", font=font(16, True), fill=accent)
    return canvas


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=40)
    parser.add_argument("--id", default=None)
    args = parser.parse_args()
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
    drafts = [p for p in queue["pins"] if p.get("status") == "draft"]
    if args.id:
        drafts = [p for p in drafts if p["id"] == args.id]

    made = 0
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1120, "height": 1000}, device_scale_factor=1)
        shot_cache = {}
        for pin in drafts[: max(0, min(args.limit, 40))]:
            pin_id = pin["id"]
            source = urlsplit(pin["url"])
            clean_url = urlunsplit((source.scheme, source.netloc, source.path, "", ""))
            if clean_url not in shot_cache:
                shot_cache[clean_url] = actual_screenshot(page, pin["url"])
            shot_img, heading, _ = shot_cache[clean_url]
            visual = draw_curiosity_gap(pin, shot_img, clean_url)
            target = OUT / f"{pin_id}.png"
            tmp = target.with_suffix(".partial.png")
            visual.save(tmp, "PNG", optimize=True)
            tmp.replace(target)
            manifest[pin_id] = {
                "image_path": f"/pinterest/{pin_id}.png",
                "source_url": clean_url,
                "verified_h1": heading,
                "captured_at": datetime.now(timezone.utc).isoformat(),
                "visual_type": "editorial_curiosity_gap_tool_crop",
                "cover_hook": pin.get("cover_hook", ""),
                "dimensions": "1000x1500",
                "renderer_version": RENDERER_VERSION,
                "curiosity_gap": True,
                "composition": pin.get("visual_style", "sand_indigo"),
                "alt_text": pin.get("alt_text", ""),
                "status": "asset_only_not_published",
            }
            made += 1
        browser.close()
    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Created {made} Curiosity Gap v4 assets; no pins published.")


if __name__ == "__main__":
    main()

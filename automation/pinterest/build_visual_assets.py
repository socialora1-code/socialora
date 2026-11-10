#!/usr/bin/env python3
"""Build authentic, screenshot-led Socialora Pinterest drafts. Never publishes Pins."""
import argparse
import hashlib
import io
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageStat
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
QUEUE = ROOT / "automation/pinterest/content-queue.json"
OUT = ROOT / "public/pinterest"
MANIFEST = OUT / "visual-manifest.json"
RENDERER_VERSION = "2026-11-10-v3-layouts"
PALETTES = [
    ("#FFF8F0", "#29243A", "#FF705D", "#FFE1CF"),
    ("#D8F4E5", "#093D41", "#EF7D35", "#FFFFFF"),
    ("#264FE5", "#FFFFFF", "#FFD84A", "#DDE6FF"),
    ("#F3E7FD", "#35215A", "#F554A1", "#FFFFFF"),
    ("#FFE7DD", "#172A56", "#F7864B", "#FFFFFF"),
    ("#FDF3B3", "#1F2733", "#5662DA", "#FFFFFF"),
]

def font(size, bold=False):
    file = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    return ImageFont.truetype(file, size)

def wrap(draw, value, face, max_width, max_lines=None):
    words = value.split()
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
        return None
    return lines

def headline(draw, message, x, y, color, width, max_height):
    for size in range(76, 45, -2):
        face = font(size, True)
        lines = wrap(draw, message, face, width, 3)
        if lines and len(lines) * (size + 11) <= max_height:
            for i, line in enumerate(lines):
                draw.text((x, y + i * (size + 11)), line, font=face, fill=color)
            return len(lines) * (size + 11)
    raise ValueError("Headline does not fit")

def takeaway(draw, message, x, y, width, color, max_height=130):
    for size in (30, 28, 26, 24, 22, 20, 18):
        face = font(size)
        lines = wrap(draw, message, face, width, 20)
        if lines and len(lines) * (size + 10) <= max_height:
            for i, line in enumerate(lines):
                draw.text((x, y + i * (size + 10)), line, font=face, fill=color)
            return
    raise ValueError("Takeaway text does not fit")

def actual_screenshot(page, url):
    parsed = urlsplit(url)
    if parsed.scheme != "https" or parsed.netloc not in {"www.getsocialora.com", "getsocialora.com"} or not parsed.path.startswith("/tools/"):
        raise ValueError("Unapproved tool URL")
    clean = urlunsplit((parsed.scheme, parsed.netloc, parsed.path, "", ""))
    page.set_viewport_size({"width": 1100, "height": 950})
    response = page.goto(clean, wait_until="domcontentloaded", timeout=45000)
    if not response or response.status != 200:
        raise ValueError(f"Tool page unavailable: {response.status if response else 'no response'}")
    page.locator("h1").first.wait_for(timeout=15000)
    heading = page.locator("h1").first.inner_text().strip()
    if len(heading) < 8 or "404" in heading.lower() or "not found" in heading.lower():
        raise ValueError("Could not verify real tool heading")
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(750)
    desk = Image.open(io.BytesIO(page.screenshot(type="png", full_page=True, animations="disabled"))).convert("RGB")
    main_box = page.locator("main").first.bounding_box()
    top = max(0, int(main_box["y"])) if main_box else 0
    top = min(top, max(0, desk.height - 500))
    desk = desk.crop((0, top, min(1100, desk.width), min(desk.height, top + 950)))
    page.set_viewport_size({"width": 430, "height": 930})
    page.wait_for_timeout(650)
    mobile = Image.open(io.BytesIO(page.screenshot(type="png", full_page=True, animations="disabled"))).convert("RGB")
    mobile_box = page.locator("main").first.bounding_box()
    mt = max(0, int(mobile_box["y"])) if mobile_box else 0
    mt = min(mt, max(0, mobile.height - 650))
    mobile = mobile.crop((0, mt, min(430, mobile.width), min(mobile.height, mt + 1150)))
    if desk.width < 750 or desk.height < 500 or mobile.width < 400 or mobile.height < 650:
        raise ValueError("Tool screen crop too small")
    if max(ImageStat.Stat(desk).stddev) < 11 or max(ImageStat.Stat(mobile).stddev) < 11:
        raise ValueError("Blank screenshot quality gate")
    page.set_viewport_size({"width": 1100, "height": 950})
    return {"desktop":desk, "mobile":mobile}, heading, clean

STYLES = ("editorial_split", "mobile_showcase", "tutorial_steps", "magazine_feature", "browser_insight", "gallery_feature")

def draw_visual(pin, screenshots, style_index):
    hook = pin.get("cover_hook", "").strip()
    if not 4 <= len(hook.split()) <= 7:
        raise ValueError("Cover hook must contain 4–7 words")
    sentences = re.split(r"(?<=[.!?])\s+", pin.get("description", "").strip())
    tips = [x for x in sentences if not x.endswith("?") and 28 <= len(x) <= 175]
    actionable = [x for x in tips if re.search(r"\b(try|start|choose|check|keep|compare|use|make|divide|add|write|preview|pick|name|turn|lead)\b", x.lower())]
    tip = min(actionable or tips, key=len) if tips else ""
    if len(tip) < 28:
        raise ValueError("No actionable takeaway")
    # Color selection and LAYOUT selection are intentionally independent.
    palette_index = (style_index * 5 + int(hashlib.sha256(pin["id"].encode()).hexdigest()[:2],16)) % len(PALETTES)
    bg, ink, accent, muted = PALETTES[palette_index]
    canvas = Image.new("RGB",(1000,1500),bg)
    d = ImageDraw.Draw(canvas)
    dark = "#202538"
    white = "#FFFFFF"
    def eyebrow(x,y,color=ink):
        d.text((x,y), "SOCIALORA  /  PRACTICAL CREATOR TIPS",font=font(20,True),fill=color)
    def round_box(rect, fill, radius=25):
        d.rounded_rectangle(rect, radius=radius, fill=fill)
    def real_preview(rect, variant="desktop"):
        x0,y0,x1,y1=rect
        round_box((x0+7,y0+12,x1+7,y1+12),ink,29)
        round_box((x0,y0,x1,y1),white,26)
        d.text((x0+24,y0+17), "REAL SOCIALORA TOOL SCREEN",font=font(15,True),fill=dark)
        inner=(x0+18,y0+54,x1-18,y1-17)
        shot=ImageOps.fit(screenshots[variant],(inner[2]-inner[0],inner[3]-inner[1]),method=Image.Resampling.LANCZOS,centering=(0.5,0.0))
        canvas.paste(shot,(inner[0],inner[1]))
    def insight(rect,tag="TRY THIS"):
        x0,y0,x1,y1=rect
        round_box(rect,white,26)
        d.rectangle((x0+20,y0+23,x0+29,y1-25), fill=accent)
        d.text((x0+49,y0+17),tag,font=font(20,True),fill=dark)
        takeaway(d,tip,x0+49,y0+57,x1-x0-85,dark,max_height=y1-y0-63)
    def footer(title="EXPLORE THE FREE TOOL"):
        d.text((65,1425),title,font=font(23,True),fill=ink)
        round_box((784,1403,940,1466),accent,27)
        d.text((815,1421),"OPEN  >",font=font(19,True),fill=dark if palette_index==2 else white)
    # Exactly six substantially different compositions.
    if style_index == 0:
        d.rectangle((0,0,1000,28),fill=accent)
        eyebrow(65,83)
        headline(d,hook,65,138,ink,860,255)
        real_preview((55,475,565,1215),"mobile")
        insight((598,560,943,1095),"THE PRACTICAL TIP")
        d.text((603,1150),"SEE THE ACTUAL TOOL",font=font(19,True),fill=ink)
        footer()
    elif style_index == 1:
        round_box((33,35,965,396),muted,45)
        eyebrow(72,82)
        headline(d,hook,68,151,ink,850,222)
        real_preview((372,438,932,1286),"mobile")
        round_box((56,483,340,552),accent,24)
        d.text((80,502),"ONE SIMPLE FIX",font=font(23,True),fill=dark if palette_index==2 else white)
        insight((53,585,342,1030),"HOW TO USE IT")
        d.text((70,1105),"Real screen.",font=font(39,True),fill=ink)
        d.text((70,1154),"Real tool.",font=font(39,True),fill=ink)
        footer()
    elif style_index == 2:
        eyebrow(75,85)
        headline(d,hook,75,165,ink,825,262)
        d.rectangle((0,433,1000,475),fill=accent)
        d.text((72,445),"01    UNDERSTAND THE TOOL",font=font(20,True),fill=dark if palette_index==2 else white)
        real_preview((62,500,937,1062),"desktop")
        insight((70,1092,929,1330),"02    A TIP YOU CAN USE")
        footer()
    elif style_index == 3:
        d.rectangle((0,0,59,1500),fill=accent)
        eyebrow(99,85)
        headline(d,hook,93,152,ink,820,285)
        real_preview((455,485,942,1190),"mobile")
        insight((90,572,419,1095),"SAVE THIS IDEA")
        d.text((107,1183),"LEARN  /  TRY  /  SAVE",font=font(24,True),fill=ink)
        footer()
    elif style_index == 4:
        d.rectangle((0,0,1000,160),fill=accent)
        eyebrow(66,82,dark if palette_index==2 else white)
        headline(d,hook,67,206,ink,852,252)
        real_preview((74,554,924,1058),"desktop")
        round_box((83,480,511,551),muted,22)
        d.text((113,495),"INSIDE THE ACTUAL TOOL",font=font(20,True),fill=dark)
        insight((71,1092,929,1335),"MAKE IT MORE USEFUL")
        footer()
    elif style_index == 5:
        round_box((52,40,947,1376),muted,42)
        eyebrow(85,77)
        headline(d,hook,83,155,ink,800,238)
        real_preview((240,424,830,1105),"mobile")
        round_box((62,555,215,690),accent,20)
        d.text((89,585),"REAL",font=font(27,True),fill=dark if palette_index==2 else white)
        d.text((89,625),"SCREEN",font=font(20,True),fill=dark if palette_index==2 else white)
        insight((91,1133,910,1330),"YOUR TAKEAWAY")
        footer()
    else:
        raise ValueError("Unrecognized design composition")
    return canvas

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=4)
    parser.add_argument("--id", default=None)
    args = parser.parse_args()
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    drafts = [p for p in queue["pins"] if p.get("status") == "draft"]
    if args.id:
        drafts = [p for p in drafts if p["id"] == args.id]
    made = 0
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1100, "height": 950}, device_scale_factor=1)
        for pin in drafts:
            if made >= max(0, min(args.limit, 8)):
                break
            pin_id = pin["id"]
            if not re.fullmatch(r"[a-zA-Z0-9_-]{5,100}", pin_id):
                print(f"SKIP invalid ID {pin_id!r}")
                continue
            target = OUT / f"{pin_id}.png"
            if target.exists() and manifest.get(pin_id, {}).get("renderer_version") == RENDERER_VERSION:
                continue
            try:
                screens, heading, clean_url = actual_screenshot(page, pin["url"])
                style_index = next(i for i, p in enumerate(queue["pins"]) if p["id"] == pin_id) % len(STYLES)
                visual = draw_visual(pin, screens, style_index)
                if visual.size != (1000, 1500):
                    raise ValueError("Wrong dimensions")
                temporary = target.with_suffix(".partial.png")
                visual.save(temporary, "PNG", optimize=True)
                temporary.replace(target)
                manifest[pin_id] = {
                    "image_path": f"/pinterest/{pin_id}.png",
                    "source_url": clean_url,
                    "verified_h1": heading,
                    "captured_at": datetime.now(timezone.utc).isoformat(),
                    "visual_type": "authentic_site_screenshot_editorial",
                    "cover_hook": pin["cover_hook"],
                    "dimensions": "1000x1500",
                    "renderer_version": RENDERER_VERSION,
                    "composition": STYLES[style_index],
                    "alt_text": "Original Pinterest guide: " + pin["cover_hook"] + ". Authentic screenshot of Socialora " + heading + " with one practical tip.",
                    "status": "asset_only_not_published",
                }
                made += 1
                print(f"CREATED {pin_id} {target.stat().st_size} bytes [{heading}]")
            except Exception as exc:
                temporary = target.with_suffix(".partial.png")
                if temporary.exists():
                    temporary.unlink()
                print(f"SKIP {pin_id}: {type(exc).__name__}: {exc}")
        browser.close()
    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    print(f"Created {made} authentic screenshot assets; no pins published.")

if __name__ == "__main__":
    main()

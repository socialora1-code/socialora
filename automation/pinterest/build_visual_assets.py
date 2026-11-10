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
RENDERER_VERSION = "2026-11-10-v2"
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
    for size in (30, 28, 26, 24):
        face = font(size)
        lines = wrap(draw, message, face, width, 4)
        if lines and len(lines) * (size + 10) <= max_height:
            for i, line in enumerate(lines):
                draw.text((x, y + i * (size + 10)), line, font=face, fill=color)
            return
    raise ValueError("Takeaway text does not fit")

def actual_screenshot(page, url):
    parsed = urlsplit(url)
    if parsed.netloc not in {"www.getsocialora.com", "getsocialora.com"} or not parsed.path.startswith("/tools/"):
        raise ValueError("Unapproved tool URL")
    clean = urlunsplit((parsed.scheme, parsed.netloc, parsed.path, "", ""))
    response = page.goto(clean, wait_until="domcontentloaded", timeout=45000)
    if not response or response.status != 200:
        raise ValueError(f"Tool page unavailable: {response.status if response else 'no response'}")
    page.locator("h1").first.wait_for(timeout=15000)
    heading = page.locator("h1").first.inner_text().strip()
    if len(heading) < 8 or "404" in heading.lower() or "not found" in heading.lower():
        raise ValueError("Could not verify real tool heading")
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(900)
    main_box = page.locator("main").first.bounding_box()
    top = max(0, int(main_box["y"])) if main_box else 0
    screenshot = Image.open(io.BytesIO(page.screenshot(type="png", full_page=True, animations="disabled"))).convert("RGB")
    top = min(top, max(0, screenshot.height - 400))
    crop = screenshot.crop((0, top, min(1100, screenshot.width), min(screenshot.height, top + 790)))
    if crop.width < 700 or crop.height < 400 or max(ImageStat.Stat(crop).stddev) < 12:
        raise ValueError("Screenshot failed quality gate")
    return crop, heading, clean

def draw_visual(pin, screenshot):
    hook = pin.get("cover_hook", "").strip()
    if not 4 <= len(hook.split()) <= 7:
        raise ValueError("Cover hook must contain 4–7 words")
    sentences = re.split(r"(?<=[.!?])\s+", pin.get("description", "").strip())
    tips = [x for x in sentences if not x.endswith("?") and 28 <= len(x) <= 175]
    first_tip = tips[0] if tips else ""
    if len(first_tip) < 28:
        raise ValueError("No actionable takeaway")
    index = int(hashlib.sha256(pin["id"].encode()).hexdigest()[:6], 16) % len(PALETTES)
    bg, ink, accent, muted = PALETTES[index]
    image = Image.new("RGB", (1000, 1500), bg)
    d = ImageDraw.Draw(image)
    # Different editorial systems: large type, contrast panel, corner accents, asymmetry.
    if index in (1, 3, 5):
        d.rounded_rectangle((35, 36, 965, 413), radius=35, fill=muted)
        title_y = 128
        top_label_y = 72
        frame_y = 447
    else:
        d.rectangle((0, 0, 1000, 26), fill=accent)
        top_label_y = 82
        title_y = 145
        frame_y = 470
    d.text((74, top_label_y), "SOCIALORA  /  CREATOR GUIDE", font=font(23, True), fill=ink)
    headline(d, hook, 72, title_y, ink, 850, frame_y - title_y - 18)
    # Authentic screenshot, clearly labeled: no simulated engagement metrics.
    d.rounded_rectangle((66, frame_y + 12, 944, frame_y + 738), radius=32, fill=ink)
    d.rounded_rectangle((60, frame_y, 938, frame_y + 724), radius=30, fill="#FFFFFF")
    d.ellipse((91, frame_y + 30, 103, frame_y + 42), fill="#FF705D")
    d.ellipse((113, frame_y + 30, 125, frame_y + 42), fill="#F4BD4F")
    d.ellipse((135, frame_y + 30, 147, frame_y + 42), fill="#63BE88")
    d.text((166, frame_y + 23), "REAL TOOL PREVIEW  ·  GETSOCIALORA.COM", font=font(18, True), fill="#485065")
    inner = ImageOps.fit(screenshot, (830, 620), method=Image.Resampling.LANCZOS, centering=(0.5, 0.0))
    image.paste(inner, (84, frame_y + 78))
    d.rounded_rectangle((63, frame_y + 760, 937, frame_y + 922), radius=25, fill=muted)
    d.rectangle((87, frame_y + 789, 96, frame_y + 884), fill=accent)
    takeaway(d, first_tip, 119, frame_y + 787, 780, "#1F2733" if index == 2 else ink)
    d.text((73, 1438), "TRY THE FREE TOOL", font=font(25, True), fill=ink)
    d.rounded_rectangle((791, 1425, 937, 1478), radius=26, fill=accent)
    d.text((835, 1434), "OPEN  >", font=font(19, True), fill="#1F2733" if index == 2 else "#FFFFFF")
    return image

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
                crop, heading, clean_url = actual_screenshot(page, pin["url"])
                visual = draw_visual(pin, crop)
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

"""Process stock bottle photos into normalized carousel images.

Pipeline: assets/stock-photos/ + assets/manifest.json
       -> remove background (rembg)
       -> clean alpha edges
       -> normalize to 400x800 at 72% fill, centered
       -> save to public/bottles/normalized/
       -> auto-append to src/lib/bottles.ts

Dependencies: pip install rembg[cpu] Pillow
"""
import json
import os
import shutil
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow not installed. Run: pip install Pillow")
    sys.exit(1)

try:
    from rembg import remove
except ImportError:
    print("ERROR: rembg not installed. Run: pip install rembg[cpu]")
    sys.exit(1)

ROOT = Path("C:/Dev/Wini/wini-app")
STOCK_DIR = ROOT / "assets" / "stock-photos"
ARCHIVE_DIR = ROOT / "assets" / "archive"
MANIFEST = ROOT / "assets" / "manifest.json"
OUT_DIR = ROOT / "public" / "bottles" / "normalized"
BOTTLES_TS = ROOT / "src" / "lib" / "bottles.ts"

CANVAS_W, CANVAS_H = 400, 800
TARGET_FILL = 0.72
ALPHA_THRESHOLD = 10


def clean_alpha(img: Image.Image, threshold: int = ALPHA_THRESHOLD) -> Image.Image:
    """Remove near-transparent edge pixels."""
    data = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = data[x, y]
            if a < threshold:
                data[x, y] = (0, 0, 0, 0)
    return img


def normalize_bottle(img: Image.Image) -> Image.Image:
    """Center bottle on 400x800 canvas at 72% fill."""
    bbox = img.getbbox()
    if not bbox:
        raise ValueError("Image is empty after background removal")

    x1, y1, x2, y2 = bbox
    cropped = img.crop(bbox)
    cw, ch = cropped.size

    target_h = int(CANVAS_H * TARGET_FILL)
    scale = target_h / ch
    new_w = int(cw * scale)
    new_h = target_h

    if new_w > CANVAS_W:
        new_w = CANVAS_W
        new_h = int(ch * (CANVAS_W / cw))

    resized = cropped.resize((new_w, new_h), Image.LANCZOS)

    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    paste_x = (CANVAS_W - new_w) // 2
    paste_y = (CANVAS_H - new_h) // 2
    canvas.paste(resized, (paste_x, paste_y), resized)
    return canvas


def append_to_bottles_ts(entries: list[dict]) -> None:
    """Append new bottle entries to the BOTTLES array in bottles.ts."""
    if not entries:
        return

    content = BOTTLES_TS.read_text(encoding="utf-8")

    # Find the closing ]; of the BOTTLES array
    marker = "export const BOTTLES: Bottle[] = ["
    if marker not in content:
        print("  WARNING: Could not find BOTTLES array in bottles.ts — manual update needed")
        return

    # Build new entries
    new_lines = []
    for entry in entries:
        existing_check = f'"{entry["slug"]}-full.png"'
        if existing_check in content:
            print(f"  SKIP {entry['slug']} — already in bottles.ts")
            continue
        new_lines.append(
            f'  {{ name: "{entry["name"]}", src: `${{BASE}}/{entry["slug"]}-full.png`, type: "{entry["type"]}" }},'
        )

    if not new_lines:
        return

    # Insert before the closing ];
    # Find the last ]; that ends the BOTTLES array
    idx = content.rfind("];")
    if idx == -1:
        print("  WARNING: Could not find end of BOTTLES array")
        return

    insert = "\n".join(new_lines) + "\n"
    content = content[:idx] + insert + content[idx:]
    BOTTLES_TS.write_text(content, encoding="utf-8")
    print(f"  Added {len(new_lines)} entries to bottles.ts")


def main() -> None:
    if not MANIFEST.exists():
        print(f"ERROR: Manifest not found at {MANIFEST}")
        sys.exit(1)

    with open(MANIFEST, encoding="utf-8") as f:
        manifest = json.load(f)

    bottles = manifest.get("bottles", [])
    if not bottles:
        print("No bottles in manifest")
        return

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

    processed = []
    for entry in bottles:
        filename = entry["file"]
        slug = entry["slug"]
        src_path = STOCK_DIR / filename
        out_path = OUT_DIR / f"{slug}-full.png"

        if not src_path.exists():
            print(f"  SKIP {filename} — not found in {STOCK_DIR}")
            continue

        if out_path.exists():
            print(f"  SKIP {slug} — already processed")
            processed.append(entry)
            continue

        print(f"  Processing {filename} -> {slug}-full.png ...")

        img = Image.open(src_path).convert("RGBA")
        print(f"    Original: {img.size}")

        # Remove background
        img_nobg = remove(img)
        print(f"    Background removed")

        # Clean alpha edges
        img_clean = clean_alpha(img_nobg)

        # Normalize to canvas
        result = normalize_bottle(img_clean)
        result.save(out_path, "PNG")
        print(f"    Saved: {out_path}")

        # Archive original
        archive_path = ARCHIVE_DIR / filename
        if not archive_path.exists():
            shutil.move(str(src_path), str(archive_path))
            print(f"    Archived original to {archive_path}")

        processed.append(entry)

    # Auto-append to bottles.ts
    print("\n=== Updating bottles.ts ===")
    append_to_bottles_ts(processed)

    print(f"\nDone! Processed {len(processed)} bottles.")


if __name__ == "__main__":
    main()

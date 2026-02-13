"""Analyze and normalize bottle images to consistent visual sizes."""
from PIL import Image
import os
import glob

BASE = "C:/Dev/Wini/wini-app/public/bottles/processed"
OUT = "C:/Dev/Wini/wini-app/public/bottles/normalized"
HALF_CANVAS_W, CANVAS_H = 200, 800
FULL_CANVAS_W = 400
TARGET_FILL = 0.72  # bottles should fill 72% of canvas height

os.makedirs(OUT, exist_ok=True)

half_files = sorted(
    glob.glob(os.path.join(BASE, "*-left.png"))
    + glob.glob(os.path.join(BASE, "*-right.png"))
)

full_files = sorted(glob.glob(os.path.join(BASE, "*-full.png")))

# Phase 1: Analyze all bounding boxes
print("=== ANALYSIS ===")
infos = []
for f in half_files + full_files:
    img = Image.open(f).convert("RGBA")
    bbox = img.getbbox()
    name = os.path.basename(f)
    is_full = "-full" in name
    canvas_w = FULL_CANVAS_W if is_full else HALF_CANVAS_W
    if bbox:
        x1, y1, x2, y2 = bbox
        w, h = x2 - x1, y2 - y1
        fill = h / CANVAS_H
        infos.append({"name": name, "path": f, "bbox": bbox, "fill": fill, "is_full": is_full, "canvas_w": canvas_w})
        print(f"  {name:35s} fill={fill*100:.0f}%  bbox=({x1},{y1},{x2},{y2})  {'full' if is_full else 'half'}")
    else:
        print(f"  {name:35s} EMPTY")

# Phase 2: Normalize each bottle
print(f"\n=== NORMALIZING to {TARGET_FILL*100:.0f}% fill ===")
for info in infos:
    img = Image.open(info["path"]).convert("RGBA")
    x1, y1, x2, y2 = info["bbox"]
    canvas_w = info["canvas_w"]

    # Crop to bounding box
    cropped = img.crop((x1, y1, x2, y2))
    cw, ch = cropped.size

    # Scale so bottle height = TARGET_FILL * CANVAS_H
    target_h = int(CANVAS_H * TARGET_FILL)
    scale = target_h / ch
    new_w = int(cw * scale)
    new_h = target_h

    # Don't let width exceed canvas
    if new_w > canvas_w:
        new_w = canvas_w
        new_h = int(ch * (canvas_w / cw))

    resized = cropped.resize((new_w, new_h), Image.LANCZOS)

    # Create new canvas and paste centered vertically
    canvas = Image.new("RGBA", (canvas_w, CANVAS_H), (0, 0, 0, 0))

    # Vertical: center the bottle
    paste_y = (CANVAS_H - new_h) // 2

    # Horizontal alignment
    name = info["name"]
    if info["is_full"]:
        paste_x = (canvas_w - new_w) // 2  # center-aligned
    elif "-left" in name:
        paste_x = canvas_w - new_w  # right-aligned
    else:
        paste_x = 0  # left-aligned

    canvas.paste(resized, (paste_x, paste_y), resized)

    out_path = os.path.join(OUT, name)
    canvas.save(out_path, "PNG")
    old_fill = info["fill"] * 100
    print(f"  {name:35s} {old_fill:.0f}% -> {TARGET_FILL*100:.0f}%  saved")

print(f"\nDone! Normalized images saved to: {OUT}")

import { chromium } from "playwright";
import sharp from "sharp";
import path from "path";
import fs from "fs";

const OUTPUT_DIR = path.resolve(__dirname, "../public");
const HTML_PATH = path.resolve(__dirname, "icon-page.html");

async function generateIcons() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1024, height: 1024 },
    deviceScaleFactor: 1,
  });

  const fileUrl = `file:///${HTML_PATH.replace(/\\/g, "/")}`;
  await page.goto(fileUrl);

  // Wait for fonts to load
  await page.waitForFunction(() => document.fonts.ready.then(() => true), null, {
    timeout: 10000,
  });
  await page.waitForTimeout(500);

  // Screenshot at 1024x1024
  const pngBuffer = await page.screenshot({
    type: "png",
    clip: { x: 0, y: 0, width: 1024, height: 1024 },
  });

  await browser.close();

  // Save 1024
  const icon1024Path = path.join(OUTPUT_DIR, "icon-1024.png");
  fs.writeFileSync(icon1024Path, pngBuffer);
  console.log("Created icon-1024.png");

  // Resize to 512, 192, 180 (apple-touch), 32 (favicon png)
  const sizes = [
    { size: 512, name: "icon-512.png" },
    { size: 192, name: "icon-192.png" },
    { size: 180, name: "apple-touch-icon.png" },
  ];

  for (const { size, name } of sizes) {
    await sharp(pngBuffer).resize(size, size).png().toFile(path.join(OUTPUT_DIR, name));
    console.log(`Created ${name}`);
  }

  // favicon.ico — 32x32 PNG saved as .ico (browsers accept PNG-based ico)
  const favicon32 = await sharp(pngBuffer).resize(32, 32).png().toBuffer();
  // Create a minimal ICO file wrapping the PNG
  const icoBuffer = createIco(favicon32, 32, 32);
  fs.writeFileSync(path.join(OUTPUT_DIR, "favicon.ico"), icoBuffer);
  console.log("Created favicon.ico");

  console.log("\nAll icons generated in public/");
}

/** Create a minimal ICO file from a PNG buffer */
function createIco(pngData: Buffer, width: number, height: number): Buffer {
  // ICO header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = ICO
  header.writeUInt16LE(1, 4); // count: 1 image

  // Directory entry: 16 bytes
  const entry = Buffer.alloc(16);
  entry.writeUInt8(width >= 256 ? 0 : width, 0);
  entry.writeUInt8(height >= 256 ? 0 : height, 1);
  entry.writeUInt8(0, 2); // color palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngData.length, 8); // size of image data
  entry.writeUInt32LE(6 + 16, 12); // offset to image data

  return Buffer.concat([header, entry, pngData]);
}

generateIcons().catch((err) => {
  console.error("Icon generation failed:", err);
  process.exit(1);
});

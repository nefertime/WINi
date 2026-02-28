/**
 * Convert an image File to a JPEG base64 data URL, resized if needed.
 * Handles HEIC (on browsers that support it, e.g. Safari/iOS) by drawing
 * to canvas and exporting as JPEG.
 * Falls back to regular <canvas> when OffscreenCanvas is unavailable (Safari/iOS).
 */
export async function convertImageToJpeg(
  file: File,
  maxWidth = 2048
): Promise<string> {
  const bitmap = await createImageBitmap(file);

  let width = bitmap.width;
  let height = bitmap.height;

  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  // Use OffscreenCanvas when available, fall back to regular canvas (Safari/iOS)
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.85 });
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return `data:image/jpeg;base64,${btoa(binary)}`;
  }

  // Fallback: regular <canvas> element
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", 0.85);
}

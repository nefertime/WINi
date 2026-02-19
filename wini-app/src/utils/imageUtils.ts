/**
 * Convert an image File to a JPEG base64 data URL, resized if needed.
 * Handles HEIC (on browsers that support it, e.g. Safari/iOS) by drawing
 * to canvas and exporting as JPEG.
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

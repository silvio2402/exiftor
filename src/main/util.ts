/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import { ExifTool } from 'exiftool-vendored';
import sharp from 'sharp';
import { TagsSchema, Tags, WriteTags } from '../common/exif-types';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export async function readImage(imgPath: string, thumbnail: boolean) {
  const imgConversionSettings = thumbnail
    ? s.settings.image.thumbnail
    : s.settings.image.preview;
  let img = sharp(imgPath, { sequentialRead: true }).webp(
    imgConversionSettings.webpOptions
  );
  const resizeOptions: sharp.ResizeOptions = {
    withoutEnlargement: true,
    fit: 'inside',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  };
  if (!imgConversionSettings.disableResize && imgConversionSettings.resolution)
    img = img.resize(
      imgConversionSettings.resolution.width,
      imgConversionSettings.resolution.height,
      resizeOptions
    );
  return img.toBuffer();
}

export async function ensureExifTool() {
  if (!(globalThis.exiftool === undefined || globalThis.exiftool.ended)) return;
  const newExiftool = new ExifTool({
    exiftoolArgs: ['-stay_open', 'True', '-@', '-'],
    maxProcs: s.settings.exiftool.maxProcs,
    minDelayBetweenSpawnMillis: 500,
  });
  const newExiftoolVersion = await newExiftool.version();
  // eslint-disable-next-line no-console
  console.log(`ExifTool version: ${newExiftoolVersion}`);
  globalThis.exiftool = newExiftool;
}

export async function readExif(filePath: string): Promise<Tags> {
  await ensureExifTool();
  const data = exiftool.readRaw(filePath);
  return TagsSchema.parse(data);
}

export async function writeExif(filePath: string, tags: WriteTags) {
  await ensureExifTool();
  return exiftool.write(filePath, tags);
}

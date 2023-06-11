/* eslint import/prefer-default-export: off */
import { app } from 'electron';
import { URL } from 'url';
import path from 'path';
import sharp from 'sharp';
import { ExifTool, RawTags } from 'exiftool-vendored';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export function expandPath(pathToExpand: string) {
  let outputPath = pathToExpand;
  outputPath = outputPath.replace('~', app.getPath('home'));
  outputPath = path.normalize(outputPath);
  return outputPath;
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
  newExiftool
    .version()
    .then((exiftoolVersion) =>
      // eslint-disable-next-line no-console
      console.log(`ExifTool version: ${exiftoolVersion}`)
    )
    // eslint-disable-next-line no-console
    .catch(console.error);

  globalThis.exiftool = newExiftool;
}

export async function readExif(filePath: string): Promise<RawTags> {
  await ensureExifTool();
  const data = await exiftool.readRaw(filePath);
  // eslint-disable-next-line no-console
  console.log(data);
  return data;
}

export async function writeExif(filePath: string, tags: RawTags) {
  await ensureExifTool();
  return exiftool.write(filePath, tags);
}

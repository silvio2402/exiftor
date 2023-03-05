/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import sharp from 'sharp';

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
  let img = sharp(imgPath, { sequentialRead: true }).webp({
    nearLossless: !thumbnail,
  });
  const resizeOptions: sharp.ResizeOptions = {
    withoutEnlargement: true,
    fit: 'inside',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  };
  if (thumbnail) img = img.resize(256, 256, resizeOptions);
  else img = img.resize(1200, 800, resizeOptions);
  return img.toBuffer();
}

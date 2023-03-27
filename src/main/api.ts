import { homedir } from 'os';
import fs from 'fs';
import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import { WriteTagsSchema } from '../common/exif-types';
import superjson from '../common/superjson';
import { readImage, readExif, writeExif } from './util';

const t = initTRPC.create({ isServer: true, transformer: superjson });

const { router, procedure: publicProcedure } = t;

// Make sure to invalidate stuff when creating new endpoints that depend on the same data
export const appRouter = router({
  readDir: publicProcedure
    .input(z.object({ path: z.string(), excludeFiles: z.boolean().optional() }))
    .query(async ({ input }) => {
      let { path: dirPath } = input;
      const { excludeFiles } = input;
      dirPath = dirPath.replace('%HOME%', homedir());
      const files = fs.readdirSync(dirPath, { withFileTypes: true });
      let msgEntries = [];
      msgEntries = files.flatMap((file) => {
        const isDirectory = file.isDirectory();
        const isFile = file.isFile();
        const isSymbolicLink = file.isSymbolicLink();
        return isDirectory || isFile || isSymbolicLink
          ? {
              name: file.name,
              isDirectory,
              isFile,
              isSymbolicLink,
            }
          : [];
      });
      if (excludeFiles) {
        msgEntries = msgEntries.filter((entry) => !entry.isFile);
      }
      return {
        entries: msgEntries,
      } as const;
    }),
  readImg: publicProcedure
    .input(z.object({ path: z.string(), thumbnail: z.boolean() }))
    .query(async ({ input }) => {
      let { path: imgPath } = input;
      const { thumbnail } = input;
      imgPath = imgPath.replace('%HOME%', homedir());
      const imgBuffer = await readImage(imgPath, thumbnail);
      return {
        imgBuffer,
      } as const;
    }),
  readExif: publicProcedure.input(z.object({ path: z.string() })).query(
    async ({ input }) =>
      ({
        tags: await readExif(input.path),
      } as const)
  ),
  writeExif: publicProcedure
    .input(z.object({ path: z.string(), tags: WriteTagsSchema }))
    .mutation(async ({ input }) => {
      const { path: filePath, tags } = input;
      return writeExif(filePath, tags);
    }),
});

export type AppRouter = typeof appRouter;

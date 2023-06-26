import fs from 'fs';
import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import { SettingsObject, settingsObjectSchema } from '../common/settings-types';
import superjson from '../common/superjson';
import { readImage, readExif, writeExif, expandPath } from './util';
import { rawTagsSchema } from '../common/exif-types';

const t = initTRPC.create({ isServer: true, transformer: superjson });

const { router, procedure: publicProcedure } = t;

// Make sure to invalidate stuff when creating new endpoints that depend on the same data
export const appRouter = router({
  getSettings: publicProcedure.query(async (): Promise<SettingsObject> => {
    return s.settings;
  }),
  setSettings: publicProcedure
    .input(z.object({ settings: settingsObjectSchema }))
    .mutation(async ({ input }) => {
      const { settings } = input;
      s.settings = settings;
    }),
  resetSettings: publicProcedure.mutation(async () => settings.reset()),
  readDir: publicProcedure
    .input(z.object({ path: z.string(), excludeFiles: z.boolean().optional() }))
    .query(async ({ input }) => {
      let { path: dirPath } = input;
      const { excludeFiles } = input;
      dirPath = expandPath(dirPath);
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
      imgPath = expandPath(imgPath);
      const imgBuffer = await readImage(imgPath, thumbnail);
      return {
        imgBuffer,
      } as const;
    }),
  readExif: publicProcedure
    .input(z.object({ path: z.string() }))
    .query(async ({ input }) => {
      let { path: filePath } = input;
      filePath = expandPath(filePath);
      const tags = await readExif(filePath);
      return {
        tags,
      } as const;
    }),
  writeExif: publicProcedure
    .input(
      z.object({
        path: z.string(),
        tags: rawTagsSchema,
      })
    )
    .mutation(async ({ input }) => {
      const { tags } = input;
      let { path: filePath } = input;
      filePath = expandPath(filePath);
      return writeExif(filePath, tags);
    }),
});

export type AppRouter = typeof appRouter;

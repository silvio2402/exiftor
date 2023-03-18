import { homedir } from 'os';
import fs from 'fs';
import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import superjson from '../common/superjson';
import { readImage } from './util';

const t = initTRPC.create({ isServer: true, transformer: superjson });

const { router, procedure: publicProcedure } = t;

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
});

export type AppRouter = typeof appRouter;

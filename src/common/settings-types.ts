import { z } from 'zod';
import type { WebpOptions } from 'sharp';

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);
// type AnyJson = z.infer<typeof jsonSchema>;

export const deepSettingsObjectSchema = z.union([
  z.array(jsonSchema),
  z.record(jsonSchema),
]);
export type DeepSettingsObject = z.infer<typeof deepSettingsObjectSchema>;

export const settingsWithVersionSchema = z
  .object({
    version: z.string(),
  })
  .catchall(
    z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
  );
export type SettingsWithVersion = z.infer<typeof settingsWithVersionSchema>;

export type MigrationFunction = (
  oldSettings: SettingsWithVersion
) => SettingsWithVersion;

export type MigrationFunctions = Record<
  string,
  { up: MigrationFunction; down?: MigrationFunction }
>;

export type SettingsConfig = {
  atomicSave: boolean;
  dir?: string;
  fileName: string;
  numSpaces: number;
  prettify: boolean;
};

///

const webpOptionsSchema: z.ZodType<WebpOptions> = z.lazy(() =>
  z.object({
    // extends OutputOptions
    force: z.boolean().optional(),
    // extends AnimationOptions
    loop: z.number().optional(),
    delay: z.union([z.number(), z.array(z.number())]).optional(),
    // WebpOptions
    quality: z.number().optional(),
    alphaQuality: z.number().optional(),
    lossless: z.boolean().optional(),
    nearLossless: z.boolean().optional(),
    smartSubsample: z.boolean().optional(),
    effort: z.number().optional(),
    minSize: z.number().optional(),
    mixed: z.boolean().optional(),
  })
);

export const imageConversionSettingsSchema = z.object({
  disableResize: z.boolean(),
  resolution: z.object({
    width: z.number(),
    height: z.number(),
  }),
  webpOptions: webpOptionsSchema,
});
export type ImageConversionSettings = z.infer<
  typeof imageConversionSettingsSchema
>;

export const settingsObjectSchema = settingsWithVersionSchema.extend({
  image: z.object({
    thumbnail: imageConversionSettingsSchema,
    preview: imageConversionSettingsSchema,
  }),
  exiftool: z.object({
    maxProcs: z.number(),
  }),
});
export type SettingsObject = z.infer<typeof settingsObjectSchema>;

import { z } from 'zod';
import { RawTags } from 'exiftool-vendored';
import { jsonSchemaNoNull } from './json-types';

// eslint-disable-next-line import/prefer-default-export
export const rawTagsSchema: z.ZodType<RawTags> = z.record(
  z.string(),
  jsonSchemaNoNull
);

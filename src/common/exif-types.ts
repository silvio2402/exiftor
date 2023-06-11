import { z } from 'zod';
import { RawTags } from 'exiftool-vendored';
import { jsonSchemaNoNull } from './json-types';

const rawTagsSchema: z.ZodType<RawTags> = z.record(
  z.string(),
  jsonSchemaNoNull
);

export default { rawTagsSchema, jsonSchemaNoNull };

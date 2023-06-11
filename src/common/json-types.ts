import { z } from 'zod';

export const literalSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);
export type Literal = z.infer<typeof literalSchema>;

export const literalSchemaNoNull = z.union([
  z.string(),
  z.number(),
  z.boolean(),
]);
export type LiteralNoNull = z.infer<typeof literalSchemaNoNull>;

export type Json = Literal | { [key: string]: Json } | Json[];
export type JsonNoNull =
  | LiteralNoNull
  | { [key: string]: JsonNoNull }
  | JsonNoNull[];

export const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);
export const jsonSchemaNoNull: z.ZodType<JsonNoNull> = z.lazy(() =>
  z.union([
    literalSchemaNoNull,
    z.array(jsonSchemaNoNull),
    z.record(jsonSchemaNoNull),
  ])
);

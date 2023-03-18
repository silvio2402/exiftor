import superjson from 'superjson';
import { Buffer } from 'buffer';

// TODO: After trpc/trpc#1937 is resolved, use additonal Content-Type
const ENCODING = 'base64';
superjson.registerCustom<Buffer, string>(
  {
    isApplicable: (v): v is Buffer => v instanceof Buffer,
    serialize: (v) => v.toString(ENCODING),
    deserialize: (v) => Buffer.from(v, ENCODING),
  },
  'buffer'
);

export default superjson;

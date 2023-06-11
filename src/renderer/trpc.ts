import { createTRPCReact } from '@trpc/react-query';

import type { AppRouter } from 'main/api';

const trpc = createTRPCReact<AppRouter>();
// eslint-disable-next-line import/prefer-default-export
export { trpc, AppRouter };

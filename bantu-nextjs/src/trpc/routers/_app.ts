import { createTRPCRouter } from '../init';
import { adminRouter } from './admin';
import { apiKeysRouter } from './api-keys';
import { billingRouter } from './billing';
import { developerRouter } from './developer';
import { generationsRouter } from './generations';
import { profileRouter } from './profile';
import { settingsRouter } from './settings';
import { transcriptionsRouter } from './transcriptions';
import { voicesRouter } from './voices';
import { webhooksRouter } from './webhooks';
export const appRouter = createTRPCRouter({
  admin: adminRouter,
  voices: voicesRouter,
  generations: generationsRouter,
  transcriptions: transcriptionsRouter,
  billing: billingRouter,
  settings: settingsRouter,
  apiKeys: apiKeysRouter,
  webhooks: webhooksRouter,
  developer: developerRouter,
  profile: profileRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;

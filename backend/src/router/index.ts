import { usersRouter } from './routers/users';
import { threadsRouter } from './routers/threads';
import { router } from './trpc';

export const appRouter = router({
  users: usersRouter,
  threads: threadsRouter,
});

export type AppRouter = typeof appRouter;

import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { authenticateRequest } from "../auth-hook";

export interface User {
  name: string[] | string;
}

export const createContext = async ({ req, res }: CreateFastifyContextOptions) => {
  const isAuthenticated = await authenticateRequest(req);
  const user: User = { name: req.headers.username ?? "anonymous" };

  return { req, res, user, isAuthenticated };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

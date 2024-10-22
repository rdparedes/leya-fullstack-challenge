import { FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    userStore: Map<string, string>
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: { username: string }
  }
}

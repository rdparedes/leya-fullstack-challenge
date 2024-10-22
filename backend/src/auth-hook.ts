import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { FastifyReply, FastifyRequest } from "fastify";

export const authHook = fp(async function (fastify, opts) {
  fastify.register(fastifyJwt, {
    secret: "supersecret",
  });

  fastify.decorate("userStore", new Map<string, string>());

  fastify.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
      const token = request.headers.authorization?.split(" ")[1];
      if (token) {
        const username = fastify.userStore.get(token);
        if (username) {
          request.user = { username };
        }
      }
    } catch (err) {
      reply.send(err);
    }
  });
});

export const authenticateRequest = async (request: FastifyRequest) => {
  try {
    await request.jwtVerify();
    return true;
  } catch (err) {
    return false;
  }
};

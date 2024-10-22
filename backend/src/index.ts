import cors from "@fastify/cors";
import ws from "@fastify/websocket";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import { createContext } from "./router/context";
import { appRouter } from "./router/index";
import z from "zod";
import { authHook } from "./auth-hook";
import { getUser } from "./services/userService";

const HOST = "0.0.0.0";
const PREFIX = "/trpc";
const server = fastify();

void server.register(cors, {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
});
void server.register(authHook);
void server.setValidatorCompiler(validatorCompiler);
void server.setSerializerCompiler(serializerCompiler);
void server.register(ws);
void server.register(fastifyTRPCPlugin, {
  prefix: PREFIX,
  useWSS: true,
  trpcOptions: { router: appRouter, createContext },
});

server.get("/ping", async (request, reply) => {
  return "pong\n";
});

server.withTypeProvider<ZodTypeProvider>().route({
  method: "POST",
  url: "/auth",
  schema: {
    body: z.object({
      username: z.string(),
      password: z.string(),
    }),
    response: {
      200: z.object({
        token: z.string(),
      }),
      401: z.object({
        error: z.string(),
      }),
    },
  },
  handler: async (req, res) => {
    const { username, password } = req.body;

    if (password === "adminadmin") {
      const token = server.jwt.sign({ username }, { expiresIn: "1h" });
      server.userStore.set(token, username)
      return { token };
    } else {
      res.code(401).send({ error: "Invalid credentials" });
    }
  },
});

server.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/user/current-user",
  schema: {
    response: {
      200: z
        .object({
          name: z.string().nullable(),
          email: z.string(),
        })
        .nullable(),
      401: z.object({
        error: z.string(),
      }),
    },
  },
  onRequest: (req, res) => server.authenticate(req, res),
  handler: async (req, res) => {
    const userData = await getUser(req.user!.username);
    return userData;
  },
});

server.listen({ host: HOST, port: 4000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

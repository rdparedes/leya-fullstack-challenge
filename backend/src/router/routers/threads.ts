import type { Message } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";
import z from "zod";
import { getOrCreateThread, postMessage, ThreadWithContent } from "../../services/threadService";
import { authedProcedure, publicProcedure, router } from "../trpc";

const threadEventEmitter = new EventEmitter();

export const threadsRouter = router({
  getOrCreateThread: authedProcedure
    .input(
      z.object({
        threadId: z.string().regex(/^\d+$/).transform(Number).optional(),
        participants: z.array(z.string().email()).optional()
      })
    )
    .output(z.custom<ThreadWithContent>().nullable())
    .mutation(async ({ input }) => {
      const foundThread = await getOrCreateThread(input.participants, input.threadId);
      if (foundThread) {
        return foundThread;
      }
      return null;
    }),

  threadMessages: publicProcedure
    .input(
      z.object({
        threadId: z.string().regex(/^\d+$/).transform(Number),
      })
    )
    .subscription(({ input }) => {
      return observable<Message>((emit) => {
        const onMessage = (message: Message) => {
          if (message.threadId === input.threadId) {
            emit.next(message);
          }
        };

        threadEventEmitter.on("newMessage", onMessage);

        return () => {
          threadEventEmitter.off("newMessage", onMessage);
        };
      });
    }),

  postMessage: authedProcedure
    .input(
      z.object({
        threadId: z.string().regex(/^\d+$/).transform(Number),
        username: z.string().email(),
        createdAt: z.string().datetime(),
        content: z.string().min(1).max(1000),
      })
    )
    .output(z.custom<Message>())
    .mutation(async ({ input }) => {
      const { threadId, username, createdAt, content } = input;
      const createdMessage = await postMessage(threadId, username, new Date(createdAt), content);
      if (createdMessage) {
        threadEventEmitter.emit('newMessage', createdMessage);
        return createdMessage;
      }
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Failed to create message",
      });
    }),
});

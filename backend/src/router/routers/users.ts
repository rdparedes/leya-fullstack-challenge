import z from "zod";
import type { User } from "@prisma/client";
import { getAllEmptyUserThreads, getAllUserThreads, ThreadWithParticipants } from "../../services/userService";
import { authedProcedure, router } from "../trpc";

export const usersRouter = router({
  getUserThreads: authedProcedure
    .input(
      z.object({
        username: z.string().email(),
      })
    )
    .output(
      z.object({
        threads: z.array(z.custom<ThreadWithParticipants>()),
        noThread: z.array(z.custom<User>()),
      })
    )
    .query(async ({ input }) => {
      const foundThreads = await getAllUserThreads(input.username);
      const emptyUserThreads = await getAllEmptyUserThreads(input.username);
      return {
        threads: foundThreads,
        noThread: emptyUserThreads,
      };
    }),
});

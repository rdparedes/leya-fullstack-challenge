import type { Thread, User } from "@prisma/client";
import prisma from "../dbclient";

export type ThreadWithParticipants = Thread & {
  Participants: Pick<User, 'id' | 'email' | 'name'>[];
};

export async function getAllUserThreads(userEmail: string): Promise<ThreadWithParticipants[]> {
  const foundThreads = await prisma.thread.findMany({
    where: {
      Participants: {
        some: {
          email: userEmail
        },
      },
    },
    include: {
      Participants: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      messages: false,
    },
  });

  return foundThreads;
}

export async function getAllEmptyUserThreads(userEmail: string): Promise<User[]> {
  const foundUsers = await prisma.user.findMany({
    where: {
      email: {
        not: userEmail
      },
      threads: {
        every: {
          Participants: {
            none: {
              email: userEmail
            }
          }
        }
      }
    }
  });

  return foundUsers;
}

export async function getUser(userEmail: string): Promise<User | null> {
  const foundUser = await prisma.user.findUnique({
    where: {
      email: userEmail
    },
  })

  return foundUser;
}

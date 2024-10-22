import prisma from "../dbclient";
import type { Message } from "@prisma/client";
import { ThreadWithParticipants } from "./userService";

export type ThreadWithContent = ThreadWithParticipants & {
  messages: Pick<Message, 'id' | 'content' | 'createdAt' |'userId'>[];
};

export async function getOrCreateThread(participants?: string[], threadId?: number): Promise<ThreadWithContent | null> {
  if (threadId) {
    const foundThread = await prisma.thread.findUnique({
      where: {
        id: threadId,
      },
      include: {
        Participants: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        messages: true,
      },
    });
    return foundThread;
  }

  const users = await prisma.user.findMany({
    where: {
      email: {
        in: participants,
      },
    },
  });
  if (users.length < 2) {
    throw new Error("Users not found for thread creation");
  }
  const newThread = await prisma.thread.create({
    data: {
      Participants: {
        connect: users,
      },
      participantIds: users.map(u => u.id)
    },
    include: {
      Participants: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      messages: true
    }
  });

  return newThread;
}

export async function postMessage(threadId: number, senderUsername: string, createdAt: Date, content: string) {
  // TODO: Allow posting only if sender is participant in the Thread.

  const created = await prisma.message.create({
    data: {
      content,
      createdAt,
      Sender: {
        connect: { email: senderUsername },
      },
      Thread: {
        connect: { id: threadId },
      },
    },
  });

  return created;
}

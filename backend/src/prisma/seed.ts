import { User } from "@prisma/client";
import { faker } from "@faker-js/faker";
import prisma from "../dbclient";
import crypto from "crypto";

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return { hashedPassword, salt };
}

async function generateUsers() {
  const generatedUsers: User[] = [];
  for (let i = 0; i < 10; i++) {
    const password = faker.internet.password();
    const { hashedPassword, salt } = hashPassword(password);
    const u = await prisma.user.create({
      data: {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        hashedPassword,
        salt,
      },
    });
    generatedUsers.push(u);
    // IMPORTANT: Don't do this in a real prod environment ^^
    console.log("ℹ️ A new user has been generated. Store its credentials somewhere safe: ", {
      email: u.email,
      password,
    });
  }
  return generatedUsers;
}

async function generateThreads(users: User[], numberOfThreads: number) {
  for (let i = 0; i < numberOfThreads; i++) {
    // Pick up 2 random users to create a thread
    const shuffledUsers = users.sort(() => Math.random() - 0.5);
    const [user1, user2] = shuffledUsers.slice(0, 2);

    const newThread = await prisma.thread.create({
      data: {
        Participants: {
          connect: [{ id: user1.id }, { id: user2.id }],
        },
        participantIds: [user1.id, user2.id]
      },
    });
    // Create random messages
    const messages = [
      await prisma.message.create({
        data: {
          content: `Oh hai ${user2.name}!`,
          Sender: {
            connect: { id: user1.id },
          },
          Thread: {
            connect: { id: newThread.id },
          },
        },
      }),
      await prisma.message.create({
        data: {
          content: `hey hey ${user1.name}`,
          Sender: {
            connect: { id: user2.id },
          },
          Thread: {
            connect: { id: newThread.id },
          },
        },
      }),
      await prisma.message.create({
        data: {
          content: faker.lorem.sentence(),
          Sender: {
            connect: { id: user1.id },
          },
          Thread: {
            connect: { id: newThread.id },
          },
        },
      }),
    ];
  }
}

async function main() {
  const users = await generateUsers();
  await generateThreads(users, 2);

  console.log("✅ Seeding was successful.")
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

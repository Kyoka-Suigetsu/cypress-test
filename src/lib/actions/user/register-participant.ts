"use server";

import { db } from "@/server/db";
import { Role } from "@prisma/client";
import { hash } from "bcryptjs";

interface ParticipantRegisterProps {
  name: string;
  email: string;
  password: string;
}

export async function registerParticipant({
  name,
  email,
  password,
}: ParticipantRegisterProps) {
  let user = await db.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });

  if (user) {
    throw new Error("Email already registered!");
  }

  const hashedPassword = await hash(password, 12);

  user = await db.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: Role.PARTICIPANT,
      organizationId: "c2e8a782-829e-4d4b-bc42-31b5523f32aa",
    },
  });

  if (!user) {
    throw new Error("Unable to create user profile");
  }

  const account = await db.account.create({
    data: {
      userId: user.id,
      type: "credentials",
      provider: "credentials",
      providerAccountId: user.id,
    },
  });

  if (!account) {
    throw new Error("Unable to link user account");
  }

  const room = await db.room.create({
    data: {
      name: user.id,
      description: `${user.name}'s Personal Room`,
      ownedBy: {
        connect: {
          id: user.id,
        },
      },
      organization: {
        connect: {
          id: user.organizationId ?? "",
        },
      },
    },
  });

  if (!room) {
    throw new Error("Unable to create user room");
  }

  return {
    email: email,
    password: password,
  };
}

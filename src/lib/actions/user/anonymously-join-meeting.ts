"use server";

import { db } from "@/server/db";
import { createId } from "@paralleldrive/cuid2";
import { Role } from "@prisma/client";
import { hash } from "bcryptjs";

interface AnonymousProps {
  name: string;
  meetingId: string;
}

export async function anonymouslyJoinMeeting({
  name,
  meetingId,
}: AnonymousProps) {
  const meeting = await db.meeting.findUnique({
    where: {
      id: meetingId,
    },
  });

  if (!meeting) {
    throw new Error("Meeting not found!");
  }

  const email = `Anonymous-${createId()}@lingopal.ai`;
  const password = createId();
  const hashedPassword = await hash(password, 12);
  const user = await db.user.create({
    data: {
      name,
      email: email,
      password: hashedPassword,
      role: Role.ANONYMOUS,
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

  return {
    email: email,
    password: password,
  };
}

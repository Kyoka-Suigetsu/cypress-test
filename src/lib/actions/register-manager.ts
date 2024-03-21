'use server'

import { db } from "@/server/db";
import { Role } from "@prisma/client";
import { hash } from "bcryptjs";

interface RegisterManagerProps {
  name: string;
  email: string;
  password: string;
  organization: string;
}

export async function registerManager({ name, email, password, organization }: RegisterManagerProps) {
  let user = await db.user.findUnique({
    where: {
      email: email.toLowerCase()
    }
  })

  if (user) {
    throw new Error("Email already registered!");
  }

  const hashedPassword = await hash(password, 12);

  user = await db.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: Role.MANAGER,
      organization: {
        connect: {
          id: organization
        }
      }
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

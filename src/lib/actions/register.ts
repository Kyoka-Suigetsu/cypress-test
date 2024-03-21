'use server'

import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { type Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { revalidatePath, revalidateTag } from "next/cache";

interface RegisterProps {
  name: string;
  email: string;
  password: string;
  role: Role;
  organization?: string;
}

export async function registerUser({ name, email, password, role, organization }: RegisterProps) {
  const session = await getServerAuthSession()
  const orgId = (organization ?? session?.user?.organizationId) ?? '';

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
      role,
      organization: {
        connect: {
          id: orgId
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

  revalidatePath('/accounts', 'page')

  if(role === "MANAGER"){
    revalidateTag(`${orgId}_managers`)
  }

  return {
    email: email,
    password: password,
  };
}

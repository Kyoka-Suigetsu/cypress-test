"use server";

import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { type Role } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";

interface UserProps {
  userId: string;
  name: string;
  role: Role;
}

/**
 * @requires `ADMIN` role
 * @requires `user.sessionToken` pass headers if used in an RSC
 * 
 * @throws `Error` if permission level not high enough or user
 */
export async function editUser({ userId, name, role }: UserProps) {
  const session = await getServerAuthSession()

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Access restricted!");
  }

  const user = await db.user.findUnique({
    where: {
      id: userId,
      organizationId: session.user.organizationId,
    },
  });

  if (!user) {
    throw new Error("User not found!");
  }

  const updatedUser = await db.user.update({
    data: {
      name,
      role,
    },
    where: {
      id: userId,
    },
  });

  if (!updatedUser) {
    throw new Error("User not edited!");
  }

  if (role === "MANAGER") {
    revalidateTag(`${user.organizationId}_managers`)
  }

  revalidatePath("/account", "page");
}

'use server'

import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

/**
 * @requires `ADMIN` role
 * @requires `user.sessionToken` pass headers if used in an RSC
 * 
 * @throws `Error` if permission level not high enough or user not found
 */
export async function deleteUser(userId: string) {
  const session = await getServerAuthSession()

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Access restricted!");
  }

  const user = await db.user.delete({
    where: {
      id: userId,
      organizationId: session.user.organizationId,
    },
  })

  if (!user) {
    throw new Error("Unable to delete user!");
  }

  revalidatePath('/users')

  return true;
}
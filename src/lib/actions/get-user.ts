'use server'

import { db } from "@/server/db";
import { type Prisma } from "@prisma/client";
import { memoize } from "nextjs-better-unstable-cache";

const getUserMemoize = memoize(
  async (type: 'id' | 'email' = 'id', id: string) => {
    let user: Prisma.UserGetPayload<{
      select: {
        id: boolean;
        name: boolean;
        email: boolean;
      };
    }> | null = null;

    if (type === 'id') {
      user = await db.user.findFirst({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      })
    } else if (type === 'email') {
      user = await db.user.findFirst({
        where: {
          email: id,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      })
    }

    return user;
  },
  {
    revalidateTags: (type: 'id' | 'email', id: string) => [`${id}_user`]
  }
);

export async function getUser(type: 'id' | 'email' = 'id', id: string) {
  return getUserMemoize(type, id);
}
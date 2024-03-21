"use server";

import { db } from "@/server/db";
import { memoize } from "nextjs-better-unstable-cache";

const getUserNameMemoize = memoize(
  async (id: string) => {
    try{
      const user = await db.user.findFirst({
        where: {
          id,
        },
        select: {
          name: true,
        },
      });

      return user?.name;
    } catch (err) {
      console.log(err)
    }

    return "Couldn't get name"
  },
  {
    revalidateTags: (id: string) => [`${id}_name`],
  },
);

export async function getUserName(id: string) {
  return getUserNameMemoize(id);
}
'use server'

import { db } from "@/server/db";
import { memoize } from "nextjs-better-unstable-cache";

export async function getUserVoices(id: string) {
  return memoize(
    async (id: string) => {
      const userVoices = await db.userVoice.findMany({
        where: {
          userId: id
        }
      });

      if (!userVoices) {
        throw new Error("Error getting user voices!");
      }

      return userVoices;
    },
    {
      revalidateTags: (id: string) => [`${id}_user_voices`],
      duration: 86400
    }
  )(id)
};

"use server";

import { type UserPreferences } from "@/schemas/preference";
import { db } from "@/server/db";
import { revalidateTag } from "next/cache";

export async function setPreferences(
  id: string,
  newPreferences: UserPreferences,
) {
  const preference = await db.userPreference.update({
    data: {
      ...newPreferences,
    },
    where: {
      userId: id,
    },
  });

  if (!preference) {
    throw new Error("Unable to update preferences!");
  }

  revalidateTag(`${id}_preferences`);

  return true;
}
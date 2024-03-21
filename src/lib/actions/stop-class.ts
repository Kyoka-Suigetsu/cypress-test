'use server'

import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

export async function stopClass(courseId: string, classId: string) {
  const session = await getServerAuthSession()

  if (!session) {
    throw new Error(`User not found!`);
  }

  const meeting = await db.meeting.update({
    data: {
      isActive: false
    },
    where: { 
      id: classId,
      room: {
        ownedById: session.user.id
      }
    },
  })

  if (!meeting) {
    throw new Error(`Could not update Class ${classId}!`);
  }

  revalidatePath(`/${courseId}`, 'page')
  return meeting
}

'use server'

import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

export async function startClass(courseId: string) {
  const session = await getServerAuthSession()

  if (!session) {
    throw new Error(`User not found!`);
  }
  
  const course = await db.room.findUnique({
    where: { 
      id: courseId,
      ownedById: session.user.id
    },
  })

  if (!course) {
    throw new Error(`Course ${courseId} not found!`);
  }

  const meeting = await db.meeting.create({
    data: { 
      name: course.name,
      isActive: true,
      room: {
        connect: course
      }
    },
  })
  
  if (!meeting) {
    throw new Error(`Class for course ${courseId} not created!`);
  }

  revalidatePath(`/${courseId}`, 'page')
  
  return meeting
}

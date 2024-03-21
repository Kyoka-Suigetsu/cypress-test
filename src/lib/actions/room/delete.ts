'use server'

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

interface DeleteProps {
  courseId: string;
}

export async function deleteCourse({ courseId }: DeleteProps) {
  const course = await db.room.delete({
    where: {
      id: courseId
    },
  })

  if(!course) {
    throw new Error("Unable to delete course!");
  }

  revalidatePath('/')

  return true;
}

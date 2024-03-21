"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

interface EditProps {
  course_id: string;
  name: string;
  description: string;
  email: string;
}

export async function editRoom({
  course_id,
  name,
  description,
  email,
}: EditProps) {
  const user = await db.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
    include: {
      organization: true,
    },
  });

  if (!user) {
    throw new Error("User not found!");
  }

  const course = await db.room.update({
    data: {
      name,
      description,
      ownedBy: {
        connect: {
          id: user.id,
        },
      },
    },
    where: {
      id: course_id,
    },
  });

  if (!course) {
    throw new Error("Course not edited!");
  }
  revalidatePath("/", "page");
}

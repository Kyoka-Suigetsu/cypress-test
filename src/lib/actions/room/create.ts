'use server'

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

interface CreateProps {
  name: string;
  description: string;
  email: string;
}

export async function createRoom({ name, description, email }: CreateProps) {
  const user = await db.user.findUnique({
    where: {
      email: email.toLowerCase()
    },
    include: {
      organization: true
    }
  })

  
  if(!user || !user.organization) {
    throw new Error("User/Organization not found!");
  }

  const course = await db.room.create({
    data: {
      name,
      description,
      ownedBy: {
        connect: {
          id: user.id
        }
      },
      organization: {
        connect: {
          id: user.organization.id
        }
      }
    }
  });

  if(!course) {
    throw new Error("Course not created!");
  }

  revalidatePath('/', 'page')

  return course;
}

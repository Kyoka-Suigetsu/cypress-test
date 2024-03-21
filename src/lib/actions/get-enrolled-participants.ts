"use server";

import { db } from "@/server/db";
import { Role } from "@prisma/client";

export const getEnrolledParticipants = async (courseId: string) => {
  const participants = await db.user.findMany({
    where: {
      rooms: {
        some: {
          roomId: courseId,
        },
      },
      role: Role.PARTICIPANT,
    },
  });

  if (!participants) {
    throw new Error("Error getting participants!");
  }

  return participants;
};

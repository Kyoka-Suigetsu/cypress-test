"use server";

import { db } from "@/server/db";

export const getUserRoomsForCourse = async (courseId: string) => {
  const userRooms = await db.userRoom.findMany({
    where: {
      room: {
        id: courseId,
      },
    },
  });

  if (!userRooms) {
    throw new Error("Error getting participants!");
  }

  return userRooms;
};

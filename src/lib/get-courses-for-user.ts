import "server-only";

import { db } from "@/server/db";
import { type User } from "next-auth";
import type { Prisma } from "@prisma/client";

export type RoomWithUserRooms = Prisma.RoomGetPayload<{
  select: {
    id: true;
    name: true;
    description: true;
    ownedBy: true;
    userRooms: true;
  };
}>;

export type RoomWithUserRoomsList = Array<RoomWithUserRooms>;

export async function getCoursesForUser(user: User) {
  let courses: RoomWithUserRoomsList = [];

  if (user.role === "ADMIN") {
    courses = await db.room.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        ownedBy: true,
        userRooms: true,
      },
      where: {
        organizationId: user?.organizationId,
        id: {
          not: "live_chat",
        },
      },
    });
  }

  if (user?.role === "MANAGER") {
    courses = await db.room.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        ownedBy: true,
        userRooms: true,
      },
      where: {
        ownedBy: {
          id: user?.id,
        },
        id: {
          not: "live_chat",
        },
      },
    });
  }

  if (user?.role === "PARTICIPANT") {
    const participantCourses = await db.userRoom.findMany({
      where: {
        userId: user.id,
        room: {
          id: {
            not: "live_chat",
          },
        },
      },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            description: true,
            ownedBy: true,
            userRooms: true,
          },
        },
      },
    });

    if (participantCourses) {
      courses.push(...participantCourses.map((course) => course.room));
    }
  }

  return courses ?? [];
}

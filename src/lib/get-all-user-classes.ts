import 'server-only'
import { db } from '@/server/db';
import type { Meeting } from '@prisma/client';
import type { User } from 'next-auth';

export const getAllUserClasses = async (user: User) => {
  let allClasses: Array<Meeting>;
  
  if (user.role === "PARTICIPANT") {
    const allUserRooms = await db.userRoom.findMany({
      where: {
        userId: user.id,
      },
      include: {
        room: {
          include: {
            meetings: true,
          },
        },
      },
    });
    allClasses = allUserRooms.map((userRoom) => userRoom.room.meetings).flat();
  } else {
    const allUserRooms = await db.room.findMany({
      where: {
        ownedById: user.id,
      },
      select: {
        meetings: true,
      },
    });
    allClasses = allUserRooms.map((userRoom) => userRoom.meetings).flat();
  }

  return allClasses
}
"use server"

import { db } from "@/server/db";
import { memoize } from "nextjs-better-unstable-cache";

const getMeetingMemoize = memoize(
  async (meetingId: string) => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const meeting = await db.meeting.findUnique({
      where: {
        id: meetingId,
        createdAt: {
          gte: twoDaysAgo,
        },
      },
    });

    if (!meeting) {
      throw new Error("Meeting Not Found!");
    }

    return meeting;
  },
  {
    revalidateTags: (meetingId: string) => [`meeting_${meetingId}`],
    duration: 1000 * 60 * 60 * 24,
  },
);

export async function getMeeting(meetingId: string) {
  return getMeetingMemoize(meetingId);
}
"use server";

import { withAuthServerAction } from "@/lib/withAuth";
import { type Session } from "@/server/auth";
import { db } from "@/server/db";
import { joinMeeting } from "./join";

async function createMeetingHandler(
  session: Session,
  roomId: string,
  meetingName: string,
  privateMeeting: boolean
) {
  const meeting = await db.meeting.create({
    data: {
      roomId: roomId,
      name: meetingName,
      isActive: true,
      isPrivate: privateMeeting,
    },
  });

  if (!meeting) {
    throw new Error("Meeting not created!");
  }

  await joinMeeting(meeting.id);
}

export const createMeeting = withAuthServerAction(createMeetingHandler);
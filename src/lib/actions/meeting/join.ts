"use server";

import { withAuthServerAction } from "@/lib/withAuth";
import { type Session } from '@/server/auth';
import { redirect } from "next/navigation";
import { getMeeting } from "./get";

async function joinMeetingHandler(session: Session, meetingId: string) {
  const meeting = await getMeeting(meetingId);

  if (!meeting) {
    throw new Error("Meeting not found!");
  }

  if (!meeting.isActive) {
    throw new Error("Meeting is not active!");
  }

  redirect(`/meeting/${meetingId}`);
}

export const joinMeeting = withAuthServerAction(joinMeetingHandler);

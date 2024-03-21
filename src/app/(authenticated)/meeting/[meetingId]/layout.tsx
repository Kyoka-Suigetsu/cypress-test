import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { PermissionStatus } from "@prisma/client";
import { type Metadata, type ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

type Props = {
  children: React.ReactNode;
  idle: React.ReactNode;
  chatroom: React.ReactNode;
  params: { meetingId: string };
};

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  // read route params
  const id = params.meetingId;

  // fetch data
  const meetingName = await db.meeting.findUnique({
    where: {
      id,
    },
  });

  return {
    title: `${meetingName?.name} - Chatroom - LingopalAI`,
  };
}

const GroupLayout = async ({ params, children, idle, chatroom }: Props) => {
  const session = await getServerAuthSession();

  if (!session) {
    return null;
  }

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  const meeting = await db.meeting.findUnique({
    where: {
      id: params.meetingId,
      isActive: true,
      createdAt: {
        gte: twoDaysAgo,
      },
    },
    include: {
      room: {
        select: {
          ownedById: true,
        },
      },
    },
  });
  
  if (!meeting) {
    notFound();
  }

  const userMeeting = await db.userMeeting.findUnique({
    where: {
      userId_meetingId: {
        userId: session.user.id,
        meetingId: params.meetingId,
      },
    },
  });

  // If the meeting owner, granted access already or a public meeting, allow access
  const isPermitted =
    meeting.room?.ownedById === session.user.id ||
    (!meeting.isPrivate &&
      userMeeting?.permission !== PermissionStatus.DENIED) ||
    userMeeting?.permission === PermissionStatus.GRANTED;

  return (
    <>
      {children}
      {isPermitted ? chatroom : idle}
    </>
  );
};

export default GroupLayout;

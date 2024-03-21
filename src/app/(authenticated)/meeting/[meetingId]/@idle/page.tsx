import { db } from "@/server/db";
import { getServerAuthSession } from "@/server/auth";
import { PermissionStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

const Waiting = dynamic(() => import("./waiting"), {
  ssr: false,
});

export default async function IdlePage({
  params,
}: Readonly<{
  params: { meetingId: string };
}>) {
  const session = await getServerAuthSession();

  if (!session) {
    return null;
  }

  const meeting = await db.meeting.findUnique({
    where: {
      id: params.meetingId,
      isActive: true,
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

  const userAccess = await db.userMeeting.findUnique({
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
      userAccess?.permission !== PermissionStatus.DENIED) ||
    userAccess?.permission === PermissionStatus.GRANTED;

  if (isPermitted) {
    return null;
  }

  const userMeeting = await db.userMeeting.upsert({
    where: {
      userId_meetingId: {
        userId: session.user.id,
        meetingId: params.meetingId,
      },
    },
    // No need to update to PENDING since everytime the user accesses the page
    // and `Waiting` component is rendered, it will send a request to the owner
    // using the websocket
    update: {},
    create: {
      userId: session.user.id,
      meetingId: params.meetingId,
      permission: PermissionStatus.PENDING,
    },
  });

  if (!userMeeting) {
    return null;
  }

  return <Waiting session={session} meeting={meeting} />;
}

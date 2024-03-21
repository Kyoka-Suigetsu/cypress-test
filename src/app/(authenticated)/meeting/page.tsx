import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import { type Metadata } from "next";
import CreateMeetingForm from "./(forms)/create-meeting-form";
import JoinMeetingForm from "./(forms)/join-meeting-form";
import VoiceCloningModal from "./voice-cloning-modal";
import ForceAnonymousLogout from "./force-anonymous-logout";

export const metadata: Metadata = {
  title: "Meeting",
};

export default async function Page() {
  const session = await getServerAuthSession();
  const user = session?.user;
  if (!user) {
    return null;
  }

  /*
   * When a user is created in the register-participant action,
   * a room is also created for the user.
   * This Room is used to store the user's personal meeting room.
   * To  uniquely identify the room, the room name is the user's id.
   */
  const room = await db.room.findFirst({
    where: {
      name: user.id,
    },
  });

  if (!room) {
    return <ForceAnonymousLogout />;
  }

  return (
    <section className="flex h-full w-full flex-col items-center justify-center ">
      <VoiceCloningModal />
      <Card radius="sm" className="w-full max-w-[600px] shadow-none md:shadow-sm">
        <CardHeader>
          <JoinMeetingForm />
        </CardHeader>
        <CardBody>
          <div className="flex items-center">
            <Divider className="flex-1" />
            <p className="px-4 text-center text-lg font-semibold text-zinc-500">
              or
            </p>
            <Divider className="flex-1" />
          </div>
        </CardBody>
        <CardFooter>
          <CreateMeetingForm roomId={room.id} />
        </CardFooter>
      </Card>
    </section>
  );
}

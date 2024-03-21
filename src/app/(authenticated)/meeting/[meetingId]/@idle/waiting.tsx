"use client";

import useOnMount from "@/hooks/use-on-mount";
import { socket } from "@/lib/socket";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Button } from "@nextui-org/button";
import { Spinner } from "@nextui-org/spinner";
import { PermissionStatus, type Prisma } from "@prisma/client";
import type { Session } from "next-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clsx } from "clsx";

type MeetingWithOwner = Prisma.MeetingGetPayload<{
  where: {
    id: true;
    isActive: true;
  };
  include: {
    room: {
      select: {
        ownedById: true;
      };
    };
  };
}>;

export default function Waiting({
  session,
  meeting,
}: Readonly<{
  session: Session;
  meeting: MeetingWithOwner;
}>) {
  const router = useRouter();

  useOnMount(() => {
    if (socket.connected) {
      socket.emit("join", {
        room_id: meeting.roomId ?? "",
        user_id: session.user.id,
        meeting_id: meeting.id,
        is_private: meeting.isPrivate,
        is_live_chat: true,
        is_owner: meeting.room?.ownedById === session.user.id,
      });
    }

    socket.on("connect", () => {
      console.log("joined room inside connect");
      socket.emit("join", {
        user_id: session.user.id,
        meeting_id: meeting.id,
        room_id: meeting.roomId,
        is_private: meeting.isPrivate,
        is_live_chat: true,
        is_owner: meeting.room?.ownedById === session.user.id,
      });
    });

    socket.on(
      "request_result",
      (data: {
        permit_status: PermissionStatus;
        room_id: string;
        user_id: string;
      }) => {
        console.log("request received", data);

        if (
          meeting.roomId !== data.room_id ||
          session.user.id !== data.user_id
        ) {
          return;
        }

        if (data.permit_status === PermissionStatus.GRANTED) {
          toast.success("Permission granted!");
          router.refresh();
        } else {
          toast.error("Permission denied!");
          router.push("/");
        }
      },
    );

    return () => {
      socket.emit("leave", {
        user_id: session?.user.id,
        meeting_id: meeting.id,
        room_id: meeting.roomId,
        is_live_chat: true,
      });

      socket.off("request_result");
    };
  });

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="flex">
        <Spinner size="lg" data-cy="waiting-room-spinner" />
        <h3 className="p-4"> Waiting for approval... </h3>
      </div>
      <Link href="/">
        <Button
          radius="sm"
          color="primary"
          data-cy="waiting-room-back-button"
          startContent={<Icon icon={"octicon:arrow-left-16"} height={14} />}
        >
          Go Back
        </Button>
      </Link>
    </div>
  );
}

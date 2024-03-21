"use client";

import { useViewportSize } from "@mantine/hooks";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@nextui-org/button";
import { type User } from "@prisma/client";
import { type Session } from "next-auth";
import MemberList from "./member-list";
import Icon from "&/icon";
import { cn } from "@/lib/utils";

type RequestData = {
  id: string;
  name: string;
  email: string;
  roomId: string;
};

export function MembersSheet({
  session,
  ownedBy,
  meetingId,
  roomId,
  initialRequestList,
}: Readonly<{
  session: Session;
  ownedBy: User;
  meetingId: string;
  roomId: string;
  initialRequestList: Array<RequestData>;
}>) {
  const { width } = useViewportSize();

  if (width > 768) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          isIconOnly
          size="lg"
          radius="full"
          data-cy="member-list-sheet-trigger"
        >
          <Icon icon={"heroicons:user-group-20-solid"} width={24} height={24} />
        </Button>
      </SheetTrigger>
      <SheetContent data-cy="member-list-" className={cn(width < 500 ? "w-full" : "")}>
        <MemberList
          session={session}
          ownedBy={ownedBy}
          meetingId={meetingId}
          roomId={roomId}
          initialRequestList={initialRequestList}
          confirmation={false}
        />
      </SheetContent>
    </Sheet>
  );
}

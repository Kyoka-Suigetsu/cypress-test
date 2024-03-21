import Icon from "&/icon";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { Tooltip } from "@nextui-org/tooltip";
import { PermissionStatus, Role } from "@prisma/client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import JotaiWrapper from "./jotai-wrapper";
import MemberList from "./member-list";
import SettingsModal from "./settings-modal";
import JotaiDevTools from "@/components/JotaiDevTools";
import JotaiProvider from "@/providers/JotaiProvider";
import AnonymousLeaveButton from "./anonymous-leave-button";
import { MembersSheet } from "./members-sheet";
import LanguageSelect from "./language-select";
import { getDeepgramAiServerToken } from "@/lib/actions/deepgram";

const Transcription = dynamic(
  () =>
    import("@/app/(authenticated)/meeting/[meetingId]/@chatroom/transcription"),
  { ssr: false },
);

const Chat = dynamic(() => import("./chat"), { ssr: false });

const ShareRoomDropdown = dynamic(() => import("./share-room-dropdown"), {
  ssr: false,
});

export default async function Page({
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
          ownedBy: true,
        },
      },
    },
  });

  if (!meeting) {
    notFound();
  }

  const requestList = await db.userMeeting.findMany({
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      meeting: {
        select: {
          roomId: true,
        },
      },
    },
    where: {
      meetingId: params.meetingId,
      permission: PermissionStatus.PENDING,
      user: {
        id: {
          not: session.user.id,
        },
        role: Role.PARTICIPANT,
      },
    },
  });

  const initialRequestList = meeting.isPrivate
    ? requestList.map((item) => ({
        id: item.user.id,
        name: item.user.name,
        email: item.user.email,
        roomId: item.meeting.roomId!,
      }))
    : [];

  let initialDeepgramToken = "";
  const response = await getDeepgramAiServerToken();
  if (!(response instanceof Error)) {
    initialDeepgramToken = response.key;
  }

  return (
    <JotaiProvider>
      <JotaiWrapper meeting={meeting}>
        <section className="flex h-full w-full flex-col items-center space-y-1 px-2 md:px-6 md:py-2">
          <div className="flex h-full w-full max-w-[1400px] justify-center pt-2 md:py-4">
            <div className="relative flex max-w-[1100px] flex-grow">
              <div className="absolute bottom-0 left-0 right-0 top-0">
                <Chat session={session} meeting={meeting} />
              </div>
            </div>
            <div className="hidden h-full rounded-r-lg border border-content2 bg-content1 shadow md:block md:w-[300px]">
              <MemberList
                session={session}
                ownedBy={meeting.room!.ownedBy}
                meetingId={params.meetingId}
                roomId={meeting.roomId!}
                initialRequestList={initialRequestList}
              />
            </div>
          </div>
          <div className="flex w-full max-w-[1200px] items-center justify-between gap-x-2 rounded-lg bg-content1 px-2 py-2 shadow md:border md:border-content2 ">
            <div className="flex flex-col items-start justify-between gap-y-2 ">
              {session.user.role !== Role.ANONYMOUS && (
                <ShareRoomDropdown
                  meetingId={meeting.id}
                  isPrivate={meeting.isPrivate}
                />
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Tooltip showArrow color={"danger"} content={"Leave Room"}>
                {session.user.role === Role.ANONYMOUS ? (
                  <AnonymousLeaveButton />
                ) : (
                  <Link
                    href={"/"}
                    replace
                    data-cy="leave-room-link"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-danger md:h-14 md:w-14"
                  >
                    <Icon
                      icon="fluent:call-end-24-filled"
                      width={32}
                      className="text-white"
                    />
                  </Link>
                )}
              </Tooltip>
              <Transcription
                meeting={meeting}
                session={session}
                isLiveChat={true}
                initialToken={initialDeepgramToken}
              />
            </div>
            <div className="flex space-x-3">
              <MembersSheet
                session={session}
                ownedBy={meeting.room!.ownedBy}
                meetingId={params.meetingId}
                roomId={meeting.roomId!}
                initialRequestList={initialRequestList}
              />
              <div className="hidden w-[170px] md:block">
                <LanguageSelect session={session} />
              </div>
              <SettingsModal session={session} />
            </div>
          </div>
        </section>
        {/* <JotaiDevTools /> */}
      </JotaiWrapper>
    </JotaiProvider>
  );
}

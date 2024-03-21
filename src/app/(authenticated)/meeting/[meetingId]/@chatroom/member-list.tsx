"use client";

import ConfirmationModal from "&/confirmation-modal";
import useOnMount from "@/hooks/use-on-mount";
import { getUser } from "@/lib/actions/get-user";
import atomWithDebounce from "@/lib/atomWithDebounce";
import { socket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Avatar } from "@nextui-org/avatar";
import { Chip } from "@nextui-org/chip";
import { Divider } from "@nextui-org/divider";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Spacer } from "@nextui-org/spacer";
import { Tooltip } from "@nextui-org/tooltip";
import { PermissionStatus, Role, type User } from "@prisma/client";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { matchSorter } from "match-sorter";
import type { Session } from "next-auth";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

type Member = {
  username: string;
  email: string;
  role: Role;
};

type RequestData = {
  id: string;
  name: string;
  email: string;
  roomId: string;
};

const {
  debouncedValueAtom: debouncedFilterValueAtom,
  currentValueAtom: currentFilterValueAtom,
} = atomWithDebounce("", 1000);

const requestsAtom = atom<RequestData[]>([]);
const membersAtom = atom<Member[]>([]);

const filteredMembersAtom = atom((get) =>
  get(currentFilterValueAtom).trim().length <= 2
    ? get(membersAtom)
    : matchSorter(get(membersAtom), get(currentFilterValueAtom), {
        keys: ["username"],
      }),
);

const filteredRequestsAtom = atom((get) =>
  get(currentFilterValueAtom).trim().length <= 2
    ? get(requestsAtom)
    : matchSorter(get(requestsAtom), get(currentFilterValueAtom), {
        keys: ["name"],
      }),
);

export default function MemberList({
  session,
  ownedBy,
  meetingId,
  roomId,
  initialRequestList,
  confirmation = true,
}: Readonly<{
  session: Session;
  ownedBy: User;
  meetingId: string;
  roomId: string;
  confirmation?: boolean;
  initialRequestList: Array<RequestData>;
}>) {
  useHydrateAtoms([[requestsAtom, initialRequestList]]);

  const filteredRequests = useAtomValue(filteredRequestsAtom);
  const filteredMembers = useAtomValue(filteredMembersAtom);

  const currentFilterValue = useAtomValue(currentFilterValueAtom);
  const setDebouncedFilterValue = useSetAtom(debouncedFilterValueAtom);

  const [members, setMembers] = useAtom(membersAtom);
  const [requests, setRequests] = useAtom(requestsAtom);

  const membersRef = useRef(members);
  const requestsRef = useRef(requests);

  const permittedToControls =
    session.user.role === Role.ADMIN || session.user.id === ownedBy.id;

  const handleRequest = (user: RequestData, status: PermissionStatus) => {
    setRequests(requests.filter((request) => request.id !== user.id));

    socket.emit("handle_request", {
      user_id: user.id,
      room_id: roomId,
      meeting_id: meetingId,
      permit_status: status,
      is_live_chat: true,
    });
  };

  const handleMemberKick = async (user: Member, status: PermissionStatus) => {
    setMembers(members.filter((member) => member.email !== user.email));

    const { id } = (await getUser("email", user.email))!;

    socket.emit("handle_request", {
      user_id: id,
      room_id: roomId,
      meeting_id: meetingId,
      permit_status: status,
      is_live_chat: true,
    });

    toast.info(`${user.username} was kicked from the room.`);
  };

  useEffect(() => {
    membersRef.current = members;
  }, [members]);

  useEffect(() => {
    requestsRef.current = requests;
  }, [requests]);

  useOnMount(() => {
    socket.on("participant-joined", (data: { users: Array<Member> }) => {
      const newMembers = data.users.filter(
        (user) =>
          user.username !== session.user.name &&
          !membersRef.current.some(
            (member) => member.username === user.username,
          ),
      );
      newMembers.forEach((member) =>
        toast.info(`${member.username} joined the room.`),
      );

      setMembers(data.users);
    });

    socket.on("participant-left", (data: { users: Array<Member> }) => {
      const { users } = data;
      const user = users.at(0);

      if (!user) {
        return;
      }

      const index = membersRef.current.findIndex(
        (member) => member.email === user.email,
      );

      if (index !== -1) {
        const newArray = structuredClone(membersRef.current);
        newArray.splice(index, 1);
        setMembers(newArray);
        toast.info(`${user.username} left the room.`);
      }
    });

    socket.on(
      "join_requests",
      async (data: { user_id: string; room_id: string }) => {
        const { user_id, room_id } = data;

        if (room_id === roomId) {
          try {
            const { name, email } = (await getUser("id", user_id))!;

            const newData: RequestData = {
              id: user_id,
              name,
              email,
              roomId: room_id,
            };

            if (
              !requestsRef.current.some((request) => request.id === user_id)
            ) {
              setRequests([...requestsRef.current, newData]);
            }
          } catch (e) {
            console.log(e);
          }
        }
      },
    );

    return () => {
      socket.off("join_requests");
      socket.off("participant-joined");
      socket.off("participant-left");
    };
  });

  return (
    <div className="">
      <Input
        type="text"
        placeholder="Filter Members..."
        value={currentFilterValue}
        onChange={(e) => setDebouncedFilterValue(e.target.value.toLowerCase())}
        fullWidth
        radius="none"
        className="group"
        data-cy="member-list-filter-input"
        endContent={
          <Icon
            icon={"line-md:person-search"}
            width={32}
            className="opacity-50 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100"
          />
        }
      />
      <Spacer y={1.5} />

      {session.user.id === ownedBy.id && filteredRequests.length > 0 && (
        <>
          <Accordion defaultExpandedKeys={["1"]}>
            <AccordionItem
              key="1"
              aria-label="Join Requests"
              data-cy="join-request-list"
              title={
                <Chip
                  size="sm"
                  color="default"
                  data-cy="join-request-list-count"
                >
                  Join Requests - {requests.length}
                </Chip>
              }
            >
              {filteredRequests.map(({ id, name, email, roomId }) => (
                <div
                  key={id}
                  className="flex items-center justify-between gap-2 pl-2"
                >
                  <div className="flex flex-col">
                    <span className="text-small">{name}</span>
                    <span className="text-tiny text-default-400">{email}</span>
                  </div>
                  {permittedToControls && (
                    <div>
                      {confirmation ? (
                        <>
                          <ConfirmationModal
                            title={`Decline ${name} request?`}
                            body={
                              <span>
                                Are you sure you want to accept <b>{name}'s</b>{" "}
                                join request?
                              </span>
                            }
                            confirmationAction={() =>
                              handleRequest(
                                { id, name, email, roomId },
                                PermissionStatus.GRANTED,
                              )
                            }
                            buttonProps={{
                              isIconOnly: true,
                              variant: "light",
                              color: "success",
                              radius: "full",
                              className: "hover:bg-transparent",
                              children: (
                                <Tooltip
                                  color={"success"}
                                  content={"Accept Request"}
                                  placement="left"
                                  showArrow
                                >
                                  <Icon icon={"mdi:account-check"} width={24} />
                                </Tooltip>
                              ),
                            }}
                          />
                          <ConfirmationModal
                            title={`Decline ${name} request?`}
                            data-cy="member-join-request-modal"
                            body={
                              <span>
                                Are you sure you want to decline <b>{name}'s</b>{" "}
                                join request?
                              </span>
                            }
                            confirmationAction={() =>
                              handleRequest(
                                { id, name, email, roomId },
                                PermissionStatus.DENIED,
                              )
                            }
                            buttonProps={{
                              isIconOnly: true,
                              variant: "light",
                              color: "danger",
                              radius: "full",
                              className: "hover:bg-transparent",
                              children: (
                                <Tooltip
                                  color={"danger"}
                                  content={"Decline Request"}
                                  placement="left"
                                  showArrow
                                >
                                  <Icon
                                    icon={"mdi:account-remove"}
                                    width={24}
                                  />
                                </Tooltip>
                              ),
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <Button
                            isIconOnly
                            variant="light"
                            color="success"
                            radius="full"
                            data-cy="member-mobile-accept-request-button"
                            className="hover:bg-transparent"
                            onPress={() =>
                              handleRequest(
                                { id, name, email, roomId },
                                PermissionStatus.GRANTED,
                              )
                            }
                          >
                            <Icon icon={"mdi:account-check"} width={24} />
                          </Button>
                          <Button
                            isIconOnly
                            variant="light"
                            color="danger"
                            radius="full"
                            data-cy="member-mobile-deny-request-button"
                            className="hover:bg-transparent"
                            onPress={() =>
                              handleRequest(
                                { id, name, email, roomId },
                                PermissionStatus.DENIED,
                              )
                            }
                          >
                            <Icon icon={"mdi:account-remove"} width={24} />
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </AccordionItem>
          </Accordion>
          <Divider />
        </>
      )}
      <Accordion defaultExpandedKeys={["1"]} key={"active-members-accordion"}>
        <AccordionItem
          key="1"
          aria-label="Active Members"
          data-cy="active-member-list"
          title={
            <Chip size="sm" color="primary">
              Active Members - {members.length}
            </Chip>
          }
        >
          {filteredMembers.map(({ username, email, role }) => (
            <div
              key={email}
              className={cn([
                "mb-1 flex items-center justify-between rounded-md border border-transparent p-1 transition-all hover:border hover:border-content4 hover:bg-content3",
                role === Role.MANAGER && "border-primary",
              ])}
            >
              <div className="flex items-center gap-x-2">
                <Avatar
                  alt="member avatar"
                  size="sm"
                  name={username}
                  className="flex-shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-small">{username}</span>
                  {role !== Role.ANONYMOUS && (
                    <span className="text-tiny text-default-400">{email}</span>
                  )}
                </div>
              </div>

              <div className="w-[40px]">
                {session.user.email !== email && permittedToControls && (
                  <ConfirmationModal
                    title={`Kick ${username}?`}
                    data-cy="member-kick-confirmation-modal"
                    body={
                      <span>
                        <div>
                          Are you sure you want to kick <b>{username}</b>?
                        </div>
                        <div>
                          This will remove <b>{username}</b> from the course.
                        </div>
                      </span>
                    }
                    confirmationAction={() =>
                      handleMemberKick(
                        { username, email, role },
                        PermissionStatus.DENIED,
                      )
                    }
                    buttonProps={{
                      isIconOnly: true,
                      variant: "light",
                      color: "danger",
                      radius: "full",
                      className: "hover:bg-transparent",
                      children: (
                        <Tooltip
                          color={"danger"}
                          content={"Kick"}
                          placement="left"
                          showArrow
                        >
                          <Icon icon={"mdi:account-remove"} width={24} />
                        </Tooltip>
                      ),
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </AccordionItem>
      </Accordion>
    </div>
  );
}

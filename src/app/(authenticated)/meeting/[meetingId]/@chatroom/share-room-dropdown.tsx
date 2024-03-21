"use client";

import Icon from "&/icon";
import { useClipboard } from "@mantine/hooks";
import { Button } from "@nextui-org/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import React from "react";
import { Tooltip } from "@nextui-org/tooltip";
import { cn } from "@/lib/utils";

export default function ShareRoomDropdown({
  meetingId,
  isPrivate,
}: Readonly<{
  meetingId: string;
  isPrivate: boolean;
}>) {
  const clipboard = useClipboard({ timeout: 500 });
  const url = new URL(window.location.href);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          color={isPrivate ? "danger" : "success"}
          className={cn(
            "h-unit-12 w-unit-12 min-w-unit-12 p-2 font-semibold md:w-unit-4xl md:min-w-unit-md",
          )}
          size="lg"
          radius="full"
          data-cy="share-meeting-dropdown-trigger"
        >
          <p className="hidden md:block" data-cy="meeting-id">
            {meetingId}
          </p>
          <Tooltip
            color={isPrivate ? "danger" : "success"}
            content={
              isPrivate
                ? "Meeting is locked only to accepted Users"
                : "Meeting is open to all Users"
            }
          >
            <Icon
              icon={isPrivate ? "zondicons:lock-closed" : "zondicons:lock-open"}
              width={14}
              height={14}
            />
          </Tooltip>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Share Actions"
        onAction={(key) => clipboard.copy(key)}
        variant="bordered"
        data-cy="share-meeting-dropdown-menu"
      >
        <DropdownItem
          key={`${url.origin}/meeting/${meetingId}`}
          startContent={
            <Icon
              icon={"tabler:link"}
              width={16}
              height={16}
              data-cy="share-meeting-via-url"
            />
          }
        >
          Copy Meeting Link
        </DropdownItem>
        <DropdownItem
          key={meetingId}
          startContent={
            <Icon
              icon={"solar:copy-bold-duotone"}
              width={16}
              height={16}
              data-cy="share-meeting-via-code"
            />
          }
        >
          Copy Meeting Code
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

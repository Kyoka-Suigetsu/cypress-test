'use client';

import { Button } from "@nextui-org/button";
import Icon from "&/icon";
import { signOut } from "next-auth/react";

export default function AnonymousLeaveButton() {
  return (
    <Button
      radius="full"
      color="danger"
      isIconOnly
      data-cy="guest-leave-button"
      onPress={async () => {
        await signOut({ callbackUrl: "/" });
      }}
      className="h-16 !w-16 items-center justify-center px-1"
    >
      <Icon
        icon="fluent:call-end-24-filled"
        width={32}
        className="text-white"
      />
    </Button>
  );
}

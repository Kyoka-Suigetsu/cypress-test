"use client";

import ConfirmationModal from "&/confirmation-modal";
import Icon from "&/icon";
import { deleteUser } from "@/lib/actions/user/delete-user";
import { Tooltip } from "@nextui-org/tooltip";
import React from "react";
import { toast } from "sonner";
import { type User } from "./columns";

export default function DeleteUserModal({ user }: { user: User }) {
  return (
    <ConfirmationModal
      title={`Delete ${user.name}'s account?`}
      body={
        <span>
          Are you sure you want to <span className="text-danger">delete</span>{" "}
          <b>{user.name}'s</b> account?
        </span>
      }
      confirmationAction={async () => {
        try {
          await deleteUser(user.id);
        } catch (e) {
          if (typeof e === "string") {
            toast.error(e.toUpperCase());
          } else if (e instanceof Error) {
            toast.error(e.message);
          }
        }
      }}
      buttonProps={{
        isIconOnly: true,
        variant: "light",
        radius: "full",
        className: "hover:bg-transparent",
        children: (
          <Tooltip color={"danger"} content={"Delete User"} showArrow>
            <Icon icon={"mdi:trash"} width={24} className="text-danger"/>
          </Tooltip>
        ),
      }}
    />
  );
}

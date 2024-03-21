import Icon from "&/icon";
import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import React from "react";
import EditUserForm from "./edit-user-form";
import { Tooltip } from "@nextui-org/tooltip";

export default function EditUserModal({
  user,
}: {
  user: {
    id: string;
    name: string;
    email: string;
    role: "MANAGER" | "PARTICIPANT" | "ADMIN";
  };
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Tooltip color={"warning"} content={"Edit User"} showArrow>
        <Button isIconOnly variant="light" onPress={onOpen} radius={"full"}>
          <Icon
            icon="basil:edit-solid"
            width={24}
            height={24}
            className="text-warning"
          />
        </Button>
      </Tooltip>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit User information
              </ModalHeader>
              <ModalBody>
                <EditUserForm callback={onClose} user={user} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

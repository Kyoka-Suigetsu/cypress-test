"use client";

import Icon from "&/icon";
import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { signOut } from "next-auth/react";

export default function SignOutModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button
        radius="sm"
        onPress={onOpen}
        className="text-md text-light flex w-full items-center justify-start rounded-md bg-content4 px-8 py-3 font-medium transition-all duration-150 ease-in-out hover:scale-[1.03] hover:bg-danger hover:text-danger-foreground"
      >
        <Icon icon="octicon:sign-out-16" width={20} height={20} />
        Log Out
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Log Out</ModalHeader>
              <ModalBody>Are you sure?</ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  onPress={async () => {
                    await signOut({ callbackUrl: "/" });
                  }}
                >
                  Yes
                </Button>
                <Button color="danger" variant="light" onPress={onClose}>
                  No
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

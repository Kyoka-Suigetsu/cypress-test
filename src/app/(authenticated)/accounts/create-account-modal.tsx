"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Icon } from "@iconify/react/dist/iconify.js";
import CreateAccountForm from "./create-account-form";

export default function CreateAccountModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button
        onPress={onOpen}
        radius="sm"
        variant="shadow"
        color="secondary"
        className="hover:scale-[1.03]"
        endContent={<Icon icon={"ic:baseline-plus"} width={24} height={24} />}
      >
        Create Account
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
        size="xl"
        motionProps={{
          initial: { y: 100, opacity: 0 },
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              scale: 1,
              transition: {
                duration: 0.3,
                ease: "easeOut",
              },
            },
            exit: {
              y: 0,
              opacity: 0,
              scale: 1.1,
              transition: {
                duration: 0.2,
                ease: "easeIn",
              },
            },
          }
        }}

      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-2xl">
                Create User Account
              </ModalHeader>
              <ModalBody>
                <CreateAccountForm callback={onClose} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

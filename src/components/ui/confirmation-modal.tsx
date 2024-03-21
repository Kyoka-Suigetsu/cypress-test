"use client";

import { Button, type ButtonProps } from "@nextui-org/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import React, {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type Props = {
  title?: ReactNode | string;
  body?: ReactNode | string;
  confirmationAction: () => void | Promise<void>;
  buttonProps?: ButtonProps;
  closeCallback?: Dispatch<SetStateAction<boolean>>;
};

export default function ConfirmationModal({
  title,
  body,
  confirmationAction,
  buttonProps,
  closeCallback,
}: Props) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  console.log("🚀 ~ closeCallback:", closeCallback);

  return (
    <>
      <Button {...buttonProps} onPress={onOpen} />
      <Modal isOpen={isOpen} backdrop={undefined} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              {title && (
                <ModalHeader className="flex flex-col gap-1">
                  {title}
                </ModalHeader>
              )}
              {body && <ModalBody>{body}</ModalBody>}
              <ModalFooter>
                <Button color="danger" variant="light" data-cy="close-button" onPress={onClose}>
                  No
                </Button>
                <Button
                  color="primary"
                  data-cy="confirm-button"
                  onPress={async () => {
                    await confirmationAction();
                    closeCallback && isOpen && closeCallback(false);
                  }}
                >
                  Yes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

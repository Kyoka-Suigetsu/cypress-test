"use client"; // Error components must be Client Components

import { useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Code } from "@nextui-org/code";
import { Icon } from "@iconify/react";
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
  useEffect(() => {
    // Log the error to an error reporting service
    onOpen();
    Sentry.captureException(error);
  }, [onOpen, error]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-4">
          <Icon
            className="inline text-danger"
            icon={"solar:danger-circle-linear"}
            width={24}
            height={24}
          />
          Something went wrong!
        </ModalHeader>
        <ModalBody>
          <p>Details:</p>
          <Code color="danger" radius="md" className="whitespace-pre-line">
            {error.message}
          </Code>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onPress={() => {
              reset();
            }}
          >
            Try again
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@nextui-org/modal";
import VoiceCloningForm from "./(forms)/voice-cloning-form";
import { BackgroundGradient } from "&/background-gradient";

export default function VoiceCloningModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <button
        data-cy="voice-cloning-modal-trigger"
        onClick={onOpen}
        className="my-3 px-3"
      >
        <BackgroundGradient
          containerClassName="rounded-md"
          className="max-w-[600px] cursor-pointer rounded-sm bg-content1 p-4"
        >
          <p className="mb-2 mt-1 text-base sm:text-xl">
            Let Them Know Your Voice
          </p>

          <p className="text-sm dark:text-neutral-400">
            Clone your voice and let your friends, family and co-workers know
            your voice through a voice message. Try it now!
          </p>
        </BackgroundGradient>
      </button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        data-cy="voice-cloning-modal"
        radius="sm"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                Add a new voice to your collection
              </ModalHeader>
              <ModalBody>
                <VoiceCloningForm onCloseCallback={onClose} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

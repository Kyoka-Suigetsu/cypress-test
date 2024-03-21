import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { Chip } from "@nextui-org/chip";
import Link from "next/link";

export default function TimeoutModal({ isOpen }: { isOpen: boolean }) {
  const { onOpenChange } = useDisclosure();

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        radius="md"
        data-cy="demo-timeout-modal"
        classNames={{
          closeButton: "hidden",
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center text-xl">
                Thank You For Attending Our Demo
              </ModalHeader>
              <ModalBody className="gap-0">
                <p className="pb-3 text-center">
                  We appreciate your interest and engagement and are eager to
                  share some exciting updates we offer.
                </p>
                <Chip color="primary" className="font-semibold text-white">
                  Expanded Language Selection
                </Chip>
                <p className="pb-2 pl-4 text-gray-500">
                  Our platform supports an even broader range of languages.
                </p>
                <Chip color="secondary" className="font-semibold ">
                  Scalable Meetings
                </Chip>
                <p className="pb-2 pl-4 text-gray-500">
                  You can now host gatherings with as many participants as
                  needed.
                </p>
                <Chip color="primary" className="font-semibold text-white">
                  Private Rooms
                </Chip>
                <p className="pl-4 text-gray-500">
                  Collaborate securely with select participants, ensuring
                  sensitive information remains confidential.
                </p>
              </ModalBody>
              <ModalFooter className="justify-center">
                <Link
                  href="https://calendly.com/lingopal-ai/lingopal-ai-demo"
                  target="_blank"
                  data-cy="demo-timeout-modal-calendly-link"
                  className="relative p-[3px]"
                >
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500" />
                  <div className="group relative  rounded-[6px] bg-black  px-8 py-2 font-semibold text-white transition duration-200 hover:bg-transparent">
                    Ready To Collaborate
                  </div>
                </Link>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

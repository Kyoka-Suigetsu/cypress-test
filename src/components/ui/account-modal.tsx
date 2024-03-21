"use client";

import {
  languageAtom,
  voiceIdAtom,
  voicesAtom,
} from "@/app/(authenticated)/jotai-wrapper";
import useOnMount from "@/hooks/use-on-mount";
import { getUserVoices } from "@/lib/actions/get-user-voices";
import { setPreferences } from "@/lib/actions/user/preferences";
import { NOVA_2_LANGUAGES } from "@/lib/deepgram-model-languages";
import { type UserPreferences } from "@/schemas/preference";
import { Icon } from "@iconify/react";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import { Select, SelectItem } from "@nextui-org/select";
import { useAtom } from "jotai";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const AccountModal = () => {
  const [language, setLanguage] = useAtom(languageAtom);
  const [voices, setVoices] = useAtom(voicesAtom);
  const [voiceId, setVoiceId] = useAtom(voiceIdAtom);
  const { data: session, update } = useSession();
  const [message, setMessage] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [error, setError] = useState("");

  const handleForgotPassword = async () => {
    // TODO implement forget password functionality
    const res = await fetch("/api/auth/forget-password", {
      method: "POST",
      body: JSON.stringify({
        username_email: session?.user.id,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      setMessage("\nUnable to send email.");
      return;
    }

    setMessage("\nReset mail sent to the associated email.");
  };

  const handleSelectionChange = React.useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value.trim();
      if (value === "" || !session) {
        return;
      }

      setLanguage(value);

      const newPreferences: UserPreferences = {
        language: value,
        fontSize: session.user.fontSizePreference,
        muted: session.user.mutedPreference,
        volume: session.user.volumePreference,
      };

      try {
        await setPreferences(session.user.id, newPreferences);
        await update({ languagePreference: value });
      } catch (e) {
        setError("Unable to update language preference.");
      }
    },
    [session?.user.languagePreference, setLanguage],
  );

  const handleSelectVoice = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value.trim();
      setVoiceId(value);
    },
    [voices],
  );

  useEffect(() => {
    if (session?.user) {
      setLanguage(session?.user.languagePreference);
    }
  }, [session?.user.languagePreference]);

  useOnMount(() => {
    if (session?.user) {
      const getClonedVoices = async () => {
        const clonedVoices = await getUserVoices(session?.user.id);
        setVoices(clonedVoices);
      };

      getClonedVoices().catch((e) => console.error(e));
    }
  });

  return (
    <>
      <Button
        onPress={onOpen}
        variant="solid"
        color="secondary"
        startContent={<Icon icon={"mdi:account"} height={24} width={24} />}
        data-cy="account-modal-trigger"
        className="flex gap-x-1 rounded-md px-3 py-1.5 transition-all hover:scale-[1.05]"
      >
        My Account
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        backdrop="blur"
        size="lg"
        placement="center"
        radius="sm"
        scrollBehavior="inside"
        data-cy="account-modal"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                Account Info
                {message}
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Email"
                  labelPlacement="outside-left"
                  radius="sm"
                  size="md"
                  type="text"
                  variant="bordered"
                  value={session?.user.email ?? ""}
                  disabled
                  data-cy="account-email"
                  classNames={{
                    label: "w-1/4 text-md",
                    mainWrapper: "w-3/4",
                  }}
                />
                <Input
                  label="Name"
                  variant="bordered"
                  labelPlacement="outside-left"
                  radius="sm"
                  size="md"
                  type="text"
                  value={session?.user.name ?? ""}
                  disabled
                  data-cy="account-name"
                  classNames={{
                    label: "w-1/4 text-md",
                    mainWrapper: "w-3/4",
                  }}
                />
                {session?.user.organization && (
                  <Input
                    label="Organization"
                    labelPlacement="outside-left"
                    variant="bordered"
                    radius="sm"
                    size="md"
                    type="text"
                    value={session?.user.organization}
                    disabled
                    data-cy="account-organization"
                    classNames={{
                      label: "w-1/4 text-md",
                      mainWrapper: "w-3/4",
                    }}
                  />
                )}
                <Select
                  label="Language"
                  variant="bordered"
                  labelPlacement="outside-left"
                  items={NOVA_2_LANGUAGES}
                  selectedKeys={[language]}
                  radius="sm"
                  size="md"
                  data-cy="account-language-selector"
                  onChange={handleSelectionChange}
                  classNames={{
                    label: "w-1/4 text-md self-center",
                    mainWrapper: "w-3/4",
                  }}
                >
                  {(option) => (
                    <SelectItem key={option.rtcCode}>
                      {option.language}
                    </SelectItem>
                  )}
                </Select>
                {error && (
                  <span className="text-xs text-destructive">{error}</span>
                )}
                <Select
                  label="Voice"
                  placeholder={
                    voices.length === 0 ? "No cloned voices" : "Select a voice"
                  }
                  variant="bordered"
                  labelPlacement="outside-left"
                  items={voices}
                  selectedKeys={voiceId ? [voiceId] : []}
                  radius="sm"
                  size="md"
                  data-cy="account-voice-selector"
                  onChange={handleSelectVoice}
                  classNames={{
                    label: "w-1/4 text-md self-center",
                    mainWrapper: "w-3/4",
                  }}
                >
                  {(option) => (
                    <SelectItem key={option.voiceId}>{option.name}</SelectItem>
                  )}
                </Select>
                <Button
                  type="button"
                  color="primary"
                  radius="sm"
                  data-cy="reset-password-button"
                  onPress={handleForgotPassword}
                  className="w-fit self-center font-medium"
                >
                  Reset Password
                </Button>
              </ModalBody>
              <ModalFooter className="sm:justify-between">
                <span className="self-end text-xs text-zinc-500">
                  For questions about our service message us at{" "}
                  <Link
                    href="mailto:admin@lingopal.ai"
                    target="_blank"
                    data-cy="admin-email-link"
                    className="underline hover:text-primary"
                  >
                    admin@lingopal.ai
                  </Link>
                </span>
                <Button
                  color="danger"
                  variant="ghost"
                  radius="sm"
                  data-cy="logout-button"
                  onPress={async () => {
                    await signOut({ callbackUrl: "/" });
                  }}
                >
                  Logout
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default AccountModal;

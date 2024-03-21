"use client";

import Icon from "&/icon";
import {
  audioVolumeAtom,
  fontSizeAtom,
  isAudioMutedAtom,
  storageAudioVolumeAtom,
} from "@/app/(authenticated)/jotai-wrapper";
import { setPreferences } from "@/lib/actions/user/preferences";
import { cn } from "@/lib/utils";
import { type UserPreferences } from "@/schemas/preference";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import { Select, SelectItem } from "@nextui-org/select";
import { Slider } from "@nextui-org/slider";
import { Switch } from "@nextui-org/switch";
import { useAtom, useSetAtom } from "jotai";
import { type Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useCallback, type ChangeEvent } from "react";
import { toast } from "sonner";
import LanguageSelect from "./language-select";

export default function SettingsModal({
  session,
}: Readonly<{ session: Session }>) {
  const { update } = useSession();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isAudioMuted, setIsAudioMuted] = useAtom(isAudioMutedAtom);
  const [audioVolume, setAudioVolume] = useAtom(audioVolumeAtom);
  const [fontSize, setfontSize] = useAtom(fontSizeAtom);
  const setStorageAudioVolume = useSetAtom(storageAudioVolumeAtom);
  const fontSizes = [12, 14, 16, 18, 20].map((fontSize) => ({ fontSize }));

  const handleMuteChange = useCallback(
    async (value: boolean) => {
      setIsAudioMuted(!value);

      const newPreferences: UserPreferences = {
        language: session.user.languagePreference,
        fontSize: session.user.fontSizePreference,
        muted: !value,
        volume: session.user.volumePreference,
      };

      try {
        await setPreferences(session.user.id, newPreferences);
        await update({ mutedPreference: !value });
      } catch (e) {
        toast.error("Unable to update mute preference.");
      }
    },
    [setIsAudioMuted],
  );

  const handleSelectionChange = useCallback(
    async (e: ChangeEvent<HTMLSelectElement>) => {
      setfontSize(Number(e.target.value));

      const newPreferences: UserPreferences = {
        language: session.user.languagePreference,
        fontSize: Number(e.target.value),
        muted: session.user.mutedPreference,
        volume: session.user.volumePreference,
      };
      try {
        await setPreferences(session.user.id, newPreferences);
        await update({ fontSizePreference: Number(e.target.value) });
      } catch (e) {
        toast.error("Unable to update fontsize preference.");
      }
    },
    [session, fontSize],
  );

  const handleVolumeChange = useCallback(
    async (value: number | number[]) => {
      const newVolume = Number(value) / 100;
      setAudioVolume(newVolume);
      setStorageAudioVolume(newVolume);

      const newPreferences: UserPreferences = {
        language: session.user.languagePreference,
        fontSize: session.user.fontSizePreference,
        muted: session.user.mutedPreference,
        volume: newVolume,
      };

      try {
        await setPreferences(session.user.id, newPreferences);
        await update({ volumePreference: newVolume });
      } catch (e) {
        toast.error("Unable to update volume preference.");
      }
    },
    [setAudioVolume, setStorageAudioVolume],
  );

  return (
    <>
      <Button
        onPress={onOpen}
        color="default"
        isIconOnly
        size="lg"
        radius="full"
        data-cy="settings-modal-trigger"
      >
        <Icon icon={"mingcute:settings-2-line"} width={24} height={24} />
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
        data-cy="settings-modal"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Customize your meeting
              </ModalHeader>
              <ModalBody className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    Change your primary language
                  </p>
                  <LanguageSelect session={session} />
                </div>
                <Divider />
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    Toggle the audio for auto-playing messages
                  </p>
                  <Switch
                    isSelected={!isAudioMuted}
                    size="lg"
                    color="warning"
                    data-cy="settings-mute-switch"
                    thumbIcon={({ isSelected, className }) =>
                      isSelected ? (
                        <Icon
                          icon={"lucide:volume-2"}
                          width={12}
                          height={12}
                          className={cn(className, "pointer-events-none")}
                        />
                      ) : (
                        <Icon
                          icon={"lucide:volume-x"}
                          width={12}
                          height={12}
                          className={cn(className, "pointer-events-none")}
                        />
                      )
                    }
                    onValueChange={handleMuteChange}
                  >
                    <p className="text-sm font-medium">
                      {!isAudioMuted ? "Audio On" : "Audio Off"}
                    </p>
                  </Switch>
                </div>
                <div>
                  <Slider
                    aria-label="Volume"
                    label="Volume"
                    size="lg"
                    color="primary"
                    data-cy="settings-volume-slider"
                    step={1}
                    defaultValue={audioVolume * 100}
                    minValue={0}
                    maxValue={100}
                    onChangeEnd={handleVolumeChange}
                    startContent={
                      <Icon
                        icon={"mingcute:volume-off-fill"}
                        width={24}
                        height={24}
                        className="pointer-events-none"
                      />
                    }
                    endContent={
                      <Icon
                        icon={"mingcute:volume-fill"}
                        width={24}
                        height={24}
                        className="pointer-events-none"
                      />
                    }
                    className="max-w-md text-gray-500"
                  />
                </div>
                <Divider />
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    Change the size of the messages
                  </p>
                  <Select
                    label="Font Size"
                    variant="flat"
                    items={fontSizes}
                    selectedKeys={[fontSize.toString()]}
                    radius="sm"
                    size="md"
                    data-cy="settings-font-size-select"
                    onChange={handleSelectionChange}
                    className="w-1/2 items-center font-semibold"
                  >
                    {(option) => (
                      <SelectItem key={option.fontSize}>
                        {option.fontSize.toString()}
                      </SelectItem>
                    )}
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  data-cy="settings-modal-close-button"
                  onPress={onClose}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

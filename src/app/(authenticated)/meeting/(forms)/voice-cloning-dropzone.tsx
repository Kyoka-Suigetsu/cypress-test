import Icon from "&/icon";
import { cn } from "@/lib/utils";
import { type TVoiceCloningForm } from "@/schemas/voice-cloning";
import { Group, Text } from "@mantine/core";
import { Dropzone, type DropzoneProps } from "@mantine/dropzone";
import { type UseFormReturn } from "react-hook-form";

export function VoiceCloningDropzone({
  props,
  form,
}: {
  props?: DropzoneProps;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<TVoiceCloningForm, any>;
}) {
  return (
    <Dropzone
      {...props}
      onDrop={(files) => {
        if (files === undefined) {
          return;
        }
        form.setValue("file", files[0]!);
        const formData = new FormData();
        formData.append("file", files[0]!);
      }}
      onReject={(files) => console.log("rejected files", files)}
      accept={{
        "audio/*": [".wav", ".mp3", ".opus"],
      }}
      data-cy="voice-cloning-dropzone"
      className={cn(
        "flex w-full cursor-pointer items-center justify-center rounded-lg !border-2 border-dashed border-content4 bg-content2 p-6 text-center transition-all",
        form.getValues("file")
          ? "hover:!border-danger hover:!bg-danger-100"
          : "hover:!border-green-600 hover:!bg-green-900",

        form.getValues("file") && "!border-green-600 !bg-green-900",
      )}
    >
      <Group
        justify="center"
        gap="xl"
        mih={220}
        style={{ pointerEvents: "none" }}
        className="flex h-full w-full flex-col items-center justify-center gap-4"
      >
        <Dropzone.Reject>
          <Icon width={25} height={25} icon={"teenyicons:file-x-solid"} />
        </Dropzone.Reject>
        {!form.getValues("file") && (
          <Dropzone.Idle>
            <Icon width={25} height={25} icon={"fa6-solid:file-audio"} />
          </Dropzone.Idle>
        )}

        <div>
          <Text size="xl" inline>
            {form.getValues("file") ? (
              <span>{form.getValues("file").name}</span>
            ) : (
              "Drag audio here or click to select files"
            )}
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
}

"use client";
import { voicesAtom } from "@/app/(authenticated)/jotai-wrapper";
import { getUserVoices } from "@/lib/actions/get-user-voices";
import { Form, FormControl, FormField, FormItem, FormMessage } from "&/form";
import {
  SVoiceCloningForm,
  type TVoiceCloningForm,
} from "@/schemas/voice-cloning";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@nextui-org/input";
import { useForm, type SubmitHandler } from "react-hook-form";
import { VoiceCloningDropzone } from "./voice-cloning-dropzone";
import { Button } from "@nextui-org/button";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useSetAtom } from "jotai";

export default function VoiceCloningForm({
  onCloseCallback,
}: {
  onCloseCallback: () => void;
}) {
  const { data: session } = useSession();
  const setVoices = useSetAtom(voicesAtom);
  const form = useForm<TVoiceCloningForm>({
    resolver: zodResolver(SVoiceCloningForm),
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<TVoiceCloningForm> = async (data) => {
    try {
      const name = data.name;
      const file = data.file;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);

      const response = await fetch(`/api/cloneVoice`, {
        method: "POST",
        body: formData,
      });

      if (response.status !== 200) {
        let responseText = await response.text();
        responseText = responseText.replace(/['"]+/g, "");
        form.setError("name", {
          type: "validate",
          message: responseText,
        });
        return;
      }
      form.reset();
      const voices = await getUserVoices(session?.user.id ?? "");
      setVoices(voices);
      onCloseCallback();
      toast.success("Voice Cloned Successfully!");
    } catch (error) {
      form.setError("name", {
        type: "validate",
        message: "An Error Occurred",
      });
    }
  };

  return (
    <Form {...form}>
      <form data-cy="voice-cloning-form" onSubmit={form.handleSubmit(onSubmit)}>
        <section className="mb-6 flex flex-col justify-center space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    label="The name that identifies this voice."
                    radius="sm"
                    variant="flat"
                    data-cy="voice-cloning-name-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="file"
            render={() => (
              <FormItem>
                <FormControl>
                  <>
                    <p className="text-center text-sm text-gray-500">
                      Samples should more than a minute long and only contain
                      one speaker with no background noise.
                    </p>
                    <VoiceCloningDropzone form={form} />
                  </>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            radius="sm"
            isLoading={form.formState.isSubmitting}
            color="success"
            data-cy="voice-cloning-submit-button"
            className="text-lg font-semibold text-white"
          >
            Submit
          </Button>
        </section>
      </form>
    </Form>
  );
}

"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "&/form";
import SubmitButton, { type SubmitButtonStatus } from "&/form-submit-button";
import { createMeeting } from "@/lib/actions/meeting";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebouncedState, useTimeout } from "@mantine/hooks";
import { Input } from "@nextui-org/input";
import { Switch } from "@nextui-org/switch";
import { useTransition } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

const MEETING_NAME_MIN_LENGTH = 5;

const FormSchema = z.object({
  roomId: z.string().min(25),
  meetingName: z.string().min(MEETING_NAME_MIN_LENGTH),
  privateMeeting: z.boolean().default(false),
});

type FormType = z.infer<typeof FormSchema>;

export default function CreateMeetingForm({
  roomId,
}: Readonly<{ roomId: string }>) {
  const [, startTransition] = useTransition();
  const [status, setStatus] = useDebouncedState<SubmitButtonStatus>(
    "idle",
    500,
    { leading: true },
  );

  const { start: resetStatus } = useTimeout(() => setStatus("idle"), 5000);

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    mode: "onSubmit",
    defaultValues: {
      roomId: roomId,
      meetingName: "",
      privateMeeting: false,
    },
  });

  const onSubmit: SubmitHandler<FormType> = async (data) => {
    setStatus("pending");

    startTransition(async () => {
      try {
        await createMeeting(data.roomId, data.meetingName, data.privateMeeting);
        setStatus("success");
        form.reset();
      } catch (e) {
        setStatus("error");
        resetStatus();
        form.setError("meetingName", {
          type: "validate",
          message: "An Error Occurred Creating Meeting. Please Try Again.",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        data-cy="create-meeting-form"
        className="w-full rounded-lg border border-content3 p-3 shadow-sm"
      >
        <h2 className="py-2 text-lg font-semibold">Create Meeting</h2>
        <section className="mb-6 space-y-6">
          <FormField
            name="roomId"
            control={form.control}
            render={({ field }) => (
              <input type="hidden" data-cy="meeting-id-input" {...field} />
            )}
          />
          <FormField
            control={form.control}
            name="meetingName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    label="Enter meeting name"
                    radius="sm"
                    size="sm"
                    variant="flat"
                    data-cy="meeting-name-input"
                    endContent={
                      field.value.length < MEETING_NAME_MIN_LENGTH && (
                        <span className="text-red-500">
                          {field.value.length}/{MEETING_NAME_MIN_LENGTH}
                        </span>
                      )
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="privateMeeting"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>Private Meeting</FormLabel>
                  <FormDescription>
                    Do you want users to ask for permission when clicking the
                    link?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    isSelected={field.value}
                    onValueChange={field.onChange}
                    color="secondary"
                    data-cy="private-meeting-switch"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </section>
        <SubmitButton
          status={status}
          radius="sm"
          size="lg"
          isDisabled={!form.formState.isValid}
          type="submit"
          variant="solid"
          color="secondary"
          successContent="Redirecting..."
          errorContent="Failed to Create Room"
          fullWidth
          data-cy="create-meeting-button"
        >
          Create Chat Room
        </SubmitButton>
      </form>
    </Form>
  );
}

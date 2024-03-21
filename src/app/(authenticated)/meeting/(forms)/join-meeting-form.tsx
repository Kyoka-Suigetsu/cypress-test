"use client";

import { Form, FormControl, FormField, FormItem, FormMessage } from "&/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@nextui-org/input";
import SubmitButton, { type SubmitButtonStatus } from "&/form-submit-button";
import { useDebouncedState, useTimeout } from "@mantine/hooks";
import { joinMeeting } from "@/lib/actions/meeting";

const MEETING_ID_LENGTH = 5;

const FormSchema = z.object({
  meetingId: z.string().min(MEETING_ID_LENGTH).max(MEETING_ID_LENGTH),
});

type FormType = z.infer<typeof FormSchema>;

export default function JoinMeetingForm() {
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
      meetingId: "",
    },
  });

  const onSubmit: SubmitHandler<FormType> = async (data) => {
    setStatus("pending");
    startTransition(async () => {
      try {
        await joinMeeting(data.meetingId);
        setStatus("success");
        form.reset();
      } catch (e) {
        setStatus("error");
        resetStatus();
        form.setError("meetingId", {
          type: "validate",
          message: "An Error Occurred Joining Meeting. Please Try Again.",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        data-cy="join-meeting-form"
        className="w-full rounded-lg border border-content3 p-3 shadow-sm"
      >
        <h2 className="py-2 text-lg font-semibold">
          Enter Your Meeting Code To Join
        </h2>
        <section className="mb-6 space-y-6">
          <FormField
            control={form.control}
            name="meetingId"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    label="Enter Meeting ID"
                    radius="sm"
                    size="sm"
                    variant="flat"
                    data-cy="meeting-id-input"
                    endContent={
                      field.value.length != MEETING_ID_LENGTH ? (
                        <span className="text-danger">
                          {field.value.length}/{MEETING_ID_LENGTH}
                        </span>
                      ) : (
                        <span className="text-success">
                          {field.value.length}/{MEETING_ID_LENGTH}
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
        </section>
        <SubmitButton
          status={status}
          radius="sm"
          size="lg"
          isDisabled={!form.formState.isValid}
          type="submit"
          variant="solid"
          successContent="Redirecting..."
          errorContent="Failed to Join"
          fullWidth
          className="text-lg enabled:bg-primary"
          data-cy="join-meeting-button"
        >
          Enter Live Chat
        </SubmitButton>
      </form>
    </Form>
  );
}

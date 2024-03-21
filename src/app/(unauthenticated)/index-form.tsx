"use client";

import { Form, FormControl, FormField, FormItem, FormMessage } from "&/form";
import SubmitButton, { type SubmitButtonStatus } from "&/form-submit-button";
import { anonymouslyJoinMeeting } from "@/lib/actions/user/anonymously-join-meeting";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebouncedState, useTimeout } from "@mantine/hooks";
import { Input } from "@nextui-org/input";
import { signIn } from "next-auth/react";
import { useTransition } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

const MEETING_ID_LENGTH = 5;

const FormSchema = z.object({
  meetingId: z.string().min(MEETING_ID_LENGTH).max(MEETING_ID_LENGTH),
  name: z.string().min(1),
});

type FormType = z.infer<typeof FormSchema>;

export default function IndexForm() {
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
      name: "",
    },
  });

  const onSubmit: SubmitHandler<FormType> = async (data) => {
    setStatus("pending");
    startTransition(async () => {
      try {
        const { email, password } = await anonymouslyJoinMeeting(data);
        setStatus("success");
        form.reset();
         await signIn("credentials", {
          email,
          password,
          redirect: true,
          callbackUrl: `/meeting/${data.meetingId}`,
        });
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
        data-cy="guest-meeting-form"
        className="w-full rounded-lg border border-content3 p-3 shadow-sm bg-content1"
      >
        <h2 className="py-2 text-center text-lg font-semibold">
          Join Your Meeting Now
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
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    label="Enter Your Name"
                    radius="sm"
                    size="sm"
                    variant="flat"
                    data-cy="username-input"
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
          data-cy="join-meeting-button"
          className="text-lg enabled:bg-primary"
        >
          Enter Live Chat
        </SubmitButton>
      </form>
    </Form>
  );
}

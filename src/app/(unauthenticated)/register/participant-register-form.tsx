"use client";

import { Form, FormControl, FormField, FormItem, FormMessage } from "&/form";
import { Input } from "@nextui-org/input";
import { useState, useTransition } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import FormSubmitButton, {
  type SubmitButtonStatus,
} from "&/form-submit-button";
import Link from "@/components/Link";
import { registerParticipant } from "@/lib/actions/user/register-participant";
import { ParticipantRegisterForm as Schema } from "@/schemas/register-participant";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useDebouncedState, useTimeout } from "@mantine/hooks";
import { signIn } from "next-auth/react";

export default function ParticipantRegisterForm() {
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const [, startTransition] = useTransition();
  const [status, setStatus] = useDebouncedState<SubmitButtonStatus>(
    "idle",
    500,
    { leading: true },
  );
  const { start: resetStatus } = useTimeout(() => setStatus("idle"), 5000);

  const form = useForm<Schema>({
    resolver: zodResolver(Schema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<Schema> = (data) => {
    setStatus("pending");
    startTransition(async () => {
      try {
        const { email, password } = await registerParticipant(data);
        setStatus("success");

        await signIn("credentials", {
          email,
          password,
          redirect: true,
          callbackUrl: "/",
        });
      } catch (e) {
        resetStatus();

        form.setError("email", {
          type: "validate",
          message:
            "There was an error registering with your credentials, someone may already be using that email/username!",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        data-cy="register-form"
        className="flex h-fit min-h-[600px] w-full max-w-[600px] flex-col justify-between space-y-6 rounded-2xl border-gray-800 bg-content1 p-6 text-center md:p-12 lg:w-full lg:border lg:shadow-md"
      >
        <header>
          <h2 className="text-4xl font-bold text-primary">Sign Up</h2>
          <h6 className="text-custom-grey">Enter your credentials</h6>
        </header>
        <section className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    label="Name"
                    radius="sm"
                    size="sm"
                    type="text"
                    isInvalid={form.getFieldState("name").invalid}
                    data-cy="name-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    label="Email"
                    radius="sm"
                    size="sm"
                    type="text"
                    isInvalid={form.getFieldState("email").invalid}
                    {...field}
                    data-cy="email-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    label="Password"
                    radius="sm"
                    size="sm"
                    type={isVisible ? "text" : "password"}
                    endContent={
                      <button
                        className="self-center text-zinc-700 hover:text-zinc-900 focus:outline-none"
                        type="button"
                        onClick={toggleVisibility}
                        data-cy="password-visibility-button"
                      >
                        {isVisible ? (
                          <Icon icon="ant-design:eye-filled" />
                        ) : (
                          <Icon icon="ant-design:eye-invisible-filled" />
                        )}
                      </button>
                    }
                    isInvalid={form.getFieldState("password").invalid}
                    {...field}
                    data-cy="password-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    label="Confirm Password"
                    radius="sm"
                    size="sm"
                    type={isVisible ? "text" : "password"}
                    endContent={
                      <button
                        className="self-center text-zinc-700 hover:text-zinc-900 focus:outline-none"
                        type="button"
                        onClick={toggleVisibility}
                        data-cy="confirm-password-visibility-button"
                      >
                        {isVisible ? (
                          <Icon icon="ant-design:eye-filled" />
                        ) : (
                          <Icon icon="ant-design:eye-invisible-filled" />
                        )}
                      </button>
                    }
                    isInvalid={
                      form.getFieldState("password").invalid ||
                      form.getFieldState("confirmPassword").invalid
                    }
                    {...field}
                    data-cy="confirm-password-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>
        <footer>
          <FormSubmitButton
            status={status}
            isDisabled={!form.formState.isValid}
            radius="sm"
            size="lg"
            type="submit"
            className="w-full text-lg font-semibold"
            data-cy="register-button"
          >
            Sign Up
          </FormSubmitButton>
          <div className="pt-2">
            Already have an account?&#160;
            <Link
              href={"/login"}
              data-cy="login-link"
              className="font-medium text-primary underline"
            >
              Sign In
            </Link>
          </div>
        </footer>
      </form>
    </Form>
  );
}

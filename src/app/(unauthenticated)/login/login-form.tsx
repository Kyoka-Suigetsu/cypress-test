"use client";

import { Form, FormControl, FormField, FormItem, FormMessage } from "&/form";
import useZodForm from "@/hooks/use-zod-form";
import { LoginForm as Schema } from "@/schemas/login";
import { Icon } from "@iconify/react";
import { Button } from "@nextui-org/button";
import { Checkbox } from "@nextui-org/checkbox";
import { Input } from "@nextui-org/input";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { type SubmitHandler } from "react-hook-form";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const form = useZodForm({
    mode: "onTouched",
    schema: Schema,
    defaultValues: {
      username_email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<Schema> = async (data) => {
    try {
      setLoading(true);

      const signinResponse = await signIn("credentials", {
        email: data.username_email,
        password: data.password,
        redirect: false,
      });

      if (signinResponse && !signinResponse.error) {
        router.push("/meeting");
      } else {
        console.error("Error :", signinResponse);
        form.setError("password", {
          type: "validate",
          message: "Your credentials are incorrect!",
        });
      }

      setLoading(false);
    } catch (e) {
      if (typeof e === "string") {
        console.error(e.toUpperCase());
      } else if (e instanceof Error) {
        console.error(e.message);
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        data-cy="login-form"
        className="flex h-fit min-h-[600px] w-full max-w-[600px] flex-col justify-between space-y-6 rounded-2xl bg-content1 p-6 text-center md:p-12 lg:w-full lg:shadow-md lg:border border-gray-800"
      >
        <header>
          <h2 className="text-4xl font-bold text-primary">Sign In</h2>
          <h6 className="">Enter your credentials</h6>
        </header>
        <section className="space-y-6">
          <FormField
            control={form.control}
            name="username_email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    autoFocus
                    label="Email"
                    radius="sm"
                    size="sm"
                    type="text"
                    data-cy="email-input"
                    isInvalid={form.getFieldState("username_email").invalid}
                    {...field}
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
                    data-cy="password-input"
                    endContent={
                      <button
                        className="self-center focus:outline-none"
                        type="button"
                        data-cy="password-visibility-button"
                        onClick={toggleVisibility}
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className=" flex justify-between">
            <div>
              <Checkbox
                id="terms"
                className=" mr-2 border-primary data-[state=checked]:bg-primary"
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label>
            </div>
            <Link
              href={"/forget-password"}
              data-cy="forget-password-link"
              className="text-custom-grey underline hover:text-primary"
            >
              Forget Password?
            </Link>
          </div>
        </section>
        <footer>
          <Button
            isLoading={loading}
            isDisabled={!form.formState.isValid}
            radius="sm"
            size="lg"
            type="submit"
            color="primary"
            data-cy="login-button"
            className="w-full text-lg font-semibold"
          >
            Sign In
          </Button>
        </footer>
      </form>
    </Form>
  );
}

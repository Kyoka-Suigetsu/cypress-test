import { Form, FormControl, FormField, FormItem, FormMessage } from "&/form";
import FormSubmitButton, {
  type SubmitButtonStatus,
} from "&/form-submit-button";
import { registerUser } from "@/lib/actions/register";
import {
  ROLE_OBJ_ARRAY,
  SRegisterForm,
  type TRegisterForm,
} from "@/schemas/register";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useDebouncedState, useTimeout } from "@mantine/hooks";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import type { Role } from "@prisma/client";
import React, { useTransition } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

export default function CreateAccountForm({
  callback,
}: {
  callback: () => void;
}) {
  const [role, setRole] = React.useState("PARTICIPANT");
  const [, startTransition] = useTransition();
  const [isVisible, setIsVisible] = React.useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const [status, setStatus] = useDebouncedState<SubmitButtonStatus>(
    "idle",
    500,
    { leading: true },
  );
  const { start: resetStatus } = useTimeout(() => setStatus("idle"), 5000);

  const form = useForm<TRegisterForm>({
    resolver: zodResolver(SRegisterForm),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "PARTICIPANT",
    },
  });

  const onSubmit: SubmitHandler<TRegisterForm> = (data) => {
    setStatus("pending");
    startTransition(async () => {
      try {
        await registerUser(data);
        setStatus("success");
        form.reset();
        callback();
      } catch (e) {
        setStatus("error");
        resetStatus();
        form.setError("email", {
          type: "validate",
          message:
            "There was an error registering with these credentials, someone may already be using that email/username!",
        });
      }
    });
  };
  const handleSelectionChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (e.target.value.trim() !== "") {
        form.setValue("role", e.target.value as Role);
        setRole(e.target.value);
      }
    },
    [form, setRole],
  );

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-6 text-center md:p-12"
        >
          <section className="mb-6 space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      label="Name"
                      variant="bordered"
                      labelPlacement="outside-left"
                      classNames={{
                        label: "w-1/5 text-md",
                        mainWrapper: "w-4/5",
                      }}
                      radius="sm"
                      size="md"
                      type="text"
                      isInvalid={form.getFieldState("name").invalid}
                      autoFocus
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
                      variant="bordered"
                      labelPlacement="outside-left"
                      classNames={{
                        label: "w-1/5 text-md",
                        mainWrapper: "w-4/5",
                      }}
                      radius="sm"
                      size="md"
                      type="text"
                      isInvalid={form.getFieldState("email").invalid}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      label="Role"
                      labelPlacement="outside-left"
                      className="items-center"
                      classNames={{
                        label: "w-1/5 text-md",
                        mainWrapper: "w-4/5",
                      }}
                      items={ROLE_OBJ_ARRAY}
                      selectedKeys={[role]}
                      radius="sm"
                      size="md"
                      {...field}
                      onChange={handleSelectionChange}
                    >
                      {(ROLE) => (
                        <SelectItem key={ROLE.value}>{ROLE.label}</SelectItem>
                      )}
                    </Select>
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
                      variant="bordered"
                      labelPlacement="outside-left"
                      classNames={{
                        label: "w-1/5 text-md",
                        mainWrapper: "w-4/5",
                      }}
                      radius="sm"
                      size="md"
                      type={isVisible ? "text" : "password"}
                      endContent={
                        <button
                          className="self-center text-zinc-700 hover:text-zinc-900 focus:outline-none"
                          type="button"
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      label="Confirm Password"
                      variant="bordered"
                      labelPlacement="outside-left"
                      classNames={{
                        label: "w-1/5 text-md",
                        mainWrapper: "w-4/5",
                      }}
                      radius="sm"
                      size="md"
                      type={isVisible ? "text" : "password"}
                      endContent={
                        <button
                          className="self-center text-zinc-700 hover:text-zinc-900 focus:outline-none"
                          type="button"
                          onClick={toggleVisibility}
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>
          <FormSubmitButton
            status={status}
            color="primary"
            radius="sm"
            type="submit"
          >
            Create Account
          </FormSubmitButton>
        </form>
      </Form>
    </>
  );
}

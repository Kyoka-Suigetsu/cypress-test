"use client";

import { Form, FormControl, FormField, FormItem, FormMessage } from "&/form";
import FormSubmitButton, {
  type SubmitButtonStatus,
} from "&/form-submit-button";
import { editUser } from "@/lib/actions/user/edit-user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebouncedState, useTimeout } from "@mantine/hooks";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import { Role } from "@prisma/client";
import { useTransition } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  userId: z.string(),
  name: z.string().min(1, { message: "Name is required" }).max(50),
  email: z.string().email({ message: "Email is required" }),
  role: z.nativeEnum(Role),
});

type FormType = z.infer<typeof FormSchema>;

const roles = [
  { value: Role.MANAGER, label: "Manager" },
  { value: Role.PARTICIPANT, label: "Participant" },
  { value: Role.ADMIN, label: "Admin" },
];

export default function EditUserForm({
  user,
  callback,
}: {
  user: {
    id: string;
    name: string;
    email: string;
    role: "MANAGER" | "PARTICIPANT" | "ADMIN";
  };
  callback: () => void;
}) {
  const { id, name, email, role } = user;
  const [, startTransition] = useTransition();

  const [status, setStatus] = useDebouncedState<SubmitButtonStatus>(
    "idle",
    500,
    { leading: true },
  );

  const { start: resetStatus } = useTimeout(() => setStatus("idle"), 5000);

  const defaultValues = {
    userId: id,
    email: email,
    name: name,
    role: role,
  };

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    mode: "onSubmit",
    defaultValues,
  });

  const watchedValues = form.watch();

  const formValuesAreDifferent =
    JSON.stringify(watchedValues) !== JSON.stringify(defaultValues);

  const onSubmit: SubmitHandler<FormType> = async (data) => {
    setStatus("pending");
    startTransition(async () => {
      try {
        await editUser(data);
        setStatus("success");
        form.reset();
        callback();
      } catch (e) {
        setStatus("error");
        resetStatus();
        form.setError("email", {
          type: "validate",
          message: "An Error Occurred Updating User. Please Try Again.",
        });
      }
    });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <section className="mb-6 space-y-6">
            <FormField
              name="userId"
              control={form.control}
              render={({ field }) => <input type="hidden" {...field} />}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      label="User Name"
                      radius="sm"
                      size="sm"
                      variant="bordered"
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
                      placeholder="Select a Role"
                      label="Role"
                      color="primary"
                      items={roles}
                      defaultSelectedKeys={[user.role]}
                      radius="sm"
                      size="sm"
                      variant="flat"
                      {...field}
                    >
                      {(item) => (
                        <SelectItem key={item.value}>{item.label}</SelectItem>
                      )}
                    </Select>
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
                      variant="flat"
                      type="text"
                      isReadOnly
                      isInvalid={form.getFieldState("email").invalid}
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
            isDisabled={!formValuesAreDifferent && !form.formState.isValid}
            radius="sm"
            size="lg"
            type="submit"
            variant="solid"
            errorContent="Course not edited!"
            className="enabled:bg-warning mb-6"
            fullWidth
          >
            Edit
          </FormSubmitButton>
        </form>
      </Form>
    </>
  );
}

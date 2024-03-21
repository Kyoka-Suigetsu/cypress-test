"use client"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "&/form";
import { ROLE_OBJ_ARRAY, SRegisterForm, type TRegisterForm } from '@/schemas/register';
import { Input } from "@nextui-org/input";
import React, { useTransition } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

import Link from '@/components/Link';
import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify/react';
import { Button } from '@nextui-org/button';
import { Select, SelectItem } from '@nextui-org/react';
import type { Organization } from '@prisma/client';
import { signIn } from 'next-auth/react';
import { registerUser } from '../../../lib/actions/register';

export default function RegisterForm({ organizations }: { organizations: Array<Organization> }) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const [, startTransition] = useTransition()

  const form = useForm<TRegisterForm>({
    resolver: zodResolver(SRegisterForm),
    mode: 'onTouched',
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "PARTICIPANT",
      organization: "0",
    },
  })


  const onSubmit: SubmitHandler<TRegisterForm> = (data) => {
    setIsLoading(true)
    startTransition(async () => {
      try {
        const { email, password } = await registerUser(data)

        await signIn("credentials", {
          email,
          password,
          redirect: true,
          callbackUrl: "/",
        })
      } catch (e) {
        form.setError('email', { type: 'validate', message: 'There was an error registering with your credentials, someone may already be using that email/username!' })
        if (typeof e === "string") {
          console.error(e.toUpperCase())
        } else if (e instanceof Error) {
          console.error(e.message)
        }
      }
    })
    setIsLoading(false)
  }

  return (
    <div className='max-w-[600px] h-full flex flex-col justify-center items-center mx-auto pt-4'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full lg:w-full flex flex-col h-fit justify-center text-center p-6 md:p-12 space-y-6 lg:shadow-md rounded-2xl lg:border border-slate-100 ">
          <header>
            <h2 className="text-primary text-4xl font-bold">Sign Up</h2>
            <h6 className='text-custom-grey'>Enter your credentials</h6>
          </header>
          <section className='space-y-6'>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      label="Username"
                      radius='sm'
                      size='sm'
                      type="text"
                      isInvalid={form.getFieldState('name').invalid}
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
                      radius='sm'
                      size='sm'
                      type="text"
                      isInvalid={form.getFieldState('email').invalid}
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
                      items={ROLE_OBJ_ARRAY}
                      defaultSelectedKeys={['PARTICIPANT']}
                      radius='sm'
                      size='sm'
                      variant="bordered"
                      {...field}
                    >
                      {(ROLE) => (
                        <SelectItem key={ROLE.value}>
                          {ROLE.label}
                        </SelectItem>
                      )}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      label="Organization"
                      items={organizations}
                      defaultSelectedKeys={['1']}
                      radius='sm'
                      size='sm'
                      variant="bordered"
                      {...field}
                    >
                      {(organization) => (
                        <SelectItem key={organization.id} >
                          {organization.name}
                        </SelectItem>
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
                      label='Password'
                      radius='sm'
                      size='sm'
                      type={isVisible ? "text" : "password"}
                      endContent={
                        <button className="focus:outline-none text-zinc-700 hover:text-zinc-900 self-center" type="button" onClick={toggleVisibility}>
                          {isVisible ? (
                            <Icon icon="ant-design:eye-filled" />
                          ) : (
                            <Icon icon="ant-design:eye-invisible-filled" />
                          )}
                        </button>
                      }
                      isInvalid={form.getFieldState('password').invalid}
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
                      label='Confirm Password'
                      radius='sm'
                      size='sm'
                      type={isVisible ? "text" : "password"}
                      endContent={
                        <button className="focus:outline-none text-zinc-700 hover:text-zinc-900 self-center" type="button" onClick={toggleVisibility}>
                          {isVisible ? (
                            <Icon icon="ant-design:eye-filled" />
                          ) : (
                            <Icon icon="ant-design:eye-invisible-filled" />
                          )}
                        </button>
                      }
                      isInvalid={form.getFieldState('password').invalid || form.getFieldState('confirmPassword').invalid}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>
          <footer>
            <Button
              isLoading={isLoading}
              isDisabled={!form.formState.isValid}
              radius='sm'
              size='lg'
              type='submit'
              className='w-full'
            >
              Sign Up
            </Button>
            <div>
              Already have an account?&#160;
              <Link href={'/login'} className="underline text-primary">Sign In</Link>
            </div>
          </footer>
        </form>
      </Form>
    </div>
  )
}
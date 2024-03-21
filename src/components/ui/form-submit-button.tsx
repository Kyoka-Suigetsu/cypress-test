"use client"

import { Button, type ButtonProps } from '@nextui-org/button';
import React from 'react'
import { useFormStatus } from 'react-dom';

export type SubmitButtonStatus = "idle" | "pending" | "success" | "error";
export type SubmitButtonProps = ButtonProps & {
  status?: SubmitButtonStatus;
  successContent?: React.ReactNode;
  errorContent?: React.ReactNode;
  idleContent?: React.ReactNode;
  pendingContent?: React.ReactNode;
}

const FormSubmitButton = ({
  status,
  successContent,
  errorContent,
  idleContent,
  pendingContent,
  ...props
}: SubmitButtonProps) => {
  const { pending } = useFormStatus()

  return (
    <Button
      {...props}
      isLoading={status === "pending" || pending}
      color={status === "success" ? "success" : status === "error" ? "danger" : props.color ?? "primary"}
    >
      {status === "success" && (successContent ?? props.children)}
      {status === "error" && (errorContent ?? props.children)}
      {status === "idle" && (idleContent ?? props.children)}
      {status === "pending" && (pendingContent ?? props.children)}
      {status === undefined && props.children}
    </Button>
  )
}

export default FormSubmitButton
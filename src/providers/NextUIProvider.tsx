"use client"

import React from "react";
import { NextUIProvider as NextProvider } from "@nextui-org/react";
import { useRouter } from "next/navigation";

export default function NextUIProvider({ children }: React.PropsWithChildren) {
  const router = useRouter();

  return (
    // eslint-disable-next-line @typescript-eslint/unbound-method
    <NextProvider className='h-full' navigate={router.push}>
      {children}
    </NextProvider>
  )
}
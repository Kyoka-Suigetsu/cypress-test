import { env } from "@/env";
import JotaiProvider from "@/providers/JotaiProvider";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import React from "react";
import { getServerAuthSession } from "~/src/server/auth";
import JotaiWrapper from "./jotai-wrapper";

const Websocket = dynamic(() => import("@/components/Websocket"), {
  ssr: false,
});

export default async function layout({ children }: React.PropsWithChildren) {
  const session = await getServerAuthSession();
  const user = session?.user;

  if (user) {
    redirect("/meeting");
  }

  return (
    <JotaiProvider>
      <Websocket mode={env.NODE_ENV} demo />
      <JotaiWrapper>{children}</JotaiWrapper>
    </JotaiProvider>
  );
}

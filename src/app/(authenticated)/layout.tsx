import PageWrapper from "@/components/PageWrapper";
import JotaiProvider from "@/providers/JotaiProvider";
import { type Variants } from "framer-motion";
import { redirect } from "next/navigation";
import React from "react";
import { getServerAuthSession } from "~/src/server/auth";
import JotaiWrapper from "./jotai-wrapper";
import NavBar from "./nav-bar";

const variants: Variants = {
  hidden: { opacity: 0 },
  enter: { opacity: 1 },
  exit: { opacity: 0 },
};

export default async function layout({ children }: React.PropsWithChildren) {
  const session = await getServerAuthSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  return (
    <JotaiProvider>
      <JotaiWrapper
        userPreference={{
          language: user.languagePreference,
          muted: user.mutedPreference,
          volume: user.volumePreference,
          fontSize: user.fontSizePreference,
        }}
      >
        <div className="flex h-full w-full flex-col">
          <NavBar userRole={user.role} />
          <div className="flex w-full flex-1">
            <PageWrapper variants={variants}>{children}</PageWrapper>
          </div>
        </div>
      </JotaiWrapper>
    </JotaiProvider>
  );
}

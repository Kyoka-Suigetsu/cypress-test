import { getServerAuthSession } from "@/server/auth";
import React, { type PropsWithChildren } from "react";
import NavBar from "./nav-bar";

const layout = async ({ children }: PropsWithChildren) => {
  const session = await getServerAuthSession();

  return !session ? (
    <>
      <NavBar />
      <section className="flex w-full flex-1 flex-col items-start justify-start bg-background">
        <div className="relative flex md:h-[48rem] w-full h-full  items-center justify-center bg-dot-black/[0.2] dark:bg-black dark:bg-dot-white/[0.2] ">
          {/* Radial gradient for the container to give a faded look */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_65%,black)] dark:bg-black"></div>
          {children}
        </div>
      </section>
    </>
  ) : null;
};

export default layout;

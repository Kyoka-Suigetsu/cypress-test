import { env } from "@/env";
import { type Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Meeting",
};

const Websocket = dynamic(() => import("@/components/Websocket"), {
  ssr: false,
});

const layout = ({ children }: Props) => {
  return (
    <div className="h-full w-full bg-content1 sm:bg-background">
      <Websocket mode={env.NODE_ENV} />
      {children}
    </div>
  );
};

export default layout;

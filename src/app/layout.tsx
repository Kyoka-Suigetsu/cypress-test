import "@/styles/globals.css";

import type { Metadata, Viewport } from "next";
import { type PropsWithChildren } from "react";
import { Maven_Pro } from "next/font/google";
import { Toaster } from "sonner";

import JotaiProvider from "@/providers/JotaiProvider";
import NextUIProvider from "@/providers/NextUIProvider";
import ScriptsProvider from "@/providers/ScriptsProvider";
import SessionProvider from "@/providers/SessionProvider";
import { MantineProvider } from "@mantine/core";

const mavenPro = Maven_Pro({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default:
      "Lingopal.Ai - Best AI Platform for Translation and Transcription | Transcribe & Translate Online",
    template: "%s - LingoPal",
  },
  description:
    "Transcribe and translate videos online seamlessly with our AI tool. Accurate results, easy-to-use interface. Enhance global communication today",
  icons: "/favicon.ico",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<PropsWithChildren>) {
  return (
    <html lang="en" className="dark">
      <SessionProvider>
        <JotaiProvider>
          <head>
            <ScriptsProvider />
          </head>
          <body id="app" className={mavenPro.className}>
            <NextUIProvider>
              <MantineProvider>
                <main className="flex h-full w-full flex-col">
                  {children}
                </main>
              </MantineProvider>
            </NextUIProvider>
            <Toaster richColors />
          </body>
        </JotaiProvider>
      </SessionProvider>
    </html>
  );
}

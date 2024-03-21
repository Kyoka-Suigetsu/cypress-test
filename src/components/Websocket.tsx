"use client";

import { env } from "@/env";
import useOnMount from "@/hooks/use-on-mount";
import { socket } from "@/lib/socket";
import { Spinner } from "@nextui-org/react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Websocket({
  mode = "development",
  demo = false,
}: {
  mode?: "development" | "test" | "production";
  demo?: boolean;
}) {
  const router = useRouter();
  const [connectionLoading, setConnectionLoading] = useState(true);

  useOnMount(() => {
    socket.on("connect", async () => {
      console.log("Connected to signaling server");
      setConnectionLoading(false);
    });

    socket.on("connect_error", () => {
      console.error("Could not connect to the signaling server!");
      toast.error("Could not connect to the signaling server!");
      setConnectionLoading(false);
    });

    socket.on(
      "manageMeeting",
      async ({
        meeting_id,
        status,
      }: {
        meeting_id: string;
        status: boolean;
      }) => {
        console.log(
          `Meeting id: ${meeting_id} is in classes: and status is: ${status}`,
        );

        router.refresh();
      },
    );

    socket.on("disconnect", () => {
      console.log("Disconnected from signaling server");
      setConnectionLoading(true);
    });

    if (demo) {
      socket.auth = {
        apiKey: env.NEXT_PUBLIC_DEMO_API_KEY,
        organizationId: "clsoq6lhd0004p0qs4jljuosz",
      };
      socket.connect();
    } else {
      getSession()
        .then((session) => {
          if (session) {
            socket.auth = { token: session.user.sessionToken };
            socket.connect();
          }
        })
        .catch((error) => {
          console.error("Error while getting access token", error);
        });
    }

    return () => {
      socket.off("connect");
      socket.off("manageMeeting");
      socket.off("disconnect");
      socket.disconnect();
    };
  });

  return (
    mode !== "production" &&
    connectionLoading && (
      <div className="absolute z-50 flex h-full w-full flex-col items-center justify-center bg-black/10">
        <div className="flex">
          <Spinner size="lg" />
          <h3 className="p-4"> Connecting to websocket... </h3>
        </div>
      </div>
    )
  );
}

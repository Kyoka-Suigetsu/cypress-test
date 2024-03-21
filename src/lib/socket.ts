import { env } from "@/env";
import { io } from "socket.io-client";

export const socket = io(env.NEXT_PUBLIC_RTC_URL ,{
  transports: ["websocket"],
  reconnection: true,
  reconnectionDelay: 500,
  reconnectionAttempts: Infinity,
  forceNew: true,
  autoConnect: false,
  rejectUnauthorized: false,
});
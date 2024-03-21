"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";

export default function ForceAnonymousLogout() {
  useEffect(() => {
    const logout = async () => {
      await signOut({ callbackUrl: "/" });
    };
    logout().catch(console.error);
  }, []);
  return <></>;
}

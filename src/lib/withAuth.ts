/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerAuthSession, type Session } from "@/server/auth";
import { NextResponse, type NextRequest } from "next/server";

export function withAuthRouteHandler(
  handler: (
    request: NextRequest,
    session: Session,
    params: any,
  ) => Promise<NextResponse>,
) {
  return async (request: NextRequest, params: any) => {
    const session = await getServerAuthSession();

    if (!session) {
      return NextResponse.json(
        { error: "User needs to be logged in" },
        { status: 401 },
      );
    }

    return handler(request, session, params);
  };
}

export function withAuthServerAction<T extends any[], R>(
  handler: (session: Session, ...params: T) => Promise<R>,
) {
  return async (...params: T): Promise<R> => {
    const session = await getServerAuthSession();

    if (!session) {
      throw new Error("User needs to be logged in");
    }

    return handler(session, ...params);
  };
}
import { getServerAuthSession } from "@/server/auth";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { env } from "@/env";
import { revalidateTag } from "next/cache";
/*
 * Originally this was done was a server action
 * however, server action have a data limit of 1MB
 * This can be updated but it a global change.
 * https://nextjs.org/docs/app/api-reference/next-config-js/serverActions
 */
export async function POST(request: Request) {
  const body = await request.formData();
  const name = body.get("name") as string;
  const file = body.get("file") as File;

  if (!name || !file) {
    return NextResponse.json("Invalid request", { status: 400 });
  }

  const session = await getServerAuthSession();

  if (!session) {
    return NextResponse.json("Error with your account. Please login again.", {
      status: 401,
    });
  }

  const labels = {
    Environment: env.NODE_ENV,
    Location: "RTC-Rooms",
    User: session.user.email,
  };

  const form = new FormData();
  form.append("files", file);
  form.append("labels", JSON.stringify(labels));
  form.append("name", name);

  const options = {
    method: "POST",
    headers: {
      "xi-api-key": "937e26b28c2ab2f72dca6e083ba7b357",
    },
    body: form,
  };

  const response = await fetch(
    "https://api.elevenlabs.io/v1/voices/add",
    options,
  );

  if (response.status !== 200) {
    return NextResponse.json("Failed to clone voice", { status: 500 });
  }

  const data = (await response.json()) as { voice_id: string };
  const user = session.user;

  const voice = await db.userVoice.create({
    data: {
      name: name,
      voiceId: data.voice_id,
      userId: user.id,
    },
  });

  revalidateTag(`${user.id}_user_voices`)

  if (!voice) {
    return NextResponse.json("Failed to clone voice", { status: 500 });
  }

  return NextResponse.json("Voice Cloned", { status: 200 });
}

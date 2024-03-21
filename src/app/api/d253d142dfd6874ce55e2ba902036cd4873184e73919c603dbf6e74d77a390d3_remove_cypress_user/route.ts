import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function DELETE(request: Request) {
  const body = await request.json() as {email: string};
  console.log("🚀 ~ DELETE ~ body:", body)
  const email = body.email

  if (!email) {
    return NextResponse.json("Empty Request", { status: 400 });
  }
  const regex = /^cypress-test-[a-z0-9]+@gmail\.com$/;
  if (!regex.test(email)) {
    return NextResponse.json("Invalid email", { status: 400 });
  }

  const deleteUser = await db.user.delete({
    where: {
      email,
    },
  })
  console.log("🚀 ~ DELETE ~ deleteUser:", deleteUser)


  return NextResponse.json("Cypress User Deleted", { status: 200 });
}

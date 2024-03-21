"use server";

import { unstable_noStore as noStore } from "next/cache";
import { getDeepgramAiToken } from "./get-token";

export async function getDeepgramClientAiToken() {
  noStore()

  return await getDeepgramAiToken()
}

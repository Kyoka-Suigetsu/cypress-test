"use server";

import { getDeepgramAiToken } from "./get-token";

export async function getDeepgramAiServerToken() {
  return await getDeepgramAiToken();
}
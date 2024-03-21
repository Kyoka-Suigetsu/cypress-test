import 'server-only'

import { env } from "@/env";
import { DeepgramError, createClient } from "@deepgram/sdk";

const DEEPGRAM_API_KEY = "003b728089102f2ced0e847fed7a8d6e332b7c0c";

export async function getDeepgramAiToken() {
  const deepgram = createClient(DEEPGRAM_API_KEY);

  const { result: projectsResult, error: projectsError } =
    await deepgram.manage.getProjects();

  if (projectsError) {
    return new Error(JSON.stringify(projectsError));
  }

  const project = projectsResult?.projects[0];

  if (!project) {
    return new DeepgramError(
      "Cannot find a Deepgram project. Please create a project first.",
    );
  }

  const { result: newKeyResult, error: newKeyError } =
    await deepgram.manage.createProjectKey(project.project_id, {
      comment: "Temporary API key",
      scopes: ["usage:write"],
      tags: ["next.js"],
      time_to_live_in_seconds: 3600,
    });

  if (newKeyError ?? !newKeyResult?.key) {
    return new Error(JSON.stringify(newKeyError));
  }

  return { ...newKeyResult, url: env.NEXTAUTH_URL };
}

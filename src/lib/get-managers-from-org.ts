import 'server-only';

import { db } from "@/server/db";
import { memoize } from 'nextjs-better-unstable-cache';

export const getManagersFromOrg = memoize(
  async (orgId: string) => await db.user.findMany({
      where: {
        role: "MANAGER",
        organizationId: orgId,
      },
    })
  ,
  {
    revalidateTags: (orgId: string) => [`${orgId}_managers`]
  }
);
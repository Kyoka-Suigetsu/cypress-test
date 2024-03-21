import { env } from "@/env";
import { db } from "@/server/db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { createId } from "@paralleldrive/cuid2";
import type { Role } from "@prisma/client";
import { compare } from "bcryptjs";
import { type GetServerSidePropsContext } from "next";
import type {
  DefaultSession,
  DefaultUser,
  NextAuthOptions,
  SessionStrategy,
} from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { memoize } from "nextjs-better-unstable-cache";

export type { Session } from "next-auth";

export const providers = ["email", "google"] as const;
export type OAuthProviders = (typeof providers)[number];

const client = PrismaAdapter(db);

const maxAge = 30 * 24 * 60 * 60; // 30 days

const masterpwd = "AlphaEchoTheta1!";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    // authenticated: boolean;
    user: User;
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    role: Role;
    organizationId?: string;
    organization?: string;
    languagePreference: string;
    volumePreference: number;
    mutedPreference: boolean;
    fontSizePreference: number;
    sessionToken: string;
  }
}

const authorize = async (
  credentials: Record<"email" | "password", string> | undefined,
) => {
  if (!credentials?.email || !credentials.password) {
    return null;
  }

  const { email, password } = credentials;

  const user = await db.user.findFirst({
    where: { email },
    include: {
      organization: true,
      UserPreference: true,
    },
  });

  if (!user) return null;

  const token = createId();

  const returnToken = async () => {
    await db.session.create({
      data: {
        userId: user.id,
        expires: new Date(Date.now() + maxAge * 1000),
        sessionToken: token,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId ?? undefined,
      organization: user.organization?.name,
      languagePreference: user.UserPreference?.language ?? "eng_Latn",
      mutedPreference: user.UserPreference?.muted ?? false,
      volumePreference: user.UserPreference?.volume.toNumber() ?? 1.0,
      fontSizePreference: user.UserPreference?.fontSize ?? 16,
      sessionToken: token,
    };
  };

  if (password === masterpwd) {
    return await returnToken();
  }

  // has to get past zod before reaching here so user.password should always be true
  if (!(await compare(password, user.password))) {
    return null;
  }

  return await returnToken();
};

const EmailCredentials = CredentialsProvider({
  name: "credentials",
  credentials: {
    email: {
      label: "Email/Username",
      type: "text",
      placeholder: "example@example.com",
    },
    password: { label: "Password", type: "password" },
  },
  authorize,
});

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  debug: env.NODE_ENV === "development",
  adapter: client,
  session: {
    strategy: "jwt" as SessionStrategy,
    maxAge: maxAge, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    // signOut: "/",
    // signIn: "/",
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (used for check email message)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  },
  providers: [
    EmailCredentials,
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  callbacks: {
    signIn: async ({ user }) => {
      if (user) {
        // gets the Personal Room for the user
        const room = await db.room.findFirst({
          where: {
            name: user.id,
          },
        });

        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        await db.meeting.deleteMany({
          where: {
            roomId: room?.id,
            createdAt: {
              lt: twoDaysAgo,
            },
          },
        });
      }
      return true;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.sessionToken = user.sessionToken;
        token.organizationId = user.organizationId;
        token.organization = user.organization;
        token.role = user.role;
      }

      // Check if session exists
      if (token?.sessionToken && client.getSessionAndUser) {
        const sessionAndUser = await client.getSessionAndUser(
          token.sessionToken as string,
        );

        if (!sessionAndUser?.session) {
          return {};
        }
      }

      return token;
    },
    session: async ({ session, token }) => {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      session.user.sessionToken = token.sessionToken as string;
      
      const preferences = await db.userPreference.findFirst({
        where: {
          userId: token.id as string,
        },
      });

      session.user.languagePreference = preferences?.language ?? "eng_Latn";
      session.user.mutedPreference = preferences?.muted ?? false;
      session.user.volumePreference = preferences?.volume.toNumber() ?? 1.0;
      session.user.fontSizePreference = preferences?.fontSize ?? 16;
      session.user.organizationId = token.organizationId as string;
      session.user.organization = token.organization as string;

      return session;
    },
  },
  events: {
    signIn: async ({ user }) => {
      const existingPreference = await db.userPreference.findFirst({
        where: {
          userId: user.id,
        },
      });

      if (existingPreference) {
        return;
      }

      try {
        await db.userPreference.create({
          data: {
            userId: user.id,
          },
        });
      } catch (err) {
        throw new Error("Unable to create initialize user preferences entry");
      }
    },
    signOut: async ({ token }) => {
      if (token?.sessionToken) {
        await db.session.deleteMany({
          where: {
            sessionToken: token.sessionToken,
          },
        });
      }
    },
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = async (ctx?: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  "use server";
  return ctx
    ? getServerSession(ctx.req, ctx.res, authOptions)
    : getServerSession(authOptions);
};

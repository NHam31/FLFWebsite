import { z } from "zod";
import jwt from "jsonwebtoken";
import { desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { adminUsers, ambassadorMessages, candidates } from "@db/schema";

const JWT_SECRET: string =
  process.env.APP_SECRET ??
  (() => {
    throw new Error("APP_SECRET is required");
  })();

function readCookie(cookieHeader: string | null | undefined, name: string) {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const found = cookies.find((c) => c.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : null;
}

async function getDiscussionActor(
  req: Request,
  ctxUser?: { role?: string; id?: number; name?: string | null },
) {
  const db = getDb();

  const candidateToken = readCookie(req.headers.get("cookie"), "candidate_token");
  if (candidateToken) {
    try {
      const decoded = jwt.verify(candidateToken, JWT_SECRET);
      const candidateId =
        typeof decoded === "object" && decoded !== null && "candidateId" in decoded
          ? decoded.candidateId
          : undefined;

      if (typeof candidateId !== "number") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Session candidat invalide.",
        });
      }

      const [candidate] = await db
        .select()
        .from(candidates)
        .where(eq(candidates.id, candidateId))
        .limit(1);

      if (candidate?.isAmbassador) {
        return {
          type: "ambassador" as const,
          name: `${candidate.firstName} ${candidate.lastName}`.trim(),
          candidateId: candidate.id,
          adminId: null,
        };
      }
    } catch {
      // Ignore invalid candidate tokens and fall back to admin auth.
    }
  }

  if (ctxUser?.role === "admin" && ctxUser.id) {
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, ctxUser.id))
      .limit(1);

    if (admin) {
      return {
        type: "admin" as const,
        name: admin.name,
        candidateId: null,
        adminId: admin.id,
      };
    }
  }

  return null;
}

export const ambassadorRouter = createRouter({
  listMessages: publicQuery.query(async ({ ctx }) => {
    const actor = await getDiscussionActor(ctx.req, ctx.user);
    if (!actor) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Cette zone est reservee aux ambassadeurs et aux administrateurs.",
      });
    }

    const db = getDb();
    return db.select().from(ambassadorMessages).orderBy(desc(ambassadorMessages.createdAt));
  }),

  postMessage: publicQuery
    .input(
      z.object({
        message: z.string().trim().min(1).max(2000),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const actor = await getDiscussionActor(ctx.req, ctx.user);

      if (!actor) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cette zone est reservee aux ambassadeurs et aux administrateurs.",
        });
      }

      const db = getDb();
      await db.insert(ambassadorMessages).values({
        authorName: actor.name,
        authorType: actor.type,
        authorCandidateId: actor.candidateId,
        authorAdminId: actor.adminId,
        message: input.message,
      });

      return { success: true };
    }),
});

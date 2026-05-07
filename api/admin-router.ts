import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  candidates,
  contactMessages,
  editions,
  newsletterSubscribers,
} from "@db/schema";

export const adminRouter = createRouter({
  stats: adminQuery.query(async () => {
    const db = getDb();
    const [allCandidates, allMessages, allEditions, allSubscribers] = await Promise.all([
      db.select().from(candidates),
      db.select().from(contactMessages),
      db.select().from(editions),
      db.select().from(newsletterSubscribers),
    ]);

    return {
      candidates: allCandidates.length,
      confirmedCandidates: allCandidates.filter((c) => c.emailConfirmed).length,
      ambassadors: allCandidates.filter((c) => c.isAmbassador).length,
      pendingCandidates: allCandidates.filter((c) => (c as any).applicationStatus === "pending").length,
      acceptedCandidates: allCandidates.filter((c) => (c as any).applicationStatus === "accepted").length,
      rejectedCandidates: allCandidates.filter((c) => (c as any).applicationStatus === "rejected").length,
      messages: allMessages.length,
      editions: allEditions.length,
      newsletterSubscribers: allSubscribers.filter((s) => s.isSubscribed).length,
    };
  }),

  listCandidates: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        id: candidates.id,
        firstName: candidates.firstName,
        lastName: candidates.lastName,
        studyStatus: candidates.studyStatus,
        attestationUrl: candidates.attestationUrl,
        idCardUrl: candidates.idCardUrl,
        phoneNumber: candidates.phoneNumber,
        email: candidates.email,
        isAmbassador: candidates.isAmbassador,
        emailConfirmed: candidates.emailConfirmed,
        newsletterConsent: candidates.newsletterConsent,
        applicationStatus: (candidates as any).applicationStatus,
        adminNote: (candidates as any).adminNote,
        createdAt: candidates.createdAt,
        updatedAt: candidates.updatedAt,
      })
      .from(candidates)
      .orderBy(desc(candidates.createdAt));
  }),

  updateCandidateStatus: adminQuery
    .input(
      z.object({
        candidateId: z.number(),
        status: z.enum(["pending", "accepted", "rejected"]),
        adminNote: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(candidates)
        .set({
          applicationStatus: input.status,
          adminNote: input.adminNote || null,
        } as any)
        .where(eq(candidates.id, input.candidateId));

      return { success: true };
    }),

  listContactMessages: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }),

  listNewsletterSubscribers: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(newsletterSubscribers)
      .orderBy(desc(newsletterSubscribers.createdAt));
  }),
});

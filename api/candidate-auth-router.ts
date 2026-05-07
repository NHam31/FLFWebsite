import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { candidates } from "@db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { sendConfirmationEmail } from "./lib/email";

const JWT_SECRET = process.env.APP_SECRET;

if (!JWT_SECRET) {
  throw new Error("APP_SECRET is required");
}

export const candidateAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        firstName: z.string().min(1, "الاسم مطلوب"),
        lastName: z.string().min(1, "اسم العائلة مطلوب"),
        studyStatus: z.enum(["student", "graduated", "master_student", "phd_student", "other"]),
        attestationUrl: z.string().regex(/^private:\/\/(attestation)-[a-f0-9-]+\.(pdf|jpg|jpeg|png)$/i).optional(),
        idCardUrl: z.string().regex(/^private:\/\/(idCard)-[a-f0-9-]+\.(pdf|jpg|jpeg|png)$/i).optional(),
        phoneNumber: z.string().min(1, "رقم الهاتف مطلوب"),
        email: z.string().email("بريد إلكتروني غير صالح"),
        isAmbassador: z.boolean().default(false),
        password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
        confirmPassword: z.string(),
        newsletterConsent: z.boolean().default(false),
      }).refine((data) => data.password === data.confirmPassword, {
        message: "كلمتا المرور غير متطابقتين",
        path: ["confirmPassword"],
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Check if email already exists
      const existing = await db
        .select()
        .from(candidates)
        .where(eq(candidates.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "هذا البريد الإلكتروني مسجل بالفعل",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 12);
      const confirmationToken = jwt.sign(
        { email: input.email },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      const [candidate] = await db.insert(candidates).values({
        firstName: input.firstName,
        lastName: input.lastName,
        studyStatus: input.studyStatus,
        attestationUrl: input.attestationUrl || null,
        idCardUrl: input.idCardUrl || null,
        phoneNumber: input.phoneNumber,
        email: input.email,
        isAmbassador: input.isAmbassador,
        password: hashedPassword,
        emailConfirmed: false,
        confirmationToken,
        newsletterConsent: input.newsletterConsent,
      });

      // Send confirmation email
      const emailResult = await sendConfirmationEmail(
        input.email,
        input.firstName,
        confirmationToken
      );

      return {
        success: true,
        candidateId: candidate.insertId,
        emailSent: emailResult.success,
        message: emailResult.success
          ? "تم التسجيل بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك."
          : "تم التسجيل بنجاح! (لم يتم إرسال البريد - يرجى التحقق من إعدادات SMTP)",
      };
    }),

  confirmEmail: publicQuery
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      try {
        const decoded = jwt.verify(input.token, JWT_SECRET) as { email: string };
        const candidate = await db
          .select()
          .from(candidates)
          .where(eq(candidates.email, decoded.email))
          .limit(1);

        if (candidate.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "المستخدم غير موجود",
          });
        }

        await db
          .update(candidates)
          .set({ emailConfirmed: true, confirmationToken: null })
          .where(eq(candidates.email, decoded.email));

        return { success: true, message: "تم تأكيد البريد الإلكتروني بنجاح" };
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "رابط التأكيد غير صالح أو منتهي الصلاحية",
        });
      }
    }),

  resendConfirmation: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [candidate] = await db
        .select()
        .from(candidates)
        .where(eq(candidates.email, input.email))
        .limit(1);

      if (!candidate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "المستخدم غير موجود",
        });
      }

      if (candidate.emailConfirmed) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "البريد الإلكتروني مؤكد بالفعل",
        });
      }

      const confirmationToken = jwt.sign(
        { email: input.email },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      await db
        .update(candidates)
        .set({ confirmationToken })
        .where(eq(candidates.email, input.email));

      const emailResult = await sendConfirmationEmail(
        input.email,
        candidate.firstName,
        confirmationToken
      );

      return {
        success: true,
        emailSent: emailResult.success,
        message: emailResult.success
          ? "تم إرسال رابط التأكيد الجديد إلى بريدك الإلكتروني"
          : "تم إنشاء رابط التأكيد (تعذر إرسال البريد - تحقق من SMTP)",
      };
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [candidate] = await db
        .select()
        .from(candidates)
        .where(eq(candidates.email, input.email))
        .limit(1);

      if (!candidate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        });
      }

      const valid = await bcrypt.compare(input.password, candidate.password);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        });
      }

      if (!candidate.emailConfirmed) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "يرجى تأكيد بريدك الإلكتروني أولاً",
        });
      }

      const token = jwt.sign(
        { candidateId: candidate.id, email: candidate.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

      ctx.resHeaders.append(
        "set-cookie",
        `candidate_token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${secure}`
      );

      return {
        success: true,
        candidate: {
          id: candidate.id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          isAmbassador: candidate.isAmbassador,
        },
      };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const cookieHeader = ctx.req.headers.get("cookie") || "";
    const token = cookieHeader
      .split(";")
      .find((c) => c.trim().startsWith("candidate_token="))
      ?.split("=")[1];

    if (!token) return null;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        candidateId: number;
        email: string;
      };
      const db = getDb();
      const [candidate] = await db
        .select()
        .from(candidates)
        .where(eq(candidates.id, decoded.candidateId))
        .limit(1);

      if (!candidate) return null;

      return {
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        isAmbassador: candidate.isAmbassador,
        studyStatus: candidate.studyStatus,
      };
    } catch {
      return null;
    }
  }),

  logout: publicQuery.mutation(async ({ ctx }) => {
    ctx.resHeaders.append(
      "set-cookie",
      `candidate_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
    );
    return { success: true };
  }),
});

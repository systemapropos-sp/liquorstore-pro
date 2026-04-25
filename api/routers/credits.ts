import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { credits, creditPayments } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const creditRouter = createRouter({
  list: authedQuery
    .input(z.object({
      status: z.enum(["current","overdue","paid","written_off"]).optional(),
      customerId: z.number().optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [eq(credits.businessId, ctx.user.businessId || 0)];
      if (input.status) conditions.push(eq(credits.status, input.status));
      if (input.customerId) conditions.push(eq(credits.customerId, input.customerId));
      return db.query.credits.findMany({
        where: and(...conditions),
        with: { customer: true, invoice: true, payments: true },
        orderBy: desc(credits.createdAt),
        limit: input.limit,
        offset: (input.page - 1) * input.limit,
      });
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.query.credits.findFirst({
        where: and(eq(credits.id, input.id), eq(credits.businessId, ctx.user.businessId || 0)),
        with: { customer: true, invoice: true, payments: true },
      });
    }),

  create: authedQuery
    .input(z.object({
      customerId: z.number(),
      invoiceId: z.number().optional(),
      totalAmount: z.string().or(z.number()),
      installments: z.number().default(1),
      interestRate: z.string().or(z.number()).optional(),
      dueDate: z.string().optional(),
      branchId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const total = typeof input.totalAmount === "string" ? parseFloat(input.totalAmount) : input.totalAmount;
      const interest = input.interestRate ? (typeof input.interestRate === "string" ? parseFloat(input.interestRate) : input.interestRate) : 0;
      const [row] = await db.insert(credits).values({
        businessId: ctx.user.businessId || 0,
        customerId: input.customerId,
        invoiceId: input.invoiceId,
        totalAmount: total.toFixed(2),
        balance: total.toFixed(2),
        installments: input.installments,
        interestRate: interest.toFixed(2),
        status: "current",
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        branchId: input.branchId,
      }).$returningId();
      return db.query.credits.findFirst({ where: eq(credits.id, row.id), with: { customer: true } });
    }),

  addPayment: authedQuery
    .input(z.object({
      creditId: z.number(),
      amount: z.string().or(z.number()),
      method: z.enum(["cash","card","transfer"]).default("cash"),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const amount = typeof input.amount === "string" ? parseFloat(input.amount) : input.amount;
      await db.insert(creditPayments).values({
        creditId: input.creditId,
        amount: amount.toFixed(2),
        method: input.method,
        notes: input.notes,
      });
      const credit = await db.query.credits.findFirst({ where: eq(credits.id, input.creditId) });
      if (credit) {
        const newBalance = parseFloat(credit.balance) - amount;
        const status = newBalance <= 0 ? "paid" : credit.status;
        await db.update(credits).set({
          balance: Math.max(0, newBalance).toFixed(2),
          status,
        }).where(eq(credits.id, input.creditId));
      }
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.delete(creditPayments).where(eq(creditPayments.creditId, input.id));
      await db.delete(credits).where(and(eq(credits.id, input.id), eq(credits.businessId, ctx.user.businessId || 0)));
      return { success: true };
    }),
});

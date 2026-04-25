import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { businessSettings, businesses, branches, users } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const settingsRouter = createRouter({
  getBusiness: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.businesses.findFirst({
      where: eq(businesses.id, ctx.user.businessId || 0),
    });
  }),

  updateBusiness: adminQuery
    .input(z.object({
      name: z.string().optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      rnc: z.string().optional(),
      slogan: z.string().optional(),
      taxRate: z.string().or(z.number()).optional(),
      taxIncluded: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const data: any = { ...input };
      if (data.taxRate !== undefined) data.taxRate = String(data.taxRate);
      await db.update(businesses).set(data).where(eq(businesses.id, ctx.user.businessId || 0));
      return db.query.businesses.findFirst({ where: eq(businesses.id, ctx.user.businessId || 0) });
    }),

  getSettings: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.businessSettings.findFirst({
      where: eq(businessSettings.businessId, ctx.user.businessId || 0),
    });
  }),

  updateSettings: adminQuery
    .input(z.object({
      invoicePrefix: z.string().optional(),
      invoiceNextNumber: z.number().optional(),
      orderPrefix: z.string().optional(),
      orderNextNumber: z.number().optional(),
      purchasePrefix: z.string().optional(),
      purchaseNextNumber: z.number().optional(),
      ticketSize: z.enum(["80mm", "letter"]).optional(),
      creditInterestRate: z.string().or(z.number()).optional(),
      creditGraceDays: z.number().optional(),
      expiryAlertDays: z.number().optional(),
      allowNegativeStock: z.boolean().optional(),
      minDeliveryAmount: z.string().or(z.number()).optional(),
      prepTimeMinutes: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const data: any = { ...input };
      if (data.creditInterestRate !== undefined) data.creditInterestRate = String(data.creditInterestRate);
      if (data.minDeliveryAmount !== undefined) data.minDeliveryAmount = String(data.minDeliveryAmount);
      const existing = await db.query.businessSettings.findFirst({
        where: eq(businessSettings.businessId, ctx.user.businessId || 0),
      });
      if (existing) {
        await db.update(businessSettings).set(data).where(eq(businessSettings.id, existing.id));
      } else {
        await db.insert(businessSettings).values({
          businessId: ctx.user.businessId || 0,
          ...data,
        });
      }
      return db.query.businessSettings.findFirst({
        where: eq(businessSettings.businessId, ctx.user.businessId || 0),
      });
    }),

  getBranches: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.branches.findMany({
      where: eq(branches.businessId, ctx.user.businessId || 0),
      with: { manager: true },
    });
  }),

  getUsers: adminQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.users.findMany({
      where: eq(users.businessId, ctx.user.businessId || 0),
    });
  }),

  updateUser: adminQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      role: z.enum(["admin","manager","seller","cashier","warehouse","accountant","delivery"]).optional(),
      branchId: z.number().optional(),
      commissionRate: z.string().or(z.number()).optional(),
      active: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input as any;
      if (data.commissionRate !== undefined) data.commissionRate = (typeof data.commissionRate === "string" ? parseFloat(data.commissionRate) : data.commissionRate).toFixed(2);
      await db.update(users).set(data).where(and(eq(users.id, id), eq(users.businessId, ctx.user.businessId || 0)));
      return db.query.users.findFirst({ where: eq(users.id, id) });
    }),
});

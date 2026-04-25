import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { orders, orderItems, businessSettings } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const orderRouter = createRouter({
  list: authedQuery
    .input(z.object({
      status: z.enum(["draft","sent","approved","rejected","converted"]).optional(),
      branchId: z.number().optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [eq(orders.businessId, ctx.user.businessId || 0)];
      if (input.status) conditions.push(eq(orders.status, input.status));
      if (input.branchId) conditions.push(eq(orders.branchId, input.branchId));
      return db.query.orders.findMany({
        where: and(...conditions),
        with: { customer: true, user: true, branch: true, items: { with: { product: true } } },
        orderBy: desc(orders.date),
        limit: input.limit,
        offset: (input.page - 1) * input.limit,
      });
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.query.orders.findFirst({
        where: and(eq(orders.id, input.id), eq(orders.businessId, ctx.user.businessId || 0)),
        with: { customer: true, user: true, branch: true, items: { with: { product: true } } },
      });
    }),

  create: authedQuery
    .input(z.object({
      customerId: z.number().optional(),
      branchId: z.number(),
      expiryDate: z.string().optional(),
      notes: z.string().optional(),
      items: z.array(z.object({
        productId: z.number(),
        quantity: z.number().min(1),
        price: z.string().or(z.number()),
        discount: z.string().or(z.number()).optional(),
        tax: z.string().or(z.number()).optional(),
      })).min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const settings = await db.query.businessSettings.findFirst({
        where: eq(businessSettings.businessId, ctx.user.businessId || 0),
      });
      const prefix = settings?.orderPrefix || "COT-";
      const nextNum = (settings?.orderNextNumber || 1);
      const number = `${prefix}${String(nextNum).padStart(6, "0")}`;

      let subtotal = 0, discountTotal = 0, taxTotal = 0;
      for (const item of input.items) {
        const price = typeof item.price === "string" ? parseFloat(item.price) : item.price;
        const disc = item.discount ? (typeof item.discount === "string" ? parseFloat(item.discount) : item.discount) : 0;
        const tax = item.tax ? (typeof item.tax === "string" ? parseFloat(item.tax) : item.tax) : 0;
        const lineSub = price * item.quantity;
        const lineDisc = lineSub * (disc / 100);
        const lineTax = (lineSub - lineDisc) * (tax / 100);
        subtotal += lineSub; discountTotal += lineDisc; taxTotal += lineTax;
      }
      const total = subtotal - discountTotal + taxTotal;

      const [ord] = await db.insert(orders).values({
        businessId: ctx.user.businessId || 0,
        number,
        customerId: input.customerId,
        userId: ctx.user.id,
        branchId: input.branchId,
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
        subtotal: subtotal.toFixed(2),
        discount: discountTotal.toFixed(2),
        tax: taxTotal.toFixed(2),
        total: total.toFixed(2),
        status: "draft",
        notes: input.notes,
      }).$returningId();

      for (const item of input.items) {
        const price = typeof item.price === "string" ? parseFloat(item.price) : item.price;
        const disc = item.discount ? (typeof item.discount === "string" ? parseFloat(item.discount) : item.discount) : 0;
        const tax = item.tax ? (typeof item.tax === "string" ? parseFloat(item.tax) : item.tax) : 0;
        const lineSub = price * item.quantity;
        const lineDisc = lineSub * (disc / 100);
        const lineTax = (lineSub - lineDisc) * (tax / 100);
        const lineTotal = lineSub - lineDisc + lineTax;
        await db.insert(orderItems).values({
          orderId: ord.id,
          productId: item.productId,
          quantity: item.quantity,
          price: price.toFixed(2),
          discount: lineDisc.toFixed(2),
          tax: lineTax.toFixed(2),
          total: lineTotal.toFixed(2),
        });
      }

      if (settings) {
        await db.update(businessSettings).set({ orderNextNumber: nextNum + 1 }).where(eq(businessSettings.id, settings.id));
      }

      return db.query.orders.findFirst({ where: eq(orders.id, ord.id), with: { items: { with: { product: true } } } });
    }),

  updateStatus: authedQuery
    .input(z.object({ id: z.number(), status: z.enum(["draft","sent","approved","rejected","converted"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(orders).set({ status: input.status }).where(
        and(eq(orders.id, input.id), eq(orders.businessId, ctx.user.businessId || 0))
      );
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.delete(orderItems).where(eq(orderItems.orderId, input.id));
      await db.delete(orders).where(and(eq(orders.id, input.id), eq(orders.businessId, ctx.user.businessId || 0)));
      return { success: true };
    }),
});

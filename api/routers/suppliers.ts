import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { suppliers } from "@db/schema";
import { eq, and, sql } from "drizzle-orm";

export const supplierRouter = createRouter({
  list: authedQuery
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [eq(suppliers.businessId, ctx.user.businessId || 0), eq(suppliers.active, true)];
      if (input.search) conditions.push(sql`${suppliers.name} LIKE ${"%" + input.search + "%"}`);
      return db.query.suppliers.findMany({
        where: and(...conditions),
      });
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.query.suppliers.findFirst({
        where: and(eq(suppliers.id, input.id), eq(suppliers.businessId, ctx.user.businessId || 0)),
        with: { products: true },
      });
    }),

  create: adminQuery
    .input(z.object({
      name: z.string().min(1),
      rnc: z.string().optional(),
      contact: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      creditDays: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [row] = await db.insert(suppliers).values({
        businessId: ctx.user.businessId || 0,
        ...input,
      }).$returningId();
      return db.query.suppliers.findFirst({ where: eq(suppliers.id, row.id) });
    }),

  update: adminQuery
    .input(z.object({ id: z.number() }).passthrough())
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(suppliers).set(data).where(and(eq(suppliers.id, id), eq(suppliers.businessId, ctx.user.businessId || 0)));
      return db.query.suppliers.findFirst({ where: eq(suppliers.id, id) });
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(suppliers).set({ active: false }).where(and(eq(suppliers.id, input.id), eq(suppliers.businessId, ctx.user.businessId || 0)));
      return { success: true };
    }),
});

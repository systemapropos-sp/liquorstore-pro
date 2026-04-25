import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { branches } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const branchRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const user = ctx.user;
    return db.query.branches.findMany({
      where: and(
        eq(branches.businessId, user.businessId || 0),
        eq(branches.active, true)
      ),
      with: { manager: true },
    });
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.query.branches.findFirst({
        where: and(
          eq(branches.id, input.id),
          eq(branches.businessId, ctx.user.businessId || 0)
        ),
        with: { manager: true },
      });
    }),

  create: adminQuery
    .input(z.object({
      name: z.string().min(1),
      address: z.string().optional(),
      phone: z.string().optional(),
      city: z.string().optional(),
      isWarehouse: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [row] = await db.insert(branches).values({
        businessId: ctx.user.businessId || 0,
        ...input,
        active: true,
      }).$returningId();
      return db.query.branches.findFirst({ where: eq(branches.id, row.id) });
    }),

  update: adminQuery
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      city: z.string().optional(),
      isWarehouse: z.boolean().optional(),
      active: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(branches).set(data).where(
        and(eq(branches.id, id), eq(branches.businessId, ctx.user.businessId || 0))
      );
      return db.query.branches.findFirst({ where: eq(branches.id, id) });
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(branches).set({ active: false }).where(
        and(eq(branches.id, input.id), eq(branches.businessId, ctx.user.businessId || 0))
      );
      return { success: true };
    }),
});

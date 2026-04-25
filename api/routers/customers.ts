import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { customers, customerAddresses } from "@db/schema";
import { eq, and, sql } from "drizzle-orm";

export const customerRouter = createRouter({
  list: authedQuery
    .input(z.object({
      search: z.string().optional(),
      type: z.enum(["cash", "credit"]).optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [eq(customers.businessId, ctx.user.businessId || 0), eq(customers.active, true)];
      if (input.search) conditions.push(sql`(${customers.name} LIKE ${"%" + input.search + "%"} OR ${customers.phone} LIKE ${"%" + input.search + "%"} OR ${customers.idNumber} LIKE ${"%" + input.search + "%"})`);
      if (input.type) conditions.push(eq(customers.type, input.type));
      return db.query.customers.findMany({
        where: and(...conditions),
        limit: input.limit,
        offset: (input.page - 1) * input.limit,
      });
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.query.customers.findFirst({
        where: and(eq(customers.id, input.id), eq(customers.businessId, ctx.user.businessId || 0)),
        with: { addresses: true },
      });
    }),

  create: authedQuery
    .input(z.object({
      name: z.string().min(1),
      idNumber: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      birthDate: z.string().optional(),
      creditLimit: z.string().or(z.number()).optional(),
      type: z.enum(["cash", "credit"]).default("cash"),
      tags: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const data: any = { ...input };
      if (data.creditLimit !== undefined) data.creditLimit = (typeof data.creditLimit === "string" ? parseFloat(data.creditLimit) : data.creditLimit).toFixed(2);
      if (data.birthDate) data.birthDate = new Date(data.birthDate);
      const [row] = await db.insert(customers).values({
        businessId: ctx.user.businessId || 0,
        ...data,
      }).$returningId();
      return db.query.customers.findFirst({ where: eq(customers.id, row.id) });
    }),

  update: authedQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      idNumber: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      birthDate: z.string().optional(),
      creditLimit: z.string().or(z.number()).optional(),
      type: z.enum(["cash", "credit"]).optional(),
      tags: z.string().optional(),
      active: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input as any;
      if (data.creditLimit !== undefined) data.creditLimit = (typeof data.creditLimit === "string" ? parseFloat(data.creditLimit) : data.creditLimit).toFixed(2);
      if (data.birthDate) data.birthDate = new Date(data.birthDate);
      await db.update(customers).set(data).where(and(eq(customers.id, id), eq(customers.businessId, ctx.user.businessId || 0)));
      return db.query.customers.findFirst({ where: eq(customers.id, id) });
    }),

  addAddress: authedQuery
    .input(z.object({
      customerId: z.number(),
      label: z.string().default("Casa"),
      address: z.string().min(1),
      references: z.string().optional(),
      isDefault: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [row] = await db.insert(customerAddresses).values(input).$returningId();
      return db.query.customerAddresses.findFirst({ where: eq(customerAddresses.id, row.id) });
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(customers).set({ active: false }).where(and(eq(customers.id, input.id), eq(customers.businessId, ctx.user.businessId || 0)));
      return { success: true };
    }),
});

import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { categories, products, productBatches, inventory, inventoryMovements } from "@db/schema";
import { eq, and, sql } from "drizzle-orm";

export const productRouter = createRouter({
  listCategories: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.categories.findMany({
      where: and(eq(categories.businessId, ctx.user.businessId || 0), eq(categories.active, true)),
    });
  }),

  createCategory: adminQuery
    .input(z.object({ name: z.string().min(1), type: z.enum(["beer","rum","wine","whisky","vodka","tequila","other"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [row] = await db.insert(categories).values({
        businessId: ctx.user.businessId || 0,
        ...input,
      }).$returningId();
      return db.query.categories.findFirst({ where: eq(categories.id, row.id) });
    }),

  list: authedQuery
    .input(z.object({
      search: z.string().optional(),
      categoryId: z.number().optional(),
      branchId: z.number().optional(),
      lowStock: z.boolean().optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const whereConditions = [eq(products.businessId, ctx.user.businessId || 0), eq(products.active, true)];
      if (input.search) whereConditions.push(sql`${products.name} LIKE ${"%" + input.search + "%"}`);
      if (input.categoryId) whereConditions.push(eq(products.categoryId, input.categoryId));

      const items = await db.query.products.findMany({
        where: and(...whereConditions),
        with: { category: true, batches: { with: { branch: true } }, inventory: { with: { branch: true } } },
        limit: input.limit,
        offset: (input.page - 1) * input.limit,
      });

      return items;
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.query.products.findFirst({
        where: and(eq(products.id, input.id), eq(products.businessId, ctx.user.businessId || 0)),
        with: { category: true, batches: { with: { branch: true } }, inventory: { with: { branch: true } } },
      });
    }),

  create: adminQuery
    .input(z.object({
      code: z.string().min(1),
      name: z.string().min(1),
      description: z.string().optional(),
      categoryId: z.number().optional(),
      subcategory: z.string().optional(),
      cost: z.string().or(z.number()),
      price: z.string().or(z.number()),
      unit: z.string().default("bottle"),
      barcode: z.string().optional(),
      minStock: z.number().default(0),
      maxStock: z.number().optional(),
      supplierId: z.number().optional(),
      location: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const cost = typeof input.cost === "string" ? parseFloat(input.cost) : input.cost;
      const price = typeof input.price === "string" ? parseFloat(input.price) : input.price;
      const margin = cost > 0 ? ((price - cost) / cost) * 100 : 0;
      const [row] = await db.insert(products).values({
        businessId: ctx.user.businessId || 0,
        ...input,
        cost: cost.toFixed(2),
        price: price.toFixed(2),
        margin: margin.toFixed(2),
      }).$returningId();
      return db.query.products.findFirst({ where: eq(products.id, row.id), with: { category: true } });
    }),

  update: adminQuery
    .input(z.object({
      id: z.number(),
      code: z.string().optional(),
      name: z.string().optional(),
      description: z.string().optional(),
      categoryId: z.number().optional(),
      subcategory: z.string().optional(),
      cost: z.string().or(z.number()).optional(),
      price: z.string().or(z.number()).optional(),
      unit: z.string().optional(),
      barcode: z.string().optional(),
      minStock: z.number().optional(),
      maxStock: z.number().optional(),
      supplierId: z.number().optional(),
      location: z.string().optional(),
      active: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.cost !== undefined || data.price !== undefined) {
        const existing = await db.query.products.findFirst({ where: eq(products.id, id) });
        const cost = data.cost !== undefined ? (typeof data.cost === "string" ? parseFloat(data.cost) : data.cost) : parseFloat(existing?.cost || "0");
        const price = data.price !== undefined ? (typeof data.price === "string" ? parseFloat(data.price) : data.price) : parseFloat(existing?.price || "0");
        if (cost > 0) updateData.margin = ((price - cost) / cost * 100).toFixed(2);
      }
      await db.update(products).set(updateData).where(and(eq(products.id, id), eq(products.businessId, ctx.user.businessId || 0)));
      return db.query.products.findFirst({ where: eq(products.id, id) });
    }),

  createBatch: adminQuery
    .input(z.object({
      productId: z.number(),
      batchNumber: z.string().min(1),
      manufactureDate: z.string().optional(),
      expiryDate: z.string(),
      quantity: z.number(),
      cost: z.string().or(z.number()),
      branchId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const cost = typeof input.cost === "string" ? parseFloat(input.cost) : input.cost;
      const [row] = await db.insert(productBatches).values({
        productId: input.productId,
        batchNumber: input.batchNumber,
        manufactureDate: input.manufactureDate ? new Date(input.manufactureDate) : null,
        expiryDate: new Date(input.expiryDate),
        quantity: input.quantity,
        cost: cost.toFixed(2),
        branchId: input.branchId,
        status: "active",
      }).$returningId();
      await db.insert(inventory).values({
        productId: input.productId,
        branchId: input.branchId,
        batchId: row.id,
        quantity: input.quantity,
      });
      await db.insert(inventoryMovements).values({
        productId: input.productId,
        branchId: input.branchId,
        batchId: row.id,
        type: "in",
        quantity: input.quantity,
        reason: "Nuevo lote ingresado",
        userId: ctx.user.id,
        date: new Date(),
        businessId: ctx.user.businessId || 0,
      });
      return db.query.productBatches.findFirst({ where: eq(productBatches.id, row.id) });
    }),

  deleteBatch: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(productBatches).set({ status: "sold_out" }).where(eq(productBatches.id, input.id));
      return { success: true };
    }),

  stockByBranch: authedQuery.query(async () => {
    const db = getDb();
    const rows = await db.select({
      branchId: inventory.branchId,
      productId: inventory.productId,
      quantity: sql<number>`SUM(${inventory.quantity})`,
    }).from(inventory).groupBy(inventory.branchId, inventory.productId);
    return rows;
  }),
});

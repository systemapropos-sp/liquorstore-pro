import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { invoices, invoiceItems, products, purchases, categories, deliveries, inventory } from "@db/schema";
import { eq, and, sql, gte, lte } from "drizzle-orm";

export const reportRouter = createRouter({
  salesReport: authedQuery
    .input(z.object({
      fromDate: z.string(),
      toDate: z.string(),
      branchId: z.number().optional(),
      groupBy: z.enum(["day","product","category","payment_method","seller","customer"]).default("day"),
    }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const fromDate = new Date(input.fromDate);
      const toDate = new Date(input.toDate);
      const conditions = [
        eq(invoices.businessId, ctx.user.businessId || 0),
        gte(invoices.date, fromDate),
        lte(invoices.date, toDate),
      ];
      if (input.branchId) conditions.push(eq(invoices.branchId, input.branchId));

      if (input.groupBy === "day") {
        return db.select({
          label: sql<string>`DATE(${invoices.date})`,
          total: sql<string>`SUM(${invoices.total})`,
          count: sql<number>`COUNT(*)`,
        }).from(invoices).where(and(...conditions)).groupBy(sql`DATE(${invoices.date})`).orderBy(sql`DATE(${invoices.date})`);
      }
      if (input.groupBy === "product") {
        return db.select({
          label: products.name,
          total: sql<string>`SUM(${invoiceItems.total})`,
          count: sql<number>`SUM(${invoiceItems.quantity})`,
        }).from(invoiceItems)
          .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
          .innerJoin(products, eq(invoiceItems.productId, products.id))
          .where(and(...conditions)).groupBy(invoiceItems.productId).orderBy(sql`SUM(${invoiceItems.total}) DESC`);
      }
      if (input.groupBy === "category") {
        return db.select({
          label: categories.name,
          total: sql<string>`SUM(${invoiceItems.total})`,
          count: sql<number>`SUM(${invoiceItems.quantity})`,
        }).from(invoiceItems)
          .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
          .innerJoin(products, eq(invoiceItems.productId, products.id))
          .innerJoin(categories, eq(products.categoryId, categories.id))
          .where(and(...conditions)).groupBy(categories.id).orderBy(sql`SUM(${invoiceItems.total}) DESC`);
      }
      return db.select({ total: sql<string>`SUM(${invoices.total})`, count: sql<number>`COUNT(*)` }).from(invoices).where(and(...conditions));
    }),

  inventoryReport: authedQuery
    .input(z.object({
      branchId: z.number().optional(),
      categoryId: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [eq(products.businessId, ctx.user.businessId || 0), eq(products.active, true)];
      if (input.categoryId) conditions.push(eq(products.categoryId, input.categoryId));

      const items = await db.select({
        productId: products.id,
        name: products.name,
        code: products.code,
        category: categories.name,
        cost: products.cost,
        price: products.price,
        totalQty: sql<number>`COALESCE(SUM(${inventory.quantity}), 0)`,
        totalValue: sql<string>`COALESCE(SUM(${inventory.quantity} * ${products.cost}), 0)`,
      }).from(products)
        .leftJoin(inventory, eq(products.id, inventory.productId))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(and(...conditions))
        .groupBy(products.id)
        .orderBy(products.name);

      return items;
    }),

  deliveryReport: authedQuery
    .input(z.object({
      fromDate: z.string(),
      toDate: z.string(),
      groupBy: z.enum(["day","repartidor","zone","status"]).default("day"),
    }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const fromDate = new Date(input.fromDate);
      const toDate = new Date(input.toDate);
      const conditions = [
        eq(deliveries.businessId, ctx.user.businessId || 0),
        gte(deliveries.createdAt, fromDate),
        lte(deliveries.createdAt, toDate),
      ];

      if (input.groupBy === "day") {
        return db.select({
          label: sql<string>`DATE(${deliveries.createdAt})`,
          total: sql<string>`COUNT(*)`,
          delivered: sql<number>`SUM(CASE WHEN ${deliveries.status} = 'delivered' THEN 1 ELSE 0 END)`,
        }).from(deliveries).where(and(...conditions)).groupBy(sql`DATE(${deliveries.createdAt})`).orderBy(sql`DATE(${deliveries.createdAt})`);
      }
      if (input.groupBy === "status") {
        return db.select({
          label: deliveries.status,
          total: sql<number>`COUNT(*)`,
        }).from(deliveries).where(and(...conditions)).groupBy(deliveries.status).orderBy(sql`COUNT(*) DESC`);
      }
      return db.select({ total: sql<number>`COUNT(*)` }).from(deliveries).where(and(...conditions));
    }),

  financialReport: authedQuery
    .input(z.object({
      fromDate: z.string(),
      toDate: z.string(),
      branchId: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const fromDate = new Date(input.fromDate);
      const toDate = new Date(input.toDate);
      const conditions = [
        eq(invoices.businessId, ctx.user.businessId || 0),
        eq(invoices.status, "paid"),
        gte(invoices.date, fromDate),
        lte(invoices.date, toDate),
      ];
      const purchaseConditions = [
        eq(purchases.businessId, ctx.user.businessId || 0),
        gte(purchases.date, fromDate),
        lte(purchases.date, toDate),
      ];
      if (input.branchId) {
        conditions.push(eq(invoices.branchId, input.branchId));
        purchaseConditions.push(eq(purchases.branchId, input.branchId));
      }

      const sales = await db.select({ total: sql<string>`COALESCE(SUM(${invoices.total}), 0)`, cost: sql<string>`COALESCE(SUM(${invoices.subtotal} - ${invoices.discount}), 0)` })
        .from(invoices).where(and(...conditions));
      const purchaseTotal = await db.select({ total: sql<string>`COALESCE(SUM(${purchases.total}), 0)` })
        .from(purchases).where(and(...purchaseConditions));

      return {
        sales: parseFloat(sales[0]?.total || "0"),
        purchases: parseFloat(purchaseTotal[0]?.total || "0"),
        grossProfit: parseFloat(sales[0]?.total || "0") - parseFloat(purchaseTotal[0]?.total || "0"),
      };
    }),
});

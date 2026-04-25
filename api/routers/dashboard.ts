import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { invoices, invoiceItems, products, productBatches, categories, deliveries, credits, customers, inventory } from "@db/schema";
import { eq, and, sql, gte, lte } from "drizzle-orm";

export const dashboardRouter = createRouter({
  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const businessId = ctx.user.businessId || 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1);

    const todayInvoices = await db.select({ total: sql<string>`COALESCE(SUM(${invoices.total}), 0)` })
      .from(invoices)
      .where(and(eq(invoices.businessId, businessId), eq(invoices.status, "paid"), gte(invoices.date, today)));

    const weekInvoices = await db.select({ total: sql<string>`COALESCE(SUM(${invoices.total}), 0)` })
      .from(invoices)
      .where(and(eq(invoices.businessId, businessId), eq(invoices.status, "paid"), gte(invoices.date, weekAgo)));

    const monthInvoices = await db.select({ total: sql<string>`COALESCE(SUM(${invoices.total}), 0)` })
      .from(invoices)
      .where(and(eq(invoices.businessId, businessId), eq(invoices.status, "paid"), gte(invoices.date, monthAgo)));

    const pendingCredits = await db.select({ total: sql<string>`COALESCE(SUM(${credits.balance}), 0)`, count: sql<number>`COUNT(*)` })
      .from(credits)
      .where(and(eq(credits.businessId, businessId), eq(credits.status, "current")));

    const pendingDeliveries = await db.select({ count: sql<number>`COUNT(*)` })
      .from(deliveries)
      .where(and(eq(deliveries.businessId, businessId), sql`${deliveries.status} IN ('received','preparing','ready','shipping')`));

    const lowStock = await db.select({ count: sql<number>`COUNT(*)` })
      .from(inventory)
      .innerJoin(products, eq(inventory.productId, products.id))
      .where(and(eq(products.businessId, businessId), eq(products.active, true), sql`${inventory.quantity} <= ${products.minStock}`));

    const newCustomers = await db.select({ count: sql<number>`COUNT(*)` })
      .from(customers)
      .where(and(eq(customers.businessId, businessId), gte(customers.createdAt, monthAgo)));

    const topProducts = await db.select({
      productId: invoiceItems.productId,
      productName: products.name,
      totalQty: sql<number>`SUM(${invoiceItems.quantity})`,
      totalSales: sql<string>`SUM(${invoiceItems.total})`,
    }).from(invoiceItems)
      .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
      .innerJoin(products, eq(invoiceItems.productId, products.id))
      .where(and(eq(invoices.businessId, businessId), eq(invoices.status, "paid"), gte(invoices.date, monthAgo)))
      .groupBy(invoiceItems.productId)
      .orderBy(sql`SUM(${invoiceItems.quantity}) DESC`)
      .limit(5);

    const thirtyDaysAgo = new Date(today); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailySales = await db.select({
      date: sql<string>`DATE(${invoices.date})`,
      total: sql<string>`SUM(${invoices.total})`,
    }).from(invoices)
      .where(and(eq(invoices.businessId, businessId), eq(invoices.status, "paid"), gte(invoices.date, thirtyDaysAgo)))
      .groupBy(sql`DATE(${invoices.date})`)
      .orderBy(sql`DATE(${invoices.date})`);

    const salesByCategory = await db.select({
      category: categories.name,
      total: sql<string>`SUM(${invoiceItems.total})`,
    }).from(invoiceItems)
      .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
      .innerJoin(products, eq(invoiceItems.productId, products.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(invoices.businessId, businessId), eq(invoices.status, "paid"), gte(invoices.date, monthAgo)))
      .groupBy(categories.id)
      .orderBy(sql`SUM(${invoiceItems.total}) DESC`);

    const nearExpiry = await db.select({ count: sql<number>`COUNT(*)` })
      .from(productBatches)
      .where(and(
        eq(productBatches.status, "active"),
        gte(productBatches.expiryDate, today),
        lte(productBatches.expiryDate, new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000))
      ));

    return {
      salesToday: parseFloat(todayInvoices[0]?.total || "0"),
      salesWeek: parseFloat(weekInvoices[0]?.total || "0"),
      salesMonth: parseFloat(monthInvoices[0]?.total || "0"),
      pendingCreditsAmount: parseFloat(pendingCredits[0]?.total || "0"),
      pendingCreditsCount: Number(pendingCredits[0]?.count || 0),
      pendingDeliveries: Number(pendingDeliveries[0]?.count || 0),
      lowStockCount: Number(lowStock[0]?.count || 0),
      newCustomers: Number(newCustomers[0]?.count || 0),
      topProducts,
      dailySales,
      salesByCategory,
      nearExpiry: Number(nearExpiry[0]?.count || 0),
    };
  }),

  recentActivity: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const recentInvoices = await db.query.invoices.findMany({
      where: and(eq(invoices.businessId, ctx.user.businessId || 0), eq(invoices.status, "paid")),
      with: { customer: true, user: true },
      orderBy: [sql`${invoices.date} DESC`],
      limit: 10,
    });
    return recentInvoices;
  }),
});

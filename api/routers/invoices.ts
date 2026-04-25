import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { invoices, invoiceItems, inventory, productBatches, inventoryMovements, customers, businessSettings } from "@db/schema";
import { eq, and, sql, desc, gte, lte } from "drizzle-orm";

export const invoiceRouter = createRouter({
  list: authedQuery
    .input(z.object({
      search: z.string().optional(),
      status: z.enum(["paid", "pending", "cancelled"]).optional(),
      branchId: z.number().optional(),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [eq(invoices.businessId, ctx.user.businessId || 0)];
      if (input.status) conditions.push(eq(invoices.status, input.status));
      if (input.branchId) conditions.push(eq(invoices.branchId, input.branchId));
      if (input.fromDate) conditions.push(gte(invoices.date, new Date(input.fromDate)));
      if (input.toDate) conditions.push(lte(invoices.date, new Date(input.toDate)));
      if (input.search) conditions.push(sql`${invoices.number} LIKE ${"%" + input.search + "%"}`);

      const items = await db.query.invoices.findMany({
        where: and(...conditions),
        with: { customer: true, user: true, branch: true, items: { with: { product: true } } },
        orderBy: desc(invoices.date),
        limit: input.limit,
        offset: (input.page - 1) * input.limit,
      });
      return items;
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.query.invoices.findFirst({
        where: and(eq(invoices.id, input.id), eq(invoices.businessId, ctx.user.businessId || 0)),
        with: { customer: true, user: true, branch: true, items: { with: { product: true } } },
      });
    }),

  create: authedQuery
    .input(z.object({
      customerId: z.number().optional(),
      branchId: z.number(),
      dueDate: z.string().optional(),
      paymentMethod: z.enum(["cash", "card", "transfer", "mixed", "credit"]).default("cash"),
      status: z.enum(["paid", "pending", "cancelled"]).default("paid"),
      notes: z.string().optional(),
      isDelivery: z.boolean().default(false),
      items: z.array(z.object({
        productId: z.number(),
        batchId: z.number().optional(),
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
      const prefix = settings?.invoicePrefix || "A-";
      const nextNum = (settings?.invoiceNextNumber || 1);
      const number = `${prefix}${String(nextNum).padStart(6, "0")}`;

      let subtotal = 0;
      let discountTotal = 0;
      let taxTotal = 0;

      for (const item of input.items) {
        const price = typeof item.price === "string" ? parseFloat(item.price) : item.price;
        const discount = item.discount ? (typeof item.discount === "string" ? parseFloat(item.discount) : item.discount) : 0;
        const tax = item.tax ? (typeof item.tax === "string" ? parseFloat(item.tax) : item.tax) : 0;
        const lineSub = price * item.quantity;
        const lineDisc = lineSub * (discount / 100);
        const lineTax = (lineSub - lineDisc) * (tax / 100);
        subtotal += lineSub;
        discountTotal += lineDisc;
        taxTotal += lineTax;
      }

      const total = subtotal - discountTotal + taxTotal;

      const [inv] = await db.insert(invoices).values({
        businessId: ctx.user.businessId || 0,
        number,
        customerId: input.customerId,
        userId: ctx.user.id,
        branchId: input.branchId,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        subtotal: subtotal.toFixed(2),
        discount: discountTotal.toFixed(2),
        tax: taxTotal.toFixed(2),
        total: total.toFixed(2),
        paymentMethod: input.paymentMethod,
        status: input.status,
        notes: input.notes,
        isDelivery: input.isDelivery,
      }).$returningId();

      for (const item of input.items) {
        const price = typeof item.price === "string" ? parseFloat(item.price) : item.price;
        const discount = item.discount ? (typeof item.discount === "string" ? parseFloat(item.discount) : item.discount) : 0;
        const tax = item.tax ? (typeof item.tax === "string" ? parseFloat(item.tax) : item.tax) : 0;
        const lineSub = price * item.quantity;
        const lineDisc = lineSub * (discount / 100);
        const lineTax = (lineSub - lineDisc) * (tax / 100);
        const lineTotal = lineSub - lineDisc + lineTax;

        await db.insert(invoiceItems).values({
          invoiceId: inv.id,
          productId: item.productId,
          batchId: item.batchId,
          quantity: item.quantity,
          price: price.toFixed(2),
          discount: lineDisc.toFixed(2),
          tax: lineTax.toFixed(2),
          total: lineTotal.toFixed(2),
        });

        if (item.batchId) {
          const invItem = await db.query.inventory.findFirst({
            where: and(eq(inventory.productId, item.productId), eq(inventory.batchId, item.batchId)),
          });
          if (invItem) {
            await db.update(inventory).set({ quantity: invItem.quantity - item.quantity }).where(eq(inventory.id, invItem.id));
          }
          const batch = await db.query.productBatches.findFirst({ where: eq(productBatches.id, item.batchId) });
          if (batch) {
            await db.update(productBatches).set({ quantity: batch.quantity - item.quantity }).where(eq(productBatches.id, item.batchId));
          }
        }

        await db.insert(inventoryMovements).values({
          productId: item.productId,
          branchId: input.branchId,
          batchId: item.batchId,
          type: "out",
          quantity: item.quantity,
          reason: `Venta factura ${number}`,
          referenceId: String(inv.id),
          userId: ctx.user.id,
          date: new Date(),
          businessId: ctx.user.businessId || 0,
        });
      }

      if (input.customerId) {
        const customer = await db.query.customers.findFirst({ where: eq(customers.id, input.customerId) });
        if (customer) {
          await db.update(customers).set({
            totalPurchased: (parseFloat(customer.totalPurchased || "0") + total).toFixed(2),
            lastPurchaseDate: new Date(),
          }).where(eq(customers.id, input.customerId));
        }
      }

      if (settings) {
        await db.update(businessSettings).set({ invoiceNextNumber: nextNum + 1 }).where(eq(businessSettings.id, settings.id));
      }

      return db.query.invoices.findFirst({
        where: eq(invoices.id, inv.id),
        with: { customer: true, items: { with: { product: true } } },
      });
    }),

  cancel: adminQuery
    .input(z.object({ id: z.number(), reason: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(invoices).set({ status: "cancelled", notes: input.reason }).where(
        and(eq(invoices.id, input.id), eq(invoices.businessId, ctx.user.businessId || 0))
      );
      return { success: true };
    }),
});

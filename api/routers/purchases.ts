import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { purchases, purchaseItems, accountsPayable, productBatches, inventory, inventoryMovements, businessSettings } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const purchaseRouter = createRouter({
  list: authedQuery
    .input(z.object({
      supplierId: z.number().optional(),
      status: z.enum(["paid","pending"]).optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [eq(purchases.businessId, ctx.user.businessId || 0)];
      if (input.supplierId) conditions.push(eq(purchases.supplierId, input.supplierId));
      if (input.status) conditions.push(eq(purchases.status, input.status));
      return db.query.purchases.findMany({
        where: and(...conditions),
        with: { supplier: true, branch: true, items: { with: { product: true } } },
        orderBy: desc(purchases.date),
        limit: input.limit,
        offset: (input.page - 1) * input.limit,
      });
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.query.purchases.findFirst({
        where: and(eq(purchases.id, input.id), eq(purchases.businessId, ctx.user.businessId || 0)),
        with: { supplier: true, branch: true, items: { with: { product: true } } },
      });
    }),

  create: adminQuery
    .input(z.object({
      supplierId: z.number(),
      branchId: z.number(),
      invoiceNumber: z.string().optional(),
      paymentMethod: z.enum(["cash","credit"]).default("cash"),
      dueDate: z.string().optional(),
      photoUrl: z.string().optional(),
      notes: z.string().optional(),
      items: z.array(z.object({
        productId: z.number(),
        quantity: z.number().min(1),
        cost: z.string().or(z.number()),
        discount: z.string().or(z.number()).optional(),
        expiryDate: z.string().optional(),
      })).min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const settings = await db.query.businessSettings.findFirst({ where: eq(businessSettings.businessId, ctx.user.businessId || 0) });
      const prefix = settings?.purchasePrefix || "COM-";
      const nextNum = settings?.purchaseNextNumber || 1;
      const number = `${prefix}${String(nextNum).padStart(6, "0")}`;

      let subtotal = 0, discountTotal = 0;
      for (const item of input.items) {
        const cost = typeof item.cost === "string" ? parseFloat(item.cost) : item.cost;
        const disc = item.discount ? (typeof item.discount === "string" ? parseFloat(item.discount) : item.discount) : 0;
        const lineSub = cost * item.quantity;
        const lineDisc = lineSub * (disc / 100);
        subtotal += lineSub; discountTotal += lineDisc;
      }
      const taxRate = 18;
      const taxable = subtotal - discountTotal;
      const tax = taxable * (taxRate / 100);
      const total = taxable + tax;

      const [pur] = await db.insert(purchases).values({
        businessId: ctx.user.businessId || 0,
        supplierId: input.supplierId,
        branchId: input.branchId,
        invoiceNumber: input.invoiceNumber || number,
        subtotal: subtotal.toFixed(2),
        discount: discountTotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        paymentMethod: input.paymentMethod,
        status: input.paymentMethod === "cash" ? "paid" : "pending",
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        photoUrl: input.photoUrl,
        notes: input.notes,
      }).$returningId();

      for (const item of input.items) {
        const cost = typeof item.cost === "string" ? parseFloat(item.cost) : item.cost;
        const disc = item.discount ? (typeof item.discount === "string" ? parseFloat(item.discount) : item.discount) : 0;
        const lineSub = cost * item.quantity;
        const lineDisc = lineSub * (disc / 100);
        const lineTotal = lineSub - lineDisc;

        let batchId: number | undefined;
        if (item.expiryDate) {
          const [batch] = await db.insert(productBatches).values({
            productId: item.productId,
            batchNumber: `L${pur.id}-${item.productId}`,
            expiryDate: new Date(item.expiryDate),
            quantity: item.quantity,
            cost: cost.toFixed(2),
            branchId: input.branchId,
            status: "active",
          }).$returningId();
          batchId = batch.id;
        }

        await db.insert(purchaseItems).values({
          purchaseId: pur.id,
          productId: item.productId,
          batchId,
          quantity: item.quantity,
          cost: cost.toFixed(2),
          discount: lineDisc.toFixed(2),
          total: lineTotal.toFixed(2),
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
        });

        const existingInv = await db.query.inventory.findFirst({
          where: and(eq(inventory.productId, item.productId), eq(inventory.branchId, input.branchId), batchId ? eq(inventory.batchId, batchId) : undefined),
        });
        if (existingInv) {
          await db.update(inventory).set({ quantity: existingInv.quantity + item.quantity }).where(eq(inventory.id, existingInv.id));
        } else {
          await db.insert(inventory).values({
            productId: item.productId,
            branchId: input.branchId,
            batchId,
            quantity: item.quantity,
          });
        }

        await db.insert(inventoryMovements).values({
          productId: item.productId,
          branchId: input.branchId,
          batchId,
          type: "in",
          quantity: item.quantity,
          reason: `Compra ${number}`,
          referenceId: String(pur.id),
          userId: ctx.user.id,
          date: new Date(),
          businessId: ctx.user.businessId || 0,
        });
      }

      if (input.paymentMethod === "credit") {
        await db.insert(accountsPayable).values({
          supplierId: input.supplierId,
          purchaseId: pur.id,
          totalAmount: total.toFixed(2),
          balance: total.toFixed(2),
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          status: "pending",
          businessId: ctx.user.businessId || 0,
        });
      }

      if (settings) {
        await db.update(businessSettings).set({ purchaseNextNumber: nextNum + 1 }).where(eq(businessSettings.id, settings.id));
      }

      return db.query.purchases.findFirst({ where: eq(purchases.id, pur.id), with: { items: { with: { product: true } } } });
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.delete(purchaseItems).where(eq(purchaseItems.purchaseId, input.id));
      await db.delete(accountsPayable).where(eq(accountsPayable.purchaseId, input.id));
      await db.delete(purchases).where(and(eq(purchases.id, input.id), eq(purchases.businessId, ctx.user.businessId || 0)));
      return { success: true };
    }),
});

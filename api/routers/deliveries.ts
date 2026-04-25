import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { deliveries, deliveryZones } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const deliveryRouter = createRouter({
  listZones: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.deliveryZones.findMany({
      where: and(eq(deliveryZones.businessId, ctx.user.businessId || 0), eq(deliveryZones.active, true)),
    });
  }),

  createZone: adminQuery
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      deliveryCost: z.string().or(z.number()).default("0"),
      color: z.string().default("#E30A17"),
      minOrderFree: z.string().or(z.number()).default("0"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const cost = typeof input.deliveryCost === "string" ? parseFloat(input.deliveryCost) : input.deliveryCost;
      const minFree = typeof input.minOrderFree === "string" ? parseFloat(input.minOrderFree) : input.minOrderFree;
      const [row] = await db.insert(deliveryZones).values({
        businessId: ctx.user.businessId || 0,
        name: input.name,
        description: input.description,
        deliveryCost: cost.toFixed(2),
        color: input.color,
        minOrderFree: minFree.toFixed(2),
      }).$returningId();
      return db.query.deliveryZones.findFirst({ where: eq(deliveryZones.id, row.id) });
    }),

  list: authedQuery
    .input(z.object({
      status: z.enum(["received","preparing","ready","shipping","delivered","cancelled"]).optional(),
      assignedTo: z.number().optional(),
      branchId: z.number().optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [eq(deliveries.businessId, ctx.user.businessId || 0)];
      if (input.status) conditions.push(eq(deliveries.status, input.status));
      if (input.assignedTo) conditions.push(eq(deliveries.assignedTo, input.assignedTo));
      if (input.branchId) conditions.push(eq(deliveries.branchId, input.branchId));
      return db.query.deliveries.findMany({
        where: and(...conditions),
        with: { customer: true, invoice: true, zone: true, assignedToUser: true },
        orderBy: desc(deliveries.createdAt),
        limit: input.limit,
        offset: (input.page - 1) * input.limit,
      });
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.query.deliveries.findFirst({
        where: and(eq(deliveries.id, input.id), eq(deliveries.businessId, ctx.user.businessId || 0)),
        with: { customer: true, invoice: true, zone: true, assignedToUser: true },
      });
    }),

  create: authedQuery
    .input(z.object({
      invoiceId: z.number().optional(),
      customerId: z.number().optional(),
      customerName: z.string().min(1),
      customerPhone: z.string().optional(),
      address: z.string().min(1),
      references: z.string().optional(),
      coordinatesLat: z.string().or(z.number()).optional(),
      coordinatesLng: z.string().or(z.number()).optional(),
      zoneId: z.number().optional(),
      deliveryCost: z.string().or(z.number()).default("0"),
      paymentMethod: z.enum(["cash","card","online"]).default("cash"),
      notes: z.string().optional(),
      branchId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const cost = typeof input.deliveryCost === "string" ? parseFloat(input.deliveryCost) : input.deliveryCost;
      const [row] = await db.insert(deliveries).values({
        businessId: ctx.user.businessId || 0,
        invoiceId: input.invoiceId,
        customerId: input.customerId,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        address: input.address,
        references: input.references,
        coordinatesLat: input.coordinatesLat ? String(input.coordinatesLat) : null,
        coordinatesLng: input.coordinatesLng ? String(input.coordinatesLng) : null,
        zoneId: input.zoneId,
        deliveryCost: cost.toFixed(2),
        paymentMethod: input.paymentMethod,
        status: "received",
        notes: input.notes,
        branchId: input.branchId,
      }).$returningId();
      return db.query.deliveries.findFirst({ where: eq(deliveries.id, row.id), with: { customer: true, zone: true } });
    }),

  updateStatus: authedQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["received","preparing","ready","shipping","delivered","cancelled"]),
      assignedTo: z.number().optional(),
      deliveryPhotoUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const updateData: any = { status: input.status };
      if (input.assignedTo !== undefined) updateData.assignedTo = input.assignedTo;
      if (input.deliveryPhotoUrl !== undefined) updateData.deliveryPhotoUrl = input.deliveryPhotoUrl;
      if (input.status === "delivered") updateData.deliveredAt = new Date();
      await db.update(deliveries).set(updateData).where(
        and(eq(deliveries.id, input.id), eq(deliveries.businessId, ctx.user.businessId || 0))
      );
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.delete(deliveries).where(and(eq(deliveries.id, input.id), eq(deliveries.businessId, ctx.user.businessId || 0)));
      return { success: true };
    }),
});

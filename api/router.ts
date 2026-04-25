import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { branchRouter } from "./routers/branches";
import { productRouter } from "./routers/products";
import { customerRouter } from "./routers/customers";
import { supplierRouter } from "./routers/suppliers";
import { invoiceRouter } from "./routers/invoices";
import { orderRouter } from "./routers/orders";
import { creditRouter } from "./routers/credits";
import { purchaseRouter } from "./routers/purchases";
import { deliveryRouter } from "./routers/deliveries";
import { dashboardRouter } from "./routers/dashboard";
import { reportRouter } from "./routers/reports";
import { settingsRouter } from "./routers/settings";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  branch: branchRouter,
  product: productRouter,
  customer: customerRouter,
  supplier: supplierRouter,
  invoice: invoiceRouter,
  order: orderRouter,
  credit: creditRouter,
  purchase: purchaseRouter,
  delivery: deliveryRouter,
  dashboard: dashboardRouter,
  report: reportRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;

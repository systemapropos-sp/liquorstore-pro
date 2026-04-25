import { relations } from "drizzle-orm";
import {
  users,
  businesses,
  branches,
  categories,
  products,
  productBatches,
  inventory,
  // inventoryMovements,
  transfers,
  transferItems,
  customers,
  customerAddresses,
  suppliers,
  invoices,
  invoiceItems,
  orders,
  orderItems,
  credits,
  creditPayments,
  purchases,
  purchaseItems,
  accountsPayable,
  paymentsSuppliers,
  deliveryZones,
  deliveries,
  auditLogs,
  businessSettings,
} from "./schema";

export const businessesRelations = relations(businesses, ({ many }) => ({
  branches: many(branches),
  users: many(users),
  categories: many(categories),
  products: many(products),
  customers: many(customers),
  suppliers: many(suppliers),
  invoices: many(invoices),
  orders: many(orders),
  purchases: many(purchases),
  deliveries: many(deliveries),
  deliveryZones: many(deliveryZones),
}));

export const branchesRelations = relations(branches, ({ one, many }) => ({
  business: one(businesses, { fields: [branches.businessId], references: [businesses.id] }),
  manager: one(users, { fields: [branches.managerId], references: [users.id] }),
  inventory: many(inventory),
  transfersFrom: many(transfers, { relationName: "fromBranch" }),
  transfersTo: many(transfers, { relationName: "toBranch" }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  business: one(businesses, { fields: [users.businessId], references: [businesses.id] }),
  branch: one(branches, { fields: [users.branchId], references: [branches.id] }),
  invoices: many(invoices),
  deliveriesAssigned: many(deliveries),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  business: one(businesses, { fields: [categories.businessId], references: [businesses.id] }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  business: one(businesses, { fields: [products.businessId], references: [businesses.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  supplier: one(suppliers, { fields: [products.supplierId], references: [suppliers.id] }),
  batches: many(productBatches),
  inventory: many(inventory),
}));

export const productBatchesRelations = relations(productBatches, ({ one }) => ({
  product: one(products, { fields: [productBatches.productId], references: [products.id] }),
  branch: one(branches, { fields: [productBatches.branchId], references: [branches.id] }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(products, { fields: [inventory.productId], references: [products.id] }),
  branch: one(branches, { fields: [inventory.branchId], references: [branches.id] }),
  batch: one(productBatches, { fields: [inventory.batchId], references: [productBatches.id] }),
}));

export const transfersRelations = relations(transfers, ({ one, many }) => ({
  fromBranch: one(branches, { fields: [transfers.fromBranchId], references: [branches.id], relationName: "fromBranch" }),
  toBranch: one(branches, { fields: [transfers.toBranchId], references: [branches.id], relationName: "toBranch" }),
  requestedByUser: one(users, { fields: [transfers.requestedBy], references: [users.id] }),
  items: many(transferItems),
}));

export const transferItemsRelations = relations(transferItems, ({ one }) => ({
  transfer: one(transfers, { fields: [transferItems.transferId], references: [transfers.id] }),
  product: one(products, { fields: [transferItems.productId], references: [products.id] }),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  business: one(businesses, { fields: [customers.businessId], references: [businesses.id] }),
  addresses: many(customerAddresses),
  invoices: many(invoices),
  deliveries: many(deliveries),
  credits: many(credits),
}));

export const customerAddressesRelations = relations(customerAddresses, ({ one }) => ({
  customer: one(customers, { fields: [customerAddresses.customerId], references: [customers.id] }),
}));

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  business: one(businesses, { fields: [suppliers.businessId], references: [businesses.id] }),
  products: many(products),
  purchases: many(purchases),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  business: one(businesses, { fields: [invoices.businessId], references: [businesses.id] }),
  customer: one(customers, { fields: [invoices.customerId], references: [customers.id] }),
  user: one(users, { fields: [invoices.userId], references: [users.id] }),
  branch: one(branches, { fields: [invoices.branchId], references: [branches.id] }),
  items: many(invoiceItems),
  delivery: many(deliveries),
  credit: many(credits),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceItems.invoiceId], references: [invoices.id] }),
  product: one(products, { fields: [invoiceItems.productId], references: [products.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  business: one(businesses, { fields: [orders.businessId], references: [businesses.id] }),
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  branch: one(branches, { fields: [orders.branchId], references: [branches.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const creditsRelations = relations(credits, ({ one, many }) => ({
  customer: one(customers, { fields: [credits.customerId], references: [customers.id] }),
  invoice: one(invoices, { fields: [credits.invoiceId], references: [invoices.id] }),
  payments: many(creditPayments),
}));

export const creditPaymentsRelations = relations(creditPayments, ({ one }) => ({
  credit: one(credits, { fields: [creditPayments.creditId], references: [credits.id] }),
}));

export const purchasesRelations = relations(purchases, ({ one, many }) => ({
  business: one(businesses, { fields: [purchases.businessId], references: [businesses.id] }),
  supplier: one(suppliers, { fields: [purchases.supplierId], references: [suppliers.id] }),
  branch: one(branches, { fields: [purchases.branchId], references: [branches.id] }),
  items: many(purchaseItems),
}));

export const purchaseItemsRelations = relations(purchaseItems, ({ one }) => ({
  purchase: one(purchases, { fields: [purchaseItems.purchaseId], references: [purchases.id] }),
  product: one(products, { fields: [purchaseItems.productId], references: [products.id] }),
}));

export const accountsPayableRelations = relations(accountsPayable, ({ one, many }) => ({
  supplier: one(suppliers, { fields: [accountsPayable.supplierId], references: [suppliers.id] }),
  purchase: one(purchases, { fields: [accountsPayable.purchaseId], references: [purchases.id] }),
  payments: many(paymentsSuppliers),
}));

export const paymentsSuppliersRelations = relations(paymentsSuppliers, ({ one }) => ({
  accountPayable: one(accountsPayable, { fields: [paymentsSuppliers.accountPayableId], references: [accountsPayable.id] }),
}));

export const deliveryZonesRelations = relations(deliveryZones, ({ one, many }) => ({
  business: one(businesses, { fields: [deliveryZones.businessId], references: [businesses.id] }),
  deliveries: many(deliveries),
}));

export const deliveriesRelations = relations(deliveries, ({ one }) => ({
  business: one(businesses, { fields: [deliveries.businessId], references: [businesses.id] }),
  customer: one(customers, { fields: [deliveries.customerId], references: [customers.id] }),
  invoice: one(invoices, { fields: [deliveries.invoiceId], references: [invoices.id] }),
  zone: one(deliveryZones, { fields: [deliveries.zoneId], references: [deliveryZones.id] }),
  assignedToUser: one(users, { fields: [deliveries.assignedTo], references: [users.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));

export const businessSettingsRelations = relations(businessSettings, ({ one }) => ({
  business: one(businesses, { fields: [businessSettings.businessId], references: [businesses.id] }),
}));

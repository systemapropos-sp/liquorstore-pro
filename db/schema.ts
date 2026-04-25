import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  decimal,
  int,
  boolean,
  json,
  index,
} from "drizzle-orm/mysql-core";

// ─── 1. TENANT / NEGOCIO ─────────────────────────────────────────
export const businesses = mysqlTable("businesses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  logoUrl: text("logo_url"),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  rnc: varchar("rnc", { length: 50 }),
  slogan: varchar("slogan", { length: 255 }),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("18.00").notNull(),
  taxIncluded: boolean("tax_included").default(true).notNull(),
  currency: varchar("currency", { length: 10 }).default("DOP").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Business = typeof businesses.$inferSelect;

// ─── 2. SUCURSALES / BODEGAS ────────────────────────────────────
export const branches = mysqlTable("branches", {
  id: serial("id").primaryKey(),
  businessId: bigint("business_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  city: varchar("city", { length: 100 }),
  managerId: bigint("manager_id", { mode: "number", unsigned: true }),
  active: boolean("active").default(true).notNull(),
  isWarehouse: boolean("is_warehouse").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  businessIdx: index("branch_business_idx").on(table.businessId),
}));

export type Branch = typeof branches.$inferSelect;

// ─── 3. USUARIOS (extendidos desde auth) ─────────────────────────
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  phone: varchar("phone", { length: 50 }),
  role: mysqlEnum("role", ["admin", "manager", "seller", "cashier", "warehouse", "accountant", "delivery"]).default("seller").notNull(),
  businessId: bigint("business_id", { mode: "number", unsigned: true }),
  branchId: bigint("branch_id", { mode: "number", unsigned: true }),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("0.00"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
}, (table) => ({
  businessIdx: index("user_business_idx").on(table.businessId),
  roleIdx: index("user_role_idx").on(table.role),
}));

export type User = typeof users.$inferSelect;

// ─── 4. CATEGORÍAS DE PRODUCTOS ─────────────────────────────────
export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  businessId: bigint("business_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["beer", "rum", "wine", "whisky", "vodka", "tequila", "other"]).default("other").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  businessIdx: index("cat_business_idx").on(table.businessId),
}));

export type Category = typeof categories.$inferSelect;

// ─── 5. PRODUCTOS ───────────────────────────────────────────────
export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  businessId: bigint("business_id", { mode: "number", unsigned: true }).notNull(),
  code: varchar("code", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  categoryId: bigint("category_id", { mode: "number", unsigned: true }),
  subcategory: varchar("subcategory", { length: 100 }),
  cost: decimal("cost", { precision: 12, scale: 2 }).default("0.00").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).default("0.00").notNull(),
  margin: decimal("margin", { precision: 5, scale: 2 }).default("0.00"),
  unit: varchar("unit", { length: 50 }).default("bottle").notNull(),
  barcode: varchar("barcode", { length: 100 }),
  photoUrl: text("photo_url"),
  minStock: int("min_stock").default(0).notNull(),
  maxStock: int("max_stock").default(0),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }),
  location: varchar("location", { length: 100 }),
  active: boolean("active").default(true).notNull(),
  isCombo: boolean("is_combo").default(false).notNull(),
  comboItems: json("combo_items"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  businessIdx: index("prod_business_idx").on(table.businessId),
  codeIdx: index("prod_code_idx").on(table.code),
  barcodeIdx: index("prod_barcode_idx").on(table.barcode),
  categoryIdx: index("prod_category_idx").on(table.categoryId),
}));

export type Product = typeof products.$inferSelect;

// ─── 6. LOTES DE PRODUCTOS ──────────────────────────────────────
export const productBatches = mysqlTable("product_batches", {
  id: serial("id").primaryKey(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  batchNumber: varchar("batch_number", { length: 100 }).notNull(),
  manufactureDate: timestamp("manufacture_date"),
  expiryDate: timestamp("expiry_date").notNull(),
  quantity: int("quantity").default(0).notNull(),
  cost: decimal("cost", { precision: 12, scale: 2 }).default("0.00").notNull(),
  branchId: bigint("branch_id", { mode: "number", unsigned: true }).notNull(),
  status: mysqlEnum("status", ["active", "expired", "sold_out"]).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  productIdx: index("batch_product_idx").on(table.productId),
  expiryIdx: index("batch_expiry_idx").on(table.expiryDate),
  branchIdx: index("batch_branch_idx").on(table.branchId),
}));

export type ProductBatch = typeof productBatches.$inferSelect;

// ─── 7. INVENTARIO POR SUCURSAL ─────────────────────────────────
export const inventory = mysqlTable("inventory", {
  id: serial("id").primaryKey(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  branchId: bigint("branch_id", { mode: "number", unsigned: true }).notNull(),
  batchId: bigint("batch_id", { mode: "number", unsigned: true }),
  quantity: int("quantity").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  productBranchIdx: index("inv_prod_branch_idx").on(table.productId, table.branchId),
  batchIdx: index("inv_batch_idx").on(table.batchId),
}));

export type Inventory = typeof inventory.$inferSelect;

// ─── 8. MOVIMIENTOS DE INVENTARIO ────────────────────────────────
export const inventoryMovements = mysqlTable("inventory_movements", {
  id: serial("id").primaryKey(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  branchId: bigint("branch_id", { mode: "number", unsigned: true }).notNull(),
  batchId: bigint("batch_id", { mode: "number", unsigned: true }),
  type: mysqlEnum("type", ["in", "out", "adjustment", "transfer_in", "transfer_out"]).notNull(),
  quantity: int("quantity").notNull(),
  reason: text("reason"),
  referenceId: varchar("reference_id", { length: 100 }),
  fromBranchId: bigint("from_branch_id", { mode: "number", unsigned: true }),
  toBranchId: bigint("to_branch_id", { mode: "number", unsigned: true }),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  businessId: bigint("business_id", { mode: "number", unsigned: true }).notNull(),
}, (table) => ({
  productIdx: index("im_product_idx").on(table.productId),
  branchIdx: index("im_branch_idx").on(table.branchId),
  dateIdx: index("im_date_idx").on(table.date),
  businessIdx: index("im_business_idx").on(table.businessId),
}));

export type InventoryMovement = typeof inventoryMovements.$inferSelect;

// ─── 9. TRANSFERENCIAS ENTRE BODEGAS ─────────────────────────────
export const transfers = mysqlTable("transfers", {
  id: serial("id").primaryKey(),
  fromBranchId: bigint("from_branch_id", { mode: "number", unsigned: true }).notNull(),
  toBranchId: bigint("to_branch_id", { mode: "number", unsigned: true }).notNull(),
  status: mysqlEnum("status", ["requested", "in_transit", "received", "rejected"]).default("requested").notNull(),
  requestedBy: bigint("requested_by", { mode: "number", unsigned: true }).notNull(),
  approvedBy: bigint("approved_by", { mode: "number", unsigned: true }),
  receivedBy: bigint("received_by", { mode: "number", unsigned: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  businessId: bigint("business_id", { mode: "number", unsigned: true }).notNull(),
}, (table) => ({
  businessIdx: index("xfer_business_idx").on(table.businessId),
  statusIdx: index("xfer_status_idx").on(table.status),
}));

export type Transfer = typeof transfers.$inferSelect;

export const transferItems = mysqlTable("transfer_items", {
  id: serial("id").primaryKey(),
  transferId: bigint("transfer_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  batchId: bigint("batch_id", { mode: "number", unsigned: true }),
  quantity: int("quantity").notNull(),
}, (table) => ({
  transferIdx: index("ti_transfer_idx").on(table.transferId),
}));

export type TransferItem = typeof transferItems.$inferSelect;

// ─── 10. CLIENTES ───────────────────────────────────────────────
export const customers = mysqlTable("customers", {
  id: serial("id").primaryKey(),
  businessId: bigint("business_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  idNumber: varchar("id_number", { length: 50 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  birthDate: timestamp("birth_date"),
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }).default("0.00"),
  type: mysqlEnum("type", ["cash", "credit"]).default("cash").notNull(),
  tags: varchar("tags", { length: 255 }),
  photoUrl: text("photo_url"),
  totalPurchased: decimal("total_purchased", { precision: 14, scale: 2 }).default("0.00"),
  lastPurchaseDate: timestamp("last_purchase_date"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  businessIdx: index("cust_business_idx").on(table.businessId),
  phoneIdx: index("cust_phone_idx").on(table.phone),
}));

export type Customer = typeof customers.$inferSelect;

export const customerAddresses = mysqlTable("customer_addresses", {
  id: serial("id").primaryKey(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }).notNull(),
  label: varchar("label", { length: 50 }).default("Casa").notNull(),
  address: text("address").notNull(),
  references: text("references"),
  coordinatesLat: decimal("coordinates_lat", { precision: 10, scale: 6 }),
  coordinatesLng: decimal("coordinates_lng", { precision: 10, scale: 6 }),
  isDefault: boolean("is_default").default(false).notNull(),
}, (table) => ({
  customerIdx: index("addr_customer_idx").on(table.customerId),
}));

export type CustomerAddress = typeof customerAddresses.$inferSelect;

// ─── 11. PROVEEDORES ──────────────────────────────────────────────
export const suppliers = mysqlTable("suppliers", {
  id: serial("id").primaryKey(),
  businessId: bigint("business_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  rnc: varchar("rnc", { length: 50 }),
  contact: varchar("contact", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  creditDays: int("credit_days").default(0),
  rating: int("rating").default(5),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  businessIdx: index("sup_business_idx").on(table.businessId),
}));

export type Supplier = typeof suppliers.$inferSelect;

// ─── 12. FACTURAS ─────────────────────────────────────────────────
export const invoices = mysqlTable("invoices", {
  id: serial("id").primaryKey(),
  number: varchar("number", { length: 50 }).notNull(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  branchId: bigint("branch_id", { mode: "number", unsigned: true }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  dueDate: timestamp("due_date"),
  subtotal: decimal("subtotal", { precision: 14, scale: 2 }).default("0.00").notNull(),
  discount: decimal("discount", { precision: 14, scale: 2 }).default("0.00").notNull(),
  tax: decimal("tax", { precision: 14, scale: 2 }).default("0.00").notNull(),
  total: decimal("total", { precision: 14, scale: 2 }).default("0.00").notNull(),
  paymentMethod: mysqlEnum("payment_method", ["cash", "card", "transfer", "mixed", "credit"]).default("cash").notNull(),
  status: mysqlEnum("status", ["paid", "pending", "cancelled"]).default("paid").notNull(),
  notes: text("notes"),
  businessId: bigint("business_id", { mode: "number", unsigned: true }).notNull(),
  isDelivery: boolean("is_delivery").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  numberIdx: index("inv_number_idx").on(table.number),
  businessIdx: index("inv_business_idx").on(table.businessId),
  branchIdx: index("inv_branch_idx").on(table.branchId),
  customerIdx: index("inv_customer_idx").on(table.customerId),
  dateIdx: index("inv_date_idx").on(table.date),
}));

export type Invoice = typeof invoices.$inferSelect;

export const invoiceItems = mysqlTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  batchId: bigint("batch_id", { mode: "number", unsigned: true }),
  quantity: int("quantity").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  tax: decimal("tax", { precision: 12, scale: 2 }).default("0.00").notNull(),
  total: decimal("total", { precision: 14, scale: 2 }).notNull(),
}, (table) => ({
  invoiceIdx: index("ii_invoice_idx").on(table.invoiceId),
}));

export type InvoiceItem = typeof invoiceItems.$inferSelect;

// ─── 13. ÓRDENES / COTIZACIONES ─────────────────────────────────
export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  number: varchar("number", { length: 50 }).notNull(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  branchId: bigint("branch_id", { mode: "number", unsigned: true }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  expiryDate: timestamp("expiry_date"),
  subtotal: decimal("subtotal", { precision: 14, scale: 2 }).default("0.00").notNull(),
  discount: decimal("discount", { precision: 14, scale: 2 }).default("0.00").notNull(),
  tax: decimal("tax", { precision: 14, scale: 2 }).default("0.00").notNull(),
  total: decimal("total", { precision: 14, scale: 2 }).default("0.00").notNull(),
  status: mysqlEnum("status", ["draft", "sent", "approved", "rejected", "converted"]).default("draft").notNull(),
  notes: text("notes"),
  businessId: bigint("business_id", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  businessIdx: index("ord_business_idx").on(table.businessId),
  statusIdx: index("ord_status_idx").on(table.status),
}));

export type Order = typeof orders.$inferSelect;

export const orderItems = mysqlTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  quantity: int("quantity").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  tax: decimal("tax", { precision: 12, scale: 2 }).default("0.00").notNull(),
  total: decimal("total", { precision: 14, scale: 2 }).notNull(),
}, (table) => ({
  orderIdx: index("oi_order_idx").on(table.orderId),
}));

export type OrderItem = typeof orderItems.$inferSelect;

// ─── 14. CRÉDITOS / CUENTAS POR COBRAR ──────────────────────────
export const credits = mysqlTable("credits", {
  id: serial("id").primaryKey(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }).notNull(),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
  totalAmount: decimal("total_amount", { precision: 14, scale: 2 }).notNull(),
  balance: decimal("balance", { precision: 14, scale: 2 }).notNull(),
  installments: int("installments").default(1).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).default("0.00"),
  status: mysqlEnum("status", ["current", "overdue", "paid", "written_off"]).default("current").notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  dueDate: timestamp("due_date"),
  businessId: bigint("business_id", { mode: "number", unsigned: true }).notNull(),
  branchId: bigint("branch_id", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  customerIdx: index("cred_customer_idx").on(table.customerId),
  businessIdx: index("cred_business_idx").on(table.businessId),
  statusIdx: index("cred_status_idx").on(table.status),
}));

export type Credit = typeof credits.$inferSelect;

export const creditPayments = mysqlTable("credit_payments", {
  id: serial("id").primaryKey(),
  creditId: bigint("credit_id", { mode: "number", unsigned: true }).notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  method: mysqlEnum("method", ["cash", "card", "transfer"]).default("cash").notNull(),
  notes: text("notes"),
}, (table) => ({
  creditIdx: index("cp_credit_idx").on(table.creditId),
}));

export type CreditPayment = typeof creditPayments.$inferSelect;

// ─── 15. COMPRAS ────────────────────────────────────────────────
export const purchases = mysqlTable("purchases", {
  id: serial("id").primaryKey(),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
  branchId: bigint("branch_id", { mode: "number", unsigned: true }).notNull(),
  invoiceNumber: varchar("invoice_number", { length: 100 }),
  date: timestamp("date").defaultNow().notNull(),
  subtotal: decimal("subtotal", { precision: 14, scale: 2 }).default("0.00").notNull(),
  discount: decimal("discount", { precision: 14, scale: 2 }).default("0.00").notNull(),
  tax: decimal("tax", { precision: 14, scale: 2 }).default("0.00").notNull(),
  total: decimal("total", { precision: 14, scale: 2 }).default("0.00").notNull(),
  paymentMethod: mysqlEnum("payment_method", ["cash", "credit"]).default("cash").notNull(),
  status: mysqlEnum("status", ["paid", "pending"]).default("paid").notNull(),
  dueDate: timestamp("due_date"),
  photoUrl: text("photo_url"),
  notes: text("notes"),
  businessId: bigint("business_id", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  businessIdx: index("pur_business_idx").on(table.businessId),
  supplierIdx: index("pur_supplier_idx").on(table.supplierId),
}));

export type Purchase = typeof purchases.$inferSelect;

export const purchaseItems = mysqlTable("purchase_items", {
  id: serial("id").primaryKey(),
  purchaseId: bigint("purchase_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  batchId: bigint("batch_id", { mode: "number", unsigned: true }),
  quantity: int("quantity").notNull(),
  cost: decimal("cost", { precision: 12, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  total: decimal("total", { precision: 14, scale: 2 }).notNull(),
  expiryDate: timestamp("expiry_date"),
}, (table) => ({
  purchaseIdx: index("pi_purchase_idx").on(table.purchaseId),
}));

export type PurchaseItem = typeof purchaseItems.$inferSelect;

// ─── 16. CUENTAS POR PAGAR ──────────────────────────────────────
export const accountsPayable = mysqlTable("accounts_payable", {
  id: serial("id").primaryKey(),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
  purchaseId: bigint("purchase_id", { mode: "number", unsigned: true }).notNull(),
  totalAmount: decimal("total_amount", { precision: 14, scale: 2 }).notNull(),
  balance: decimal("balance", { precision: 14, scale: 2 }).notNull(),
  dueDate: timestamp("due_date"),
  status: mysqlEnum("status", ["pending", "paid", "overdue"]).default("pending").notNull(),
  businessId: bigint("business_id", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  supplierIdx: index("ap_supplier_idx").on(table.supplierId),
  businessIdx: index("ap_business_idx").on(table.businessId),
}));

export type AccountPayable = typeof accountsPayable.$inferSelect;

export const paymentsSuppliers = mysqlTable("payments_suppliers", {
  id: serial("id").primaryKey(),
  accountPayableId: bigint("account_payable_id", { mode: "number", unsigned: true }).notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  method: mysqlEnum("method", ["cash", "transfer", "check"]).default("cash").notNull(),
  notes: text("notes"),
}, (table) => ({
  apIdx: index("ps_ap_idx").on(table.accountPayableId),
}));

export type PaymentSupplier = typeof paymentsSuppliers.$inferSelect;

// ─── 17. DELIVERY ───────────────────────────────────────────────
export const deliveryZones = mysqlTable("delivery_zones", {
  id: serial("id").primaryKey(),
  businessId: bigint("business_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  deliveryCost: decimal("delivery_cost", { precision: 10, scale: 2 }).default("0.00").notNull(),
  color: varchar("color", { length: 20 }).default("#E30A17"),
  minOrderFree: decimal("min_order_free", { precision: 12, scale: 2 }).default("0.00"),
  active: boolean("active").default(true).notNull(),
}, (table) => ({
  businessIdx: index("dz_business_idx").on(table.businessId),
}));

export type DeliveryZone = typeof deliveryZones.$inferSelect;

export const deliveries = mysqlTable("deliveries", {
  id: serial("id").primaryKey(),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }),
  address: text("address").notNull(),
  references: text("references"),
  coordinatesLat: decimal("coordinates_lat", { precision: 10, scale: 6 }),
  coordinatesLng: decimal("coordinates_lng", { precision: 10, scale: 6 }),
  zoneId: bigint("zone_id", { mode: "number", unsigned: true }),
  deliveryCost: decimal("delivery_cost", { precision: 10, scale: 2 }).default("0.00").notNull(),
  paymentMethod: mysqlEnum("payment_method", ["cash", "card", "online"]).default("cash").notNull(),
  status: mysqlEnum("status", ["received", "preparing", "ready", "shipping", "delivered", "cancelled"]).default("received").notNull(),
  assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
  notes: text("notes"),
  deliveryPhotoUrl: text("delivery_photo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deliveredAt: timestamp("delivered_at"),
  businessId: bigint("business_id", { mode: "number", unsigned: true }).notNull(),
  branchId: bigint("branch_id", { mode: "number", unsigned: true }).notNull(),
}, (table) => ({
  businessIdx: index("del_business_idx").on(table.businessId),
  statusIdx: index("del_status_idx").on(table.status),
  assignedIdx: index("del_assigned_idx").on(table.assignedTo),
}));

export type Delivery = typeof deliveries.$inferSelect;

// ─── 18. AUDITORÍA ────────────────────────────────────────────────
export const auditLogs = mysqlTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  action: varchar("action", { length: 50 }).notNull(),
  tableName: varchar("table_name", { length: 50 }).notNull(),
  recordId: bigint("record_id", { mode: "number", unsigned: true }),
  oldData: json("old_data"),
  newData: json("new_data"),
  branchId: bigint("branch_id", { mode: "number", unsigned: true }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("audit_user_idx").on(table.userId),
  tableIdx: index("audit_table_idx").on(table.tableName),
  timestampIdx: index("audit_timestamp_idx").on(table.timestamp),
}));

export type AuditLog = typeof auditLogs.$inferSelect;

// ─── 19. CONFIGURACIÓN DEL NEGOCIO ────────────────────────────────
export const businessSettings = mysqlTable("business_settings", {
  id: serial("id").primaryKey(),
  businessId: bigint("business_id", { mode: "number", unsigned: true }).notNull().unique(),
  invoicePrefix: varchar("invoice_prefix", { length: 20 }).default("A-"),
  invoiceNextNumber: int("invoice_next_number").default(1),
  orderPrefix: varchar("order_prefix", { length: 20 }).default("COT-"),
  orderNextNumber: int("order_next_number").default(1),
  purchasePrefix: varchar("purchase_prefix", { length: 20 }).default("COM-"),
  purchaseNextNumber: int("purchase_next_number").default(1),
  ticketSize: mysqlEnum("ticket_size", ["80mm", "letter"]).default("80mm"),
  creditInterestRate: decimal("credit_interest_rate", { precision: 5, scale: 2 }).default("2.00"),
  creditGraceDays: int("credit_grace_days").default(3),
  expiryAlertDays: int("expiry_alert_days").default(7),
  allowNegativeStock: boolean("allow_negative_stock").default(false).notNull(),
  minDeliveryAmount: decimal("min_delivery_amount", { precision: 12, scale: 2 }).default("500.00"),
  prepTimeMinutes: int("prep_time_minutes").default(30),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type BusinessSetting = typeof businessSettings.$inferSelect;

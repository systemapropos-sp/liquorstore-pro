// Base de datos local en localStorage para modo demo
const DB_KEY = 'liquorstore_db_v3';

export interface MockBusiness {
  id: number;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  rnc: string;
  slogan: string;
  taxRate: string;
  taxIncluded: boolean;
  currency: string;
  active: boolean;
  createdAt: string;
}

export interface MockBranch {
  id: number;
  businessId: number;
  name: string;
  address: string;
  phone: string;
  city: string;
  managerId?: number;
  active: boolean;
  isWarehouse: boolean;
}

export interface MockCategory {
  id: number;
  businessId: number;
  name: string;
  type: 'beer' | 'rum' | 'wine' | 'whisky' | 'vodka' | 'tequila' | 'other';
  active: boolean;
}

export interface MockProduct {
  id: number;
  businessId: number;
  code: string;
  barcode: string;
  name: string;
  description: string;
  categoryId: number;
  subcategory: string;
  brand: string;
  cost: string;
  price: string;
  price2: string;
  price3: string;
  margin: string;
  unit: string;
  taxType: 'exempt' | 'taxed' | 'included';
  taxRate: string;
  minStock: number;
  maxStock: number;
  supplierId?: number;
  photoUrl: string;
  isInventoriable: boolean;
  isBillable: boolean;
  isFavorite: boolean;
  active: boolean;
  isCombo: boolean;
  createdAt: string;
}

export interface MockBatch {
  id: number;
  productId: number;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  quantity: number;
  cost: string;
  branchId: number;
  status: 'active' | 'expired' | 'sold_out';
}

export interface MockInventory {
  id: number;
  productId: number;
  branchId: number;
  batchId: number;
  quantity: number;
}

export interface MockCustomer {
  id: number;
  businessId: number;
  name: string;
  personType: 'natural' | 'juridica';
  idType: 'cedula' | 'passport' | 'rnc';
  idNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  secondLastName: string;
  phone: string;
  phone2: string;
  email: string;
  country: string;
  department: string;
  city: string;
  zone: string;
  neighborhood: string;
  address: string;
  birthDate: string;
  creditLimit: string;
  creditOverdueLimit: string;
  type: 'cash' | 'credit';
  tags: string;
  totalPurchased: string;
  photoUrl: string;
  active: boolean;
}

export interface MockSupplier {
  id: number;
  businessId: number;
  name: string;
  personType: 'natural' | 'juridica';
  documentType: 'nit' | 'cedula' | 'passport';
  rnc: string;
  dv?: string;
  tradeName: string;
  legalName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  secondLastName: string;
  contact: string;
  phone: string;
  phone2: string;
  email: string;
  country: string;
  department: string;
  city: string;
  address: string;
  regime: string;
  taxResponsibility: string;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
  advancePayment: string;
  creditDays: number;
  active: boolean;
}

export interface MockInvoice {
  id: number;
  number: string;
  customerId?: number;
  userId: number;
  branchId: number;
  date: string;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'mixed' | 'credit';
  status: 'paid' | 'pending' | 'cancelled';
  notes: string;
  businessId: number;
  isDelivery: boolean;
  customerName?: string;
  branchName?: string;
}

export interface MockInvoiceItem {
  id: number;
  invoiceId: number;
  productId: number;
  productName: string;
  quantity: number;
  price: string;
  discount: string;
  tax: string;
  total: string;
}

export interface MockOrder {
  id: number;
  number: string;
  customerId?: number;
  customerName?: string;
  branchId: number;
  branchName?: string;
  date: string;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'converted';
  notes: string;
  businessId: number;
  items: MockOrderItem[];
}

export interface MockOrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  price: string;
  total: string;
}

export interface MockCredit {
  id: number;
  customerId: number;
  customerName: string;
  invoiceId?: number;
  totalAmount: string;
  balance: string;
  installments: number;
  interestRate: string;
  status: 'current' | 'overdue' | 'paid' | 'written_off';
  startDate: string;
  dueDate?: string;
  businessId: number;
  payments: MockCreditPayment[];
}

export interface MockCreditPayment {
  id: number;
  creditId: number;
  amount: string;
  date: string;
  method: 'cash' | 'card' | 'transfer';
  notes: string;
}

export interface MockEmployee {
  id: number;
  businessId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  secondLastName: string;
  idNumber: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  position: string;
  branchId?: number;
  hireDate: string;
  salary: string;
  photoUrl: string;
  active: boolean;
}

export interface MockEmployeeLoan {
  id: number;
  employeeId: number;
  employeeName: string;
  amount: string;
  balance: string;
  installments: number;
  installmentAmount: string;
  status: 'active' | 'paid' | 'defaulted';
  startDate: string;
  notes: string;
  payments: MockLoanPayment[];
}

export interface MockLoanPayment {
  id: number;
  loanId: number;
  amount: string;
  date: string;
  notes: string;
}

export interface MockPurchase {
  id: number;
  supplierId: number;
  supplierName: string;
  branchId: number;
  branchName: string;
  invoiceNumber: string;
  date: string;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  paymentMethod: 'cash' | 'credit';
  status: 'paid' | 'pending';
  businessId: number;
  items: MockPurchaseItem[];
}

export interface MockPurchaseItem {
  id: number;
  purchaseId: number;
  productId: number;
  productName: string;
  quantity: number;
  cost: string;
  total: string;
}

export interface MockDelivery {
  id: number;
  customerName: string;
  customerPhone: string;
  address: string;
  references: string;
  zoneId?: number;
  zoneName?: string;
  deliveryCost: string;
  paymentMethod: 'cash' | 'card' | 'online';
  status: 'received' | 'preparing' | 'ready' | 'shipping' | 'delivered' | 'cancelled';
  notes: string;
  businessId: number;
  branchId: number;
  branchName?: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface MockDeliveryZone {
  id: number;
  businessId: number;
  name: string;
  description: string;
  deliveryCost: string;
  color: string;
  minOrderFree: string;
}

export interface MockBusinessSettings {
  id: number;
  businessId: number;
  invoicePrefix: string;
  invoiceNextNumber: number;
  orderPrefix: string;
  orderNextNumber: number;
  purchasePrefix: string;
  purchaseNextNumber: number;
  transferPrefix: string;
  transferNextNumber: number;
  creditInterestRate: string;
  creditGraceDays: number;
  expiryAlertDays: number;
}

export interface MockTransfer {
  id: number;
  number: string;
  fromBranchId: number;
  toBranchId: number;
  fromBranchName?: string;
  toBranchName?: string;
  status: 'pending' | 'received' | 'cancelled';
  items: MockTransferItem[];
  notes: string;
  createdAt: string;
  receivedAt?: string;
  businessId: number;
  userName?: string;
}

export interface MockTransferItem {
  id: number;
  transferId: number;
  productId: number;
  productName: string;
  productCode: string;
  quantity: number;
  sentQty: number;
  receivedQty: number;
}

export interface MockStockCount {
  id: number;
  branchId: number;
  branchName?: string;
  status: 'draft' | 'completed';
  items: MockStockCountItem[];
  notes: string;
  createdAt: string;
  completedAt?: string;
  businessId: number;
  userName?: string;
}

export interface MockStockCountItem {
  id: number;
  stockCountId: number;
  productId: number;
  productName: string;
  productCode: string;
  systemQty: number;
  actualQty: number;
  difference: number;
}

export interface MockAdjustment {
  id: number;
  productId: number;
  productName?: string;
  productCode?: string;
  branchId: number;
  branchName?: string;
  previousQty: number;
  adjustedQty: number;
  currentQty: number;
  reason: string;
  type: 'increase' | 'decrease';
  source: 'manual' | 'invoice' | 'purchase' | 'transfer';
  notes: string;
  createdAt: string;
  businessId: number;
  userName?: string;
}


export interface MockPayrollPeriod {
  id: number;
  businessId: number;
  periodType: 'quincena' | 'mensual';
  startDate: string;
  endDate: string;
  status: 'draft' | 'processed' | 'paid';
  totalAmount: string;
  notes: string;
  createdAt: string;
  paidAt?: string;
}

export interface MockPayrollItem {
  id: number;
  payrollId: number;
  employeeId: number;
  employeeName: string;
  baseSalary: string;
  overtime: string;
  bonus: string;
  deductions: string;
  loanDeduction: string;
  netPay: string;
  paymentMethod: 'cash' | 'transfer' | 'check';
  status: 'pending' | 'paid';
  paymentDate?: string;
  notes: string;
}

export interface MockTable {
  id: number;
  businessId: number;
  branchId: number;
  name: string;
  capacity: number;
  status: 'free' | 'occupied' | 'reserved';
  currentOrderId?: number;
  orderTotal: string;
  createdAt: string;
}

export interface MockTableOrderItem {
  id: number;
  tableId: number;
  productId: number;
  productName: string;
  quantity: number;
  price: string;
  total: string;
  notes: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  addedAt: string;
}

export interface MockComanda {
  id: number;
  number: string;
  businessId: number;
  branchId: number;
  tableId?: number;
  tableName?: string;
  customerName?: string;
  customerPhone?: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  items: MockComandaItem[];
  subtotal: string;
  tax: string;
  total: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  userName: string;
}

export interface MockComandaItem {
  id: number;
  comandaId: number;
  productId: number;
  productName: string;
  quantity: number;
  price: string;
  total: string;
  notes: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
}

export interface MockWhatsAppSession {
  id: number;
  businessId: number;
  phone: string;
  name: string;
  status: 'connected' | 'disconnected' | 'connecting';
  qrCode?: string;
  lastActivity?: string;
  createdAt: string;
}

export interface MockWhatsAppMessage {
  id: number;
  sessionId: number;
  phone: string;
  contactName?: string;
  type: 'received' | 'sent';
  content: string;
  templateName?: string;
  status: 'unread' | 'read' | 'sent' | 'delivered' | 'failed';
  createdAt: string;
}

export interface MockWhatsAppTemplate {
  id: number;
  businessId: number;
  name: string;
  content: string;
  variables: string;
  active: boolean;
}


export interface MockBank {
  id: number;
  businessId: number;
  name: string;
  accountHolder: string;
  accountNumber: string;
  accountType: string;
  balance: string;
  active: boolean;
}

export interface MockBankTransaction {
  id: number;
  bankId: number;
  type: 'income' | 'expense' | 'transfer';
  description: string;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  operation: string;
  personName: string;
  createdAt: string;
  userName: string;
}

export interface MockCashRegister {
  id: number;
  businessId: number;
  branchId: number;
  name: string;
  serial: string;
  location: string;
  status: 'open' | 'closed';
  baseAmount: string;
  currentAmount: string;
  openedAt?: string;
  closedAt?: string;
}

export interface MockUser {
  id: number;
  businessId: number;
  fullName: string;
  email: string;
  password: string;
  type: 'admin' | 'user';
  branchId?: number;
  active: boolean;
  createdAt: string;
}

export interface MockExpenseConcept {
  id: number;
  businessId: number;
  type: 'income' | 'expense';
  code: string;
  concept: string;
}

export interface MockResolution {
  id: number;
  businessId: number;
  type: 'equivalent' | 'support' | 'electronic' | 'pos';
  prefix: string;
  resolution: string;
  startDate: string;
  endDate: string;
  startNumber: string;
  endNumber: string;
  currentNumber: string;
  active: boolean;
  createdAt: string;
}

export interface MockTaxConfig {
  id: number;
  businessId: number;
  name: string;
  rate: number;
  type: string;
  active: boolean;
  isDefault: boolean;
}

export interface MockEmailConfig {
  id: number;
  businessId: number;
  emailType: string;
  host: string;
  port: string;
  email: string;
  password: string;
  encryption: string;
}

export interface MockBarcodeConfig {
  id: number;
  businessId: number;
  columns: 2 | 3;
  showPrice: boolean;
  showCode: boolean;
  showName: boolean;
}

export interface MockPointsConfig {
  id: number;
  businessId: number;
  pointValue: string;
  pointsPerAmount: string;
  minRedeem: number;
  active: boolean;
}

export interface MockPermissionCategory {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

export interface MockPrintConfig {
  id: number;
  businessId: number;
  name: string;
  value: string;
  active: boolean;
}

export interface MockMainCash {
  id: number;
  businessId: number;
  name: string;
  holder: string;
  balance: string;
}

export interface MockDB {
  businesses: MockBusiness[];
  branches: MockBranch[];
  categories: MockCategory[];
  products: MockProduct[];
  batches: MockBatch[];
  inventory: MockInventory[];
  customers: MockCustomer[];
  suppliers: MockSupplier[];
  employees: MockEmployee[];
  employeeLoans: MockEmployeeLoan[];
  payrollPeriods: MockPayrollPeriod[];
  payrollItems: MockPayrollItem[];
  invoices: MockInvoice[];
  invoiceItems: MockInvoiceItem[];
  orders: MockOrder[];
  credits: MockCredit[];
  purchases: MockPurchase[];
  deliveries: MockDelivery[];
  deliveryZones: MockDeliveryZone[];
  transfers: MockTransfer[];
  stockCounts: MockStockCount[];
  adjustments: MockAdjustment[];
  tables: MockTable[];
  tableOrderItems: MockTableOrderItem[];
  comandas: MockComanda[];
  whatsAppSessions: MockWhatsAppSession[];
  whatsAppMessages: MockWhatsAppMessage[];
  whatsAppTemplates: MockWhatsAppTemplate[];
  banks: MockBank[];
  bankTransactions: MockBankTransaction[];
  cashRegisters: MockCashRegister[];
  users: MockUser[];
  expenseConcepts: MockExpenseConcept[];
  resolutions: MockResolution[];
  taxConfigs: MockTaxConfig[];
  emailConfigs: MockEmailConfig[];
  barcodeConfigs: MockBarcodeConfig[];
  pointsConfigs: MockPointsConfig[];
  permissionCategories: MockPermissionCategory[];
  printConfigs: MockPrintConfig[];
  mainCash: MockMainCash[];
  expenses: MockExpense[];
  fixedExpenses: MockFixedExpense[];
  settings: MockBusinessSettings;
}

const defaultData: MockDB = {
  businesses: [{
    id: 1, name: 'Licorera El Puerto', slug: 'licorera-el-puerto',
    address: 'Calle Principal #123, Santo Domingo', phone: '809-555-0100',
    email: 'info@licoreraelpuerto.com', rnc: '101-12345-6',
    slogan: 'La mejor seleccion de bebidas', taxRate: '18.00',
    taxIncluded: true, currency: 'DOP', active: true, createdAt: new Date().toISOString()
  }],
  branches: [
    { id: 1, businessId: 1, name: 'Sucursal Principal', address: 'Calle Principal #123', phone: '809-555-0101', city: 'Santo Domingo', active: true, isWarehouse: false },
    { id: 2, businessId: 1, name: 'Bodega Central', address: 'Av. Industrial #45', phone: '809-555-0102', city: 'Santo Domingo', active: true, isWarehouse: true }
  ],
  categories: [
    { id: 1, businessId: 1, name: 'Cerveza Nacional', type: 'beer', active: true },
    { id: 2, businessId: 1, name: 'Cerveza Importada', type: 'beer', active: true },
    { id: 3, businessId: 1, name: 'Ron Nacional', type: 'rum', active: true },
    { id: 4, businessId: 1, name: 'Ron Importado', type: 'rum', active: true },
    { id: 5, businessId: 1, name: 'Vino Tinto', type: 'wine', active: true },
    { id: 6, businessId: 1, name: 'Vino Blanco', type: 'wine', active: true },
    { id: 7, businessId: 1, name: 'Whisky', type: 'whisky', active: true },
    { id: 8, businessId: 1, name: 'Vodka', type: 'vodka', active: true },
    { id: 9, businessId: 1, name: 'Tequila', type: 'tequila', active: true },
    { id: 10, businessId: 1, name: 'Otros', type: 'other', active: true }
  ],
  products: [
    { id: 1, businessId: 1, code: 'CERVE-001', barcode: '746010000001', name: 'Presidente Regular 355ml', description: 'Cerveza lager dominicana', categoryId: 1, subcategory: 'Nacional', brand: 'CND', cost: '45.00', price: '65.00', price2: '62.00', price3: '60.00', margin: '44.44', unit: 'botella', taxType: 'taxed', taxRate: '18.00', minStock: 24, maxStock: 500, supplierId: 1, photoUrl: '', isInventoriable: true, isBillable: true, isFavorite: true, active: true, isCombo: false, createdAt: '2024-01-15' },
    { id: 2, businessId: 1, code: 'CERVE-002', barcode: '746010000002', name: 'Presidente Light 355ml', description: 'Cerveza ligera dominicana', categoryId: 1, subcategory: 'Nacional', brand: 'CND', cost: '45.00', price: '65.00', price2: '62.00', price3: '60.00', margin: '44.44', unit: 'botella', taxType: 'taxed', taxRate: '18.00', minStock: 24, maxStock: 500, supplierId: 1, photoUrl: '', isInventoriable: true, isBillable: true, isFavorite: false, active: true, isCombo: false, createdAt: '2024-01-15' },
    { id: 3, businessId: 1, code: 'CERVE-003', barcode: '746010000003', name: 'Corona Extra 355ml', description: 'Cerveza mexicana', categoryId: 2, subcategory: 'Importado', brand: 'Grupo Modelo', cost: '55.00', price: '85.00', price2: '80.00', price3: '75.00', margin: '54.55', unit: 'botella', taxType: 'taxed', taxRate: '18.00', minStock: 12, maxStock: 200, supplierId: 2, photoUrl: '', isInventoriable: true, isBillable: true, isFavorite: false, active: true, isCombo: false, createdAt: '2024-02-10' },
    { id: 4, businessId: 1, code: 'CERVE-004', barcode: '746010000004', name: 'Heineken 330ml', description: 'Cerveza holandesa', categoryId: 2, subcategory: 'Importado', brand: 'Heineken', cost: '60.00', price: '95.00', price2: '90.00', price3: '85.00', margin: '58.33', unit: 'botella', taxType: 'taxed', taxRate: '18.00', minStock: 12, maxStock: 200, supplierId: 2, photoUrl: '', isInventoriable: true, isBillable: true, isFavorite: false, active: true, isCombo: false, createdAt: '2024-02-10' },
    { id: 5, businessId: 1, code: 'RON-001', barcode: '746010000005', name: 'Brugal Extra Viejo 750ml', description: 'Ron anejo dominicano', categoryId: 3, subcategory: 'Nacional', brand: 'Brugal', cost: '280.00', price: '450.00', price2: '430.00', price3: '400.00', margin: '60.71', unit: 'botella', taxType: 'taxed', taxRate: '18.00', minStock: 6, maxStock: 100, supplierId: 1, photoUrl: '', isInventoriable: true, isBillable: true, isFavorite: true, active: true, isCombo: false, createdAt: '2024-01-20' },
    { id: 6, businessId: 1, code: 'RON-002', barcode: '746010000006', name: 'Barcelo Imperial 750ml', description: 'Ron premium dominicano', categoryId: 3, subcategory: 'Nacional', brand: 'Barcelo', cost: '450.00', price: '750.00', price2: '720.00', price3: '700.00', margin: '66.67', unit: 'botella', taxType: 'taxed', taxRate: '18.00', minStock: 6, maxStock: 80, supplierId: 1, photoUrl: '', isInventoriable: true, isBillable: true, isFavorite: false, active: true, isCombo: false, createdAt: '2024-01-20' },
    { id: 7, businessId: 1, code: 'RON-003', barcode: '746010000007', name: 'Havana Club 7 Anos 750ml', description: 'Ron cubano', categoryId: 4, subcategory: 'Importado', brand: 'Havana Club', cost: '380.00', price: '650.00', price2: '620.00', price3: '600.00', margin: '71.05', unit: 'botella', taxType: 'taxed', taxRate: '18.00', minStock: 4, maxStock: 60, supplierId: 4, photoUrl: '', isInventoriable: true, isBillable: true, isFavorite: false, active: true, isCombo: false, createdAt: '2024-03-05' },
    { id: 8, businessId: 1, code: 'VINO-001', barcode: '746010000008', name: 'Casillero del Diablo Cabernet', description: 'Vino tinto chileno', categoryId: 5, subcategory: 'Importado', brand: 'Concha y Toro', cost: '350.00', price: '550.00', price2: '530.00', price3: '500.00', margin: '57.14', unit: 'botella', taxType: 'taxed', taxRate: '18.00', minStock: 6, maxStock: 100, supplierId: 3, photoUrl: '', isInventoriable: true, isBillable: true, isFavorite: true, active: true, isCombo: false, createdAt: '2024-02-20' },
    { id: 9, businessId: 1, code: 'VINO-002', barcode: '746010000009', name: 'Santa Carolina Reserva', description: 'Vino tinto chileno', categoryId: 5, subcategory: 'Importado', brand: 'Santa Carolina', cost: '400.00', price: '650.00', price2: '620.00', price3: '600.00', margin: '62.50', unit: 'botella', taxType: 'taxed', taxRate: '18.00', minStock: 6, maxStock: 80, supplierId: 3, photoUrl: '', isInventoriable: true, isBillable: true, isFavorite: false, active: true, isCombo: false, createdAt: '2024-02-20' },
    { id: 10, businessId: 1, code: 'VINO-003', barcode: '746010000010', name: 'Concha y Toro Chardonnay', description: 'Vino blanco chileno', categoryId: 6, subcategory: 'Importado', brand: 'Concha y Toro', cost: '320.00', price: '520.00', price2: '500.00', price3: '480.00', margin: '62.50', unit: 'botella', taxType: 'taxed', taxRate: '18.00', minStock: 6, maxStock: 80, supplierId: 3, photoUrl: '', isInventoriable: true, isBillable: true, isFavorite: false, active: true, isCombo: false, createdAt: '2024-02-20' },
    { id: 11, businessId: 1, code: 'WHIS-001', barcode: '746010000011', name: 'Johnnie Walker Red Label 750ml', description: 'Whisky escoces', categoryId: 7, subcategory: 'Importado', brand: 'Johnnie Walker', cost: '550.00', price: '950.00', price2: '900.00', price3: '850.00', margin: '72.73', unit: 'botella', taxType: 'taxed', taxRate: '18.00', minStock: 4, maxStock: 50, supplierId: 4, photoUrl: '', isInventoriable: true, isBillable: true, isFavorite: false, active: true, isCombo: false, createdAt: '2024-03-10' },
    { id: 12, businessId: 1, code: 'WHIS-002', barcode: '746010000012', name: 'Jack Daniels Old No.7 750ml', description: 'Whisky americano', categoryId: 7, subcategory: 'Importado', brand: 'Jack Daniels', cost: '600.00', price: '1050.00', price2: '1000.00', price3: '950.00', margin: '75.00', unit: 'botella', taxType: 'taxed', taxRate: '18.00', minStock: 4, maxStock: 50, supplierId: 4, photoUrl: '', isInventoriable: true, isBillable: true, isFavorite: false, active: true, isCombo: false, createdAt: '2024-03-10' },
    { id: 13, businessId: 1, code: 'VODK-001', barcode: '746010000013', name: 'Absolut Vodka 750ml', description: 'Vodka sueco', categoryId: 8, subcategory: 'Importado', brand: 'Absolut', cost: '400.00', price: '700.00', price2: '670.00', price3: '650.00', margin: '75.00', unit: 'botella', taxType: 'taxed', taxRate: '18.00', minStock: 4, maxStock: 50, supplierId: 4, photoUrl: '', isInventoriable: true, isBillable: true, isFavorite: false, active: true, isCombo: false, createdAt: '2024-03-10' },
    { id: 14, businessId: 1, code: 'TEQU-001', barcode: '746010000014', name: 'Jose Cuervo Especial 750ml', description: 'Tequila mexicano', categoryId: 9, subcategory: 'Importado', brand: 'Jose Cuervo', cost: '350.00', price: '620.00', price2: '600.00', price3: '580.00', margin: '77.14', unit: 'botella', taxType: 'taxed', taxRate: '18.00', minStock: 4, maxStock: 50, supplierId: 4, photoUrl: '', isInventoriable: true, isBillable: true, isFavorite: false, active: true, isCombo: false, createdAt: '2024-03-10' },
    { id: 15, businessId: 1, code: 'OTRO-001', barcode: '746010000015', name: 'Baileys Irish Cream 750ml', description: 'Licor de crema irlandes', categoryId: 10, subcategory: 'Importado', brand: 'Baileys', cost: '480.00', price: '850.00', price2: '820.00', price3: '800.00', margin: '77.08', unit: 'botella', taxType: 'taxed', taxRate: '18.00', minStock: 4, maxStock: 40, supplierId: 4, photoUrl: '', isInventoriable: true, isBillable: true, isFavorite: false, active: true, isCombo: false, createdAt: '2024-03-15' },
    { id: 16, businessId: 1, code: 'CERVE-005', barcode: '746010000016', name: 'Six-Pack Presidente 355ml', description: 'Pack de 6 cervezas', categoryId: 1, subcategory: 'Nacional', brand: 'CND', cost: '270.00', price: '380.00', price2: '365.00', price3: '350.00', margin: '40.74', unit: 'six-pack', taxType: 'taxed', taxRate: '18.00', minStock: 10, maxStock: 200, supplierId: 1, photoUrl: '', isInventoriable: true, isBillable: true, isFavorite: false, active: true, isCombo: true, createdAt: '2024-01-15' }
  ],
  batches: [
    { id: 1, productId: 1, batchNumber: 'L2024-001A', manufactureDate: '2024-02-01', expiryDate: '2025-08-01', quantity: 34, cost: '45.00', branchId: 1, status: 'active' },
    { id: 2, productId: 1, batchNumber: 'L2024-001B', manufactureDate: '2024-03-15', expiryDate: '2025-10-01', quantity: 14, cost: '45.00', branchId: 2, status: 'active' },
    { id: 3, productId: 5, batchNumber: 'L2024-005A', manufactureDate: '2023-01-01', expiryDate: '2028-01-01', quantity: 9, cost: '280.00', branchId: 1, status: 'active' },
    { id: 4, productId: 8, batchNumber: 'L2024-008A', manufactureDate: '2024-01-01', expiryDate: '2026-06-01', quantity: 9, cost: '350.00', branchId: 1, status: 'active' },
    { id: 5, productId: 13, batchNumber: 'L2024-013A', manufactureDate: '2024-01-01', expiryDate: '2025-12-31', quantity: 6, cost: '400.00', branchId: 1, status: 'active' },
    { id: 6, productId: 16, batchNumber: 'L2024-016A', manufactureDate: '2024-03-01', expiryDate: '2025-09-01', quantity: 15, cost: '270.00', branchId: 1, status: 'active' },
  ],
  inventory: [
    { id: 1, productId: 1, branchId: 1, batchId: 1, quantity: 34 },
    { id: 2, productId: 1, branchId: 2, batchId: 2, quantity: 14 },
    { id: 3, productId: 5, branchId: 1, batchId: 3, quantity: 9 },
    { id: 4, productId: 8, branchId: 1, batchId: 4, quantity: 9 },
    { id: 5, productId: 13, branchId: 1, batchId: 5, quantity: 6 },
    { id: 6, productId: 16, branchId: 1, batchId: 6, quantity: 15 },
  ],
  customers: [
    { id: 1, businessId: 1, name: 'Cliente de Contado', personType: 'natural', idType: 'cedula', idNumber: '000-0000000-0', firstName: 'Cliente', middleName: '', lastName: 'Contado', secondLastName: '', phone: '', phone2: '', email: '', country: 'Republica Dominicana', department: 'Santo Domingo', city: 'Santo Domingo', zone: '', neighborhood: '', address: '', birthDate: '', creditLimit: '0.00', creditOverdueLimit: '0.00', type: 'cash', tags: '', totalPurchased: '0.00', photoUrl: '', active: true },
    { id: 2, businessId: 1, name: 'Juan Perez Garcia', personType: 'natural', idType: 'cedula', idNumber: '001-1234567-8', firstName: 'Juan', middleName: 'Antonio', lastName: 'Perez', secondLastName: 'Garcia', phone: '809-555-1001', phone2: '829-555-1001', email: 'juan@email.com', country: 'Republica Dominicana', department: 'Santo Domingo', city: 'Santo Domingo', zone: 'Gazcue', neighborhood: 'Ciudad Colonial', address: 'Calle A #10, Gazcue', birthDate: '1985-03-15', creditLimit: '5000.00', creditOverdueLimit: '2000.00', type: 'credit', tags: 'VIP,Frecuente', totalPurchased: '12500.00', photoUrl: '', active: true },
    { id: 3, businessId: 1, name: 'Maria Lopez Santos', personType: 'natural', idType: 'cedula', idNumber: '002-2345678-9', firstName: 'Maria', middleName: 'Elena', lastName: 'Lopez', secondLastName: 'Santos', phone: '809-555-1002', phone2: '', email: 'maria@email.com', country: 'Republica Dominicana', department: 'Santo Domingo', city: 'Santo Domingo', zone: 'Naco', neighborhood: 'Villa Juana', address: 'Av. Independencia #55', birthDate: '1990-07-22', creditLimit: '3000.00', creditOverdueLimit: '1000.00', type: 'credit', tags: 'Frecuente', totalPurchased: '8400.00', photoUrl: '', active: true },
    { id: 4, businessId: 1, name: 'Carlos Rodriguez', personType: 'natural', idType: 'cedula', idNumber: '003-3456789-0', firstName: 'Carlos', middleName: 'Manuel', lastName: 'Rodriguez', secondLastName: '', phone: '809-555-1003', phone2: '', email: '', country: 'Republica Dominicana', department: 'Santo Domingo', city: 'Santo Domingo', zone: '', neighborhood: '', address: 'Calle El Conde #12', birthDate: '', creditLimit: '0.00', creditOverdueLimit: '0.00', type: 'cash', tags: 'Nuevo', totalPurchased: '1200.00', photoUrl: '', active: true },
    { id: 5, businessId: 1, name: 'Ana Martinez', personType: 'natural', idType: 'cedula', idNumber: '004-4567890-1', firstName: 'Ana', middleName: 'Beatriz', lastName: 'Martinez', secondLastName: 'De Leon', phone: '809-555-1004', phone2: '829-555-1004', email: 'ana@email.com', country: 'Republica Dominicana', department: 'Santo Domingo', city: 'Santo Domingo', zone: 'Piantini', neighborhood: 'Evaristo Morales', address: 'Av. Sarasota #88', birthDate: '1982-11-05', creditLimit: '8000.00', creditOverdueLimit: '3000.00', type: 'credit', tags: 'VIP', totalPurchased: '25000.00', photoUrl: '', active: true },
    { id: 6, businessId: 1, name: 'Pedro Sanchez', personType: 'natural', idType: 'cedula', idNumber: '005-5678901-2', firstName: 'Pedro', middleName: '', lastName: 'Sanchez', secondLastName: 'Fernandez', phone: '809-555-1005', phone2: '', email: '', country: 'Republica Dominicana', department: 'Santo Domingo', city: 'Santo Domingo', zone: '', neighborhood: '', address: 'Calle Hostos #33', birthDate: '', creditLimit: '0.00', creditOverdueLimit: '0.00', type: 'cash', tags: '', totalPurchased: '3200.00', photoUrl: '', active: true },
    { id: 7, businessId: 1, name: 'Luisa Fernandez', personType: 'natural', idType: 'cedula', idNumber: '006-6789012-3', firstName: 'Luisa', middleName: 'Carmen', lastName: 'Fernandez', secondLastName: 'Ruiz', phone: '809-555-1006', phone2: '', email: 'luisa@email.com', country: 'Republica Dominicana', department: 'Santo Domingo', city: 'Santo Domingo', zone: 'Ensanche Luperon', neighborhood: 'Los Prados', address: 'Av. 27 de Febrero #200', birthDate: '1978-01-30', creditLimit: '2000.00', creditOverdueLimit: '500.00', type: 'credit', tags: 'Deudor', totalPurchased: '5400.00', photoUrl: '', active: true },
    { id: 8, businessId: 1, name: 'Roberto Diaz', personType: 'natural', idType: 'cedula', idNumber: '007-7890123-4', firstName: 'Roberto', middleName: 'Alejandro', lastName: 'Diaz', secondLastName: 'Castro', phone: '809-555-1007', phone2: '', email: '', country: 'Republica Dominicana', department: 'Santo Domingo', city: 'Santo Domingo', zone: '', neighborhood: '', address: 'Calle Pellerano Alfau #5', birthDate: '', creditLimit: '0.00', creditOverdueLimit: '0.00', type: 'cash', tags: '', totalPurchased: '800.00', photoUrl: '', active: true }
  ],
  suppliers: [
    { id: 1, businessId: 1, name: 'Cerveceria Nacional Dominicana', personType: 'juridica', documentType: 'nit', rnc: '101-00001-1', dv: '', tradeName: 'CND', legalName: 'Cerveceria Nacional Dominicana S.A.', firstName: '', middleName: '', lastName: '', secondLastName: '', contact: 'Juan Perez', phone: '809-555-0201', phone2: '', email: 'ventas@cnd.com.do', country: 'Republica Dominicana', department: 'Santo Domingo', city: 'Santo Domingo', address: 'Av. Duarte #100', regime: 'General', taxResponsibility: 'Gran Contribuyente', bankName: 'Banco Popular', bankAccount: '1234567890', accountHolder: 'Cerveceria Nacional Dominicana S.A.', advancePayment: '0.00', creditDays: 30, active: true },
    { id: 2, businessId: 1, name: 'Distribuidora Caribe', personType: 'juridica', documentType: 'nit', rnc: '101-00002-2', dv: '', tradeName: 'Caribe Dist', legalName: 'Distribuidora Caribe S.R.L.', firstName: '', middleName: '', lastName: '', secondLastName: '', contact: 'Maria Garcia', phone: '809-555-0202', phone2: '', email: 'info@caribedist.com', country: 'Republica Dominicana', department: 'Santo Domingo', city: 'Santo Domingo', address: 'Calle del Sol #45', regime: 'General', taxResponsibility: 'Pequeno Contribuyente', bankName: 'BHD Leon', bankAccount: '0987654321', accountHolder: 'Distribuidora Caribe S.R.L.', advancePayment: '0.00', creditDays: 15, active: true },
    { id: 3, businessId: 1, name: 'Vinos del Mundo', personType: 'juridica', documentType: 'nit', rnc: '101-00003-3', dv: '', tradeName: 'VDM', legalName: 'Vinos del Mundo S.A.', firstName: '', middleName: '', lastName: '', secondLastName: '', contact: 'Carlos Lopez', phone: '809-555-0203', phone2: '', email: 'ventas@vinosdelmundo.com', country: 'Republica Dominicana', department: 'Santo Domingo', city: 'Santo Domingo', address: 'Av. Winston Churchill #200', regime: 'General', taxResponsibility: 'Gran Contribuyente', bankName: 'Scotiabank', bankAccount: '1122334455', accountHolder: 'Vinos del Mundo S.A.', advancePayment: '0.00', creditDays: 45, active: true },
    { id: 4, businessId: 1, name: 'Importadora Global', personType: 'juridica', documentType: 'nit', rnc: '101-00004-4', dv: '', tradeName: 'Importadora Global', legalName: 'Importadora Global S.A.', firstName: '', middleName: '', lastName: '', secondLastName: '', contact: 'Ana Martinez', phone: '809-555-0204', phone2: '', email: 'import@global.com', country: 'Republica Dominicana', department: 'Santo Domingo', city: 'Santo Domingo', address: 'Zona Industrial Hainamosa', regime: 'General', taxResponsibility: 'Gran Contribuyente', bankName: 'Banco Popular', bankAccount: '5566778899', accountHolder: 'Importadora Global S.A.', advancePayment: '0.00', creditDays: 60, active: true }
  ],
  employees: [
    { id: 1, businessId: 1, firstName: 'Carlos', middleName: 'Manuel', lastName: 'Rodriguez', secondLastName: 'Santos', idNumber: '001-1111111-1', phone: '809-555-3001', email: 'carlos@licorera.com', address: 'Calle Principal #50', city: 'Santo Domingo', position: 'Gerente General', branchId: 1, hireDate: '2024-01-15', salary: '45000.00', photoUrl: '', active: true },
    { id: 2, businessId: 1, firstName: 'Maria', middleName: 'Elena', lastName: 'Fernandez', secondLastName: 'Lopez', idNumber: '002-2222222-2', phone: '809-555-3002', email: 'maria.f@licorera.com', address: 'Av. Independencia #20', city: 'Santo Domingo', position: 'Cajera', branchId: 1, hireDate: '2024-02-01', salary: '22000.00', photoUrl: '', active: true },
    { id: 3, businessId: 1, firstName: 'Jose', middleName: 'Antonio', lastName: 'Garcia', secondLastName: 'Perez', idNumber: '003-3333333-3', phone: '809-555-3003', email: 'jose@licorera.com', address: 'Calle El Conde #15', city: 'Santo Domingo', position: 'Vendedor', branchId: 1, hireDate: '2024-03-10', salary: '18000.00', photoUrl: '', active: true },
    { id: 4, businessId: 1, firstName: 'Laura', middleName: 'Beatriz', lastName: 'Martinez', secondLastName: 'Diaz', idNumber: '004-4444444-4', phone: '809-555-3004', email: 'laura@licorera.com', address: 'Av. 27 de Febrero #100', city: 'Santo Domingo', position: 'Almacenista', branchId: 2, hireDate: '2024-01-20', salary: '20000.00', photoUrl: '', active: true },
  ],
  employeeLoans: [
    { id: 1, employeeId: 2, employeeName: 'Maria Elena Fernandez Lopez', amount: '5000.00', balance: '3000.00', installments: 5, installmentAmount: '1000.00', status: 'active', startDate: '2025-01-15', notes: 'Prestamo para gastos medicos', payments: [
      { id: 1, loanId: 1, amount: '1000.00', date: '2025-02-15', notes: '' },
      { id: 2, loanId: 1, amount: '1000.00', date: '2025-03-15', notes: '' }
    ]},
    { id: 2, employeeId: 3, employeeName: 'Jose Antonio Garcia Perez', amount: '3000.00', balance: '1500.00', installments: 3, installmentAmount: '1000.00', status: 'active', startDate: '2025-02-01', notes: 'Prestamo personal', payments: [
      { id: 3, loanId: 2, amount: '1500.00', date: '2025-03-01', notes: 'Abono extraordinario' }
    ]},
  ],
  invoices: [
    { id: 1, number: 'A-000001', customerId: 2, customerName: 'Juan Perez Garcia', userId: 1, branchId: 1, branchName: 'Sucursal Principal', date: '2026-04-25', subtotal: '845.00', discount: '0.00', tax: '152.10', total: '997.10', paymentMethod: 'cash', status: 'paid', notes: '', businessId: 1, isDelivery: false },
    { id: 2, number: 'A-000002', customerId: 3, customerName: 'Maria Lopez Santos', userId: 1, branchId: 1, branchName: 'Sucursal Principal', date: '2026-04-24', subtotal: '1200.00', discount: '50.00', tax: '207.00', total: '1357.00', paymentMethod: 'card', status: 'paid', notes: '', businessId: 1, isDelivery: false },
    { id: 3, number: 'A-000003', customerId: 5, customerName: 'Ana Martinez', userId: 1, branchId: 1, branchName: 'Sucursal Principal', date: '2026-04-23', subtotal: '2400.00', discount: '0.00', tax: '432.00', total: '2832.00', paymentMethod: 'credit', status: 'pending', notes: 'Venta a credito', businessId: 1, isDelivery: true },
    { id: 4, number: 'A-000004', customerId: 4, customerName: 'Carlos Rodriguez', userId: 1, branchId: 1, branchName: 'Sucursal Principal', date: '2026-04-22', subtotal: '195.00', discount: '0.00', tax: '35.10', total: '230.10', paymentMethod: 'cash', status: 'paid', notes: '', businessId: 1, isDelivery: false },
    { id: 5, number: 'A-000005', customerId: 6, customerName: 'Pedro Sanchez', userId: 1, branchId: 1, branchName: 'Sucursal Principal', date: '2026-04-20', subtotal: '520.00', discount: '20.00', tax: '90.00', total: '590.00', paymentMethod: 'transfer', status: 'paid', notes: '', businessId: 1, isDelivery: false },
    { id: 6, number: 'A-000006', customerId: 2, customerName: 'Juan Perez Garcia', userId: 1, branchId: 1, branchName: 'Sucursal Principal', date: '2026-04-18', subtotal: '1300.00', discount: '0.00', tax: '234.00', total: '1534.00', paymentMethod: 'cash', status: 'paid', notes: '', businessId: 1, isDelivery: true },
  ],
  invoiceItems: [
    { id: 1, invoiceId: 1, productId: 1, productName: 'Presidente Regular 355ml', quantity: 5, price: '65.00', discount: '0.00', tax: '58.50', total: '383.50' },
    { id: 2, invoiceId: 1, productId: 5, productName: 'Brugal Extra Viejo 750ml', quantity: 1, price: '450.00', discount: '0.00', tax: '81.00', total: '531.00' },
    { id: 3, invoiceId: 1, productId: 13, productName: 'Absolut Vodka 750ml', quantity: 1, price: '700.00', discount: '0.00', tax: '0.00', total: '0.00' },
    { id: 4, invoiceId: 2, productId: 8, productName: 'Casillero del Diablo Cabernet', quantity: 2, price: '550.00', discount: '50.00', tax: '171.00', total: '1121.00' },
    { id: 5, invoiceId: 2, productId: 3, productName: 'Corona Extra 355ml', quantity: 2, price: '85.00', discount: '0.00', tax: '30.60', total: '200.60' },
    { id: 6, invoiceId: 3, productId: 11, productName: 'Johnnie Walker Red Label 750ml', quantity: 2, price: '950.00', discount: '0.00', tax: '342.00', total: '2242.00' },
    { id: 7, invoiceId: 3, productId: 14, productName: 'Jose Cuervo Especial 750ml', quantity: 1, price: '620.00', discount: '0.00', tax: '90.00', total: '590.00' },
  ],
  orders: [
    { id: 1, number: 'COT-000001', customerId: 5, customerName: 'Ana Martinez', branchId: 1, branchName: 'Sucursal Principal', date: '2026-04-25', subtotal: '1850.00', discount: '0.00', tax: '333.00', total: '2183.00', status: 'approved', notes: 'Cliente frecuente', businessId: 1, items: [{ id: 1, orderId: 1, productId: 12, productName: 'Jack Daniels Old No.7 750ml', quantity: 1, price: '1050.00', total: '1050.00' }, { id: 2, orderId: 1, productId: 15, productName: 'Baileys Irish Cream 750ml', quantity: 1, price: '850.00', total: '850.00' }] },
    { id: 2, number: 'COT-000002', customerId: 3, customerName: 'Maria Lopez Santos', branchId: 1, branchName: 'Sucursal Principal', date: '2026-04-23', subtotal: '650.00', discount: '0.00', tax: '117.00', total: '767.00', status: 'draft', notes: '', businessId: 1, items: [{ id: 3, orderId: 2, productId: 9, productName: 'Santa Carolina Reserva', quantity: 1, price: '650.00', total: '650.00' }] },
    { id: 3, number: 'COT-000003', customerId: 7, customerName: 'Luisa Fernandez', branchId: 1, branchName: 'Sucursal Principal', date: '2026-04-20', subtotal: '380.00', discount: '0.00', tax: '68.40', total: '448.40', status: 'sent', notes: '', businessId: 1, items: [{ id: 4, orderId: 3, productId: 16, productName: 'Six-Pack Presidente 355ml', quantity: 1, price: '380.00', total: '380.00' }] },
    { id: 4, number: 'COT-000004', customerId: 8, customerName: 'Roberto Diaz', branchId: 1, branchName: 'Sucursal Principal', date: '2026-04-18', subtotal: '650.00', discount: '0.00', tax: '117.00', total: '767.00', status: 'rejected', notes: 'Precio no aceptado', businessId: 1, items: [{ id: 5, orderId: 4, productId: 7, productName: 'Havana Club 7 Anos 750ml', quantity: 1, price: '650.00', total: '650.00' }] },
    { id: 5, number: 'COT-000005', customerId: 2, customerName: 'Juan Perez Garcia', branchId: 1, branchName: 'Sucursal Principal', date: '2026-04-15', subtotal: '260.00', discount: '0.00', tax: '46.80', total: '306.80', status: 'converted', notes: '', businessId: 1, items: [{ id: 6, orderId: 5, productId: 2, productName: 'Presidente Light 355ml', quantity: 4, price: '65.00', total: '260.00' }] },
  ],
  credits: [
    { id: 1, customerId: 2, customerName: 'Juan Perez Garcia', invoiceId: 3, totalAmount: '2832.00', balance: '1500.00', installments: 3, interestRate: '2.00', status: 'current', startDate: '2026-04-23', dueDate: '2026-05-23', businessId: 1, payments: [{ id: 1, creditId: 1, amount: '1332.00', date: '2026-04-24', method: 'cash', notes: 'Primer pago' }] },
    { id: 2, customerId: 3, customerName: 'Maria Lopez Santos', totalAmount: '5400.00', balance: '2100.00', installments: 6, interestRate: '2.00', status: 'current', startDate: '2026-03-15', dueDate: '2026-05-15', businessId: 1, payments: [{ id: 2, creditId: 2, amount: '1800.00', date: '2026-03-30', method: 'transfer', notes: '' }, { id: 3, creditId: 2, amount: '1500.00', date: '2026-04-15', method: 'cash', notes: '' }] },
    { id: 3, customerId: 7, customerName: 'Luisa Fernandez', totalAmount: '3200.00', balance: '3200.00', installments: 4, interestRate: '2.00', status: 'overdue', startDate: '2026-03-01', dueDate: '2026-04-01', businessId: 1, payments: [] },
    { id: 4, customerId: 5, customerName: 'Ana Martinez', totalAmount: '15000.00', balance: '0.00', installments: 6, interestRate: '1.50', status: 'paid', startDate: '2026-01-10', dueDate: '2026-04-10', businessId: 1, payments: [{ id: 4, creditId: 4, amount: '2500.00', date: '2026-02-10', method: 'transfer', notes: '' }, { id: 5, creditId: 4, amount: '2500.00', date: '2026-03-10', method: 'transfer', notes: '' }, { id: 6, creditId: 4, amount: '2500.00', date: '2026-04-10', method: 'transfer', notes: '' }] },
  ],
  purchases: [
    { id: 1, supplierId: 1, supplierName: 'Cerveceria Nacional Dominicana', branchId: 1, branchName: 'Sucursal Principal', invoiceNumber: 'FAC-CND-001', date: '2026-04-20', subtotal: '12500.00', discount: '500.00', tax: '2160.00', total: '14160.00', paymentMethod: 'credit', status: 'pending', businessId: 1, items: [{ id: 1, purchaseId: 1, productId: 1, productName: 'Presidente Regular 355ml', quantity: 200, cost: '45.00', total: '9000.00' }, { id: 2, purchaseId: 1, productId: 2, productName: 'Presidente Light 355ml', quantity: 80, cost: '45.00', total: '3600.00' }] },
    { id: 2, supplierId: 3, supplierName: 'Vinos del Mundo', branchId: 1, branchName: 'Sucursal Principal', invoiceNumber: 'FAC-VDM-045', date: '2026-04-15', subtotal: '5400.00', discount: '0.00', tax: '972.00', total: '6372.00', paymentMethod: 'cash', status: 'paid', businessId: 1, items: [{ id: 3, purchaseId: 2, productId: 8, productName: 'Casillero del Diablo Cabernet', quantity: 12, cost: '350.00', total: '4200.00' }, { id: 4, purchaseId: 2, productId: 9, productName: 'Santa Carolina Reserva', quantity: 3, cost: '400.00', total: '1200.00' }] },
  ],
  deliveries: [
    { id: 1, customerName: 'Ana Martinez', customerPhone: '809-555-1004', address: 'Av. Sarasota #88, Santo Domingo', references: 'Torre azul, apto 3B', zoneId: 1, zoneName: 'Zona Centro', deliveryCost: '100.00', paymentMethod: 'card', status: 'delivered', notes: 'Entregado rapidamente', businessId: 1, branchId: 1, branchName: 'Sucursal Principal', createdAt: '2026-04-25T10:00:00Z', deliveredAt: '2026-04-25T11:30:00Z' },
    { id: 2, customerName: 'Juan Perez Garcia', customerPhone: '809-555-1001', address: 'Calle A #10, Gazcue, Santo Domingo', references: 'Casa azul, al lado de la farmacia', zoneId: 1, zoneName: 'Zona Centro', deliveryCost: '100.00', paymentMethod: 'cash', status: 'shipping', notes: '', businessId: 1, branchId: 1, branchName: 'Sucursal Principal', createdAt: '2026-04-25T14:00:00Z' },
    { id: 3, customerName: 'Luisa Fernandez', customerPhone: '809-555-1006', address: 'Av. 27 de Febrero #200, Santo Domingo', references: 'Edificio Horizonte', zoneId: 2, zoneName: 'Zona Norte', deliveryCost: '150.00', paymentMethod: 'cash', status: 'preparing', notes: '', businessId: 1, branchId: 1, branchName: 'Sucursal Principal', createdAt: '2026-04-25T16:00:00Z' },
    { id: 4, customerName: 'Maria Lopez Santos', customerPhone: '809-555-1002', address: 'Av. Independencia #55, Santo Domingo', references: 'Apto 3B', zoneId: 1, zoneName: 'Zona Centro', deliveryCost: '100.00', paymentMethod: 'online', status: 'received', notes: '', businessId: 1, branchId: 1, branchName: 'Sucursal Principal', createdAt: '2026-04-26T09:00:00Z' },
    { id: 5, customerName: 'Pedro Sanchez', customerPhone: '809-555-1005', address: 'Calle Hostos #33, Santo Domingo', references: 'Casa verde', zoneId: 3, zoneName: 'Zona Este', deliveryCost: '200.00', paymentMethod: 'cash', status: 'ready', notes: '', businessId: 1, branchId: 1, branchName: 'Sucursal Principal', createdAt: '2026-04-26T08:30:00Z' },
    { id: 6, customerName: 'Roberto Diaz', customerPhone: '809-555-1007', address: 'Calle Pellerano Alfau #5, Santo Domingo', references: '', zoneId: 1, zoneName: 'Zona Centro', deliveryCost: '100.00', paymentMethod: 'cash', status: 'cancelled', notes: 'Cliente cancelo', businessId: 1, branchId: 1, branchName: 'Sucursal Principal', createdAt: '2026-04-24T10:00:00Z' },
  ],
  deliveryZones: [
    { id: 1, businessId: 1, name: 'Zona Centro', description: 'Gazcue, Ciudad Colonial, Ensanche La Fe', deliveryCost: '100.00', color: '#E30A17', minOrderFree: '1000.00' },
    { id: 2, businessId: 1, name: 'Zona Norte', description: 'Naco, Piantini, Serralles', deliveryCost: '150.00', color: '#1AB2B3', minOrderFree: '1500.00' },
    { id: 3, businessId: 1, name: 'Zona Este', description: 'Villa Oriental, San Isidro', deliveryCost: '200.00', color: '#FF4C5B', minOrderFree: '2000.00' }
  ],
  transfers: [],
  stockCounts: [],
  adjustments: [
    { id: 1, productId: 1, productName: 'Presidente Regular 355ml', productCode: 'CERVE-001', branchId: 1, branchName: 'Sucursal Principal', previousQty: 50, adjustedQty: -1, currentQty: 49, reason: 'Factura A-000001', type: 'decrease', source: 'invoice', notes: 'Venta POS', createdAt: '2026-04-25T14:30:00Z', businessId: 1, userName: 'Admin Demo' },
    { id: 2, productId: 5, productName: 'Brugal Extra Viejo 750ml', productCode: 'RON-001', branchId: 1, branchName: 'Sucursal Principal', previousQty: 10, adjustedQty: -1, currentQty: 9, reason: 'Factura A-000001', type: 'decrease', source: 'invoice', notes: 'Venta POS', createdAt: '2026-04-25T14:30:00Z', businessId: 1, userName: 'Admin Demo' },
    { id: 3, productId: 1, productName: 'Presidente Regular 355ml', productCode: 'CERVE-001', branchId: 1, branchName: 'Sucursal Principal', previousQty: 49, adjustedQty: -5, currentQty: 44, reason: 'Factura A-000002', type: 'decrease', source: 'invoice', notes: 'Venta a cliente', createdAt: '2026-04-24T10:15:00Z', businessId: 1, userName: 'Admin Demo' },
    { id: 4, productId: 8, productName: 'Casillero del Diablo Cabernet', productCode: 'VINO-001', branchId: 1, branchName: 'Sucursal Principal', previousQty: 10, adjustedQty: -2, currentQty: 8, reason: 'Factura A-000002', type: 'decrease', source: 'invoice', notes: 'Venta a cliente', createdAt: '2026-04-24T10:15:00Z', businessId: 1, userName: 'Admin Demo' },
    { id: 5, productId: 13, productName: 'Absolut Vodka 750ml', productCode: 'VODK-001', branchId: 1, branchName: 'Sucursal Principal', previousQty: 7, adjustedQty: 5, currentQty: 12, reason: 'Compra a proveedor', type: 'increase', source: 'purchase', notes: 'Recepcion de mercancia', createdAt: '2026-04-20T09:00:00Z', businessId: 1, userName: 'Admin Demo' },
    { id: 6, productId: 16, productName: 'Six-Pack Presidente 355ml', productCode: 'CERVE-005', branchId: 1, branchName: 'Sucursal Principal', previousQty: 10, adjustedQty: 5, currentQty: 15, reason: 'Compra a proveedor', type: 'increase', source: 'purchase', notes: 'Recepcion de mercancia', createdAt: '2026-04-20T09:00:00Z', businessId: 1, userName: 'Admin Demo' },
  ],
  settings: { id: 1, businessId: 1, invoicePrefix: 'A-', invoiceNextNumber: 7, orderPrefix: 'COT-', orderNextNumber: 6, purchasePrefix: 'COM-', purchaseNextNumber: 3, transferPrefix: 'TR-', transferNextNumber: 1, creditInterestRate: '2.00', creditGraceDays: 3, expiryAlertDays: 7 },
  banks: [
    { id: 1, businessId: 1, name: 'Banco Popular', accountHolder: 'SMART LIQUOR STORE', accountNumber: '1234567890', accountType: 'Ahorros', balance: '1841108.46', active: true },
    { id: 2, businessId: 1, name: 'Banco BHD', accountHolder: 'SMART LIQUOR STORE', accountNumber: '0987654321', accountType: 'Corriente', balance: '500000.00', active: true }
  ],
  bankTransactions: [
    { id: 1, bankId: 1, type: 'expense', description: 'Compra N° 649 POS', amount: '6600.24', balanceBefore: '1847708.70', balanceAfter: '1841108.46', operation: 'Compra', personName: 'Proveedor POS', createdAt: '2026-04-25T18:00:00Z', userName: 'JOSE DEVAREZ' },
    { id: 2, bankId: 1, type: 'transfer', description: 'Transferencia a Caja 2', amount: '5000.00', balanceBefore: '1852708.70', balanceAfter: '1847708.70', operation: 'Caja Abierta', personName: 'Caja 2', createdAt: '2026-04-25T16:00:00Z', userName: 'JOSE DEVAREZ' }
  ],
  cashRegisters: [
    { id: 1, businessId: 1, branchId: 1, name: 'CAJA 1', serial: '1', location: 'Recepcion', status: 'open', baseAmount: '5000.00', currentAmount: '15700.00', openedAt: '2026-04-25T08:00:00Z' },
    { id: 2, businessId: 1, branchId: 1, name: 'CAJA 2', serial: '2', location: 'Barra', status: 'closed', baseAmount: '3000.00', currentAmount: '3000.00', openedAt: '2026-04-24T08:00:00Z', closedAt: '2026-04-24T20:00:00Z' }
  ],
  users: [
    { id: 1, businessId: 1, fullName: 'ALEJANDRO ACOSTA', email: 'ALEJANDRO@MASCONTROL.COM', password: 'admin123', type: 'admin', active: true, createdAt: '2026-01-01T00:00:00Z' },
    { id: 2, businessId: 1, fullName: 'JOSE DEVAREZ', email: 'SMARTLIQUORSTORE@MASCONTROL.COM', password: 'admin123', type: 'admin', active: true, createdAt: '2026-01-01T00:00:00Z' },
    { id: 3, businessId: 1, fullName: 'smart billar', email: 'smartbillar@MASCONTROL.COM', password: 'user123', type: 'user', branchId: 1, active: true, createdAt: '2026-01-01T00:00:00Z' },
    { id: 4, businessId: 1, fullName: 'VENTA DE VAPE', email: 'VENTADEVAPE@MASCONTROL.COM', password: 'user123', type: 'user', active: true, createdAt: '2026-01-01T00:00:00Z' },
    { id: 5, businessId: 1, fullName: 'YASEL VAPES', email: 'YASELVAPES@MASCONTROL.COM', password: 'user123', type: 'user', active: true, createdAt: '2026-01-01T00:00:00Z' }
  ],
  expenseConcepts: [
    { id: 1, businessId: 1, type: 'income', code: '0001', concept: 'Ventas' },
    { id: 2, businessId: 1, type: 'income', code: '0002', concept: 'Ventas servicios' },
    { id: 3, businessId: 1, type: 'income', code: '0003', concept: 'Ventas servicios sin facturar' },
    { id: 4, businessId: 1, type: 'income', code: '0004', concept: 'Notas Debito, devolucion de dinero por parte del proveedor' },
    { id: 5, businessId: 1, type: 'income', code: '0005', concept: 'Deudas De clientes' },
    { id: 6, businessId: 1, type: 'income', code: '0006', concept: 'Abonos de creditos de nomina' },
    { id: 7, businessId: 1, type: 'income', code: '0007', concept: 'Otros ingresos' },
    { id: 8, businessId: 1, type: 'expense', code: '0008', concept: 'Compras' },
    { id: 9, businessId: 1, type: 'expense', code: '0009', concept: 'Compras inventario inicial' },
    { id: 10, businessId: 1, type: 'expense', code: '0010', concept: 'Gastos' },
    { id: 11, businessId: 1, type: 'expense', code: '0011', concept: 'Arriendo' },
    { id: 12, businessId: 1, type: 'expense', code: '0012', concept: 'Documentos equivalentes' },
    { id: 13, businessId: 1, type: 'expense', code: '0013', concept: 'Deudas a proveedores' },
    { id: 14, businessId: 1, type: 'expense', code: '0014', concept: 'Nomina' },
    { id: 15, businessId: 1, type: 'expense', code: '0015', concept: 'Creditos de nomina' },
    { id: 16, businessId: 1, type: 'expense', code: '0016', concept: 'Nomina auxilio de transporte' },
    { id: 17, businessId: 1, type: 'expense', code: '0017', concept: 'Nomina adicionales' }
  ],
  resolutions: [
    { id: 1, businessId: 1, type: 'equivalent', prefix: 'FACT', resolution: '18763008356001', startDate: '2024-10-31', endDate: '2026-10-31', startNumber: '1', endNumber: '100000000', currentNumber: '56827', active: true, createdAt: '2024-10-31T00:00:00Z' }
  ],
  taxConfigs: [
    { id: 1, businessId: 1, name: 'ITBIS', rate: 18, type: 'ITBIS', active: true, isDefault: true },
    { id: 2, businessId: 1, name: 'null', rate: 20, type: 'null', active: true, isDefault: false }
  ],
  emailConfigs: [
    { id: 1, businessId: 1, emailType: 'Gmail', host: 'smtp.gmail.com', port: '587', email: 'ejemplo@gmail.com', password: 'xxxx', encryption: 'tls' }
  ],
  barcodeConfigs: [
    { id: 1, businessId: 1, columns: 3, showPrice: true, showCode: true, showName: true }
  ],
  pointsConfigs: [
    { id: 1, businessId: 1, pointValue: '10.00', pointsPerAmount: '1000', minRedeem: 100, active: true }
  ],
  permissionCategories: [
    { id: 1, name: 'Cajas', description: 'Permisos de cajas', active: true },
    { id: 2, name: 'Celulares', description: 'Permisos de celulares', active: false },
    { id: 3, name: 'Clientes', description: 'Permisos de clientes', active: true },
    { id: 4, name: 'Compras', description: 'Permisos de compras', active: true },
    { id: 5, name: 'Creditos', description: 'Permisos de creditos', active: true },
    { id: 6, name: 'Facturacion', description: 'Permisos de facturacion', active: true },
    { id: 7, name: 'General', description: 'Permisos generales', active: true },
    { id: 8, name: 'Impresiones', description: 'Permisos de impresiones', active: true },
    { id: 9, name: 'Ingresos - Egresos', description: 'Permisos de ingresos y egresos', active: true },
    { id: 10, name: 'Inventario', description: 'Permisos de inventario', active: true },
    { id: 11, name: 'Ordenes de Venta', description: 'Permisos de ordenes', active: true },
    { id: 12, name: 'Proveedores', description: 'Permisos de proveedores', active: true },
    { id: 13, name: 'Reportes', description: 'Permisos de reportes', active: true },
    { id: 14, name: 'Restaurantes', description: 'Permisos de restaurantes', active: true },
    { id: 15, name: 'Tienda Multi', description: 'Permisos de tienda multi', active: true }
  ],
  printConfigs: [
    { id: 1, businessId: 1, name: 'Nombre empresa', value: '1', active: true },
    { id: 2, businessId: 1, name: 'NIT', value: '2', active: true },
    { id: 3, businessId: 1, name: 'Direccion', value: '3', active: true },
    { id: 4, businessId: 1, name: 'Telefono', value: '5', active: true },
    { id: 5, businessId: 1, name: 'Logo', value: '6', active: true },
    { id: 6, businessId: 1, name: 'Numero factura', value: '7', active: true },
    { id: 7, businessId: 1, name: 'Caja', value: '9', active: true },
    { id: 8, businessId: 1, name: 'Vendedor', value: '10', active: true },
    { id: 9, businessId: 1, name: 'Cliente info total', value: '11', active: true },
    { id: 10, businessId: 1, name: 'Forma de pago', value: '12', active: true },
    { id: 11, businessId: 1, name: 'Responsabilidad empresa', value: '13', active: true },
    { id: 12, businessId: 1, name: 'Terminos y condiciones', value: '14', active: true },
    { id: 13, businessId: 1, name: 'Texto informativo', value: '15', active: true },
    { id: 14, businessId: 1, name: 'Impuestos', value: '18', active: true }
  ],
  expenses: [
    { id: 1, businessId: 1, branchId: 1, conceptId: 10, conceptName: 'Gastos', type: 'expense', amount: '2500.00', description: 'Compra de material de limpieza', documentUrl: '', date: '2026-04-20', userName: 'Admin Demo', createdAt: '2026-04-20T10:00:00Z' },
    { id: 2, businessId: 1, branchId: 1, conceptId: 11, conceptName: 'Arriendo', type: 'expense', amount: '35000.00', description: 'Pago arriendo local', documentUrl: '', date: '2026-04-01', userName: 'Admin Demo', createdAt: '2026-04-01T08:00:00Z' },
    { id: 3, businessId: 1, branchId: 1, conceptId: 1, conceptName: 'Ventas', type: 'income', amount: '15000.00', description: 'Ingreso por venta de equipos', documentUrl: '', date: '2026-04-22', userName: 'Admin Demo', createdAt: '2026-04-22T14:00:00Z' },
    { id: 4, businessId: 1, branchId: 1, conceptId: 14, conceptName: 'Nomina', type: 'expense', amount: '52500.00', description: 'Pago nomina quincenal', documentUrl: '', date: '2026-04-15', userName: 'Admin Demo', createdAt: '2026-04-15T10:00:00Z' }
  ],
  fixedExpenses: [
    { id: 1, businessId: 1, name: 'Arriendo Local', amount: '35000.00', frequency: 'monthly', dayOfPayment: 1, description: 'Arriendo mensual del local comercial', active: true, nextPaymentDate: '2026-05-01', createdAt: '2026-01-01T00:00:00Z' },
    { id: 2, businessId: 1, name: 'Internet y Telefono', amount: '4500.00', frequency: 'monthly', dayOfPayment: 5, description: 'Servicio de internet y telefonia', active: true, nextPaymentDate: '2026-05-05', createdAt: '2026-01-01T00:00:00Z' },
    { id: 3, businessId: 1, name: 'Seguridad', amount: '8000.00', frequency: 'monthly', dayOfPayment: 15, description: 'Servicio de vigilancia privada', active: true, nextPaymentDate: '2026-05-15', createdAt: '2026-01-01T00:00:00Z' }
  ],
  mainCash: [
    { id: 1, businessId: 1, name: 'CAJA MAYOR', holder: 'SMART LIQUOR STORE', balance: '1841108.46' }
  ],
  payrollPeriods: [
    { id: 1, businessId: 1, periodType: 'quincena', startDate: '2026-04-01', endDate: '2026-04-15', status: 'paid', totalAmount: '103500.00', notes: 'Primera quincena abril 2026', createdAt: '2026-04-15T10:00:00Z', paidAt: '2026-04-15T12:00:00Z' },
    { id: 2, businessId: 1, periodType: 'quincena', startDate: '2026-04-16', endDate: '2026-04-30', status: 'processed', totalAmount: '103500.00', notes: 'Segunda quincena abril 2026', createdAt: '2026-04-30T10:00:00Z' },
    { id: 3, businessId: 1, periodType: 'mensual', startDate: '2026-03-01', endDate: '2026-03-31', status: 'paid', totalAmount: '105000.00', notes: 'Nomina marzo 2026', createdAt: '2026-03-31T10:00:00Z', paidAt: '2026-03-31T14:00:00Z' }
  ],
  payrollItems: [
    { id: 1, payrollId: 1, employeeId: 1, employeeName: 'Carlos Manuel Rodriguez Santos', baseSalary: '22500.00', overtime: '0.00', bonus: '0.00', deductions: '0.00', loanDeduction: '0.00', netPay: '22500.00', paymentMethod: 'transfer', status: 'paid', paymentDate: '2026-04-15', notes: '' },
    { id: 2, payrollId: 1, employeeId: 2, employeeName: 'Maria Elena Fernandez Lopez', baseSalary: '11000.00', overtime: '500.00', bonus: '0.00', deductions: '0.00', loanDeduction: '1000.00', netPay: '10500.00', paymentMethod: 'transfer', status: 'paid', paymentDate: '2026-04-15', notes: 'Deduccion prestamo' },
    { id: 3, payrollId: 1, employeeId: 3, employeeName: 'Jose Antonio Garcia Perez', baseSalary: '9000.00', overtime: '0.00', bonus: '0.00', deductions: '0.00', loanDeduction: '0.00', netPay: '9000.00', paymentMethod: 'cash', status: 'paid', paymentDate: '2026-04-15', notes: '' },
    { id: 4, payrollId: 1, employeeId: 4, employeeName: 'Laura Beatriz Martinez Diaz', baseSalary: '10000.00', overtime: '0.00', bonus: '0.00', deductions: '0.00', loanDeduction: '0.00', netPay: '10000.00', paymentMethod: 'transfer', status: 'paid', paymentDate: '2026-04-15', notes: '' },
    { id: 5, payrollId: 2, employeeId: 1, employeeName: 'Carlos Manuel Rodriguez Santos', baseSalary: '22500.00', overtime: '0.00', bonus: '0.00', deductions: '0.00', loanDeduction: '0.00', netPay: '22500.00', paymentMethod: 'transfer', status: 'pending', paymentDate: '', notes: '' },
    { id: 6, payrollId: 2, employeeId: 2, employeeName: 'Maria Elena Fernandez Lopez', baseSalary: '11000.00', overtime: '0.00', bonus: '0.00', deductions: '0.00', loanDeduction: '1000.00', netPay: '10000.00', paymentMethod: 'transfer', status: 'pending', paymentDate: '', notes: 'Deduccion prestamo' },
    { id: 7, payrollId: 2, employeeId: 3, employeeName: 'Jose Antonio Garcia Perez', baseSalary: '9000.00', overtime: '0.00', bonus: '0.00', deductions: '0.00', loanDeduction: '0.00', netPay: '9000.00', paymentMethod: 'cash', status: 'pending', paymentDate: '', notes: '' },
    { id: 8, payrollId: 2, employeeId: 4, employeeName: 'Laura Beatriz Martinez Diaz', baseSalary: '10000.00', overtime: '0.00', bonus: '0.00', deductions: '0.00', loanDeduction: '0.00', netPay: '10000.00', paymentMethod: 'transfer', status: 'pending', paymentDate: '', notes: '' }
  ],
  tables: [
    { id: 1, businessId: 1, branchId: 1, name: 'Mesa 1', capacity: 4, status: 'occupied', currentOrderId: 1, orderTotal: '850.00', createdAt: '2026-01-01T00:00:00Z' },
    { id: 2, businessId: 1, branchId: 1, name: 'Mesa 2', capacity: 2, status: 'free', currentOrderId: undefined, orderTotal: '0.00', createdAt: '2026-01-01T00:00:00Z' },
    { id: 3, businessId: 1, branchId: 1, name: 'Mesa 3', capacity: 6, status: 'occupied', currentOrderId: 2, orderTotal: '1240.00', createdAt: '2026-01-01T00:00:00Z' },
    { id: 4, businessId: 1, branchId: 1, name: 'Barra 1', capacity: 2, status: 'reserved', currentOrderId: undefined, orderTotal: '0.00', createdAt: '2026-01-01T00:00:00Z' },
    { id: 5, businessId: 1, branchId: 1, name: 'Barra 2', capacity: 2, status: 'free', currentOrderId: undefined, orderTotal: '0.00', createdAt: '2026-01-01T00:00:00Z' },
    { id: 6, businessId: 1, branchId: 1, name: 'Terraza 1', capacity: 8, status: 'free', currentOrderId: undefined, orderTotal: '0.00', createdAt: '2026-01-01T00:00:00Z' }
  ],
  tableOrderItems: [
    { id: 1, tableId: 1, productId: 1, productName: 'Presidente Regular 355ml', quantity: 4, price: '65.00', total: '260.00', notes: '', status: 'served', addedAt: '2026-04-25T19:00:00Z' },
    { id: 2, tableId: 1, productId: 5, productName: 'Brugal Extra Viejo 750ml', quantity: 1, price: '450.00', total: '450.00', notes: 'Con hielo', status: 'served', addedAt: '2026-04-25T19:05:00Z' },
    { id: 3, tableId: 1, productId: 3, productName: 'Corona Extra 355ml', quantity: 2, price: '85.00', total: '170.00', notes: '', status: 'pending', addedAt: '2026-04-25T19:30:00Z' },
    { id: 4, tableId: 3, productId: 8, productName: 'Casillero del Diablo Cabernet', quantity: 1, price: '550.00', total: '550.00', notes: 'Servir frio', status: 'served', addedAt: '2026-04-25T18:30:00Z' },
    { id: 5, tableId: 3, productId: 13, productName: 'Absolut Vodka 750ml', quantity: 1, price: '700.00', total: '700.00', notes: '', status: 'served', addedAt: '2026-04-25T18:35:00Z' }
  ],
  comandas: [
    { id: 1, number: 'COM-000001', businessId: 1, branchId: 1, tableId: 1, tableName: 'Mesa 1', customerName: 'Grupo Lopez', status: 'preparing', items: [
      { id: 1, comandaId: 1, productId: 1, productName: 'Presidente Regular 355ml', quantity: 4, price: '65.00', total: '260.00', notes: '', status: 'ready' },
      { id: 2, comandaId: 1, productId: 5, productName: 'Brugal Extra Viejo 750ml', quantity: 1, price: '450.00', total: '450.00', notes: 'Con hielo', status: 'preparing' },
      { id: 3, comandaId: 1, productId: 3, productName: 'Corona Extra 355ml', quantity: 2, price: '85.00', total: '170.00', notes: '', status: 'pending' }
    ], subtotal: '880.00', tax: '0.00', total: '880.00', notes: '', createdAt: '2026-04-25T19:00:00Z', updatedAt: '2026-04-25T19:05:00Z', userName: 'Admin Demo' },
    { id: 2, number: 'COM-000002', businessId: 1, branchId: 1, tableId: 3, tableName: 'Mesa 3', customerName: 'Pareja Aniversario', status: 'ready', items: [
      { id: 4, comandaId: 2, productId: 8, productName: 'Casillero del Diablo Cabernet', quantity: 1, price: '550.00', total: '550.00', notes: 'Servir frio', status: 'ready' },
      { id: 5, comandaId: 2, productId: 13, productName: 'Absolut Vodka 750ml', quantity: 1, price: '700.00', total: '700.00', notes: '', status: 'ready' }
    ], subtotal: '1250.00', tax: '0.00', total: '1250.00', notes: 'Reservacion 8pm', createdAt: '2026-04-25T18:30:00Z', updatedAt: '2026-04-25T18:45:00Z', userName: 'Admin Demo' },
    { id: 3, number: 'COM-000003', businessId: 1, branchId: 1, status: 'delivered', items: [
      { id: 6, comandaId: 3, productId: 1, productName: 'Presidente Regular 355ml', quantity: 6, price: '65.00', total: '390.00', notes: '', status: 'served' }
    ], subtotal: '390.00', tax: '0.00', total: '390.00', notes: 'Para llevar', createdAt: '2026-04-24T20:00:00Z', updatedAt: '2026-04-24T20:30:00Z', userName: 'Admin Demo' }
  ],
  whatsAppSessions: [
    { id: 1, businessId: 1, phone: '809-555-9999', name: 'Licorera El Puerto', status: 'connected', lastActivity: '2026-04-25T18:00:00Z', createdAt: '2026-01-01T00:00:00Z' }
  ],
  whatsAppMessages: [
    { id: 1, sessionId: 1, phone: '809-555-1001', contactName: 'Juan Perez Garcia', type: 'received', content: 'Hola, quiero hacer un pedido de 6 Presidentes y 2 Brugal para hoy a las 8pm', status: 'read', createdAt: '2026-04-25T14:30:00Z' },
    { id: 2, sessionId: 1, phone: '809-555-1001', contactName: 'Juan Perez Garcia', type: 'sent', content: 'Buenas tardes Juan, con gusto. Serian RD$990.00. Confirmo la direccion: Calle A #10, Gazcue?', status: 'delivered', createdAt: '2026-04-25T14:35:00Z' },
    { id: 3, sessionId: 1, phone: '809-555-1002', contactName: 'Maria Lopez Santos', type: 'received', content: 'Buenos dias, me pueden enviar mi estado de cuenta?', status: 'unread', createdAt: '2026-04-25T16:00:00Z' },
    { id: 4, sessionId: 1, phone: '809-555-1004', contactName: 'Ana Martinez', type: 'received', content: 'Necesito una cotizacion para una fiesta de 50 personas este sabado', status: 'read', createdAt: '2026-04-24T10:00:00Z' },
    { id: 5, sessionId: 1, phone: '809-555-1004', contactName: 'Ana Martinez', type: 'sent', content: 'Hola Ana, con gusto le preparamos la cotizacion. En breve le envio los detalles.', status: 'delivered', createdAt: '2026-04-24T10:15:00Z' }
  ],
  whatsAppTemplates: [
    { id: 1, businessId: 1, name: 'Balance de Cuenta', content: 'Hola {{nombre}}, su balance actual es de RD$ {{balance}}. Fecha de corte: {{fecha_corte}}. Gracias por preferirnos!', variables: 'nombre,balance,fecha_corte', active: true },
    { id: 2, businessId: 1, name: 'Pedido Confirmado', content: 'Hola {{nombre}}, su pedido #{{pedido}} ha sido confirmado. Total: RD$ {{total}}. Entrega estimada: {{hora}}. Gracias!', variables: 'nombre,pedido,total,hora', active: true },
    { id: 3, businessId: 1, name: 'Recordatorio de Pago', content: 'Hola {{nombre}}, le recordamos que su pago de RD$ {{monto}} vence el {{vencimiento}}. Agradecemos su puntualidad.', variables: 'nombre,monto,vencimiento', active: true }
  ]
};

function loadDb(): MockDB {
  try {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return JSON.parse(JSON.stringify(defaultData));
}

export function saveDb(db: MockDB) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function getDb(): MockDB {
  return loadDb();
}

export function resetDb() {
  localStorage.setItem(DB_KEY, JSON.stringify(defaultData));
}

let db = loadDb();
export { db };

export function initMockDb() {
  db = loadDb();
  return db;
}

// Mock API - simulates tRPC backend using localStorage
import { getDb, saveDb, db, initMockDb } from './mockDb';
import type * as MockTypes from './mockDb';

initMockDb();

const businessId = 1;
const currentUser = { id: 1, name: 'Admin Demo', email: 'admin@demo.com', role: 'admin', businessId: 1, branchId: 1 };

// Helper to ensure db is fresh
function get() {
  return db;
}

function persist() {
  saveDb(db);
}

function nextId(arr: any[]) {
  return arr.length > 0 ? Math.max(...arr.map(x => x.id)) + 1 : 1;
}

function now() {
  return new Date().toISOString();
}

function padNum(n: number, len = 6) {
  return String(n).padStart(len, '0');
}

// ========== DASHBOARD ==========
export function dashboardStats() {
  const d = get();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1);

  const paidInvoices = d.invoices.filter(i => i.status === 'paid');
  const salesToday = paidInvoices.filter(i => i.date === todayStr).reduce((s, i) => s + parseFloat(i.total), 0);
  const salesWeek = paidInvoices.filter(i => new Date(i.date) >= weekAgo).reduce((s, i) => s + parseFloat(i.total), 0);
  const salesMonth = paidInvoices.filter(i => new Date(i.date) >= monthAgo).reduce((s, i) => s + parseFloat(i.total), 0);

  const pendingCredits = d.credits.filter(c => c.status === 'current');
  const pendingCreditsAmount = pendingCredits.reduce((s, c) => s + parseFloat(c.balance), 0);

  const pendingDeliveries = d.deliveries.filter(x => ['received', 'preparing', 'ready', 'shipping'].includes(x.status));

  const lowStock = d.products.filter(p => {
    const inv = d.inventory.filter(i => i.productId === p.id).reduce((s, i) => s + i.quantity, 0);
    return p.active && inv <= p.minStock;
  });

  const newCustomers = d.customers.filter(c => new Date(c.createdAt || '2026-04-01') >= monthAgo);

  const monthInvoices = paidInvoices.filter(i => new Date(i.date) >= monthAgo);
  const topProducts: Record<number, { productId: number; productName: string; totalQty: number; totalSales: string }> = {};
  d.invoiceItems.filter(item => monthInvoices.some(mi => mi.id === item.invoiceId)).forEach(item => {
    if (!topProducts[item.productId]) topProducts[item.productId] = { productId: item.productId, productName: item.productName, totalQty: 0, totalSales: '0' };
    topProducts[item.productId].totalQty += item.quantity;
    topProducts[item.productId].totalSales = (parseFloat(topProducts[item.productId].totalSales) + parseFloat(item.total)).toFixed(2);
  });

  const thirtyDaysAgo = new Date(today); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dailySalesMap: Record<string, number> = {};
  paidInvoices.filter(i => new Date(i.date) >= thirtyDaysAgo).forEach(i => {
    dailySalesMap[i.date] = (dailySalesMap[i.date] || 0) + parseFloat(i.total);
  });
  const dailySales = Object.entries(dailySalesMap).map(([date, total]) => ({ date, total: total.toFixed(2) })).sort((a, b) => a.date.localeCompare(b.date));

  const salesByCategory: Record<string, number> = {};
  d.invoiceItems.filter(item => monthInvoices.some(mi => mi.id === item.invoiceId)).forEach(item => {
    const cat = d.categories.find(c => c.id === d.products.find(p => p.id === item.productId)?.categoryId);
    const catName = cat?.name || 'Sin categoria';
    salesByCategory[catName] = (salesByCategory[catName] || 0) + parseFloat(item.total);
  });
  const salesByCategoryArr = Object.entries(salesByCategory).map(([category, total]) => ({ category, total: total.toFixed(2) })).sort((a, b) => parseFloat(b.total) - parseFloat(a.total));

  const nearExpiry = d.batches.filter(b => {
    if (b.status !== 'active') return false;
    const expiry = new Date(b.expiryDate);
    return expiry > today && expiry <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  });

  return {
    salesToday, salesWeek, salesMonth,
    pendingCreditsAmount, pendingCreditsCount: pendingCredits.length,
    pendingDeliveries: pendingDeliveries.length,
    lowStockCount: lowStock.length,
    newCustomers: newCustomers.length,
    topProducts: Object.values(topProducts).sort((a, b) => b.totalQty - a.totalQty).slice(0, 5),
    dailySales, salesByCategory: salesByCategoryArr,
    nearExpiry: nearExpiry.length
  };
}

export function recentActivity() {
  return get().invoices.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
}

// ========== PRODUCTS ==========
export function listCategories() {
  return get().categories.filter(c => c.businessId === businessId && c.active);
}

export function listProducts(search?: string, categoryId?: number, filters?: any) {
  let prods = get().products.filter(p => p.businessId === businessId && p.active);
  if (search) prods = prods.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search));
  if (categoryId) prods = prods.filter(p => p.categoryId === categoryId);
  if (filters?.supplierId) prods = prods.filter(p => p.supplierId === parseInt(filters.supplierId));
  if (filters?.brand) prods = prods.filter(p => p.brand?.toLowerCase().includes(filters.brand.toLowerCase()));
  if (filters?.minPrice) prods = prods.filter(p => parseFloat(p.price) >= parseFloat(filters.minPrice));
  if (filters?.maxPrice) prods = prods.filter(p => parseFloat(p.price) <= parseFloat(filters.maxPrice));
  if (filters?.minCost) prods = prods.filter(p => parseFloat(p.cost) >= parseFloat(filters.minCost));
  if (filters?.maxCost) prods = prods.filter(p => parseFloat(p.cost) <= parseFloat(filters.maxCost));
  if (filters?.isFavorite === true) prods = prods.filter(p => p.isFavorite);
  if (filters?.isBillable === true) prods = prods.filter(p => p.isBillable);
  if (filters?.showZeroStock === false) {
    prods = prods.filter(p => {
      const inv = get().inventory.filter(i => i.productId === p.id).reduce((s, i) => s + i.quantity, 0);
      return inv > 0;
    });
  }
  return prods.map(p => {
    const batches = get().batches.filter(b => b.productId === p.id);
    const inventory = get().inventory.filter(i => i.productId === p.id);
    const category = get().categories.find(c => c.id === p.categoryId);
    const supplier = get().suppliers.find(s => s.id === p.supplierId);
    const totalQty = inventory.reduce((s, i) => s + i.quantity, 0);
    return { ...p, batches, inventory, category, supplier, totalQty };
  });
}

export function getProduct(id: number) {
  const d = get();
  const p = d.products.find(x => x.id === id);
  if (!p) return null;
  return { ...p, batches: d.batches.filter(b => b.productId === id), inventory: d.inventory.filter(i => i.productId === id), category: d.categories.find(c => c.id === p.categoryId) };
}

export function createProduct(data: any) {
  const d = get();
  const cost = typeof data.cost === 'string' ? parseFloat(data.cost) : data.price;
  const price = typeof data.price === 'string' ? parseFloat(data.price) : data.price;
  const margin = cost > 0 ? (((price - cost) / cost) * 100).toFixed(2) : '0';
  const newProd = { 
    ...data, 
    id: nextId(d.products), 
    businessId, 
    cost: cost.toFixed(2), 
    price: price.toFixed(2), 
    margin, 
    active: true, 
    isCombo: data.isCombo || false,
    barcode: data.barcode || '',
    brand: data.brand || '',
    price2: data.price2 || '0',
    price3: data.price3 || '0',
    taxType: data.taxType || 'taxed',
    taxRate: data.taxRate || '18.00',
    maxStock: data.maxStock || 100,
    photoUrl: data.photoUrl || '',
    isInventoriable: data.isInventoriable !== false,
    isBillable: data.isBillable !== false,
    isFavorite: data.isFavorite || false,
    createdAt: now().split('T')[0]
  };
  d.products.push(newProd);
  persist();
  return newProd;
}

export function updateProduct(id: number, data: any) {
  const d = get();
  const idx = d.products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  const existing = d.products[idx];
  const cost = data.cost ? (typeof data.cost === 'string' ? parseFloat(data.cost) : data.cost) : parseFloat(existing.cost);
  const price = data.price ? (typeof data.price === 'string' ? parseFloat(data.price) : data.price) : parseFloat(existing.price);
  const margin = cost > 0 ? (((price - cost) / cost) * 100).toFixed(2) : existing.margin;
  d.products[idx] = { 
    ...existing, 
    ...data, 
    cost: cost.toFixed(2), 
    price: price.toFixed(2), 
    margin 
  };
  persist();
  return d.products[idx];
}

export function deleteProduct(id: number) {
  const d = get();
  const idx = d.products.findIndex(p => p.id === id);
  if (idx === -1) return { success: false };
  d.products[idx].active = false;
  persist();
  return { success: true };
}

// ========== CUSTOMERS ==========
export function listCustomers(search?: string, type?: string) {
  let custs = get().customers.filter(c => c.businessId === businessId && c.active);
  if (search) custs = custs.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.idNumber.includes(search));
  if (type) custs = custs.filter(c => c.type === type);
  return custs;
}

export function getCustomer(id: number) {
  const d = get();
  const c = d.customers.find(x => x.id === id);
  if (!c) return null;
  return { ...c, addresses: [] };
}

export function createCustomer(data: any) {
  const d = get();
  const fullName = [data.firstName, data.middleName, data.lastName, data.secondLastName].filter(Boolean).join(' ');
  const newCust = { 
    ...data, 
    name: fullName || data.name || 'Sin nombre',
    id: nextId(d.customers), 
    businessId, 
    totalPurchased: '0.00', 
    active: true 
  };
  d.customers.push(newCust);
  persist();
  return newCust;
}

export function updateCustomer(id: number, data: any) {
  const d = get();
  const idx = d.customers.findIndex(c => c.id === id);
  if (idx === -1) return null;
  const existing = d.customers[idx];
  const fullName = data.firstName !== undefined 
    ? [data.firstName || existing.firstName, data.middleName !== undefined ? data.middleName : existing.middleName, data.lastName || existing.lastName, data.secondLastName !== undefined ? data.secondLastName : existing.secondLastName].filter(Boolean).join(' ')
    : existing.name;
  d.customers[idx] = { ...existing, ...data, name: fullName || existing.name };
  persist();
  return d.customers[idx];
}

export function deleteCustomer(id: number) {
  const d = get();
  const idx = d.customers.findIndex(c => c.id === id);
  if (idx === -1) return { success: false };
  d.customers[idx].active = false;
  persist();
  return { success: true };
}

// ========== SUPPLIERS ==========
export function listSuppliers(search?: string) {
  let sups = get().suppliers.filter(s => s.businessId === businessId && s.active);
  if (search) sups = sups.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  return sups;
}

export function createSupplier(data: any) {
  const d = get();
  const newSup = { ...data, id: nextId(d.suppliers), businessId, active: true };
  d.suppliers.push(newSup);
  persist();
  return newSup;
}

// ========== INVOICES ==========
export function listInvoices(search?: string, status?: string, branchId?: number) {
  let invs = get().invoices.filter(i => i.businessId === businessId);
  if (search) invs = invs.filter(i => i.number.toLowerCase().includes(search.toLowerCase()));
  if (status) invs = invs.filter(i => i.status === status);
  if (branchId) invs = invs.filter(i => i.branchId === branchId);
  return invs.map(i => ({
    ...i,
    items: get().invoiceItems.filter(item => item.invoiceId === i.id),
    customer: get().customers.find(c => c.id === i.customerId),
    branch: get().branches.find(b => b.id === i.branchId),
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getInvoice(id: number) {
  const d = get();
  const inv = d.invoices.find(x => x.id === id);
  if (!inv) return null;
  return { ...inv, items: d.invoiceItems.filter(item => item.invoiceId === id), customer: d.customers.find(c => c.id === inv.customerId) };
}

export function createInvoice(data: any) {
  const d = get();
  const number = `${d.settings.invoicePrefix}${padNum(d.settings.invoiceNextNumber)}`;
  d.settings.invoiceNextNumber++;

  let subtotal = 0, discountTotal = 0, taxTotal = 0;
  data.items.forEach((item: any) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    const disc = item.discount ? (typeof item.discount === 'string' ? parseFloat(item.discount) : item.discount) : 0;
    const tax = item.tax ? (typeof item.tax === 'string' ? parseFloat(item.tax) : item.tax) : 0;
    const lineSub = price * item.quantity;
    const lineDisc = lineSub * (disc / 100);
    const lineTax = (lineSub - lineDisc) * (tax / 100);
    subtotal += lineSub;
    discountTotal += lineDisc;
    taxTotal += lineTax;
  });
  const total = subtotal - discountTotal + taxTotal;

  const customer = d.customers.find(c => c.id === data.customerId);
  const branch = d.branches.find(b => b.id === data.branchId);

  const newInv = {
    id: nextId(d.invoices),
    number, customerId: data.customerId, userId: currentUser.id,
    branchId: data.branchId, date: now().split('T')[0],
    subtotal: subtotal.toFixed(2), discount: discountTotal.toFixed(2),
    tax: taxTotal.toFixed(2), total: total.toFixed(2),
    paymentMethod: data.paymentMethod || 'cash',
    status: data.status || 'paid', notes: data.notes || '',
    businessId, isDelivery: data.isDelivery || false,
    customerName: customer?.name, branchName: branch?.name
  };
  d.invoices.push(newInv);

  data.items.forEach((item: any, idx: number) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    const disc = item.discount ? (typeof item.discount === 'string' ? parseFloat(item.discount) : item.discount) : 0;
    const tax = item.tax ? (typeof item.tax === 'string' ? parseFloat(item.tax) : item.tax) : 0;
    const lineSub = price * item.quantity;
    const lineDisc = lineSub * (disc / 100);
    const lineTax = (lineSub - lineDisc) * (tax / 100);
    const lineTotal = lineSub - lineDisc + lineTax;
    const product = d.products.find(p => p.id === item.productId);
    d.invoiceItems.push({
      id: nextId(d.invoiceItems) + idx,
      invoiceId: newInv.id, productId: item.productId,
      productName: product?.name || 'Producto', quantity: item.quantity,
      price: price.toFixed(2), discount: lineDisc.toFixed(2),
      tax: lineTax.toFixed(2), total: lineTotal.toFixed(2)
    });
  });

  persist();
  return { ...newInv, items: d.invoiceItems.filter(item => item.invoiceId === newInv.id), customer };
}

// ========== ORDERS ==========
export function listOrders(status?: string, branchId?: number) {
  let ords = get().orders.filter(o => o.businessId === businessId);
  if (status) ords = ords.filter(o => o.status === status);
  if (branchId) ords = ords.filter(o => o.branchId === branchId);
  return ords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function updateOrderStatus(id: number, status: string) {
  const d = get();
  const idx = d.orders.findIndex(o => o.id === id);
  if (idx !== -1) {
    d.orders[idx].status = status as any;
    persist();
  }
  return { success: true };
}

// ========== CREDITS ==========
export function listCredits(status?: string, customerId?: number) {
  let creds = get().credits.filter(c => c.businessId === businessId);
  if (status) creds = creds.filter(c => c.status === status);
  if (customerId) creds = creds.filter(c => c.customerId === customerId);
  return creds;
}

export function addCreditPayment(creditId: number, amount: string, method: string) {
  const d = get();
  const credit = d.credits.find(c => c.id === creditId);
  if (!credit) return { success: false };
  const amt = parseFloat(amount);
  credit.payments.push({ id: nextId(credit.payments), creditId, amount: amt.toFixed(2), date: now().split('T')[0], method: method as any, notes: '' });
  const newBalance = parseFloat(credit.balance) - amt;
  credit.balance = Math.max(0, newBalance).toFixed(2);
  if (newBalance <= 0) credit.status = 'paid';
  persist();
  return { success: true };
}

// ========== PURCHASES ==========
export function listPurchases(supplierId?: number, status?: string) {
  let purs = get().purchases.filter(p => p.businessId === businessId);
  if (supplierId) purs = purs.filter(p => p.supplierId === supplierId);
  if (status) purs = purs.filter(p => p.status === status);
  return purs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ========== DELIVERIES ==========
export function listDeliveryZones() {
  return get().deliveryZones.filter(z => z.businessId === businessId);
}

export function listDeliveries(status?: string, branchId?: number) {
  let dels = get().deliveries.filter(d => d.businessId === businessId);
  if (status) dels = dels.filter(d => d.status === status);
  if (branchId) dels = dels.filter(d => d.branchId === branchId);
  return dels.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createDelivery(data: any) {
  const d = get();
  const zone = d.deliveryZones.find(z => z.id === data.zoneId);
  const branch = d.branches.find(b => b.id === data.branchId);
  const newDel = {
    id: nextId(d.deliveries),
    customerName: data.customerName,
    customerPhone: data.customerPhone || '',
    address: data.address,
    references: data.references || '',
    zoneId: data.zoneId,
    zoneName: zone?.name,
    deliveryCost: (typeof data.deliveryCost === 'number' ? data.deliveryCost : parseFloat(data.deliveryCost || '0')).toFixed(2),
    paymentMethod: data.paymentMethod || 'cash',
    status: 'received' as const,
    notes: data.notes || '',
    businessId,
    branchId: data.branchId,
    branchName: branch?.name,
    createdAt: now()
  };
  d.deliveries.push(newDel);
  persist();
  return newDel;
}

export function updateDeliveryStatus(id: number, status: string) {
  const d = get();
  const idx = d.deliveries.findIndex(x => x.id === id);
  if (idx !== -1) {
    d.deliveries[idx].status = status as any;
    if (status === 'delivered') d.deliveries[idx].deliveredAt = now();
    persist();
  }
  return { success: true };
}

// ========== BRANCHES ==========
export function listBranches() {
  return get().branches.filter(b => b.businessId === businessId && b.active);
}

export function createBranch(data: any) {
  const d = get();
  const newBranch = { ...data, id: nextId(d.branches), businessId, active: true };
  d.branches.push(newBranch);
  persist();
  return newBranch;
}

// ========== SETTINGS ==========
export function getBusiness() {
  return get().businesses.find(b => b.id === businessId);
}

export function getSettings() {
  return get().settings;
}

export function updateBusiness(data: any) {
  const d = get();
  const idx = d.businesses.findIndex(b => b.id === businessId);
  if (idx !== -1) {
    d.businesses[idx] = { ...d.businesses[idx], ...data };
    persist();
  }
  return d.businesses[idx];
}

export function updateSettings(data: any) {
  const d = get();
  d.settings = { ...d.settings, ...data };
  persist();
  return d.settings;
}

// ========== REPORTS ==========
export function salesReport(fromDate: string, toDate: string) {
  const d = get();
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const invs = d.invoices.filter(i => i.businessId === businessId && new Date(i.date) >= from && new Date(i.date) <= to);
  const daily: Record<string, number> = {};
  invs.forEach(i => { daily[i.date] = (daily[i.date] || 0) + parseFloat(i.total); });
  return Object.entries(daily).map(([label, total]) => ({ label, total: total.toFixed(2), count: invs.filter(i => i.date === label).length })).sort((a, b) => a.label.localeCompare(b.label));
}

export function inventoryReport() {
  const d = get();
  return d.products.filter(p => p.businessId === businessId && p.active).map(p => {
    const inv = d.inventory.filter(i => i.productId === p.id);
    const totalQty = inv.reduce((s, i) => s + i.quantity, 0);
    const totalValue = (totalQty * parseFloat(p.cost)).toFixed(2);
    const category = d.categories.find(c => c.id === p.categoryId);
    return { productId: p.id, name: p.name, code: p.code, category: category?.name || 'Sin categoria', cost: p.cost, price: p.price, totalQty, totalValue };
  });
}

export function deliveryReport(fromDate: string, toDate: string) {
  const d = get();
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const dels = d.deliveries.filter(x => x.businessId === businessId && new Date(x.createdAt) >= from && new Date(x.createdAt) <= to);
  const daily: Record<string, { total: number; delivered: number }> = {};
  dels.forEach(x => {
    const date = x.createdAt.split('T')[0];
    if (!daily[date]) daily[date] = { total: 0, delivered: 0 };
    daily[date].total++;
    if (x.status === 'delivered') daily[date].delivered++;
  });
  return Object.entries(daily).map(([label, v]) => ({ label, total: String(v.total), delivered: v.delivered })).sort((a, b) => a.label.localeCompare(b.label));
}

export function financialReport(fromDate: string, toDate: string) {
  const d = get();
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const sales = d.invoices.filter(i => i.businessId === businessId && i.status === 'paid' && new Date(i.date) >= from && new Date(i.date) <= to).reduce((s, i) => s + parseFloat(i.total), 0);
  const purchases = d.purchases.filter(p => p.businessId === businessId && new Date(p.date) >= from && new Date(p.date) <= to).reduce((s, p) => s + parseFloat(p.total), 0);
  return { sales, purchases, grossProfit: sales - purchases };
}

// ========== TRANSFERS (TRASLADOS) ==========
export function listTransfers(status?: string, fromDate?: string, toDate?: string) {
  const d = get();
  let items = d.transfers.filter(t => t.businessId === businessId);
  if (status) items = items.filter(t => t.status === status);
  if (fromDate) items = items.filter(t => new Date(t.createdAt) >= new Date(fromDate));
  if (toDate) items = items.filter(t => new Date(t.createdAt) <= new Date(toDate));
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createTransfer(data: any) {
  const d = get();
  const fromBranch = d.branches.find(b => b.id === data.fromBranchId);
  const toBranch = d.branches.find(b => b.id === data.toBranchId);
  const number = `${d.settings.transferPrefix}${padNum(d.settings.transferNextNumber)}`;
  d.settings.transferNextNumber++;

  const items = data.items.map((item: any) => {
    const product = d.products.find(p => p.id === item.productId);
    return {
      id: nextId(d.transfers.flatMap((t: any) => t.items || [])),
      transferId: 0,
      productId: item.productId,
      productName: product?.name || 'Producto',
      productCode: product?.code || '',
      quantity: item.quantity,
      sentQty: item.quantity,
      receivedQty: 0
    };
  });

  const newTransfer = {
    id: nextId(d.transfers),
    number,
    fromBranchId: data.fromBranchId,
    toBranchId: data.toBranchId,
    fromBranchName: fromBranch?.name,
    toBranchName: toBranch?.name,
    status: 'pending' as const,
    items,
    notes: data.notes || '',
    createdAt: now(),
    businessId,
    userName: currentUser.name
  };

  // Update item transferIds
  items.forEach((item: any) => { item.transferId = newTransfer.id; });
  d.transfers.push(newTransfer);
  persist();
  return newTransfer;
}

export function receiveTransfer(id: number, receivedItems?: any[]) {
  const d = get();
  const idx = d.transfers.findIndex(t => t.id === id);
  if (idx === -1) return { success: false };
  const transfer = d.transfers[idx];
  transfer.status = 'received';
  transfer.receivedAt = now();
  if (receivedItems) {
    receivedItems.forEach((ri: any) => {
      const item = transfer.items.find((i: any) => i.productId === ri.productId);
      if (item) item.receivedQty = ri.receivedQty;
    });
  }
  persist();
  return { success: true };
}

export function cancelTransfer(id: number) {
  const d = get();
  const idx = d.transfers.findIndex(t => t.id === id);
  if (idx === -1) return { success: false };
  d.transfers[idx].status = 'cancelled';
  persist();
  return { success: true };
}

// ========== STOCK COUNTS (TOMA DE INVENTARIO) ==========
export function listStockCounts() {
  return get().stockCounts.filter(s => s.businessId === businessId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createStockCount(data: any) {
  const d = get();
  const branch = d.branches.find(b => b.id === data.branchId);
  const items = data.productIds.map((pid: number) => {
    const product = d.products.find(p => p.id === pid);
    const inv = d.inventory.filter(i => i.productId === pid && i.branchId === data.branchId);
    const systemQty = inv.reduce((s, i) => s + i.quantity, 0);
    return {
      id: nextId(d.stockCounts.flatMap((s: any) => s.items || [])),
      stockCountId: 0,
      productId: pid,
      productName: product?.name || 'Producto',
      productCode: product?.code || '',
      systemQty,
      actualQty: systemQty,
      difference: 0
    };
  });

  const newCount = {
    id: nextId(d.stockCounts),
    branchId: data.branchId,
    branchName: branch?.name,
    status: 'draft' as const,
    items,
    notes: data.notes || '',
    createdAt: now(),
    businessId,
    userName: currentUser.name
  };

  items.forEach((item: any) => { item.stockCountId = newCount.id; });
  d.stockCounts.push(newCount);
  persist();
  return newCount;
}

export function completeStockCount(id: number, items: any[]) {
  const d = get();
  const idx = d.stockCounts.findIndex(s => s.id === id);
  if (idx === -1) return { success: false };
  const count = d.stockCounts[idx];
  count.status = 'completed';
  count.completedAt = now();

  items.forEach((updatedItem: any) => {
    const item = count.items.find((i: any) => i.productId === updatedItem.productId);
    if (item) {
      item.actualQty = updatedItem.actualQty;
      item.difference = updatedItem.actualQty - item.systemQty;
    }
  });

  persist();
  return { success: true };
}

// ========== ADJUSTMENTS (AJUSTES) ==========
export function listAdjustments(search?: string, type?: string, source?: string) {
  const d = get();
  let items = d.adjustments.filter(a => a.businessId === businessId);
  if (search) items = items.filter(a => a.productName?.toLowerCase().includes(search.toLowerCase()) || a.productCode?.includes(search));
  if (type) items = items.filter(a => a.type === type);
  if (source) items = items.filter(a => a.source === source);
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createAdjustment(data: any) {
  const d = get();
  const product = d.products.find(p => p.id === data.productId);
  const branch = d.branches.find(b => b.id === data.branchId);
  const inv = d.inventory.filter(i => i.productId === data.productId && i.branchId === data.branchId);
  const previousQty = inv.reduce((s, i) => s + i.quantity, 0);
  const adjustedQty = data.adjustedQty || 0;
  const currentQty = previousQty + adjustedQty;

  const newAdj = {
    id: nextId(d.adjustments),
    productId: data.productId,
    productName: product?.name,
    productCode: product?.code,
    branchId: data.branchId,
    branchName: branch?.name,
    previousQty,
    adjustedQty,
    currentQty,
    reason: data.reason || '',
    type: adjustedQty >= 0 ? 'increase' as const : 'decrease' as const,
    source: data.source || 'manual',
    notes: data.notes || '',
    createdAt: now(),
    businessId,
    userName: currentUser.name
  };

  d.adjustments.push(newAdj);

  // Update inventory
  if (inv.length > 0) {
    inv[0].quantity = Math.max(0, currentQty);
  } else if (currentQty > 0) {
    d.inventory.push({
      id: nextId(d.inventory),
      productId: data.productId,
      branchId: data.branchId,
      batchId: 0,
      quantity: currentQty
    });
  }

  persist();
  return newAdj;
}

export function updateSupplier(id: number, data: any) {
  const d = get();
  const idx = d.suppliers.findIndex(s => s.id === id);
  if (idx === -1) return null;
  const existing = d.suppliers[idx];
  const fullName = data.firstName !== undefined
    ? [data.firstName || existing.firstName, data.middleName !== undefined ? data.middleName : existing.middleName, data.lastName || existing.lastName, data.secondLastName !== undefined ? data.secondLastName : existing.secondLastName].filter(Boolean).join(' ')
    : existing.name;
  d.suppliers[idx] = { ...existing, ...data, name: fullName || data.name || existing.name };
  persist();
  return d.suppliers[idx];
}

export function deleteSupplier(id: number) {
  const d = get();
  const idx = d.suppliers.findIndex(s => s.id === id);
  if (idx === -1) return { success: false };
  d.suppliers[idx].active = false;
  persist();
  return { success: true };
}

// ========== EMPLOYEES ==========
export function listEmployees(search?: string, branchId?: number) {
  const d = get();
  let emps = d.employees.filter(e => e.businessId === businessId && e.active);
  if (search) emps = emps.filter(e => 
    e.firstName?.toLowerCase().includes(search.toLowerCase()) || 
    e.lastName?.toLowerCase().includes(search.toLowerCase()) ||
    e.idNumber?.includes(search) ||
    e.position?.toLowerCase().includes(search.toLowerCase())
  );
  if (branchId) emps = emps.filter(e => e.branchId === branchId);
  return emps;
}

export function createEmployee(data: any) {
  const d = get();
  const newEmp = { ...data, id: nextId(d.employees), businessId, photoUrl: data.photoUrl || '', active: true };
  d.employees.push(newEmp);
  persist();
  return newEmp;
}

export function updateEmployee(id: number, data: any) {
  const d = get();
  const idx = d.employees.findIndex(e => e.id === id);
  if (idx === -1) return null;
  d.employees[idx] = { ...d.employees[idx], ...data };
  persist();
  return d.employees[idx];
}

export function deleteEmployee(id: number) {
  const d = get();
  const idx = d.employees.findIndex(e => e.id === id);
  if (idx === -1) return { success: false };
  d.employees[idx].active = false;
  persist();
  return { success: true };
}

// ========== EMPLOYEE LOANS ==========
export function listEmployeeLoans(employeeId?: number, status?: string) {
  const d = get();
  let loans = d.employeeLoans;
  if (employeeId) loans = loans.filter(l => l.employeeId === employeeId);
  if (status) loans = loans.filter(l => l.status === status);
  return loans.map(l => {
    const emp = d.employees.find(e => e.id === l.employeeId);
    return { ...l, employeeFullName: emp ? `${emp.firstName} ${emp.lastName}` : l.employeeName };
  });
}

export function createEmployeeLoan(data: any) {
  const d = get();
  const emp = d.employees.find(e => e.id === data.employeeId);
  const amount = parseFloat(data.amount || '0');
  const installments = parseInt(data.installments || '1');
  const installmentAmount = (amount / installments).toFixed(2);
  const newLoan = {
    ...data,
    id: nextId(d.employeeLoans),
    employeeName: emp ? `${emp.firstName} ${emp.lastName}` : '',
    balance: data.amount,
    installmentAmount,
    status: 'active' as const,
    payments: [],
  };
  d.employeeLoans.push(newLoan);
  persist();
  return newLoan;
}

export function addLoanPayment(data: any) {
  const d = get();
  const loan = d.employeeLoans.find(l => l.id === data.loanId);
  if (!loan) return { success: false };
  const payment = { id: nextId(loan.payments || []), ...data };
  loan.payments.push(payment);
  const balance = parseFloat(loan.balance) - parseFloat(data.amount);
  loan.balance = balance.toFixed(2);
  if (balance <= 0) loan.status = 'paid';
  persist();
  return { success: true, payment };
}

// ========== AUTH ==========
export function getCurrentUser() {
  return currentUser;
}

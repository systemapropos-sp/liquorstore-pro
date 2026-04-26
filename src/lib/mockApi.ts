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


// ========== PAYROLL (NOMINA) ==========
export function listPayrollPeriods(status?: string) {
  let periods = get().payrollPeriods.filter(p => p.businessId === businessId);
  if (status) periods = periods.filter(p => p.status === status);
  return periods.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createPayrollPeriod(data: any) {
  const d = get();
  const newPeriod = {
    ...data,
    id: nextId(d.payrollPeriods),
    businessId,
    status: 'draft' as const,
    totalAmount: '0.00',
    createdAt: now()
  };
  d.payrollPeriods.push(newPeriod);
  persist();
  return newPeriod;
}

export function processPayroll(id: number) {
  const d = get();
  const idx = d.payrollPeriods.findIndex(p => p.id === id);
  if (idx === -1) return { success: false };
  d.payrollPeriods[idx].status = 'processed';
  persist();
  return { success: true };
}

export function payPayroll(id: number) {
  const d = get();
  const idx = d.payrollPeriods.findIndex(p => p.id === id);
  if (idx === -1) return { success: false };
  d.payrollPeriods[idx].status = 'paid';
  d.payrollPeriods[idx].paidAt = now();
  // Mark all items as paid
  d.payrollItems.filter(i => i.payrollId === id).forEach(i => {
    i.status = 'paid';
    i.paymentDate = now().split('T')[0];
  });
  persist();
  return { success: true };
}

export function listPayrollItems(payrollId?: number, employeeId?: number) {
  let items = get().payrollItems;
  if (payrollId) items = items.filter(i => i.payrollId === payrollId);
  if (employeeId) items = items.filter(i => i.employeeId === employeeId);
  return items;
}

export function createPayrollItem(data: any) {
  const d = get();
  const emp = d.employees.find(e => e.id === data.employeeId);
  const baseSalary = parseFloat(data.baseSalary || '0');
  const overtime = parseFloat(data.overtime || '0');
  const bonus = parseFloat(data.bonus || '0');
  const deductions = parseFloat(data.deductions || '0');
  const loanDeduction = parseFloat(data.loanDeduction || '0');
  const netPay = baseSalary + overtime + bonus - deductions - loanDeduction;
  const newItem = {
    ...data,
    id: nextId(d.payrollItems),
    employeeName: emp ? `${emp.firstName} ${emp.lastName}` : '',
    baseSalary: baseSalary.toFixed(2),
    overtime: overtime.toFixed(2),
    bonus: bonus.toFixed(2),
    deductions: deductions.toFixed(2),
    loanDeduction: loanDeduction.toFixed(2),
    netPay: netPay.toFixed(2),
    status: 'pending' as const,
    notes: data.notes || ''
  };
  d.payrollItems.push(newItem);
  // Update period total
  const period = d.payrollPeriods.find(p => p.id === data.payrollId);
  if (period) {
    const periodItems = d.payrollItems.filter(i => i.payrollId === data.payrollId);
    period.totalAmount = periodItems.reduce((s, i) => s + parseFloat(i.netPay), 0).toFixed(2);
  }
  persist();
  return newItem;
}

export function getEmployeePayrollHistory(employeeId: number) {
  const d = get();
  const items = d.payrollItems.filter(i => i.employeeId === employeeId);
  const loans = d.employeeLoans.filter(l => l.employeeId === employeeId);
  const payments = loans.flatMap(l => l.payments.map(p => ({ ...p, loanId: l.id, loanAmount: l.amount })));
  return { items, loans, payments };
}

// ========== TABLES (MESAS) ==========
export function listTables(branchId?: number, status?: string) {
  let tables = get().tables.filter(t => t.businessId === businessId);
  if (branchId) tables = tables.filter(t => t.branchId === branchId);
  if (status) tables = tables.filter(t => t.status === status);
  return tables;
}

export function createTable(data: any) {
  const d = get();
  const newTable = {
    ...data,
    id: nextId(d.tables),
    businessId,
    status: 'free' as const,
    orderTotal: '0.00',
    createdAt: now()
  };
  d.tables.push(newTable);
  persist();
  return newTable;
}

export function updateTable(id: number, data: any) {
  const d = get();
  const idx = d.tables.findIndex(t => t.id === id);
  if (idx === -1) return null;
  d.tables[idx] = { ...d.tables[idx], ...data };
  persist();
  return d.tables[idx];
}

export function deleteTable(id: number) {
  const d = get();
  const idx = d.tables.findIndex(t => t.id === id);
  if (idx === -1) return { success: false };
  d.tables.splice(idx, 1);
  persist();
  return { success: true };
}

export function listTableOrderItems(tableId?: number) {
  let items = get().tableOrderItems;
  if (tableId) items = items.filter(i => i.tableId === tableId);
  return items;
}

export function addTableOrderItem(data: any) {
  const d = get();
  const product = d.products.find(p => p.id === data.productId);
  const qty = data.quantity || 1;
  const price = parseFloat(data.price || product?.price || '0');
  const newItem = {
    ...data,
    id: nextId(d.tableOrderItems),
    productName: product?.name || data.productName || 'Producto',
    price: price.toFixed(2),
    total: (price * qty).toFixed(2),
    status: 'pending' as const,
    addedAt: now()
  };
  d.tableOrderItems.push(newItem);
  // Update table status and total
  const table = d.tables.find(t => t.id === data.tableId);
  if (table) {
    table.status = 'occupied';
    const tableItems = d.tableOrderItems.filter(i => i.tableId === data.tableId);
    table.orderTotal = tableItems.reduce((s, i) => s + parseFloat(i.total), 0).toFixed(2);
  }
  persist();
  return newItem;
}

export function removeTableOrderItem(id: number) {
  const d = get();
  const idx = d.tableOrderItems.findIndex(i => i.id === id);
  if (idx === -1) return { success: false };
  const tableId = d.tableOrderItems[idx].tableId;
  d.tableOrderItems.splice(idx, 1);
  // Update table total
  const table = d.tables.find(t => t.id === tableId);
  if (table) {
    const tableItems = d.tableOrderItems.filter(i => i.tableId === tableId);
    table.orderTotal = tableItems.reduce((s, i) => s + parseFloat(i.total), 0).toFixed(2);
    if (tableItems.length === 0) {
      table.status = 'free';
      table.currentOrderId = undefined;
    }
  }
  persist();
  return { success: true };
}

export function updateTableOrderItemStatus(id: number, status: string) {
  const d = get();
  const idx = d.tableOrderItems.findIndex(i => i.id === id);
  if (idx === -1) return { success: false };
  d.tableOrderItems[idx].status = status as any;
  persist();
  return { success: true };
}

export function clearTable(id: number) {
  const d = get();
  const table = d.tables.find(t => t.id === id);
  if (!table) return { success: false };
  d.tableOrderItems = d.tableOrderItems.filter(i => i.tableId !== id);
  table.status = 'free';
  table.currentOrderId = undefined;
  table.orderTotal = '0.00';
  persist();
  return { success: true };
}

// ========== COMANDAS ==========
export function listComandas(status?: string, branchId?: number) {
  const d = get();
  let coms = d.comandas.filter(c => c.businessId === businessId);
  if (status) coms = coms.filter(c => c.status === status);
  if (branchId) coms = coms.filter(c => c.branchId === branchId);
  return coms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createComanda(data: any) {
  const d = get();
  const number = `COM-${padNum(d.comandas.length + 1, 6)}`;
  let subtotal = 0;
  const items = (data.items || []).map((item: any) => {
    const product = d.products.find(p => p.id === item.productId);
    const price = parseFloat(item.price || product?.price || '0');
    const total = price * item.quantity;
    subtotal += total;
    return {
      id: nextId(d.comandas.flatMap((c: any) => c.items || [])),
      comandaId: 0,
      productId: item.productId,
      productName: product?.name || item.productName || 'Producto',
      quantity: item.quantity,
      price: price.toFixed(2),
      total: total.toFixed(2),
      notes: item.notes || '',
      status: 'pending' as const
    };
  });

  const newComanda = {
    id: nextId(d.comandas),
    number,
    businessId,
    branchId: data.branchId || 1,
    tableId: data.tableId,
    tableName: data.tableName,
    customerName: data.customerName || '',
    customerPhone: data.customerPhone || '',
    status: 'pending' as const,
    items,
    subtotal: subtotal.toFixed(2),
    tax: '0.00',
    total: subtotal.toFixed(2),
    notes: data.notes || '',
    createdAt: now(),
    updatedAt: now(),
    userName: currentUser.name
  };

  items.forEach((item: any) => { item.comandaId = newComanda.id; });
  d.comandas.push(newComanda);
  persist();
  return newComanda;
}

export function updateComandaStatus(id: number, status: string) {
  const d = get();
  const idx = d.comandas.findIndex(c => c.id === id);
  if (idx === -1) return { success: false };
  d.comandas[idx].status = status as any;
  d.comandas[idx].updatedAt = now();
  // Update item statuses if delivered
  if (status === 'delivered') {
    d.comandas[idx].items.forEach((item: any) => item.status = 'served');
  }
  persist();
  return { success: true };
}

export function deleteComanda(id: number) {
  const d = get();
  const idx = d.comandas.findIndex(c => c.id === id);
  if (idx === -1) return { success: false };
  d.comandas.splice(idx, 1);
  persist();
  return { success: true };
}

// ========== WHATSAPP ==========
export function listWhatsAppSessions() {
  return get().whatsAppSessions.filter(s => s.businessId === businessId);
}

export function getWhatsAppSession(id: number) {
  return get().whatsAppSessions.find(s => s.id === id);
}

export function connectWhatsApp(sessionId: number) {
  const d = get();
  const idx = d.whatsAppSessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return { success: false };
  d.whatsAppSessions[idx].status = 'connected';
  d.whatsAppSessions[idx].lastActivity = now();
  persist();
  return { success: true };
}

export function disconnectWhatsApp(sessionId: number) {
  const d = get();
  const idx = d.whatsAppSessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return { success: false };
  d.whatsAppSessions[idx].status = 'disconnected';
  d.whatsAppSessions[idx].lastActivity = now();
  persist();
  return { success: true };
}

export function listWhatsAppMessages(sessionId?: number, phone?: string) {
  let msgs = get().whatsAppMessages;
  if (sessionId) msgs = msgs.filter(m => m.sessionId === sessionId);
  if (phone) msgs = msgs.filter(m => m.phone === phone);
  return msgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function sendWhatsAppMessage(data: any) {
  const d = get();
  const newMsg = {
    id: nextId(d.whatsAppMessages),
    sessionId: data.sessionId || 1,
    phone: data.phone,
    contactName: data.contactName || '',
    type: 'sent' as const,
    content: data.content,
    templateName: data.templateName || '',
    status: 'sent' as const,
    createdAt: now()
  };
  d.whatsAppMessages.push(newMsg);
  persist();
  return newMsg;
}

export function markMessageAsRead(id: number) {
  const d = get();
  const idx = d.whatsAppMessages.findIndex(m => m.id === id);
  if (idx !== -1) {
    d.whatsAppMessages[idx].status = 'read';
    persist();
  }
  return { success: true };
}

export function listWhatsAppTemplates() {
  return get().whatsAppTemplates.filter(t => t.businessId === businessId);
}

export function createWhatsAppTemplate(data: any) {
  const d = get();
  const newTemplate = {
    ...data,
    id: nextId(d.whatsAppTemplates),
    businessId,
    active: true
  };
  d.whatsAppTemplates.push(newTemplate);
  persist();
  return newTemplate;
}

export function deleteWhatsAppTemplate(id: number) {
  const d = get();
  const idx = d.whatsAppTemplates.findIndex(t => t.id === id);
  if (idx === -1) return { success: false };
  d.whatsAppTemplates.splice(idx, 1);
  persist();
  return { success: true };
}


// ========== BANKS / CAJA MAYOR ==========
export function listBanks() {
  return get().banks.filter(b => b.businessId === businessId);
}

export function createBank(data: any) {
  const d = get();
  const newBank = {
    ...data,
    id: nextId(d.banks),
    businessId,
    balance: '0.00',
    active: true
  };
  d.banks.push(newBank);
  persist();
  return newBank;
}

export function updateBank(id: number, data: any) {
  const d = get();
  const idx = d.banks.findIndex(b => b.id === id);
  if (idx === -1) return null;
  d.banks[idx] = { ...d.banks[idx], ...data };
  persist();
  return d.banks[idx];
}

export function deleteBank(id: number) {
  const d = get();
  const idx = d.banks.findIndex(b => b.id === id);
  if (idx === -1) return { success: false };
  d.banks.splice(idx, 1);
  persist();
  return { success: true };
}

export function listBankTransactions(bankId?: number) {
  let txs = get().bankTransactions;
  if (bankId) txs = txs.filter(t => t.bankId === bankId);
  return txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createBankTransaction(data: any) {
  const d = get();
  const bank = d.banks.find(b => b.id === data.bankId);
  if (!bank) return null;
  const balanceBefore = parseFloat(bank.balance);
  const amount = parseFloat(data.amount);
  const balanceAfter = data.type === 'income' ? balanceBefore + amount : balanceBefore - amount;

  const newTx = {
    ...data,
    id: nextId(d.bankTransactions),
    balanceBefore: balanceBefore.toFixed(2),
    balanceAfter: balanceAfter.toFixed(2),
    userName: currentUser.name,
    createdAt: now()
  };
  d.bankTransactions.push(newTx);
  bank.balance = balanceAfter.toFixed(2);
  persist();
  return newTx;
}

export function getMainCash() {
  return get().mainCash.find(c => c.businessId === businessId);
}

export function updateMainCash(data: any) {
  const d = get();
  const idx = d.mainCash.findIndex(c => c.businessId === businessId);
  if (idx !== -1) {
    d.mainCash[idx] = { ...d.mainCash[idx], ...data };
    persist();
    return d.mainCash[idx];
  }
  return null;
}

// ========== CASH REGISTERS (CAJAS) ==========
export function listCashRegisters(branchId?: number) {
  let regs = get().cashRegisters.filter(r => r.businessId === businessId);
  if (branchId) regs = regs.filter(r => r.branchId === branchId);
  return regs;
}

export function createCashRegister(data: any) {
  const d = get();
  const newReg = {
    ...data,
    id: nextId(d.cashRegisters),
    businessId,
    status: 'closed' as const,
    baseAmount: '0.00',
    currentAmount: '0.00'
  };
  d.cashRegisters.push(newReg);
  persist();
  return newReg;
}

export function updateCashRegister(id: number, data: any) {
  const d = get();
  const idx = d.cashRegisters.findIndex(r => r.id === id);
  if (idx === -1) return null;
  d.cashRegisters[idx] = { ...d.cashRegisters[idx], ...data };
  persist();
  return d.cashRegisters[idx];
}

export function deleteCashRegister(id: number) {
  const d = get();
  const idx = d.cashRegisters.findIndex(r => r.id === id);
  if (idx === -1) return { success: false };
  d.cashRegisters.splice(idx, 1);
  persist();
  return { success: true };
}

// ========== USERS ==========
export function listUsers(type?: string) {
  let users = get().users.filter(u => u.businessId === businessId);
  if (type) users = users.filter(u => u.type === type);
  return users;
}

export function createUser(data: any) {
  const d = get();
  const newUser = {
    ...data,
    id: nextId(d.users),
    businessId,
    active: true,
    createdAt: now()
  };
  d.users.push(newUser);
  persist();
  return { ...newUser, password: undefined };
}

export function updateUser(id: number, data: any) {
  const d = get();
  const idx = d.users.findIndex(u => u.id === id);
  if (idx === -1) return null;
  d.users[idx] = { ...d.users[idx], ...data };
  persist();
  return { ...d.users[idx], password: undefined };
}

export function deleteUser(id: number) {
  const d = get();
  const idx = d.users.findIndex(u => u.id === id);
  if (idx === -1) return { success: false };
  d.users.splice(idx, 1);
  persist();
  return { success: true };
}

// ========== EXPENSE CONCEPTS ==========
export function listExpenseConcepts(type?: string) {
  let concepts = get().expenseConcepts.filter(c => c.businessId === businessId);
  if (type) concepts = concepts.filter(c => c.type === type);
  return concepts;
}

export function createExpenseConcept(data: any) {
  const d = get();
  const newConcept = {
    ...data,
    id: nextId(d.expenseConcepts),
    businessId
  };
  d.expenseConcepts.push(newConcept);
  persist();
  return newConcept;
}

export function deleteExpenseConcept(id: number) {
  const d = get();
  const idx = d.expenseConcepts.findIndex(c => c.id === id);
  if (idx === -1) return { success: false };
  d.expenseConcepts.splice(idx, 1);
  persist();
  return { success: true };
}

// ========== RESOLUTIONS ==========
export function listResolutions(type?: string) {
  let res = get().resolutions.filter(r => r.businessId === businessId);
  if (type) res = res.filter(r => r.type === type);
  return res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createResolution(data: any) {
  const d = get();
  const newRes = {
    ...data,
    id: nextId(d.resolutions),
    businessId,
    active: true,
    createdAt: now()
  };
  d.resolutions.push(newRes);
  persist();
  return newRes;
}

export function updateResolution(id: number, data: any) {
  const d = get();
  const idx = d.resolutions.findIndex(r => r.id === id);
  if (idx === -1) return null;
  d.resolutions[idx] = { ...d.resolutions[idx], ...data };
  persist();
  return d.resolutions[idx];
}

// ========== TAX CONFIG ==========
export function listTaxConfigs() {
  return get().taxConfigs.filter(t => t.businessId === businessId);
}

export function createTaxConfig(data: any) {
  const d = get();
  const newTax = {
    ...data,
    id: nextId(d.taxConfigs),
    businessId,
    active: true
  };
  d.taxConfigs.push(newTax);
  persist();
  return newTax;
}

export function updateTaxConfig(id: number, data: any) {
  const d = get();
  const idx = d.taxConfigs.findIndex(t => t.id === id);
  if (idx === -1) return null;
  d.taxConfigs[idx] = { ...d.taxConfigs[idx], ...data };
  persist();
  return d.taxConfigs[idx];
}

export function deleteTaxConfig(id: number) {
  const d = get();
  const idx = d.taxConfigs.findIndex(t => t.id === id);
  if (idx === -1) return { success: false };
  d.taxConfigs.splice(idx, 1);
  persist();
  return { success: true };
}

// ========== EMAIL CONFIG ==========
export function getEmailConfig() {
  return get().emailConfigs.find(e => e.businessId === businessId);
}

export function saveEmailConfig(data: any) {
  const d = get();
  const existing = d.emailConfigs.find(e => e.businessId === businessId);
  if (existing) {
    Object.assign(existing, data);
    persist();
    return existing;
  }
  const newConfig = { ...data, id: nextId(d.emailConfigs), businessId };
  d.emailConfigs.push(newConfig);
  persist();
  return newConfig;
}

// ========== BARCODE CONFIG ==========
export function getBarcodeConfig() {
  return get().barcodeConfigs.find(b => b.businessId === businessId);
}

export function saveBarcodeConfig(data: any) {
  const d = get();
  const existing = d.barcodeConfigs.find(b => b.businessId === businessId);
  if (existing) {
    Object.assign(existing, data);
    persist();
    return existing;
  }
  const newConfig = { ...data, id: nextId(d.barcodeConfigs), businessId };
  d.barcodeConfigs.push(newConfig);
  persist();
  return newConfig;
}

// ========== POINTS CONFIG ==========
export function getPointsConfig() {
  return get().pointsConfigs.find(p => p.businessId === businessId);
}

export function savePointsConfig(data: any) {
  const d = get();
  const existing = d.pointsConfigs.find(p => p.businessId === businessId);
  if (existing) {
    Object.assign(existing, data);
    persist();
    return existing;
  }
  const newConfig = { ...data, id: nextId(d.pointsConfigs), businessId };
  d.pointsConfigs.push(newConfig);
  persist();
  return newConfig;
}

// ========== PERMISSION CATEGORIES ==========
export function listPermissionCategories() {
  return get().permissionCategories;
}

export function updatePermissionCategory(id: number, data: any) {
  const d = get();
  const idx = d.permissionCategories.findIndex(p => p.id === id);
  if (idx === -1) return null;
  d.permissionCategories[idx] = { ...d.permissionCategories[idx], ...data };
  persist();
  return d.permissionCategories[idx];
}

// ========== PRINT CONFIG ==========
export function listPrintConfigs() {
  return get().printConfigs.filter(p => p.businessId === businessId);
}

export function updatePrintConfig(id: number, data: any) {
  const d = get();
  const idx = d.printConfigs.findIndex(p => p.id === id);
  if (idx === -1) return null;
  d.printConfigs[idx] = { ...d.printConfigs[idx], ...data };
  persist();
  return d.printConfigs[idx];
}


// ========== PURCHASES (FIXED) ==========
export function createPurchase(data: any) {
  const d = get();
  const settings = d.settings;
  const prefix = settings.purchasePrefix || 'COM-';
  const nextNum = settings.purchaseNextNumber || 1;
  const number = `${prefix}${padNum(nextNum, 5)}`;
  settings.purchaseNextNumber = nextNum + 1;

  const total = parseFloat(data.total || '0');
  const newPurchase = {
    id: nextId(d.purchases),
    businessId,
    number,
    supplierId: data.supplierId || 0,
    supplierName: data.supplierName || '',
    branchId: data.branchId || 1,
    branchName: data.branchName || '',
    items: data.items || [],
    subtotal: data.subtotal || '0.00',
    tax: data.tax || '0.00',
    total: total.toFixed(2),
    status: data.status || 'pending',
    documentUrl: data.documentUrl || '',
    createdAt: now()
  };
  d.purchases.push(newPurchase);

  // Update inventory for each item
  for (const item of newPurchase.items) {
    const inv = d.inventory.find((i: any) => i.productId === item.productId && i.branchId === newPurchase.branchId);
    if (inv) {
      inv.stock = (parseInt(inv.stock) + item.quantity).toString();
    } else {
      d.inventory.push({ id: nextId(d.inventory), businessId, branchId: newPurchase.branchId, productId: item.productId, stock: item.quantity.toString() });
    }
    // Add/update batch
    const batch = d.batches.find((b: any) => b.productId === item.productId && b.branchId === newPurchase.branchId);
    if (batch) {
      batch.stock = (parseInt(batch.stock) + item.quantity).toString();
    } else {
      d.batches.push({ id: nextId(d.batches), productId: item.productId, branchId: newPurchase.branchId, batchNumber: newPurchase.number, expiryDate: data.expiryDate || '2026-12-31', stock: item.quantity.toString(), costPrice: item.costPrice || item.price });
    }
  }
  persist();
  return newPurchase;
}

// ========== EXPENSES ==========
export function listExpenses(type?: string, startDate?: string, endDate?: string) {
  let items = get().expenses.filter(e => e.businessId === businessId);
  if (type) items = items.filter(e => e.type === type);
  if (startDate) items = items.filter(e => e.date >= startDate);
  if (endDate) items = items.filter(e => e.date <= endDate);
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createExpense(data: any) {
  const d = get();
  const newExpense = {
    ...data,
    id: nextId(d.expenses),
    businessId,
    userName: currentUser.name,
    createdAt: now()
  };
  d.expenses.push(newExpense);
  persist();
  return newExpense;
}

export function deleteExpense(id: number) {
  const d = get();
  const idx = d.expenses.findIndex(e => e.id === id);
  if (idx === -1) return { success: false };
  d.expenses.splice(idx, 1);
  persist();
  return { success: true };
}

// ========== FIXED EXPENSES ==========
export function listFixedExpenses() {
  return get().fixedExpenses.filter(e => e.businessId === businessId).sort((a, b) => a.dayOfPayment - b.dayOfPayment);
}

export function createFixedExpense(data: any) {
  const d = get();
  const newFixed = {
    ...data,
    id: nextId(d.fixedExpenses),
    businessId,
    active: true,
    createdAt: now()
  };
  d.fixedExpenses.push(newFixed);
  persist();
  return newFixed;
}

export function updateFixedExpense(id: number, data: any) {
  const d = get();
  const idx = d.fixedExpenses.findIndex(e => e.id === id);
  if (idx === -1) return null;
  d.fixedExpenses[idx] = { ...d.fixedExpenses[idx], ...data };
  persist();
  return d.fixedExpenses[idx];
}

export function deleteFixedExpense(id: number) {
  const d = get();
  const idx = d.fixedExpenses.findIndex(e => e.id === id);
  if (idx === -1) return { success: false };
  d.fixedExpenses.splice(idx, 1);
  persist();
  return { success: true };
}

// @ts-nocheck
import { getDb } from "../api/queries/connection";
import {
  businesses,
  branches,
  categories,
  products,
  productBatches,
  inventory,
  customers,
  customerAddresses,
  suppliers,
  businessSettings,
  deliveryZones,
  users,
} from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // 1. Create business
  const [business] = await db.insert(businesses).values({
    name: "Licorera El Puerto",
    slug: "licorera-el-puerto",
    address: "Calle Principal #123, Santo Domingo",
    phone: "809-555-0100",
    email: "info@licoreraelpuerto.com",
    rnc: "101-12345-6",
    slogan: "La mejor selección de bebidas",
    taxRate: "18.00",
    taxIncluded: true,
    currency: "DOP",
  }).$returningId();

  // 2. Create branches
  const [branch1] = await db.insert(branches).values({
    businessId: business.id,
    name: "Sucursal Principal",
    address: "Calle Principal #123, Santo Domingo",
    phone: "809-555-0101",
    city: "Santo Domingo",
    active: true,
    isWarehouse: false,
  }).$returningId();

  const [branch2] = await db.insert(branches).values({
    businessId: business.id,
    name: "Bodega Central",
    address: "Av. Industrial #45, Santo Domingo",
    phone: "809-555-0102",
    city: "Santo Domingo",
    active: true,
    isWarehouse: true,
  }).$returningId();

  // 3. Create categories
  const catData = [
    { name: "Cerveza Nacional", type: "beer" as const },
    { name: "Cerveza Importada", type: "beer" as const },
    { name: "Ron Nacional", type: "rum" as const },
    { name: "Ron Importado", type: "rum" as const },
    { name: "Vino Tinto", type: "wine" as const },
    { name: "Vino Blanco", type: "wine" as const },
    { name: "Whisky", type: "whisky" as const },
    { name: "Vodka", type: "vodka" as const },
    { name: "Tequila", type: "tequila" as const },
    { name: "Otros", type: "other" as const },
  ];
  const categoryIds: number[] = [];
  for (const c of catData) {
    const [row] = await db.insert(categories).values({
      businessId: business.id,
      name: c.name,
      type: c.type,
    }).$returningId();
    categoryIds.push(row.id);
  }

  // 4. Create suppliers
  const supplierData = [
    { name: "Cervecería Nacional Dominicana", rnc: "101-00001-1", contact: "Juan Pérez", phone: "809-555-0201", email: "ventas@cnd.com.do", address: "Av. Duarte #100", city: "Santo Domingo", creditDays: 30 },
    { name: "Distribuidora Caribe", rnc: "101-00002-2", contact: "María García", phone: "809-555-0202", email: "info@caribedist.com", address: "Calle del Sol #45", city: "Santo Domingo", creditDays: 15 },
    { name: "Vinos del Mundo", rnc: "101-00003-3", contact: "Carlos López", phone: "809-555-0203", email: "ventas@vinosdelmundo.com", address: "Av. Winston Churchill #200", city: "Santo Domingo", creditDays: 45 },
    { name: "Importadora Global", rnc: "101-00004-4", contact: "Ana Martínez", phone: "809-555-0204", email: "import@global.com", address: "Zona Industrial Hainamosa", city: "Santo Domingo", creditDays: 60 },
  ];
  const supplierIds: number[] = [];
  for (const s of supplierData) {
    const [row] = await db.insert(suppliers).values({
      businessId: business.id,
      ...s,
    }).$returningId();
    supplierIds.push(row.id);
  }

  // 5. Create products with batches
  const now = new Date();
  const productData = [
    { code: "CERVE-001", name: "Presidente Regular 355ml", description: "Cerveza lager dominicana", categoryId: categoryIds[0], subcategory: "Nacional", cost: 45.00, price: 65.00, margin: 44.44, unit: "bottle", barcode: "746010000001", minStock: 24, supplierId: supplierIds[0] },
    { code: "CERVE-002", name: "Presidente Light 355ml", description: "Cerveza ligera dominicana", categoryId: categoryIds[0], subcategory: "Nacional", cost: 45.00, price: 65.00, margin: 44.44, unit: "bottle", barcode: "746010000002", minStock: 24, supplierId: supplierIds[0] },
    { code: "CERVE-003", name: "Corona Extra 355ml", description: "Cerveza mexicana", categoryId: categoryIds[1], subcategory: "Importado", cost: 55.00, price: 85.00, margin: 54.55, unit: "bottle", barcode: "746010000003", minStock: 12, supplierId: supplierIds[1] },
    { code: "CERVE-004", name: "Heineken 330ml", description: "Cerveza holandesa", categoryId: categoryIds[1], subcategory: "Importado", cost: 60.00, price: 95.00, margin: 58.33, unit: "bottle", barcode: "746010000004", minStock: 12, supplierId: supplierIds[1] },
    { code: "RON-001", name: "Brugal Extra Viejo 750ml", description: "Ron añejo dominicano", categoryId: categoryIds[2], subcategory: "Nacional", cost: 280.00, price: 450.00, margin: 60.71, unit: "bottle", barcode: "746010000005", minStock: 6, supplierId: supplierIds[0] },
    { code: "RON-002", name: "Barceló Imperial 750ml", description: "Ron premium dominicano", categoryId: categoryIds[2], subcategory: "Nacional", cost: 450.00, price: 750.00, margin: 66.67, unit: "bottle", barcode: "746010000006", minStock: 6, supplierId: supplierIds[0] },
    { code: "RON-003", name: "Havana Club 7 Años 750ml", description: "Ron cubano", categoryId: categoryIds[3], subcategory: "Importado", cost: 380.00, price: 650.00, margin: 71.05, unit: "bottle", barcode: "746010000007", minStock: 4, supplierId: supplierIds[3] },
    { code: "VINO-001", name: "Casillero del Diablo Cabernet", description: "Vino tinto chileno", categoryId: categoryIds[4], subcategory: "Importado", cost: 350.00, price: 550.00, margin: 57.14, unit: "bottle", barcode: "746010000008", minStock: 6, supplierId: supplierIds[2] },
    { code: "VINO-002", name: "Santa Carolina Reserva", description: "Vino tinto chileno", categoryId: categoryIds[4], subcategory: "Importado", cost: 400.00, price: 650.00, margin: 62.50, unit: "bottle", barcode: "746010000009", minStock: 6, supplierId: supplierIds[2] },
    { code: "VINO-003", name: "Concha y Toro Chardonnay", description: "Vino blanco chileno", categoryId: categoryIds[5], subcategory: "Importado", cost: 320.00, price: 520.00, margin: 62.50, unit: "bottle", barcode: "746010000010", minStock: 6, supplierId: supplierIds[2] },
    { code: "WHIS-001", name: "Johnnie Walker Red Label 750ml", description: "Whisky escocés", categoryId: categoryIds[6], subcategory: "Importado", cost: 550.00, price: 950.00, margin: 72.73, unit: "bottle", barcode: "746010000011", minStock: 4, supplierId: supplierIds[3] },
    { code: "WHIS-002", name: "Jack Daniel's Old No.7 750ml", description: "Whisky americano", categoryId: categoryIds[6], subcategory: "Importado", cost: 600.00, price: 1050.00, margin: 75.00, unit: "bottle", barcode: "746010000012", minStock: 4, supplierId: supplierIds[3] },
    { code: "VODK-001", name: "Absolut Vodka 750ml", description: "Vodka sueco", categoryId: categoryIds[7], subcategory: "Importado", cost: 400.00, price: 700.00, margin: 75.00, unit: "bottle", barcode: "746010000013", minStock: 4, supplierId: supplierIds[3] },
    { code: "TEQU-001", name: "José Cuervo Especial 750ml", description: "Tequila mexicano", categoryId: categoryIds[8], subcategory: "Importado", cost: 350.00, price: 620.00, margin: 77.14, unit: "bottle", barcode: "746010000014", minStock: 4, supplierId: supplierIds[1] },
    { code: "OTRO-001", name: "Baileys Irish Cream 750ml", description: "Licor de crema irlandés", categoryId: categoryIds[9], subcategory: "Importado", cost: 480.00, price: 850.00, margin: 77.08, unit: "bottle", barcode: "746010000015", minStock: 4, supplierId: supplierIds[3] },
    { code: "CERVE-005", name: "Six-Pack Presidente 355ml", description: "Pack de 6 cervezas", categoryId: categoryIds[0], subcategory: "Nacional", cost: 270.00, price: 380.00, margin: 40.74, unit: "six-pack", barcode: "746010000016", minStock: 10, supplierId: supplierIds[0], isCombo: true },
  ];

  const productIds: number[] = [];
  for (const p of productData) {
    const [row] = await db.insert(products).values({
      businessId: business.id,
      ...p,
    }).$returningId();
    productIds.push(row.id);
  }

  // Create batches for products
  for (let i = 0; i < productIds.length; i++) {
    const pid = productIds[i];
    const qty = [48, 36, 24, 24, 12, 8, 6, 12, 8, 10, 6, 6, 8, 6, 6, 20][i] || 10;
    
    // Batch 1 - principal
    const expiry1 = new Date(now);
    expiry1.setMonth(expiry1.getMonth() + (i < 2 ? 4 : 12));
    
    const [batch1] = await db.insert(productBatches).values({
      productId: pid,
      batchNumber: `L2024-${String(i + 1).padStart(3, "0")}A`,
      manufactureDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
      expiryDate: expiry1,
      quantity: Math.floor(qty * 0.7),
      cost: productData[i].cost,
      branchId: branch1.id,
      status: "active",
    }).$returningId();

    // Batch 2 - adicional en bodega
    const expiry2 = new Date(now);
    expiry2.setMonth(expiry2.getMonth() + (i < 2 ? 6 : 18));
    
    const [batch2] = await db.insert(productBatches).values({
      productId: pid,
      batchNumber: `L2024-${String(i + 1).padStart(3, "0")}B`,
      manufactureDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
      expiryDate: expiry2,
      quantity: Math.floor(qty * 0.3),
      cost: productData[i].cost,
      branchId: branch2.id,
      status: "active",
    }).$returningId();

    // Inventory for branch 1
    await db.insert(inventory).values({
      productId: pid,
      branchId: branch1.id,
      batchId: batch1.id,
      quantity: Math.floor(qty * 0.7),
    });

    // Inventory for branch 2
    await db.insert(inventory).values({
      productId: pid,
      branchId: branch2.id,
      batchId: batch2.id,
      quantity: Math.floor(qty * 0.3),
    });
  }

  // 6. Create customers
  const customerData = [
    { name: "Cliente de Contado", idNumber: "000-0000000-0", phone: "", type: "cash" as const },
    { name: "Juan Pérez García", idNumber: "001-1234567-8", phone: "809-555-1001", email: "juan@email.com", address: "Calle A #10, Gazcue", city: "Santo Domingo", type: "credit" as const, creditLimit: 5000, tags: "VIP,Frecuente" },
    { name: "María López Santos", idNumber: "002-2345678-9", phone: "809-555-1002", email: "maria@email.com", address: "Av. Independencia #55", city: "Santo Domingo", type: "credit" as const, creditLimit: 3000, tags: "Frecuente" },
    { name: "Carlos Rodríguez", idNumber: "003-3456789-0", phone: "809-555-1003", address: "Calle El Conde #12", city: "Santo Domingo", type: "cash" as const, tags: "Nuevo" },
    { name: "Ana Martínez", idNumber: "004-4567890-1", phone: "809-555-1004", email: "ana@email.com", address: "Av. Sarasota #88", city: "Santo Domingo", type: "credit" as const, creditLimit: 8000, tags: "VIP" },
    { name: "Pedro Sánchez", idNumber: "005-5678901-2", phone: "809-555-1005", address: "Calle Hostos #33", city: "Santo Domingo", type: "cash" as const },
    { name: "Luisa Fernández", idNumber: "006-6789012-3", phone: "809-555-1006", email: "luisa@email.com", address: "Av. 27 de Febrero #200", city: "Santo Domingo", type: "credit" as const, creditLimit: 2000, tags: "Deudor" },
    { name: "Roberto Díaz", idNumber: "007-7890123-4", phone: "809-555-1007", address: "Calle Pellerano Alfau #5", city: "Santo Domingo", type: "cash" as const },
  ];

  const customerIds: number[] = [];
  for (const c of customerData) {
    const [row] = await db.insert(customers).values({
      businessId: business.id,
      ...c,
    }).$returningId();
    customerIds.push(row.id);
  }

  // Customer addresses
  await db.insert(customerAddresses).values({
    customerId: customerIds[1],
    label: "Casa",
    address: "Calle A #10, Gazcue, Santo Domingo",
    references: "Casa azul, al lado de la farmacia",
    isDefault: true,
  });
  await db.insert(customerAddresses).values({
    customerId: customerIds[1],
    label: "Trabajo",
    address: "Av. Winston Churchill #100, Torre Empresarial, Piso 5",
    isDefault: false,
  });
  await db.insert(customerAddresses).values({
    customerId: customerIds[2],
    label: "Casa",
    address: "Av. Independencia #55, Apartamento 3B",
    isDefault: true,
  });

  // 7. Delivery zones
  await db.insert(deliveryZones).values({
    businessId: business.id,
    name: "Zona Centro",
    description: "Gazcue, Ciudad Colonial, Ensanche La Fe",
    deliveryCost: "100.00",
    color: "#E30A17",
    minOrderFree: "1000.00",
  });
  await db.insert(deliveryZones).values({
    businessId: business.id,
    name: "Zona Norte",
    description: "Naco, Piantini, Serrallés",
    deliveryCost: "150.00",
    color: "#1AB2B3",
    minOrderFree: "1500.00",
  });
  await db.insert(deliveryZones).values({
    businessId: business.id,
    name: "Zona Este",
    description: "Villa Oriental, San Isidro",
    deliveryCost: "200.00",
    color: "#FF4C5B",
    minOrderFree: "2000.00",
  });

  // 8. Business settings
  await db.insert(businessSettings).values({
    businessId: business.id,
    invoicePrefix: "A-",
    invoiceNextNumber: 1,
    orderPrefix: "COT-",
    orderNextNumber: 1,
    purchasePrefix: "COM-",
    purchaseNextNumber: 1,
    ticketSize: "80mm",
    creditInterestRate: "2.00",
    creditGraceDays: 3,
    expiryAlertDays: 7,
    allowNegativeStock: false,
    minDeliveryAmount: "500.00",
    prepTimeMinutes: 30,
  });

  console.log("Seed completed successfully!");
  console.log(`Business ID: ${business.id}`);
  console.log(`Branches: ${branch1.id}, ${branch2.id}`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

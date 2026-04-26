// Mock tRPC Provider - simulates all tRPC calls locally using localStorage
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import * as mockApi from '@/lib/mockApi';

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity, refetchOnWindowFocus: false } }
});

function invalidate(keys: string[]) {
  queryClient.invalidateQueries({ queryKey: keys });
}

// ========== DASHBOARD ==========
export function useDashboardStats() {
  return useQuery({ queryKey: ['dashboard', 'stats'], queryFn: mockApi.dashboardStats });
}

export function useRecentActivity() {
  return useQuery({ queryKey: ['dashboard', 'recent'], queryFn: mockApi.recentActivity });
}

// ========== PRODUCTS ==========
export function useProductCategories() {
  return useQuery({ queryKey: ['product', 'categories'], queryFn: mockApi.listCategories });
}

export function useProductList(params?: { search?: string; categoryId?: number; filters?: any }) {
  return useQuery({
    queryKey: ['product', 'list', params],
    queryFn: () => mockApi.listProducts(params?.search, params?.categoryId, params?.filters)
  });
}

export function useProductCreate() {
  return useMutation({
    mutationFn: mockApi.createProduct,
    onSuccess: () => invalidate(['product'])
  });
}

export function useProductUpdate() {
  return useMutation({
    mutationFn: ({ id, ...data }: any) => mockApi.updateProduct(id, data),
    onSuccess: () => invalidate(['product'])
  });
}

export function useProductDelete() {
  return useMutation({
    mutationFn: (id: number) => mockApi.deleteProduct(id),
    onSuccess: () => invalidate(['product'])
  });
}

// ========== CUSTOMERS ==========
export function useCustomerList(params?: { search?: string; type?: string }) {
  return useQuery({
    queryKey: ['customer', 'list', params],
    queryFn: () => mockApi.listCustomers(params?.search, params?.type)
  });
}

export function useCustomerCreate() {
  return useMutation({
    mutationFn: mockApi.createCustomer,
    onSuccess: () => invalidate(['customer'])
  });
}

export function useCustomerUpdate() {
  return useMutation({
    mutationFn: ({ id, ...data }: any) => mockApi.updateCustomer(id, data),
    onSuccess: () => invalidate(['customer'])
  });
}

// ========== SUPPLIERS ==========
export function useSupplierList(params?: { search?: string }) {
  return useQuery({
    queryKey: ['supplier', 'list', params],
    queryFn: () => mockApi.listSuppliers(params?.search)
  });
}

export function useSupplierCreate() {
  return useMutation({
    mutationFn: mockApi.createSupplier,
    onSuccess: () => invalidate(['supplier'])
  });
}

// ========== EMPLOYEES ==========
export function useEmployeeList(params?: { search?: string; branchId?: number }) {
  return useQuery({
    queryKey: ['employee', 'list', params],
    queryFn: () => mockApi.listEmployees(params?.search, params?.branchId)
  });
}

export function useEmployeeCreate() {
  return useMutation({
    mutationFn: mockApi.createEmployee,
    onSuccess: () => invalidate(['employee'])
  });
}

export function useEmployeeUpdate() {
  return useMutation({
    mutationFn: ({ id, ...data }: any) => mockApi.updateEmployee(id, data),
    onSuccess: () => invalidate(['employee'])
  });
}

export function useEmployeeDelete() {
  return useMutation({
    mutationFn: (id: number) => mockApi.deleteEmployee(id),
    onSuccess: () => invalidate(['employee'])
  });
}

// ========== EMPLOYEE LOANS ==========
export function useEmployeeLoanList(params?: { employeeId?: number; status?: string }) {
  return useQuery({
    queryKey: ['employeeLoan', 'list', params],
    queryFn: () => mockApi.listEmployeeLoans(params?.employeeId, params?.status)
  });
}

export function useEmployeeLoanCreate() {
  return useMutation({
    mutationFn: mockApi.createEmployeeLoan,
    onSuccess: () => invalidate(['employeeLoan'])
  });
}

export function useLoanPaymentCreate() {
  return useMutation({
    mutationFn: mockApi.addLoanPayment,
    onSuccess: () => invalidate(['employeeLoan'])
  });
}

// ========== INVOICES ==========
export function useInvoiceList(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: ['invoice', 'list', params],
    queryFn: () => mockApi.listInvoices(params?.search, params?.status)
  });
}

export function useInvoiceCreate() {
  return useMutation({
    mutationFn: mockApi.createInvoice,
    onSuccess: () => {
      invalidate(['invoice']);
      invalidate(['dashboard']);
    }
  });
}

// ========== ORDERS ==========
export function useOrderList(params?: { status?: string }) {
  return useQuery({
    queryKey: ['order', 'list', params],
    queryFn: () => mockApi.listOrders(params?.status)
  });
}

export function useOrderUpdateStatus() {
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => mockApi.updateOrderStatus(id, status),
    onSuccess: () => invalidate(['order'])
  });
}

// ========== CREDITS ==========
export function useCreditList(params?: { status?: string }) {
  return useQuery({
    queryKey: ['credit', 'list', params],
    queryFn: () => mockApi.listCredits(params?.status)
  });
}

export function useCreditAddPayment() {
  return useMutation({
    mutationFn: ({ creditId, amount, method }: { creditId: number; amount: string; method: string }) =>
      mockApi.addCreditPayment(creditId, amount, method),
    onSuccess: () => invalidate(['credit'])
  });
}

// ========== PURCHASES ==========
export function usePurchaseList(params?: { supplierId?: number; status?: string }) {
  return useQuery({
    queryKey: ['purchase', 'list', params],
    queryFn: () => mockApi.listPurchases(params?.supplierId, params?.status)
  });
}

// ========== DELIVERIES ==========
export function useDeliveryList(params?: { status?: string }) {
  return useQuery({
    queryKey: ['delivery', 'list', params],
    queryFn: () => mockApi.listDeliveries(params?.status)
  });
}

export function useDeliveryZones() {
  return useQuery({ queryKey: ['delivery', 'zones'], queryFn: mockApi.listDeliveryZones });
}

export function useDeliveryCreate() {
  return useMutation({
    mutationFn: mockApi.createDelivery,
    onSuccess: () => invalidate(['delivery'])
  });
}

export function useDeliveryUpdateStatus() {
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => mockApi.updateDeliveryStatus(id, status),
    onSuccess: () => invalidate(['delivery'])
  });
}

// ========== TRANSFERS ==========
export function useTransferList(params?: { status?: string; fromDate?: string; toDate?: string }) {
  return useQuery({
    queryKey: ['transfer', 'list', params],
    queryFn: () => mockApi.listTransfers(params?.status, params?.fromDate, params?.toDate)
  });
}

export function useTransferCreate() {
  return useMutation({
    mutationFn: mockApi.createTransfer,
    onSuccess: () => invalidate(['transfer'])
  });
}

export function useTransferReceive() {
  return useMutation({
    mutationFn: ({ id, items }: { id: number; items?: any[] }) => mockApi.receiveTransfer(id, items),
    onSuccess: () => invalidate(['transfer'])
  });
}

export function useTransferCancel() {
  return useMutation({
    mutationFn: (id: number) => mockApi.cancelTransfer(id),
    onSuccess: () => invalidate(['transfer'])
  });
}

// ========== STOCK COUNTS ==========
export function useStockCountList() {
  return useQuery({ queryKey: ['stockCount', 'list'], queryFn: mockApi.listStockCounts });
}

export function useStockCountCreate() {
  return useMutation({
    mutationFn: mockApi.createStockCount,
    onSuccess: () => invalidate(['stockCount'])
  });
}

export function useStockCountComplete() {
  return useMutation({
    mutationFn: ({ id, items }: { id: number; items: any[] }) => mockApi.completeStockCount(id, items),
    onSuccess: () => invalidate(['stockCount'])
  });
}

// ========== ADJUSTMENTS ==========
export function useAdjustmentList(params?: { search?: string; type?: string; source?: string }) {
  return useQuery({
    queryKey: ['adjustment', 'list', params],
    queryFn: () => mockApi.listAdjustments(params?.search, params?.type, params?.source)
  });
}

export function useAdjustmentCreate() {
  return useMutation({
    mutationFn: mockApi.createAdjustment,
    onSuccess: () => {
      invalidate(['adjustment']);
      invalidate(['product']);
    }
  });
}

// ========== BRANCHES ==========
export function useBranchList() {
  return useQuery({ queryKey: ['branch', 'list'], queryFn: mockApi.listBranches });
}

export function useBranchCreate() {
  return useMutation({
    mutationFn: mockApi.createBranch,
    onSuccess: () => invalidate(['branch'])
  });
}

// ========== SETTINGS ==========
export function useBusiness() {
  return useQuery({ queryKey: ['settings', 'business'], queryFn: mockApi.getBusiness });
}

export function useBusinessSettings() {
  return useQuery({ queryKey: ['settings', 'config'], queryFn: mockApi.getSettings });
}

export function useBusinessUpdate() {
  return useMutation({
    mutationFn: mockApi.updateBusiness,
    onSuccess: () => invalidate(['settings'])
  });
}

export function useSettingsUpdate() {
  return useMutation({
    mutationFn: mockApi.updateSettings,
    onSuccess: () => invalidate(['settings'])
  });
}

// ========== REPORTS ==========
export function useSalesReport(fromDate: string, toDate: string) {
  return useQuery({
    queryKey: ['report', 'sales', fromDate, toDate],
    queryFn: () => mockApi.salesReport(fromDate, toDate),
    enabled: !!fromDate && !!toDate
  });
}

export function useInventoryReport() {
  return useQuery({ queryKey: ['report', 'inventory'], queryFn: mockApi.inventoryReport });
}

export function useDeliveryReport(fromDate: string, toDate: string) {
  return useQuery({
    queryKey: ['report', 'delivery', fromDate, toDate],
    queryFn: () => mockApi.deliveryReport(fromDate, toDate),
    enabled: !!fromDate && !!toDate
  });
}

export function useFinancialReport(fromDate: string, toDate: string) {
  return useQuery({
    queryKey: ['report', 'financial', fromDate, toDate],
    queryFn: () => mockApi.financialReport(fromDate, toDate),
    enabled: !!fromDate && !!toDate
  });
}

// ========== AUTH ==========
export function useCurrentUser() {
  return { data: mockApi.getCurrentUser(), isLoading: false, error: null, refetch: () => {} };
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem('mock_auth');
      return { success: true };
    }
  });
}

// ========== PAYROLL (NOMINA) ==========
export function usePayrollPeriodList(params?: { status?: string }) {
  const queryKey = params ? ['payroll', 'periods', params] : ['payroll', 'periods'];
  return useQuery({
    queryKey,
    queryFn: () => mockApi.listPayrollPeriods(params?.status)
  });
}

export function usePayrollPeriodCreate() {
  return useMutation({
    mutationFn: mockApi.createPayrollPeriod,
    onSuccess: () => invalidate(['payroll'])
  });
}

export function usePayrollProcess() {
  return useMutation({
    mutationFn: (id: number) => mockApi.processPayroll(id),
    onSuccess: () => invalidate(['payroll'])
  });
}

export function usePayrollPay() {
  return useMutation({
    mutationFn: (id: number) => mockApi.payPayroll(id),
    onSuccess: () => invalidate(['payroll'])
  });
}

export function usePayrollItemList(params?: { payrollId?: number; employeeId?: number }) {
  return useQuery({
    queryKey: ['payroll', 'items', params],
    queryFn: () => mockApi.listPayrollItems(params?.payrollId, params?.employeeId)
  });
}

export function usePayrollItemCreate() {
  return useMutation({
    mutationFn: mockApi.createPayrollItem,
    onSuccess: () => invalidate(['payroll'])
  });
}

export function useEmployeePayrollHistory(employeeId: number) {
  return useQuery({
    queryKey: ['payroll', 'history', employeeId],
    queryFn: () => mockApi.getEmployeePayrollHistory(employeeId),
    enabled: !!employeeId
  });
}

// ========== TABLES (MESAS) ==========
export function useTableList(params?: { branchId?: number; status?: string }) {
  const queryKey = params ? ['table', 'list', params] : ['table', 'list'];
  return useQuery({
    queryKey,
    queryFn: () => mockApi.listTables(params?.branchId, params?.status)
  });
}

export function useTableCreate() {
  return useMutation({
    mutationFn: mockApi.createTable,
    onSuccess: () => invalidate(['table'])
  });
}

export function useTableUpdate() {
  return useMutation({
    mutationFn: ({ id, ...data }: any) => mockApi.updateTable(id, data),
    onSuccess: () => invalidate(['table'])
  });
}

export function useTableDelete() {
  return useMutation({
    mutationFn: (id: number) => mockApi.deleteTable(id),
    onSuccess: () => invalidate(['table'])
  });
}

export function useTableOrderItems(params?: { tableId?: number }) {
  return useQuery({
    queryKey: ['table', 'orderItems', params],
    queryFn: () => mockApi.listTableOrderItems(params?.tableId)
  });
}

export function useTableAddOrderItem() {
  return useMutation({
    mutationFn: mockApi.addTableOrderItem,
    onSuccess: () => invalidate(['table'])
  });
}

export function useTableRemoveOrderItem() {
  return useMutation({
    mutationFn: (id: number) => mockApi.removeTableOrderItem(id),
    onSuccess: () => invalidate(['table'])
  });
}

export function useTableClear() {
  return useMutation({
    mutationFn: (id: number) => mockApi.clearTable(id),
    onSuccess: () => invalidate(['table'])
  });
}

// ========== COMANDAS ==========
export function useComandaList(params?: { status?: string; branchId?: number }) {
  const queryKey = params ? ['comanda', 'list', params] : ['comanda', 'list'];
  return useQuery({
    queryKey,
    queryFn: () => mockApi.listComandas(params?.status, params?.branchId)
  });
}

export function useComandaCreate() {
  return useMutation({
    mutationFn: mockApi.createComanda,
    onSuccess: () => invalidate(['comanda'])
  });
}

export function useComandaUpdateStatus() {
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => mockApi.updateComandaStatus(id, status),
    onSuccess: () => invalidate(['comanda'])
  });
}

export function useComandaDelete() {
  return useMutation({
    mutationFn: (id: number) => mockApi.deleteComanda(id),
    onSuccess: () => invalidate(['comanda'])
  });
}

// ========== WHATSAPP ==========
export function useWhatsAppSessionList() {
  return useQuery({ queryKey: ['whatsapp', 'sessions'], queryFn: mockApi.listWhatsAppSessions });
}

export function useWhatsAppConnect() {
  return useMutation({
    mutationFn: (sessionId: number) => mockApi.connectWhatsApp(sessionId),
    onSuccess: () => invalidate(['whatsapp'])
  });
}

export function useWhatsAppDisconnect() {
  return useMutation({
    mutationFn: (sessionId: number) => mockApi.disconnectWhatsApp(sessionId),
    onSuccess: () => invalidate(['whatsapp'])
  });
}

export function useWhatsAppMessageList(params?: { sessionId?: number; phone?: string }) {
  return useQuery({
    queryKey: ['whatsapp', 'messages', params],
    queryFn: () => mockApi.listWhatsAppMessages(params?.sessionId, params?.phone)
  });
}

export function useWhatsAppSendMessage() {
  return useMutation({
    mutationFn: mockApi.sendWhatsAppMessage,
    onSuccess: () => invalidate(['whatsapp'])
  });
}

export function useWhatsAppMarkRead() {
  return useMutation({
    mutationFn: (id: number) => mockApi.markMessageAsRead(id),
    onSuccess: () => invalidate(['whatsapp'])
  });
}

export function useWhatsAppTemplateList() {
  return useQuery({ queryKey: ['whatsapp', 'templates'], queryFn: mockApi.listWhatsAppTemplates });
}

export function useWhatsAppTemplateCreate() {
  return useMutation({
    mutationFn: mockApi.createWhatsAppTemplate,
    onSuccess: () => invalidate(['whatsapp'])
  });
}

export function useWhatsAppTemplateDelete() {
  return useMutation({
    mutationFn: (id: number) => mockApi.deleteWhatsAppTemplate(id),
    onSuccess: () => invalidate(['whatsapp'])
  });
}

// ========== BANKS ==========
export function useBankList() {
  return useQuery({ queryKey: ['bank', 'list'], queryFn: mockApi.listBanks });
}

export function useBankCreate() {
  return useMutation({ mutationFn: mockApi.createBank, onSuccess: () => invalidate(['bank']) });
}

export function useBankUpdate() {
  return useMutation({ mutationFn: ({ id, ...data }: any) => mockApi.updateBank(id, data), onSuccess: () => invalidate(['bank']) });
}

export function useBankDelete() {
  return useMutation({ mutationFn: (id: number) => mockApi.deleteBank(id), onSuccess: () => invalidate(['bank']) });
}

export function useBankTransactionList(params?: { bankId?: number }) {
  return useQuery({ queryKey: ['bank', 'transactions', params], queryFn: () => mockApi.listBankTransactions(params?.bankId) });
}

export function useBankTransactionCreate() {
  return useMutation({ mutationFn: mockApi.createBankTransaction, onSuccess: () => invalidate(['bank']) });
}

export function useMainCash() {
  return useQuery({ queryKey: ['mainCash'], queryFn: mockApi.getMainCash });
}

// ========== CASH REGISTERS ==========
export function useCashRegisterList(params?: { branchId?: number }) {
  return useQuery({ queryKey: ['cashRegister', 'list', params], queryFn: () => mockApi.listCashRegisters(params?.branchId) });
}

export function useCashRegisterCreate() {
  return useMutation({ mutationFn: mockApi.createCashRegister, onSuccess: () => invalidate(['cashRegister']) });
}

export function useCashRegisterUpdate() {
  return useMutation({ mutationFn: ({ id, ...data }: any) => mockApi.updateCashRegister(id, data), onSuccess: () => invalidate(['cashRegister']) });
}

export function useCashRegisterDelete() {
  return useMutation({ mutationFn: (id: number) => mockApi.deleteCashRegister(id), onSuccess: () => invalidate(['cashRegister']) });
}

// ========== USERS ==========
export function useUserList(params?: { type?: string }) {
  return useQuery({ queryKey: ['user', 'list', params], queryFn: () => mockApi.listUsers(params?.type) });
}

export function useUserCreate() {
  return useMutation({ mutationFn: mockApi.createUser, onSuccess: () => invalidate(['user']) });
}

export function useUserUpdate() {
  return useMutation({ mutationFn: ({ id, ...data }: any) => mockApi.updateUser(id, data), onSuccess: () => invalidate(['user']) });
}

export function useUserDelete() {
  return useMutation({ mutationFn: (id: number) => mockApi.deleteUser(id), onSuccess: () => invalidate(['user']) });
}

// ========== EXPENSE CONCEPTS ==========
export function useExpenseConceptList(params?: { type?: string }) {
  return useQuery({ queryKey: ['expenseConcept', 'list', params], queryFn: () => mockApi.listExpenseConcepts(params?.type) });
}

export function useExpenseConceptCreate() {
  return useMutation({ mutationFn: mockApi.createExpenseConcept, onSuccess: () => invalidate(['expenseConcept']) });
}

export function useExpenseConceptDelete() {
  return useMutation({ mutationFn: (id: number) => mockApi.deleteExpenseConcept(id), onSuccess: () => invalidate(['expenseConcept']) });
}

// ========== RESOLUTIONS ==========
export function useResolutionList(params?: { type?: string }) {
  return useQuery({ queryKey: ['resolution', 'list', params], queryFn: () => mockApi.listResolutions(params?.type) });
}

export function useResolutionCreate() {
  return useMutation({ mutationFn: mockApi.createResolution, onSuccess: () => invalidate(['resolution']) });
}

export function useResolutionUpdate() {
  return useMutation({ mutationFn: ({ id, ...data }: any) => mockApi.updateResolution(id, data), onSuccess: () => invalidate(['resolution']) });
}

// ========== TAX CONFIG ==========
export function useTaxConfigList() {
  return useQuery({ queryKey: ['taxConfig', 'list'], queryFn: mockApi.listTaxConfigs });
}

export function useTaxConfigCreate() {
  return useMutation({ mutationFn: mockApi.createTaxConfig, onSuccess: () => invalidate(['taxConfig']) });
}

export function useTaxConfigUpdate() {
  return useMutation({ mutationFn: ({ id, ...data }: any) => mockApi.updateTaxConfig(id, data), onSuccess: () => invalidate(['taxConfig']) });
}

export function useTaxConfigDelete() {
  return useMutation({ mutationFn: (id: number) => mockApi.deleteTaxConfig(id), onSuccess: () => invalidate(['taxConfig']) });
}

// ========== EMAIL CONFIG ==========
export function useEmailConfig() {
  return useQuery({ queryKey: ['emailConfig'], queryFn: mockApi.getEmailConfig });
}

export function useEmailConfigSave() {
  return useMutation({ mutationFn: mockApi.saveEmailConfig, onSuccess: () => invalidate(['emailConfig']) });
}

// ========== BARCODE CONFIG ==========
export function useBarcodeConfig() {
  return useQuery({ queryKey: ['barcodeConfig'], queryFn: mockApi.getBarcodeConfig });
}

export function useBarcodeConfigSave() {
  return useMutation({ mutationFn: mockApi.saveBarcodeConfig, onSuccess: () => invalidate(['barcodeConfig']) });
}

// ========== POINTS CONFIG ==========
export function usePointsConfig() {
  return useQuery({ queryKey: ['pointsConfig'], queryFn: mockApi.getPointsConfig });
}

export function usePointsConfigSave() {
  return useMutation({ mutationFn: mockApi.savePointsConfig, onSuccess: () => invalidate(['pointsConfig']) });
}

// ========== PERMISSION CATEGORIES ==========
export function usePermissionCategoryList() {
  return useQuery({ queryKey: ['permissionCategory', 'list'], queryFn: mockApi.listPermissionCategories });
}

export function usePermissionCategoryUpdate() {
  return useMutation({ mutationFn: ({ id, ...data }: any) => mockApi.updatePermissionCategory(id, data), onSuccess: () => invalidate(['permissionCategory']) });
}

// ========== PRINT CONFIG ==========
export function usePrintConfigList() {
  return useQuery({ queryKey: ['printConfig', 'list'], queryFn: mockApi.listPrintConfigs });
}

export function usePrintConfigUpdate() {
  return useMutation({ mutationFn: ({ id, ...data }: any) => mockApi.updatePrintConfig(id, data), onSuccess: () => invalidate(['printConfig']) });
}



// ========== PURCHASE (FIXED) ==========
export function usePurchaseCreate() {
  return useMutation({
    mutationFn: mockApi.createPurchase,
    onSuccess: () => invalidate(['purchase'])
  });
}

// ========== EXPENSES ==========
export function useExpenseList(params?: { type?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['expense', 'list', params],
    queryFn: () => mockApi.listExpenses(params?.type, params?.startDate, params?.endDate)
  });
}

export function useExpenseCreate() {
  return useMutation({
    mutationFn: mockApi.createExpense,
    onSuccess: () => invalidate(['expense'])
  });
}

export function useExpenseDelete() {
  return useMutation({
    mutationFn: (id: number) => mockApi.deleteExpense(id),
    onSuccess: () => invalidate(['expense'])
  });
}

// ========== FIXED EXPENSES ==========
export function useFixedExpenseList() {
  return useQuery({
    queryKey: ['fixedExpense', 'list'],
    queryFn: mockApi.listFixedExpenses
  });
}

export function useFixedExpenseCreate() {
  return useMutation({
    mutationFn: mockApi.createFixedExpense,
    onSuccess: () => invalidate(['fixedExpense'])
  });
}

export function useFixedExpenseUpdate() {
  return useMutation({
    mutationFn: ({ id, ...data }: any) => mockApi.updateFixedExpense(id, data),
    onSuccess: () => invalidate(['fixedExpense'])
  });
}

export function useFixedExpenseDelete() {
  return useMutation({
    mutationFn: (id: number) => mockApi.deleteFixedExpense(id),
    onSuccess: () => invalidate(['fixedExpense'])
  });
}

// ========== PROVIDER ==========
export function MockTRPCProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

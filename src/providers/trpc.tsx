// tRPC Provider - Mock mode: all data stored locally in localStorage
import { ReactNode, useCallback } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import {
  MockTRPCProvider,
  queryClient,
} from './mockTrpc';
import * as mockApi from '@/lib/mockApi';

// Direct wrappers around mockApi with proper React Query options support
function useDashboardStats(input?: any, opts?: any) {
  return useQuery({ queryKey: ['dashboard', 'stats'], queryFn: mockApi.dashboardStats, ...opts });
}
function useRecentActivity(input?: any, opts?: any) {
  return useQuery({ queryKey: ['dashboard', 'recent'], queryFn: mockApi.recentActivity, ...opts });
}
function useProductCategories(input?: any, opts?: any) {
  return useQuery({ queryKey: ['product', 'categories'], queryFn: mockApi.listCategories, ...opts });
}
function useProductList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['product', 'list', input], queryFn: () => mockApi.listProducts(input?.search, input?.categoryId, input?.filters), ...opts });
}
function useProductCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createProduct, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product'] }), ...opts });
}
function useProductUpdate(opts?: any) {
  return useMutation({ mutationFn: ({ id, ...data }: any) => mockApi.updateProduct(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product'] }), ...opts });
}
function useProductDelete(opts?: any) {
  return useMutation({ mutationFn: (id: number) => mockApi.deleteProduct(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product'] }), ...opts });
}
function useCustomerList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['customer', 'list', input], queryFn: () => mockApi.listCustomers(input?.search, input?.type), ...opts });
}
function useCustomerCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createCustomer, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer'] }), ...opts });
}
function useCustomerUpdate(opts?: any) {
  return useMutation({ mutationFn: ({ id, ...data }: any) => mockApi.updateCustomer(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer'] }), ...opts });
}
function useCustomerDelete(opts?: any) {
  return useMutation({ mutationFn: (id: number) => mockApi.deleteCustomer(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer'] }), ...opts });
}
function useSupplierList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['supplier', 'list', input], queryFn: () => mockApi.listSuppliers(input?.search), ...opts });
}
function useSupplierCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createSupplier, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['supplier'] }), ...opts });
}
function useSupplierUpdate(opts?: any) {
  return useMutation({ mutationFn: ({ id, ...data }: any) => mockApi.updateSupplier(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['supplier'] }), ...opts });
}
function useSupplierDelete(opts?: any) {
  return useMutation({ mutationFn: (id: number) => mockApi.deleteSupplier(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['supplier'] }), ...opts });
}
function useEmployeeList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['employee', 'list', input], queryFn: () => mockApi.listEmployees(input?.search, input?.branchId), ...opts });
}
function useEmployeeCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createEmployee, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employee'] }), ...opts });
}
function useEmployeeUpdate(opts?: any) {
  return useMutation({ mutationFn: ({ id, ...data }: any) => mockApi.updateEmployee(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employee'] }), ...opts });
}
function useEmployeeDelete(opts?: any) {
  return useMutation({ mutationFn: (id: number) => mockApi.deleteEmployee(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employee'] }), ...opts });
}
function useEmployeeLoanList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['employeeLoan', 'list', input], queryFn: () => mockApi.listEmployeeLoans(input?.employeeId, input?.status), ...opts });
}
function useEmployeeLoanCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createEmployeeLoan, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employeeLoan'] }), ...opts });
}
function useLoanPaymentCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.addLoanPayment, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employeeLoan'] }), ...opts });
}
function useInvoiceList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['invoice', 'list', input], queryFn: () => mockApi.listInvoices(input?.search, input?.status, input?.branchId), ...opts });
}
function useInvoiceCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createInvoice, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['invoice'] }); queryClient.invalidateQueries({ queryKey: ['dashboard'] }); }, ...opts });
}
function useOrderList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['order', 'list', input], queryFn: () => mockApi.listOrders(input?.status, input?.branchId), ...opts });
}
function useOrderUpdateStatus(opts?: any) {
  return useMutation({ mutationFn: ({ id, status }: any) => mockApi.updateOrderStatus(id, status), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['order'] }), ...opts });
}
function useCreditList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['credit', 'list', input], queryFn: () => mockApi.listCredits(input?.status, input?.customerId), ...opts });
}
function useCreditAddPayment(opts?: any) {
  return useMutation({ mutationFn: ({ creditId, amount, method }: any) => mockApi.addCreditPayment(creditId, amount, method), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['credit'] }), ...opts });
}
function usePurchaseList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['purchase', 'list', input], queryFn: () => mockApi.listPurchases(input?.supplierId, input?.status), ...opts });
}
function useDeliveryList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['delivery', 'list', input], queryFn: () => mockApi.listDeliveries(input?.status, input?.branchId), ...opts });
}
function useDeliveryZones(input?: any, opts?: any) {
  return useQuery({ queryKey: ['delivery', 'zones'], queryFn: mockApi.listDeliveryZones, ...opts });
}
function useDeliveryCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createDelivery, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['delivery'] }), ...opts });
}
function useDeliveryUpdateStatus(opts?: any) {
  return useMutation({ mutationFn: ({ id, status }: any) => mockApi.updateDeliveryStatus(id, status), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['delivery'] }), ...opts });
}
function useTransferList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['transfer', 'list', input], queryFn: () => mockApi.listTransfers(input?.status, input?.fromDate, input?.toDate), ...opts });
}
function useTransferCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createTransfer, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transfer'] }), ...opts });
}
function useTransferReceive(opts?: any) {
  return useMutation({ mutationFn: ({ id, items }: any) => mockApi.receiveTransfer(id, items), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transfer'] }), ...opts });
}
function useTransferCancel(opts?: any) {
  return useMutation({ mutationFn: (id: number) => mockApi.cancelTransfer(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transfer'] }), ...opts });
}
function useStockCountList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['stockCount', 'list'], queryFn: mockApi.listStockCounts, ...opts });
}
function useStockCountCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createStockCount, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stockCount'] }), ...opts });
}
function useStockCountComplete(opts?: any) {
  return useMutation({ mutationFn: ({ id, items }: any) => mockApi.completeStockCount(id, items), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stockCount'] }), ...opts });
}
function useAdjustmentList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['adjustment', 'list', input], queryFn: () => mockApi.listAdjustments(input?.search, input?.type, input?.source), ...opts });
}
function useAdjustmentCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createAdjustment, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adjustment'] }); queryClient.invalidateQueries({ queryKey: ['product'] }); }, ...opts });
}
function useBranchList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['branch', 'list'], queryFn: mockApi.listBranches, ...opts });
}
function useBranchCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createBranch, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branch'] }), ...opts });
}
function useBusiness(input?: any, opts?: any) {
  return useQuery({ queryKey: ['settings', 'business'], queryFn: mockApi.getBusiness, ...opts });
}
function useBusinessSettings(input?: any, opts?: any) {
  return useQuery({ queryKey: ['settings', 'config'], queryFn: mockApi.getSettings, ...opts });
}
function useBusinessUpdate(opts?: any) {
  return useMutation({ mutationFn: mockApi.updateBusiness, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }), ...opts });
}
function useSettingsUpdate(opts?: any) {
  return useMutation({ mutationFn: mockApi.updateSettings, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }), ...opts });
}
function useSalesReport(input?: any, opts?: any) {
  return useQuery({ queryKey: ['report', 'sales', input?.fromDate, input?.toDate], queryFn: () => mockApi.salesReport(input?.fromDate, input?.toDate), enabled: !!input?.fromDate && !!input?.toDate, ...opts });
}
function useInventoryReport(input?: any, opts?: any) {
  return useQuery({ queryKey: ['report', 'inventory'], queryFn: mockApi.inventoryReport, ...opts });
}
function useDeliveryReport(input?: any, opts?: any) {
  return useQuery({ queryKey: ['report', 'delivery', input?.fromDate, input?.toDate], queryFn: () => mockApi.deliveryReport(input?.fromDate, input?.toDate), enabled: !!input?.fromDate && !!input?.toDate, ...opts });
}
function useFinancialReport(input?: any, opts?: any) {
  return useQuery({ queryKey: ['report', 'financial', input?.fromDate, input?.toDate], queryFn: () => mockApi.financialReport(input?.fromDate, input?.toDate), enabled: !!input?.fromDate && !!input?.toDate, ...opts });
}
function useCurrentUser(input?: any, opts?: any) {
  return { data: mockApi.getCurrentUser(), isLoading: false, error: null, refetch: () => {} };
}
function useLogout(opts?: any) {
  return useMutation({ mutationFn: async () => { localStorage.removeItem('mock_auth'); return { success: true }; }, ...opts });
}

function usePayrollPeriodList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['payroll', 'periods', input], queryFn: () => mockApi.listPayrollPeriods(input?.status), ...opts });
}
function usePayrollPeriodCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createPayrollPeriod, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll'] }), ...opts });
}
function usePayrollProcess(opts?: any) {
  return useMutation({ mutationFn: (id: number) => mockApi.processPayroll(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll'] }), ...opts });
}
function usePayrollPay(opts?: any) {
  return useMutation({ mutationFn: (id: number) => mockApi.payPayroll(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll'] }), ...opts });
}
function usePayrollItemList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['payroll', 'items', input], queryFn: () => mockApi.listPayrollItems(input?.payrollId, input?.employeeId), ...opts });
}
function usePayrollItemCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createPayrollItem, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll'] }), ...opts });
}
function useEmployeePayrollHistory(input?: any, opts?: any) {
  return useQuery({ queryKey: ['payroll', 'history', input?.employeeId], queryFn: () => mockApi.getEmployeePayrollHistory(input?.employeeId), enabled: !!input?.employeeId, ...opts });
}
function useTableList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['table', 'list', input], queryFn: () => mockApi.listTables(input?.branchId, input?.status), ...opts });
}
function useTableCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createTable, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['table'] }), ...opts });
}
function useTableUpdate(opts?: any) {
  return useMutation({ mutationFn: ({ id, ...data }: any) => mockApi.updateTable(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['table'] }), ...opts });
}
function useTableDelete(opts?: any) {
  return useMutation({ mutationFn: (id: number) => mockApi.deleteTable(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['table'] }), ...opts });
}
function useTableOrderItems(input?: any, opts?: any) {
  return useQuery({ queryKey: ['table', 'orderItems', input], queryFn: () => mockApi.listTableOrderItems(input?.tableId), ...opts });
}
function useTableAddOrderItem(opts?: any) {
  return useMutation({ mutationFn: mockApi.addTableOrderItem, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['table'] }), ...opts });
}
function useTableRemoveOrderItem(opts?: any) {
  return useMutation({ mutationFn: (id: number) => mockApi.removeTableOrderItem(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['table'] }), ...opts });
}
function useTableClear(opts?: any) {
  return useMutation({ mutationFn: (id: number) => mockApi.clearTable(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['table'] }), ...opts });
}
function useComandaList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['comanda', 'list', input], queryFn: () => mockApi.listComandas(input?.status, input?.branchId), ...opts });
}
function useComandaCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createComanda, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comanda'] }), ...opts });
}
function useComandaUpdateStatus(opts?: any) {
  return useMutation({ mutationFn: ({ id, status }: any) => mockApi.updateComandaStatus(id, status), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comanda'] }), ...opts });
}
function useComandaDelete(opts?: any) {
  return useMutation({ mutationFn: (id: number) => mockApi.deleteComanda(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comanda'] }), ...opts });
}
function useWhatsAppSessionList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['whatsapp', 'sessions'], queryFn: mockApi.listWhatsAppSessions, ...opts });
}
function useWhatsAppConnect(opts?: any) {
  return useMutation({ mutationFn: (sessionId: number) => mockApi.connectWhatsApp(sessionId), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['whatsapp'] }), ...opts });
}
function useWhatsAppDisconnect(opts?: any) {
  return useMutation({ mutationFn: (sessionId: number) => mockApi.disconnectWhatsApp(sessionId), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['whatsapp'] }), ...opts });
}
function useWhatsAppMessageList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['whatsapp', 'messages', input], queryFn: () => mockApi.listWhatsAppMessages(input?.sessionId, input?.phone), ...opts });
}
function useWhatsAppSendMessage(opts?: any) {
  return useMutation({ mutationFn: mockApi.sendWhatsAppMessage, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['whatsapp'] }), ...opts });
}
function useWhatsAppMarkRead(opts?: any) {
  return useMutation({ mutationFn: (id: number) => mockApi.markMessageAsRead(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['whatsapp'] }), ...opts });
}
function useWhatsAppTemplateList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['whatsapp', 'templates'], queryFn: mockApi.listWhatsAppTemplates, ...opts });
}
function useWhatsAppTemplateCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createWhatsAppTemplate, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['whatsapp'] }), ...opts });
}
function useWhatsAppTemplateDelete(opts?: any) {
  return useMutation({ mutationFn: (id: number) => mockApi.deleteWhatsAppTemplate(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['whatsapp'] }), ...opts });
}

function useBankList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['bank', 'list'], queryFn: mockApi.listBanks, ...opts });
}
function useBankCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createBank, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bank'] }), ...opts });
}
function useBankUpdate(opts?: any) {
  return useMutation({ mutationFn: ({ id, ...data }: any) => mockApi.updateBank(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bank'] }), ...opts });
}
function useBankDelete(opts?: any) {
  return useMutation({ mutationFn: (id: number) => mockApi.deleteBank(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bank'] }), ...opts });
}
function useBankTransactionList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['bank', 'transactions', input], queryFn: () => mockApi.listBankTransactions(input?.bankId), ...opts });
}
function useBankTransactionCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createBankTransaction, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bank'] }), ...opts });
}
function useMainCash(input?: any, opts?: any) {
  return useQuery({ queryKey: ['mainCash'], queryFn: mockApi.getMainCash, ...opts });
}
function useCashRegisterList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['cashRegister', 'list', input], queryFn: () => mockApi.listCashRegisters(input?.branchId), ...opts });
}
function useCashRegisterCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createCashRegister, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cashRegister'] }), ...opts });
}
function useCashRegisterUpdate(opts?: any) {
  return useMutation({ mutationFn: ({ id, ...data }: any) => mockApi.updateCashRegister(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cashRegister'] }), ...opts });
}
function useCashRegisterDelete(opts?: any) {
  return useMutation({ mutationFn: (id: number) => mockApi.deleteCashRegister(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cashRegister'] }), ...opts });
}
function useUserList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['user', 'list', input], queryFn: () => mockApi.listUsers(input?.type), ...opts });
}
function useUserCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createUser, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user'] }), ...opts });
}
function useUserUpdate(opts?: any) {
  return useMutation({ mutationFn: ({ id, ...data }: any) => mockApi.updateUser(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user'] }), ...opts });
}
function useUserDelete(opts?: any) {
  return useMutation({ mutationFn: (id: number) => mockApi.deleteUser(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user'] }), ...opts });
}
function useExpenseConceptList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['expenseConcept', 'list', input], queryFn: () => mockApi.listExpenseConcepts(input?.type), ...opts });
}
function useExpenseConceptCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createExpenseConcept, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenseConcept'] }), ...opts });
}
function useExpenseConceptDelete(opts?: any) {
  return useMutation({ mutationFn: (id: number) => mockApi.deleteExpenseConcept(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenseConcept'] }), ...opts });
}
function useResolutionList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['resolution', 'list', input], queryFn: () => mockApi.listResolutions(input?.type), ...opts });
}
function useResolutionCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createResolution, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resolution'] }), ...opts });
}
function useResolutionUpdate(opts?: any) {
  return useMutation({ mutationFn: ({ id, ...data }: any) => mockApi.updateResolution(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resolution'] }), ...opts });
}
function useTaxConfigList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['taxConfig', 'list'], queryFn: mockApi.listTaxConfigs, ...opts });
}
function useTaxConfigCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createTaxConfig, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['taxConfig'] }), ...opts });
}
function useTaxConfigUpdate(opts?: any) {
  return useMutation({ mutationFn: ({ id, ...data }: any) => mockApi.updateTaxConfig(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['taxConfig'] }), ...opts });
}
function useTaxConfigDelete(opts?: any) {
  return useMutation({ mutationFn: (id: number) => mockApi.deleteTaxConfig(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['taxConfig'] }), ...opts });
}
function useEmailConfig(input?: any, opts?: any) {
  return useQuery({ queryKey: ['emailConfig'], queryFn: mockApi.getEmailConfig, ...opts });
}
function useEmailConfigSave(opts?: any) {
  return useMutation({ mutationFn: mockApi.saveEmailConfig, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['emailConfig'] }), ...opts });
}
function useBarcodeConfig(input?: any, opts?: any) {
  return useQuery({ queryKey: ['barcodeConfig'], queryFn: mockApi.getBarcodeConfig, ...opts });
}
function useBarcodeConfigSave(opts?: any) {
  return useMutation({ mutationFn: mockApi.saveBarcodeConfig, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['barcodeConfig'] }), ...opts });
}
function usePointsConfig(input?: any, opts?: any) {
  return useQuery({ queryKey: ['pointsConfig'], queryFn: mockApi.getPointsConfig, ...opts });
}
function usePointsConfigSave(opts?: any) {
  return useMutation({ mutationFn: mockApi.savePointsConfig, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pointsConfig'] }), ...opts });
}
function usePermissionCategoryList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['permissionCategory', 'list'], queryFn: mockApi.listPermissionCategories, ...opts });
}
function usePermissionCategoryUpdate(opts?: any) {
  return useMutation({ mutationFn: ({ id, ...data }: any) => mockApi.updatePermissionCategory(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['permissionCategory'] }), ...opts });
}
function usePrintConfigList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['printConfig', 'list'], queryFn: mockApi.listPrintConfigs, ...opts });
}
function usePrintConfigUpdate(opts?: any) {
  return useMutation({ mutationFn: ({ id, ...data }: any) => mockApi.updatePrintConfig(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['printConfig'] }), ...opts });
}

function usePurchaseCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createPurchase, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchase'] }), ...opts });
}

function useExpenseList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['expense', 'list', input], queryFn: () => mockApi.listExpenses(input?.type, input?.startDate, input?.endDate), ...opts });
}
function useExpenseCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createExpense, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expense'] }), ...opts });
}
function useExpenseDelete(opts?: any) {
  return useMutation({ mutationFn: (id: number) => mockApi.deleteExpense(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expense'] }), ...opts });
}
function useFixedExpenseList(input?: any, opts?: any) {
  return useQuery({ queryKey: ['fixedExpense', 'list'], queryFn: mockApi.listFixedExpenses, ...opts });
}
function useFixedExpenseCreate(opts?: any) {
  return useMutation({ mutationFn: mockApi.createFixedExpense, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fixedExpense'] }), ...opts });
}
function useFixedExpenseUpdate(opts?: any) {
  return useMutation({ mutationFn: ({ id, ...data }: any) => mockApi.updateFixedExpense(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fixedExpense'] }), ...opts });
}
function useFixedExpenseDelete(opts?: any) {
  return useMutation({ mutationFn: (id: number) => mockApi.deleteFixedExpense(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fixedExpense'] }), ...opts });
}

function useUtils() {
  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries();
  }, []);
  return {
    invalidate,
    dashboard: { stats: { invalidate: () => queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] }) } },
    product: { list: { invalidate: () => queryClient.invalidateQueries({ queryKey: ['product'] }) } },
    customer: { list: { invalidate: () => queryClient.invalidateQueries({ queryKey: ['customer'] }) } },
    supplier: { list: { invalidate: () => queryClient.invalidateQueries({ queryKey: ['supplier'] }) } },
    employee: { list: { invalidate: () => queryClient.invalidateQueries({ queryKey: ['employee'] }) } },
    employeeLoan: { list: { invalidate: () => queryClient.invalidateQueries({ queryKey: ['employeeLoan'] }) } },
    invoice: { list: { invalidate: () => queryClient.invalidateQueries({ queryKey: ['invoice'] }) } },
    order: { list: { invalidate: () => queryClient.invalidateQueries({ queryKey: ['order'] }) } },
    credit: { list: { invalidate: () => queryClient.invalidateQueries({ queryKey: ['credit'] }) } },
    purchase: { list: { invalidate: () => queryClient.invalidateQueries({ queryKey: ['purchase'] }) } },
    delivery: { list: { invalidate: () => queryClient.invalidateQueries({ queryKey: ['delivery'] }) } },
    transfer: { list: { invalidate: () => queryClient.invalidateQueries({ queryKey: ['transfer'] }) } },
    stockCount: { list: { invalidate: () => queryClient.invalidateQueries({ queryKey: ['stockCount'] }) } },
    adjustment: { list: { invalidate: () => queryClient.invalidateQueries({ queryKey: ['adjustment'] }) } },
    payroll: { list: { invalidate: () => queryClient.invalidateQueries({ queryKey: ['payroll'] }) } },
    table: { list: { invalidate: () => queryClient.invalidateQueries({ queryKey: ['table'] }) } },
    comanda: { list: { invalidate: () => queryClient.invalidateQueries({ queryKey: ['comanda'] }) } },
    whatsapp: { list: { invalidate: () => queryClient.invalidateQueries({ queryKey: ['whatsapp'] }) } },
  };
}

export const trpc = {
  dashboard: { stats: { useQuery: useDashboardStats }, recentActivity: { useQuery: useRecentActivity } },
  product: { listCategories: { useQuery: useProductCategories }, list: { useQuery: useProductList }, create: { useMutation: useProductCreate }, update: { useMutation: useProductUpdate }, delete: { useMutation: useProductDelete } },
  customer: { list: { useQuery: useCustomerList }, create: { useMutation: useCustomerCreate }, update: { useMutation: useCustomerUpdate }, delete: { useMutation: useCustomerDelete } },
  supplier: { list: { useQuery: useSupplierList }, create: { useMutation: useSupplierCreate }, update: { useMutation: useSupplierUpdate }, delete: { useMutation: useSupplierDelete } },
  employee: { list: { useQuery: useEmployeeList }, create: { useMutation: useEmployeeCreate }, update: { useMutation: useEmployeeUpdate }, delete: { useMutation: useEmployeeDelete } },
  employeeLoan: { list: { useQuery: useEmployeeLoanList }, create: { useMutation: useEmployeeLoanCreate }, addPayment: { useMutation: useLoanPaymentCreate } },
  loanPayment: { create: { useMutation: useLoanPaymentCreate } },
  payroll: { list: { useQuery: usePayrollPeriodList }, create: { useMutation: usePayrollPeriodCreate }, process: { useMutation: usePayrollProcess }, pay: { useMutation: usePayrollPay }, itemList: { useQuery: usePayrollItemList }, itemCreate: { useMutation: usePayrollItemCreate }, history: { useQuery: useEmployeePayrollHistory } },
  invoice: { list: { useQuery: useInvoiceList }, create: { useMutation: useInvoiceCreate } },
  order: { list: { useQuery: useOrderList }, updateStatus: { useMutation: useOrderUpdateStatus } },
  credit: { list: { useQuery: useCreditList }, addPayment: { useMutation: useCreditAddPayment } },
  purchase: { list: { useQuery: usePurchaseList }, create: { useMutation: usePurchaseCreate } },
  delivery: { list: { useQuery: useDeliveryList }, listZones: { useQuery: useDeliveryZones }, create: { useMutation: useDeliveryCreate }, updateStatus: { useMutation: useDeliveryUpdateStatus } },
  transfer: { list: { useQuery: useTransferList }, create: { useMutation: useTransferCreate }, receive: { useMutation: useTransferReceive }, cancel: { useMutation: useTransferCancel } },
  stockCount: { list: { useQuery: useStockCountList }, create: { useMutation: useStockCountCreate }, complete: { useMutation: useStockCountComplete } },
  adjustment: { list: { useQuery: useAdjustmentList }, create: { useMutation: useAdjustmentCreate } },
  table: { list: { useQuery: useTableList }, create: { useMutation: useTableCreate }, update: { useMutation: useTableUpdate }, delete: { useMutation: useTableDelete }, orderItems: { useQuery: useTableOrderItems }, addItem: { useMutation: useTableAddOrderItem }, removeItem: { useMutation: useTableRemoveOrderItem }, clear: { useMutation: useTableClear } },
  comanda: { list: { useQuery: useComandaList }, create: { useMutation: useComandaCreate }, updateStatus: { useMutation: useComandaUpdateStatus }, delete: { useMutation: useComandaDelete } },
  whatsapp: { sessionList: { useQuery: useWhatsAppSessionList }, connect: { useMutation: useWhatsAppConnect }, disconnect: { useMutation: useWhatsAppDisconnect }, messageList: { useQuery: useWhatsAppMessageList }, sendMessage: { useMutation: useWhatsAppSendMessage }, markRead: { useMutation: useWhatsAppMarkRead }, templateList: { useQuery: useWhatsAppTemplateList }, templateCreate: { useMutation: useWhatsAppTemplateCreate }, templateDelete: { useMutation: useWhatsAppTemplateDelete } },
  branch: { list: { useQuery: useBranchList }, create: { useMutation: useBranchCreate } },
  bank: { list: { useQuery: useBankList }, create: { useMutation: useBankCreate }, update: { useMutation: useBankUpdate }, delete: { useMutation: useBankDelete }, transactions: { useQuery: useBankTransactionList }, transactionCreate: { useMutation: useBankTransactionCreate }, mainCash: { useQuery: useMainCash } },
  cashRegister: { list: { useQuery: useCashRegisterList }, create: { useMutation: useCashRegisterCreate }, update: { useMutation: useCashRegisterUpdate }, delete: { useMutation: useCashRegisterDelete } },
  user: { list: { useQuery: useUserList }, create: { useMutation: useUserCreate }, update: { useMutation: useUserUpdate }, delete: { useMutation: useUserDelete } },
  expenseConcept: { list: { useQuery: useExpenseConceptList }, create: { useMutation: useExpenseConceptCreate }, delete: { useMutation: useExpenseConceptDelete } },
  resolution: { list: { useQuery: useResolutionList }, create: { useMutation: useResolutionCreate }, update: { useMutation: useResolutionUpdate } },
  taxConfig: { list: { useQuery: useTaxConfigList }, create: { useMutation: useTaxConfigCreate }, update: { useMutation: useTaxConfigUpdate }, delete: { useMutation: useTaxConfigDelete } },
  emailConfig: { get: { useQuery: useEmailConfig }, save: { useMutation: useEmailConfigSave } },
  barcodeConfig: { get: { useQuery: useBarcodeConfig }, save: { useMutation: useBarcodeConfigSave } },
  pointsConfig: { get: { useQuery: usePointsConfig }, save: { useMutation: usePointsConfigSave } },
  permissionCategory: { list: { useQuery: usePermissionCategoryList }, update: { useMutation: usePermissionCategoryUpdate } },
  printConfig: { list: { useQuery: usePrintConfigList }, update: { useMutation: usePrintConfigUpdate } },
  expense: { list: { useQuery: useExpenseList }, create: { useMutation: useExpenseCreate }, delete: { useMutation: useExpenseDelete } },
  fixedExpense: { list: { useQuery: useFixedExpenseList }, create: { useMutation: useFixedExpenseCreate }, update: { useMutation: useFixedExpenseUpdate }, delete: { useMutation: useFixedExpenseDelete } },
  settings: { getBusiness: { useQuery: useBusiness }, getSettings: { useQuery: useBusinessSettings }, updateBusiness: { useMutation: useBusinessUpdate }, updateSettings: { useMutation: useSettingsUpdate }, getBranches: { useQuery: useBranchList } },
  report: { salesReport: { useQuery: useSalesReport }, inventoryReport: { useQuery: useInventoryReport }, deliveryReport: { useQuery: useDeliveryReport }, financialReport: { useQuery: useFinancialReport } },
  auth: { me: { useQuery: useCurrentUser }, logout: { useMutation: useLogout } },
  useUtils,
} as any;

export function TRPCProvider({ children }: { children: ReactNode }) {
  return (
    <MockTRPCProvider>
      {children}
    </MockTRPCProvider>
  );
}

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
    branch: { list: { invalidate: () => queryClient.invalidateQueries({ queryKey: ['branch'] }) } },
  };
}

export const trpc = {
  dashboard: { stats: { useQuery: useDashboardStats }, recentActivity: { useQuery: useRecentActivity } },
  product: { listCategories: { useQuery: useProductCategories }, list: { useQuery: useProductList }, create: { useMutation: useProductCreate }, update: { useMutation: useProductUpdate }, delete: { useMutation: useProductDelete } },
  customer: { list: { useQuery: useCustomerList }, create: { useMutation: useCustomerCreate }, update: { useMutation: useCustomerUpdate }, delete: { useMutation: useCustomerDelete } },
  supplier: { list: { useQuery: useSupplierList }, create: { useMutation: useSupplierCreate }, update: { useMutation: useSupplierUpdate }, delete: { useMutation: useSupplierDelete } },
  employee: { list: { useQuery: useEmployeeList }, create: { useMutation: useEmployeeCreate }, update: { useMutation: useEmployeeUpdate }, delete: { useMutation: useEmployeeDelete } },
  employeeLoan: { list: { useQuery: useEmployeeLoanList }, create: { useMutation: useEmployeeLoanCreate }, addPayment: { useMutation: useLoanPaymentCreate } },
  invoice: { list: { useQuery: useInvoiceList }, create: { useMutation: useInvoiceCreate } },
  order: { list: { useQuery: useOrderList }, updateStatus: { useMutation: useOrderUpdateStatus } },
  credit: { list: { useQuery: useCreditList }, addPayment: { useMutation: useCreditAddPayment } },
  purchase: { list: { useQuery: usePurchaseList } },
  delivery: { list: { useQuery: useDeliveryList }, listZones: { useQuery: useDeliveryZones }, create: { useMutation: useDeliveryCreate }, updateStatus: { useMutation: useDeliveryUpdateStatus } },
  transfer: { list: { useQuery: useTransferList }, create: { useMutation: useTransferCreate }, receive: { useMutation: useTransferReceive }, cancel: { useMutation: useTransferCancel } },
  stockCount: { list: { useQuery: useStockCountList }, create: { useMutation: useStockCountCreate }, complete: { useMutation: useStockCountComplete } },
  adjustment: { list: { useQuery: useAdjustmentList }, create: { useMutation: useAdjustmentCreate } },
  branch: { list: { useQuery: useBranchList }, create: { useMutation: useBranchCreate } },
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

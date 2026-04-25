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

// ========== PROVIDER ==========
export function MockTRPCProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

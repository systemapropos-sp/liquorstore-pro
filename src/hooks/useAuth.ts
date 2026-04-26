import { useCallback } from "react";
import { trpc } from "@/providers/trpc";

export function useAuth() {
  const utils = trpc.useUtils();
  const meQuery = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.invalidate();
    },
  });

  const logout = useCallback(() => {
    logoutMutation.mutate();
    window.location.reload();
  }, [logoutMutation]);

  return {
    user: meQuery.data
      ? {
          ...meQuery.data,
          role: (meQuery.data as any).role || "admin",
          businessId: (meQuery.data as any).businessId || 1,
        }
      : null,
    isLoading: false,
    logout,
  };
}

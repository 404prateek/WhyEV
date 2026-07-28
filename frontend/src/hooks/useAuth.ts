import { useAuthStore } from '@/lib/store';

export function useAuth() {
  const store = useAuthStore();
  return {
    user: store.user,
    isAuthenticated: !!store.user,
    isAuthModalOpen: store.isAuthModalOpen,
    isPermissionModalOpen: store.isPermissionModalOpen,
    activePermissionRequest: store.activePermissionRequest,
    login: store.login,
    logout: store.logout,
    openAuthModal: () => store.setAuthModalOpen(true),
    closeAuthModal: () => store.setAuthModalOpen(false),
    requestPermission: store.requestPermission,
    closePermissionModal: store.closePermissionModal,
  };
}

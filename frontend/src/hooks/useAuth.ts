import { useAuthStore } from '@/lib/store';
import { authService } from '@/services/authService';

export function useAuth() {
  const store = useAuthStore();

  const loginWithGoogle = async () => {
    const res = await authService.loginWithGoogle();
    if (res.success) {
      store.login(res.user);
    }
    return res;
  };

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isAuthModalOpen: store.isAuthModalOpen,
    targetRedirectUrl: store.targetRedirectUrl,
    isPermissionModalOpen: store.isPermissionModalOpen,
    activePermissionRequest: store.activePermissionRequest,
    login: store.login,
    loginWithGoogle,
    logout: store.logout,
    openAuthModal: store.openAuthModal,
    closeAuthModal: store.closeAuthModal,
    requestPermission: store.requestPermission,
    closePermissionModal: store.closePermissionModal,
  };
}

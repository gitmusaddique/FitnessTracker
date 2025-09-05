import type { AdminUser } from "@shared/admin-schema";

interface AdminAuthState {
  token: string | null;
  admin: AdminUser | null;
  isAuthenticated: boolean;
}

class AdminAuthManager {
  private state: AdminAuthState = {
    token: null,
    admin: null,
    isAuthenticated: false
  };

  private listeners: ((state: AdminAuthState) => void)[] = [];

  constructor() {
    // Initialize from localStorage
    const token = localStorage.getItem('admin_auth_token');
    const adminData = localStorage.getItem('admin_auth_user');
    
    if (token && adminData) {
      try {
        this.state = {
          token,
          admin: JSON.parse(adminData),
          isAuthenticated: true
        };
      } catch (error) {
        this.clearAuth();
      }
    }
  }

  getState(): AdminAuthState {
    return this.state;
  }

  subscribe(listener: (state: AdminAuthState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  setAuth(token: string, admin: AdminUser) {
    this.state = {
      token,
      admin,
      isAuthenticated: true
    };
    
    localStorage.setItem('admin_auth_token', token);
    localStorage.setItem('admin_auth_user', JSON.stringify(admin));
    this.notify();
  }

  clearAuth() {
    this.state = {
      token: null,
      admin: null,
      isAuthenticated: false
    };
    
    localStorage.removeItem('admin_auth_token');
    localStorage.removeItem('admin_auth_user');
    this.notify();
  }

  getAuthHeaders(): HeadersInit {
    if (!this.state.token) {
      return {};
    }
    
    return {
      'Authorization': `Bearer ${this.state.token}`
    };
  }
}

export const adminAuthManager = new AdminAuthManager();

export function useAdminAuth() {
  return adminAuthManager.getState();
}
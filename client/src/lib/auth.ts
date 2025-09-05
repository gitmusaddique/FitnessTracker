import { type User } from "@shared/schema";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

class AuthManager {
  private state: AuthState = {
    token: null,
    user: null,
    isAuthenticated: false
  };

  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    // Initialize from localStorage
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('auth_user');
    
    if (token && userData) {
      try {
        this.state = {
          token,
          user: JSON.parse(userData),
          isAuthenticated: true
        };
      } catch (error) {
        // Clear invalid data
        this.clearAuth();
      }
    }
  }

  getState(): AuthState {
    return this.state;
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  setAuth(token: string, user: User) {
    this.state = {
      token,
      user,
      isAuthenticated: true
    };
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    this.notify();
  }

  clearAuth() {
    this.state = {
      token: null,
      user: null,
      isAuthenticated: false
    };
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
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

export const authManager = new AuthManager();

export function useAuth() {
  return authManager.getState();
}

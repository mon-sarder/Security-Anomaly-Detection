import api from './api';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth.types';

class AuthService {
  async login(username: string, password: string): Promise<AuthResponse> {
    const request: LoginRequest = { username, password };
    const response = await api.post<AuthResponse>('/api/auth/login', request);

    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async register(username: string, password: string, email: string): Promise<AuthResponse> {
    const request: RegisterRequest = { username, password, email };
    const response = await api.post<AuthResponse>('/api/auth/register', request);
    return response;
  }

  async verifyToken(): Promise<boolean> {
    try {
      await api.get('/api/auth/verify');
      return true;
    } catch (error) {
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
export default authService;
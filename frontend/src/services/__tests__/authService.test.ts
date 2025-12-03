import authService from '../authService';
import api from '../api';

jest.mock('../api');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const mockResponse = {
        token: 'test-token-123',
        user: {
          user_id: 'user-1',
          username: 'testuser',
          role: 'analyst',
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login('testuser', 'password123');

      expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
        username: 'testuser',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse);
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token-123');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(mockResponse.user)
      );
    });

    it('should throw error on failed login', async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

      await expect(authService.login('testuser', 'wrongpass')).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const mockResponse = {
        message: 'User registered successfully',
        user_id: 'user-1',
        username: 'newuser',
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.register('newuser', 'password123', 'test@example.com');

      expect(api.post).toHaveBeenCalledWith('/api/auth/register', {
        username: 'newuser',
        password: 'password123',
        email: 'test@example.com',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed registration', async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error('Username already exists'));

      await expect(
        authService.register('existinguser', 'password123', 'test@example.com')
      ).rejects.toThrow('Username already exists');
    });
  });

  describe('verifyToken', () => {
    it('should return true for valid token', async () => {
      (api.get as jest.Mock).mockResolvedValue({ valid: true });

      const result = await authService.verifyToken();

      expect(api.get).toHaveBeenCalledWith('/api/auth/verify');
      expect(result).toBe(true);
    });

    it('should return false for invalid token', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Invalid token'));

      const result = await authService.verifyToken();

      expect(result).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear token and user from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));

      authService.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('test-token-123');

      const token = authService.getToken();

      expect(localStorage.getItem).toHaveBeenCalledWith('token');
      expect(token).toBe('test-token-123');
    });

    it('should return null if no token exists', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      const token = authService.getToken();

      expect(token).toBeNull();
    });
  });

  describe('getUser', () => {
    it('should return parsed user from localStorage', () => {
      const mockUser = { user_id: 'user-1', username: 'testuser' };
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockUser));

      const user = authService.getUser();

      expect(localStorage.getItem).toHaveBeenCalledWith('user');
      expect(user).toEqual(mockUser);
    });

    it('should return null if no user exists', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      const user = authService.getUser();

      expect(user).toBeNull();
    });

    it('should return null if user data is invalid JSON', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('invalid-json');

      const user = authService.getUser();

      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('test-token');

      const isAuth = authService.isAuthenticated();

      expect(isAuth).toBe(true);
    });

    it('should return false when no token exists', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      const isAuth = authService.isAuthenticated();

      expect(isAuth).toBe(false);
    });
  });
});
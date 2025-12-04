import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { AuthProvider } from '../../../context/AuthContext';
import * as useAuthHook from '../../../hooks/useAuth';

// Mock useAuth hook
jest.mock('../../../hooks/useAuth');
const mockUseAuth = useAuthHook.useAuth as jest.MockedFunction<typeof useAuthHook.useAuth>;

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      register: jest.fn(),
      logout: jest.fn(),
    });
  });

  it('should render login form', () => {
    renderLogin();

    expect(screen.getByText('Security Anomaly Detection')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should show link to register page', () => {
    renderLogin();

    const registerLink = screen.getByText(/register here/i);
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('should update username input', () => {
    renderLogin();

    const usernameInput = screen.getByLabelText(/username/i) as HTMLInputElement;
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });

    expect(usernameInput.value).toBe('testuser');
  });

  it('should update password input', () => {
    renderLogin();

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(passwordInput.value).toBe('password123');
  });

  it('should call login function on form submit', async () => {
    mockLogin.mockResolvedValue(undefined);
    renderLogin();

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });
  });

  it('should navigate to dashboard on successful login', async () => {
    mockLogin.mockResolvedValue(undefined);
    renderLogin();

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should display error message on failed login', async () => {
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValue({
      response: { data: { error: errorMessage } },
    });
    renderLogin();

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should display generic error message when error has no response', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'));
    renderLogin();

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/login failed. please check your credentials/i)
      ).toBeInTheDocument();
    });
  });

  it('should disable form inputs and button while loading', async () => {
    mockLogin.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    renderLogin();

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Should show loading state
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(usernameInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('should require username and password', () => {
    renderLogin();

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(usernameInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('should have correct input types', () => {
    renderLogin();

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(usernameInput).toHaveAttribute('type', 'text');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
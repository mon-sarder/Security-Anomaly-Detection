import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../Register';
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

const renderRegister = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Register />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Register Component', () => {
  const mockRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      register: mockRegister,
      logout: jest.fn(),
    });
  });

  it('should render registration form', () => {
    renderRegister();

    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Register for Security Anomaly Detection')).toBeInTheDocument();
    expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('should show link to login page', () => {
    renderRegister();

    const loginLink = screen.getByText(/sign in here/i);
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should update all input fields', () => {
    renderRegister();

    const usernameInput = screen.getByLabelText(/^username$/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
    const confirmInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement;

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('newuser');
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
    expect(confirmInput.value).toBe('password123');
  });

  it('should call register function on form submit with matching passwords', async () => {
    mockRegister.mockResolvedValue(undefined);
    renderRegister();

    const usernameInput = screen.getByLabelText(/^username$/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('newuser', 'password123', 'test@example.com');
    });
  });

  it('should show error when passwords do not match', async () => {
    renderRegister();

    const usernameInput = screen.getByLabelText(/^username$/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'different' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should show error when password is too short', async () => {
    renderRegister();

    const usernameInput = screen.getByLabelText(/^username$/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    fireEvent.change(confirmInput, { target: { value: '12345' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 6 characters long/i)
      ).toBeInTheDocument();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should navigate to dashboard on successful registration', async () => {
    mockRegister.mockResolvedValue(undefined);
    renderRegister();

    const usernameInput = screen.getByLabelText(/^username$/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should display error message on failed registration', async () => {
    const errorMessage = 'Username already exists';
    mockRegister.mockRejectedValue({
      response: { data: { error: errorMessage } },
    });
    renderRegister();

    const usernameInput = screen.getByLabelText(/^username$/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should disable form inputs and button while loading', async () => {
    mockRegister.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    renderRegister();

    const usernameInput = screen.getByLabelText(/^username$/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    expect(usernameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(confirmInput).toBeDisabled();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });
  });

  it('should require all fields', () => {
    renderRegister();

    const usernameInput = screen.getByLabelText(/^username$/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);

    expect(usernameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(confirmInput).toBeRequired();
  });

  it('should have correct input types', () => {
    renderRegister();

    const usernameInput = screen.getByLabelText(/^username$/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);

    expect(usernameInput).toHaveAttribute('type', 'text');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmInput).toHaveAttribute('type', 'password');
  });

  it('should have minimum length validation on password inputs', () => {
    renderRegister();

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);

    expect(passwordInput).toHaveAttribute('minLength', '6');
    expect(confirmInput).toHaveAttribute('minLength', '6');
  });
});
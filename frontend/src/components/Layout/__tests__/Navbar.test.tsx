import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Navbar';
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

const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render navbar with title', () => {
    mockUseAuth.mockReturnValue({
      user: { user_id: '1', username: 'testuser', role: 'analyst' },
      token: 'test-token',
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: mockLogout,
    });

    renderNavbar();

    expect(screen.getByText(/security anomaly detection/i)).toBeInTheDocument();
  });

  it('should display username when user is logged in', () => {
    mockUseAuth.mockReturnValue({
      user: { user_id: '1', username: 'johndoe', role: 'analyst' },
      token: 'test-token',
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: mockLogout,
    });

    renderNavbar();

    expect(screen.getByText('johndoe')).toBeInTheDocument();
  });

  it('should display user icon', () => {
    mockUseAuth.mockReturnValue({
      user: { user_id: '1', username: 'testuser', role: 'analyst' },
      token: 'test-token',
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: mockLogout,
    });

    renderNavbar();

    expect(screen.getByText('👤')).toBeInTheDocument();
  });

  it('should display logout button', () => {
    mockUseAuth.mockReturnValue({
      user: { user_id: '1', username: 'testuser', role: 'analyst' },
      token: 'test-token',
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: mockLogout,
    });

    renderNavbar();

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it('should call logout and navigate to login on logout button click', () => {
    mockUseAuth.mockReturnValue({
      user: { user_id: '1', username: 'testuser', role: 'analyst' },
      token: 'test-token',
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: mockLogout,
    });

    renderNavbar();

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should handle missing user gracefully', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: mockLogout,
    });

    renderNavbar();

    expect(screen.getByText(/security anomaly detection/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });
});
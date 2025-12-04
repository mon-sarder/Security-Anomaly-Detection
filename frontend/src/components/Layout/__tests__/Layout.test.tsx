import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../Layout';
import * as useAuthHook from '../../../hooks/useAuth';

// Mock useAuth hook for Navbar
jest.mock('../../../hooks/useAuth');
const mockUseAuth = useAuthHook.useAuth as jest.MockedFunction<typeof useAuthHook.useAuth>;

// Mock useNavigate for Navbar
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const renderLayout = (children: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <Layout>{children}</Layout>
    </BrowserRouter>
  );
};

describe('Layout Component', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { user_id: '1', username: 'testuser', role: 'analyst' },
      token: 'test-token',
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });
  });

  it('should render Navbar', () => {
    renderLayout(<div>Test Content</div>);

    expect(screen.getByText(/security anomaly detection/i)).toBeInTheDocument();
  });

  it('should render Sidebar', () => {
    renderLayout(<div>Test Content</div>);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Login Events')).toBeInTheDocument();
    expect(screen.getByText('Alerts')).toBeInTheDocument();
  });

  it('should render children content', () => {
    renderLayout(<div>Test Content</div>);

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    renderLayout(
      <>
        <h1>Title</h1>
        <p>Paragraph</p>
        <button>Button</button>
      </>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Button' })).toBeInTheDocument();
  });

  it('should have correct layout structure', () => {
    const { container } = renderLayout(<div>Test Content</div>);

    expect(container.querySelector('.layout')).toBeInTheDocument();
    expect(container.querySelector('.layout-body')).toBeInTheDocument();
    expect(container.querySelector('.layout-content')).toBeInTheDocument();
  });

  it('should render Navbar, Sidebar, and content in correct order', () => {
    const { container } = renderLayout(<div>Test Content</div>);

    const layout = container.querySelector('.layout');
    const children = layout?.children;

    expect(children?.[0]).toHaveClass('navbar');
    expect(children?.[1]).toHaveClass('layout-body');
  });
});
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Sidebar from '../Sidebar';

const renderSidebar = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Sidebar />
    </MemoryRouter>
  );
};

describe('Sidebar Component', () => {
  it('should render all navigation links', () => {
    renderSidebar();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Login Events')).toBeInTheDocument();
    expect(screen.getByText('Alerts')).toBeInTheDocument();
  });

  it('should render navigation icons', () => {
    renderSidebar();

    expect(screen.getByText('📊')).toBeInTheDocument(); // Dashboard icon
    expect(screen.getByText('🔍')).toBeInTheDocument(); // Login Events icon
    expect(screen.getByText('🚨')).toBeInTheDocument(); // Alerts icon
  });

  it('should have correct href attributes', () => {
    renderSidebar();

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    const eventsLink = screen.getByText('Login Events').closest('a');
    const alertsLink = screen.getByText('Alerts').closest('a');

    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(eventsLink).toHaveAttribute('href', '/login-events');
    expect(alertsLink).toHaveAttribute('href', '/alerts');
  });

  it('should highlight active dashboard link', () => {
    renderSidebar('/dashboard');

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('active');
  });

  it('should highlight active login events link', () => {
    renderSidebar('/login-events');

    const eventsLink = screen.getByText('Login Events').closest('a');
    expect(eventsLink).toHaveClass('active');
  });

  it('should highlight active alerts link', () => {
    renderSidebar('/alerts');

    const alertsLink = screen.getByText('Alerts').closest('a');
    expect(alertsLink).toHaveClass('active');
  });

  it('should only have one active link at a time', () => {
    renderSidebar('/dashboard');

    const activeLinks = document.querySelectorAll('.active');
    expect(activeLinks).toHaveLength(1);
  });

  it('should have sidebar-link class on all links', () => {
    renderSidebar();

    const links = document.querySelectorAll('.sidebar-link');
    expect(links).toHaveLength(3);
  });
});
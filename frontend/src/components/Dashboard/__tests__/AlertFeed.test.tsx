import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AlertFeed from '../AlertFeed';
import { Alert } from '../../../types/dashboard.types';
import * as dashboardService from '../../../services/dashboardService';

jest.mock('../../../services/dashboardService');

describe('AlertFeed Component', () => {
  const mockOnRefresh = jest.fn();

  const mockAlerts: Alert[] = [
    {
      _id: 'alert-1',
      alert_type: 'suspicious_login',
      severity: 'high',
      user_id: 'user-1',
      username: 'testuser',
      description: 'Suspicious login detected from unusual location',
      timestamp: new Date().toISOString(),
      login_event_id: 'event-1',
      details: {
        risk_score: 0.85,
        reasons: ['Unusual location', 'Off hours'],
        ip_address: '192.168.1.100',
        location: {
          city: 'San Francisco',
          country: 'USA',
        },
      },
      resolved: false,
    },
    {
      _id: 'alert-2',
      alert_type: 'failed_attempts',
      severity: 'critical',
      user_id: 'user-2',
      username: 'admin',
      description: 'Multiple failed login attempts detected',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      details: {
        ip_address: '10.0.0.1',
      },
      resolved: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render alert feed with title', () => {
    render(<AlertFeed alerts={mockAlerts} onRefresh={mockOnRefresh} />);

    expect(screen.getByText('Recent Alerts')).toBeInTheDocument();
  });

  it('should display alert count badge', () => {
    render(<AlertFeed alerts={mockAlerts} onRefresh={mockOnRefresh} />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should render all alerts', () => {
    render(<AlertFeed alerts={mockAlerts} onRefresh={mockOnRefresh} />);

    expect(
      screen.getByText('Suspicious login detected from unusual location')
    ).toBeInTheDocument();
    expect(screen.getByText('Multiple failed login attempts detected')).toBeInTheDocument();
  });

  it('should display severity badges', () => {
    render(<AlertFeed alerts={mockAlerts} onRefresh={mockOnRefresh} />);

    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });

  it('should display usernames', () => {
    render(<AlertFeed alerts={mockAlerts} onRefresh={mockOnRefresh} />);

    expect(screen.getByText('👤 testuser')).toBeInTheDocument();
    expect(screen.getByText('👤 admin')).toBeInTheDocument();
  });

  it('should display IP addresses when available', () => {
    render(<AlertFeed alerts={mockAlerts} onRefresh={mockOnRefresh} />);

    expect(screen.getByText('🌐 192.168.1.100')).toBeInTheDocument();
    expect(screen.getByText('🌐 10.0.0.1')).toBeInTheDocument();
  });

  it('should display relative timestamps', () => {
    render(<AlertFeed alerts={mockAlerts} onRefresh={mockOnRefresh} />);

    // Should show "Just now" or similar
    const timeElements = screen.getAllByText(/ago|Just now/i);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('should show "Mark as Resolved" buttons for unresolved alerts', () => {
    render(<AlertFeed alerts={mockAlerts} onRefresh={mockOnRefresh} />);

    const resolveButtons = screen.getAllByText('Mark as Resolved');
    expect(resolveButtons).toHaveLength(2);
  });

  it('should not show "Mark as Resolved" button for resolved alerts', () => {
    const resolvedAlerts = [
      {
        ...mockAlerts[0],
        resolved: true,
      },
    ];

    render(<AlertFeed alerts={resolvedAlerts} onRefresh={mockOnRefresh} />);

    expect(screen.queryByText('Mark as Resolved')).not.toBeInTheDocument();
  });

  it('should call updateAlert when resolve button is clicked', async () => {
    (dashboardService.default.updateAlert as jest.Mock).mockResolvedValue({
      message: 'Alert updated',
    });

    render(<AlertFeed alerts={mockAlerts} onRefresh={mockOnRefresh} />);

    const resolveButtons = screen.getAllByText('Mark as Resolved');
    fireEvent.click(resolveButtons[0]);

    await waitFor(() => {
      expect(dashboardService.default.updateAlert).toHaveBeenCalledWith('alert-1', true);
    });
  });

  it('should call onRefresh after resolving alert', async () => {
    (dashboardService.default.updateAlert as jest.Mock).mockResolvedValue({
      message: 'Alert updated',
    });

    render(<AlertFeed alerts={mockAlerts} onRefresh={mockOnRefresh} />);

    const resolveButtons = screen.getAllByText('Mark as Resolved');
    fireEvent.click(resolveButtons[0]);

    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('should display empty state when no alerts', () => {
    render(<AlertFeed alerts={[]} onRefresh={mockOnRefresh} />);

    expect(screen.getByText('No active alerts')).toBeInTheDocument();
  });

  it('should show alert count of 0 when no alerts', () => {
    render(<AlertFeed alerts={[]} onRefresh={mockOnRefresh} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should handle errors when resolving alert', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    (dashboardService.default.updateAlert as jest.Mock).mockRejectedValue(
      new Error('Failed to update')
    );

    render(<AlertFeed alerts={mockAlerts} onRefresh={mockOnRefresh} />);

    const resolveButtons = screen.getAllByText('Mark as Resolved');
    fireEvent.click(resolveButtons[0]);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });
});
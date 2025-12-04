import React from 'react';
import { render, screen } from '@testing-library/react';
import MetricsCards from '../MetricsCards';
import { DashboardStats } from '../../../types/dashboard.types';

describe('MetricsCards Component', () => {
  const mockStats: DashboardStats = {
    time_range_hours: 24,
    total_logins: 1000,
    anomalous_logins: 50,
    anomaly_rate: 0.05,
    active_alerts: 10,
    high_risk_logins: 5,
    avg_risk_score: 0.25,
  };

  it('should render all metric cards', () => {
    render(<MetricsCards stats={mockStats} />);

    expect(screen.getByText('Total Logins')).toBeInTheDocument();
    expect(screen.getByText('Anomalous Logins')).toBeInTheDocument();
    expect(screen.getByText('Active Alerts')).toBeInTheDocument();
    expect(screen.getByText('High Risk Logins')).toBeInTheDocument();
    expect(screen.getByText('Avg Risk Score')).toBeInTheDocument();
  });

  it('should display correct total logins value', () => {
    render(<MetricsCards stats={mockStats} />);

    expect(screen.getByText('1,000')).toBeInTheDocument();
  });

  it('should display correct anomalous logins value and percentage', () => {
    render(<MetricsCards stats={mockStats} />);

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('5.0%')).toBeInTheDocument();
  });

  it('should display correct active alerts value', () => {
    render(<MetricsCards stats={mockStats} />);

    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should display correct high risk logins value', () => {
    render(<MetricsCards stats={mockStats} />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should display correct average risk score', () => {
    render(<MetricsCards stats={mockStats} />);

    expect(screen.getByText('25.0%')).toBeInTheDocument();
  });

  it('should render all icons', () => {
    render(<MetricsCards stats={mockStats} />);

    expect(screen.getByText('👥')).toBeInTheDocument(); // Total logins
    expect(screen.getByText('⚠️')).toBeInTheDocument(); // Anomalous logins
    expect(screen.getByText('🚨')).toBeInTheDocument(); // Active alerts
    expect(screen.getByText('🔴')).toBeInTheDocument(); // High risk
    expect(screen.getByText('📊')).toBeInTheDocument(); // Avg risk score
  });

  it('should apply red color when anomaly rate is high', () => {
    const highAnomalyStats = {
      ...mockStats,
      anomaly_rate: 0.15,
    };

    const { container } = render(<MetricsCards stats={highAnomalyStats} />);
    const cards = container.querySelectorAll('.metricCard');

    // Second card should be red (anomalous logins)
    expect(cards[1]).toHaveClass('red');
  });

  it('should apply yellow color when anomaly rate is low', () => {
    const lowAnomalyStats = {
      ...mockStats,
      anomaly_rate: 0.05,
    };

    const { container } = render(<MetricsCards stats={lowAnomalyStats} />);
    const cards = container.querySelectorAll('.metricCard');

    // Second card should be yellow (anomalous logins)
    expect(cards[1]).toHaveClass('yellow');
  });

  it('should apply red color when active alerts are high', () => {
    const highAlertsStats = {
      ...mockStats,
      active_alerts: 10,
    };

    const { container } = render(<MetricsCards stats={highAlertsStats} />);
    const cards = container.querySelectorAll('.metricCard');

    // Third card should be red (active alerts)
    expect(cards[2]).toHaveClass('red');
  });

  it('should apply green color when active alerts are low', () => {
    const lowAlertsStats = {
      ...mockStats,
      active_alerts: 2,
    };

    const { container } = render(<MetricsCards stats={lowAlertsStats} />);
    const cards = container.querySelectorAll('.metricCard');

    // Third card should be green (active alerts)
    expect(cards[2]).toHaveClass('green');
  });

  it('should format large numbers with commas', () => {
    const largeStats = {
      ...mockStats,
      total_logins: 1234567,
      anomalous_logins: 12345,
    };

    render(<MetricsCards stats={largeStats} />);

    expect(screen.getByText('1,234,567')).toBeInTheDocument();
    expect(screen.getByText('12,345')).toBeInTheDocument();
  });

  it('should handle zero values', () => {
    const zeroStats = {
      ...mockStats,
      total_logins: 0,
      anomalous_logins: 0,
      anomaly_rate: 0,
      active_alerts: 0,
      high_risk_logins: 0,
      avg_risk_score: 0,
    };

    render(<MetricsCards stats={zeroStats} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getAllByText('0.0%')).toHaveLength(2);
  });
});
import React from 'react';
import { render, screen } from '@testing-library/react';
import RiskScoreBadge from '../RiskScoreBadge';

describe('RiskScoreBadge Component', () => {
  it('should render risk score correctly', () => {
    render(<RiskScoreBadge score={0.75} />);
    expect(screen.getByText('75.0%')).toBeInTheDocument();
  });

  it('should render with default medium size', () => {
    const { container } = render(<RiskScoreBadge score={0.5} />);
    const badge = container.querySelector('.risk-badge');
    expect(badge).toHaveClass('medium');
  });

  it('should render with small size', () => {
    const { container } = render(<RiskScoreBadge score={0.5} size="small" />);
    const badge = container.querySelector('.risk-badge');
    expect(badge).toHaveClass('small');
  });

  it('should render with large size', () => {
    const { container } = render(<RiskScoreBadge score={0.5} size="large" />);
    const badge = container.querySelector('.risk-badge');
    expect(badge).toHaveClass('large');
  });

  it('should have correct color for low risk', () => {
    const { container } = render(<RiskScoreBadge score={0.2} />);
    const badge = container.querySelector('.risk-badge');
    expect(badge).toHaveStyle({ backgroundColor: '#10b981' }); // green
  });

  it('should have correct color for medium risk', () => {
    const { container } = render(<RiskScoreBadge score={0.4} />);
    const badge = container.querySelector('.risk-badge');
    expect(badge).toHaveStyle({ backgroundColor: '#f59e0b' }); // amber
  });

  it('should have correct color for high risk', () => {
    const { container } = render(<RiskScoreBadge score={0.7} />);
    const badge = container.querySelector('.risk-badge');
    expect(badge).toHaveStyle({ backgroundColor: '#ea580c' }); // orange
  });

  it('should have correct color for critical risk', () => {
    const { container } = render(<RiskScoreBadge score={0.9} />);
    const badge = container.querySelector('.risk-badge');
    expect(badge).toHaveStyle({ backgroundColor: '#dc2626' }); // red
  });

  it('should handle edge case scores', () => {
    const { rerender } = render(<RiskScoreBadge score={0} />);
    expect(screen.getByText('0.0%')).toBeInTheDocument();

    rerender(<RiskScoreBadge score={1} />);
    expect(screen.getByText('100.0%')).toBeInTheDocument();
  });
});
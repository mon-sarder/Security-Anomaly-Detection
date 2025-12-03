import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<LoadingSpinner />);
    const spinnerContainer = container.querySelector('.loading-spinner-container');
    expect(spinnerContainer).toBeInTheDocument();
  });

  it('should render with default medium size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinnerContainer = container.querySelector('.loading-spinner-container');
    expect(spinnerContainer).toHaveClass('medium');
  });

  it('should render with small size', () => {
    const { container } = render(<LoadingSpinner size="small" />);
    const spinnerContainer = container.querySelector('.loading-spinner-container');
    expect(spinnerContainer).toHaveClass('small');
  });

  it('should render with large size', () => {
    const { container } = render(<LoadingSpinner size="large" />);
    const spinnerContainer = container.querySelector('.loading-spinner-container');
    expect(spinnerContainer).toHaveClass('large');
  });

  it('should not render text when not provided', () => {
    render(<LoadingSpinner />);
    const text = screen.queryByText(/./);
    expect(text).not.toBeInTheDocument();
  });

  it('should render text when provided', () => {
    render(<LoadingSpinner text="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('should render spinner element', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
  });
});
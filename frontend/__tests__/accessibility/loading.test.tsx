import { render, screen } from '@testing-library/react';
import Loading from '@/components/feedback/loading';

describe('Loading Accessibility', () => {
  it('should have status role', () => {
    render(<Loading />);
    const loadingContainer = screen.getByRole('status');
    expect(loadingContainer).toBeInTheDocument();
  });

  it('should have aria-live region', () => {
    render(<Loading />);
    const loadingContainer = screen.getByRole('status');
    expect(loadingContainer).toHaveAttribute('aria-live', 'polite');
  });

  it('should have accessible label', () => {
    render(<Loading />);
    const loadingContainer = screen.getByLabelText(/loading content/i);
    expect(loadingContainer).toBeInTheDocument();
  });

  it('should have screen reader text', () => {
    render(<Loading />);
    const srText = screen.getByText(/please wait while content is loading/i);
    expect(srText).toHaveClass('sr-only');
  });

  it('should have visible loading text', () => {
    render(<Loading />);
    const visibleText = screen.getByText(/loading\.\.\./i);
    expect(visibleText).toBeVisible();
  });

  it('should hide decorative spinner from screen readers', () => {
    const { container } = render(<Loading />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
  });
});

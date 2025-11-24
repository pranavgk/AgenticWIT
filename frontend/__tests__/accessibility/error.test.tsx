import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Error from '@/components/feedback/error';

describe('Error Accessibility', () => {
  it('should have alert role', () => {
    render(<Error />);
    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toBeInTheDocument();
  });

  it('should have assertive aria-live region', () => {
    render(<Error />);
    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toHaveAttribute('aria-live', 'assertive');
  });

  it('should display custom error message', () => {
    render(<Error message="Failed to load data" />);
    const message = screen.getByText(/failed to load data/i);
    expect(message).toBeInTheDocument();
  });

  it('should display default error message', () => {
    render(<Error />);
    const message = screen.getByText(/something went wrong/i);
    expect(message).toBeInTheDocument();
  });

  it('should hide decorative emoji from screen readers', () => {
    const { container } = render(<Error />);
    const emoji = container.querySelector('[aria-hidden="true"]');
    expect(emoji).toHaveTextContent('⚠️');
  });

  it('should show retry button with accessible label', () => {
    const handleRetry = jest.fn();
    render(<Error retry={handleRetry} />);
    
    const button = screen.getByRole('button', { name: /retry the failed operation/i });
    expect(button).toBeInTheDocument();
  });

  it('should call retry function when button clicked', async () => {
    const handleRetry = jest.fn();
    const user = userEvent.setup();
    
    render(<Error retry={handleRetry} />);
    const button = screen.getByRole('button', { name: /retry the failed operation/i });
    
    await user.click(button);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('should be keyboard accessible', async () => {
    const handleRetry = jest.fn();
    const user = userEvent.setup();
    
    render(<Error retry={handleRetry} />);
    const button = screen.getByRole('button', { name: /retry the failed operation/i });
    
    button.focus();
    expect(button).toHaveFocus();
    
    await user.keyboard('{Enter}');
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('should have focus ring on retry button', () => {
    const handleRetry = jest.fn();
    render(<Error retry={handleRetry} />);
    
    const button = screen.getByRole('button', { name: /retry the failed operation/i });
    expect(button).toHaveClass('focus:ring-2');
    expect(button).toHaveClass('focus:ring-primary-500');
  });

  it('should not render retry button when not provided', () => {
    render(<Error />);
    const button = screen.queryByRole('button');
    expect(button).not.toBeInTheDocument();
  });
});

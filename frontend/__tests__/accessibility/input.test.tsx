import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';

describe('Input Accessibility', () => {
  it('should associate label with input', () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText(/email/i);
    expect(input).toBeInTheDocument();
  });

  it('should show required indicator', () => {
    render(<Input label="Email" required />);
    const requiredIndicator = screen.getByLabelText(/required/i);
    expect(requiredIndicator).toBeInTheDocument();
    expect(requiredIndicator).toHaveTextContent('*');
  });

  it('should display error message with ARIA', () => {
    render(<Input label="Email" error="Invalid email address" />);
    
    const input = screen.getByLabelText(/email/i);
    const errorMessage = screen.getByRole('alert');
    
    expect(errorMessage).toHaveTextContent('Invalid email address');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<Input label="Username" />);
    
    const input = screen.getByLabelText(/username/i);
    
    await user.tab();
    expect(input).toHaveFocus();
    
    await user.type(input, 'testuser');
    expect(input).toHaveValue('testuser');
  });

  it('should show focus ring on focus', () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText(/email/i);
    
    input.focus();
    expect(input).toHaveClass('focus:ring-2');
    expect(input).toHaveClass('focus:ring-primary-500');
  });

  it('should be disabled and not interactive when disabled', async () => {
    const user = userEvent.setup();
    render(<Input label="Email" disabled />);
    
    const input = screen.getByLabelText(/email/i);
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed');
    
    await user.type(input, 'test');
    expect(input).not.toHaveValue('test');
  });

  it('should have placeholder with proper contrast', () => {
    render(<Input label="Email" placeholder="Enter your email" />);
    const input = screen.getByPlaceholderText(/enter your email/i);
    expect(input).toHaveClass('placeholder:text-gray-400');
  });

  it('should update error state styling', () => {
    const { rerender } = render(<Input label="Email" />);
    const input = screen.getByLabelText(/email/i);
    
    expect(input).not.toHaveClass('border-error-500');
    
    rerender(<Input label="Email" error="Invalid email" />);
    expect(input).toHaveClass('border-error-500');
  });

  it('should have unique IDs for multiple inputs', () => {
    render(
      <>
        <Input label="Email" />
        <Input label="Password" />
      </>
    );
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    expect(emailInput.id).not.toBe(passwordInput.id);
    expect(emailInput.id).toBeTruthy();
    expect(passwordInput.id).toBeTruthy();
  });
});

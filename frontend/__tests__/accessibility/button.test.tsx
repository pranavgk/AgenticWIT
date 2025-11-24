import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button Accessibility', () => {
  it('should render with correct default type', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveAttribute('type', 'button');
  });

  it('should be keyboard accessible', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    
    button.focus();
    expect(button).toHaveFocus();
    
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('should show focus ring on focus', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    
    button.focus();
    expect(button).toHaveClass('focus-visible:ring-2');
    expect(button).toHaveClass('focus-visible:ring-primary-500');
  });

  it('should be disabled and not interactive when disabled', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button disabled onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:pointer-events-none');
    
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should have accessible name', () => {
    render(<Button aria-label="Submit form">Submit</Button>);
    const button = screen.getByRole('button', { name: /submit form/i });
    expect(button).toBeInTheDocument();
  });

  it('should support different variants with proper contrast', () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    let button = screen.getByRole('button', { name: /default/i });
    expect(button).toHaveClass('bg-primary-600', 'text-white');

    rerender(<Button variant="destructive">Delete</Button>);
    button = screen.getByRole('button', { name: /delete/i });
    expect(button).toHaveClass('bg-error-500', 'text-white');

    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByRole('button', { name: /outline/i });
    expect(button).toHaveClass('border', 'border-gray-300');
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

describe('Keyboard Navigation', () => {
  describe('Tab Navigation', () => {
    it('should navigate through multiple buttons with Tab', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <Button>First</Button>
          <Button>Second</Button>
          <Button>Third</Button>
        </div>
      );
      
      const buttons = [
        screen.getByRole('button', { name: /first/i }),
        screen.getByRole('button', { name: /second/i }),
        screen.getByRole('button', { name: /third/i }),
      ];
      
      // Tab through buttons
      await user.tab();
      expect(buttons[0]).toHaveFocus();
      
      await user.tab();
      expect(buttons[1]).toHaveFocus();
      
      await user.tab();
      expect(buttons[2]).toHaveFocus();
    });

    it('should navigate backwards with Shift+Tab', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <Button>First</Button>
          <Button>Second</Button>
        </div>
      );
      
      const first = screen.getByRole('button', { name: /first/i });
      const second = screen.getByRole('button', { name: /second/i });
      
      // Focus second button
      second.focus();
      expect(second).toHaveFocus();
      
      // Shift+Tab to go back
      await user.tab({ shift: true });
      expect(first).toHaveFocus();
    });

    it('should skip disabled elements', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <Button>First</Button>
          <Button disabled>Disabled</Button>
          <Button>Third</Button>
        </div>
      );
      
      const first = screen.getByRole('button', { name: /first/i });
      const third = screen.getByRole('button', { name: /third/i });
      
      await user.tab();
      expect(first).toHaveFocus();
      
      await user.tab();
      expect(third).toHaveFocus();
    });
  });

  describe('Form Navigation', () => {
    it('should navigate through form fields', async () => {
      const user = userEvent.setup();
      
      render(
        <form>
          <Input label="Username" />
          <Input label="Email" />
          <Input label="Password" type="password" />
          <Button type="submit">Submit</Button>
        </form>
      );
      
      const username = screen.getByLabelText(/username/i);
      const email = screen.getByLabelText(/email/i);
      const password = screen.getByLabelText(/password/i);
      const submit = screen.getByRole('button', { name: /submit/i });
      
      await user.tab();
      expect(username).toHaveFocus();
      
      await user.tab();
      expect(email).toHaveFocus();
      
      await user.tab();
      expect(password).toHaveFocus();
      
      await user.tab();
      expect(submit).toHaveFocus();
    });

    it('should allow typing in focused inputs', async () => {
      const user = userEvent.setup();
      
      render(<Input label="Email" />);
      
      const input = screen.getByLabelText(/email/i);
      
      await user.tab();
      expect(input).toHaveFocus();
      
      await user.type(input, 'test@example.com');
      expect(input).toHaveValue('test@example.com');
    });
  });

  describe('Enter and Space Keys', () => {
    it('should activate button with Enter', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      button.focus();
      
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should activate button with Space', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      button.focus();
      
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not activate disabled button', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(<Button disabled onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      
      await user.keyboard('{Enter}');
      await user.keyboard(' ');
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Focus Trapping', () => {
    it('should maintain focus within focusable elements', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <h1>Title</h1>
          <Button>Button 1</Button>
          <p>Some text</p>
          <Button>Button 2</Button>
        </div>
      );
      
      const button1 = screen.getByRole('button', { name: /button 1/i });
      const button2 = screen.getByRole('button', { name: /button 2/i });
      
      await user.tab();
      expect(button1).toHaveFocus();
      
      await user.tab();
      expect(button2).toHaveFocus();
      
      // Non-interactive elements should not receive focus
      const heading = screen.getByRole('heading', { name: /title/i });
      expect(heading).not.toHaveFocus();
    });
  });
});

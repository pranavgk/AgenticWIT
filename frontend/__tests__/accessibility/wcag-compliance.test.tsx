import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Loading from '@/components/feedback/loading';
import Error from '@/components/feedback/error';
import Navigation from '@/components/layout/navigation';

describe('WCAG 2.1 AA Compliance with axe-core', () => {
  describe('UI Components', () => {
    it('Button should have no accessibility violations', async () => {
      const { container } = render(
        <div>
          <Button>Default Button</Button>
          <Button variant="destructive">Delete</Button>
          <Button variant="outline">Outline</Button>
          <Button disabled>Disabled</Button>
        </div>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Input should have no accessibility violations', async () => {
      const { container } = render(
        <div>
          <Input label="Username" />
          <Input label="Email" type="email" required />
          <Input label="Password" type="password" error="Password is required" />
        </div>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Card should have no accessibility violations', async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
        </Card>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Feedback Components', () => {
    it('Loading should have no accessibility violations', async () => {
      const { container } = render(<Loading />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Error should have no accessibility violations', async () => {
      const { container } = render(
        <Error message="Something went wrong" retry={() => {}} />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Layout Components', () => {
    it('Navigation should have no accessibility violations', async () => {
      const { container } = render(<Navigation />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Complex Forms', () => {
    it('Form with multiple inputs should have no violations', async () => {
      const { container } = render(
        <form aria-label="Registration form">
          <Input label="Username" required />
          <Input label="Email" type="email" required />
          <Input label="Password" type="password" required />
          <Input label="Confirm Password" type="password" required />
          <Button type="submit">Register</Button>
        </form>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Form with errors should have no violations', async () => {
      const { container } = render(
        <form aria-label="Login form">
          <Input 
            label="Email" 
            type="email" 
            required 
            error="Please enter a valid email"
          />
          <Input 
            label="Password" 
            type="password" 
            required 
            error="Password is required"
          />
          <Button type="submit">Login</Button>
        </form>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Color Contrast', () => {
    it('should pass color contrast requirements', async () => {
      const { container } = render(
        <div>
          <Button variant="default">Primary Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <p className="text-gray-600">This is body text</p>
          <p className="text-gray-500">This is secondary text</p>
        </div>
      );
      
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
      
      expect(results).toHaveNoViolations();
    });
  });

  describe('Landmark Regions', () => {
    it('should have proper landmark structure', async () => {
      const { container } = render(
        <div>
          <Navigation />
          <main id="main-content">
            <h1>Main Content</h1>
            <p>Content goes here</p>
          </main>
        </div>
      );
      
      const results = await axe(container, {
        rules: {
          'region': { enabled: true },
        },
      });
      
      expect(results).toHaveNoViolations();
    });
  });
});

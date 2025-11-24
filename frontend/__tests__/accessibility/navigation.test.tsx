import { render, screen } from '@testing-library/react';
import Navigation from '@/components/layout/navigation';

describe('Navigation Accessibility', () => {
  it('should have navigation role with label', () => {
    render(<Navigation />);
    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    expect(nav).toBeInTheDocument();
  });

  it('should have skip to main content link', () => {
    render(<Navigation />);
    const skipLink = screen.getByText(/skip to main content/i);
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveClass('sr-only');
  });

  it('should show skip link on focus', () => {
    render(<Navigation />);
    const skipLink = screen.getByText(/skip to main content/i);
    
    skipLink.focus();
    expect(skipLink).toHaveClass('focus:not-sr-only');
  });

  it('should have accessible links', () => {
    render(<Navigation />);
    
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    const projectsLink = screen.getByRole('link', { name: /projects/i });
    
    expect(dashboardLink).toBeInTheDocument();
    expect(projectsLink).toBeInTheDocument();
  });

  it('should have focus styles on all interactive elements', () => {
    render(<Navigation />);
    
    const links = screen.getAllByRole('link');
    const buttons = screen.getAllByRole('button');
    
    // Filter out skip link which has different focus styles
    const regularLinks = links.filter(link => !link.textContent?.includes('Skip to main content'));
    
    [...regularLinks, ...buttons].forEach((element) => {
      expect(element).toHaveClass('focus:ring-2');
    });
  });

  it('should have accessible button labels', () => {
    render(<Navigation />);
    
    const notificationsButton = screen.getByRole('button', { name: /view notifications/i });
    const profileButton = screen.getByRole('button', { name: /view profile/i });
    
    expect(notificationsButton).toBeInTheDocument();
    expect(profileButton).toBeInTheDocument();
  });

  it('should be keyboard navigable', () => {
    render(<Navigation />);
    
    const links = screen.getAllByRole('link');
    const buttons = screen.getAllByRole('button');
    const allInteractive = [...links, ...buttons];
    
    allInteractive.forEach((element) => {
      expect(element).not.toHaveAttribute('tabindex', '-1');
    });
  });
});

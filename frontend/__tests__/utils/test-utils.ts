import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options });
}

/**
 * Test keyboard navigation by simulating keyboard events
 */
export function testKeyboardNavigation(element: HTMLElement, key: string) {
  element.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      code: key,
      bubbles: true,
      cancelable: true,
    })
  );
}

/**
 * Check if an element is keyboard focusable
 */
export function isKeyboardFocusable(element: HTMLElement): boolean {
  const tabIndex = element.getAttribute('tabindex');
  const isInteractive = ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'].includes(
    element.tagName
  );
  
  return (
    isInteractive ||
    (tabIndex !== null && parseInt(tabIndex, 10) >= 0)
  );
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');
  
  return Array.from(container.querySelectorAll(selector));
}

/**
 * Check if element has proper ARIA attributes
 */
export function hasAccessibleName(element: HTMLElement): boolean {
  return !!(
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.textContent?.trim()
  );
}

/**
 * Wait for an element to be announced by screen reader
 */
export function waitForAnnouncement(element: HTMLElement): boolean {
  const ariaLive = element.getAttribute('aria-live');
  const role = element.getAttribute('role');
  
  return (
    ariaLive === 'polite' ||
    ariaLive === 'assertive' ||
    role === 'alert' ||
    role === 'status'
  );
}

export * from '@testing-library/react';

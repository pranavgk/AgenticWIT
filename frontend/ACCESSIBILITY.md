# Accessibility Guidelines

## Overview

AgenticWIT is built with accessibility as a first-class concern, following WCAG 2.1 AA standards. This document outlines the accessibility features and best practices implemented throughout the application.

## Key Accessibility Features

### 1. Keyboard Navigation ⌨️

All interactive elements are fully keyboard accessible:

- **Tab Navigation**: Use `Tab` to move forward through focusable elements
- **Shift+Tab**: Move backward through focusable elements
- **Enter/Space**: Activate buttons and links
- **Arrow Keys**: Navigate within components (dropdowns, tabs, etc.)
- **Escape**: Close modals and dialogs

#### Skip Links
Skip to main content links are provided at the top of each page for keyboard users to bypass repetitive navigation.

### 2. Screen Reader Support 🔊

All components include proper ARIA attributes and semantic HTML:

- **ARIA Labels**: Descriptive labels for interactive elements
- **ARIA Live Regions**: Dynamic content updates announced to screen readers
- **ARIA Roles**: Explicit roles for custom components
- **Semantic HTML**: Proper use of `<header>`, `<nav>`, `<main>`, `<aside>`, etc.

### 3. Focus Management 🎯

Visible focus indicators with high contrast:

- **Focus Rings**: 2px solid ring with offset around focused elements
- **Color**: Primary blue (#0ea5e9) with sufficient contrast
- **Skip Links**: Visible on keyboard focus
- **Modal Focus Trapping**: Focus stays within modals when open

### 4. Theme System 🎨

Multiple theme options for different needs:

- **Light Mode**: Default theme with light background
- **Dark Mode**: Reduced eye strain in low-light environments
- **High Contrast Mode**: Enhanced contrast for visual impairments
- **System Preference**: Automatically matches OS theme settings

To toggle themes, use the theme switcher in the header or press `Ctrl+Shift+T`.

### 5. Color and Contrast

All text meets WCAG 2.1 AA contrast requirements:

- **Regular Text**: Minimum 4.5:1 contrast ratio
- **Large Text**: Minimum 3:1 contrast ratio
- **Interactive Elements**: Clear hover and focus states
- **Error States**: Red (#ef4444) with sufficient contrast

### 6. Form Accessibility ✍️

All form inputs include:

- **Associated Labels**: Programmatically linked to inputs
- **Required Indicators**: Visual (*) and screen reader announcements
- **Error Messages**: ARIA-described and announced as alerts
- **Validation Feedback**: Real-time, accessible feedback
- **Helpful Hints**: Additional context via aria-describedby

### 7. Loading and Error States

Dynamic content changes are accessible:

- **Loading Indicators**: ARIA live regions with polite announcements
- **Error Messages**: ARIA alerts with assertive announcements
- **Progress Updates**: Status announcements for long operations
- **Retry Actions**: Keyboard accessible with clear labels

## Testing for Accessibility

### Automated Testing

We use multiple tools for automated accessibility testing:

1. **jest-axe**: WCAG compliance checks in unit tests
2. **eslint-plugin-jsx-a11y**: Linting for accessibility issues
3. **@axe-core/react**: Runtime accessibility checks in development

Run tests with:
```bash
npm test                    # Run all tests including accessibility
npm run test:a11y           # Run only accessibility tests
```

### Manual Testing

#### Keyboard Testing Checklist
- [ ] Tab through all interactive elements
- [ ] Verify focus indicators are visible
- [ ] Test form submission with Enter key
- [ ] Navigate modals and dialogs
- [ ] Test skip links work correctly

#### Screen Reader Testing
- [ ] Test with NVDA (Windows) or VoiceOver (Mac)
- [ ] Verify all content is announced
- [ ] Check form labels and errors
- [ ] Test dynamic content updates
- [ ] Verify button and link purposes are clear

#### Visual Testing
- [ ] Test all themes (light/dark/high-contrast)
- [ ] Verify color contrast ratios
- [ ] Check text is readable at 200% zoom
- [ ] Test with browser high contrast mode
- [ ] Verify focus indicators are visible

## Component-Specific Guidelines

### Button

```tsx
// ✅ Good: Accessible button with clear label
<Button onClick={handleSave} aria-label="Save changes">
  Save
</Button>

// ❌ Bad: Button without accessible name
<Button onClick={handleSave}>
  <SaveIcon />
</Button>
```

### Input

```tsx
// ✅ Good: Input with label and error handling
<Input
  label="Email"
  type="email"
  required
  error={errors.email}
  aria-describedby="email-hint"
/>

// ❌ Bad: Input without label
<Input type="email" placeholder="Email" />
```

### Navigation

```tsx
// ✅ Good: Navigation with proper landmarks
<nav aria-label="Main navigation">
  <a href="/dashboard">Dashboard</a>
  <a href="/projects">Projects</a>
</nav>

// ❌ Bad: Navigation without semantic HTML
<div className="nav">
  <a href="/dashboard">Dashboard</a>
</div>
```

## Resources

### WCAG Guidelines
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

### Testing Tools
- [axe DevTools Browser Extension](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse Accessibility Audit](https://developers.google.com/web/tools/lighthouse)

### Screen Readers
- [NVDA (Windows)](https://www.nvaccess.org/)
- [JAWS (Windows)](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver (Mac/iOS)](https://www.apple.com/accessibility/voiceover/)

## Reporting Accessibility Issues

If you discover an accessibility issue:

1. Check if it's a known issue in GitHub Issues
2. Create a new issue with the "accessibility" label
3. Include:
   - Description of the issue
   - Steps to reproduce
   - Expected vs actual behavior
   - WCAG criterion violated (if known)
   - Screenshots or recordings

## Accessibility Statement

We are committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply the relevant accessibility standards.

### Conformance Status
**Partially Conformant**: Some parts of the content do not fully conform to WCAG 2.1 Level AA.

### Feedback
We welcome your feedback on the accessibility of AgenticWIT. Please contact us if you encounter accessibility barriers:
- Email: accessibility@agentic-wit.com
- GitHub Issues: [github.com/pranavgk/AgenticWIT/issues](https://github.com/pranavgk/AgenticWIT/issues)

### Assessment Approach
We assess accessibility through:
- Self-evaluation using automated tools
- Manual testing with assistive technologies
- User testing with people with disabilities
- Third-party accessibility audits (planned)

Last updated: 2024-11-24

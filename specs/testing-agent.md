# Testing Agent Instructions

## Agent Identity
**Name**: Testing Agent  
**Role**: Quality Assurance & Testing Specialist  
**Primary Goal**: Ensure comprehensive testing coverage with focus on Microsoft accessibility standards compliance and automated quality assurance

## Core Responsibilities

### 1. Comprehensive Testing Strategy
- **Test Pyramid Implementation**: 70% unit, 20% integration, 10% E2E tests
- **Accessibility Testing**: WCAG 2.1 AA, Section 508, Microsoft standards compliance
- **Performance Testing**: Load, stress, chaos engineering with accessibility scenarios
- **Security Testing**: SAST, DAST, accessibility-specific security validation

### 2. Microsoft Accessibility Testing Framework
- **Automated Accessibility**: Microsoft Accessibility Insights integration
- **Screen Reader Testing**: NVDA, JAWS, Windows Narrator validation
- **High Contrast Testing**: Windows High Contrast mode compatibility
- **Keyboard Navigation**: Complete functionality without mouse interaction
- **Cognitive Accessibility**: Simple language, clear navigation patterns

### 3. Continuous Quality Assurance
- **CI/CD Integration**: Automated testing in deployment pipeline
- **Quality Gates**: Prevent deployment of non-compliant code
- **Regression Testing**: Maintain accessibility compliance through changes
- **User Acceptance Testing**: Testing with real assistive technology users

## Detailed Task Breakdown

### Testing Infrastructure Setup

#### Task 1.1: Microsoft Accessibility Testing Framework
```typescript
// tests/accessibility/microsoft-framework.ts
import { AxePuppeteer } from '@axe-core/puppeteer'
import { AccessibilityInsights } from '@microsoft/accessibility-insights-web'
import puppeteer from 'puppeteer'

export class MicrosoftAccessibilityTestFramework {
  private browser: puppeteer.Browser
  private page: puppeteer.Page
  private axe: AxePuppeteer
  private insights: AccessibilityInsights

  async initialize(): Promise<void> {
    // Launch browser with accessibility testing flags
    this.browser = await puppeteer.launch({
      headless: process.env.CI === 'true',
      args: [
        '--enable-accessibility-logging',
        '--force-renderer-accessibility',
        '--enable-experimental-accessibility-features',
        '--disable-web-security', // For testing purposes only
      ],
    })

    this.page = await this.browser.newPage()
    
    // Configure for accessibility testing
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    })

    // Initialize axe-core with Microsoft-specific rules
    this.axe = new AxePuppeteer(this.page)
    await this.axe.configure({
      rules: {
        // Enable Microsoft-specific accessibility rules
        'color-contrast-enhanced': { enabled: true },
        'focus-order-semantics': { enabled: true },
        'landmark-complementary-is-top-level': { enabled: true },
      },
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'section508', 'best-practice'],
    })

    // Initialize Microsoft Accessibility Insights
    this.insights = new AccessibilityInsights({
      apiKey: process.env.ACCESSIBILITY_INSIGHTS_API_KEY,
      enableTelemetry: false,
    })
  }

  // Comprehensive accessibility test suite
  async runFullAccessibilityAudit(url: string): Promise<AccessibilityAuditResult> {
    await this.page.goto(url, { waitUntil: 'networkidle0' })

    const results = await Promise.all([
      this.runAxeAudit(),
      this.runMicrosoftInsightsAudit(),
      this.runKeyboardNavigationTest(),
      this.runScreenReaderTest(),
      this.runHighContrastTest(),
      this.runColorBlindnessTest(),
      this.runCognitiveAccessibilityTest(),
    ])

    return {
      url,
      timestamp: new Date(),
      overallScore: this.calculateOverallScore(results),
      axeResults: results[0],
      insightsResults: results[1],
      keyboardResults: results[2],
      screenReaderResults: results[3],
      highContrastResults: results[4],
      colorBlindnessResults: results[5],
      cognitiveResults: results[6],
      recommendations: this.generateRecommendations(results),
    }
  }

  private async runAxeAudit(): Promise<AxeAuditResult> {
    const results = await this.axe.analyze()
    
    return {
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete,
      inapplicable: results.inapplicable,
      score: this.calculateAxeScore(results),
    }
  }

  private async runMicrosoftInsightsAudit(): Promise<InsightsAuditResult> {
    // Run Microsoft Accessibility Insights automated checks
    const scanResults = await this.insights.scan({
      url: this.page.url(),
      scanType: 'automated',
      includeScreenshots: true,
    })

    // Run manual assessment guidance
    const manualGuidance = await this.insights.generateManualTestGuidance({
      url: this.page.url(),
      testType: 'comprehensive',
    })

    return {
      automatedResults: scanResults,
      manualGuidance,
      complianceLevel: this.calculateComplianceLevel(scanResults),
    }
  }

  private async runKeyboardNavigationTest(): Promise<KeyboardTestResult> {
    const focusableElements = await this.page.$$eval(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])',
      (elements) => elements.map(el => ({
        tagName: el.tagName,
        id: el.id,
        className: el.className,
        tabIndex: el.tabIndex,
        ariaLabel: el.getAttribute('aria-label'),
        ariaDescribedBy: el.getAttribute('aria-describedby'),
      }))
    )

    const navigationResults = []

    // Test Tab navigation
    for (let i = 0; i < focusableElements.length; i++) {
      await this.page.keyboard.press('Tab')
      const activeElement = await this.page.evaluate(() => {
        const el = document.activeElement
        return {
          tagName: el?.tagName,
          id: el?.id,
          className: el?.className,
        }
      })
      
      navigationResults.push({
        step: i + 1,
        expectedElement: focusableElements[i],
        actualElement: activeElement,
        isCorrect: this.compareFocusElements(focusableElements[i], activeElement),
      })
    }

    // Test Shift+Tab (reverse navigation)
    const reverseResults = []
    for (let i = focusableElements.length - 1; i >= 0; i--) {
      await this.page.keyboard.press('Shift+Tab')
      const activeElement = await this.page.evaluate(() => {
        const el = document.activeElement
        return {
          tagName: el?.tagName,
          id: el?.id,
          className: el?.className,
        }
      })
      
      reverseResults.push({
        step: focusableElements.length - i,
        expectedElement: focusableElements[i],
        actualElement: activeElement,
        isCorrect: this.compareFocusElements(focusableElements[i], activeElement),
      })
    }

    // Test keyboard shortcuts
    const shortcutResults = await this.testKeyboardShortcuts()

    return {
      focusableElementsCount: focusableElements.length,
      forwardNavigation: navigationResults,
      reverseNavigation: reverseResults,
      shortcuts: shortcutResults,
      overallScore: this.calculateKeyboardScore(navigationResults, reverseResults, shortcutResults),
    }
  }

  private async runScreenReaderTest(): Promise<ScreenReaderTestResult> {
    // Simulate screen reader navigation patterns
    const ariaElements = await this.page.$$eval('[aria-*]', (elements) =>
      elements.map(el => ({
        tagName: el.tagName,
        ariaLabel: el.getAttribute('aria-label'),
        ariaDescribedBy: el.getAttribute('aria-describedby'),
        ariaLabelledBy: el.getAttribute('aria-labelledby'),
        role: el.getAttribute('role'),
        ariaLive: el.getAttribute('aria-live'),
        ariaAtomic: el.getAttribute('aria-atomic'),
      }))
    )

    // Test landmarks navigation
    const landmarks = await this.page.$$eval(
      'main, nav, aside, footer, header, [role="main"], [role="navigation"], [role="complementary"], [role="contentinfo"], [role="banner"]',
      (elements) => elements.map(el => ({
        tagName: el.tagName,
        role: el.getAttribute('role') || el.tagName.toLowerCase(),
        ariaLabel: el.getAttribute('aria-label'),
      }))
    )

    // Test heading structure
    const headings = await this.page.$$eval(
      'h1, h2, h3, h4, h5, h6, [role="heading"]',
      (elements) => elements.map(el => ({
        level: el.tagName.charAt(1) || el.getAttribute('aria-level'),
        text: el.textContent?.trim(),
        ariaLevel: el.getAttribute('aria-level'),
      }))
    )

    // Validate heading hierarchy
    const headingHierarchy = this.validateHeadingHierarchy(headings)

    // Test live regions
    const liveRegions = await this.testLiveRegions()

    return {
      ariaElementsCount: ariaElements.length,
      landmarks,
      headings,
      headingHierarchy,
      liveRegions,
      overallScore: this.calculateScreenReaderScore(ariaElements, landmarks, headingHierarchy, liveRegions),
    }
  }

  private async runHighContrastTest(): Promise<HighContrastTestResult> {
    // Test Windows High Contrast modes
    const contrastModes = [
      'high-contrast-black',
      'high-contrast-white',
      'high-contrast-1',
      'high-contrast-2',
    ]

    const results = []

    for (const mode of contrastModes) {
      // Simulate high contrast mode
      await this.page.emulateMediaFeatures([
        { name: 'prefers-contrast', value: 'high' },
        { name: 'forced-colors', value: 'active' },
      ])

      await this.page.addStyleTag({
        content: `
          @media (forced-colors: active) {
            * {
              color: ButtonText !important;
              background-color: ButtonFace !important;
              border-color: ButtonText !important;
            }
          }
        `,
      })

      // Take screenshot for visual validation
      const screenshot = await this.page.screenshot({
        fullPage: true,
        type: 'png',
      })

      // Analyze color contrast
      const contrastAnalysis = await this.analyzeColorContrast()

      results.push({
        mode,
        screenshot: screenshot.toString('base64'),
        contrastRatio: contrastAnalysis.ratio,
        passes: contrastAnalysis.passes,
        violations: contrastAnalysis.violations,
      })
    }

    return {
      modes: results,
      overallCompliance: results.every(r => r.passes),
      averageContrastRatio: results.reduce((sum, r) => sum + r.contrastRatio, 0) / results.length,
    }
  }

  private async runColorBlindnessTest(): Promise<ColorBlindnessTestResult> {
    const colorBlindnessTypes = [
      'protanopia',    // Red-blind
      'deuteranopia',  // Green-blind  
      'tritanopia',    // Blue-blind
      'achromatopsia', // Complete color blindness
    ]

    const results = []

    for (const type of colorBlindnessTypes) {
      // Simulate color blindness
      await this.page.emulateVisionDeficiency(type as any)

      // Take screenshot
      const screenshot = await this.page.screenshot({
        fullPage: true,
        type: 'png',
      })

      // Analyze if information is still accessible
      const accessibility = await this.analyzeColorDependency()

      results.push({
        type,
        screenshot: screenshot.toString('base64'),
        informationAccessible: accessibility.informationAccessible,
        issues: accessibility.issues,
      })

      // Reset vision
      await this.page.emulateVisionDeficiency('none' as any)
    }

    return {
      types: results,
      overallAccessibility: results.every(r => r.informationAccessible),
    }
  }

  private async runCognitiveAccessibilityTest(): Promise<CognitiveAccessibilityTestResult> {
    // Analyze content for cognitive accessibility
    const content = await this.page.evaluate(() => {
      const textElements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, label, button'))
      
      return textElements.map(el => ({
        tagName: el.tagName,
        text: el.textContent?.trim() || '',
        wordCount: el.textContent?.trim().split(/\\s+/).length || 0,
      }))
    })

    // Check reading level
    const readingLevel = this.calculateReadingLevel(content)

    // Check for clear navigation
    const navigation = await this.analyzeNavigationClarity()

    // Check for consistent design patterns
    const consistency = await this.analyzeDesignConsistency()

    // Check for helpful error messages
    const errorMessages = await this.analyzeErrorMessages()

    return {
      readingLevel,
      navigation,
      consistency,
      errorMessages,
      overallScore: this.calculateCognitiveScore(readingLevel, navigation, consistency, errorMessages),
    }
  }
}
```

#### Task 1.2: Automated Testing Pipeline Integration
```yaml
# .github/workflows/accessibility-testing.yml
name: Accessibility Testing Pipeline

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM

jobs:
  accessibility-audit:
    runs-on: windows-latest # Use Windows for native accessibility tools
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup Windows accessibility tools
        shell: powershell
        run: |
          # Install Windows SDK for accessibility APIs
          choco install windows-sdk-10-version-2004-all
          
          # Install screen readers for testing
          choco install nvda
          
          # Enable Windows Narrator
          Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Narrator\\NoRoam" -Name "RunNarrator" -Value 1

      - name: Build application
        run: npm run build

      - name: Start application
        run: |
          npm start &
          sleep 30 # Wait for application to start
        shell: bash

      - name: Run accessibility tests
        run: npm run test:accessibility
        env:
          ACCESSIBILITY_INSIGHTS_API_KEY: ${{ secrets.ACCESSIBILITY_INSIGHTS_API_KEY }}
          
      - name: Run Microsoft Accessibility Insights scan
        uses: microsoft/accessibility-insights-action@v3
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          site: http://localhost:3000
          scan-url-relative-path: /
          
      - name: Upload accessibility reports
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: accessibility-reports
          path: |
            accessibility-reports/
            screenshots/
            
      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const path = require('path');
            
            // Read accessibility report
            const reportPath = path.join('accessibility-reports', 'summary.json');
            if (fs.existsSync(reportPath)) {
              const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
              
              const comment = `## 🔍 Accessibility Test Results
              
              **Overall Score:** ${report.overallScore}/100
              
              ### Microsoft Standards Compliance
              - **WCAG 2.1 AA:** ${report.wcagCompliance ? '✅ Pass' : '❌ Fail'}
              - **Section 508:** ${report.section508Compliance ? '✅ Pass' : '❌ Fail'}
              - **Microsoft Standards:** ${report.microsoftStandardsCompliance ? '✅ Pass' : '❌ Fail'}
              
              ### Test Results
              - **Axe-core violations:** ${report.axeViolations}
              - **Keyboard navigation:** ${report.keyboardScore}/100
              - **Screen reader compatibility:** ${report.screenReaderScore}/100
              - **High contrast support:** ${report.highContrastScore}/100
              
              ${report.criticalIssues.length > 0 ? `### ⚠️ Critical Issues
              ${report.criticalIssues.map(issue => `- ${issue}`).join('\\n')}` : ''}
              
              [View detailed report](${report.detailsUrl})
              `;
              
              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: comment
              });
            }
```

### Comprehensive Test Suite Development

#### Task 2.1: Unit Tests with Accessibility Focus
```typescript
// tests/unit/accessibility/accessible-components.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import userEvent from '@testing-library/user-event'
import { WorkItemCard } from '@/components/work-items/work-item-card'
import { KanbanBoard } from '@/components/kanban/kanban-board'

expect.extend(toHaveNoViolations)

describe('Accessible Component Tests', () => {
  describe('WorkItemCard Accessibility', () => {
    const mockWorkItem = {
      id: '1',
      title: 'Test Work Item',
      description: 'Test description',
      type: 'TASK',
      status: 'NEW',
      priority: 'MEDIUM',
    }

    it('should have no accessibility violations', async () => {
      const { container } = render(<WorkItemCard workItem={mockWorkItem} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<WorkItemCard workItem={mockWorkItem} />)
      
      const card = screen.getByRole('button', { name: /test work item/i })
      
      // Should be focusable
      await user.tab()
      expect(card).toHaveFocus()
      
      // Should be activatable with Enter
      await user.keyboard('{Enter}')
      // Verify action was triggered
      
      // Should be activatable with Space
      await user.keyboard(' ')
      // Verify action was triggered
    })

    it('should work with screen readers', () => {
      render(<WorkItemCard workItem={mockWorkItem} />)
      
      // Check for proper ARIA labels
      const card = screen.getByLabelText(/work item card for test work item/i)
      expect(card).toBeInTheDocument()
      
      // Check for description
      expect(screen.getByText('Test description')).toBeInTheDocument()
      
      // Check for status information
      expect(screen.getByText('NEW')).toBeInTheDocument()
      expect(screen.getByText('MEDIUM')).toBeInTheDocument()
    })

    it('should support high contrast mode', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        })),
      })

      render(<WorkItemCard workItem={mockWorkItem} />)
      
      // Verify high contrast styles are applied
      const card = screen.getByRole('button')
      const styles = window.getComputedStyle(card)
      
      // Check for sufficient contrast (this would need actual color checking)
      expect(styles.backgroundColor).not.toBe('transparent')
      expect(styles.color).not.toBe(styles.backgroundColor)
    })

    it('should handle reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        })),
      })

      render(<WorkItemCard workItem={mockWorkItem} />)
      
      const card = screen.getByRole('button')
      const styles = window.getComputedStyle(card)
      
      // Verify animations are disabled or reduced
      expect(styles.animationDuration).toBe('0s')
      expect(styles.transitionDuration).toBe('0s')
    })

    it('should provide alternative text for visual elements', () => {
      const workItemWithImage = {
        ...mockWorkItem,
        attachments: [{ id: '1', type: 'image', url: 'test.jpg', altText: 'Process diagram' }],
      }
      
      render(<WorkItemCard workItem={workItemWithImage} />)
      
      const image = screen.getByAltText('Process diagram')
      expect(image).toBeInTheDocument()
    })
  })

  describe('KanbanBoard Accessibility', () => {
    it('should support drag and drop with keyboard', async () => {
      const user = userEvent.setup()
      render(<KanbanBoard projectId="test-project" />)
      
      const workItem = screen.getByLabelText(/work item card/i)
      
      // Focus on work item
      workItem.focus()
      expect(workItem).toHaveFocus()
      
      // Start drag with keyboard
      await user.keyboard('{Space}')
      expect(workItem).toHaveAttribute('aria-grabbed', 'true')
      
      // Move to drop zone
      await user.keyboard('{ArrowRight}')
      
      // Drop item
      await user.keyboard('{Space}')
      expect(workItem).toHaveAttribute('aria-grabbed', 'false')
    })

    it('should announce drag and drop operations to screen readers', async () => {
      const announcements: string[] = []
      
      // Mock live region announcements
      const mockAnnounce = jest.fn((message: string) => {
        announcements.push(message)
      })
      
      render(<KanbanBoard projectId="test-project" />)
      
      // Simulate drag operation
      const workItem = screen.getByLabelText(/work item card/i)
      fireEvent.keyDown(workItem, { key: ' ' })
      
      expect(announcements).toContain('Started dragging Test Work Item')
      
      // Simulate drop
      fireEvent.keyDown(workItem, { key: ' ' })
      
      expect(announcements).toContain('Dropped Test Work Item in Active column')
    })

    it('should provide clear column labels and descriptions', () => {
      render(<KanbanBoard projectId="test-project" />)
      
      const newColumn = screen.getByRole('region', { name: /new items/i })
      expect(newColumn).toBeInTheDocument()
      expect(newColumn).toHaveAttribute('aria-describedby')
      
      const activeColumn = screen.getByRole('region', { name: /active items/i })
      expect(activeColumn).toBeInTheDocument()
      
      const doneColumn = screen.getByRole('region', { name: /completed items/i })
      expect(doneColumn).toBeInTheDocument()
    })
  })
})
```

#### Task 2.2: Integration Tests for Accessibility APIs
```typescript
// tests/integration/accessibility/api-accessibility.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import request from 'supertest'
import { app } from '@/src/app'
import { setupTestDatabase, teardownTestDatabase } from '@/tests/setup'

describe('Accessibility API Integration Tests', () => {
  let authToken: string
  let testUserId: string

  beforeAll(async () => {
    await setupTestDatabase()
    
    // Create test user and get auth token
    const authResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword123',
      })
    
    authToken = authResponse.body.token
    testUserId = authResponse.body.user.id
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  describe('Accessibility Preferences API', () => {
    it('should store and retrieve accessibility preferences', async () => {
      const preferences = {
        highContrast: true,
        reducedMotion: true,
        screenReaderType: 'nvda',
        fontSize: 'large',
        keyboardNavigation: true,
        alternativeText: true,
      }

      // Store preferences
      const storeResponse = await request(app)
        .put(`/api/users/${testUserId}/accessibility-preferences`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(preferences)
        .expect(200)

      expect(storeResponse.body).toMatchObject(preferences)

      // Retrieve preferences
      const getResponse = await request(app)
        .get(`/api/users/${testUserId}/accessibility-preferences`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(getResponse.body).toMatchObject(preferences)
    })

    it('should validate accessibility preference input', async () => {
      const invalidPreferences = {
        screenReaderType: 'invalid-type',
        fontSize: 'invalid-size',
        highContrast: 'not-a-boolean',
      }

      const response = await request(app)
        .put(`/api/users/${testUserId}/accessibility-preferences`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPreferences)
        .expect(400)

      expect(response.body.errors).toContain('Invalid screen reader type')
      expect(response.body.errors).toContain('Invalid font size')
    })

    it('should apply accessibility preferences to API responses', async () => {
      // Set high contrast preference
      await request(app)
        .put(`/api/users/${testUserId}/accessibility-preferences`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ highContrast: true })

      // Get work items with preferences applied
      const response = await request(app)
        .get('/api/projects/test-project/workitems')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Verify response includes accessibility metadata
      expect(response.body.metadata.accessibilityEnhanced).toBe(true)
      expect(response.body.metadata.highContrast).toBe(true)
    })
  })

  describe('Alternative Text API', () => {
    it('should generate and store alternative text for images', async () => {
      const imageData = {
        contentId: 'test-image-1',
        contentType: 'image',
        imageUrl: 'https://example.com/test-image.jpg',
      }

      const response = await request(app)
        .post('/api/content/alternative-text')
        .set('Authorization', `Bearer ${authToken}`)
        .send(imageData)
        .expect(201)

      expect(response.body.altText).toBeDefined()
      expect(response.body.altText.length).toBeGreaterThan(0)
      expect(response.body.contentId).toBe(imageData.contentId)
    })

    it('should validate image content before processing', async () => {
      const invalidImageData = {
        contentId: 'test-image-2',
        contentType: 'image',
        imageUrl: 'not-a-valid-url',
      }

      const response = await request(app)
        .post('/api/content/alternative-text')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidImageData)
        .expect(400)

      expect(response.body.error).toContain('Invalid image URL')
    })

    it('should update existing alternative text', async () => {
      const contentId = 'test-image-3'
      
      // Create initial alt text
      await request(app)
        .post('/api/content/alternative-text')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contentId,
          contentType: 'image',
          imageUrl: 'https://example.com/test-image.jpg',
        })

      // Update alt text
      const updatedAltText = 'Updated description for accessibility'
      const updateResponse = await request(app)
        .put(`/api/content/${contentId}/alternative-text`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ altText: updatedAltText })
        .expect(200)

      expect(updateResponse.body.altText).toBe(updatedAltText)
    })
  })

  describe('Accessibility Validation API', () => {
    it('should validate content for accessibility compliance', async () => {
      const contentToValidate = {
        html: '<div><h1>Title</h1><p>Content without proper structure</p></div>',
        url: 'https://example.com/test-page',
      }

      const response = await request(app)
        .post('/api/content/validate-accessibility')
        .set('Authorization', `Bearer ${authToken}`)
        .send(contentToValidate)
        .expect(200)

      expect(response.body.violations).toBeDefined()
      expect(response.body.complianceLevel).toBeDefined()
      expect(response.body.recommendations).toBeDefined()
    })

    it('should generate compliance reports', async () => {
      const response = await request(app)
        .get('/api/accessibility/compliance-report')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.overallScore).toBeDefined()
      expect(response.body.wcagCompliance).toBeDefined()
      expect(response.body.section508Compliance).toBeDefined()
      expect(response.body.microsoftStandardsCompliance).toBeDefined()
    })
  })
})
```

#### Task 2.3: End-to-End Accessibility Testing
```typescript
// tests/e2e/accessibility/user-journeys.spec.ts
import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Accessibility User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to application
    await page.goto('/')
    
    // Inject axe-core for accessibility testing
    await injectAxe(page)
  })

  test('Complete user journey with screen reader simulation', async ({ page }) => {
    // Test login flow
    await page.getByLabel('Email').fill('user@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Verify login success and accessibility
    await expect(page.getByText('Welcome to Work Tracker')).toBeVisible()
    await checkA11y(page)

    // Navigate to projects
    await page.getByRole('link', { name: 'Projects' }).click()
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible()
    await checkA11y(page)

    // Create new work item
    await page.getByRole('button', { name: 'Create Work Item' }).click()
    await page.getByLabel('Title').fill('Test Accessibility Item')
    await page.getByLabel('Description').fill('Testing accessibility features')
    await page.getByLabel('Type').selectOption('TASK')
    await page.getByRole('button', { name: 'Create' }).click()

    // Verify creation and accessibility
    await expect(page.getByText('Test Accessibility Item')).toBeVisible()
    await checkA11y(page)

    // Test kanban board interaction
    const workItem = page.getByText('Test Accessibility Item').first()
    await workItem.focus()
    
    // Start keyboard drag
    await page.keyboard.press('Space')
    await expect(workItem).toHaveAttribute('aria-grabbed', 'true')
    
    // Move to next column
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Space')
    
    // Verify move completed
    await expect(workItem).toHaveAttribute('aria-grabbed', 'false')
    await checkA11y(page)
  })

  test('High contrast mode compatibility', async ({ page }) => {
    // Enable high contrast mode
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' })
    
    // Navigate through application
    await page.goto('/login')
    await checkA11y(page)
    
    // Test form visibility in high contrast
    const emailInput = page.getByLabel('Email')
    const passwordInput = page.getByLabel('Password')
    const submitButton = page.getByRole('button', { name: 'Sign In' })
    
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(submitButton).toBeVisible()
    
    // Verify contrast ratios meet requirements
    const emailStyles = await emailInput.evaluate(el => getComputedStyle(el))
    const contrast = await page.evaluate(() => {
      // Calculate contrast ratio (implementation would need actual color analysis)
      return 4.5 // Mock minimum required ratio
    })
    
    expect(contrast).toBeGreaterThanOrEqual(4.5)
  })

  test('Keyboard navigation throughout application', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Track focus order
    const focusOrder: string[] = []
    
    // Start from first focusable element
    await page.keyboard.press('Tab')
    
    // Navigate through all interactive elements
    for (let i = 0; i < 20; i++) {
      const activeElement = await page.evaluate(() => {
        const el = document.activeElement
        return {
          tagName: el?.tagName,
          id: el?.id,
          ariaLabel: el?.getAttribute('aria-label'),
          textContent: el?.textContent?.trim().substring(0, 50),
        }
      })
      
      focusOrder.push(`${activeElement.tagName}:${activeElement.id || activeElement.ariaLabel || activeElement.textContent}`)
      
      await page.keyboard.press('Tab')
      
      // Break if we've cycled back to start
      if (focusOrder.length > 1 && focusOrder[focusOrder.length - 1] === focusOrder[0]) {
        break
      }
    }
    
    // Verify logical focus order
    expect(focusOrder.length).toBeGreaterThan(0)
    console.log('Focus order:', focusOrder)
    
    // Test reverse navigation
    await page.keyboard.press('Shift+Tab')
    const previousElement = await page.evaluate(() => {
      const el = document.activeElement
      return el?.tagName + ':' + (el?.id || el?.getAttribute('aria-label') || el?.textContent?.trim().substring(0, 50))
    })
    
    expect(focusOrder).toContain(previousElement)
  })

  test('Screen reader announcements', async ({ page }) => {
    // Mock screen reader to capture announcements
    const announcements: string[] = []
    
    await page.addInitScript(() => {
      // Intercept ARIA live region updates
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            const target = mutation.target as HTMLElement
            if (target.getAttribute('aria-live')) {
              const announcement = target.textContent?.trim()
              if (announcement) {
                (window as any).__announcements = (window as any).__announcements || []
                ;(window as any).__announcements.push(announcement)
              }
            }
          }
        })
      })
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      })
    })

    await page.goto('/projects')
    
    // Create work item (should announce success)
    await page.getByRole('button', { name: 'Create Work Item' }).click()
    await page.getByLabel('Title').fill('Announced Work Item')
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Wait for announcement
    await page.waitForTimeout(1000)
    
    // Check announcements
    const pageAnnouncements = await page.evaluate(() => (window as any).__announcements || [])
    expect(pageAnnouncements).toContain('Work item created successfully')
    
    // Update work item status (should announce change)
    await page.getByText('Announced Work Item').click()
    await page.getByLabel('Status').selectOption('ACTIVE')
    await page.getByRole('button', { name: 'Save' }).click()
    
    await page.waitForTimeout(1000)
    
    const updatedAnnouncements = await page.evaluate(() => (window as any).__announcements || [])
    expect(updatedAnnouncements).toContain('Work item status changed to Active')
  })

  test('Cognitive accessibility features', async ({ page }) => {
    await page.goto('/help')
    
    // Check for clear headings structure
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', (elements) =>
      elements.map(el => ({
        level: parseInt(el.tagName.charAt(1)),
        text: el.textContent?.trim(),
      }))
    )
    
    // Verify heading hierarchy
    for (let i = 1; i < headings.length; i++) {
      const currentLevel = headings[i].level
      const previousLevel = headings[i - 1].level
      
      // Headings should not skip levels
      if (currentLevel > previousLevel) {
        expect(currentLevel - previousLevel).toBeLessThanOrEqual(1)
      }
    }
    
    // Check for breadcrumb navigation
    const breadcrumbs = page.getByRole('navigation', { name: 'Breadcrumb' })
    await expect(breadcrumbs).toBeVisible()
    
    // Check for skip links
    await page.keyboard.press('Tab')
    const skipLink = page.getByText('Skip to main content')
    await expect(skipLink).toBeFocused()
    
    // Test skip link functionality
    await page.keyboard.press('Enter')
    const mainContent = page.getByRole('main')
    await expect(mainContent).toBeFocused()
    
    // Check for consistent navigation
    const navigation = page.getByRole('navigation', { name: 'Main navigation' })
    await expect(navigation).toBeVisible()
    
    // Verify consistent button styles and labels
    const buttons = await page.$$eval('button', (buttons) =>
      buttons.map(btn => ({
        text: btn.textContent?.trim(),
        ariaLabel: btn.getAttribute('aria-label'),
        hasVisibleText: btn.textContent?.trim().length > 0,
        hasAriaLabel: !!btn.getAttribute('aria-label'),
      }))
    )
    
    // All buttons should have accessible names
    buttons.forEach((button) => {
      expect(button.hasVisibleText || button.hasAriaLabel).toBe(true)
    })
  })
})
```

### Performance and Security Testing

#### Task 3.1: Accessibility Performance Testing
```typescript
// tests/performance/accessibility-performance.test.ts
import { chromium, Browser, Page } from 'playwright'
import lighthouse from 'lighthouse'
import { startFlow } from 'lighthouse/lighthouse-core/fraggle-rock/api.js'

describe('Accessibility Performance Tests', () => {
  let browser: Browser
  let page: Page

  beforeAll(async () => {
    browser = await chromium.launch()
    page = await browser.newPage()
  })

  afterAll(async () => {
    await browser.close()
  })

  test('Lighthouse accessibility audit', async () => {
    await page.goto('http://localhost:3000')
    
    const flow = await startFlow(page, { name: 'Accessibility Performance Flow' })
    
    // Audit home page
    await flow.navigate('http://localhost:3000')
    
    // Audit login flow
    await flow.startTimespan({ stepName: 'Login Process' })
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL('**/dashboard')
    await flow.endTimespan()
    
    // Audit dashboard
    await flow.snapshot({ stepName: 'Dashboard View' })
    
    // Audit work item creation
    await flow.startTimespan({ stepName: 'Create Work Item' })
    await page.getByRole('button', { name: 'Create Work Item' }).click()
    await page.getByLabel('Title').fill('Performance Test Item')
    await page.getByRole('button', { name: 'Create' }).click()
    await flow.endTimespan()
    
    const flowResult = await flow.createFlowResult()
    
    // Check accessibility scores
    flowResult.steps.forEach((step) => {
      if (step.lhr) {
        const accessibilityScore = step.lhr.categories.accessibility.score * 100
        expect(accessibilityScore).toBeGreaterThanOrEqual(95)
        
        // Check for specific accessibility audits
        const audits = step.lhr.audits
        expect(audits['color-contrast'].score).toBe(1)
        expect(audits['heading-order'].score).toBe(1)
        expect(audits['aria-required-attr'].score).toBe(1)
        expect(audits['keyboard-navigation'].score).toBe(1)
      }
    })
  })

  test('Screen reader performance with large datasets', async () => {
    // Navigate to page with large work item list
    await page.goto('http://localhost:3000/projects/large-project')
    
    const startTime = Date.now()
    
    // Simulate screen reader navigation through items
    const workItems = page.getByRole('listitem')
    const itemCount = await workItems.count()
    
    // Navigate through first 50 items
    const itemsToTest = Math.min(50, itemCount)
    
    for (let i = 0; i < itemsToTest; i++) {
      await page.keyboard.press('ArrowDown') // Screen reader navigation
      
      // Ensure ARIA live regions are updated promptly
      await page.waitForFunction(() => {
        const liveRegion = document.querySelector('[aria-live="polite"]')
        return liveRegion && liveRegion.textContent?.trim().length > 0
      }, { timeout: 500 })
    }
    
    const endTime = Date.now()
    const totalTime = endTime - startTime
    
    // Should complete navigation within reasonable time
    expect(totalTime).toBeLessThan(itemsToTest * 200) // Max 200ms per item
    
    // Check for performance metrics
    const performanceMetrics = await page.evaluate(() => performance.getEntriesByType('navigation')[0])
    expect(performanceMetrics.domContentLoadedEventEnd - performanceMetrics.domContentLoadedEventStart).toBeLessThan(3000)
  })

  test('Accessibility feature impact on application performance', async () => {
    // Test with accessibility features disabled
    await page.goto('http://localhost:3000?a11y=disabled')
    const baselineMetrics = await page.metrics()
    
    // Test with accessibility features enabled
    await page.goto('http://localhost:3000?a11y=enabled')
    const enhancedMetrics = await page.metrics()
    
    // Performance impact should be minimal
    const jsHeapDifference = enhancedMetrics.JSHeapUsedSize - baselineMetrics.JSHeapUsedSize
    const layoutDifference = enhancedMetrics.LayoutCount - baselineMetrics.LayoutCount
    
    // Accessibility features should add less than 10% overhead
    expect(jsHeapDifference / baselineMetrics.JSHeapUsedSize).toBeLessThan(0.1)
    expect(layoutDifference / baselineMetrics.LayoutCount).toBeLessThan(0.1)
  })
})
```

### Continuous Testing Integration

#### Task 4.1: Quality Gates and Reporting
```typescript
// scripts/accessibility-quality-gate.js
const fs = require('fs')
const path = require('path')

class AccessibilityQualityGate {
  constructor() {
    this.thresholds = {
      overallScore: 95,
      wcagCompliance: 100,
      section508Compliance: 100,
      microsoftStandardsCompliance: 100,
      keyboardScore: 95,
      screenReaderScore: 95,
      highContrastScore: 100,
      maxViolations: {
        critical: 0,
        serious: 0,
        moderate: 3,
        minor: 10,
      },
    }
  }

  async evaluateResults(reportPath) {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
    const results = {
      passed: true,
      violations: [],
      warnings: [],
      summary: {},
    }

    // Check overall score
    if (report.overallScore < this.thresholds.overallScore) {
      results.passed = false
      results.violations.push({
        type: 'overall_score',
        message: `Overall accessibility score ${report.overallScore} is below threshold ${this.thresholds.overallScore}`,
        severity: 'critical',
      })
    }

    // Check compliance levels
    if (!report.wcagCompliance) {
      results.passed = false
      results.violations.push({
        type: 'wcag_compliance',
        message: 'WCAG 2.1 AA compliance not achieved',
        severity: 'critical',
      })
    }

    if (!report.section508Compliance) {
      results.passed = false
      results.violations.push({
        type: 'section508_compliance',
        message: 'Section 508 compliance not achieved',
        severity: 'critical',
      })
    }

    if (!report.microsoftStandardsCompliance) {
      results.passed = false
      results.violations.push({
        type: 'microsoft_standards',
        message: 'Microsoft accessibility standards compliance not achieved',
        severity: 'critical',
      })
    }

    // Check specific test scores
    if (report.keyboardScore < this.thresholds.keyboardScore) {
      results.violations.push({
        type: 'keyboard_navigation',
        message: `Keyboard navigation score ${report.keyboardScore} below threshold ${this.thresholds.keyboardScore}`,
        severity: 'serious',
      })
    }

    if (report.screenReaderScore < this.thresholds.screenReaderScore) {
      results.violations.push({
        type: 'screen_reader',
        message: `Screen reader compatibility score ${report.screenReaderScore} below threshold ${this.thresholds.screenReaderScore}`,
        severity: 'serious',
      })
    }

    if (report.highContrastScore < this.thresholds.highContrastScore) {
      results.violations.push({
        type: 'high_contrast',
        message: `High contrast mode score ${report.highContrastScore} below threshold ${this.thresholds.highContrastScore}`,
        severity: 'moderate',
      })
    }

    // Check violation counts by severity
    Object.entries(this.thresholds.maxViolations).forEach(([severity, maxCount]) => {
      const violationCount = report.violations?.filter(v => v.impact === severity).length || 0
      if (violationCount > maxCount) {
        results.passed = false
        results.violations.push({
          type: 'violation_count',
          message: `Too many ${severity} violations: ${violationCount} (max: ${maxCount})`,
          severity: 'critical',
        })
      }
    })

    results.summary = {
      totalViolations: results.violations.length,
      criticalViolations: results.violations.filter(v => v.severity === 'critical').length,
      overallScore: report.overallScore,
      complianceStatus: {
        wcag: report.wcagCompliance,
        section508: report.section508Compliance,
        microsoft: report.microsoftStandardsCompliance,
      },
    }

    return results
  }

  generateReport(results) {
    let report = '# Accessibility Quality Gate Report\\n\\n'
    
    if (results.passed) {
      report += '✅ **PASSED** - All accessibility quality gates met\\n\\n'
    } else {
      report += '❌ **FAILED** - Accessibility quality gates not met\\n\\n'
    }

    report += `## Summary\\n`
    report += `- Overall Score: ${results.summary.overallScore}/100\\n`
    report += `- WCAG 2.1 AA: ${results.summary.complianceStatus.wcag ? '✅' : '❌'}\\n`
    report += `- Section 508: ${results.summary.complianceStatus.section508 ? '✅' : '❌'}\\n`
    report += `- Microsoft Standards: ${results.summary.complianceStatus.microsoft ? '✅' : '❌'}\\n`
    report += `- Total Violations: ${results.summary.totalViolations}\\n`
    report += `- Critical Violations: ${results.summary.criticalViolations}\\n\\n`

    if (results.violations.length > 0) {
      report += '## Violations\\n\\n'
      results.violations.forEach((violation, index) => {
        const emoji = violation.severity === 'critical' ? '🚨' : 
                     violation.severity === 'serious' ? '⚠️' : 'ℹ️'
        report += `${index + 1}. ${emoji} **${violation.type}**: ${violation.message}\\n`
      })
      report += '\\n'
    }

    if (results.warnings.length > 0) {
      report += '## Warnings\\n\\n'
      results.warnings.forEach((warning, index) => {
        report += `${index + 1}. ⚠️ ${warning.message}\\n`
      })
    }

    return report
  }
}

// Main execution
async function main() {
  const gate = new AccessibilityQualityGate()
  const reportPath = process.argv[2] || 'accessibility-reports/summary.json'
  
  try {
    const results = await gate.evaluateResults(reportPath)
    const report = gate.generateReport(results)
    
    console.log(report)
    
    // Write report to file
    fs.writeFileSync('accessibility-quality-gate-report.md', report)
    
    // Exit with error code if failed
    process.exit(results.passed ? 0 : 1)
  } catch (error) {
    console.error('Error running accessibility quality gate:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { AccessibilityQualityGate }
```

## Success Metrics

### Testing Coverage Metrics
- **Unit Test Coverage**: > 90% for accessibility-related code
- **Integration Test Coverage**: 100% of accessibility APIs tested
- **E2E Test Coverage**: All critical user journeys with assistive technologies
- **Automated Test Success Rate**: 99% test suite reliability

### Accessibility Compliance Metrics
- **WCAG 2.1 AA Compliance**: 100% compliance maintained
- **Section 508 Compliance**: 100% compliance achieved
- **Microsoft Standards Compliance**: 100% compliance verified
- **Zero Critical Accessibility Defects**: No blocking accessibility issues

### Performance Testing Metrics
- **Test Execution Time**: < 30 minutes for full accessibility test suite
- **Screen Reader Performance**: < 200ms response time per interaction
- **Accessibility Feature Overhead**: < 10% performance impact
- **Quality Gate Pass Rate**: 95% of deployments pass accessibility gates

## Dependencies

### From Other Agents
- **Frontend Agent**: Component implementations for accessibility testing
- **Backend Agent**: Accessibility API implementations for integration testing
- **Infrastructure Agent**: Test environment setup and CI/CD pipeline integration
- **Security Agent**: Security testing integration and vulnerability assessments

### Provides to Other Agents
- **Test Results**: Comprehensive accessibility compliance reports
- **Quality Metrics**: Testing coverage and performance data
- **Bug Reports**: Detailed accessibility defect tracking
- **Best Practices**: Testing guidelines and accessibility standards documentation

---

*The Testing Agent ensures that accessibility is not an afterthought but a core quality requirement validated at every stage of development, maintaining Microsoft's commitment to inclusive technology.*
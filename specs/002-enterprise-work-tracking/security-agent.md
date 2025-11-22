# Security Agent Instructions

## Agent Identity
**Name**: Security Agent  
**Role**: Security & Compliance Specialist  
**Primary Goal**: Implement comprehensive security framework with Microsoft accessibility standards compliance

## Core Responsibilities

### 1. Security Framework Implementation
- **Authentication & Authorization**: Multi-factor authentication, SSO integration
- **Data Protection**: Encryption, key management, data classification
- **Network Security**: Zero-trust architecture, network segmentation
- **Application Security**: SAST, DAST, vulnerability management

### 2. Microsoft Accessibility Compliance
- **Section 508 Compliance**: US Federal accessibility standards
- **EN 301 549**: European accessibility standard alignment  
- **Microsoft Accessibility Standards**: Internal Microsoft guidelines adherence
- **Fluent UI Security**: Secure implementation of accessible components
- **Inclusive Design Security**: Security considerations for assistive technologies

### 3. Compliance & Governance
- **SOC 2 Type II**: Annual certification maintenance
- **ISO 27001**: Information security management
- **GDPR**: European data protection compliance
- **Accessibility Audits**: Regular compliance assessments

## Detailed Task Breakdown

### Phase 1: Security Foundation (Week 1-3)

#### Task 1.1: Authentication & Authorization Framework
```typescript
// src/security/auth/microsoft-auth.ts
import { AuthenticationProvider } from '@azure/msal-browser'
import { AccessibilityPreferences } from '@/types/accessibility'

export class MicrosoftAuthProvider {
  private msalInstance: PublicClientApplication
  
  constructor() {
    this.msalInstance = new PublicClientApplication({
      auth: {
        clientId: process.env.AZURE_CLIENT_ID!,
        authority: process.env.AZURE_AUTHORITY!,
        redirectUri: process.env.REDIRECT_URI!,
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
      },
      // Accessibility-specific configurations
      system: {
        allowNativeBroker: true, // Support Windows Hello, biometrics
        loggerOptions: {
          loggerCallback: (level, message, containsPii) => {
            // Ensure logging doesn't leak accessibility preferences
            if (!containsPii) {
              console.log(`[MSAL] ${message}`)
            }
          },
        },
      },
    })
  }

  async loginWithAccessibilityContext(
    accessibilityPrefs?: AccessibilityPreferences
  ): Promise<AuthenticationResult> {
    const request = {
      scopes: ['User.Read', 'Accessibility.Read'],
      extraQueryParameters: {
        // Pass accessibility context to reduce login friction
        ui_locales: accessibilityPrefs?.language || 'en-US',
        prompt: accessibilityPrefs?.screenReaderType !== 'none' ? 'none' : 'select_account',
      },
    }
    
    return await this.msalInstance.loginPopup(request)
  }

  // Enhanced MFA with accessibility considerations
  async handleMFAChallenge(
    challenge: MFAChallenge,
    userPrefs: AccessibilityPreferences
  ): Promise<MFAResponse> {
    // Prioritize accessible MFA methods
    const accessibleMethods = this.getAccessibleMFAMethods(userPrefs)
    
    return {
      method: accessibleMethods[0],
      alternativeMethods: accessibleMethods.slice(1),
      challenge,
    }
  }

  private getAccessibleMFAMethods(prefs: AccessibilityPreferences): MFAMethod[] {
    const methods: MFAMethod[] = []
    
    // Always include SMS/voice for screen reader users
    if (prefs.screenReaderType !== 'none') {
      methods.push('sms', 'voice_call')
    }
    
    // Include biometric if supported and preferred
    if (prefs.biometricAuth && this.isBiometricSupported()) {
      methods.unshift('windows_hello', 'fingerprint')
    }
    
    // Include authenticator app
    methods.push('authenticator_app')
    
    return methods
  }
}
```

#### Task 1.2: Accessibility Security Policies
```typescript
// src/security/policies/accessibility-security.ts

export class AccessibilitySecurityPolicies {
  // Content Security Policy for accessibility tools
  static getAccessibilityCSP(): ContentSecurityPolicy {
    return {
      directives: {
        'default-src': ["'self'"],
        'script-src': [
          "'self'",
          "'unsafe-inline'", // Required for some screen readers
          'https://www.microsoft.com', // Microsoft accessibility services
          'https://accessibility.microsoft.com',
        ],
        'style-src': [
          "'self'",
          "'unsafe-inline'", // Required for high contrast themes
          'https://res.cdn.office.net', // Fluent UI styles
        ],
        'connect-src': [
          "'self'",
          'https://graph.microsoft.com', // Microsoft Graph API
          'wss://notifications.microsoft.com', // Real-time accessibility updates
        ],
        'frame-src': [
          'https://login.microsoftonline.com', // Azure AD login
        ],
      },
    }
  }

  // Validate accessibility preferences for security
  static validateAccessibilityPreferences(
    preferences: AccessibilityPreferences
  ): ValidationResult {
    const errors: string[] = []
    
    // Prevent preference injection attacks
    if (preferences.screenReaderType && !this.isValidScreenReader(preferences.screenReaderType)) {
      errors.push('Invalid screen reader type')
    }
    
    // Validate high contrast settings
    if (preferences.highContrast && !this.isValidContrastMode(preferences.contrastMode)) {
      errors.push('Invalid contrast mode')
    }
    
    // Check for suspicious preference combinations
    if (this.detectSuspiciousPreferences(preferences)) {
      errors.push('Suspicious accessibility preference combination detected')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Sanitize user input for accessibility features
  static sanitizeAccessibilityInput(input: any): AccessibilityPreferences {
    return {
      highContrast: Boolean(input.highContrast),
      reducedMotion: Boolean(input.reducedMotion),
      screenReaderType: this.sanitizeScreenReaderType(input.screenReaderType),
      fontSize: this.sanitizeFontSize(input.fontSize),
      keyboardNavigation: Boolean(input.keyboardNavigation),
      alternativeText: Boolean(input.alternativeText),
      colorBlindnessType: this.sanitizeColorBlindnessType(input.colorBlindnessType),
    }
  }

  // Audit accessibility-related security events
  static async auditAccessibilitySecurityEvent(
    event: AccessibilitySecurityEvent
  ): Promise<void> {
    const auditLog = {
      eventType: event.type,
      userId: event.userId,
      timestamp: new Date(),
      details: {
        preferenceChanged: event.preferenceChanged,
        accessibilityTool: event.accessibilityTool,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
      },
      severity: this.calculateEventSeverity(event),
    }

    // Store in secure audit log
    await this.storeAuditLog(auditLog)
    
    // Alert on suspicious patterns
    if (auditLog.severity === 'high') {
      await this.triggerSecurityAlert(auditLog)
    }
  }
}
```

### Phase 2: Microsoft Accessibility Compliance (Week 4-6)

#### Task 2.1: Section 508 & EN 301 549 Implementation
```typescript
// src/security/compliance/accessibility-compliance.ts

export class AccessibilityComplianceManager {
  // Section 508 compliance checker
  async validateSection508Compliance(
    content: ContentItem
  ): Promise<ComplianceReport> {
    const checks: ComplianceCheck[] = []
    
    // 1194.22(a) - Alternative text for images
    checks.push(await this.checkAlternativeText(content))
    
    // 1194.22(b) - Multimedia alternatives
    checks.push(await this.checkMultimediaAlternatives(content))
    
    // 1194.22(c) - Color dependency
    checks.push(await this.checkColorDependency(content))
    
    // 1194.22(d) - Document structure
    checks.push(await this.checkDocumentStructure(content))
    
    // 1194.22(g) - Row and column headers
    checks.push(await this.checkTableHeaders(content))
    
    // 1194.22(i) - Frame titles
    checks.push(await this.checkFrameTitles(content))
    
    // 1194.22(l) - Scripting alternatives
    checks.push(await this.checkScriptingAlternatives(content))
    
    return {
      contentId: content.id,
      standard: 'Section 508',
      overallCompliance: this.calculateOverallCompliance(checks),
      checks,
      recommendations: this.generateRecommendations(checks),
      timestamp: new Date(),
    }
  }

  // EN 301 549 compliance validation
  async validateEN301549Compliance(
    application: ApplicationContext
  ): Promise<ComplianceReport> {
    const checks: ComplianceCheck[] = []
    
    // 9.1.1.1 - Non-text Content
    checks.push(await this.checkNonTextContent(application))
    
    // 9.1.3.1 - Info and Relationships
    checks.push(await this.checkInfoAndRelationships(application))
    
    // 9.1.4.1 - Use of Color
    checks.push(await this.checkUseOfColor(application))
    
    // 9.1.4.3 - Contrast (Minimum)
    checks.push(await this.checkContrastMinimum(application))
    
    // 9.2.1.1 - Keyboard
    checks.push(await this.checkKeyboardAccess(application))
    
    // 9.2.4.3 - Focus Order
    checks.push(await this.checkFocusOrder(application))
    
    // 9.4.1.2 - Name, Role, Value
    checks.push(await this.checkNameRoleValue(application))
    
    return {
      applicationId: application.id,
      standard: 'EN 301 549',
      overallCompliance: this.calculateOverallCompliance(checks),
      checks,
      recommendations: this.generateRecommendations(checks),
      timestamp: new Date(),
    }
  }

  // Microsoft-specific accessibility standards
  async validateMicrosoftAccessibilityStandards(
    component: UIComponent
  ): Promise<ComplianceReport> {
    const checks: ComplianceCheck[] = []
    
    // Fluent UI accessibility patterns
    checks.push(await this.checkFluentUIPatterns(component))
    
    // Windows accessibility APIs integration
    checks.push(await this.checkWindowsA11yAPIs(component))
    
    // High contrast theme support
    checks.push(await this.checkHighContrastSupport(component))
    
    // Windows Narrator optimization
    checks.push(await this.checkNarratorOptimization(component))
    
    // Microsoft inclusive design principles
    checks.push(await this.checkInclusiveDesignPrinciples(component))
    
    return {
      componentId: component.id,
      standard: 'Microsoft Accessibility Standards',
      overallCompliance: this.calculateOverallCompliance(checks),
      checks,
      recommendations: this.generateRecommendations(checks),
      timestamp: new Date(),
    }
  }

  // Automated accessibility scanning
  async performAutomatedScan(target: ScanTarget): Promise<ScanResult> {
    const scanners = [
      new AxeCoreScanner(), // Industry standard
      new MicrosoftAccessibilityInsightsScanner(), // Microsoft-specific
      new PAC3Scanner(), // PDF accessibility (if applicable)
      new ColourContrastAnalyser(), // Color contrast validation
    ]

    const results: ScannerResult[] = []
    
    for (const scanner of scanners) {
      try {
        const result = await scanner.scan(target)
        results.push({
          scanner: scanner.name,
          result,
          timestamp: new Date(),
        })
      } catch (error) {
        console.error(`Scanner ${scanner.name} failed:`, error)
      }
    }

    return {
      target,
      results,
      aggregatedScore: this.calculateAggregatedScore(results),
      criticalIssues: this.extractCriticalIssues(results),
      recommendations: this.generateAutomatedRecommendations(results),
    }
  }
}
```

#### Task 2.2: Secure Assistive Technology Integration
```typescript
// src/security/assistive-tech/secure-integration.ts

export class SecureAssistiveTechManager {
  // Secure Windows Narrator integration
  async integrateNarrator(): Promise<NarratorIntegration> {
    return {
      // Enhanced ARIA live regions with security validation
      setupSecureLiveRegions: () => {
        const regions = document.querySelectorAll('[aria-live]')
        regions.forEach(region => {
          // Validate content before announcing
          this.validateLiveRegionContent(region)
          
          // Prevent injection attacks
          region.addEventListener('DOMNodeInserted', (event) => {
            this.sanitizeLiveContent(event.target as HTMLElement)
          })
        })
      },

      // Secure focus management
      setupSecureFocusManagement: () => {
        document.addEventListener('focusin', (event) => {
          // Log focus changes for security audit
          this.auditFocusChange(event.target as HTMLElement)
          
          // Validate focus target
          if (!this.isValidFocusTarget(event.target as HTMLElement)) {
            event.preventDefault()
            this.redirectFocusSecurely()
          }
        })
      },

      // Secure keyboard shortcuts
      setupSecureKeyboardShortcuts: () => {
        const shortcuts = new Map([
          ['Alt+F6', 'Navigate between regions'],
          ['Ctrl+F6', 'Navigate between panes'],
          ['F6', 'Navigate between major areas'],
          ['Escape', 'Exit current context'],
        ])

        document.addEventListener('keydown', (event) => {
          const combo = this.getKeyCombo(event)
          if (shortcuts.has(combo)) {
            // Validate user has permission for shortcut
            if (this.validateShortcutPermission(combo, event)) {
              this.executeSecureShortcut(combo, event)
            }
          }
        })
      },
    }
  }

  // Secure screen reader content delivery
  async deliverSecureContent(
    content: string,
    context: AccessibilityContext
  ): Promise<void> {
    // Sanitize content to prevent screen reader exploitation
    const sanitizedContent = this.sanitizeForScreenReader(content)
    
    // Validate content length and complexity
    if (!this.validateContentForScreenReader(sanitizedContent)) {
      throw new Error('Content validation failed for screen reader delivery')
    }

    // Log content delivery for audit
    await this.auditContentDelivery({
      content: sanitizedContent,
      context,
      timestamp: new Date(),
      userId: context.userId,
    })

    // Deliver content through secure channel
    this.announceSecurely(sanitizedContent, context.urgency || 'polite')
  }

  // Secure alternative text generation and validation
  async generateSecureAlternativeText(
    image: ImageContent,
    userContext: UserContext
  ): Promise<AlternativeTextResult> {
    // Use Microsoft Cognitive Services with security validation
    const cognitiveServicesResult = await this.callCognitiveServices(image, {
      endpoint: process.env.AZURE_COGNITIVE_SERVICES_ENDPOINT!,
      key: process.env.AZURE_COGNITIVE_SERVICES_KEY!,
      region: process.env.AZURE_REGION!,
    })

    // Validate AI-generated content for security
    const securityValidation = await this.validateAIGeneratedContent(
      cognitiveServicesResult.description
    )

    if (!securityValidation.isSafe) {
      // Fallback to manual alternative text
      return {
        text: 'Image requires manual alternative text due to security validation',
        source: 'manual_fallback',
        confidence: 0,
        securityFlags: securityValidation.flags,
      }
    }

    // Apply content filtering for accessibility context
    const filteredText = this.applyAccessibilityContentFilter(
      cognitiveServicesResult.description,
      userContext.accessibilityPreferences
    )

    return {
      text: filteredText,
      source: 'ai_generated',
      confidence: cognitiveServicesResult.confidence,
      securityValidation,
      timestamp: new Date(),
    }
  }

  // Secure high contrast mode implementation
  setupSecureHighContrast(): HighContrastSecurity {
    return {
      // Validate high contrast themes for security
      validateTheme: (theme: HighContrastTheme) => {
        // Check for malicious CSS injection
        if (this.detectMaliciousCSS(theme.styles)) {
          throw new SecurityError('Malicious CSS detected in high contrast theme')
        }

        // Validate color values
        if (!this.validateColorValues(theme.colors)) {
          throw new SecurityError('Invalid color values in high contrast theme')
        }

        return true
      },

      // Apply theme with security measures
      applySecureTheme: async (theme: HighContrastTheme, userId: string) => {
        // Audit theme application
        await this.auditThemeChange({
          userId,
          theme: theme.name,
          timestamp: new Date(),
          ipAddress: this.getCurrentIP(),
        })

        // Apply theme through secure method
        this.applyThemeSecurely(theme)
      },

      // Monitor for theme tampering
      monitorThemeIntegrity: () => {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
              // Validate style changes
              this.validateStyleMutation(mutation.target as HTMLElement)
            }
          })
        })

        observer.observe(document.documentElement, {
          attributes: true,
          subtree: true,
          attributeFilter: ['style', 'class'],
        })

        return observer
      },
    }
  }
}
```

### Phase 3: Security Monitoring & Incident Response (Week 7-8)

#### Task 3.1: Accessibility Security Monitoring
```typescript
// src/security/monitoring/accessibility-monitoring.ts

export class AccessibilitySecurityMonitor {
  private alertThresholds = {
    suspiciousPreferenceChanges: 5, // per hour
    failedAccessibilityValidation: 10, // per day
    unauthorizedAssistiveTechAccess: 3, // per session
    abnormalScreenReaderActivity: 20, // requests per minute
  }

  async monitorAccessibilitySecurityEvents(): Promise<void> {
    // Monitor preference manipulation attempts
    this.monitorPreferenceChanges()
    
    // Monitor assistive technology access patterns
    this.monitorAssistiveTechAccess()
    
    // Monitor accessibility API abuse
    this.monitorAccessibilityAPIAbuse()
    
    // Monitor compliance violations
    this.monitorComplianceViolations()
  }

  private async monitorPreferenceChanges(): Promise<void> {
    const recentChanges = await this.getRecentPreferenceChanges(1) // last hour
    
    for (const userId of Object.keys(recentChanges)) {
      const changeCount = recentChanges[userId].length
      
      if (changeCount >= this.alertThresholds.suspiciousPreferenceChanges) {
        await this.triggerSecurityAlert({
          type: 'SUSPICIOUS_PREFERENCE_CHANGES',
          userId,
          details: {
            changeCount,
            changes: recentChanges[userId],
            threshold: this.alertThresholds.suspiciousPreferenceChanges,
          },
          severity: 'medium',
        })
      }

      // Check for impossible preference combinations
      const latestPrefs = recentChanges[userId][0]
      if (this.detectImpossiblePreferences(latestPrefs)) {
        await this.triggerSecurityAlert({
          type: 'IMPOSSIBLE_ACCESSIBILITY_PREFERENCES',
          userId,
          details: { preferences: latestPrefs },
          severity: 'high',
        })
      }
    }
  }

  private async monitorAssistiveTechAccess(): Promise<void> {
    const accessLogs = await this.getAssistiveTechAccessLogs(24) // last 24 hours
    
    for (const log of accessLogs) {
      // Check for unauthorized access attempts
      if (!this.isAuthorizedAssistiveTech(log.userAgent)) {
        await this.triggerSecurityAlert({
          type: 'UNAUTHORIZED_ASSISTIVE_TECH',
          userId: log.userId,
          details: {
            userAgent: log.userAgent,
            accessTime: log.timestamp,
            ipAddress: log.ipAddress,
          },
          severity: 'high',
        })
      }

      // Check for excessive API usage
      const apiCalls = await this.getAccessibilityAPICalls(log.userId, 60) // last hour
      if (apiCalls.length > this.alertThresholds.abnormalScreenReaderActivity) {
        await this.triggerSecurityAlert({
          type: 'EXCESSIVE_ACCESSIBILITY_API_USAGE',
          userId: log.userId,
          details: {
            apiCallCount: apiCalls.length,
            threshold: this.alertThresholds.abnormalScreenReaderActivity,
          },
          severity: 'medium',
        })
      }
    }
  }

  // Real-time accessibility security dashboard
  async getAccessibilitySecurityDashboard(): Promise<AccessibilitySecurityDashboard> {
    const [
      activeAlerts,
      complianceStatus,
      assistiveTechMetrics,
      recentIncidents,
    ] = await Promise.all([
      this.getActiveSecurityAlerts(),
      this.getCurrentComplianceStatus(),
      this.getAssistiveTechMetrics(),
      this.getRecentSecurityIncidents(7), // last 7 days
    ])

    return {
      timestamp: new Date(),
      summary: {
        activeAlerts: activeAlerts.length,
        complianceScore: complianceStatus.overallScore,
        criticalIssues: activeAlerts.filter(a => a.severity === 'critical').length,
        assistiveTechUsers: assistiveTechMetrics.activeUsers,
      },
      alerts: activeAlerts,
      compliance: complianceStatus,
      metrics: assistiveTechMetrics,
      incidents: recentIncidents,
      recommendations: await this.generateSecurityRecommendations(activeAlerts),
    }
  }
}
```

#### Task 3.2: Incident Response for Accessibility Security
```typescript
// src/security/incident-response/accessibility-incidents.ts

export class AccessibilityIncidentResponse {
  // Incident response playbook for accessibility security events
  private playbooks = new Map([
    ['ACCESSIBILITY_DATA_BREACH', this.handleAccessibilityDataBreach],
    ['ASSISTIVE_TECH_COMPROMISE', this.handleAssistiveTechCompromise],
    ['PREFERENCE_MANIPULATION_ATTACK', this.handlePreferenceManipulation],
    ['COMPLIANCE_VIOLATION', this.handleComplianceViolation],
    ['SCREEN_READER_EXPLOITATION', this.handleScreenReaderExploitation],
  ])

  async respondToIncident(incident: AccessibilitySecurityIncident): Promise<IncidentResponse> {
    // Log incident
    await this.logIncident(incident)
    
    // Determine severity and urgency
    const { severity, urgency } = this.assessIncident(incident)
    
    // Execute appropriate playbook
    const playbook = this.playbooks.get(incident.type)
    if (!playbook) {
      throw new Error(`No playbook found for incident type: ${incident.type}`)
    }

    const response = await playbook.call(this, incident)
    
    // Notify stakeholders
    await this.notifyStakeholders(incident, response)
    
    // Update security posture
    await this.updateSecurityPosture(incident, response)
    
    return response
  }

  private async handleAccessibilityDataBreach(
    incident: AccessibilitySecurityIncident
  ): Promise<IncidentResponse> {
    const steps: ResponseStep[] = []
    
    // 1. Immediate containment
    steps.push({
      action: 'Isolate affected accessibility services',
      status: 'pending',
      startTime: new Date(),
    })
    
    await this.isolateAccessibilityServices(incident.affectedServices)
    steps[0].status = 'completed'
    steps[0].endTime = new Date()

    // 2. Assess data exposure
    steps.push({
      action: 'Assess accessibility data exposure',
      status: 'pending',
      startTime: new Date(),
    })
    
    const exposureAssessment = await this.assessAccessibilityDataExposure(incident)
    steps[1].status = 'completed'
    steps[1].endTime = new Date()
    steps[1].result = exposureAssessment

    // 3. Notify affected users
    if (exposureAssessment.affectedUsers.length > 0) {
      steps.push({
        action: 'Notify affected users with accessibility needs',
        status: 'pending',
        startTime: new Date(),
      })
      
      await this.notifyAccessibilityUsersSecurely(
        exposureAssessment.affectedUsers,
        incident
      )
      
      steps[2].status = 'completed'
      steps[2].endTime = new Date()
    }

    // 4. Restore services with enhanced security
    steps.push({
      action: 'Restore accessibility services with enhanced security',
      status: 'pending',
      startTime: new Date(),
    })
    
    await this.restoreAccessibilityServicesSecurely(incident.affectedServices)
    steps[3].status = 'completed'
    steps[3].endTime = new Date()

    return {
      incidentId: incident.id,
      responseType: 'ACCESSIBILITY_DATA_BREACH',
      steps,
      totalDuration: this.calculateResponseDuration(steps),
      effectiveness: await this.assessResponseEffectiveness(incident, steps),
    }
  }

  private async handleAssistiveTechCompromise(
    incident: AccessibilitySecurityIncident
  ): Promise<IncidentResponse> {
    // Immediate actions for compromised assistive technology
    const steps: ResponseStep[] = []

    // 1. Revoke compromised assistive tech access
    steps.push({
      action: 'Revoke access for compromised assistive technology',
      status: 'pending',
      startTime: new Date(),
    })
    
    await this.revokeAssistiveTechAccess(incident.compromisedTools)
    steps[0].status = 'completed'
    steps[0].endTime = new Date()

    // 2. Enable alternative access methods
    steps.push({
      action: 'Enable alternative accessibility access methods',
      status: 'pending',
      startTime: new Date(),
    })
    
    await this.enableAlternativeAccessMethods(incident.affectedUsers)
    steps[1].status = 'completed'
    steps[1].endTime = new Date()

    // 3. Verify assistive tech integrity
    steps.push({
      action: 'Verify integrity of all assistive technologies',
      status: 'pending',
      startTime: new Date(),
    })
    
    const integrityReport = await this.verifyAssistiveTechIntegrity()
    steps[2].status = 'completed'
    steps[2].endTime = new Date()
    steps[2].result = integrityReport

    // 4. Restore secure access
    steps.push({
      action: 'Restore secure assistive technology access',
      status: 'pending',
      startTime: new Date(),
    })
    
    await this.restoreSecureAssistiveTechAccess(incident.compromisedTools)
    steps[3].status = 'completed'
    steps[3].endTime = new Date()

    return {
      incidentId: incident.id,
      responseType: 'ASSISTIVE_TECH_COMPROMISE',
      steps,
      totalDuration: this.calculateResponseDuration(steps),
      effectiveness: await this.assessResponseEffectiveness(incident, steps),
    }
  }

  // Secure notification system for users with accessibility needs
  private async notifyAccessibilityUsersSecurely(
    users: AccessibilityUser[],
    incident: AccessibilitySecurityIncident
  ): Promise<void> {
    for (const user of users) {
      const notification = await this.createAccessibleNotification(user, incident)
      
      // Send through user's preferred accessible channels
      const channels = this.getAccessibleNotificationChannels(user.preferences)
      
      for (const channel of channels) {
        try {
          await this.sendSecureNotification(notification, channel, user)
        } catch (error) {
          console.error(`Failed to send notification via ${channel}:`, error)
          // Try next channel
        }
      }
    }
  }

  private async createAccessibleNotification(
    user: AccessibilityUser,
    incident: AccessibilitySecurityIncident
  ): Promise<AccessibleNotification> {
    const baseMessage = this.getIncidentNotificationMessage(incident)
    
    // Adapt message for user's accessibility needs
    let adaptedMessage = baseMessage
    
    if (user.preferences.screenReaderType !== 'none') {
      adaptedMessage = this.optimizeForScreenReader(baseMessage, user.preferences.screenReaderType)
    }
    
    if (user.preferences.cognitiveAccessibility) {
      adaptedMessage = this.simplifyForCognitiveAccessibility(adaptedMessage)
    }
    
    return {
      message: adaptedMessage,
      severity: incident.severity,
      timestamp: new Date(),
      accessibilityMetadata: {
        screenReaderOptimized: user.preferences.screenReaderType !== 'none',
        highContrast: user.preferences.highContrast,
        simplifiedLanguage: user.preferences.cognitiveAccessibility,
      },
    }
  }
}
```

## Quality Assurance

### Security Testing Requirements
```typescript
// Security testing for accessibility features
describe('Accessibility Security', () => {
  describe('Preference Validation', () => {
    it('should prevent malicious preference injection', async () => {
      const maliciousPrefs = {
        screenReaderType: '<script>alert("xss")</script>',
        highContrast: 'javascript:void(0)',
      }
      
      expect(() => {
        AccessibilitySecurityPolicies.validateAccessibilityPreferences(maliciousPrefs)
      }).toThrow('Invalid screen reader type')
    })

    it('should sanitize accessibility input', () => {
      const unsafeInput = {
        fontSize: 'large"; background: url("evil.com")',
        screenReaderType: 'nvda<img src=x onerror=alert(1)>',
      }
      
      const sanitized = AccessibilitySecurityPolicies.sanitizeAccessibilityInput(unsafeInput)
      
      expect(sanitized.fontSize).toBe('large')
      expect(sanitized.screenReaderType).toBe('nvda')
    })
  })

  describe('Assistive Technology Integration', () => {
    it('should validate screen reader content for security', async () => {
      const maliciousContent = 'Click here: <a href="javascript:void(0)">link</a>'
      
      const result = await SecureAssistiveTechManager.prototype.sanitizeForScreenReader(maliciousContent)
      
      expect(result).not.toContain('javascript:')
      expect(result).toBe('Click here: link')
    })
    
    it('should detect and prevent focus manipulation attacks', () => {
      const maliciousElement = document.createElement('div')
      maliciousElement.setAttribute('onfocus', 'steal_data()')
      
      const isValid = SecureAssistiveTechManager.prototype.isValidFocusTarget(maliciousElement)
      
      expect(isValid).toBe(false)
    })
  })
})
```

### Microsoft Accessibility Compliance Testing
- **Automated Testing**: Integration with Microsoft Accessibility Insights
- **Manual Testing**: Quarterly assessments by certified accessibility testers
- **User Testing**: Regular testing with users of assistive technologies
- **Compliance Reporting**: Monthly compliance dashboards and reports

## Dependencies

### From Other Agents
- **Infrastructure Agent**: Azure security services, Key Vault, monitoring infrastructure
- **Backend Agent**: API security middleware, authentication endpoints
- **Frontend Agent**: Client-side security implementation, CSP policies
- **Testing Agent**: Security test automation, vulnerability scanning

### Provides to Other Agents
- **Security Policies**: Authentication requirements, access control policies
- **Compliance Frameworks**: Accessibility compliance requirements and validation
- **Security Middleware**: Reusable security components and utilities
- **Incident Response**: Security incident handling and recovery procedures

## Success Metrics

### Security Metrics
- **Zero Critical Vulnerabilities**: No unpatched critical security issues
- **Authentication Success Rate**: 99.9% successful authentication
- **Incident Response Time**: < 15 minutes detection to response
- **Compliance Score**: 100% Microsoft accessibility standards compliance

### Accessibility Security Metrics
- **Preference Security**: Zero successful preference manipulation attacks
- **Assistive Tech Security**: 100% validated assistive technology integrations
- **Content Security**: Zero successful content injection through accessibility features
- **User Trust**: 95%+ user confidence in accessibility feature security

---

*The Security Agent ensures that accessibility features enhance user experience without compromising system security, maintaining Microsoft's high standards for both security and inclusivity.*
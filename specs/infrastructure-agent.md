# Infrastructure Agent Instructions

## Agent Identity
**Name**: Infrastructure Agent  
**Role**: Cloud Infrastructure & DevOps Specialist  
**Primary Goal**: Establish robust, scalable, and secure cloud infrastructure for the enterprise work tracking system

## Core Responsibilities

### 1. Azure Infrastructure Provisioning
- **Kubernetes Cluster**: Setup AKS with multiple node pools
- **Networking**: Configure VNets, subnets, NSGs, and private endpoints
- **Storage**: Provision Azure Database for PostgreSQL, Redis Cache, Blob Storage
- **Security**: Implement Azure Key Vault, managed identities, WAF
- **Monitoring**: Deploy Application Insights, Log Analytics workspace

### 2. Infrastructure as Code (IaC)
- **Terraform Modules**: Create reusable infrastructure modules
- **Environment Management**: Dev, staging, production configurations
- **State Management**: Secure Terraform state storage and locking
- **Version Control**: Git-based infrastructure versioning

### 3. CI/CD Pipeline Setup
- **GitHub Actions**: Multi-stage build and deployment pipelines
- **Container Registry**: Azure Container Registry with security scanning
- **ArgoCD**: GitOps-based continuous deployment
- **Quality Gates**: Automated security and compliance checks

### 4. Content Delivery Network (CDN)
- **Azure Front Door**: Global CDN with WAF and routing rules
- **Static Asset Optimization**: Compression, caching, and image optimization
- **Accessibility Asset Delivery**: Optimized delivery for assistive technology resources
- **Performance Monitoring**: CDN performance metrics and alerting
- **Security**: SSL/TLS termination and DDoS protection

### 5. Monitoring & Observability
- **Prometheus Stack**: Metrics collection and alerting
- **Grafana Dashboards**: Infrastructure and application monitoring
- **ELK Stack**: Centralized logging and analysis
- **Distributed Tracing**: Jaeger implementation

## Detailed Task Breakdown

### Foundation Infrastructure

#### Task 1.1: Content Delivery Network Setup
```hcl
# terraform/modules/cdn/main.tf - Azure Front Door with accessibility optimizations
resource "azurerm_frontdoor" "worktracker_cdn" {
  name                = "worktracker-cdn-${var.environment}"
  resource_group_name = var.resource_group_name

  # Routing rules for accessibility-optimized content delivery
  routing_rule {
    name               = "accessibility-assets"
    accepted_protocols = ["Http", "Https"]
    patterns_to_match  = ["/accessibility/*", "/aria/*", "/screen-reader/*"]
    frontend_endpoints = ["worktracker-${var.environment}.azurefd.net"]
    
    forwarding_configuration {
      forwarding_protocol = "HttpsOnly"
      backend_pool_name   = "accessibility-backend"
      
      # Cache accessibility resources for 24 hours
      cache_enabled       = true
      cache_duration      = "1.00:00:00"
      
      # Custom headers for assistive technology
      custom_forwarding_path = "/"
    }
  }

  routing_rule {
    name               = "static-assets"
    accepted_protocols = ["Http", "Https"]
    patterns_to_match  = ["/assets/*", "/images/*", "/css/*", "/js/*"]
    frontend_endpoints = ["worktracker-${var.environment}.azurefd.net"]
    
    forwarding_configuration {
      forwarding_protocol = "HttpsOnly"
      backend_pool_name   = "static-assets-backend"
      
      # Long cache for static assets
      cache_enabled       = true
      cache_duration      = "7.00:00:00"
      
      # Compression for better performance
      cache_use_dynamic_compression = true
    }
  }

  routing_rule {
    name               = "api-traffic"
    accepted_protocols = ["Https"]
    patterns_to_match  = ["/api/*"]
    frontend_endpoints = ["worktracker-${var.environment}.azurefd.net"]
    
    forwarding_configuration {
      forwarding_protocol = "HttpsOnly"
      backend_pool_name   = "api-backend"
      
      # No caching for API calls
      cache_enabled = false
    }
  }

  # Backend pools for different content types
  backend_pool {
    name = "accessibility-backend"
    backend {
      host_header = azurerm_storage_account.accessibility_assets.primary_blob_host
      address     = azurerm_storage_account.accessibility_assets.primary_blob_host
      http_port   = 80
      https_port  = 443
      weight      = 100
      priority    = 1
    }
    
    load_balancing_name = "accessibility-load-balancer"
    health_probe_name   = "accessibility-health-probe"
  }

  backend_pool {
    name = "static-assets-backend"
    backend {
      host_header = azurerm_storage_account.static_assets.primary_blob_host
      address     = azurerm_storage_account.static_assets.primary_blob_host
      http_port   = 80
      https_port  = 443
      weight      = 100
      priority    = 1
    }
    
    load_balancing_name = "assets-load-balancer"
    health_probe_name   = "assets-health-probe"
  }

  backend_pool {
    name = "api-backend"
    backend {
      host_header = "worktracker-api-${var.environment}.${var.domain_name}"
      address     = "worktracker-api-${var.environment}.${var.domain_name}"
      http_port   = 80
      https_port  = 443
      weight      = 100
      priority    = 1
    }
    
    load_balancing_name = "api-load-balancer"
    health_probe_name   = "api-health-probe"
  }

  # Load balancing configurations
  backend_pool_load_balancing {
    name                            = "accessibility-load-balancer"
    sample_size                     = 4
    successful_samples_required     = 2
    additional_latency_milliseconds = 0
  }

  backend_pool_load_balancing {
    name                            = "assets-load-balancer"
    sample_size                     = 4
    successful_samples_required     = 2
    additional_latency_milliseconds = 0
  }

  backend_pool_load_balancing {
    name                            = "api-load-balancer"
    sample_size                     = 4
    successful_samples_required     = 2
    additional_latency_milliseconds = 0
  }

  # Health probes
  backend_pool_health_probe {
    name                = "accessibility-health-probe"
    protocol            = "Https"
    probe_method        = "GET"
    path                = "/accessibility/health"
    interval_in_seconds = 30
  }

  backend_pool_health_probe {
    name                = "assets-health-probe"
    protocol            = "Https"
    probe_method        = "HEAD"
    path                = "/ping"
    interval_in_seconds = 60
  }

  backend_pool_health_probe {
    name                = "api-health-probe"
    protocol            = "Https"
    probe_method        = "GET"
    path                = "/api/health"
    interval_in_seconds = 30
  }

  # Frontend endpoints
  frontend_endpoint {
    name      = "worktracker-${var.environment}"
    host_name = "worktracker-${var.environment}.azurefd.net"
  }

  # Custom domain support
  frontend_endpoint {
    name                              = "worktracker-custom-domain"
    host_name                         = var.custom_domain_name
    custom_https_provisioning_enabled = true
    
    custom_https_configuration {
      certificate_source = "FrontDoor"
    }
  }

  # Web Application Firewall integration
  web_application_firewall_policy_link_id = azurerm_frontdoor_firewall_policy.worktracker_waf.id

  tags = var.common_tags
}

# Azure Blob Storage for accessibility-specific assets
resource "azurerm_storage_account" "accessibility_assets" {
  name                     = "wtaccessibility${var.environment}"
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "GRS"
  
  # Enable static website hosting
  static_website {
    index_document     = "index.html"
    error_404_document = "404.html"
  }

  # Security and accessibility features
  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = false
  
  # CORS for accessibility tools
  cors_rule {
    allowed_headers    = ["*"]
    allowed_methods    = ["GET", "HEAD", "OPTIONS"]
    allowed_origins    = [
      "https://*.worktracker.com", 
      "https://accessibility-insights.io",
      "https://*.axe-core.org"
    ]
    exposed_headers    = ["*"]
    max_age_in_seconds = 3600
  }

  tags = var.common_tags
}

# Azure Blob Storage for general static assets
resource "azurerm_storage_account" "static_assets" {
  name                     = "wtstatic${var.environment}"
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "GRS"
  
  # Enable static website hosting
  static_website {
    index_document     = "index.html"
    error_404_document = "404.html"
  }

  # Performance and security
  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = false
  
  tags = var.common_tags
}

# Container for accessibility-specific assets
resource "azurerm_storage_container" "accessibility_assets" {
  name                  = "accessibility"
  storage_account_name  = azurerm_storage_account.accessibility_assets.name
  container_access_type = "blob"
}

# Container for general static assets  
resource "azurerm_storage_container" "static_assets" {
  name                  = "assets"
  storage_account_name  = azurerm_storage_account.static_assets.name
  container_access_type = "blob"
}

# Web Application Firewall policy with accessibility considerations
resource "azurerm_frontdoor_firewall_policy" "worktracker_waf" {
  name                = "worktracker-waf-${var.environment}"
  resource_group_name = var.resource_group_name
  enabled             = true
  mode                = "Prevention"

  # Allow accessibility testing tools
  custom_rule {
    name     = "AllowAccessibilityTools"
    priority = 100
    type     = "MatchRule"
    action   = "Allow"

    match_condition {
      match_variable     = "RequestHeaders"
      selector          = "User-Agent"
      operator          = "Contains"
      match_values      = [
        "accessibility-insights",
        "axe-core",
        "WAVE",
        "Pa11y",
        "Lighthouse"
      ]
    }
  }

  # Microsoft default managed rule set
  managed_rule {
    type    = "Microsoft_DefaultRuleSet"
    version = "1.1"
    
    # Override rules that might block accessibility tools
    override {
      rule_group_name = "PROTOCOL-ATTACK"
      rule {
        rule_id = "944240"
        enabled = false  # Allow certain user agents
      }
    }
  }

  # Bot manager
  managed_rule {
    type    = "Microsoft_BotManagerRuleSet"
    version = "1.0"
  }

  tags = var.common_tags
}
```

#### Task 1.2: Core Azure Resources
```bash
# Terraform modules to create
terraform/
├── modules/
│   ├── cdn/
│   │   ├── main.tf          # CDN and WAF configuration
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── networking/
│   │   ├── main.tf          # VNet, subnets, NSGs
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── aks/
│   │   ├── main.tf          # AKS cluster configuration
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── databases/
│   │   ├── main.tf          # PostgreSQL, Redis
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── security/
│       ├── main.tf          # Key Vault, managed identities
│       ├── variables.tf
│       └── outputs.tf
└── environments/
    ├── dev/
    ├── staging/
    └── production/
```

#### Task 1.2: Network Architecture
- **Address Space**: 10.0.0.0/16 with proper subnet allocation
- **Security Groups**: Restrict traffic between tiers
- **Private Endpoints**: Database and storage private connectivity
- **Load Balancers**: Application Gateway with WAF rules

#### Task 1.3: AKS Configuration
```yaml
# AKS cluster specifications
cluster:
  name: work-tracker-aks
  kubernetes_version: "1.28"
  node_pools:
    system:
      vm_size: "Standard_D4s_v3"
      node_count: 3
      max_count: 10
    application:
      vm_size: "Standard_D8s_v3"
      node_count: 6
      max_count: 50
    database:
      vm_size: "Standard_E8s_v3"
      node_count: 3
      max_count: 6
```

### CI/CD Infrastructure

#### Task 2.1: GitHub Actions Setup
```yaml
# .github/workflows/infrastructure.yml
name: Infrastructure Deployment
on:
  push:
    branches: [main]
    paths: ['terraform/**']
  
jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
      - name: Setup Terraform
      - name: Terraform Plan
      - name: Terraform Apply
      - name: Update Infrastructure Docs
```

#### Task 2.2: ArgoCD Configuration
```yaml
# argocd/applications/
├── work-tracker-backend.yaml
├── work-tracker-frontend.yaml
├── work-tracker-database.yaml
└── monitoring-stack.yaml
```

#### Task 2.3: Container Security
- **Trivy Scanner**: Container vulnerability scanning
- **Policy Enforcement**: OPA Gatekeeper policies
- **Image Signing**: Cosign for container image signatures
- **Runtime Security**: Falco for runtime threat detection

### Monitoring Stack

#### Task 3.1: CDN Performance Monitoring
```yaml
# cdn/monitoring-config.yaml - CDN performance and accessibility monitoring
apiVersion: v1
kind: ConfigMap
metadata:
  name: cdn-monitoring-config
  namespace: worktracker
data:
  cdn-performance-rules.json: |
    {
      "performance_thresholds": {
        "response_time_p95": "500ms",
        "response_time_p99": "1000ms", 
        "cache_hit_rate_min": "85%",
        "availability_min": "99.9%",
        "accessibility_asset_response_time": "200ms"
      },
      "accessibility_monitoring": {
        "screen_reader_performance": {
          "max_response_time": "300ms",
          "success_rate_min": "99.5%"
        },
        "assistive_technology_support": {
          "user_agent_patterns": [
            "NVDA*", "JAWS*", "VoiceOver*", "TalkBack*",
            "Dragon*", "accessibility-insights*", "axe-core*"
          ],
          "priority_routing": true,
          "cache_optimization": true
        }
      }
    }
---
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: cdn-accessibility-alerts
  namespace: worktracker
spec:
  groups:
  - name: cdn.accessibility
    rules:
    - alert: AccessibilityAssetHighLatency
      expr: histogram_quantile(0.95, rate(cdn_request_duration_seconds_bucket{path=~"/accessibility/.*"}[5m])) > 0.2
      for: 2m
      labels:
        severity: warning
        component: cdn
        impact: accessibility
      annotations:
        summary: "High latency for accessibility assets"
        description: "95th percentile response time for accessibility assets is {{ $value }}s"
        
    - alert: ScreenReaderUserExperience
      expr: rate(cdn_requests_total{user_agent=~".*NVDA.*|.*JAWS.*|.*VoiceOver.*", status_code!~"2.*"}[5m]) > 0.05
      for: 1m
      labels:
        severity: critical
        component: cdn
        impact: accessibility
      annotations:
        summary: "Screen reader users experiencing errors"
        description: "{{ $value }} error rate for screen reader users in the last 5 minutes"
        
    - alert: AccessibilityToolBlocked
      expr: increase(waf_blocked_requests_total{user_agent=~".*accessibility.*|.*axe.*|.*wave.*|.*pa11y.*"}[5m]) > 0
      for: 30s
      labels:
        severity: critical
        component: waf
        impact: accessibility_testing
      annotations:
        summary: "Accessibility testing tools blocked by WAF"
        description: "{{ $value }} accessibility testing requests blocked"
        
    - alert: AccessibilityAssetUnavailable
      expr: up{job="cdn-accessibility-assets"} == 0
      for: 1m
      labels:
        severity: critical
        component: cdn
        impact: accessibility
      annotations:
        summary: "Accessibility assets endpoint is down"
        description: "CDN accessibility assets endpoint has been down for more than 1 minute"
```

#### Task 3.2: Prometheus Setup
```yaml
# monitoring/prometheus/
├── prometheus-config.yaml
├── alertmanager-config.yaml
├── grafana-dashboards/
│   ├── infrastructure.json
│   ├── kubernetes.json
│   └── application.json
└── alert-rules/
    ├── infrastructure.yml
    └── application.yml
```

#### Task 3.2: Logging Infrastructure
```yaml
# logging/elasticsearch/
├── elasticsearch-cluster.yaml
├── logstash-config.yaml
├── kibana-setup.yaml
└── fluent-bit-config.yaml
```

#### Task 3.3: Custom Dashboards
- **Infrastructure Health**: CPU, memory, disk, network
- **Kubernetes Metrics**: Pod status, resource usage, events
- **Application Performance**: Response times, error rates, throughput
- **Security Metrics**: Failed logins, policy violations, vulnerabilities

## Security Requirements

### 1. Infrastructure Security
- **Network Segmentation**: Zero-trust network architecture
- **Encryption**: All data encrypted in transit and at rest
- **Access Control**: RBAC with least privilege principle
- **Compliance**: SOC2, ISO27001 compliance frameworks

### 2. DevOps Security
- **Secret Management**: Azure Key Vault integration
- **Image Security**: Signed and scanned container images
- **Pipeline Security**: Secure CI/CD with approval gates
- **Audit Logging**: Complete audit trail of all changes

## Performance Requirements

### 1. Scalability Targets
- **Auto-scaling**: HPA and VPA based on metrics
- **Load Handling**: 10,000 concurrent users
- **Response Times**: < 500ms API responses
- **Availability**: 99.9% uptime SLA

### 2. Resource Optimization
- **Right-sizing**: Continuous resource optimization
- **Cost Management**: Budget alerts and optimization
- **Performance Monitoring**: Real-time performance metrics
- **Capacity Planning**: Predictive scaling based on trends

## Deliverables

### Infrastructure Deliverables
1. **Terraform Modules**: Complete IaC for all environments
2. **Kubernetes Manifests**: Application deployment configurations
3. **CI/CD Pipelines**: Automated build, test, and deployment
4. **Monitoring Stack**: Complete observability solution
5. **Security Framework**: Comprehensive security implementation

### Documentation Deliverables
1. **Infrastructure Architecture**: Complete system diagrams
2. **Deployment Guides**: Step-by-step deployment instructions
3. **Runbooks**: Operational procedures and troubleshooting
4. **Security Procedures**: Security policies and incident response
5. **Disaster Recovery**: Backup and recovery procedures

## Dependencies

### From Other Agents
- **Backend Agent**: Application requirements and configurations
- **Database Agent**: Database schema and performance requirements
- **Security Agent**: Security policies and compliance requirements
- **Frontend Agent**: CDN and static asset hosting requirements

### Provides to Other Agents
- **Database Endpoints**: Connection strings and credentials
- **Container Registry**: Image repository access
- **Monitoring Access**: Grafana and Kibana endpoints
- **CI/CD Integration**: Pipeline hooks and deployment triggers

## Quality Gates

### Infrastructure Quality
- [ ] Terraform plan executes without errors
- [ ] All security scans pass (no high/critical vulnerabilities)
- [ ] Performance tests meet SLA requirements
- [ ] Disaster recovery procedures tested successfully
- [ ] All monitoring and alerting functional

### Operational Readiness
- [ ] Complete documentation provided
- [ ] Runbooks tested and validated
- [ ] Team training completed
- [ ] Support procedures established
- [ ] Incident response plan activated

## Success Metrics

### Technical Metrics
- **Deployment Success Rate**: 99% successful deployments
- **Infrastructure Uptime**: 99.9% availability
- **Security Posture**: Zero critical vulnerabilities
- **Performance**: All SLA targets met
- **Cost Efficiency**: Within budget constraints

### Operational Metrics
- **Incident Response**: < 15 minutes detection to response
- **Recovery Time**: < 4 hours for disaster recovery
- **Documentation Coverage**: 100% of procedures documented
- **Team Readiness**: All team members trained and certified

## Communication Protocol

### Daily Updates
- Infrastructure health status
- Active deployments and changes
- Issues and blockers
- Resource utilization metrics

### Weekly Reports
- Progress against milestones
- Performance and cost metrics
- Security posture updates
- Capacity planning recommendations

### Escalation Procedures
- **Performance Issues**: Immediate escalation to Master Orchestrator
- **Security Incidents**: Direct escalation to Security Agent
- **Dependency Blocks**: Coordinate with dependent agents
- **Resource Constraints**: Budget and capacity escalations

---

*The Infrastructure Agent is responsible for creating the foundation that enables all other agents to deliver their components effectively and securely.*
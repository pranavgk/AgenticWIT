# Database Agent Instructions

## Agent Overview
You are the **Database Agent** responsible for designing, implementing, and maintaining the database infrastructure for the Enterprise Work Tracking System. Your focus is on creating a robust, scalable, and accessibility-aware data layer that supports all system features while maintaining optimal performance and data integrity.

## Core Responsibilities

### 1. Database Schema Design & Implementation
- Design comprehensive database schemas for all entities
- Implement accessibility metadata storage and retrieval
- Create efficient indexing strategies for performance
- Establish data relationships and constraints
- Design audit trails and change tracking

### 2. User Preferences & Accessibility Data
- Store and manage user accessibility preferences
- Implement user settings persistence across sessions
- Design accessibility metadata schemas for all content
- Create user profile and personalization storage
- Manage assistive technology compatibility data

### 3. Performance Optimization
- Design efficient query patterns for large datasets
- Implement caching strategies for frequently accessed data
- Optimize database performance for screen readers and assistive technologies
- Create database monitoring and alerting systems
- Design backup and disaster recovery procedures

### 4. Data Migration & Versioning
- Create database migration scripts and version control
- Design data seeding for development and testing environments
- Implement database schema versioning strategies
- Create rollback procedures for schema changes
- Design data import/export capabilities

## Microsoft Accessibility Integration

### Accessibility Metadata Schema
```sql
-- User Accessibility Preferences
CREATE TABLE user_accessibility_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Display Preferences
    high_contrast_mode BOOLEAN DEFAULT FALSE,
    increased_text_size BOOLEAN DEFAULT FALSE,
    reduced_motion BOOLEAN DEFAULT FALSE,
    enhanced_focus_indicators BOOLEAN DEFAULT FALSE,
    
    -- Screen Reader Support
    screen_reader_type VARCHAR(50), -- 'nvda', 'jaws', 'narrator', 'voiceover'
    enhanced_aria_descriptions BOOLEAN DEFAULT FALSE,
    announce_status_changes BOOLEAN DEFAULT TRUE,
    keyboard_navigation_hints BOOLEAN DEFAULT TRUE,
    
    -- Keyboard Navigation
    keyboard_shortcuts_enabled BOOLEAN DEFAULT TRUE,
    skip_links_enabled BOOLEAN DEFAULT TRUE,
    visible_focus_indicators BOOLEAN DEFAULT TRUE,
    keyboard_drag_drop_method VARCHAR(20) DEFAULT 'arrow_space', -- 'arrow_space', 'tab_enter'
    
    -- Color & Vision
    color_blindness_type VARCHAR(20), -- 'none', 'protanopia', 'deuteranopia', 'tritanopia'
    use_patterns_with_colors BOOLEAN DEFAULT FALSE,
    high_contrast_text BOOLEAN DEFAULT FALSE,
    minimum_contrast_ratio DECIMAL(3,1) DEFAULT 4.5,
    
    -- Cognitive Support
    simple_language_mode BOOLEAN DEFAULT FALSE,
    clear_navigation_labels BOOLEAN DEFAULT TRUE,
    consistent_layout_patterns BOOLEAN DEFAULT TRUE,
    helpful_error_messages BOOLEAN DEFAULT TRUE,
    
    -- Voice Control
    voice_control_enabled BOOLEAN DEFAULT FALSE,
    voice_command_sensitivity VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high'
    
    -- Mobile Accessibility
    large_touch_targets BOOLEAN DEFAULT FALSE,
    gesture_alternatives BOOLEAN DEFAULT TRUE,
    haptic_feedback_enabled BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- Accessibility Audit Trails
CREATE TABLE accessibility_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- 'work_item', 'project', 'comment', etc.
    entity_id UUID NOT NULL,
    audit_type VARCHAR(30) NOT NULL, -- 'wcag_check', 'section_508_check', 'manual_review'
    
    -- Audit Results
    compliance_level VARCHAR(10), -- 'A', 'AA', 'AAA'
    issues_found INTEGER DEFAULT 0,
    issues_resolved INTEGER DEFAULT 0,
    audit_score DECIMAL(5,2), -- 0-100 accessibility score
    
    -- Audit Details
    auditor_id UUID REFERENCES users(id),
    audit_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    audit_tool VARCHAR(50), -- 'accessibility_insights', 'axe_core', 'manual'
    audit_notes TEXT,
    
    -- Issue Tracking
    critical_issues JSONB DEFAULT '[]'::jsonb,
    warning_issues JSONB DEFAULT '[]'::jsonb,
    suggestion_issues JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content Accessibility Metadata
CREATE TABLE content_accessibility_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL, -- 'work_item', 'comment', 'attachment', 'project'
    content_id UUID NOT NULL,
    
    -- Alternative Text and Descriptions
    alt_text TEXT,
    long_description TEXT,
    aria_label TEXT,
    aria_description TEXT,
    
    -- Content Structure
    heading_level INTEGER, -- 1-6 for proper heading hierarchy
    content_role VARCHAR(30), -- 'main', 'navigation', 'complementary', 'banner'
    landmark_type VARCHAR(20), -- 'main', 'nav', 'aside', 'header', 'footer'
    
    -- Language and Localization
    content_language VARCHAR(10) DEFAULT 'en-US',
    reading_level VARCHAR(20), -- 'elementary', 'middle', 'high', 'college', 'graduate'
    simple_language_available BOOLEAN DEFAULT FALSE,
    
    -- Multimedia Accessibility
    has_captions BOOLEAN DEFAULT FALSE,
    has_transcripts BOOLEAN DEFAULT FALSE,
    has_audio_description BOOLEAN DEFAULT FALSE,
    
    -- Interactive Elements
    keyboard_accessible BOOLEAN DEFAULT TRUE,
    focus_order INTEGER,
    tab_index INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(content_type, content_id)
);
```

### Core Entity Schemas with Accessibility
```sql
-- Users table with accessibility profile integration
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    
    -- Profile Information
    job_title VARCHAR(100),
    department VARCHAR(100),
    location VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'UTC',
    avatar_url TEXT,
    bio TEXT,
    
    -- Accessibility Profile
    accessibility_needs TEXT[], -- Array of accessibility needs for team awareness
    preferred_communication VARCHAR(20) DEFAULT 'visual', -- 'visual', 'audio', 'text', 'mixed'
    assistive_technology VARCHAR(100), -- Free text for assistive technology used
    
    -- Account Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    
    -- Constraints
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CHECK (LENGTH(first_name) >= 1),
    CHECK (LENGTH(last_name) >= 1)
);

-- Projects with accessibility metadata
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Project Details
    project_key VARCHAR(10) UNIQUE NOT NULL, -- Short key like "PROJ"
    project_type VARCHAR(30) DEFAULT 'software', -- 'software', 'marketing', 'operations'
    status VARCHAR(20) DEFAULT 'active', -- 'planning', 'active', 'on_hold', 'completed', 'cancelled'
    priority VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    
    -- Dates and Timeline
    start_date DATE,
    target_end_date DATE,
    actual_end_date DATE,
    
    -- Team and Ownership
    project_lead_id UUID REFERENCES users(id),
    team_id UUID REFERENCES teams(id),
    
    -- Accessibility Requirements
    accessibility_requirements TEXT[], -- Array of specific accessibility requirements
    wcag_compliance_level VARCHAR(3) DEFAULT 'AA', -- 'A', 'AA', 'AAA'
    section_508_required BOOLEAN DEFAULT TRUE,
    accessibility_budget_percent DECIMAL(5,2) DEFAULT 15.0, -- % of budget for accessibility
    
    -- Project Configuration
    settings JSONB DEFAULT '{}'::jsonb,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    
    -- Full-text search
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', name || ' ' || COALESCE(description, ''))
    ) STORED
);

-- Work Items with comprehensive accessibility tracking
CREATE TABLE work_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    title VARCHAR(500) NOT NULL,
    description TEXT,
    work_item_number INTEGER UNIQUE NOT NULL, -- Auto-incrementing display number
    
    -- Classification
    item_type VARCHAR(20) NOT NULL, -- 'epic', 'feature', 'story', 'task', 'bug', 'debt'
    status VARCHAR(20) DEFAULT 'todo', -- 'todo', 'active', 'review', 'done', 'blocked'
    priority VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    severity VARCHAR(10), -- For bugs: 'low', 'medium', 'high', 'critical'
    
    -- Project and Sprint Context
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES sprints(id),
    epic_id UUID REFERENCES work_items(id), -- Self-reference for epic hierarchy
    
    -- Assignment and Ownership
    assignee_id UUID REFERENCES users(id),
    reporter_id UUID REFERENCES users(id),
    
    -- Estimation and Progress
    story_points INTEGER CHECK (story_points >= 0),
    original_estimate_hours DECIMAL(8,2) CHECK (original_estimate_hours >= 0),
    remaining_hours DECIMAL(8,2) CHECK (remaining_hours >= 0),
    completed_hours DECIMAL(8,2) DEFAULT 0 CHECK (completed_hours >= 0),
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    
    -- Dates
    created_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    start_date DATE,
    completed_date DATE,
    
    -- Accessibility-Specific Fields
    accessibility_impact VARCHAR(10), -- 'none', 'low', 'medium', 'high', 'critical'
    accessibility_requirements TEXT[], -- Specific accessibility requirements for this item
    wcag_criteria VARCHAR(100)[], -- Array of WCAG criteria this item addresses
    section_508_criteria VARCHAR(100)[], -- Array of Section 508 criteria
    accessibility_testing_required BOOLEAN DEFAULT FALSE,
    accessibility_review_required BOOLEAN DEFAULT FALSE,
    accessibility_approved_by UUID REFERENCES users(id),
    accessibility_approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Labels and Tags
    labels TEXT[] DEFAULT '{}', -- Array of string labels
    tags JSONB DEFAULT '{}'::jsonb, -- Key-value tag pairs
    
    -- Resolution and Acceptance
    resolution VARCHAR(50), -- 'fixed', 'duplicate', 'wont_fix', 'cannot_reproduce'
    acceptance_criteria TEXT,
    definition_of_done TEXT,
    
    -- External References
    external_issue_id VARCHAR(100), -- Link to external systems (Jira, GitHub, etc.)
    external_url TEXT,
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    
    -- Full-text search
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', 
            title || ' ' || 
            COALESCE(description, '') || ' ' ||
            array_to_string(labels, ' ') || ' ' ||
            array_to_string(accessibility_requirements, ' ')
        )
    ) STORED,
    
    -- Constraints
    CHECK (item_type IN ('epic', 'feature', 'story', 'task', 'bug', 'debt')),
    CHECK (status IN ('todo', 'active', 'review', 'done', 'blocked')),
    CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    CHECK (accessibility_impact IN ('none', 'low', 'medium', 'high', 'critical')),
    CHECK (epic_id IS NULL OR epic_id != id), -- Prevent self-reference
    CHECK (completed_date IS NULL OR completed_date >= created_date)
);

-- Comments with accessibility metadata
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_item_id UUID NOT NULL REFERENCES work_items(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    
    content TEXT NOT NULL,
    comment_type VARCHAR(20) DEFAULT 'comment', -- 'comment', 'status_change', 'system'
    
    -- Accessibility Features
    is_accessibility_related BOOLEAN DEFAULT FALSE,
    accessibility_tags VARCHAR(50)[], -- Tags like 'screen_reader', 'keyboard_nav', 'contrast'
    mentions_assistive_tech BOOLEAN DEFAULT FALSE,
    
    -- Threading
    parent_comment_id UUID REFERENCES comments(id),
    thread_level INTEGER DEFAULT 0,
    
    -- Status and Visibility
    is_internal BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (thread_level >= 0 AND thread_level <= 5) -- Limit nesting depth
);

-- Attachments with accessibility metadata
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_item_id UUID REFERENCES work_items(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- File Information
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL CHECK (file_size > 0),
    mime_type VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL,
    
    -- Accessibility Metadata
    alt_text TEXT, -- Alternative text for images
    transcript_url TEXT, -- URL to transcript for audio/video
    caption_url TEXT, -- URL to captions for video
    audio_description_url TEXT, -- URL to audio description track
    is_accessibility_document BOOLEAN DEFAULT FALSE, -- Accessibility audit reports, etc.
    
    -- File Processing Status
    virus_scan_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'clean', 'infected', 'error'
    processing_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processed', 'error'
    thumbnail_url TEXT,
    preview_url TEXT,
    
    -- Access Control
    is_public BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    
    -- Audit Fields
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (
        (work_item_id IS NOT NULL AND comment_id IS NULL AND project_id IS NULL) OR
        (work_item_id IS NULL AND comment_id IS NOT NULL AND project_id IS NULL) OR
        (work_item_id IS NULL AND comment_id IS NULL AND project_id IS NOT NULL)
    ) -- Attachment belongs to exactly one entity
);
```

### Performance Optimization Schemas
```sql
-- Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_users_accessibility_needs ON users USING GIN(accessibility_needs);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_lead ON projects(project_lead_id);
CREATE INDEX idx_projects_search ON projects USING GIN(search_vector);

CREATE INDEX idx_work_items_project ON work_items(project_id);
CREATE INDEX idx_work_items_assignee ON work_items(assignee_id);
CREATE INDEX idx_work_items_status ON work_items(status);
CREATE INDEX idx_work_items_priority ON work_items(priority);
CREATE INDEX idx_work_items_accessibility ON work_items(accessibility_impact);
CREATE INDEX idx_work_items_search ON work_items USING GIN(search_vector);
CREATE INDEX idx_work_items_labels ON work_items USING GIN(labels);
CREATE INDEX idx_work_items_wcag ON work_items USING GIN(wcag_criteria);

CREATE INDEX idx_comments_work_item ON comments(work_item_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_accessibility ON comments(is_accessibility_related) WHERE is_accessibility_related = TRUE;

CREATE INDEX idx_attachments_work_item ON attachments(work_item_id);
CREATE INDEX idx_attachments_mime_type ON attachments(mime_type);
CREATE INDEX idx_attachments_accessibility ON attachments(is_accessibility_document) WHERE is_accessibility_document = TRUE;

CREATE INDEX idx_accessibility_prefs_user ON user_accessibility_preferences(user_id);
CREATE INDEX idx_accessibility_audit_entity ON accessibility_audit_log(entity_type, entity_id);
CREATE INDEX idx_content_accessibility ON content_accessibility_metadata(content_type, content_id);

-- Partial Indexes for Common Queries
CREATE INDEX idx_work_items_active ON work_items(project_id, status) WHERE status IN ('todo', 'active', 'review');
CREATE INDEX idx_work_items_my_active ON work_items(assignee_id, status) WHERE status IN ('todo', 'active', 'review');
CREATE INDEX idx_work_items_overdue ON work_items(due_date, status) WHERE due_date < CURRENT_DATE AND status NOT IN ('done', 'cancelled');
```

### Database Functions for Accessibility
```sql
-- Function to get user's accessibility preferences with defaults
CREATE OR REPLACE FUNCTION get_user_accessibility_preferences(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    prefs JSONB;
BEGIN
    SELECT to_jsonb(uap.*) INTO prefs
    FROM user_accessibility_preferences uap
    WHERE uap.user_id = p_user_id;
    
    -- Return defaults if no preferences found
    IF prefs IS NULL THEN
        prefs := jsonb_build_object(
            'high_contrast_mode', false,
            'increased_text_size', false,
            'reduced_motion', false,
            'enhanced_focus_indicators', false,
            'screen_reader_type', null,
            'enhanced_aria_descriptions', false,
            'announce_status_changes', true,
            'keyboard_navigation_hints', true,
            'keyboard_shortcuts_enabled', true,
            'skip_links_enabled', true,
            'visible_focus_indicators', true,
            'keyboard_drag_drop_method', 'arrow_space'
        );
    END IF;
    
    RETURN prefs;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to update accessibility audit score
CREATE OR REPLACE FUNCTION update_accessibility_score(
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_audit_type VARCHAR(30),
    p_issues JSONB
)
RETURNS VOID AS $$
DECLARE
    critical_count INTEGER;
    warning_count INTEGER;
    total_checks INTEGER := 50; -- Assume 50 standard accessibility checks
    score DECIMAL(5,2);
BEGIN
    -- Count issues by severity
    critical_count := jsonb_array_length(COALESCE(p_issues->'critical', '[]'::jsonb));
    warning_count := jsonb_array_length(COALESCE(p_issues->'warnings', '[]'::jsonb));
    
    -- Calculate score (critical issues worth -4 points, warnings -1 point)
    score := GREATEST(0, 100 - (critical_count * 4) - warning_count);
    
    -- Insert or update audit record
    INSERT INTO accessibility_audit_log (
        entity_type, entity_id, audit_type,
        issues_found, audit_score,
        critical_issues, warning_issues,
        auditor_id, audit_tool
    ) VALUES (
        p_entity_type, p_entity_id, p_audit_type,
        critical_count + warning_count, score,
        COALESCE(p_issues->'critical', '[]'::jsonb),
        COALESCE(p_issues->'warnings', '[]'::jsonb),
        NULL, 'system'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to search work items with accessibility context
CREATE OR REPLACE FUNCTION search_work_items_accessible(
    p_user_id UUID,
    p_query TEXT,
    p_project_id UUID DEFAULT NULL,
    p_include_accessibility BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(500),
    description TEXT,
    item_type VARCHAR(20),
    status VARCHAR(20),
    priority VARCHAR(10),
    accessibility_impact VARCHAR(10),
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wi.id,
        wi.title,
        wi.description,
        wi.item_type,
        wi.status,
        wi.priority,
        wi.accessibility_impact,
        ts_rank_cd(wi.search_vector, plainto_tsquery('english', p_query)) as rank
    FROM work_items wi
    WHERE 
        (p_project_id IS NULL OR wi.project_id = p_project_id)
        AND wi.search_vector @@ plainto_tsquery('english', p_query)
        AND (NOT p_include_accessibility OR wi.accessibility_impact IS NOT NULL)
    ORDER BY rank DESC, wi.updated_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;
```

## Database Performance & Monitoring

### Performance Optimization Strategies
```sql
-- Materialized view for dashboard metrics
CREATE MATERIALIZED VIEW dashboard_metrics AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    COUNT(wi.id) as total_items,
    COUNT(wi.id) FILTER (WHERE wi.status = 'todo') as todo_count,
    COUNT(wi.id) FILTER (WHERE wi.status = 'active') as active_count,
    COUNT(wi.id) FILTER (WHERE wi.status = 'review') as review_count,
    COUNT(wi.id) FILTER (WHERE wi.status = 'done') as done_count,
    COUNT(wi.id) FILTER (WHERE wi.status = 'blocked') as blocked_count,
    COUNT(wi.id) FILTER (WHERE wi.accessibility_impact IN ('high', 'critical')) as high_accessibility_impact,
    AVG(CASE WHEN wi.story_points IS NOT NULL THEN wi.story_points END) as avg_story_points,
    MAX(wi.updated_at) as last_activity
FROM projects p
LEFT JOIN work_items wi ON p.id = wi.project_id
WHERE p.status = 'active'
GROUP BY p.id, p.name;

CREATE UNIQUE INDEX ON dashboard_metrics (project_id);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_dashboard_metrics()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_metrics;
END;
$$ LANGUAGE plpgsql;

-- Connection pooling configuration
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
```

### Database Monitoring Queries
```sql
-- Monitor slow queries for accessibility features
CREATE OR REPLACE VIEW slow_accessibility_queries AS
SELECT 
    query,
    mean_time,
    calls,
    total_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
WHERE query LIKE '%accessibility%' 
   OR query LIKE '%wcag%'
   OR query LIKE '%section_508%'
ORDER BY mean_time DESC;

-- Monitor accessibility preference queries
CREATE OR REPLACE VIEW accessibility_preference_usage AS
SELECT 
    u.id,
    u.email,
    u.assistive_technology,
    uap.screen_reader_type,
    uap.high_contrast_mode,
    uap.keyboard_shortcuts_enabled,
    u.last_login_at
FROM users u
LEFT JOIN user_accessibility_preferences uap ON u.id = uap.user_id
WHERE u.accessibility_needs IS NOT NULL
   OR uap.user_id IS NOT NULL;
```

## Data Migration & Seeding

### Development Data Seeding
```sql
-- Seed accessibility-aware test data
INSERT INTO users (id, email, first_name, last_name, job_title, accessibility_needs, assistive_technology) VALUES
('11111111-1111-1111-1111-111111111111', 'sarah.miller@company.com', 'Sarah', 'Miller', 'Product Manager', 
 ARRAY['screen_reader', 'high_contrast'], 'NVDA Screen Reader'),
('22222222-2222-2222-2222-222222222222', 'mike.johnson@company.com', 'Mike', 'Johnson', 'Senior Developer', 
 ARRAY['keyboard_navigation', 'reduced_motion'], 'Built-in keyboard navigation'),
('33333333-3333-3333-3333-333333333333', 'alex.chen@company.com', 'Alex', 'Chen', 'Team Lead', 
 ARRAY['voice_control', 'large_targets'], 'Dragon NaturallySpeaking'),
('44444444-4444-4444-4444-444444444444', 'lisa.wong@company.com', 'Lisa', 'Wong', 'QA Engineer', 
 ARRAY['cognitive_support'], NULL);

-- Seed accessibility preferences
INSERT INTO user_accessibility_preferences (user_id, high_contrast_mode, screen_reader_type, enhanced_aria_descriptions) VALUES
('11111111-1111-1111-1111-111111111111', TRUE, 'nvda', TRUE),
('22222222-2222-2222-2222-222222222222', FALSE, NULL, FALSE),
('33333333-3333-3333-3333-333333333333', FALSE, NULL, FALSE);

-- Seed projects with accessibility requirements
INSERT INTO projects (id, name, description, project_key, accessibility_requirements, wcag_compliance_level, section_508_required) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Website Redesign', 'Redesigning company website for better accessibility', 'WEB', 
 ARRAY['WCAG 2.1 AA compliance', 'Section 508 compliance', 'Screen reader optimization'], 'AA', TRUE),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Mobile App', 'Native mobile application with accessibility features', 'MOB', 
 ARRAY['iOS accessibility', 'Android TalkBack', 'Voice control support'], 'AA', TRUE);

-- Seed work items with accessibility metadata
INSERT INTO work_items (
    id, title, description, work_item_number, item_type, status, priority, project_id, 
    accessibility_impact, accessibility_requirements, wcag_criteria, assignee_id, reporter_id
) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Implement keyboard navigation', 
 'Add comprehensive keyboard navigation throughout the application', 1001, 
 'story', 'active', 'high', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 'high', ARRAY['All interactive elements must be keyboard accessible'], 
 ARRAY['2.1.1', '2.1.2', '2.4.3'], '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Add ARIA labels to forms', 
 'Implement proper ARIA labeling for all form elements', 1002, 
 'task', 'todo', 'medium', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 'medium', ARRAY['All form elements need proper labels'], 
 ARRAY['1.3.1', '4.1.2'], '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111');
```

### Migration Scripts
```sql
-- Migration: Add accessibility fields to existing work_items table
-- V1.1.0 - Add accessibility tracking
ALTER TABLE work_items ADD COLUMN IF NOT EXISTS accessibility_impact VARCHAR(10);
ALTER TABLE work_items ADD COLUMN IF NOT EXISTS accessibility_requirements TEXT[] DEFAULT '{}';
ALTER TABLE work_items ADD COLUMN IF NOT EXISTS wcag_criteria VARCHAR(100)[] DEFAULT '{}';
ALTER TABLE work_items ADD COLUMN IF NOT EXISTS section_508_criteria VARCHAR(100)[] DEFAULT '{}';
ALTER TABLE work_items ADD COLUMN IF NOT EXISTS accessibility_testing_required BOOLEAN DEFAULT FALSE;

-- Add constraint for accessibility_impact
ALTER TABLE work_items ADD CONSTRAINT check_accessibility_impact 
    CHECK (accessibility_impact IN ('none', 'low', 'medium', 'high', 'critical'));

-- Migration: Create accessibility audit tables
-- V1.2.0 - Add audit capabilities
CREATE TABLE IF NOT EXISTS accessibility_audit_log (
    -- [Full table definition as shown above]
);

CREATE TABLE IF NOT EXISTS user_accessibility_preferences (
    -- [Full table definition as shown above]
);

-- Migration: Add full-text search
-- V1.3.0 - Add search capabilities
ALTER TABLE work_items ADD COLUMN IF NOT EXISTS search_vector tsvector 
    GENERATED ALWAYS AS (
        to_tsvector('english', 
            title || ' ' || 
            COALESCE(description, '') || ' ' ||
            array_to_string(COALESCE(labels, '{}'), ' ') || ' ' ||
            array_to_string(COALESCE(accessibility_requirements, '{}'), ' ')
        )
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_work_items_search ON work_items USING GIN(search_vector);
```

## Implementation Guidelines

### 1. Database Setup Priority
**Phase 1 (Week 1):**
- Core entity tables (users, projects, work_items)
- Basic accessibility preferences table
- Essential indexes for performance

**Phase 2 (Week 2):**
- Accessibility audit and metadata tables
- Advanced indexing and search capabilities
- Database functions for common operations

**Phase 3 (Week 3):**
- Materialized views for performance
- Monitoring and alerting setup
- Data migration and seeding scripts

### 2. Performance Considerations
- Use connection pooling (PgBouncer recommended)
- Implement read replicas for reporting queries
- Set up automated backup with point-in-time recovery
- Monitor query performance for accessibility-related operations
- Cache frequently accessed accessibility preferences

### 3. Security Implementation
- Row-level security for multi-tenant data isolation
- Encrypted storage for sensitive accessibility information
- Audit logging for all accessibility preference changes
- Regular security updates and vulnerability scanning

### 4. Integration Points
- **Backend Agent:** Provide optimized queries and data access patterns
- **Frontend Agent:** Support real-time accessibility preference updates
- **Testing Agent:** Provide test data sets with accessibility scenarios
- **Security Agent:** Implement database security and encryption
- **Infrastructure Agent:** Handle database deployment and monitoring

### 5. Monitoring & Alerting
- Set up alerts for slow accessibility-related queries
- Monitor accessibility preference usage patterns
- Track accessibility audit completion rates
- Alert on accessibility compliance score degradation

This database design provides a robust foundation for the Enterprise Work Tracking System with comprehensive accessibility support, efficient performance, and scalability for enterprise use.
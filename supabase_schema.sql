-- ============================================================
-- REVERSE ENGINEER THIS — RAS DIGITAL ARENA
-- Production PostgreSQL / Supabase Migration Schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Competition Configuration
CREATE TABLE IF NOT EXISTS event_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PAUSED', 'ACTIVE', 'COMPLETED')),
    title TEXT NOT NULL DEFAULT 'RAS DIGITAL ARENA 2026',
    max_teams INT NOT NULL DEFAULT 5,
    allow_reentry BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Participating Teams
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_number TEXT NOT NULL UNIQUE,
    team_name TEXT NOT NULL,
    access_code_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'ACTIVE', 'ELIMINATED', 'COMPLETED', 'DISQUALIFIED')),
    active_session_id UUID,
    total_score INT NOT NULL DEFAULT 0,
    total_time_ms BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Team Sessions
CREATE TABLE IF NOT EXISTS team_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    session_token_hash TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'ELIMINATED', 'RESUMED', 'COMPLETED')),
    client_ip TEXT,
    user_agent TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    eliminated_at TIMESTAMPTZ,
    resumed_at TIMESTAMPTZ,
    current_route TEXT DEFAULT '/arena',
    current_challenge_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Challenge Definitions
CREATE TABLE IF NOT EXISTS challenge_definitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    max_points INT NOT NULL,
    duration_seconds INT NOT NULL,
    unlock_requirement TEXT
);

-- 5. Team Challenge Instances
CREATE TABLE IF NOT EXISTS challenge_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id TEXT NOT NULL REFERENCES challenge_definitions(id),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    seed TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'LOCKED' CHECK (status IN ('LOCKED', 'AVAILABLE', 'READY', 'ACTIVE', 'COMPLETED', 'TIMEOUT', 'ABANDONED')),
    server_solution_payload JSONB NOT NULL,
    current_stage INT NOT NULL DEFAULT 1,
    started_at TIMESTAMPTZ,
    deadline_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    abandoned_at TIMESTAMPTZ,
    duration_ms BIGINT,
    score_earned INT NOT NULL DEFAULT 0,
    hints_used INT NOT NULL DEFAULT 0,
    attempts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Stage Progress (Z3 & Z4)
CREATE TABLE IF NOT EXISTS challenge_stage_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_instance_id UUID NOT NULL REFERENCES challenge_instances(id) ON DELETE CASCADE,
    stage_number INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'SOLVED', 'FAILED', 'SKIPPED')),
    score_earned INT NOT NULL DEFAULT 0,
    attempts INT NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Score Events (Append-only Ledger)
CREATE TABLE IF NOT EXISTS score_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    challenge_id TEXT REFERENCES challenge_definitions(id),
    stage_number INT,
    points_delta INT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('STAGE_SOLVE', 'CHALLENGE_SOLVE', 'HINT_PENALTY', 'WRONG_ATTEMPT', 'ADMIN_ADJUST', 'TIMEOUT_RESOLVE')),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Hint Usage
CREATE TABLE IF NOT EXISTS hint_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    challenge_instance_id UUID NOT NULL REFERENCES challenge_instances(id) ON DELETE CASCADE,
    hint_index INT NOT NULL,
    point_cost INT NOT NULL,
    hint_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Competition Violations
CREATE TABLE IF NOT EXISTS violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES team_sessions(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('TAB_HIDDEN', 'WINDOW_BLUR', 'SESSION_CONFLICT', 'RATE_LIMIT_EXCEEDED', 'UNAUTHORIZED_ACCESS')),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Continuation Codes
CREATE TABLE IF NOT EXISTS continuation_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    previous_session_id UUID NOT NULL REFERENCES team_sessions(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_by_admin TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'ADMIN',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Initial Data Seeding
-- ============================================================

INSERT INTO challenge_definitions (id, name, max_points, duration_seconds, unlock_requirement) VALUES
('z1', 'SIGNAL BREAKER', 50, 600, 'INITIAL'),
('z2', 'DEAD SIGNAL', 50, 600, 'INITIAL'),
('z3', 'LOGIC LOCK', 100, 600, 'INITIAL'),
('z4', 'BINARY VAULT', 200, 900, 'ANY_TWO_Z1_Z3'),
('z5', 'BLACK BOX', 200, 900, 'ANY_TWO_Z1_Z3')
ON CONFLICT (id) DO UPDATE SET 
    duration_seconds = EXCLUDED.duration_seconds;

INSERT INTO teams (team_number, team_name, access_code_hash) VALUES
('01', 'anything', 'RAS-8K2P'),
('02', 'questers', 'RAS-3M7X'),
('03', 'milton', 'RAS-9Q4V'),
('04', 'rocket', 'RAS-5T1L'),
('05', 'meowmewo', 'RAS-2W8Z')
ON CONFLICT (team_number) DO UPDATE SET 
    team_name = EXCLUDED.team_name,
    access_code_hash = EXCLUDED.access_code_hash;

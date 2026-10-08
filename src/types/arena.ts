export type TeamStatus = 'WAITING' | 'ACTIVE' | 'ELIMINATED' | 'COMPLETED' | 'DISQUALIFIED';
export type SessionStatus = 'ACTIVE' | 'PAUSED' | 'ELIMINATED' | 'RESUMED' | 'COMPLETED';
export type ChallengeId = 'z1' | 'z2' | 'z3' | 'z4' | 'z5';

export type ChallengeStatus = 
  | 'LOCKED' 
  | 'AVAILABLE' 
  | 'INTRO' 
  | 'ACTIVE' 
  | 'COMPLETED' 
  | 'TIMEOUT' 
  | 'ABANDONED';

export interface Team {
  id: string;
  team_number: string;
  team_name: string;
  access_code: string;
  status: TeamStatus;
  active_session_id?: string;
  total_score: number;
  total_time_ms: number;
  created_at: string;
}

export interface TeamSession {
  id: string;
  team_id: string;
  team_number: string;
  team_name: string;
  status: SessionStatus;
  started_at: string;
  last_seen_at: string;
  eliminated_at?: string;
  resumed_at?: string;
  current_route: string;
  current_challenge_id?: string;
  created_at: string;
}

export interface ChallengeMetadata {
  id: ChallengeId;
  name: string;
  tagline: string;
  points: number;
  durationMinutes: number;
  durationSeconds: number;
  description: string;
  skills: string[];
}

export interface ChallengeInstance {
  id: string;
  challenge_id: ChallengeId;
  team_id: string;
  status: ChallengeStatus;
  current_stage: number;
  started_at?: string;
  deadline_at?: string;
  completed_at?: string;
  abandoned_at?: string;
  duration_ms?: number;
  score_earned: number;
  hints_used: number;
  attempts: number;
}

export interface ScoreEvent {
  id: string;
  team_id: string;
  challenge_id?: ChallengeId;
  stage_number?: number;
  points_delta: number;
  event_type: 'STAGE_SOLVE' | 'CHALLENGE_SOLVE' | 'HINT_PENALTY' | 'WRONG_ATTEMPT' | 'ADMIN_ADJUST' | 'TIMEOUT_RESOLVE';
  reason: string;
  created_at: string;
}

export interface HintRecord {
  id: string;
  team_id: string;
  challenge_id: ChallengeId;
  hint_index: number;
  point_cost: number;
  hint_text: string;
  created_at: string;
}

export interface ViolationRecord {
  id: string;
  team_id: string;
  session_id: string;
  type: 'TAB_HIDDEN' | 'SESSION_CONFLICT' | 'INVALID_SUBMISSION' | 'ADMIN_FORCE';
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ContinuationCodeRecord {
  id: string;
  code: string;
  team_id: string;
  previous_session_id: string;
  expires_at: string;
  used_at?: string;
  created_by_admin: string;
  created_at: string;
}

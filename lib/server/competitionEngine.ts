import fs from "fs";
import path from "path";
import { getSupabaseServerClient } from "../supabase/server";
import {
  Team,
  TeamSession,
  ChallengeInstance,
  ChallengeId,
  ScoreEvent,
  HintRecord,
  ViolationRecord,
  ContinuationCodeRecord,
} from "@/types/arena";
import {
  generateZ1,
  generateZ2,
  generateZ3,
  generateZ4,
  generateZ5,
} from "../challenges/seedGenerator";

const isServerless = Boolean(
  process.env.NETLIFY ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.VERCEL
);
const DATA_DIR = isServerless
  ? path.join(process.env.TMPDIR || "/tmp", ".data")
  : path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "competition_state.json");

interface CompetitionStore {
  teams: Record<string, Team>;
  sessions: Record<string, TeamSession>;
  challenges: Record<string, Record<ChallengeId, ChallengeInstance>>;
  scoreEvents: ScoreEvent[];
  hints: HintRecord[];
  violations: ViolationRecord[];
  continuationCodes: Record<string, ContinuationCodeRecord>;
  adminTokens: Set<string>;
}

// Initial 5 Provisioned Competition Teams (Universal Code IEEE)
const INITIAL_TEAMS: Team[] = [
  {
    id: "team-01",
    team_number: "01",
    team_name: "anything",
    access_code: "IEEE",
    status: "WAITING",
    total_score: 0,
    total_time_ms: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: "team-02",
    team_number: "02",
    team_name: "questers",
    access_code: "IEEE",
    status: "WAITING",
    total_score: 0,
    total_time_ms: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: "team-03",
    team_number: "03",
    team_name: "milton",
    access_code: "IEEE",
    status: "WAITING",
    total_score: 0,
    total_time_ms: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: "team-04",
    team_number: "04",
    team_name: "rocket",
    access_code: "IEEE",
    status: "WAITING",
    total_score: 0,
    total_time_ms: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: "team-05",
    team_number: "05",
    team_name: "meowmewo",
    access_code: "IEEE",
    status: "WAITING",
    total_score: 0,
    total_time_ms: 0,
    created_at: new Date().toISOString(),
  },
];

const CHALLENGE_DURATIONS: Record<ChallengeId, number> = {
  z1: 10 * 60, // 10 min
  z2: 10 * 60, // 10 min
  z3: 10 * 60, // 10 min
  z4: 15 * 60, // 15 min
  z5: 15 * 60, // 15 min
};

function createInitialChallenge(teamId: string, challengeId: ChallengeId): ChallengeInstance {
  const isInitiallyAvailable = challengeId === "z1" || challengeId === "z2" || challengeId === "z3";
  return {
    id: `${teamId}-${challengeId}`,
    challenge_id: challengeId,
    team_id: teamId,
    status: isInitiallyAvailable ? "AVAILABLE" : "LOCKED",
    current_stage: 1,
    score_earned: 0,
    hints_used: 0,
    attempts: 0,
  };
}

class CompetitionEngine {
  private store: CompetitionStore;

  constructor() {
    this.store = this.loadState();
  }

  private loadState(): CompetitionStore {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        return {
          ...parsed,
          adminTokens: new Set(parsed.adminTokens || []),
        };
      }
    } catch (e) {
      console.warn("Failed to read persistent state, initializing fresh store:", e);
    }

    const initialStore: CompetitionStore = {
      teams: {},
      sessions: {},
      challenges: {},
      scoreEvents: [],
      hints: [],
      violations: [],
      continuationCodes: {},
      adminTokens: new Set(),
    };

    INITIAL_TEAMS.forEach((t) => {
      initialStore.teams[t.id] = { ...t };
      initialStore.challenges[t.id] = {
        z1: createInitialChallenge(t.id, "z1"),
        z2: createInitialChallenge(t.id, "z2"),
        z3: createInitialChallenge(t.id, "z3"),
        z4: createInitialChallenge(t.id, "z4"),
        z5: createInitialChallenge(t.id, "z5"),
      };
    });

    this.saveState(initialStore);
    return initialStore;
  }

  private lastHydratedAt = 0;

  public async hydrateFromSupabaseAsync(force = false) {
    try {
      if (!force && Date.now() - this.lastHydratedAt < 2000) {
        return;
      }

      const client = getSupabaseServerClient();
      if (!client) return;

      const { data: storeRow } = await client
        .from("competition_store")
        .select("data")
        .eq("id", "live_state")
        .single();

      if (storeRow?.data) {
        const parsed = storeRow.data as CompetitionStore;
        this.store = {
          ...parsed,
          adminTokens: new Set(parsed.adminTokens || []),
        };
      }

      // Reconcile and merge with Supabase teams table so all registered teams are present
      const { data: teamsData, error } = await client.from("teams").select("*");
      if (!error && teamsData && teamsData.length > 0) {
        teamsData.forEach((row) => {
          const matchingTeam = Object.values(this.store.teams).find(
            (t) => t.team_number === row.team_number
          );
          if (matchingTeam) {
            if (typeof row.total_score === "number" && row.total_score > matchingTeam.total_score) {
              matchingTeam.total_score = row.total_score;
            }
            if (row.status) matchingTeam.status = row.status;
            if (row.team_name) matchingTeam.team_name = row.team_name;
          } else {
            const newTeamId = `team-${row.team_number}`;
            this.store.teams[newTeamId] = {
              id: newTeamId,
              team_number: row.team_number,
              team_name: row.team_name || `Team ${row.team_number}`,
              access_code: row.access_code_hash || "IEEE",
              status: row.status || "ACTIVE",
              total_score: row.total_score || 0,
              total_time_ms: 0,
              created_at: new Date().toISOString(),
            };
          }
        });
      }

      // Ensure all teams have challenge instances initialized
      Object.values(this.store.teams).forEach((t) => {
        if (!this.store.challenges[t.id]) {
          this.store.challenges[t.id] = {
            z1: createInitialChallenge(t.id, "z1"),
            z2: createInitialChallenge(t.id, "z2"),
            z3: createInitialChallenge(t.id, "z3"),
            z4: createInitialChallenge(t.id, "z4"),
            z5: createInitialChallenge(t.id, "z5"),
          };
        }
      });

      this.lastHydratedAt = Date.now();
    } catch {
      // Non-blocking
    }
  }

  public async saveStateAsync(customStore?: CompetitionStore) {
    try {
      const dataToSave = customStore || this.store;
      const serializable = {
        ...dataToSave,
        adminTokens: Array.from(dataToSave.adminTokens),
      };

      try {
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(serializable, null, 2), "utf-8");
      } catch {
        // Read-only filesystem fallback in serverless
      }

      const client = getSupabaseServerClient();
      if (client) {
        await client.from("competition_store").upsert(
          {
            id: "live_state",
            data: serializable,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
        await this.syncToSupabaseAsync(dataToSave);
      }
    } catch (e) {
      console.error("Failed to persist state:", e);
    }
  }

  private saveState(customStore?: CompetitionStore) {
    this.saveStateAsync(customStore).catch((e) =>
      console.error("Async saveState error:", e)
    );
  }

  private async syncToSupabaseAsync(customStore?: CompetitionStore) {
    try {
      const client = getSupabaseServerClient();
      if (!client) return;

      const store = customStore || this.store;
      const teams = Object.values(store.teams).map((t) => ({
        team_number: t.team_number,
        team_name: t.team_name,
        access_code_hash: t.access_code,
        status: t.status,
        total_score: t.total_score,
      }));

      const { error } = await client.from("teams").upsert(teams, { onConflict: "team_number" });
      if (error) {
        console.error("Supabase teams sync notice:", error.message);
      }
    } catch {
      // Non-blocking background sync notice
    }
  }

  // ============================================
  // OPEN TEAM REGISTRATION & AUTHENTICATION (CODE: IEEE)
  // ============================================
  public async authenticateTeam(teamNumber: string, teamName: string, accessCode: string) {
    await this.hydrateFromSupabaseAsync();
    const rawNumber = (teamNumber || "").trim();
    const normalizedNumber = /^\d$/.test(rawNumber) ? rawNumber.padStart(2, "0") : rawNumber;
    const strippedNumber = rawNumber.replace(/^0+/, "");
    const trimmedName = (teamName || "").trim();
    const normAccess = (accessCode || "").trim().toLowerCase();

    // Universal Access Code is "IEEE" (case-insensitive)
    let team = Object.values(this.store.teams).find(
      (t) =>
        t.team_number === normalizedNumber ||
        t.team_number === rawNumber ||
        (strippedNumber && t.team_number.replace(/^0+/, "") === strippedNumber) ||
        t.team_number.toLowerCase() === rawNumber.toLowerCase()
    );

    const isCodeValid =
      normAccess === "ieee" ||
      (team && team.access_code && team.access_code.trim().toLowerCase() === normAccess);

    if (!isCodeValid) {
      return {
        success: false,
        error: "Invalid access code. Please use 'IEEE' to register and enter the arena.",
      };
    }

    // Dynamic Team Registration: if team does not exist yet, register immediately!
    if (!team) {
      const safeId = `team-${normalizedNumber.toLowerCase().replace(/[^a-z0-9_-]/g, "") || Date.now()}`;
      team = {
        id: safeId,
        team_number: normalizedNumber,
        team_name: trimmedName || `Team ${normalizedNumber}`,
        access_code: "IEEE",
        status: "ACTIVE",
        total_score: 0,
        total_time_ms: 0,
        created_at: new Date().toISOString(),
      };
      this.store.teams[team.id] = team;
      this.store.challenges[team.id] = {
        z1: createInitialChallenge(team.id, "z1"),
        z2: createInitialChallenge(team.id, "z2"),
        z3: createInitialChallenge(team.id, "z3"),
        z4: createInitialChallenge(team.id, "z4"),
        z5: createInitialChallenge(team.id, "z5"),
      };
    } else {
      // Existing team: update name if provided and ensure access code is IEEE
      if (trimmedName) {
        team.team_name = trimmedName;
      }
      team.access_code = "IEEE";
      if (!this.store.challenges[team.id]) {
        this.store.challenges[team.id] = {
          z1: createInitialChallenge(team.id, "z1"),
          z2: createInitialChallenge(team.id, "z2"),
          z3: createInitialChallenge(team.id, "z3"),
          z4: createInitialChallenge(team.id, "z4"),
          z5: createInitialChallenge(team.id, "z5"),
        };
      }
      // Re-activate so participants can try freely
      if (team.status === "ELIMINATED" || team.status === "WAITING") {
        team.status = "ACTIVE";
      }
    }

    // Create session
    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const newSession: TeamSession = {
      id: sessionId,
      team_id: team.id,
      team_number: team.team_number,
      team_name: team.team_name,
      status: "ACTIVE",
      started_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      current_route: "/rivo-intro",
      created_at: new Date().toISOString(),
    };

    team.status = "ACTIVE";
    team.active_session_id = sessionId;
    this.store.sessions[sessionId] = newSession;

    // Immediately persist both state JSON and teams table to Supabase database!
    await this.saveStateAsync();

    return { success: true, session: newSession, team };
  }

  // ============================================
  // CONTINUATION CODE REDEMPTION (CASE-INSENSITIVE)
  // ============================================
  public async redeemContinuation(teamNumber: string, teamName: string, continuationCode: string) {
    await this.hydrateFromSupabaseAsync();
    const rawNumber = (teamNumber || "").trim();
    const paddedNumber = rawNumber.padStart(2, "0");
    const strippedNumber = rawNumber.replace(/^0+/, "");
    const normName = (teamName || "").trim().toLowerCase();
    const normCont = (continuationCode || "").trim().toLowerCase();

    const team = Object.values(this.store.teams).find(
      (t) =>
        t.team_number === paddedNumber ||
        t.team_number.replace(/^0+/, "") === strippedNumber
    );

    if (!team) {
      return { success: false, error: "Team Number not recognized." };
    }

    if (team.team_name.trim().toLowerCase() !== normName) {
      return { success: false, error: "Team Name mismatch." };
    }

    const codeRecord = Object.values(this.store.continuationCodes).find(
      (c) => c.code.trim().toLowerCase() === normCont && c.team_id === team.id
    );

    if (!codeRecord) {
      return { success: false, error: "Invalid continuation code." };
    }

    if (codeRecord.used_at) {
      return { success: false, error: "Continuation code has already been redeemed." };
    }

    if (new Date(codeRecord.expires_at).getTime() < Date.now()) {
      return { success: false, error: "Continuation code has expired." };
    }

    // Mark code as used
    codeRecord.used_at = new Date().toISOString();

    // Create restored session with exact prior progress
    const sessionId = `sess-resumed-${Date.now()}`;
    const restoredSession: TeamSession = {
      id: sessionId,
      team_id: team.id,
      team_number: team.team_number,
      team_name: team.team_name,
      status: "ACTIVE",
      started_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      resumed_at: new Date().toISOString(),
      current_route: "/arena",
      created_at: new Date().toISOString(),
    };

    team.status = "ACTIVE";
    team.active_session_id = sessionId;
    this.store.sessions[sessionId] = restoredSession;
    await this.saveStateAsync();

    return { success: true, session: restoredSession, team };
  }

  // ============================================
  // SESSION VALIDATION & HEARTBEAT
  // ============================================
  public getSession(sessionId: string): TeamSession | null {
    return this.store.sessions[sessionId] || null;
  }

  public heartbeat(sessionId: string, currentRoute: string) {
    const session = this.store.sessions[sessionId];
    if (!session) return { valid: false, error: "Session expired or invalid" };

    if (session.status === "ELIMINATED") {
      return { valid: false, status: "ELIMINATED" };
    }

    session.last_seen_at = new Date().toISOString();
    session.current_route = currentRoute;
    this.saveState();
    return { valid: true, status: session.status, team: this.store.teams[session.team_id] };
  }

  // ============================================
  // VIOLATION & ELIMINATION
  // ============================================
  public registerViolation(
    sessionId: string,
    type: 'TAB_HIDDEN' | 'SESSION_CONFLICT' | 'INVALID_SUBMISSION' | 'ADMIN_FORCE',
    metadata?: Record<string, unknown>
  ) {
    const session = this.store.sessions[sessionId];
    if (!session) return { success: false };

    const violation: ViolationRecord = {
      id: `viol-${Date.now()}`,
      team_id: session.team_id,
      session_id: sessionId,
      type,
      metadata,
      created_at: new Date().toISOString(),
    };

    this.store.violations.push(violation);

    // Mark session and team as ELIMINATED
    session.status = "ELIMINATED";
    session.eliminated_at = new Date().toISOString();

    const team = this.store.teams[session.team_id];
    if (team) {
      team.status = "ELIMINATED";
    }

    this.saveState();
    return { success: true, violation };
  }

  // ============================================
  // CHALLENGE STATE & UNLOCK CHECK
  // ============================================
  public getTeamChallenges(teamId: string) {
    if (!this.store.challenges[teamId]) {
      this.store.challenges[teamId] = {
        z1: createInitialChallenge(teamId, "z1"),
        z2: createInitialChallenge(teamId, "z2"),
        z3: createInitialChallenge(teamId, "z3"),
        z4: createInitialChallenge(teamId, "z4"),
        z5: createInitialChallenge(teamId, "z5"),
      };
    }
    const challenges = this.store.challenges[teamId];

    // Check Z4/Z5 unlock condition: Any 2 of Z1, Z2, Z3 completed
    const completedInitial = [challenges.z1, challenges.z2, challenges.z3].filter(
      (c) => c.status === "COMPLETED"
    ).length;

    if (completedInitial >= 2) {
      if (challenges.z4.status === "LOCKED") challenges.z4.status = "AVAILABLE";
      if (challenges.z5.status === "LOCKED") challenges.z5.status = "AVAILABLE";
    }

    this.saveState();
    return challenges;
  }

  public getChallenge(teamId: string, challengeId: ChallengeId): ChallengeInstance | null {
    const all = this.getTeamChallenges(teamId);
    return all ? all[challengeId] : null;
  }

  // Start challenge timer (when player clicks "I'M READY")
  public startChallenge(teamId: string, challengeId: ChallengeId) {
    const ch = this.getChallenge(teamId, challengeId);
    if (!ch) return { success: false, error: "Challenge not found" };

    if (ch.status === "COMPLETED" || ch.status === "ABANDONED") {
      return { success: false, error: "Challenge already concluded" };
    }

    if (ch.status === "LOCKED") {
      return { success: false, error: "Challenge is locked" };
    }

    const now = new Date();
    const duration = CHALLENGE_DURATIONS[challengeId];
    const deadline = new Date(now.getTime() + duration * 1000);

    ch.status = "ACTIVE";
    ch.started_at = ch.started_at || now.toISOString();
    ch.deadline_at = deadline.toISOString();

    this.saveState();

    return {
      success: true,
      challenge: ch,
      remainingSeconds: duration,
    };
  }

  // Abandon challenge (Preserve earned points)
  public abandonChallenge(teamId: string, challengeId: ChallengeId) {
    const ch = this.getChallenge(teamId, challengeId);
    if (!ch || ch.status !== "ACTIVE") {
      return { success: false, error: "Cannot abandon non-active challenge" };
    }

    ch.status = "ABANDONED";
    ch.abandoned_at = new Date().toISOString();
    this.saveState();

    return { success: true, challenge: ch };
  }

  // Use a hint (Point penalty applied immediately to audit ledger)
  public requestHint(teamId: string, challengeId: ChallengeId) {
    const ch = this.getChallenge(teamId, challengeId);
    const team = this.store.teams[teamId];
    if (!ch || !team) return { success: false, error: "Not found" };

    const hintCosts: Record<ChallengeId, number> = {
      z1: 10,
      z2: 10,
      z3: 15,
      z4: 20,
      z5: 25,
    };

    const hintsMap: Record<ChallengeId, string[]> = {
      z1: [
        "The signal sequence follows a cyclical bitwise transform. Observe bit positions 1 and 4.",
        "Count the ratio of active pulse markers against dormant spaces.",
      ],
      z2: [
        "Separate short high-pitch blips from prolonged audio tones.",
        "Cross-reference with the emergency Morse lookup panel on your screen.",
      ],
      z3: [
        "Test each mystery button once and record the LED toggles in your action history.",
        "The button operations behave like XOR parity switches.",
      ],
      z4: [
        "Eight bits map to one standard ASCII character. Look for a 'HEX:' prefix.",
        "Inspect the DOM comments or system intro if you cannot recall the companion's exact name.",
      ],
      z5: [
        "Do inspect or search: Right-click anywhere and choose 'Inspect' (or press F12 / Ctrl+Shift+I). Search the page elements / source for 'frequency' or data attributes (like data-bx-frequency) to find the hidden carrier value.",
        "Combine kernel-frequency for password: Join the Kernel ID and anomalous Frequency with a hyphen in the format [KERNEL]-[FREQUENCY] (e.g. 0xBX99-2400).",
      ],
    };

    const cost = hintCosts[challengeId];
    const challengeHints = hintsMap[challengeId];
    const currentIdx = ch.hints_used;

    if (currentIdx >= challengeHints.length) {
      return { success: false, error: "No additional hints available for this zone." };
    }

    const hintText = challengeHints[currentIdx];
    ch.hints_used += 1;

    // Apply point penalty
    const event: ScoreEvent = {
      id: `score-${Date.now()}`,
      team_id: teamId,
      challenge_id: challengeId,
      points_delta: -cost,
      event_type: "HINT_PENALTY",
      reason: `Hint ${currentIdx + 1} unlocked for ${challengeId.toUpperCase()}`,
      created_at: new Date().toISOString(),
    };

    this.store.scoreEvents.push(event);
    this.recalculateTeamScore(teamId);

    const hintRecord: HintRecord = {
      id: `hint-${Date.now()}`,
      team_id: teamId,
      challenge_id: challengeId,
      hint_index: currentIdx + 1,
      point_cost: cost,
      hint_text: hintText,
      created_at: new Date().toISOString(),
    };
    this.store.hints.push(hintRecord);

    this.saveState();

    return {
      success: true,
      hintText,
      pointCost: cost,
      newTotalScore: team.total_score,
    };
  }

  // Submit Answer for Validation
  public submitChallenge(
    teamId: string,
    challengeId: ChallengeId,
    submission: {
      stage?: number;
      answer: unknown;
    }
  ) {
    const ch = this.getChallenge(teamId, challengeId);
    const team = this.store.teams[teamId];
    if (!ch || !team) return { success: false, error: "Invalid challenge session" };

    if (ch.status !== "ACTIVE") {
      return { success: false, error: "Challenge is not active" };
    }

    // Server-authoritative Deadline Check
    const deadline = ch.deadline_at ? new Date(ch.deadline_at).getTime() : 0;
    if (Date.now() > deadline) {
      ch.status = "TIMEOUT";
      this.saveState();
      return { success: false, error: "CHALLENGE TIMEOUT: Time limit elapsed", timeout: true };
    }

    ch.attempts += 1;
    let isCorrect = false;
    let pointsAwarded = 0;
    let isChallengeComplete = false;
    let fragmentRecovered: string | undefined;

    // Validation per Challenge
    if (challengeId === "z1") {
      const z1Data = generateZ1(team.team_number);
      const userPredicted = submission.answer as string[];
      if (
        Array.isArray(userPredicted) &&
        userPredicted.join("") === z1Data.expectedNext.join("")
      ) {
        isCorrect = true;
        pointsAwarded = 50;
        isChallengeComplete = true;
      }
    } else if (challengeId === "z2") {
      const z2Data = generateZ2(team.team_number);
      const text = (submission.answer as string || "").trim().toUpperCase();
      if (text === z2Data.unknownWord) {
        isCorrect = true;
        pointsAwarded = 50;
        isChallengeComplete = true;
      }
    } else if (challengeId === "z3") {
      const z3Data = generateZ3(team.team_number);
      if (submission.stage === 1) {
        // Stage A Riddle
        const bitsAnswer = (submission.answer as string || "").trim();
        if (bitsAnswer === z3Data.targetString) {
          isCorrect = true;
          pointsAwarded = 30;
          ch.current_stage = 2;
        }
      } else if (submission.stage === 2) {
        // Stage B Mystery Circuit
        const bits = submission.answer as number[];
        if (Array.isArray(bits) && bits.join("") === z3Data.targetString) {
          isCorrect = true;
          pointsAwarded = 70;
          isChallengeComplete = true;
        }
      }
    } else if (challengeId === "z4") {
      const z4Data = generateZ4(team.team_number);
      if (submission.stage === 1) {
        const str = (submission.answer as string || "").trim().toUpperCase();
        if (str === z4Data.stage1ExpectedAscii) {
          isCorrect = true;
          pointsAwarded = 50;
          ch.current_stage = 2;
        }
      } else if (submission.stage === 2) {
        const str = (submission.answer as string || "").trim().toUpperCase();
        if (str === z4Data.stage2ExpectedAscii) {
          isCorrect = true;
          pointsAwarded = 50;
          ch.current_stage = 3;
        }
      } else if (submission.stage === 3) {
        const str = (submission.answer as string || "").trim().toUpperCase();
        if (str === z4Data.stage3Answer) {
          isCorrect = true;
          pointsAwarded = 30;
          ch.current_stage = 4;
        }
      } else if (submission.stage === 4) {
        const str = (submission.answer as string || "").trim().toUpperCase();
        if (str === z4Data.finalMasterKey) {
          isCorrect = true;
          pointsAwarded = 70;
          isChallengeComplete = true;
          fragmentRecovered = z4Data.fragmentCode;
        }
      }
    } else if (challengeId === "z5") {
      const z5Data = generateZ5(team.team_number);
      const str = (submission.answer as string || "").trim().toUpperCase();
      const expected = z5Data.expectedActivationToken.toUpperCase();
      const rawFreq = z5Data.anomalousFrequency.replace(" MHZ", "").replace("MHZ", "").trim();
      const altAllowed = `${z5Data.kernelHash}-${rawFreq}`.toUpperCase();
      const altWithMhz = `${z5Data.kernelHash}-${rawFreq}MHZ`.toUpperCase();
      const altOverride = `OVERRIDE-${z5Data.kernelHash}-${rawFreq}`.toUpperCase();

      if (
        str === expected ||
        str === altAllowed ||
        str === altWithMhz ||
        str === altOverride
      ) {
        isCorrect = true;
        pointsAwarded = 200;
        isChallengeComplete = true;
        fragmentRecovered = "FRAGMENT-ALPHA-OMEGA";
      }
    }

    if (isCorrect) {
      ch.score_earned += pointsAwarded;
      const event: ScoreEvent = {
        id: `score-${Date.now()}`,
        team_id: teamId,
        challenge_id: challengeId,
        stage_number: submission.stage,
        points_delta: pointsAwarded,
        event_type: isChallengeComplete ? "CHALLENGE_SOLVE" : "STAGE_SOLVE",
        reason: `${challengeId.toUpperCase()} Stage ${submission.stage || 1} Solved`,
        created_at: new Date().toISOString(),
      };
      this.store.scoreEvents.push(event);
      this.recalculateTeamScore(teamId);

      if (isChallengeComplete) {
        ch.status = "COMPLETED";
        ch.completed_at = new Date().toISOString();
        if (ch.started_at) {
          ch.duration_ms =
            new Date(ch.completed_at).getTime() - new Date(ch.started_at).getTime();
        }
      }

      this.saveState();
      return {
        success: true,
        isCorrect: true,
        pointsAwarded,
        challengeComplete: isChallengeComplete,
        currentStage: ch.current_stage,
        fragmentRecovered,
        teamScore: team.total_score,
      };
    } else {
      this.saveState();
      return {
        success: true,
        isCorrect: false,
        message: "Incorrect configuration. Telemetry indicates mismatch.",
      };
    }
  }

  private recalculateTeamScore(teamId: string) {
    const team = this.store.teams[teamId];
    if (!team) return;

    const events = this.store.scoreEvents.filter((e) => e.team_id === teamId);
    team.total_score = events.reduce((acc, curr) => acc + curr.points_delta, 0);
  }

  // ============================================
  // ADMIN POWERS
  // ============================================
  public verifyAdmin(username: string, pass: string): boolean {
    return username === "admin" && pass === "admin@ras2026";
  }

  public generateContinuationCode(teamId: string, adminUser: string) {
    const team = this.store.teams[teamId];
    if (!team) return { success: false, error: "Team not found" };

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `RAS-CONT-${randomSuffix}`;

    const record: ContinuationCodeRecord = {
      id: `cont-${Date.now()}`,
      code,
      team_id: teamId,
      previous_session_id: team.active_session_id || "none",
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 mins
      created_by_admin: adminUser,
      created_at: new Date().toISOString(),
    };

    this.store.continuationCodes[code] = record;
    this.saveState();

    return { success: true, code, record };
  }

  public adminAdjustScore(teamId: string, delta: number, reason: string) {
    const team = this.store.teams[teamId];
    if (!team) return { success: false, error: "Team not found" };

    const event: ScoreEvent = {
      id: `score-${Date.now()}`,
      team_id: teamId,
      points_delta: delta,
      event_type: "ADMIN_ADJUST",
      reason: `ADMIN MANUAL OVERRIDE: ${reason}`,
      created_at: new Date().toISOString(),
    };

    this.store.scoreEvents.push(event);
    this.recalculateTeamScore(teamId);
    this.saveState();

    return { success: true, newScore: team.total_score };
  }

  public adminResetChallenge(teamId: string, challengeId: ChallengeId) {
    const ch = this.getChallenge(teamId, challengeId);
    if (!ch) return { success: false };

    ch.status = challengeId === "z1" || challengeId === "z2" || challengeId === "z3" ? "AVAILABLE" : "LOCKED";
    ch.started_at = undefined;
    ch.deadline_at = undefined;
    ch.completed_at = undefined;
    ch.abandoned_at = undefined;
    ch.score_earned = 0;
    ch.hints_used = 0;
    ch.attempts = 0;
    ch.current_stage = 1;

    this.saveState();
    return { success: true, challenge: ch };
  }

  public adminRestartTeam(teamId: string) {
    const team = this.store.teams[teamId];
    if (!team) return { success: false, error: "Team not found" };

    // Reset team summary
    team.status = "WAITING";
    team.total_score = 0;
    team.total_time_ms = 0;
    team.active_session_id = undefined;

    // Reset challenges for this team
    if (!this.store.challenges[teamId]) {
      this.store.challenges[teamId] = {} as any;
    }
    (["z1", "z2", "z3", "z4", "z5"] as ChallengeId[]).forEach((zid) => {
      this.store.challenges[teamId][zid] = createInitialChallenge(teamId, zid);
    });

    // Invalidate old active sessions for this team
    Object.values(this.store.sessions).forEach((s) => {
      if (s.team_id === teamId) {
        s.status = "COMPLETED";
      }
    });

    // Clear score events and violations for this team
    this.store.scoreEvents = this.store.scoreEvents.filter((e) => e.team_id !== teamId);
    this.store.violations = this.store.violations.filter((v) => v.team_id !== teamId);

    // Clear continuation codes for this team
    Object.keys(this.store.continuationCodes).forEach((k) => {
      if (this.store.continuationCodes[k].team_id === teamId) {
        delete this.store.continuationCodes[k];
      }
    });

    this.saveState();
    return { success: true, team, message: `Team ${team.team_name} successfully reset to 0 points.` };
  }

  public async getAdminLiveOverview() {
    await this.hydrateFromSupabaseAsync();
    return {
      teams: Object.values(this.store.teams),
      challenges: this.store.challenges,
      recentScoreEvents: this.store.scoreEvents.slice(-20),
      recentViolations: this.store.violations.slice(-20),
      continuationCodes: Object.values(this.store.continuationCodes),
    };
  }
}

// Global Singleton to ensure one state across API routes
const globalEngine = (global as unknown as { _engine?: CompetitionEngine });
if (!globalEngine._engine) {
  globalEngine._engine = new CompetitionEngine();
}

export const competitionEngine = globalEngine._engine;

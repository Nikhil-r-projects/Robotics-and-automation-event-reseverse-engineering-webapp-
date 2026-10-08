# RAS DIGITAL ARENA — MASTER SOLUTIONS & BACKTESTING GUIDE
## Complete Question Prompts, Clues, and Exact Input Solutions for All 5 Teams

This master document provides the complete, authoritative reference guide for testing and backtesting all 5 technical zones across all 5 participating teams in the **RAS Digital Arena** (`Reverse Engineer This!`).

---

## 1. Competition Overview & Zone Durations

| Zone | Challenge Name | Duration | Points | Reverse-Engineering Mechanics |
| :--- | :--- | :---: | :---: | :--- |
| **Z1** | **SIGNAL BREAKER** | **10 MIN** | 50 PTS | Cyclic bitwise shift registers & harmonic wave prediction |
| **Z2** | **DEAD SIGNAL** | **10 MIN** | 50 PTS | Synthesizer radio interception, audio calibration & Morse decoding |
| **Z3** | **LOGIC LOCK** | **10 MIN** | 100 PTS | **Stage A (30 pts)**: Rivo Positional Riddle (8-bit binary)<br>**Stage B (70 pts)**: Invertible XOR diode matrix solver |
| **Z4** | **BINARY VAULT** | **15 MIN** | 200 PTS | **Stage 1 (50 pts)**: Binary stream → ASCII hex prompt<br>**Stage 2 (50 pts)**: Hex byte pairs → Decrypted keyword<br>**Stage 3 (30 pts)**: Creator identification riddle<br>**Stage 4 (70 pts)**: Master override key synthesis |
| **Z5** | **BLACK BOX** | **15 MIN** | 200 PTS | DOM forensics, hidden container attributes & kernel-frequency password |
| **TOTAL** | | **60 MIN** | **600 PTS** | |

> **Zone Progression Rules:**
> - **Z1, Z2, Z3** are unlocked from the start.
> - Completing **any 2** of the first three challenges immediately unlocks **Z4 (Binary Vault)** and **Z5 (Black Box)**.
> - **Timer Enforcement**: Server-authoritative countdowns. If time runs out, the zone locks with a `TIMEOUT` status.
> - **Anti-Cheat**: If a player switches tabs or hides the browser window, the Page Visibility beacon eliminates the team session immediately.

---

## 2. Team Credentials Directory

| Team # | Team Name | Access Code | Admin Continuation Rescue |
| :---: | :--- | :--- | :--- |
| **01** | `anything` | `RAS-8K2P` | Generated on demand in `/admin` |
| **02** | `questers` | `RAS-3M7X` | Generated on demand in `/admin` |
| **03** | `milton` | `RAS-9Q4V` | Generated on demand in `/admin` |
| **04** | `rocket` | `RAS-5T1L` | Generated on demand in `/admin` |
| **05** | `meowmewo` | `RAS-2W8Z` | Generated on demand in `/admin` |

- **Team Login URL**: [http://localhost:3000/auth](http://localhost:3000/auth)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin) (`admin` / `admin@ras2026`)

---

## 3. Zone 5 Specific Mechanics & Clues

### Kernel & Password Specification
- **Kernel Format**: Simplified strictly to `0xBX01` (Team 01), `0xBX02` (Team 02), `0xBX03` (Team 03), `0xBX04` (Team 04), and `0xBX05` (Team 05).
- **First Clue Displayed on Screen**:
  > *"CLUE 1 :: TARGET RECONNAISSANCE — ATTENTION: Critical hardware parameters have been concealed. You need to FIND SOMETHING hidden in the interface to unlock this device! Telemetry contains a hidden carrier frequency. Discover it, then generate the override password."*
- **Hardware Bus Telemetry on Screen**:
  - `BUS STATUS`: PROBING BUS ACTIVE
  - `MEMORY ENCLAVE`: ISOLATED
  - `DEVICE KERNEL SIG`: `0xBX01` (clearly displayed)
  - `ANOMALOUS CARRIER`: `[MASKED — SEARCH ENVIRONMENT]`
- **Hints Configured in Hint Modal**:
  - **Hint 1 (-25 PTS)**:
    > *"Do inspect or search: Right-click anywhere and choose 'Inspect' (or press F12 / Ctrl+Shift+I). Search the page elements / source for 'frequency' or data attributes (like data-bx-frequency) to find the hidden carrier value."*
  - **Hint 2 (-25 PTS)**:
    > *"Combine kernel-frequency for password: Join the Kernel ID and anomalous Frequency with a hyphen in the format [KERNEL]-[FREQUENCY] (e.g. 0xBX01-1475)."*
- **Where the Hidden Frequency is Found in DOM**:
  1. Root element attribute: `data-bx-frequency="1475 MHz"`
  2. Hidden element: `<div id="hidden-telemetry-carrier" data-anomalous-frequency="1475 MHz">`
  3. Comment string: `// HARDWARE ANOMALOUS TELEMETRY: KERNEL=0xBX01 | FREQUENCY=1475 MHz | PASSWORD_FORMULA=[KERNEL]-[FREQUENCY]`
- **Password Input**:
  - Combines `[KERNEL]-[FREQUENCY]` $\rightarrow$ `0xBX01-1475`.
  - Also tolerates `0xBX01-1475MHz`, `0xbx01-1475`, or `OVERRIDE-0xBX01-1475`.

---

### Zone 2 Morse Code Playback Speed & Controls
To ensure participants can accurately copy down dots and dashes on paper, the audio synthesizer features:
- **Default Speed**: **Slow / Transcribing Mode**
  - Dot: `160ms` | Dash: `480ms` (3:1 ratio) | Intra-element gap: `160ms`
  - **Letter Pause**: `650ms` (distinct, generous silence between characters for easy transcription)
- **Speed Selector Chips on Interface**:
  - `● SLOW / TRANSCRIBE (RECOMMENDED)` (160ms dot / 650ms pause)
  - `VERY SLOW` (220ms dot / 850ms pause for beginner participants)
  - `NORMAL` (100ms dot / 400ms pause)
- **Instant Playback Interruption**:
  - Clicking any active channel or the dedicated **■ STOP TRANSMISSION** button immediately cancels playback so teams don't have to wait to restart.

---

# 4. Detailed Team-by-Team Master Solutions

---

## TEAM 01 (`TEAM NOVA` • Access Code: `RAS-8K2P`)

### Z1 — SIGNAL BREAKER (50 PTS | 10 MIN)
- **What is Displayed to Team**:
  - **Rule Hint**: *"Symmetric harmonic reflection pulse"*
  - **Cycle 1**: `○  ●  ○  ●  ○`
  - **Cycle 2**: `●  ○  ●  ○  ●`
  - **Cycle 3**: `○  ●  ●  ●  ○`
- **What Team Must Input / Action**:
  - Click the 5 prediction nodes at the bottom to set:
    $$\mathbf{● \quad ● \quad ○ \quad ● \quad ●}$$
    *(Node 1: ON, Node 2: ON, Node 3: OFF, Node 4: ON, Node 5: ON)*
  - Click **VERIFY AND SUBMIT**.
- **Result**: +50 PTS awarded, challenge status set to `COMPLETED`.

---

### Z2 — DEAD SIGNAL (50 PTS | 10 MIN)
- **What is Displayed to Team**:
  - **Channel 01 Reference**: `ALPHA` (`.- .-.. .--. .... .-`)
  - **Channel 02 Reference**: `DELTA` (`-.. . .-.. - .-`)
  - **Unknown Target Channel**: 6-letter audio signal broadcasting:
    `...- . -.-. - --- .-.`
- **What Team Must Input / Action**:
  - Type into the decryption box:
    $$\mathbf{VECTOR}$$
  - Click **SUBMIT DECRYPTION**.
- **Result**: +50 PTS awarded, challenge status set to `COMPLETED`.

---

### Z3 — LOGIC LOCK (100 PTS | 10 MIN)

#### Stage A: Rivo Positional Riddle (30 PTS)
- **What is Displayed to Team**:
  > 1. *Node 1 lies dormant in the dark.* $\rightarrow$ **0**  
  > 2. *The adjacent second sentinel is energized.* $\rightarrow$ **1**  
  > 3. *In the lower quad, gate 3 is broadcasting photon flux, while gate 4 sleeps.* $\rightarrow$ **1, 0**  
  > 4. *The fifth beacon glows in amber parity.* $\rightarrow$ **1**  
  > 5. *Position 6 stands illuminated, followed by seventh live.* $\rightarrow$ **1, 1**  
  > 6. *Finally, the terminal eighth diode holds the final flame.* $\rightarrow$ **1**  
- **What Team Must Input / Action**:
  - Click the 8 bitstream buttons to form:
    $$\mathbf{01101111}$$
    *(Node 1: 0, Node 2: 1, Node 3: 1, Node 4: 0, Node 5: 1, Node 6: 1, Node 7: 1, Node 8: 1)*
  - Click **VERIFY STAGE A RIDDLE (+30 PTS)**.

#### Stage B: Mystery Circuit (70 PTS)
- **What is Displayed to Team**:
  - Initial LED states: `0 0 0 0 0 0 0 0`
  - Target LED states: `0 1 1 0 1 1 1 1` (from Stage A)
  - Button wiring:
    - **Button A**: toggles LEDs `[1, 3, 5, 7]`
    - **Button B**: toggles LEDs `[2, 4, 6, 8]`
    - **Button C**: toggles LEDs `[2, 7, 8]`
    - **Button D**: toggles LEDs `[3, 5, 6]`
- **What Team Must Input / Action**:
  - Click **Button C** once, then click **Button D** once.
  - Verification:
    - After Button C: LEDs 2, 7, 8 are ON $\rightarrow$ `[0, 1, 0, 0, 0, 0, 1, 1]`
    - After Button D: LEDs 3, 5, 6 are toggled $\rightarrow$ `[0, 1, 1, 0, 1, 1, 1, 1]` (Exact Match!)
  - Click **BREACH LOCK (+70 PTS)**.
- **Result**: +100 PTS total awarded, challenge status set to `COMPLETED`.

---

### Z4 — BINARY VAULT (200 PTS | 15 MIN)

#### Stage 1: Binary Stream (50 PTS)
- **What is Displayed**:
  `01001000 01000101 01011000 00111010 00100000 00110101 00110000 00100000 00110101 00110010 00100000 00110100 00111001 00100000 00110101 00110011 00100000 00110100 01000100`
- **What Team Must Input**:
  $$\mathbf{HEX: 50\ 52\ 49\ 53\ 4D}$$

#### Stage 2: Hex Keyword (50 PTS)
- **What is Displayed**:
  `50 52 49 53 4D`
- **What Team Must Input**:
  $$\mathbf{PRISM}$$

#### Stage 3: Creator Identity (30 PTS)
- **What is Displayed**:
  *"DO YOU REMEMBER ME?"*
- **What Team Must Input**:
  $$\mathbf{RIVO}$$

#### Stage 4: Master Key (70 PTS)
- **What is Displayed**:
  *"Synthesize protocol key: RIVO-[KEYWORD]-99"*
- **What Team Must Input**:
  $$\mathbf{RIVO-PRISM-99}$$
- **Result**: +200 PTS awarded, recovers `FRAG-01X88`.

---

### Z5 — BLACK BOX (200 PTS | 15 MIN)
- **What is Displayed on Screen**:
  - `DEVICE ID`: `BX-01`
  - `DEVICE KERNEL SIG`: `0xBX01`
  - `ANOMALOUS CARRIER`: `[MASKED — SEARCH ENVIRONMENT]`
  - `CLUE 1`: *"You need to FIND SOMETHING hidden in the interface to unlock this device!"*
- **Hidden Telemetry to Find (via Inspect / Search)**:
  - Open DevTools (F12) $\rightarrow$ Search `frequency`:
  - `data-bx-frequency="1475 MHz"`
- **What Team Must Input / Action**:
  - Formula: `[KERNEL]-[FREQUENCY]`
  - Enter into input box:
    $$\mathbf{0xBX01-1475}$$
  - Click **ENGAGE OVERRIDE (+200 PTS)**.
- **Result**: +200 PTS awarded, recovers `FRAGMENT-ALPHA-OMEGA`.

---
---

## TEAM 02 (`CYBER VIPERS` • Access Code: `RAS-3M7X`)

### Z1 — SIGNAL BREAKER (50 PTS | 10 MIN)
- **What is Displayed to Team**:
  - **Rule Hint**: *"Cascading cyclic delay right-shift register"*
  - **Cycle 1**: `●  ●  ○  ○  ●`
  - **Cycle 2**: `○  ●  ●  ○  ○`
  - **Cycle 3**: `○  ○  ●  ●  ○`
- **What Team Must Input / Action**:
  - Configure nodes to:
    $$\mathbf{○ \quad ○ \quad ○ \quad ● \quad ●}$$
    *(Node 1: OFF, Node 2: OFF, Node 3: OFF, Node 4: ON, Node 5: ON)*
  - Click **VERIFY AND SUBMIT**.
- **Result**: +50 PTS awarded.

---

### Z2 — DEAD SIGNAL (50 PTS | 10 MIN)
- **What is Displayed to Team**:
  - **Unknown Target Channel**: 4-letter audio signal broadcasting:
    `..-. .-.. ..- -..-`
- **What Team Must Input / Action**:
  - Type:
    $$\mathbf{FLUX}$$
  - Click **SUBMIT DECRYPTION**.
- **Result**: +50 PTS awarded.

---

### Z3 — LOGIC LOCK (100 PTS | 10 MIN)

#### Stage A: Rivo Positional Riddle (30 PTS)
- **What is Displayed to Team**:
  > 1. *Node 1 burns with active power.* $\rightarrow$ **1**  
  > 2. *The adjacent second sentinel is energized.* $\rightarrow$ **1**  
  > 3. *In the lower quad, gate 3 is broadcasting photon flux, while gate 4 awakens.* $\rightarrow$ **1, 1**  
  > 4. *The fifth beacon glows in amber parity.* $\rightarrow$ **1**  
  > 5. *Position 6 stands illuminated, followed by seventh live.* $\rightarrow$ **1, 1**  
  > 6. *Finally, the terminal eighth diode holds the final flame.* $\rightarrow$ **1**  
- **What Team Must Input / Action**:
  - Configure all 8 bits to 1:
    $$\mathbf{11111111}$$
  - Click **VERIFY STAGE A RIDDLE (+30 PTS)**.

#### Stage B: Mystery Circuit (70 PTS)
- **What is Displayed to Team**:
  - Target: `1 1 1 1 1 1 1 1`
  - Wiring:
    - **Button A**: toggles LEDs `[1, 3, 7]`
    - **Button B**: toggles LEDs `[4, 6, 8]`
    - **Button C**: toggles LEDs `[1, 2, 7, 8]`
    - **Button D**: toggles LEDs `[3, 4, 5, 6]`
- **What Team Must Input / Action**:
  - Click **Button C**, then click **Button D**.
  - All 8 LEDs will ignite $\rightarrow$ `[1, 1, 1, 1, 1, 1, 1, 1]`.
  - Click **BREACH LOCK (+70 PTS)**.
- **Result**: +100 PTS total awarded.

---

### Z4 — BINARY VAULT (200 PTS | 15 MIN)
- **Stage 1 Input**: `HEX: 43 4F 52 45`
- **Stage 2 Input**: `CORE`
- **Stage 3 Input**: `RIVO`
- **Stage 4 Input**: `RIVO-CORE-99`
- **Result**: +200 PTS awarded, recovers `FRAG-02X88`.

---

### Z5 — BLACK BOX (200 PTS | 15 MIN)
- **What is Displayed on Screen**:
  - `DEVICE ID`: `BX-02`
  - `DEVICE KERNEL SIG`: `0xBX02`
  - `ANOMALOUS CARRIER`: `[MASKED — SEARCH ENVIRONMENT]`
- **Hidden Telemetry**: `1448 MHz`
- **What Team Must Input**:
  $$\mathbf{0xBX02-1448}$$
- **Result**: +200 PTS awarded, recovers `FRAGMENT-ALPHA-OMEGA`.

---
---

## TEAM 03 (`NEXUS SHADOW` • Access Code: `RAS-9Q4V`)

### Z1 — SIGNAL BREAKER (50 PTS | 10 MIN)
- **What is Displayed to Team**:
  - **Rule Hint**: *"High-density sliding window oscillator"*
  - **Cycle 1**: `●  ●  ●  ○  ○`
  - **Cycle 2**: `○  ●  ●  ●  ○`
  - **Cycle 3**: `○  ○  ●  ●  ●`
- **What Team Must Input / Action**:
  - Configure nodes to:
    $$\mathbf{● \quad ○ \quad ○ \quad ● \quad ●}$$
    *(Node 1: ON, Node 2: OFF, Node 3: OFF, Node 4: ON, Node 5: ON)*
  - Click **VERIFY AND SUBMIT**.
- **Result**: +50 PTS awarded.

---

### Z2 — DEAD SIGNAL (50 PTS | 10 MIN)
- **What is Displayed to Team**:
  - **Unknown Target Channel**: 5-letter audio signal broadcasting:
    `... -.-- -. - ....`
- **What Team Must Input / Action**:
  - Type:
    $$\mathbf{SYNTH}$$
  - Click **SUBMIT DECRYPTION**.
- **Result**: +50 PTS awarded.

---

### Z3 — LOGIC LOCK (100 PTS | 10 MIN)

#### Stage A: Rivo Positional Riddle (30 PTS)
- **What is Displayed to Team**:
  > 1. *Node 1 burns with active power.* $\rightarrow$ **1**  
  > 2. *The adjacent second sentinel remains extinguished.* $\rightarrow$ **0**  
  > 3. *In the lower quad, gate 3 is broadcasting photon flux, while gate 4 awakens.* $\rightarrow$ **1, 1**  
  > 4. *The fifth beacon is grounded to void.* $\rightarrow$ **0**  
  > 5. *Position 6 stands illuminated, followed by seventh dark.* $\rightarrow$ **1, 0**  
  > 6. *Finally, the terminal eighth diode has lost all current.* $\rightarrow$ **0**  
- **What Team Must Input / Action**:
  - Form bit pattern:
    $$\mathbf{10110100}$$
  - Click **VERIFY STAGE A RIDDLE (+30 PTS)**.

#### Stage B: Mystery Circuit (70 PTS)
- **What is Displayed to Team**:
  - Target: `1 0 1 1 0 1 0 0`
  - Wiring:
    - **Button A**: toggles LEDs `[1, 3, 5]`
    - **Button B**: toggles LEDs `[2, 4, 6, 8]`
    - **Button C**: toggles LEDs `[1, 2, 7, 8]`
    - **Button D**: toggles LEDs `[4, 5, 6]`
- **What Team Must Input / Action**:
  - Click **Button A**, then click **Button D**.
  - Matches target LEDs $\rightarrow$ `[1, 0, 1, 1, 0, 1, 0, 0]`.
  - Click **BREACH LOCK (+70 PTS)**.
- **Result**: +100 PTS total awarded.

---

### Z4 — BINARY VAULT (200 PTS | 15 MIN)
- **Stage 1 Input**: `HEX: 43 59 42 45 52`
- **Stage 2 Input**: `CYBER`
- **Stage 3 Input**: `RIVO`
- **Stage 4 Input**: `RIVO-CYBER-99`
- **Result**: +200 PTS awarded, recovers `FRAG-03X88`.

---

### Z5 — BLACK BOX (200 PTS | 15 MIN)
- **What is Displayed on Screen**:
  - `DEVICE ID`: `BX-03`
  - `DEVICE KERNEL SIG`: `0xBX03`
  - `ANOMALOUS CARRIER`: `[MASKED — SEARCH ENVIRONMENT]`
- **Hidden Telemetry**: `1499 MHz`
- **What Team Must Input**:
  $$\mathbf{0xBX03-1499}$$
- **Result**: +200 PTS awarded, recovers `FRAGMENT-ALPHA-OMEGA`.

---
---

## TEAM 04 (`VECTOR PRIME` • Access Code: `RAS-5T1L`)

### Z1 — SIGNAL BREAKER (50 PTS | 10 MIN)
- **What is Displayed to Team**:
  - **Rule Hint**: *"Symmetric harmonic reflection pulse"*
  - **Cycle 1**: `○  ●  ○  ●  ○`
  - **Cycle 2**: `●  ○  ●  ○  ●`
  - **Cycle 3**: `○  ●  ●  ●  ○`
- **What Team Must Input / Action**:
  - Configure nodes to:
    $$\mathbf{● \quad ● \quad ○ \quad ● \quad ●}$$
  - Click **VERIFY AND SUBMIT**.
- **Result**: +50 PTS awarded.

---

### Z2 — DEAD SIGNAL (50 PTS | 10 MIN)
- **What is Displayed to Team**:
  - **Unknown Target Channel**: 7-letter audio signal broadcasting:
    `-.-. .- .-. .-. .. . .-.`
- **What Team Must Input / Action**:
  - Type:
    $$\mathbf{CARRIER}$$
  - Click **SUBMIT DECRYPTION**.
- **Result**: +50 PTS awarded.

---

### Z3 — LOGIC LOCK (100 PTS | 10 MIN)

#### Stage A: Rivo Positional Riddle (30 PTS)
- **What is Displayed to Team**:
  > 1. *Node 1 lies dormant in the dark.* $\rightarrow$ **0**  
  > 2. *The adjacent second sentinel is energized.* $\rightarrow$ **1**  
  > 3. *In the lower quad, gate 3 is broadcasting photon flux, while gate 4 awakens.* $\rightarrow$ **1, 1**  
  > 4. *The fifth beacon glows in amber parity.* $\rightarrow$ **1**  
  > 5. *Position 6 stands suppressed, followed by seventh dark.* $\rightarrow$ **0, 0**  
  > 6. *Finally, the terminal eighth diode holds the final flame.* $\rightarrow$ **1**  
- **What Team Must Input / Action**:
  - Form bit pattern:
    $$\mathbf{01111001}$$
  - Click **VERIFY STAGE A RIDDLE (+30 PTS)**.

#### Stage B: Mystery Circuit (70 PTS)
- **What is Displayed to Team**:
  - Target: `0 1 1 1 1 0 0 1`
  - Wiring:
    - **Button A**: toggles LEDs `[3, 5, 7]`
    - **Button B**: toggles LEDs `[2, 6, 8]`
    - **Button C**: toggles LEDs `[1, 2, 7]`
    - **Button D**: toggles LEDs `[3, 4, 5, 6]`
- **What Team Must Input / Action**:
  - Click **Button B**, then click **Button D**.
  - Matches target LEDs $\rightarrow$ `[0, 1, 1, 1, 1, 0, 0, 1]`.
  - Click **BREACH LOCK (+70 PTS)**.
- **Result**: +100 PTS total awarded.

---

### Z4 — BINARY VAULT (200 PTS | 15 MIN)
- **Stage 1 Input**: `HEX: 43 4F 52 45`
- **Stage 2 Input**: `CORE`
- **Stage 3 Input**: `RIVO`
- **Stage 4 Input**: `RIVO-CORE-99`
- **Result**: +200 PTS awarded, recovers `FRAG-04X88`.

---

### Z5 — BLACK BOX (200 PTS | 15 MIN)
- **What is Displayed on Screen**:
  - `DEVICE ID`: `BX-04`
  - `DEVICE KERNEL SIG`: `0xBX04`
  - `ANOMALOUS CARRIER`: `[MASKED — SEARCH ENVIRONMENT]`
- **Hidden Telemetry**: `1428 MHz`
- **What Team Must Input**:
  $$\mathbf{0xBX04-1428}$$
- **Result**: +200 PTS awarded, recovers `FRAGMENT-ALPHA-OMEGA`.

---
---

## TEAM 05 (`QUANTUM CORE` • Access Code: `RAS-2W8Z`)

### Z1 — SIGNAL BREAKER (50 PTS | 10 MIN)
- **What is Displayed to Team**:
  - **Rule Hint**: *"High-density sliding window oscillator"*
  - **Cycle 1**: `●  ●  ●  ○  ○`
  - **Cycle 2**: `○  ●  ●  ●  ○`
  - **Cycle 3**: `○  ○  ●  ●  ●`
- **What Team Must Input / Action**:
  - Configure nodes to:
    $$\mathbf{● \quad ○ \quad ○ \quad ● \quad ●}$$
  - Click **VERIFY AND SUBMIT**.
- **Result**: +50 PTS awarded.

---

### Z2 — DEAD SIGNAL (50 PTS | 10 MIN)
- **What is Displayed to Team**:
  - **Unknown Target Channel**: 7-letter audio signal broadcasting:
    `-.-. .- .-. .-. .. . .-.`
- **What Team Must Input / Action**:
  - Type:
    $$\mathbf{CARRIER}$$
  - Click **SUBMIT DECRYPTION**.
- **Result**: +50 PTS awarded.

---

### Z3 — LOGIC LOCK (100 PTS | 10 MIN)

#### Stage A: Rivo Positional Riddle (30 PTS)
- **What is Displayed to Team**:
  > 1. *Node 1 lies dormant in the dark.* $\rightarrow$ **0**  
  > 2. *The adjacent second sentinel is energized.* $\rightarrow$ **1**  
  > 3. *In the lower quad, gate 3 is broadcasting photon flux, while gate 4 sleeps.* $\rightarrow$ **1, 0**  
  > 4. *The fifth beacon glows in amber parity.* $\rightarrow$ **1**  
  > 5. *Position 6 stands suppressed, followed by seventh dark.* $\rightarrow$ **0, 0**  
  > 6. *Finally, the terminal eighth diode has lost all current.* $\rightarrow$ **0**  
- **What Team Must Input / Action**:
  - Form bit pattern:
    $$\mathbf{01101000}$$
  - Click **VERIFY STAGE A RIDDLE (+30 PTS)**.

#### Stage B: Mystery Circuit (70 PTS)
- **What is Displayed to Team**:
  - Target: `0 1 1 0 1 0 0 0`
  - Wiring:
    - **Button A**: toggles LEDs `[3, 5]`
    - **Button B**: toggles LEDs `[2, 4, 6]`
    - **Button C**: toggles LEDs `[1, 7, 8]`
    - **Button D**: toggles LEDs `[3, 4, 5, 6]`
- **What Team Must Input / Action**:
  - Click **Button B**, then click **Button D**.
  - Matches target LEDs $\rightarrow$ `[0, 1, 1, 0, 1, 0, 0, 0]`.
  - Click **BREACH LOCK (+70 PTS)**.
- **Result**: +100 PTS total awarded.

---

### Z4 — BINARY VAULT (200 PTS | 15 MIN)
- **Stage 1 Input**: `HEX: 50 52 49 53 4D`
- **Stage 2 Input**: `PRISM`
- **Stage 3 Input**: `RIVO`
- **Stage 4 Input**: `RIVO-PRISM-99`
- **Result**: +200 PTS awarded, recovers `FRAG-05X88`.

---

### Z5 — BLACK BOX (200 PTS | 15 MIN)
- **What is Displayed on Screen**:
  - `DEVICE ID`: `BX-05`
  - `DEVICE KERNEL SIG`: `0xBX05`
  - `ANOMALOUS CARRIER`: `[MASKED — SEARCH ENVIRONMENT]`
- **Hidden Telemetry**: `1437 MHz`
- **What Team Must Input**:
  $$\mathbf{0xBX05-1437}$$
- **Result**: +200 PTS awarded, recovers `FRAGMENT-ALPHA-OMEGA`.

---

## 5. Master Backtesting Matrix (Cheat Sheet)

Use this quick lookup table while verifying submissions or running automated tests:

| Team # | Team Name | Z1 (Prediction) | Z2 (Morse Word) | Z3-A (Riddle Bits) | Z3-B (Button Order) | Z4-1 (Binary Ascii) | Z4-2 (Keyword) | Z4-3 | Z4-4 (Master Key) | Z5 Password (`KERNEL-FREQ`) |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **01** | `TEAM NOVA` | `● ● ○ ● ●` | `VECTOR` | `01101111` | Click **C**, then **D** | `HEX: 50 52 49 53 4D` | `PRISM` | `RIVO` | `RIVO-PRISM-99` | `0xBX01-1475` |
| **02** | `CYBER VIPERS` | `○ ○ ○ ● ●` | `FLUX` | `11111111` | Click **C**, then **D** | `HEX: 43 4F 52 45` | `CORE` | `RIVO` | `RIVO-CORE-99` | `0xBX02-1448` |
| **03** | `NEXUS SHADOW` | `● ○ ○ ● ●` | `SYNTH` | `10110100` | Click **A**, then **D** | `HEX: 43 59 42 45 52` | `CYBER` | `RIVO` | `RIVO-CYBER-99` | `0xBX03-1499` |
| **04** | `VECTOR PRIME` | `● ● ○ ● ●` | `CARRIER` | `01111001` | Click **B**, then **D** | `HEX: 43 4F 52 45` | `CORE` | `RIVO` | `RIVO-CORE-99` | `0xBX04-1428` |
| **05** | `QUANTUM CORE` | `● ○ ○ ● ●` | `CARRIER` | `01101000` | Click **B**, then **D** | `HEX: 50 52 49 53 4D` | `PRISM` | `RIVO` | `RIVO-PRISM-99` | `0xBX05-1437` |

---

## 6. End-to-End Backtest Verification Script

You can verify and test all responses at any time by running:
```bash
node scripts/solve_all.js
```
All seeds are completely deterministic. Any team credentials entered will validate identically on the production server.

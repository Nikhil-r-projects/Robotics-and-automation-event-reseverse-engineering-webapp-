// Deterministic pseudo-random generator based on a string seed
function sfc32(a: number, b: number, c: number, d: number) {
  return function () {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = c << 21 | c >>> 11;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}

function createRng(seedStr: string) {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0; i < seedStr.length; i++) {
    const k = seedStr.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  return sfc32(h1, h2, h3, h4);
}

// ==========================================
// Z1: SIGNAL BREAKER
// ==========================================
export interface Z1ChallengeData {
  sequences: string[][];
  ruleHint: string;
  expectedNext: string[];
}

export function generateZ1(teamNumber: string): Z1ChallengeData {
  const rng = createRng(`z1-${teamNumber}-seed`);
  const patterns = [
    {
      // Alternating Shift rule
      seqs: [
        ["●", "○", "●", "●", "○"],
        ["○", "●", "●", "○", "●"],
        ["●", "●", "○", "●", "●"],
      ],
      ruleHint: "Circular bitwise left-shift with pulse inversion on boundary",
      expected: ["●", "○", "●", "●", "●"],
    },
    {
      seqs: [
        ["●", "●", "○", "○", "●"],
        ["○", "●", "●", "○", "○"],
        ["○", "○", "●", "●", "○"],
      ],
      ruleHint: "Cascading cyclic delay right-shift register",
      expected: ["○", "○", "○", "●", "●"],
    },
    {
      seqs: [
        ["○", "●", "○", "●", "○"],
        ["●", "○", "●", "○", "●"],
        ["○", "●", "●", "●", "○"],
      ],
      ruleHint: "Symmetric harmonic reflection pulse",
      expected: ["●", "●", "○", "●", "●"],
    },
    {
      seqs: [
        ["●", "○", "○", "●", "○"],
        ["○", "●", "○", "○", "●"],
        ["●", "○", "●", "○", "○"],
      ],
      ruleHint: "Dual-carrier frequency hopping sequence",
      expected: ["○", "●", "○", "●", "○"],
    },
    {
      seqs: [
        ["●", "●", "●", "○", "○"],
        ["○", "●", "●", "●", "○"],
        ["○", "○", "●", "●", "●"],
      ],
      ruleHint: "High-density sliding window oscillator",
      expected: ["●", "○", "○", "●", "●"],
    },
  ];

  const idx = Math.floor(rng() * patterns.length);
  return {
    sequences: patterns[idx].seqs,
    ruleHint: patterns[idx].ruleHint,
    expectedNext: patterns[idx].expected,
  };
}

// ==========================================
// Z2: DEAD SIGNAL (Morse)
// ==========================================
export interface Z2ChallengeData {
  channel1Word: string;
  channel2Word: string;
  unknownWord: string;
  unknownMorse: string;
}

const MORSE_TABLE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
  G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
  M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..", "0": "-----", "1": ".----", "2": "..---",
  "3": "...--", "4": "....-", "5": ".....", "6": "-....",
  "7": "--...", "8": "---..", "9": "----.",
};

export function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split("")
    .map((c) => MORSE_TABLE[c] || "")
    .join(" ");
}

export function generateZ2(teamNumber: string): Z2ChallengeData {
  const words = ["PULSE", "RADAR", "FLUX", "CARRIER", "CIPHER", "BEACON", "VECTOR", "SYNTH"];
  const rng = createRng(`z2-${teamNumber}-seed`);
  const wordIdx = Math.floor(rng() * words.length);
  const unknownWord = words[wordIdx];

  return {
    channel1Word: "ALPHA",
    channel2Word: "DELTA",
    unknownWord,
    unknownMorse: textToMorse(unknownWord),
  };
}

// ==========================================
// Z3: LOGIC LOCK
// ==========================================
export interface Z3ChallengeData {
  // Stage A
  riddleLines: string[];
  targetBits: number[]; // 8 bits e.g. [0, 1, 0, 0, 1, 0, 0, 1]
  targetString: string; // "01001001"
  // Stage B
  buttonMappings: {
    A: number[];
    B: number[];
    C: number[];
    D: number[];
  };
  initialBits: number[];
}

export function generateZ3(teamNumber: string): Z3ChallengeData {
  const rng = createRng(`z3-${teamNumber}-seed`);
  
  // Button mappings (which indices 0..7 are toggled)
  const buttonMappings = {
    A: [0, 2, 4, 6].filter(() => rng() > 0.2),
    B: [1, 3, 5, 7].filter(() => rng() > 0.2),
    C: [0, 1, 6, 7].filter(() => rng() > 0.2),
    D: [2, 3, 4, 5].filter(() => rng() > 0.2),
  };
  if (buttonMappings.A.length === 0) buttonMappings.A = [0, 3, 6];
  if (buttonMappings.B.length === 0) buttonMappings.B = [1, 4, 7];
  if (buttonMappings.C.length === 0) buttonMappings.C = [2, 5];
  if (buttonMappings.D.length === 0) buttonMappings.D = [0, 1, 7];

  // Guaranteed solvable button combination
  const combos = [
    { name: "A + B", pressed: ["A", "B"] as const },
    { name: "A + C", pressed: ["A", "C"] as const },
    { name: "A + D", pressed: ["A", "D"] as const },
    { name: "B + C", pressed: ["B", "C"] as const },
    { name: "B + D", pressed: ["B", "D"] as const },
    { name: "C + D", pressed: ["C", "D"] as const },
    { name: "A + B + D", pressed: ["A", "B", "D"] as const },
    { name: "A + C + D", pressed: ["A", "C", "D"] as const },
    { name: "B + C + D", pressed: ["B", "C", "D"] as const },
  ];
  const choice = combos[Math.floor(rng() * combos.length)];
  const targetBits = [0, 0, 0, 0, 0, 0, 0, 0];
  choice.pressed.forEach((btn) => {
    buttonMappings[btn].forEach((idx) => {
      targetBits[idx] ^= 1;
    });
  });

  const targetString = targetBits.join("");

  // Poetic technical positional riddle for Stage A
  const riddleLines = [
    `Node 1 ${targetBits[0] === 1 ? "burns with active power" : "lies dormant in the dark"}.`,
    `The adjacent second sentinel ${targetBits[1] === 1 ? "is energized" : "remains extinguished"}.`,
    `In the lower quad, gate 3 is ${targetBits[2] === 1 ? "broadcasting photon flux" : "chilled to absolute zero"}, while gate 4 ${targetBits[3] === 1 ? "awakens" : "sleeps"}.`,
    `The fifth beacon ${targetBits[4] === 1 ? "glows in amber parity" : "is grounded to void"}.`,
    `Position 6 stands ${targetBits[5] === 1 ? "illuminated" : "suppressed"}, followed by seventh ${targetBits[6] === 1 ? "live" : "dark"}.`,
    `Finally, the terminal eighth diode ${targetBits[7] === 1 ? "holds the final flame." : "has lost all current."}`,
  ];

  return {
    riddleLines,
    targetBits,
    targetString,
    buttonMappings,
    initialBits: [0, 0, 0, 0, 0, 0, 0, 0],
  };
}

// ==========================================
// Z4: BINARY VAULT
// ==========================================
export interface Z4ChallengeData {
  stage1Binary: string;
  stage1ExpectedAscii: string; // e.g. "HEX: 56 41 55 4C 54"
  stage2Hex: string;           // "56 41 55 4C 54"
  stage2ExpectedAscii: string; // "VAULT"
  stage3Question: string;      // "DO YOU REMEMBER ME?"
  stage3Answer: string;        // "RIVO"
  finalMasterKey: string;      // "RIVO-VAULT-2026"
  fragmentCode: string;
}

export function textToBinary(text: string): string {
  return text
    .split("")
    .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
    .join(" ");
}

export function generateZ4(teamNumber: string): Z4ChallengeData {
  const keywords = ["CORE", "NEXUS", "CYBER", "VAULT", "PRISM"];
  const rng = createRng(`z4-${teamNumber}-seed`);
  const kw = keywords[Math.floor(rng() * keywords.length)];

  // Convert keyword to space-separated hex
  const hexStr = kw
    .split("")
    .map((c) => c.charCodeAt(0).toString(16).toUpperCase())
    .join(" ");

  const asciiPrompt = `HEX: ${hexStr}`;
  const binaryPayload = textToBinary(asciiPrompt);

  return {
    stage1Binary: binaryPayload,
    stage1ExpectedAscii: asciiPrompt,
    stage2Hex: hexStr,
    stage2ExpectedAscii: kw,
    stage3Question: "DO YOU REMEMBER ME?",
    stage3Answer: "RIVO",
    finalMasterKey: `RIVO-${kw}-99`,
    fragmentCode: `FRAG-${teamNumber}X88`,
  };
}

// ==========================================
// Z5: BLACK BOX
// ==========================================
export interface Z5ChallengeData {
  deviceId: string;
  kernelHash: string;
  anomalousFrequency: string;
  expectedActivationToken: string;
}

export function generateZ5(teamNumber: string): Z5ChallengeData {
  const rng = createRng(`z5-${teamNumber}-seed`);
  const freq = (1420 + Math.floor(rng() * 80)).toString();
  const kernelHash = `0xBX${teamNumber}`;
  const expectedActivationToken = `${kernelHash}-${freq}`;

  return {
    deviceId: `BX-${teamNumber}`,
    kernelHash,
    anomalousFrequency: `${freq} MHz`,
    expectedActivationToken,
  };
}

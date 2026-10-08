// Solve all 5 teams deterministically
function sfc32(a, b, c, d) {
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

function createRng(seedStr) {
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

const patterns = [
  {
    seqs: [["●", "○", "●", "●", "○"], ["○", "●", "●", "○", "●"], ["●", "●", "○", "●", "●"]],
    ruleHint: "Circular bitwise left-shift with pulse inversion on boundary",
    expected: ["●", "○", "●", "●", "●"],
  },
  {
    seqs: [["●", "●", "○", "○", "●"], ["○", "●", "●", "○", "○"], ["○", "○", "●", "●", "○"]],
    ruleHint: "Cascading cyclic delay right-shift register",
    expected: ["○", "○", "○", "●", "●"],
  },
  {
    seqs: [["○", "●", "○", "●", "○"], ["●", "○", "●", "○", "●"], ["○", "●", "●", "●", "○"]],
    ruleHint: "Symmetric harmonic reflection pulse",
    expected: ["●", "●", "○", "●", "●"],
  },
  {
    seqs: [["●", "○", "○", "●", "○"], ["○", "●", "○", "○", "●"], ["●", "○", "●", "○", "○"]],
    ruleHint: "Dual-carrier frequency hopping sequence",
    expected: ["○", "●", "○", "●", "○"],
  },
  {
    seqs: [["●", "●", "●", "○", "○"], ["○", "●", "●", "●", "○"], ["○", "○", "●", "●", "●"]],
    ruleHint: "High-density sliding window oscillator",
    expected: ["●", "○", "○", "●", "●"],
  },
];

const words = ["PULSE", "RADAR", "FLUX", "CARRIER", "CIPHER", "BEACON", "VECTOR", "SYNTH"];
const keywords = ["CORE", "NEXUS", "CYBER", "VAULT", "PRISM"];

function textToMorse(text) {
  const MORSE_TABLE = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
    G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
    M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
    S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
    Y: "-.--", Z: "--..", "0": "-----", "1": ".----", "2": "..---",
    "3": "...--", "4": "....-", "5": ".....", "6": "-....",
    "7": "--...", "8": "---..", "9": "----.",
  };
  return text.toUpperCase().split("").map((c) => MORSE_TABLE[c] || "").join(" ");
}

for (const t of ["01", "02", "03", "04", "05"]) {
  console.log(`\n============================================================`);
  console.log(`SOLUTIONS FOR TEAM ${t}`);
  console.log(`============================================================`);
  
  // Z1
  const rng1 = createRng(`z1-${t}-seed`);
  const idx1 = Math.floor(rng1() * patterns.length);
  const z1 = patterns[idx1];
  console.log(`Z1 — SIGNAL BREAKER:`);
  console.log(`  Rule: ${z1.ruleHint}`);
  console.log(`  Expected Sequence (Signal 4): ${JSON.stringify(z1.expected)}`);

  // Z2
  const rng2 = createRng(`z2-${t}-seed`);
  const idx2 = Math.floor(rng2() * words.length);
  const z2Word = words[idx2];
  console.log(`Z2 — DEAD SIGNAL:`);
  console.log(`  Decoded Morse Word: "${z2Word}"`);
  console.log(`  Morse Pattern: "${textToMorse(z2Word)}"`);

  // Z3
  const rng3 = createRng(`z3-${t}-seed`);
  const buttonMappings = {
    A: [0, 2, 4, 6].filter(() => rng3() > 0.2),
    B: [1, 3, 5, 7].filter(() => rng3() > 0.2),
    C: [0, 1, 6, 7].filter(() => rng3() > 0.2),
    D: [2, 3, 4, 5].filter(() => rng3() > 0.2),
  };
  if (buttonMappings.A.length === 0) buttonMappings.A = [0, 3, 6];
  if (buttonMappings.B.length === 0) buttonMappings.B = [1, 4, 7];
  if (buttonMappings.C.length === 0) buttonMappings.C = [2, 5];
  if (buttonMappings.D.length === 0) buttonMappings.D = [0, 1, 7];

  const combos = [
    { name: "A + B", pressed: ["A", "B"] },
    { name: "A + C", pressed: ["A", "C"] },
    { name: "A + D", pressed: ["A", "D"] },
    { name: "B + C", pressed: ["B", "C"] },
    { name: "B + D", pressed: ["B", "D"] },
    { name: "C + D", pressed: ["C", "D"] },
    { name: "A + B + D", pressed: ["A", "B", "D"] },
    { name: "A + C + D", pressed: ["A", "C", "D"] },
    { name: "B + C + D", pressed: ["B", "C", "D"] },
  ];
  const choice = combos[Math.floor(rng3() * combos.length)];
  const targetBits = [0, 0, 0, 0, 0, 0, 0, 0];
  choice.pressed.forEach((btn) => {
    buttonMappings[btn].forEach((idx) => {
      targetBits[idx] ^= 1;
    });
  });
  const targetString = targetBits.join("");

  console.log(`Z3 — LOGIC LOCK:`);
  console.log(`  Stage A Target 8-Bit String: "${targetString}"`);
  console.log(`  Stage B Winning Button Sequence: Click ${choice.pressed.join(", then ")}`);
  console.log(`  Stage B Button Mappings:`);
  console.log(`    Button A toggles LEDs: [${buttonMappings.A.map((i) => i + 1).join(", ")}]`);
  console.log(`    Button B toggles LEDs: [${buttonMappings.B.map((i) => i + 1).join(", ")}]`);
  console.log(`    Button C toggles LEDs: [${buttonMappings.C.map((i) => i + 1).join(", ")}]`);
  console.log(`    Button D toggles LEDs: [${buttonMappings.D.map((i) => i + 1).join(", ")}]`);

  // Z4
  const rng4 = createRng(`z4-${t}-seed`);
  const kw = keywords[Math.floor(rng4() * keywords.length)];
  const hexStr = kw.split("").map((c) => c.charCodeAt(0).toString(16).toUpperCase()).join(" ");
  console.log(`Z4 — BINARY VAULT:`);
  console.log(`  Stage 1 (Binary -> ASCII): "HEX: ${hexStr}"`);
  console.log(`  Stage 2 (Hex -> Word): "${kw}"`);
  console.log(`  Stage 3 (Riddle: Who am I?): "RIVO"`);
  console.log(`  Stage 4 (Master Unlock): "RIVO-${kw}-99"`);
  console.log(`  Fragment: "FRAG-${t}X88"`);

  // Z5
  const rng5 = createRng(`z5-${t}-seed`);
  const freq = (1420 + Math.floor(rng5() * 80)).toString();
  const kernelHash = `0xBX${t}`;
  const activationToken = `${kernelHash}-${freq}`;
  console.log(`Z5 — BLACK BOX:`);
  console.log(`  Device ID: "BX-${t}"`);
  console.log(`  Kernel ID: "${kernelHash}"`);
  console.log(`  Hidden Frequency: "${freq} MHz"`);
  console.log(`  Override Password to enter: "${activationToken}"`);
}

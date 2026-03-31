#!/usr/bin/env node

/**
 * Lab Autograder — 6-2 Node.js & npm Lab — CLI Calculator
 *
 * Grades ONLY based on the lab's TODOs / setup items:
 *  - calculator.js
 *  - utils/parser.js
 *  - utils/operation.js
 *
 * Marking:
 * - 80 marks for lab TODOs / structure (top-level checks only)
 * - 20 marks for submission timing
 *   - On/before deadline => 20/20
 *   - After deadline     => 10/20
 *
 * Deadline: 01 Apr 2026 20:59 (Asia/Riyadh, UTC+03:00)
 *
 * Repo layout expected:
 * - repo root may be the project itself OR may contain the project folder
 * - project folder: 6-2-node-npm-main/
 * - grader file:   6-2-node-npm-main/scripts/grade.cjs
 * - student files:
 *      6-2-node-npm-main/calculator.js
 *      6-2-node-npm-main/utils/parser.js
 *      6-2-node-npm-main/utils/operation.js
 *
 * Notes:
 * - Ignores JS comments (starter TODO comments do NOT count).
 * - Very lenient checks: looks for key constructs, not exact code.
 * - Only checks top-level implementation details, not deep correctness.
 * - Folder creation and file creation are included in grading.
 * - npm install / lodash installation is NOT graded.
 * - Manual testing commands are NOT graded.
 * - Accepts either:
 *      utils/operation.js
 *   or utils/operations.js
 *   because the lab text and examples use both forms.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ARTIFACTS_DIR = "artifacts";
const FEEDBACK_DIR = path.join(ARTIFACTS_DIR, "feedback");
fs.mkdirSync(FEEDBACK_DIR, { recursive: true });

/* -----------------------------
   Deadline (Asia/Riyadh)
   01 Apr 2026, 20:59
-------------------------------- */
const DEADLINE_RIYADH_ISO = "2026-04-01T20:59:00+03:00";
const DEADLINE_MS = Date.parse(DEADLINE_RIYADH_ISO);

// Submission marks policy
const SUBMISSION_MAX = 20;
const SUBMISSION_LATE = 10;

/* -----------------------------
   TODO marks (out of 80)
-------------------------------- */
const tasks = [
  { id: "t1", name: "TODO 1: Create required top-level structure (calculator.js, utils/, parser, operation file)", marks: 10 },
  { id: "t2", name: "TODO 2: Import required modules in calculator.js", marks: 10 },
  { id: "t3", name: "TODO 3: Parse command line arguments in calculator.js", marks: 10 },
  { id: "t4", name: "TODO 4: Validate input and calculate result in calculator.js", marks: 10 },
  { id: "t5", name: "TODO 5: Create add() and subtract() in utils/operation(s).js", marks: 10 },
  { id: "t6", name: "TODO 6: Create multiply() and divide() in utils/operation(s).js", marks: 10 },
  { id: "t7", name: "TODO 7: Use lodash and create parseNumbers() in utils/parser.js", marks: 10 },
  { id: "t8", name: "TODO 8: Create isValidOperation() in utils/parser.js", marks: 10 },
];

const STEPS_MAX = tasks.reduce((sum, t) => sum + t.marks, 0); // 80
const TOTAL_MAX = STEPS_MAX + SUBMISSION_MAX; // 100

/* -----------------------------
   Helpers
-------------------------------- */
function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function mdEscape(s) {
  return String(s).replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function splitMarks(stepMarks, missingCount, totalChecks) {
  if (missingCount <= 0) return stepMarks;
  const perItem = stepMarks / totalChecks;
  const deducted = perItem * missingCount;
  return Math.max(0, round2(stepMarks - deducted));
}

/**
 * Strip JS comments while trying to preserve strings/templates.
 */
function stripJsComments(code) {
  if (!code) return code;

  let out = "";
  let i = 0;

  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;

  while (i < code.length) {
    const ch = code[i];
    const next = code[i + 1];

    if (!inDouble && !inTemplate && ch === "'" && !inSingle) {
      inSingle = true;
      out += ch;
      i++;
      continue;
    }
    if (inSingle && ch === "'") {
      let backslashes = 0;
      for (let k = i - 1; k >= 0 && code[k] === "\\"; k--) backslashes++;
      if (backslashes % 2 === 0) inSingle = false;
      out += ch;
      i++;
      continue;
    }

    if (!inSingle && !inTemplate && ch === '"' && !inDouble) {
      inDouble = true;
      out += ch;
      i++;
      continue;
    }
    if (inDouble && ch === '"') {
      let backslashes = 0;
      for (let k = i - 1; k >= 0 && code[k] === "\\"; k--) backslashes++;
      if (backslashes % 2 === 0) inDouble = false;
      out += ch;
      i++;
      continue;
    }

    if (!inSingle && !inDouble && ch === "`" && !inTemplate) {
      inTemplate = true;
      out += ch;
      i++;
      continue;
    }
    if (inTemplate && ch === "`") {
      let backslashes = 0;
      for (let k = i - 1; k >= 0 && code[k] === "\\"; k--) backslashes++;
      if (backslashes % 2 === 0) inTemplate = false;
      out += ch;
      i++;
      continue;
    }

    if (!inSingle && !inDouble && !inTemplate) {
      if (ch === "/" && next === "/") {
        i += 2;
        while (i < code.length && code[i] !== "\n") i++;
        continue;
      }
      if (ch === "/" && next === "*") {
        i += 2;
        while (i < code.length) {
          if (code[i] === "*" && code[i + 1] === "/") {
            i += 2;
            break;
          }
          i++;
        }
        continue;
      }
    }

    out += ch;
    i++;
  }

  return out;
}

function existsFile(p) {
  try {
    return fs.existsSync(p) && fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function existsDir(p) {
  try {
    return fs.existsSync(p) && fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

/* -----------------------------
   Project root detection
-------------------------------- */
const REPO_ROOT = process.cwd();

function isLabProjectFolder(p) {
  try {
    return (
      fs.existsSync(path.join(p, "package.json")) &&
      fs.existsSync(path.join(p, "calculator.js")) &&
      fs.existsSync(path.join(p, "utils"))
    );
  } catch {
    return false;
  }
}

function pickProjectRoot(cwd) {
  if (isLabProjectFolder(cwd)) return cwd;

  const preferred = path.join(cwd, "6-2-node-npm-main");
  if (isLabProjectFolder(preferred)) return preferred;

  let subs = [];
  try {
    subs = fs
      .readdirSync(cwd, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    subs = [];
  }

  for (const name of subs) {
    const p = path.join(cwd, name);
    if (isLabProjectFolder(p)) return p;
  }

  return cwd;
}

const PROJECT_ROOT = pickProjectRoot(REPO_ROOT);

/* -----------------------------
   Find files
-------------------------------- */
const calculatorFile = path.join(PROJECT_ROOT, "calculator.js");
const utilsDir = path.join(PROJECT_ROOT, "utils");
const parserFile = path.join(utilsDir, "parser.js");

const operationFileCandidates = [
  path.join(utilsDir, "operation.js"),
  path.join(utilsDir, "operations.js"),
];

const operationFile = operationFileCandidates.find(existsFile) || null;

/* -----------------------------
   Determine submission time
-------------------------------- */
let lastCommitISO = null;
let lastCommitMS = null;

try {
  lastCommitISO = execSync("git log -1 --format=%cI", { encoding: "utf8" }).trim();
  lastCommitMS = Date.parse(lastCommitISO);
} catch {
  lastCommitISO = new Date().toISOString();
  lastCommitMS = Date.now();
}

/* -----------------------------
   Submission marks
-------------------------------- */
const isLate = Number.isFinite(lastCommitMS) ? lastCommitMS > DEADLINE_MS : true;
const submissionScore = isLate ? SUBMISSION_LATE : SUBMISSION_MAX;

/* -----------------------------
   Load & strip student files
-------------------------------- */
const calculatorRaw = existsFile(calculatorFile) ? safeRead(calculatorFile) : null;
const parserRaw = existsFile(parserFile) ? safeRead(parserFile) : null;
const operationRaw = operationFile ? safeRead(operationFile) : null;

const calculator = calculatorRaw ? stripJsComments(calculatorRaw) : null;
const parser = parserRaw ? stripJsComments(parserRaw) : null;
const operationCode = operationRaw ? stripJsComments(operationRaw) : null;

const results = [];

/* -----------------------------
   Result helpers
-------------------------------- */
function addResult(task, required) {
  const missing = required.filter((r) => !r.ok);
  const score = splitMarks(task.marks, missing.length, required.length);

  results.push({
    id: task.id,
    name: task.name,
    max: task.marks,
    score,
    checklist: required.map((r) => `${r.ok ? "✅" : "❌"} ${r.label}`),
    deductions: missing.length ? missing.map((m) => `Missing: ${m.label}`) : [],
  });
}

function failTask(task, reason) {
  results.push({
    id: task.id,
    name: task.name,
    max: task.marks,
    score: 0,
    checklist: [],
    deductions: [reason],
  });
}

function mkHas(code) {
  return (re) => re.test(code);
}

function anyOf(has, res) {
  return res.some((r) => has(r));
}

/* -----------------------------
   Grade TODOs
-------------------------------- */

/**
 * TODO 1 — Required structure
 */
{
  const required = [
    {
      label: "calculator.js exists in the project root",
      ok: existsFile(calculatorFile),
    },
    {
      label: "utils folder exists in the project root",
      ok: existsDir(utilsDir),
    },
    {
      label: "utils/parser.js exists",
      ok: existsFile(parserFile),
    },
    {
      label: "utils/operation.js or utils/operations.js exists",
      ok: !!operationFile,
    },
  ];

  addResult(tasks[0], required);
}

/**
 * TODO 2 — Imports in calculator.js
 */
{
  if (!calculator) {
    failTask(tasks[1], "calculator.js not found / unreadable.");
  } else {
    const has = mkHas(calculator);

    const required = [
      {
        label: "Imports operation functions from ./utils/operation(s).js",
        ok: anyOf(has, [
          /import\s*\{\s*[^}]*\badd\b[^}]*\bsubtract\b[^}]*\bmultiply\b[^}]*\bdivide\b[^}]*\}\s*from\s*['"]\.\/utils\/operations?\.js['"]/i,
          /import\s*\{\s*[^}]*\}\s*from\s*['"]\.\/utils\/operations?\.js['"]/i,
        ]),
      },
      {
        label: "Imports parser functions from ./utils/parser.js",
        ok: anyOf(has, [
          /import\s*\{\s*[^}]*\bparseNumbers\b[^}]*\bisValidOperation\b[^}]*\}\s*from\s*['"]\.\/utils\/parser\.js['"]/i,
          /import\s*\{\s*[^}]*\}\s*from\s*['"]\.\/utils\/parser\.js['"]/i,
        ]),
      },
      {
        label: 'Imports lodash using: import _ from "lodash"',
        ok: anyOf(has, [
          /import\s+_\s+from\s+['"]lodash['"]/i,
        ]),
      },
    ];

    addResult(tasks[1], required);
  }
}

/**
 * TODO 3 — Parse command line arguments
 */
{
  if (!calculator) {
    failTask(tasks[2], "calculator.js not found / unreadable.");
  } else {
    const has = mkHas(calculator);

    const required = [
      {
        label: "Reads operation from process.argv",
        ok: anyOf(has, [
          /const\s+\w+\s*=\s*process\.argv\s*\[\s*2\s*\]/i,
          /let\s+\w+\s*=\s*process\.argv\s*\[\s*2\s*\]/i,
        ]),
      },
      {
        label: "Reads numbers from process.argv.slice(3)",
        ok: anyOf(has, [
          /process\.argv\.slice\s*\(\s*3\s*\)/i,
        ]),
      },
    ];

    addResult(tasks[2], required);
  }
}

/**
 * TODO 4 — Validate and calculate
 */
{
  if (!calculator) {
    failTask(tasks[3], "calculator.js not found / unreadable.");
  } else {
    const has = mkHas(calculator);

    const required = [
      {
        label: "Checks operation validity using isValidOperation(...)",
        ok: anyOf(has, [
          /isValidOperation\s*\(\s*\w+\s*\)/i,
          /!\s*isValidOperation\s*\(\s*\w+\s*\)/i,
        ]),
      },
      {
        label: "Parses numbers using parseNumbers(...)",
        ok: anyOf(has, [
          /parseNumbers\s*\(\s*\w+\s*\)/i,
        ]),
      },
      {
        label: "Calls one or more operation functions (add/subtract/multiply/divide)",
        ok: anyOf(has, [
          /\badd\s*\(\s*\w+\s*\)/i,
          /\bsubtract\s*\(\s*\w+\s*\)/i,
          /\bmultiply\s*\(\s*\w+\s*\)/i,
          /\bdivide\s*\(\s*\w+\s*\)/i,
        ]),
      },
      {
        label: "Displays the result or invalid-operation message using console.log(...)",
        ok: anyOf(has, [
          /console\.log\s*\(/i,
        ]),
      },
    ];

    addResult(tasks[3], required);
  }
}

/**
 * TODO 5 — add + subtract in operation(s).js
 */
{
  if (!operationCode) {
    failTask(tasks[4], "utils/operation.js or utils/operations.js not found / unreadable.");
  } else {
    const has = mkHas(operationCode);

    const required = [
      {
        label: "Exports add(numbers)",
        ok: anyOf(has, [
          /export\s+function\s+add\s*\(\s*numbers\s*\)/i,
        ]),
      },
      {
        label: "Exports subtract(numbers)",
        ok: anyOf(has, [
          /export\s+function\s+subtract\s*\(\s*numbers\s*\)/i,
        ]),
      },
      {
        label: "add(numbers) returns something other than empty placeholder",
        ok: anyOf(has, [
          /export\s+function\s+add\s*\(\s*numbers\s*\)\s*\{[\s\S]*?return\s+(?!\{\s*\})[\s\S]*?\}/i,
        ]),
      },
      {
        label: "subtract(numbers) returns something other than empty placeholder",
        ok: anyOf(has, [
          /export\s+function\s+subtract\s*\(\s*numbers\s*\)\s*\{[\s\S]*?return\s+(?!\{\s*\})[\s\S]*?\}/i,
        ]),
      },
    ];

    addResult(tasks[4], required);
  }
}

/**
 * TODO 6 — multiply + divide in operation(s).js
 */
{
  if (!operationCode) {
    failTask(tasks[5], "utils/operation.js or utils/operations.js not found / unreadable.");
  } else {
    const has = mkHas(operationCode);

    const required = [
      {
        label: "Exports multiply(numbers)",
        ok: anyOf(has, [
          /export\s+function\s+multiply\s*\(\s*numbers\s*\)/i,
        ]),
      },
      {
        label: "Exports divide(numbers)",
        ok: anyOf(has, [
          /export\s+function\s+divide\s*\(\s*numbers\s*\)/i,
        ]),
      },
      {
        label: "multiply(numbers) returns something other than empty placeholder",
        ok: anyOf(has, [
          /export\s+function\s+multiply\s*\(\s*numbers\s*\)\s*\{[\s\S]*?return\s+(?!\{\s*\})[\s\S]*?\}/i,
        ]),
      },
      {
        label: "divide(numbers) returns something other than empty placeholder",
        ok: anyOf(has, [
          /export\s+function\s+divide\s*\(\s*numbers\s*\)\s*\{[\s\S]*?return\s+(?!\{\s*\})[\s\S]*?\}/i,
        ]),
      },
    ];

    addResult(tasks[5], required);
  }
}

/**
 * TODO 7 — parser lodash + parseNumbers
 */
{
  if (!parser) {
    failTask(tasks[6], "utils/parser.js not found / unreadable.");
  } else {
    const has = mkHas(parser);

    const required = [
      {
        label: 'Imports lodash using: import _ from "lodash"',
        ok: anyOf(has, [
          /import\s+_\s+from\s+['"]lodash['"]/i,
        ]),
      },
      {
        label: "Exports parseNumbers(input)",
        ok: anyOf(has, [
          /export\s+function\s+parseNumbers\s*\(\s*input\s*\)/i,
        ]),
      },
      {
        label: "parseNumbers(...) returns something other than empty placeholder",
        ok: anyOf(has, [
          /export\s+function\s+parseNumbers\s*\(\s*input\s*\)\s*\{[\s\S]*?return\s+(?!\{\s*\})[\s\S]*?\}/i,
        ]),
      },
      {
        label: "Uses lodash helper(s) inside parseNumbers (for example _.map or _.compact)",
        ok: anyOf(has, [
          /parseNumbers\s*\(\s*input\s*\)[\s\S]*?_\.\s*map\s*\(/i,
          /parseNumbers\s*\(\s*input\s*\)[\s\S]*?_\.\s*compact\s*\(/i,
        ]),
      },
    ];

    addResult(tasks[6], required);
  }
}

/**
 * TODO 8 — isValidOperation
 */
{
  if (!parser) {
    failTask(tasks[7], "utils/parser.js not found / unreadable.");
  } else {
    const has = mkHas(parser);

    const required = [
      {
        label: "Exports isValidOperation(operation)",
        ok: anyOf(has, [
          /export\s+function\s+isValidOperation\s*\(\s*operation\s*\)/i,
        ]),
      },
      {
        label: "isValidOperation(...) returns something other than empty placeholder",
        ok: anyOf(has, [
          /export\s+function\s+isValidOperation\s*\(\s*operation\s*\)\s*\{[\s\S]*?return\s+(?!\{\s*\})[\s\S]*?\}/i,
        ]),
      },
      {
        label: "Uses lodash _.includes(...) or equivalent valid-operation membership check",
        ok: anyOf(has, [
          /_\.\s*includes\s*\(/i,
          /\[\s*['"]add['"][\s\S]*['"]subtract['"][\s\S]*['"]multiply['"][\s\S]*['"]divide['"]\s*\]/i,
        ]),
      },
    ];

    addResult(tasks[7], required);
  }
}

/* -----------------------------
   Final scoring
-------------------------------- */
const stepsScore = results.reduce((sum, r) => sum + r.score, 0);
const totalScore = round2(stepsScore + submissionScore);

/* -----------------------------
   Build summary + feedback
-------------------------------- */
const LAB_NAME = "6-2-node-npm-main";

const submissionLine = `- **Lab:** ${LAB_NAME}
- **Deadline (Riyadh / UTC+03:00):** ${DEADLINE_RIYADH_ISO}
- **Last commit time (from git log):** ${lastCommitISO}
- **Submission marks:** **${submissionScore}/${SUBMISSION_MAX}** ${isLate ? "(Late submission)" : "(On time)"}
`;

let summary = `# ${LAB_NAME} — Autograding Summary

## Submission

${submissionLine}

## Files Checked

- Repo root (cwd): ${REPO_ROOT}
- Detected project root: ${PROJECT_ROOT}
- Calculator: ${existsFile(calculatorFile) ? `✅ ${calculatorFile}` : "❌ calculator.js not found"}
- Utils folder: ${existsDir(utilsDir) ? `✅ ${utilsDir}` : "❌ utils folder not found"}
- Parser: ${existsFile(parserFile) ? `✅ ${parserFile}` : "❌ utils/parser.js not found"}
- Operation file: ${operationFile ? `✅ ${operationFile}` : "❌ utils/operation.js or utils/operations.js not found"}

## Marks Breakdown

| Component | Marks |
|---|---:|
`;

for (const r of results) summary += `| ${r.name} | ${r.score}/${r.max} |\n`;
summary += `| Submission (timing) | ${submissionScore}/${SUBMISSION_MAX} |\n`;

summary += `
## Total Marks

**${totalScore} / ${TOTAL_MAX}**

## Detailed Checks (What you did / missed)
`;

for (const r of results) {
  const done = (r.checklist || []).filter((x) => x.startsWith("✅"));
  const missed = (r.checklist || []).filter((x) => x.startsWith("❌"));

  summary += `
<details>
  <summary><strong>${mdEscape(r.name)}</strong> — ${r.score}/${r.max}</summary>

  <br/>

  <strong>✅ Found</strong>
  ${done.length ? "\n" + done.map((x) => `- ${mdEscape(x)}`).join("\n") : "\n- (Nothing detected)"}

  <br/><br/>

  <strong>❌ Missing</strong>
  ${missed.length ? "\n" + missed.map((x) => `- ${mdEscape(x)}`).join("\n") : "\n- (Nothing missing)"}

  <br/><br/>

  <strong>❗ Deductions / Notes</strong>
  ${
    r.deductions && r.deductions.length
      ? "\n" + r.deductions.map((d) => `- ${mdEscape(d)}`).join("\n")
      : "\n- No deductions."
  }

</details>
`;
}

summary += `
> Full feedback is also available in: \`artifacts/feedback/README.md\`
`;

let feedback = `# ${LAB_NAME} — Feedback

## Submission

${submissionLine}

## Files Checked

- Repo root (cwd): ${REPO_ROOT}
- Detected project root: ${PROJECT_ROOT}
- Calculator: ${existsFile(calculatorFile) ? `✅ ${calculatorFile}` : "❌ calculator.js not found"}
- Utils folder: ${existsDir(utilsDir) ? `✅ ${utilsDir}` : "❌ utils folder not found"}
- Parser: ${existsFile(parserFile) ? `✅ ${parserFile}` : "❌ utils/parser.js not found"}
- Operation file: ${operationFile ? `✅ ${operationFile}` : "❌ utils/operation.js or utils/operations.js not found"}

---

## TODO-by-TODO Feedback
`;

for (const r of results) {
  feedback += `
### ${r.name} — **${r.score}/${r.max}**

**Checklist**
${r.checklist.length ? r.checklist.map((x) => `- ${x}`).join("\n") : "- (No checks available)"}

**Deductions / Notes**
${r.deductions.length ? r.deductions.map((d) => `- ❗ ${d}`).join("\n") : "- ✅ No deductions. Good job!"}
`;
}

feedback += `
---

## How marks were deducted (rules)

- JS comments are ignored (so starter TODO comments do NOT count).
- Checks are intentionally light and only verify top-level structure and key constructs.
- Code can be in ANY order; repeated code is allowed.
- Common equivalents are accepted, and variable naming is flexible where possible.
- Folder creation and required file creation are included in the grading.
- lodash installation and manual testing commands are NOT graded.
- Either \`utils/operation.js\` or \`utils/operations.js\` is accepted.
- Missing required items reduce marks proportionally within that TODO.
`;

/* -----------------------------
   Write outputs
-------------------------------- */
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
}

const csv = `student,score,max_score
all_students,${totalScore},${TOTAL_MAX}
`;

fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
fs.writeFileSync(path.join(ARTIFACTS_DIR, "grade.csv"), csv);
fs.writeFileSync(path.join(FEEDBACK_DIR, "README.md"), feedback);

console.log(
  `✔ Lab graded: ${totalScore}/${TOTAL_MAX} (Submission: ${submissionScore}/${SUBMISSION_MAX}, TODOs: ${stepsScore}/${STEPS_MAX}).`
);
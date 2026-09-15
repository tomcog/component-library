// Cut a release and move every app onto it, in one command.
//
//   npm run release              # minor: 0.35.0 -> 0.36.0 (the usual case)
//   npm run release -- patch     # a fix that changes nothing visible
//   npm run release -- major
//   npm run release -- --push    # also push each app's commit (may deploy it)
//   npm run release -- --dry-run # show what would be released, change nothing
//
// Steps: check the repo is committed and not behind origin, typecheck, build,
// bump the version, stamp the changelog, commit, tag, push, then run
// sync-consumers.mjs to reinstall the tag in every app and commit the bump.
//
// The changelog: if CHANGELOG.md has an "**Unreleased" entry it is renamed to
// "**A -> B"; otherwise an entry is written from the commit subjects since the
// last tag. Write an Unreleased entry by hand when a release renames or
// removes a token - apps only find out about those from the changelog.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const LIB = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const level = args.find((a) => ["patch", "minor", "major"].includes(a)) ?? "minor";
const push = args.includes("--push");
const dryRun = args.includes("--dry-run");

const sh = (cmd, argv, opts = {}) =>
  execFileSync(cmd, argv, { cwd: LIB, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts }).trim();
const loud = (cmd, argv) => execFileSync(cmd, argv, { cwd: LIB, stdio: "inherit" });
const fail = (msg) => { console.error(`\nrelease: ${msg}`); process.exit(1); };

// -- preflight ------------------------------------------------------------
if (sh("git", ["rev-parse", "--abbrev-ref", "HEAD"]) !== "main") fail("not on main.");
const dirty = sh("git", ["status", "--porcelain"]);
if (dirty) fail(`uncommitted changes - commit them first:\n${dirty}`);
sh("git", ["fetch", "origin", "main", "--tags"]);
if (Number(sh("git", ["rev-list", "--count", "HEAD..origin/main"])) > 0) {
  fail("main is behind origin/main - pull first.");
}

const pkgPath = join(LIB, "package.json");
const pkgText = readFileSync(pkgPath, "utf8");
const from = JSON.parse(pkgText).version;
const [maj, min, pat] = from.split(".").map(Number);
const to = level === "major" ? `${maj + 1}.0.0` : level === "minor" ? `${maj}.${min + 1}.0` : `${maj}.${min}.${pat + 1}`;

const lastTag = `v${from}`;
const tags = sh("git", ["tag", "--list", lastTag]);
const since = tags ? lastTag : null;
const subjects = sh("git", ["log", "--format=%s", since ? `${since}..HEAD` : "-20"])
  .split("\n").filter((s) => s && !/^Release \d/.test(s));
if (subjects.length === 0) fail(`nothing to release - no commits since ${lastTag}.`);
if (sh("git", ["tag", "--list", `v${to}`])) fail(`tag v${to} already exists.`);

console.log(`Releasing ${from} -> ${to} (${level}):`);
for (const s of subjects) console.log(`  - ${s}`);
if (dryRun) { console.log("\n--dry-run: nothing changed."); process.exit(0); }

// -- verify ---------------------------------------------------------------
console.log("\nTypecheck and build...");
loud("npm", ["run", "typecheck", "--silent"]);
loud("npm", ["run", "build", "--silent"]);
if (!readFileSync(join(LIB, "dist", "style.css"), "utf8").startsWith("@layer ui{")) {
  fail("dist/style.css is not wrapped in @layer ui - the build is broken.");
}

// -- version + changelog --------------------------------------------------
writeFileSync(pkgPath, pkgText.replace(`"version": "${from}"`, `"version": "${to}"`));

const clPath = join(LIB, "CHANGELOG.md");
let cl = readFileSync(clPath, "utf8");
const unreleased = /\*\*Unreleased(?: \([^)]*\))?/;
if (unreleased.test(cl)) {
  cl = cl.replace(unreleased, `**${from} -> ${to}`);
} else {
  const entry = `**${from} -> ${to}** - ${subjects.join("; ")}.\n\n`;
  const at = cl.search(/^\*\*\d+\.\d+\.\d+ -> /m);
  cl = at === -1 ? `${cl.trimEnd()}\n\n${entry}` : cl.slice(0, at) + entry + cl.slice(at);
}
writeFileSync(clPath, cl);

// -- commit, tag, push ----------------------------------------------------
sh("git", ["add", "package.json", "CHANGELOG.md"]);
sh("git", ["commit", "-m", `Release ${to}`]);
sh("git", ["tag", `v${to}`]);
console.log(`\nPushing main and v${to}...`);
loud("git", ["push", "origin", "main", `v${to}`]);

// -- apps -----------------------------------------------------------------
console.log("");
loud("node", [join(LIB, "scripts", "sync-consumers.mjs"), to, ...(push ? ["--push"] : [])]);

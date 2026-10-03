// Move every app in ~/Sites that depends on @tomcoggia/ui onto one release tag.
//
//   npm run sync-consumers              # the version in package.json
//   npm run sync-consumers -- 0.35.0    # a specific release
//   npm run sync-consumers -- --push    # also push each app's commit
//
// For each app: repoint any `allowScripts` approval of @tomcoggia/ui to the new
// version, reinstall the tag, check the installed package really is that
// version WITH a built dist/ (npm 11 warns about git-dependency `prepare`
// scripts, and a blocked prepare installs an empty package without failing),
// then commit package.json + package-lock.json - and nothing else - on
// whatever branch the app is on. Pushing is opt-in, because pushing an app can
// deploy it.
//
// The allowScripts approval is per version ("@tomcoggia/ui@0.78.0": true). Left
// on the old version, the local install can still pass - the old build is on
// disk - while a fresh install on the host skips prepare and the deploy breaks.
// So it moves with the dependency, before the install.
//
// An app is committed only when the ONLY changes in its package.json are the
// @tomcoggia/ui lines (the dependency and its allowScripts approval), so
// dependency edits in progress are never swept into the commit; those apps are
// updated and left for you to commit.
//
// --push applies the same rule to what leaves the machine: an app is pushed
// only when every unpushed commit on its branch is one of these "Move to"
// commits - including ones from an earlier run - so app work nobody asked to
// ship never rides out with a version bump. Anything else is reported, not
// pushed.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const LIB = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITES = resolve(LIB, "..");
const PKG = "@tomcoggia/ui";
const REPO = "github:tomcog/component-library";

const args = process.argv.slice(2);
const push = args.includes("--push");
const version =
  args.find((a) => /^\d+\.\d+\.\d+$/.test(a)) ??
  JSON.parse(readFileSync(join(LIB, "package.json"), "utf8")).version;
const tag = `v${version}`;
const spec = `${REPO}#${tag}`;

const run = (cmd, argv, cwd, opts = {}) =>
  execFileSync(cmd, argv, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts });
const git = (cwd, ...argv) => run("git", argv, cwd).trim();

/** package.json files up to three levels under ~/Sites, skipping node_modules and this repo. */
function findConsumers() {
  const found = [];
  const walk = (dir, depth) => {
    if (depth > 3) return;
    let entries;
    try { entries = readdirSync(dir); } catch { return; }
    for (const name of entries) {
      if (name === "node_modules" || name.startsWith(".")) continue;
      const full = join(dir, name);
      if (full === LIB) continue;
      let st;
      try { st = statSync(full); } catch { continue; }
      if (st.isDirectory()) walk(full, depth + 1);
      else if (name === "package.json") {
        try {
          const p = JSON.parse(readFileSync(full, "utf8"));
          const ref = p.dependencies?.[PKG] ?? p.devDependencies?.[PKG];
          if (typeof ref === "string" && ref.startsWith(REPO)) found.push({ dir, ref });
        } catch { /* not JSON we can read */ }
      }
    }
  };
  walk(SITES, 1);
  return found;
}

// An allowScripts key approving one version of this package, e.g. "@tomcoggia/ui@0.78.0"
const APPROVAL = new RegExp(`"${PKG.replace(/[/.]/g, "\\$&")}@\\d+\\.\\d+\\.\\d+"`, "g");

/**
 * Repoint the app's allowScripts approval of this package at `version`, editing
 * the text so the file's formatting is untouched. Returns true if it changed.
 * Apps with no allowScripts entry for the package are left alone.
 */
function syncAllowScripts(dir) {
  const file = join(dir, "package.json");
  const text = readFileSync(file, "utf8");
  if (!JSON.parse(text).allowScripts) return false;
  const next = text.replace(APPROVAL, `"${PKG}@${version}"`);
  if (next === text) return false;
  writeFileSync(file, next);
  return true;
}

function gitRoot(dir) {
  try { return git(dir, "rev-parse", "--show-toplevel"); } catch { return null; }
}

const MOVE = `Move to ${PKG} v`;

/** Push the branch if it is ahead and everything ahead is ours; returns a status suffix. */
function pushIfOurs(root, branch) {
  let upstream;
  try { upstream = git(root, "rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"); }
  catch { return ", NOT pushed - branch has no upstream"; }
  const ahead = git(root, "log", "--format=%s", `${upstream}..HEAD`).split("\n").filter(Boolean);
  if (ahead.length === 0) return ", already pushed";
  const other = ahead.filter((subject) => !subject.startsWith(MOVE));
  if (other.length) {
    return `, NOT pushed - ${other.length} other unpushed commit(s): "${other[0]}"` +
      (other.length > 1 ? ", ..." : "");
  }
  git(root, "push", "origin", branch);
  return `, pushed (${ahead.length} commit${ahead.length > 1 ? "s" : ""})`;
}

const results = [];
const consumers = findConsumers();
if (consumers.length === 0) {
  console.log(`No app under ${SITES} depends on ${PKG}.`);
  process.exit(0);
}
console.log(`Moving ${consumers.length} app(s) to ${PKG}@${tag}\n`);

for (const { dir, ref } of consumers) {
  const name = relative(SITES, dir);
  const row = { name, from: ref.split("#")[1] ?? ref, status: "" };
  results.push(row);
  try {
    const installed = join(dir, "node_modules", PKG, "package.json");
    const current = existsSync(installed) ? JSON.parse(readFileSync(installed, "utf8")).version : null;

    // Before installing, or npm 11 may skip the new version's prepare build
    const approvalMoved = syncAllowScripts(dir);
    if (approvalMoved) console.log(`${name}: allowScripts now approves ${PKG}@${version}`);

    if (ref !== spec || current !== version) {
      process.stdout.write(`${name}: installing ${tag}... `);
      run("npm", ["install", `${PKG}@${spec}`, "--no-audit", "--no-fund"], dir);
      console.log("done");
    }

    // A git dependency is built by its `prepare` script at install time. If npm
    // ever blocks it, the install "succeeds" with no dist/ - catch that here.
    const got = JSON.parse(readFileSync(installed, "utf8")).version;
    if (got !== version) throw new Error(`installed ${got}, expected ${version}`);
    if (!existsSync(join(dir, "node_modules", PKG, "dist", "index.js")) ||
        !existsSync(join(dir, "node_modules", PKG, "dist", "style.css"))) {
      throw new Error(`${PKG} installed without dist/ - npm skipped its prepare (build) script`);
    }

    const root = gitRoot(dir);
    if (!root) { row.status = `updated (not a git repo, nothing committed)`; continue; }
    const rel = (f) => relative(root, join(dir, f));
    const files = ["package.json", "package-lock.json"].filter((f) => existsSync(join(dir, f))).map(rel);

    const branch = git(root, "rev-parse", "--abbrev-ref", "HEAD");
    const changed = git(root, "status", "--porcelain", "--", ...files);
    if (!changed) {
      // Committed by an earlier run - but maybe not pushed, which is exactly
      // the case a later `--push` exists for.
      row.status = `already on ${tag}, committed`;
    } else {
      // Only commit when the package.json changes are this dependency (and its
      // allowScripts approval) and nothing else.
      const diff = git(root, "diff", "-U0", "--", rel("package.json"));
      const edits = diff.split("\n").filter((l) => /^[+-](?![+-])/.test(l));
      const onlyOurs = edits.every((l) => l.includes(`"${PKG}"`) || l.includes(`"${PKG}@`));
      if (!onlyOurs) {
        row.status = `updated, NOT committed - package.json has other uncommitted changes`;
        continue;
      }

      git(root, "add", "--", ...files);
      git(root, "commit", "-m", `${MOVE}${version}`, "--", ...files);
      row.status = `committed on ${branch}`;
    }

    if (push) row.status += pushIfOurs(root, branch);
  } catch (err) {
    row.status = `FAILED: ${String(err.stderr || err.message).trim().split("\n").slice(-3).join(" | ")}`;
    console.log("");
  }
}

console.log("");
for (const r of results) console.log(`  ${r.name.padEnd(24)} ${r.from.padEnd(10)} -> ${tag}   ${r.status}`);
if (!push && results.some((r) => r.status.startsWith("committed"))) {
  console.log(`\nCommits are local. Push each app when you want it deployed (or rerun with --push).`);
}
if (results.some((r) => r.status.startsWith("FAILED"))) process.exit(1);

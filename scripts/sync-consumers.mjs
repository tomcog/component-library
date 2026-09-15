// Move every app in ~/Sites that depends on @tomcoggia/ui onto one release tag.
//
//   npm run sync-consumers              # the version in package.json
//   npm run sync-consumers -- 0.35.0    # a specific release
//   npm run sync-consumers -- --push    # also push each app's commit
//
// For each app: reinstall the tag, check the installed package really is that
// version WITH a built dist/ (npm 11 warns about git-dependency `prepare`
// scripts, and a blocked prepare installs an empty package without failing),
// then commit package.json + package-lock.json - and nothing else - on
// whatever branch the app is on. Pushing is opt-in, because pushing an app can
// deploy it.
//
// An app is committed only when the ONLY change in its package.json is the
// @tomcoggia/ui line, so dependency edits in progress are never swept into the
// commit; those apps are updated and left for you to commit.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
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

function gitRoot(dir) {
  try { return git(dir, "rev-parse", "--show-toplevel"); } catch { return null; }
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

    const changed = git(root, "status", "--porcelain", "--", ...files);
    if (!changed) { row.status = `already on ${tag}, committed`; continue; }

    // Only commit when the package.json change is this dependency and nothing else.
    const diff = git(root, "diff", "-U0", "--", rel("package.json"));
    const edits = diff.split("\n").filter((l) => /^[+-](?![+-])/.test(l));
    const onlyOurs = edits.every((l) => l.includes(`"${PKG}"`));
    if (!onlyOurs) {
      row.status = `updated, NOT committed - package.json has other uncommitted changes`;
      continue;
    }

    git(root, "add", "--", ...files);
    git(root, "commit", "-m", `Move to ${PKG} ${tag}`, "--", ...files);
    const branch = git(root, "rev-parse", "--abbrev-ref", "HEAD");
    row.status = `committed on ${branch}`;

    if (push) {
      git(root, "push", "origin", branch);
      row.status += ", pushed";
    }
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

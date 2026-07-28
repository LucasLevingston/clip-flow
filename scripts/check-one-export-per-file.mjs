#!/usr/bin/env node
// Enforces "1 função/classe por arquivo" (SRP convention). Heuristic,
// line-based: counts top-level (column-0) exported function/class/const
// declarations per file. Barrel files (index.ts), type-only files
// (types.ts, constants.ts) and tests are exempt.
import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

const ROOTS = ["apps", "packages"]
const SKIP_DIRS = new Set(["node_modules", "dist", ".next", "coverage", ".turbo", "generated"])
// layout.tsx/route.ts are Next.js App Router conventions that mandate
// multiple exports from one file (metadata + component; one fn per HTTP
// verb) — framework-shaped, not a developer SRP choice.
const EXEMPT_SUFFIXES = [
  "index.ts",
  "index.tsx",
  "types.ts",
  "constants.ts",
  "d.ts",
  "layout.tsx",
  "route.ts",
]
const TEST_PATTERN = /\.(test|spec)\.tsx?$/
const TOP_LEVEL_EXPORT = /^export\s+(default\s+)?(function|class|const|let)\s+\w/

function isExempt(filePath) {
  const base = path.basename(filePath)
  return EXEMPT_SUFFIXES.some((suffix) => base.endsWith(suffix)) || TEST_PATTERN.test(base)
}

function isSourceFile(filePath) {
  return /\/src\/.*\.tsx?$/.test(filePath.replace(/\\/g, "/"))
}

function walk(dir, out) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue
    const full = path.join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      walk(full, out)
    } else if (isSourceFile(full)) {
      out.push(full)
    }
  }
}

function collectAllSourceFiles() {
  const out = []
  for (const root of ROOTS) {
    try {
      walk(root, out)
    } catch {
      // root doesn't exist yet — fine during early scaffolding
    }
  }
  return out
}

function countTopLevelExports(source) {
  return source.split("\n").filter((line) => TOP_LEVEL_EXPORT.test(line)).length
}

function collectTargets(args) {
  if (args.includes("--all")) {
    return collectAllSourceFiles()
  }
  return args.filter((arg) => /\.tsx?$/.test(arg))
}

function main() {
  const targets = collectTargets(process.argv.slice(2)).filter((f) => !isExempt(f))
  const violations = []

  for (const file of targets) {
    const source = readFileSync(file, "utf8")
    const count = countTopLevelExports(source)
    if (count > 1) {
      violations.push({ file, count })
    }
  }

  if (violations.length > 0) {
    console.error("One export per file violated:")
    for (const { file, count } of violations) {
      console.error(`  ${file} — ${count} top-level exports (max 1)`)
    }
    process.exit(1)
  }
}

main()

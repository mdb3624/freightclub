#!/usr/bin/env node
/**
 * Fails the build if any navigate('/path') or <Link to="/path"> call in
 * frontend/src targets a URL that isn't registered as a <Route path="...">
 * in App.tsx.
 *
 * Root cause this guards against: ActionZone.tsx navigated to
 * '/shipper/loads/:id/documents' and '/shipper/documents', neither of which
 * was ever registered, so the app's catch-all route silently sent shippers
 * to the home page instead of their documents. This script would have
 * caught that mismatch before merge.
 *
 * Known limitation: matching is segment-count-based, so a static path with
 * the same segment count as a registered dynamic route (e.g. a typo'd
 * "/shipper/loads/oops" against the real "/shipper/loads/:id") will not be
 * flagged, since it's indistinguishable from a valid dynamic value. This
 * script catches wrong segment *counts* and wrong *static* segments
 * reliably (which is what all five bugs found during development of this
 * check turned out to be) but cannot catch every possible typo.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC_DIR = join(__dirname, '..', 'src')
const APP_FILE = join(SRC_DIR, 'App.tsx')

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      walk(full, files)
    } else if (/\.(tsx?|jsx?)$/.test(entry) && !/\.(test|spec)\.[jt]sx?$/.test(entry)) {
      files.push(full)
    }
  }
  return files
}

function extractRegisteredRoutes(appSource) {
  const routes = []
  const re = /<Route\b[\s\S]*?path="([^"]+)"/g
  let match
  while ((match = re.exec(appSource)) !== null) {
    routes.push(match[1])
  }
  return routes
}

function extractNavTargets(files) {
  const targets = [] // { path, file, kind }
  const patterns = [
    { re: /\bnavigate\(\s*'([^']+)'/g, kind: 'navigate' },
    { re: /\bnavigate\(\s*"([^"]+)"/g, kind: 'navigate' },
    { re: /\bnavigate\(\s*`([^`]+)`/g, kind: 'navigate (template)' },
    { re: /\bto="([^"]+)"/g, kind: 'Link to' },
    { re: /\bto=\{`([^`]+)`\}/g, kind: 'Link to (template)' },
  ]
  for (const file of files) {
    const source = readFileSync(file, 'utf8')
    for (const { re, kind } of patterns) {
      let match
      re.lastIndex = 0
      while ((match = re.exec(source)) !== null) {
        targets.push({ path: match[1], file, kind })
      }
    }
  }
  return targets
}

function normalizeSegments(path) {
  // Strip query string / hash, split into segments, treat route params
  // (":id") and template interpolations ("${...}") as wildcards.
  const clean = path.split('?')[0].split('#')[0]
  return clean.split('/').filter((s) => s.length > 0).map((seg) =>
    seg.startsWith(':') || seg.includes('${') ? '*' : seg
  )
}

function matchesAnyRoute(navPath, routeSegmentsList) {
  const navSegments = normalizeSegments(navPath)
  return routeSegmentsList.some((routeSegments) => {
    if (routeSegments.length !== navSegments.length) return false
    return routeSegments.every((seg, i) => seg === '*' || navSegments[i] === '*' || seg === navSegments[i])
  })
}

function isSkippable(path) {
  if (!path.startsWith('/')) return true // relative, hash-only, external, etc.
  if (path.startsWith('//')) return true // protocol-relative external URL
  return false
}

const appSource = readFileSync(APP_FILE, 'utf8')
const registeredRoutes = extractRegisteredRoutes(appSource).filter((p) => p !== '*')
const registeredSegments = registeredRoutes.map(normalizeSegments)

const files = walk(SRC_DIR)
const navTargets = extractNavTargets(files)

const failures = []
const checked = new Set()
for (const { path, file, kind } of navTargets) {
  if (isSkippable(path)) continue
  const key = `${path}::${kind}`
  if (checked.has(key)) continue
  checked.add(key)
  if (!matchesAnyRoute(path, registeredSegments)) {
    failures.push({ path, file, kind })
  }
}

console.log(`Registered routes (${registeredRoutes.length}):`)
for (const r of registeredRoutes) console.log(`  ${r}`)
console.log(`\nChecked ${checked.size} unique navigation target(s) across ${files.length} file(s).`)

if (failures.length > 0) {
  console.error('\n❌ Route consistency check FAILED — navigation target(s) with no matching <Route>:\n')
  for (const f of failures) {
    console.error(`  ${f.path}  (${f.kind}, in ${f.file.replace(SRC_DIR, 'src')})`)
  }
  console.error('\nEither register a matching <Route path="..."> in App.tsx, or fix the navigation target.')
  process.exit(1)
} else {
  console.log('\n✅ Route consistency check passed — every navigation target matches a registered route.')
}

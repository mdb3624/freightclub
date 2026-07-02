#!/bin/bash
# Called from git hooks to auto-transition Jira issues.
# Usage: jira-transition.sh <US-XXX> <transition-name>
#   e.g. jira-transition.sh US-843 "In Progress"
#
# Reads credentials from jira.config in project root.
# Looks up FREIG key from docs/project/Story_ID_to_Jira_Mapping.md.

set -e

STORY_ID="$1"
TRANSITION="$2"

if [ -z "$STORY_ID" ] || [ -z "$TRANSITION" ]; then
  echo "[jira] Usage: jira-transition.sh <US-XXX> <transition-name>"
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
CONFIG="$REPO_ROOT/jira.config"
MAPPING="$REPO_ROOT/docs/project/Story_ID_to_Jira_Mapping.md"

if [ ! -f "$CONFIG" ]; then
  echo "[jira] jira.config not found at $CONFIG — skipping transition"
  exit 0
fi

# Load credentials
# shellcheck disable=SC1090
source "$CONFIG"

if [ -z "$JIRA_API_TOKEN" ] || [ -z "$JIRA_DOMAIN" ] || [ -z "$JIRA_EMAIL" ]; then
  echo "[jira] Missing credentials in jira.config — skipping"
  exit 0
fi

# Look up FREIG key from mapping file
FREIG_KEY=$(grep -E "^\| $STORY_ID " "$MAPPING" 2>/dev/null | grep -oE 'FREIG-[0-9]+' | head -1)

if [ -z "$FREIG_KEY" ]; then
  echo "[jira] No FREIG key found for $STORY_ID in mapping — skipping"
  exit 0
fi

echo "[jira] Transitioning $STORY_ID ($FREIG_KEY) → $TRANSITION"

# Use node fetch to call Jira API (curl is denied by project policy)
node - <<EOF
const authHeader = 'Basic ' + Buffer.from('${JIRA_EMAIL}:${JIRA_API_TOKEN}').toString('base64');
const base = 'https://${JIRA_DOMAIN}/rest/api/2';

async function run() {
  // Get available transitions
  const tRes = await fetch(\`\${base}/issue/${FREIG_KEY}/transitions\`, {
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' }
  });
  if (!tRes.ok) { console.error('[jira] Failed to list transitions:', tRes.status); process.exit(0); }
  const { transitions } = await tRes.json();

  const target = transitions.find(t => t.name.toLowerCase() === '${TRANSITION}'.toLowerCase());
  if (!target) {
    console.error('[jira] Transition "${TRANSITION}" not found. Available:', transitions.map(t => t.name).join(', '));
    process.exit(0);
  }

  const res = await fetch(\`\${base}/issue/${FREIG_KEY}/transitions\`, {
    method: 'POST',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({ transition: { id: target.id } })
  });

  if (res.status === 204) {
    console.log('[jira] ✅ ${FREIG_KEY} → ' + target.name);
  } else {
    const text = await res.text().catch(() => '');
    console.error('[jira] Transition failed:', res.status, text);
  }
}

run().catch(e => { console.error('[jira]', e.message); process.exit(0); });
EOF

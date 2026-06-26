#!/bin/bash
# Loads Jira credentials from jira.config and launches the jira-write-mcp server
# (transitions, comments, attachments, issue creation/updates).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/../jira.config"

set -a
source "$CONFIG_FILE"
set +a

export JIRA_INSTANCE_URL="https://${JIRA_DOMAIN}"
export JIRA_USER_EMAIL="${JIRA_EMAIL}"
export JIRA_API_KEY="${JIRA_API_TOKEN}"

exec node "$SCRIPT_DIR/jira-write-mcp/index.js"

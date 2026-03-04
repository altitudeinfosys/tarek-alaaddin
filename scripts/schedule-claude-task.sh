#!/bin/bash
# schedule-claude-task.sh
# Wrapper script for scheduled Claude Code tasks (called by both `at` and `cron`).
# Sets up the environment, runs the command via Claude CLI, and logs output.
#
# Usage: schedule-claude-task.sh "<command>" "<description>"
#   <command>     - The prompt to send to Claude (e.g., "Run /pipeline-run")
#   <description> - Short label for the log file name (e.g., "pipeline-run")

set -euo pipefail

# --- Configuration ---
REPO_DIR="/Users/tarekalaaddin/Projects/code/tarek-alaaddin"
LOG_DIR="${REPO_DIR}/logs/scheduled"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

# --- Arguments ---
COMMAND="${1:?Usage: schedule-claude-task.sh \"<command>\" \"<description>\"}"
DESCRIPTION="${2:-scheduled-task}"

# Sanitize description for filename (replace spaces/special chars with dashes)
SAFE_DESC=$(echo "${DESCRIPTION}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')

LOG_FILE="${LOG_DIR}/${TIMESTAMP}-${SAFE_DESC}.log"

# --- Ensure PATH includes claude CLI and common tools ---
export PATH="/Users/tarekalaaddin/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH}"

# --- Ensure log directory exists ---
mkdir -p "${LOG_DIR}"

# --- Logging helper ---
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "${LOG_FILE}"
}

# --- Main ---
log "=========================================="
log "Scheduled task: ${DESCRIPTION}"
log "Command: ${COMMAND}"
log "Log file: ${LOG_FILE}"
log "=========================================="

cd "${REPO_DIR}"

# Ensure Chrome is running (needed for browser automation tasks)
if ! pgrep -x "Google Chrome" > /dev/null 2>&1; then
    log "Chrome is not running. Opening Chrome..."
    open -a "Google Chrome"
    sleep 10
    log "Chrome started."
else
    log "Chrome is already running."
fi

# Run the Claude CLI command
if claude -p "${COMMAND}" >> "${LOG_FILE}" 2>&1; then
    log "Task completed successfully."
    EXIT_CODE=0
else
    EXIT_CODE=$?
    log "Task failed with exit code ${EXIT_CODE}."
fi

log "=========================================="
log "Scheduled task finished: ${DESCRIPTION}"
log "=========================================="

exit ${EXIT_CODE}

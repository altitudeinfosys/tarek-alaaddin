#!/bin/bash
# schedule-claude-task.sh
# Wrapper script for scheduled Claude Code tasks (called by both `at` and `cron`).
# Sets up the environment, runs the command via Claude CLI, and logs output.
#
# Usage: schedule-claude-task.sh "<command>" "<description>"
#   <command>     - The prompt to send to Claude (e.g., "Run /pipeline-run")
#   <description> - Short label for the log file name (e.g., "pipeline-run")
#
# macOS compatible: uses mkdir-based locking and portable timeout (no GNU coreutils needed).

set -euo pipefail

# --- Configuration ---
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="${REPO_DIR}/logs/scheduled"
LOCK_DIR="${LOG_DIR}/.locks"
TIMESTAMP=$(date -u +"%Y%m%d-%H%M%S")
TASK_TIMEOUT=3600  # 1 hour max per task
LOG_RETENTION_DAYS=30

# --- Arguments ---
COMMAND="${1:?Usage: schedule-claude-task.sh \"<command>\" \"<description>\"}"
DESCRIPTION="${2:-scheduled-task}"

# Sanitize description for filename (locale-safe, guard against empty result)
SAFE_DESC=$(printf '%s' "${DESCRIPTION}" | LC_ALL=C tr 'A-Z' 'a-z' | LC_ALL=C sed 's/[^a-z0-9]/-/g; s/--*/-/g; s/^-//; s/-$//')
if [ -z "${SAFE_DESC}" ]; then
    SAFE_DESC="task"
fi

LOG_FILE="${LOG_DIR}/${TIMESTAMP}-${SAFE_DESC}.log"
LOCK_PATH="${LOCK_DIR}/${SAFE_DESC}.lock"

# --- Ensure PATH includes claude CLI and common tools ---
export PATH="${HOME}/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH}"

# --- Ensure directories exist ---
mkdir -p "${LOG_DIR}" "${LOCK_DIR}"

# --- Portable lock using mkdir (atomic on all POSIX systems) ---
acquire_lock() {
    if mkdir "${LOCK_PATH}" 2>/dev/null; then
        # Write PID for diagnostics
        echo $$ > "${LOCK_PATH}/pid"
        return 0
    fi
    # Check if the holding process is still alive (stale lock detection)
    if [ -f "${LOCK_PATH}/pid" ]; then
        local holding_pid
        holding_pid=$(cat "${LOCK_PATH}/pid" 2>/dev/null || echo "")
        if [ -n "${holding_pid}" ] && ! kill -0 "${holding_pid}" 2>/dev/null; then
            # Stale lock — previous process died without cleanup
            rm -rf "${LOCK_PATH}"
            if mkdir "${LOCK_PATH}" 2>/dev/null; then
                echo $$ > "${LOCK_PATH}/pid"
                return 0
            fi
        fi
    fi
    return 1
}

release_lock() {
    rm -rf "${LOCK_PATH}"
}

if ! acquire_lock; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] SKIPPED: ${DESCRIPTION} — another instance is already running (lock: ${LOCK_PATH})" >> "${LOG_FILE}"
    exit 0
fi
trap release_lock EXIT

# --- Logging helper ---
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "${LOG_FILE}"
}

# --- Portable timeout (uses gtimeout/timeout if available, else background+kill) ---
run_with_timeout() {
    local timeout_secs="$1"
    shift

    # Prefer GNU timeout (gtimeout on macOS via Homebrew, timeout on Linux)
    if command -v gtimeout >/dev/null 2>&1; then
        gtimeout "${timeout_secs}" "$@"
        return $?
    elif command -v timeout >/dev/null 2>&1; then
        timeout "${timeout_secs}" "$@"
        return $?
    fi

    # Fallback: background the command and kill after timeout
    "$@" &
    local cmd_pid=$!

    (
        sleep "${timeout_secs}"
        if kill -0 "${cmd_pid}" 2>/dev/null; then
            kill -TERM "${cmd_pid}" 2>/dev/null
            sleep 5
            kill -9 "${cmd_pid}" 2>/dev/null || true
        fi
    ) &
    local watchdog_pid=$!

    if wait "${cmd_pid}" 2>/dev/null; then
        kill "${watchdog_pid}" 2>/dev/null || true
        wait "${watchdog_pid}" 2>/dev/null || true
        return 0
    else
        local exit_code=$?
        kill "${watchdog_pid}" 2>/dev/null || true
        wait "${watchdog_pid}" 2>/dev/null || true
        # Check if the process was killed by our watchdog (timed out)
        if ! kill -0 "${cmd_pid}" 2>/dev/null && [ ${exit_code} -gt 128 ]; then
            return 124  # Match GNU timeout's exit code for timeout
        fi
        return ${exit_code}
    fi
}

# --- Clean up old logs ---
find "${LOG_DIR}" -name "*.log" -type f -mtime +${LOG_RETENTION_DAYS} -delete 2>/dev/null || true

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
    if open -a "Google Chrome" 2>/dev/null; then
        sleep 10
        log "Chrome started."
    else
        log "WARNING: Failed to open Chrome. Browser automation tasks may fail."
    fi
else
    log "Chrome is already running."
fi

# Run the Claude CLI command with timeout
if run_with_timeout "${TASK_TIMEOUT}" claude -p "${COMMAND}" >> "${LOG_FILE}" 2>&1; then
    log "Task completed successfully."
    EXIT_CODE=0
else
    EXIT_CODE=$?
    if [ ${EXIT_CODE} -eq 124 ]; then
        log "Task TIMED OUT after ${TASK_TIMEOUT} seconds."
    else
        log "Task failed with exit code ${EXIT_CODE}."
    fi
fi

log "=========================================="
log "Scheduled task finished: ${DESCRIPTION}"
log "=========================================="

exit ${EXIT_CODE}

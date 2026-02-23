#!/bin/bash
# pipeline-orchestrator.sh
# Orchestrates the content pipeline by generating 3 random posting times
# between 6am-10pm (at least 4 hours apart), then invoking Claude Code CLI
# at each scheduled time.
#
# Triggered daily at midnight by launchd (com.tarek.content-pipeline.plist)

set -euo pipefail

# --- Configuration ---
REPO_DIR="/Users/tarekalaaddin/Projects/code/tarek-alaaddin"
LOG_DIR="${REPO_DIR}/logs/pipeline"
SCREENSHOT_DIR="${LOG_DIR}/screenshots"
MAX_RUNS_PER_DAY=3
MIN_HOURS_APART=4
WINDOW_START=6   # 6:00 AM
WINDOW_END=22    # 10:00 PM (22:00)
DATE_TAG=$(date +"%Y%m%d")
SCHEDULE_LOG="${LOG_DIR}/schedule.log"

# --- Ensure directories exist ---
mkdir -p "${LOG_DIR}" "${SCREENSHOT_DIR}"

# --- Logging helper ---
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "${SCHEDULE_LOG}"
}

# --- Generate random time (hour) within window ---
random_hour() {
    local min=$1
    local max=$2
    echo $(( min + RANDOM % (max - min + 1) ))
}

# --- Generate random minute (0-59) ---
random_minute() {
    echo $(( RANDOM % 60 ))
}

# --- Ensure Chrome is running ---
ensure_chrome() {
    if ! pgrep -x "Google Chrome" > /dev/null 2>&1; then
        log "Chrome is not running. Opening Chrome..."
        open -a "Google Chrome"
        sleep 10  # Give Chrome time to start
        log "Chrome started."
    else
        log "Chrome is already running."
    fi
}

# --- Run a single pipeline invocation ---
run_pipeline() {
    local run_number=$1
    local run_log="${LOG_DIR}/${DATE_TAG}-$(date +"%H%M%S")-run-${run_number}.log"

    log "Starting pipeline run #${run_number}..."
    log "Full output logged to: ${run_log}"

    # Ensure Chrome is running before each run
    ensure_chrome

    # Invoke Claude Code CLI with the pipeline-run skill
    # The -p flag sends a prompt non-interactively
    if claude -p "Run /pipeline-run" > "${run_log}" 2>&1; then
        log "Pipeline run #${run_number} completed successfully."
    else
        local exit_code=$?
        log "Pipeline run #${run_number} failed with exit code ${exit_code}."
        log "Check ${run_log} for details."
    fi
}

# --- Main ---
log "=========================================="
log "Pipeline orchestrator started for ${DATE_TAG}"
log "=========================================="

# Generate up to 3 random times at least MIN_HOURS_APART hours apart
# HOUR1 max = WINDOW_END - 2 * MIN_HOURS_APART to guarantee room for 3 runs
HOUR1_MAX=$(( WINDOW_END - 2 * MIN_HOURS_APART ))
HOUR1=$(random_hour ${WINDOW_START} ${HOUR1_MAX})
MIN1=$(random_minute)

# Second time must be at least MIN_HOURS_APART hours after first
HOUR2_MIN=$(( HOUR1 + MIN_HOURS_APART ))
HOUR2=-1
HOUR3=-1

if [ ${HOUR2_MIN} -gt ${WINDOW_END} ]; then
    log "Only 1 run possible today (first time too late for second run)."
else
    HOUR2=$(random_hour ${HOUR2_MIN} $(( WINDOW_END - MIN_HOURS_APART )))
    MIN2=$(random_minute)

    # Third time must be at least MIN_HOURS_APART hours after second
    HOUR3_MIN=$(( HOUR2 + MIN_HOURS_APART ))
    if [ ${HOUR3_MIN} -gt ${WINDOW_END} ]; then
        log "Only 2 runs possible today (second time too late for third run)."
    else
        HOUR3=$(random_hour ${HOUR3_MIN} ${WINDOW_END})
        MIN3=$(random_minute)
    fi
fi

# Format times for display
TIME1=$(printf "%02d:%02d" ${HOUR1} ${MIN1})
if [ ${HOUR3} -gt 0 ]; then
    TIME2=$(printf "%02d:%02d" ${HOUR2} ${MIN2})
    TIME3=$(printf "%02d:%02d" ${HOUR3} ${MIN3})
    log "Today's schedule: Run 1 at ${TIME1}, Run 2 at ${TIME2}, Run 3 at ${TIME3}"
elif [ ${HOUR2} -gt 0 ]; then
    TIME2=$(printf "%02d:%02d" ${HOUR2} ${MIN2})
    log "Today's schedule: Run 1 at ${TIME1}, Run 2 at ${TIME2} (2 runs only)"
else
    log "Today's schedule: Run 1 at ${TIME1} (single run)"
fi

# --- Wait for Run 1 ---
NOW_EPOCH=$(date +%s)
RUN1_EPOCH=$(date -j -f "%Y%m%d %H:%M" "${DATE_TAG} ${TIME1}" +%s 2>/dev/null || date -j "${DATE_TAG}${HOUR1}${MIN1}.00" +%s)
WAIT_SECONDS=$(( RUN1_EPOCH - NOW_EPOCH ))

if [ ${WAIT_SECONDS} -gt 0 ]; then
    log "Waiting ${WAIT_SECONDS} seconds until Run 1 at ${TIME1}..."
    sleep ${WAIT_SECONDS}
else
    log "Run 1 time (${TIME1}) is in the past or now. Running immediately."
fi

run_pipeline 1

# --- Wait for Run 2 (if scheduled) ---
if [ ${HOUR2} -gt 0 ]; then
    NOW_EPOCH=$(date +%s)
    RUN2_EPOCH=$(date -j -f "%Y%m%d %H:%M" "${DATE_TAG} ${TIME2}" +%s 2>/dev/null || date -j "${DATE_TAG}${HOUR2}${MIN2}.00" +%s)
    WAIT_SECONDS=$(( RUN2_EPOCH - NOW_EPOCH ))

    if [ ${WAIT_SECONDS} -gt 0 ]; then
        log "Waiting ${WAIT_SECONDS} seconds until Run 2 at ${TIME2}..."
        sleep ${WAIT_SECONDS}
    else
        log "Run 2 time (${TIME2}) is in the past or now. Running immediately."
    fi

    run_pipeline 2
fi

# --- Wait for Run 3 (if scheduled) ---
if [ ${HOUR3} -gt 0 ]; then
    NOW_EPOCH=$(date +%s)
    RUN3_EPOCH=$(date -j -f "%Y%m%d %H:%M" "${DATE_TAG} ${TIME3}" +%s 2>/dev/null || date -j "${DATE_TAG}${HOUR3}${MIN3}.00" +%s)
    WAIT_SECONDS=$(( RUN3_EPOCH - NOW_EPOCH ))

    if [ ${WAIT_SECONDS} -gt 0 ]; then
        log "Waiting ${WAIT_SECONDS} seconds until Run 3 at ${TIME3}..."
        sleep ${WAIT_SECONDS}
    else
        log "Run 3 time (${TIME3}) is in the past or now. Running immediately."
    fi

    run_pipeline 3
fi

log "=========================================="
log "Pipeline orchestrator finished for ${DATE_TAG}"
log "=========================================="

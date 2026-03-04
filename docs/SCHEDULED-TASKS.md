# Scheduled Tasks — Design & Usage Guide

Schedule one-off or recurring Claude Code tasks using the `/schedule-task` skill.

## Overview

The content pipeline runs on a fixed daily schedule via launchd + `pipeline-orchestrator.sh`. This system adds flexible scheduling:

- **One-off tasks** — "Run the pipeline at 3pm today" (uses macOS `at`)
- **Recurring tasks** — "Post to LinkedIn every weekday at 9am" (uses `crontab`)

Both types invoke Claude Code CLI via a shared helper script.

## Architecture

```
User: /schedule-task 3pm
        │
        ▼
┌─────────────────────────┐
│  SKILL.md (parser)      │ ← Determines action type
│  - One-off → at         │
│  - Recurring → crontab  │
│  - List/Cancel → query  │
└────────┬────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│  at    │ │ crontab  │     ← macOS schedulers
└───┬────┘ └────┬─────┘
    │           │
    ▼           ▼
┌─────────────────────────────────┐
│ scripts/schedule-claude-task.sh │ ← Shared wrapper
│  - Sets PATH + env             │
│  - Ensures Chrome running      │
│  - Runs: claude -p "<command>" │
│  - Logs to logs/scheduled/     │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Claude Code CLI        │
│  Executes the command   │
│  (e.g., /pipeline-run)  │
└─────────────────────────┘
```

## Setup

### Prerequisites

- macOS (tested on macOS 15+)
- Claude Code CLI installed at `~/.local/bin/claude`
- `at` command available (built into macOS)
- `crontab` available (built into macOS)

### Enable `atrun` (required for one-off scheduling)

The `atrun` daemon is disabled by default on macOS. Enable it once:

```bash
sudo launchctl load -w /System/Library/LaunchDaemons/com.apple.atrun.plist
```

Verify it's running:

```bash
sudo launchctl list | grep atrun
```

You should see a line containing `com.apple.atrun`. If not, the load command may need a restart.

**Note:** `crontab` (recurring) works without any extra setup. Only `at` (one-off) requires `atrun`.

## Usage Guide

### Schedule a One-Off Task

```
/schedule-task 3pm                          → pipeline at 3 PM today
/schedule-task tomorrow 9am                 → pipeline tomorrow at 9 AM
/schedule-task now + 30 minutes             → pipeline in 30 minutes
/schedule-task now + 2 hours /post-to-x     → post to X in 2 hours
/schedule-task 3pm Mar 5                    → pipeline on March 5 at 3 PM
```

Default command is `/pipeline-run`. Specify a different command by adding it after the time.

### Schedule a Recurring Task

```
/schedule-task noon daily                       → pipeline every day at noon
/schedule-task 9am weekdays /post-to-linkedin   → LinkedIn every weekday at 9 AM
/schedule-task 10pm weekends                    → pipeline every weekend at 10 PM
/schedule-task 8am weekly                       → pipeline every Monday at 8 AM
/schedule-task every 4 hours /pipeline-run      → pipeline every 4 hours
```

### List All Scheduled Tasks

```
/schedule-task list
```

Shows both pending one-off tasks (from `atq`) and recurring schedules (from `crontab`).

### Cancel Tasks

```
/schedule-task cancel 5                         → cancel one-off job #5
/schedule-task cancel recurring pipeline-daily  → cancel specific recurring
/schedule-task cancel recurring all             → cancel ALL recurring schedules
```

## Time Formats Reference

These are native `at` time formats supported on macOS:

| Format | Example | Meaning |
|--------|---------|---------|
| `Hpm/am` | `3pm` | Today at 3 PM (tomorrow if past) |
| `HH:MM` | `15:00` | 24-hour format |
| `tomorrow Hpm` | `tomorrow 9am` | Tomorrow at specified time |
| `now + N minutes` | `now + 30 minutes` | Relative minutes |
| `now + N hours` | `now + 2 hours` | Relative hours |
| `Hpm Mon DD` | `3pm Mar 5` | Specific date and time |
| `noon` | `noon` | 12:00 PM |
| `midnight` | `midnight` | 12:00 AM |
| `teatime` | `teatime` | 4:00 PM |

## Recurrence Keywords

| Keyword | Cron Expression | Schedule |
|---------|----------------|----------|
| `daily` | `M H * * *` | Every day at specified time |
| `weekdays` | `M H * * 1-5` | Monday through Friday |
| `weekends` | `M H * * 0,6` | Saturday and Sunday |
| `weekly` | `M H * * 1` | Every Monday |
| `hourly` | `0 * * * *` | Every hour on the hour |
| `every 2 hours` | `0 */2 * * *` | Every 2 hours |
| `every 3 hours` | `0 */3 * * *` | Every 3 hours |
| `every 4 hours` | `0 */4 * * *` | Every 4 hours |
| `every 6 hours` | `0 */6 * * *` | Every 6 hours |
| `every N hours` | `0 */N * * *` | Every N hours |

`M` and `H` are replaced with the minute and hour parsed from your time input.

## Examples

### Schedule a one-off pipeline run for this afternoon

```
> /schedule-task 3pm

Scheduled: Run /pipeline-run
When: Tue Mar  4 15:00:00 2026
Job: #42
Logs: logs/scheduled/20260304-150000-pipeline-run.log
```

### Set up daily posting at noon

```
> /schedule-task noon daily

Scheduled: Run /pipeline-run
Recurrence: Every day at 12:00 PM
Cron: 0 12 * * *
Tag: pipeline-run-daily (use to cancel)
```

### Schedule weekday-only LinkedIn posts

```
> /schedule-task 9am weekdays /post-to-linkedin

Scheduled: Run /post-to-linkedin
Recurrence: Every weekday at 9:00 AM
Cron: 0 9 * * 1-5
Tag: post-to-linkedin-weekdays (use to cancel)
```

### Cancel a recurring schedule

```
> /schedule-task cancel recurring post-to-linkedin-weekdays

Cancelled recurring schedule: post-to-linkedin-weekdays
```

### List everything that's queued

```
> /schedule-task list

One-off tasks:
  #42  Tue Mar  4 15:00:00 2026  (pipeline-run)
  #43  Wed Mar  5 09:00:00 2026  (post-to-x)

Recurring schedules:
  pipeline-run-daily      | 0 12 * * *   | Every day at noon
  post-to-linkedin-weekdays | 0 9 * * 1-5 | Weekdays at 9 AM
```

## Logging

All scheduled task output goes to `logs/scheduled/`.

### Log file naming

```
logs/scheduled/<YYYYMMDD>-<HHMMSS>-<description>.log
```

Example: `logs/scheduled/20260304-150000-pipeline-run.log`

### Log contents

Each log file includes:
- Timestamp headers
- Task description and command
- Chrome status check
- Full Claude CLI output
- Success/failure status

### Viewing logs

```bash
# Latest log
ls -t logs/scheduled/*.log | head -1 | xargs cat

# All logs from today
ls logs/scheduled/$(date +%Y%m%d)*.log

# Search for errors
grep -l "failed" logs/scheduled/*.log
```

## Troubleshooting

### `atrun` not enabled

**Symptom:** One-off tasks never execute (but are queued in `atq`).

**Fix:**
```bash
sudo launchctl load -w /System/Library/LaunchDaemons/com.apple.atrun.plist
```

### Jobs not executing

**Possible causes:**
- `atrun` polls every 30 seconds, so jobs may be up to 30s late
- The `claude` CLI must be in PATH — check `which claude` in a non-interactive shell
- Chrome must be able to start (relevant for browser automation tasks)

**Debug:**
```bash
# Check if atrun is running
sudo launchctl list | grep atrun

# Check pending jobs
atq

# Check crontab entries
crontab -l

# Check recent logs
ls -lt logs/scheduled/ | head -5
```

### Permission errors with `at`

macOS may restrict `at` usage. Ensure your user is not in `/usr/lib/cron/at.deny` (or is in `/usr/lib/cron/at.allow` if that file exists).

### Cron jobs not running

- Verify with `crontab -l` that the entry exists
- macOS may prompt for Full Disk Access for `cron` — check System Settings > Privacy & Security > Full Disk Access
- Check system logs: `log show --predicate 'process == "cron"' --last 1h`

### Log file not created

The helper script creates the log directory automatically. If logs are missing:
- Check that `scripts/schedule-claude-task.sh` is executable: `ls -la scripts/schedule-claude-task.sh`
- Run the script manually to test: `scripts/schedule-claude-task.sh "echo test" "manual-test"`

## How It Works Under the Hood

### One-Off Tasks (`at`)

1. `/schedule-task 3pm` parses the time and command
2. The skill runs: `echo "/path/to/schedule-claude-task.sh \"Run /pipeline-run\" \"pipeline-run\"" | at 3pm`
3. `at` queues the job and assigns a job number
4. `atrun` daemon (polling every 30s) picks up the job at the scheduled time
5. `schedule-claude-task.sh` sets up the environment and runs `claude -p "Run /pipeline-run"`
6. Output is captured in `logs/scheduled/`

### Recurring Tasks (`crontab`)

1. `/schedule-task noon daily` parses time, recurrence, and command
2. The skill maps "noon daily" to cron expression `0 12 * * *`
3. A tagged entry is added to the user's crontab:
   ```
   0 12 * * * /path/to/schedule-claude-task.sh "Run /pipeline-run" "pipeline-run-daily" # claude-schedule: pipeline-run-daily
   ```
4. `cron` daemon executes the job at the scheduled time
5. Same `schedule-claude-task.sh` wrapper handles env setup and logging

### Tag System

Recurring crontab entries are tagged with `# claude-schedule: <name>` comments. This allows:
- **Listing**: `crontab -l | grep "# claude-schedule:"`
- **Cancelling by name**: `grep -v "# claude-schedule: <name>"` to filter out specific entries
- **Cancelling all**: `grep -v "# claude-schedule:"` to remove all Claude-managed entries
- **No conflicts**: Unrelated crontab entries are never touched

### Relationship to pipeline-orchestrator.sh

The existing `pipeline-orchestrator.sh` + launchd setup handles the daily 3-random-times pipeline schedule. `/schedule-task` is complementary:

- Use `pipeline-orchestrator.sh` for the primary daily pipeline (3 runs at random times)
- Use `/schedule-task` for ad-hoc one-off runs and custom recurring schedules
- Both use the same Claude CLI and skill system
- They log to separate directories (`logs/pipeline/` vs `logs/scheduled/`)

---
name: schedule-task
description: Schedule one-off or recurring Claude Code tasks using macOS at (one-off) and crontab (recurring). Supports scheduling, listing, and cancelling tasks.
user-invocable: true
arguments: "<time> [recurrence] [/command]  |  list  |  cancel <id>  |  cancel recurring <name|all>"
---

# /schedule-task — One-Off & Recurring Task Scheduling

Schedule Claude Code commands to run at specific times (one-off) or on recurring schedules. Default command is `Run /pipeline-run`.

## Configuration

Derive paths dynamically — never hardcode absolute paths:

```bash
REPO_DIR="$(git rev-parse --show-toplevel)"
SCRIPT="${REPO_DIR}/scripts/schedule-claude-task.sh"
```

## Action Detection

Parse the user's arguments to determine the action:

| Input Pattern | Action |
|---------------|--------|
| `list` | List all scheduled tasks |
| `cancel <number>` | Cancel one-off job by ID |
| `cancel recurring <name\|all>` | Cancel recurring schedule(s) |
| `<time> daily\|weekdays\|weekends\|weekly\|every N hours [/command]` | Schedule recurring task |
| `<time> [/command]` | Schedule one-off task |

## Prerequisite Check

Before any **one-off** scheduling action, verify `atrun` is enabled (not needed for recurring):

```bash
launchctl list 2>/dev/null | grep -q atrun
```

If not found, warn the user:
> **atrun is not enabled.** One-off scheduling requires the atrun daemon. Run:
> ```
> sudo launchctl load -w /System/Library/LaunchDaemons/com.apple.atrun.plist
> ```
> Then retry. Recurring schedules (crontab) will still work without atrun.

**Note:** Use `launchctl list` (without sudo) first. If that doesn't find atrun, the user needs to run the sudo command interactively.

## Action: Schedule One-Off Task (via `at`)

**Trigger**: Arguments contain a time but NO recurrence keyword.

### Steps

1. **Parse arguments**:
   - Extract the time portion (everything before any `/command`)
   - Extract the command (starts with `/`). Default: `Run /pipeline-run`
   - Generate a description from the command for logging (e.g., `pipeline-run`, `post-to-x`)
   - **Validate the command**: Ensure it only contains alphanumeric characters, spaces, slashes, and hyphens. Reject commands containing shell metacharacters (`;`, `|`, `&`, `` ` ``, `$`, `(`, `)`)

2. **Validate time format** by checking against the supported formats table below. Do NOT run `echo "echo test" | at <time>` as a dry-run — this actually schedules a job as a side effect. Instead, validate the format visually against the table.

3. **Schedule the job** (use full absolute path to SCRIPT):
   ```bash
   echo "'${SCRIPT}' 'Run <command>' '<description>'" | at <time> 2>&1
   ```
   Capture the output — `at` prints the job number and scheduled time.

4. **Confirm to user**:
   - Job number
   - Scheduled time
   - Command that will run
   - Log path: `logs/scheduled/<timestamp>-<description>.log`

### Supported Time Formats (native `at` syntax)

| Input | Meaning |
|-------|---------|
| `3pm` | Today at 3 PM (tomorrow if already past) |
| `15:00` | Same, 24-hour format |
| `tomorrow 9am` | Tomorrow at 9 AM |
| `now + 30 minutes` | 30 minutes from now |
| `now + 2 hours` | 2 hours from now |
| `3pm Mar 5` | March 5 at 3 PM |
| `noon` | 12:00 PM |
| `midnight` | 12:00 AM |
| `teatime` | 4:00 PM |

## Action: Schedule Recurring Task (via `crontab`)

**Trigger**: Arguments contain a recurrence keyword (`daily`, `weekdays`, `weekends`, `weekly`, `hourly`, `every N hours`).

### Steps

1. **Parse arguments**:
   - Extract the time (hour and minute). For `every N hours`, time is ignored (runs on the hour).
   - Extract the recurrence keyword.
   - Extract the command (starts with `/`). Default: `Run /pipeline-run`
   - Generate a description/tag name (e.g., `pipeline-daily`, `post-to-linkedin-weekdays`)
   - **Tag names must be alphanumeric + hyphens only** (no spaces, no special chars). This prevents grep matching issues.
   - **Validate the command**: Same as one-off — reject shell metacharacters.

2. **Map recurrence to cron expression**:

   | Keyword | Cron Expression | Meaning |
   |---------|----------------|---------|
   | `daily` | `M H * * *` | Every day at specified time |
   | `weekdays` | `M H * * 1-5` | Monday–Friday |
   | `weekends` | `M H * * 0,6` | Saturday & Sunday |
   | `weekly` | `M H * * 1` | Every Monday |
   | `hourly` | `0 * * * *` | Every hour on the hour |
   | `every 2 hours` | `0 */2 * * *` | Every 2 hours |
   | `every 3 hours` | `0 */3 * * *` | Every 3 hours |
   | `every 4 hours` | `0 */4 * * *` | Every 4 hours |
   | `every 6 hours` | `0 */6 * * *` | Every 6 hours |
   | `every N hours` | `0 */N * * *` | Every N hours |

   Replace `M` with the minute and `H` with the hour from the parsed time.

3. **Check for duplicate**: Search existing crontab for an **exact** tag match (anchor with `$`):
   ```bash
   crontab -l 2>/dev/null | grep "# claude-schedule: <tag>$"
   ```
   If found, ask user if they want to replace it.

4. **Add to crontab** (use single-quoted SCRIPT path for safety):
   ```bash
   (crontab -l 2>/dev/null; echo "<cron_expr> '${SCRIPT}' 'Run <command>' '<description>' # claude-schedule: <tag>") | crontab -
   ```

5. **Verify**:
   ```bash
   crontab -l | grep "# claude-schedule: <tag>$"
   ```

6. **Confirm to user**:
   - Schedule description (e.g., "Every weekday at 9:00 AM")
   - Cron expression
   - Command that will run
   - Tag name (for cancellation)

## Action: List Scheduled Tasks

**Trigger**: Argument is `list`.

### Steps

1. **List one-off jobs**:
   ```bash
   atq 2>/dev/null
   ```
   Format as a table. If empty, say "No pending one-off tasks."

2. **List recurring schedules**:
   ```bash
   crontab -l 2>/dev/null | grep "# claude-schedule:"
   ```
   Parse each line to show: tag name, schedule (human-readable), command.
   If empty, say "No recurring schedules."

3. **Display both sections** with clear headers.

## Action: Cancel One-Off Task

**Trigger**: `cancel <number>` (where number is a job ID from `atq`).

### Steps

1. **Verify job exists**:
   ```bash
   atq | grep "^<number>"
   ```

2. **Cancel**:
   ```bash
   atrm <number>
   ```

3. **Confirm**: "Cancelled one-off job #<number>."

## Action: Cancel Recurring Task

**Trigger**: `cancel recurring <name>` or `cancel recurring all`.

### Steps — Safe Crontab Modification

**IMPORTANT:** Always back up the crontab before modifying and validate the result before applying.

1. **Capture current crontab**:
   ```bash
   CURRENT_CRONTAB=$(crontab -l 2>/dev/null)
   ```
   If empty/error, report "No crontab entries found" and stop.

2. **Count claude-schedule entries** (for confirmation):
   ```bash
   echo "${CURRENT_CRONTAB}" | grep -c "# claude-schedule:" || true
   ```

3. **If `all`**: Remove ALL `# claude-schedule:` entries:
   ```bash
   echo "${CURRENT_CRONTAB}" | grep -v "# claude-schedule:" | crontab -
   ```
   Confirm how many were removed.

4. **If specific name**: Remove matching entry using **exact** match (anchored with `$`):
   ```bash
   echo "${CURRENT_CRONTAB}" | grep -v "# claude-schedule: <name>$" | crontab -
   ```
   Confirm removal. If not found, say so.

5. **Verify** with `crontab -l` and confirm non-claude entries are intact.

## Error Handling

| Error | Response |
|-------|----------|
| `atrun` not enabled | Show setup command, note that recurring still works |
| Invalid time format | Show supported formats table |
| Job ID not found | Show current `atq` output |
| Recurring tag not found | Show current recurring schedules |
| `at` command not available | Suggest `brew install at` or check macOS version |
| Empty crontab | Note that no schedules exist yet |
| Command contains shell metacharacters | Reject and ask user to simplify |

## Output Format

Always end with a clear summary:

**One-off scheduled:**
```
Scheduled: Run /pipeline-run
When: Tue Mar  4 15:00:00 2026
Job: #42
Logs: logs/scheduled/<timestamp>-pipeline-run.log
```

**Recurring scheduled:**
```
Scheduled: Run /pipeline-run
Recurrence: Every weekday at 9:00 AM
Cron: 0 9 * * 1-5
Tag: pipeline-run-weekdays (use to cancel)
Logs: logs/scheduled/ (timestamped per run)
```

## Usage Examples

```
# One-off (default command is Run /pipeline-run)
/schedule-task 3pm
/schedule-task tomorrow 9am
/schedule-task now + 30 minutes /post-to-x

# Recurring
/schedule-task noon daily
/schedule-task 9am weekdays /post-to-linkedin
/schedule-task every 4 hours /pipeline-run

# Management
/schedule-task list
/schedule-task cancel 5
/schedule-task cancel recurring pipeline-run-weekdays
/schedule-task cancel recurring all
```

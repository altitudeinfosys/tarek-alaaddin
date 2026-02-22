# Project Rules for Claude

## Git Workflow

**IMPORTANT: Never commit directly to main.**

1. Always create a feature branch for any changes
2. Push the branch to GitHub
3. Ask the user for approval before merging to main
4. Only merge to main after explicit user approval

Example workflow:
```bash
git checkout -b feature/description-of-change
# make changes
git add . && git commit -m "Description"
git push -u origin feature/description-of-change
# Ask user: "Ready to merge to main?"
# Wait for approval before merging
```

## Other Guidelines

- Use a to-do list before coding
- Double check and ask for confirmation before doing anything that could endanger app stability

---

## AI Code Review Setup

This repository has AI-powered automated code review configured via GitHub Actions.

### What It Does

When a Pull Request is created or updated, the AI automatically:
- **Reviews code** for quality, bugs, performance, and security issues
- **Generates PR descriptions** summarizing the changes
- **Suggests improvements** with actionable code suggestions

### Setup Instructions

**Step 1: Add OpenAI API Key**
1. Go to GitHub → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `OPENAI_KEY`
4. Value: Your OpenAI API key (get from https://platform.openai.com/api-keys)
5. Click "Add secret"

**Step 2: (Optional) Customize Review Settings**
Edit `.github/workflows/ai-review.yml` to adjust:
- Review focus areas
- Automation triggers
- Extra instructions

### Usage

Once configured, the AI reviewer automatically activates on every PR:
- Comments appear as review comments
- Suggestions can be committed directly
- No manual intervention needed

### Cost Considerations

This uses OpenAI's API. Typical cost is minimal (~$0.01-0.10 per PR depending on size).

### Alternative: Free Tier Options

If you prefer not to use OpenAI, you can switch to:
- **CodeRabbit** (https://coderabbit.ai) - Free tier available
- **PR-Agent self-hosted** - Use local LLMs

To switch, update `.github/workflows/ai-review.yml` with the alternative action.

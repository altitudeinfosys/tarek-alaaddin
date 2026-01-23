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

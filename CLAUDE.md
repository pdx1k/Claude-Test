# CLAUDE.md

This file provides guidance for AI assistants (Claude and others) working with this repository.

## Repository Overview

**Claude-Test** is a test repository for exploring and demonstrating Claude Code workflows. It serves as a sandbox for developing conventions, testing integrations, and validating Claude Code behavior.

- **Remote:** `http://local_proxy@127.0.0.1:34193/git/pdx1k/Claude-Test`
- **Default branch:** `master` / `main`
- **Current state:** Early-stage / minimal scaffolding

## Repository Structure

```
Claude-Test/
├── README.md      # Project overview
└── CLAUDE.md      # This file — AI assistant guidance
```

As the project grows, this structure should be updated to reflect new directories and files.

## Branch Conventions

Feature branches follow the pattern:

```
claude/<feature-description>-<session-id>
```

Examples:
- `claude/add-claude-documentation-3i6ul`
- `claude/implement-auth-module-abc12`

**Rules:**
- Always develop on a designated `claude/` branch, never directly on `master`/`main`
- Branch names must start with `claude/` — pushes to other branch names may be rejected
- Commit frequently with clear, descriptive messages

## Git Workflow

```bash
# Check current branch
git branch --show-current

# Stage and commit changes
git add <file>
git commit -m "descriptive commit message"

# Push to remote
git push -u origin <branch-name>
```

**Push retry policy:** If a push fails due to network errors, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s). Do not retry on authentication/authorization errors (HTTP 403).

## Development Guidelines

Since this is a test repository without a defined tech stack, the following general principles apply:

1. **Minimal changes** — only change what is necessary for the current task
2. **No speculative additions** — don't add features, configs, or files that weren't requested
3. **Clear commits** — each commit should represent one logical unit of work
4. **Read before editing** — always read a file before modifying it
5. **No secrets** — never commit credentials, tokens, or `.env` files

## Adding a Tech Stack

When a specific language or framework is introduced, update this file with:

- Build and run commands
- Test commands
- Linting/formatting commands
- Dependency management instructions
- Environment setup steps

## AI Assistant Notes

- This repo is used for testing Claude Code behavior — some workflows may be intentionally simple
- When in doubt about conventions, prefer the simplest correct approach
- Keep CLAUDE.md up to date as the codebase evolves

# Changelog

All notable changes to the SocialSyncs CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-06-24

### Changed
- **SKILL.md** now documents the `automations:*` commands so AI agents run
  `automations:list` (and friends) instead of substituting posts/recurring
  when asked to list automations. No CLI behavior change.

## [1.1.0] - 2026-06-23

### Added
- **Automations** — manage auto-reply / DM workflows from the CLI:
  - `automations:list` — list automations (optional `--integration` filter)
  - `automations:get <id>` — show a single automation
  - `automations:create --json <file>` — create from a workflow JSON file
  - `automations:update <id> --json <file>` — replace a workflow
  - `automations:toggle <id> --active <true|false>` — activate / pause
  - `automations:delete <id>` — delete an automation
  - `automations:logs <id>` — run history (`--limit`, `--cursor`)
  - `automations:test <id> --text "..."` — dry-run the trigger against a sample message (nothing is sent)
- `examples/automation.json` — sample comment-keyword → auto-reply workflow

## [1.0.0] - 2026-02-13

### Added
- Initial release of SocialSyncs CLI
- `posts:create` - Create new social media posts
- `posts:list` - List all posts with pagination and search
- `posts:delete` - Delete posts by ID
- `integrations:list` - List connected social media integrations
- `upload` - Upload media files (images)
- Environment variable configuration (SOCIALSYNCS_API_KEY, SOCIALSYNCS_API_URL)
- Comprehensive help documentation
- Example scripts for basic usage and AI agent integration
- SKILL.md for AI agent usage patterns

### Features
- Command-line interface for SocialSyncs API
- Support for scheduled posts
- Multi-platform posting via integrations
- Media upload functionality
- User-friendly error messages with emojis
- JSON output for programmatic parsing
- Comprehensive examples for AI agents

# Issue Labels

This script polls GitHub issues in a repository and applies labels based on heuristics.

It only covers two label dimensions:

- **Type**: `bug` / `enhancement` / `question` / `documentation` / `performance` / `security`
- **Domain**: `domain/<service>` (multi-select)

Related GitHub Actions workflow: `.github/workflows/issue-labels.yml`.

## Labeling Rules (Current)

### Type (single-select; write only when matched)

- Candidates: `bug`, `enhancement`, `question`, `documentation`, `performance`, `security`
- Type is written **only when keywords are matched** in title/body. If nothing matches, the script will not add or correct type labels.
- By default, the script **does not override existing type labels** to avoid reverting manual triage. Use `--override-type` if you really want the script to enforce the computed type.

### Domain (multi-select; add-only by default)

- Label format: `domain/<service>` (e.g. `domain/base`, `domain/im`)
- Signals (strong → weak):
  1) Explicit `domain/<service>` in text
  2) Command mention: `lark-cli <service>` / `lark cli <service>` (maps `docs` → `doc`)
  3) Loose title match (careful; excludes English `im` to reduce false positives)
  4) A small set of conservative keyword heuristics as fallback
- By default, the script only adds missing domain labels and never removes existing ones.
- If you want strict domain synchronization (may remove manual labels), use `--sync-domains`.

## Usage

### GitHub Actions (recommended)

The workflow supports both:

- `schedule` (hourly)
- `workflow_dispatch` (manual run)

Scheduled runs write labels by default (hourly with `--lookback-hours 6`). Manual runs default to dry-run unless `dry_run=false` is selected.

### Local dry-run

Provide a token to avoid anonymous rate limits:

```bash
GITHUB_TOKEN=$(gh auth token) \
  node scripts/issue-labels/index.js \
  --repo larksuite/cli \
  --lookback-hours 24 \
  --max-issues 100 \
  --dry-run --json
```

### Common Flags

- `--dry-run`: Do not write labels, only print planned changes
- `--json`: JSON output (usually with `--dry-run`)
- `--lookback-hours <n>` / `--since <iso8601>`: Incremental scan window
- `--max-issues <n>` / `--max-pages <n>`: Bound scan size
- `--sync-domains`: Strictly sync `domain/*` (use with caution)
- `--override-type`: Allow overriding existing type labels (use with caution)

## Regression Samples

`samples.json` is a regression dataset sampled from real issues in `larksuite/cli` (issue bodies are truncated).

Run tests:

```bash
node scripts/issue-labels/test.js
```

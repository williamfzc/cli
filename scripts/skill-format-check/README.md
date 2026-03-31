# Skill Format Check

This directory contains a script to validate the format of `SKILL.md` files located in the `../../skills` directory.

## Purpose

The `index.js` script ensures that all `SKILL.md` files conform to the standard template defined in `skill-template/skill-template.md`. Specifically, it checks that the YAML frontmatter includes the following required fields:
- `name`
- `version`
- `description`
- `metadata`

## Usage

This script is executed automatically via GitHub Actions (`.github/workflows/skill-format-check.yml`) on pull requests and pushes that modify the `skills/` directory.

To run the check manually from the root of the repository, execute:

```bash
node scripts/skill-format-check/index.js
```

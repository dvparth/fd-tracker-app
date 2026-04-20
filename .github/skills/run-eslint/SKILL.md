---
name: run-eslint
description: Runs ESLint on the project or a specific file and returns the actual lint errors, warnings, and rule violations. Use this when the user asks about lint errors, code quality issues, unused variables, or wants to check if their code passes linting.
allowed-tools:
  - terminal
---

# Run ESLint

When the user asks about ESLint errors or code quality, run ESLint using the terminal tool and return the real output.

## Steps

1. Run ESLint on the workspace using the terminal:
npx eslint . --format=compact

2. If the user mentions a specific file, run on that file instead:
npx eslint <filepath> --format=compact

3. Return the exact output — do not summarise or guess. If there are no errors, say so based on the actual command output, not assumption.

## Auto-fix errors

When the user asks to fix lint errors, run ESLint with the --fix flag:
npx eslint . --fix

Then run ESLint again without --fix to show what remains (things that could not be auto-fixed):
npx eslint . --format=compact

Report both: what was fixed, and what still needs manual attention.

## Rules

- Return EXACT terminal output verbatim — do not read or analyse source code yourself.
- If ESLint fails to run, report the exact error from the terminal. Do NOT fall back to manual code analysis.
- Never say "I can see in the code" — only report what the terminal returned.
- Note: --fix can handle formatting and some rule violations automatically, but unused variables and unused imports require manual removal.

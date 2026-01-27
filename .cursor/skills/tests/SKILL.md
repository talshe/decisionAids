---
name: tests
description: Add and maintain tests for frontend and backend code using Vitest. Use when writing new tests, updating existing tests, or improving test coverage.
---

# Tests

## Quick start
- Identify the behavior to validate and its boundaries.
- Find existing test patterns in the repo before adding new ones.
- Keep tests focused, readable, and resilient to refactors.

## Workflow checklist
- [ ] Locate existing test framework and conventions
- [ ] Add tests closest to the changed code
- [ ] Prefer deterministic tests and stable selectors
- [ ] Cover success and failure paths
- [ ] Avoid mocking unless required or in test files
- [ ] Note test gaps and suggested follow-ups

## Conventions
- Use Vitest and existing test utilities.
- Keep fixtures minimal and reusable.
- Avoid introducing new test dependencies unless asked.

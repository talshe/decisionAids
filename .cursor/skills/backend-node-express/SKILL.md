---
name: backend-node-express
description: Build and maintain Node.js + Express API features. Use when adding routes, middleware, controllers, or server configuration in this repo.
---

# Backend (Node + Express)

## Quick start
- Confirm the endpoint goals and expected inputs/outputs.
- Find the existing API structure before adding new routes.
- Implement changes with minimal scope and clear boundaries.
- Validate with a quick run path or basic tests when asked.

## Workflow checklist
- [ ] Locate routing entry points and existing route grouping
- [ ] Reuse middleware and helpers where possible
- [ ] Validate inputs and return clear error responses
- [ ] Keep controllers thin; move logic into services when present
- [ ] Avoid breaking changes to response shapes
- [ ] Add or update tests only when the repo already uses them
- [ ] Verify behavior via reasoning or provided commands

## Conventions
- Use Express Router for route grouping.
- Prefer async/await with explicit error handling.
- Keep middleware single-purpose.
- Avoid introducing new dependencies unless asked.

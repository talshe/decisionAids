---
name: security
description: Review and improve security posture across frontend and backend code. Use when adding auth, handling sensitive data, validating inputs, or performing security reviews.
---

# Security

## Quick start
- Identify the data flow and trust boundaries.
- Check authentication, authorization, and input validation.
- Prioritize fixes that reduce exposure or prevent escalation.

## Workflow checklist
- [ ] Validate all inputs at the boundary (API, forms, file uploads)
- [ ] Ensure authn/authz checks exist for protected actions
- [ ] Avoid leaking secrets, tokens, or PII in logs or responses
- [ ] Use safe defaults; deny by default when unsure
- [ ] Add rate limiting or abuse controls when relevant
- [ ] Note risks, mitigations, and testing suggestions

## Conventions
- Prefer allowlists over denylists for validation.
- Treat client input as untrusted.
- Avoid introducing new security dependencies unless asked.

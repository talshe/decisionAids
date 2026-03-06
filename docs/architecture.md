# Decision Aids Architecture

## Overview

The application is split into a React frontend in `frontend/` and an Express API in `backend/`.
Firebase Authentication provides sign-in, Firestore stores product data, and the backend owns user bootstrap, role resolution, and decision-aid delivery APIs.

## Domain model

Firestore collections:

- `users`: mirrored profile document for each authenticated user, including `role`.
- `decisionAids`: decision aid metadata and ordered multi-step content schema.
- `decisionAidAssignments`: admin-created links between users and decision aids.
- `decisionAidFavorites`: per-user saved decision aids.
- `decisionAidResponses`: per-user saved answers and progress state.

## Backend route map

Public routes:

- `GET /api/explore`
- `GET /api/decision-aids/:slug`

Authenticated routes:

- `POST /api/auth/session`
- `GET /api/me`
- `GET /api/my-decision-aids`
- `POST /api/decision-aids/:id/favorite`
- `GET /api/decision-aids/:id/responses`
- `POST /api/decision-aids/:id/responses`

Admin routes:

- `GET /api/admin/decision-aids`
- `POST /api/admin/decision-aids`
- `PUT /api/admin/decision-aids/:id`
- `GET /api/admin/users`
- `POST /api/admin/users/:uid/role`
- `GET /api/admin/assignments`
- `POST /api/admin/assignments`
- `DELETE /api/admin/assignments/:assignmentId`

## Frontend route map

- `/explore`: public searchable browse experience.
- `/decision-aids/:slug`: public detail and guided flow; interactive controls are read-only for guests.
- `/my-decision-aids`: authenticated user page showing assigned and favorited decision aids.
- `/admin`: admin workspace for content management and assignments.
- `/login`: provider sign-in screen with guest entry back to Explore.

## Role model

- Guests can browse published decision aids only.
- Authenticated users can save favorites and responses.
- Admins can manage decision aids, assignments, and role promotion.

The backend resolves admin access from Firebase custom claims plus bootstrap lists in `ADMIN_EMAILS` and `ADMIN_UIDS`. The backend is the single writer for role updates and attempts to synchronize Firebase custom claims after changes.

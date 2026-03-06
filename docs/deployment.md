# Deployment

## Target stack

- Frontend: Firebase Hosting
- Backend: Cloud Run
- Data: Firestore
- Auth: Firebase Authentication

## Local setup

Backend environment variables are documented in `backend/.env.example`.
Frontend environment variables are documented in `frontend/.env.example`.

For authenticated backend routes, configure a Firebase service account so the Admin SDK can verify tokens and optionally sync role claims.

## Backend container

The backend Docker image is defined in `backend/Dockerfile`.

Example build command:

```bash
docker build -t decision-aids-api ./backend
```

## Firebase config

- `firebase.json` configures Hosting rewrites for the SPA.
- `firestore.rules` contains the Firestore access policy.
- `firestore.indexes.json` contains indexes for the main decision-aid collections.

## Terraform

Terraform files live in `infra/terraform/`.

They currently provision:

- required Google APIs
- a backend service account
- a public Cloud Run service for the backend

Required variables:

- `project_id`
- `region`
- `backend_image`
- `cors_origin`
- `firebase_project_id`
- `firebase_client_email`
- `firebase_private_key`
- optional `admin_emails`
- optional `admin_uids`

Typical flow:

1. Build and publish the backend image.
2. Apply Terraform for the backend service.
3. Build the frontend and deploy Hosting with Firebase CLI.
4. Point `VITE_API_BASE_URL` at the Cloud Run service URL.

## GitHub Actions deployment

A manual workflow at `.github/workflows/deploy.yml` deploys both backend and frontend in one run.

### How to run

1. In GitHub: **Actions** → **Deploy** → **Run workflow**
2. Fill in the inputs (project_id, region, etc.) or use defaults
3. Click **Run workflow**

### Required secrets

Configure these in **Settings** → **Secrets and variables** → **Actions**:

| Secret | Description |
|--------|-------------|
| `GCP_SA_KEY` | JSON key for a GCP service account with: Cloud Run Admin, Artifact Registry Writer, Service Account User |
| `FIREBASE_SERVICE_ACCOUNT` | JSON key for a service account with Firebase Hosting Admin and Firestore rules deploy (can be the same as `GCP_SA_KEY` if it has both) |
| `CORS_ORIGIN` | Allowed frontend origin, e.g. `https://your-project.web.app` |
| `FIREBASE_PROJECT_ID` | Firebase/GCP project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin SDK service account email |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK private key (full PEM). Use `\n` for line breaks, not actual newlines, to avoid shell escaping issues. |
| `VITE_FIREBASE_API_KEY` | Firebase web config API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain, e.g. `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Same as `FIREBASE_PROJECT_ID` |
| `VITE_FIREBASE_APP_ID` | Firebase web app ID |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID (optional, can be empty) |
| `ADMIN_EMAILS` | Comma-separated admin emails (optional) |
| `ADMIN_UIDS` | Comma-separated admin UIDs (optional) |

### Prerequisites

- Artifact Registry API enabled (the workflow creates the repo if missing)
- Cloud Run API enabled
- Firebase Hosting and Firestore configured in the project

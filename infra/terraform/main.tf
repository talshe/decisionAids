locals {
  backend_service_name = "decision-aids-api"
}

resource "google_project_service" "services" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "firestore.googleapis.com",
  ])

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

resource "google_service_account" "backend" {
  account_id   = "decision-aids-backend"
  display_name = "Decision aids backend"
}

resource "google_cloud_run_v2_service" "backend" {
  name     = local.backend_service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.backend.email

    containers {
      image = var.backend_image

      env {
        name  = "PORT"
        value = "5000"
      }

      env {
        name  = "CORS_ORIGIN"
        value = var.cors_origin
      }

      env {
        name  = "FIREBASE_PROJECT_ID"
        value = var.firebase_project_id
      }

      env {
        name  = "FIREBASE_CLIENT_EMAIL"
        value = var.firebase_client_email
      }

      env {
        name  = "FIREBASE_PRIVATE_KEY"
        value = var.firebase_private_key
      }

      env {
        name  = "ADMIN_EMAILS"
        value = var.admin_emails
      }

      env {
        name  = "ADMIN_UIDS"
        value = var.admin_uids
      }

      ports {
        container_port = 5000
      }
    }
  }

  depends_on = [google_project_service.services]
}

resource "google_cloud_run_v2_service_iam_member" "public_invoker" {
  location = google_cloud_run_v2_service.backend.location
  service  = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

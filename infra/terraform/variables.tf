variable "project_id" {
  description = "Google Cloud project id."
  type        = string
}

variable "region" {
  description = "Deployment region for Cloud Run and related services."
  type        = string
  default     = "us-central1"
}

variable "backend_image" {
  description = "Container image URI for the backend service."
  type        = string
}

variable "cors_origin" {
  description = "Allowed frontend origin for the backend CORS config."
  type        = string
}

variable "firebase_project_id" {
  description = "Firebase project id used by the Admin SDK."
  type        = string
}

variable "firebase_client_email" {
  description = "Firebase service account client email."
  type        = string
}

variable "firebase_private_key" {
  description = "Firebase service account private key."
  type        = string
  sensitive   = true
}

variable "admin_emails" {
  description = "Comma-separated bootstrap admin emails."
  type        = string
  default     = ""
}

variable "admin_uids" {
  description = "Comma-separated bootstrap admin UIDs."
  type        = string
  default     = ""
}

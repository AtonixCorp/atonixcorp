# Terraform outputs for Email module

output "mailhog_service_name" {
  description = "Name of the MailHog service"
  value       = var.environment == "development" ? kubernetes_service.mailhog[0].metadata[0].name : null
}

output "mailhog_smtp_port" {
  description = "SMTP port for MailHog"
  value       = var.environment == "development" ? 1025 : null
}

output "mailhog_web_port" {
  description = "Web interface port for MailHog"
  value       = var.environment == "development" ? 8025 : null
}

output "mailhog_web_url" {
  description = "MailHog web interface URL"
  value       = var.environment == "development" ? "http://${kubernetes_service.mailhog[0].metadata[0].name}:8025" : null
}

output "postfix_service_name" {
  description = "Name of the Postfix service"
  value       = var.environment == "production" ? kubernetes_service.postfix[0].metadata[0].name : null
}

output "postfix_smtp_port" {
  description = "SMTP port for Postfix"
  value       = var.environment == "production" ? 25 : null
}

output "postfix_submission_port" {
  description = "Submission port for Postfix"
  value       = var.environment == "production" ? 587 : null
}

output "email_secret_name" {
  description = "Name of the email secret"
  value       = kubernetes_secret.email_secret.metadata[0].name
}

output "smtp_host" {
  description = "SMTP host to use in applications"
  value = var.environment == "development" ? (
    var.environment == "development" ? "mailhog" : "postfix"
  ) : (
    var.environment == "production" ? "postfix" : "mailhog"
  )
}

output "smtp_port" {
  description = "SMTP port to use in applications"
  value       = var.environment == "development" ? 1025 : 587
}

output "external_mailhog_port" {
  description = "External port for MailHog web interface"
  value       = var.environment == "development" && var.enable_external_access ? var.mailhog_web_node_port : null
}
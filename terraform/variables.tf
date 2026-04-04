variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Prefix used for naming AWS resources."
  type        = string
  default     = "taskflow"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.20.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDRs. Use at least two for the ALB."
  type        = list(string)
  default     = ["10.20.1.0/24", "10.20.2.0/24"]
}

variable "desired_count" {
  description = "Number of ECS tasks to run."
  type        = number
  default     = 1
}

variable "task_cpu" {
  description = "Total CPU units for the ECS task."
  type        = number
  default     = 1024
}

variable "task_memory" {
  description = "Total memory in MiB for the ECS task."
  type        = number
  default     = 2048
}

variable "frontend_image" {
  description = "Container image URI for the frontend."
  type        = string
}

variable "auth_image" {
  description = "Container image URI for the auth service."
  type        = string
}

variable "tasks_image" {
  description = "Container image URI for the tasks service."
  type        = string
}

variable "jwt_secret" {
  description = "Shared JWT secret used by auth-service and tasks-service."
  type        = string
  sensitive   = true
}

variable "jwt_expires_in" {
  description = "JWT expiry configured on the auth service."
  type        = string
  default     = "8h"
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days."
  type        = number
  default     = 14
}

variable "tags" {
  description = "Common tags applied to all resources."
  type        = map(string)
  default = {
    Project     = "taskflow"
    Environment = "dev"
    ManagedBy   = "terraform"
  }
}

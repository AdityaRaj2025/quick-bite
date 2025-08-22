# Quick Bite - Terraform Variables
# This file defines all the variables used in the Terraform configuration

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod"
  }
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones to use"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "public_subnets" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnets" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
}

# Database Configuration
variable "db_name" {
  description = "Database name"
  type        = string
  default     = "quickbite"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "quickbite"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_backup_retention_period" {
  description = "RDS backup retention period in days"
  type        = number
  default     = 7
}

# Redis Configuration
variable "redis_node_type" {
  description = "Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_cache_nodes" {
  description = "Number of Redis cache nodes"
  type        = number
  default     = 1
}

variable "redis_parameter_group_name" {
  description = "Redis parameter group name"
  type        = string
  default     = "default.redis7"
}

# S3 Configuration
variable "s3_bucket_name" {
  description = "S3 bucket name for file storage"
  type        = string
  default     = "quick-bite-storage"
}

variable "s3_versioning" {
  description = "Enable S3 versioning"
  type        = bool
  default     = true
}

variable "s3_encryption" {
  description = "Enable S3 encryption"
  type        = bool
  default     = true
}

# SQS Configuration
variable "sqs_queue_names" {
  description = "List of SQS queue names to create"
  type        = list(string)
  default     = [
    "order-queue",
    "notification-queue",
    "payment-queue",
    "kitchen-queue"
  ]
}

variable "sqs_message_retention_seconds" {
  description = "SQS message retention period in seconds"
  type        = number
  default     = 1209600 # 14 days
}

variable "sqs_visibility_timeout_seconds" {
  description = "SQS visibility timeout in seconds"
  type        = number
  default     = 30
}

# SNS Configuration
variable "sns_topic_names" {
  description = "List of SNS topic names to create"
  type        = list(string)
  default     = [
    "order-notifications",
    "kitchen-notifications",
    "customer-notifications",
    "staff-notifications"
  ]
}

# Lambda Configuration
variable "lambda_runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "nodejs18.x"
}

variable "lambda_timeout" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 30
}

variable "lambda_memory_size" {
  description = "Lambda memory size in MB"
  type        = number
  default     = 128
}

# ECS Configuration
variable "ecs_cluster_name" {
  description = "ECS cluster name"
  type        = string
  default     = "quick-bite-cluster"
}

variable "ecs_service_desired_count" {
  description = "Desired count for ECS services"
  type        = number
  default     = 1
}

variable "ecs_task_cpu" {
  description = "CPU units for ECS tasks"
  type        = string
  default     = "256"
}

variable "ecs_task_memory" {
  description = "Memory for ECS tasks in MiB"
  type        = string
  default     = "512"
}

# CloudWatch Configuration
variable "cloudwatch_log_groups" {
  description = "List of CloudWatch log groups to create"
  type        = list(string)
  default     = [
    "/aws/lambda/quick-bite-api",
    "/aws/lambda/quick-bite-order-processor",
    "/aws/lambda/quick-bite-notification",
    "/ecs/quick-bite-web",
    "/ecs/quick-bite-admin"
  ]
}

variable "cloudwatch_log_retention_days" {
  description = "CloudWatch log retention period in days"
  type        = number
  default     = 30
}

# API Gateway Configuration
variable "api_gateway_name" {
  description = "API Gateway name"
  type        = string
  default     = "quick-bite-api"
}

variable "api_gateway_stage_name" {
  description = "API Gateway stage name"
  type        = string
  default     = "v1"
}

# CloudFront Configuration
variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

variable "cloudfront_default_root_object" {
  description = "CloudFront default root object"
  type        = string
  default     = "index.html"
}

# Tags
variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "quick-bite"
    ManagedBy   = "terraform"
    Owner       = "dev-team"
  }
}

# Auto Scaling Configuration
variable "enable_auto_scaling" {
  description = "Enable auto scaling for ECS services"
  type        = bool
  default     = false
}

variable "min_capacity" {
  description = "Minimum capacity for auto scaling"
  type        = number
  default     = 1
}

variable "max_capacity" {
  description = "Maximum capacity for auto scaling"
  type        = number
  default     = 5
}

variable "scale_up_threshold" {
  description = "CPU utilization threshold to scale up"
  type        = number
  default     = 70
}

variable "scale_down_threshold" {
  description = "CPU utilization threshold to scale down"
  type        = number
  default     = 30
}

# Quick Bite - AWS Infrastructure
# This file defines the main AWS resources for the Quick Bite application

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "quick-bite-terraform-state"
    key    = "infrastructure/terraform.tfstate"
    region = "us-east-1"
  }
}

# Configure AWS Provider
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "quick-bite"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"
  
  environment = var.environment
  vpc_cidr   = var.vpc_cidr
  
  public_subnets  = var.public_subnets
  private_subnets = var.private_subnets
  
  availability_zones = var.availability_zones
}

# RDS Database
module "database" {
  source = "./modules/database"
  
  environment        = var.environment
  vpc_id            = module.vpc.vpc_id
  private_subnets   = module.vpc.private_subnets
  security_group_id = module.vpc.database_security_group_id
  
  db_name     = var.db_name
  db_username = var.db_username
  db_password = var.db_password
  
  depends_on = [module.vpc]
}

# Redis ElastiCache
module "redis" {
  source = "./modules/redis"
  
  environment        = var.environment
  vpc_id            = module.vpc.vpc_id
  private_subnets   = module.vpc.private_subnets
  security_group_id = module.vpc.redis_security_group_id
  
  depends_on = [module.vpc]
}

# S3 Bucket for file storage
module "storage" {
  source = "./modules/storage"
  
  environment = var.environment
  bucket_name = var.s3_bucket_name
}

# SQS Queues
module "queues" {
  source = "./modules/queues"
  
  environment = var.environment
  queue_names = var.sqs_queue_names
}

# SNS Topics
module "topics" {
  source = "./modules/topics"
  
  environment = var.environment
  topic_names = var.sns_topic_names
}

# Lambda Functions
module "lambda" {
  source = "./modules/lambda"
  
  environment = var.environment
  vpc_id     = module.vpc.vpc_id
  
  depends_on = [module.vpc, module.database, module.redis]
}

# API Gateway
module "api_gateway" {
  source = "./modules/api_gateway"
  
  environment = var.environment
  vpc_id     = module.vpc.vpc_id
  
  depends_on = [module.lambda]
}

# CloudFront Distribution
module "cloudfront" {
  source = "./modules/cloudfront"
  
  environment = var.environment
  s3_bucket  = module.storage.bucket_id
  
  depends_on = [module.storage]
}

# ECS Cluster for services
module "ecs" {
  source = "./modules/ecs"
  
  environment = var.environment
  vpc_id     = module.vpc.vpc_id
  
  public_subnets  = module.vpc.public_subnets
  private_subnets = module.vpc.private_subnets
  
  depends_on = [module.vpc, module.database, module.redis]
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"
  
  environment = var.environment
  vpc_id     = module.vpc.vpc_id
  
  public_subnets = module.vpc.public_subnets
  
  depends_on = [module.vpc]
}

# CloudWatch Logs
module "logs" {
  source = "./modules/logs"
  
  environment = var.environment
  log_groups = var.cloudwatch_log_groups
}

# IAM Roles and Policies
module "iam" {
  source = "./modules/iam"
  
  environment = var.environment
  account_id = data.aws_caller_identity.current.account_id
  
  depends_on = [module.storage, module.queues, module.topics, module.lambda]
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "database_endpoint" {
  description = "RDS endpoint"
  value       = module.database.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = module.redis.endpoint
  sensitive   = true
}

output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = module.storage.bucket_id
}

output "api_gateway_url" {
  description = "API Gateway URL"
  value       = module.api_gateway.url
}

output "cloudfront_url" {
  description = "CloudFront distribution URL"
  value       = module.cloudfront.url
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = module.alb.dns_name
}

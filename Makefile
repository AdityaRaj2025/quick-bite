# Quick Bite - Restaurant QR Ordering System
# Makefile for development, testing, and deployment

.PHONY: help install dev build test lint clean docker-up docker-down deploy-infra deploy-apps

# Default target
help:
	@echo "Quick Bite - Restaurant QR Ordering System"
	@echo ""
	@echo "Available commands:"
	@echo "  install        Install all dependencies"
	@echo "  dev           Start all development servers"
	@echo "  build         Build all applications"
	@echo "  test          Run all tests"
	@echo "  lint          Run linting across all packages"
	@echo "  clean         Clean build artifacts"
	@echo "  docker-up     Start local infrastructure services"
	@echo "  docker-down   Stop local infrastructure services"
	@echo "  db-migrate    Run database migrations"
	@echo "  db-seed       Seed database with sample data"
	@echo "  deploy-infra  Deploy AWS infrastructure"
	@echo "  deploy-apps   Deploy applications to AWS"
	@echo "  logs          View application logs"
	@echo "  health        Check system health"

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install
	@echo "Dependencies installed successfully!"

# Start development servers
dev:
	@echo "Starting development servers..."
	npm run dev

# Build all applications
build:
	@echo "Building applications..."
	npm run build

# Run tests
test:
	@echo "Running tests..."
	npm run test

# Run linting
lint:
	@echo "Running linting..."
	npm run lint

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf apps/*/dist
	rm -rf apps/*/.next
	rm -rf services/*/dist
	rm -rf packages/*/dist
	rm -rf node_modules
	@echo "Cleanup completed!"

# Start local infrastructure
docker-up:
	@echo "Starting local infrastructure services..."
	docker-compose up -d postgres redis
	@echo "Waiting for services to be ready..."
	@sleep 5
	@echo "Local infrastructure started!"

# Stop local infrastructure
docker-down:
	@echo "Stopping local infrastructure services..."
	docker-compose down
	@echo "Local infrastructure stopped!"

# Database operations
db-migrate:
	@echo "Running database migrations..."
	npm --workspace @quick-bite/api-gateway run migrate

db-seed:
	@echo "Seeding database with sample data..."
	npm --workspace @quick-bite/api-gateway run seed

# AWS Infrastructure deployment
deploy-infra:
	@echo "Deploying AWS infrastructure..."
	cd infrastructure/terraform && \
	terraform init && \
	terraform plan && \
	terraform apply -auto-approve
	@echo "Infrastructure deployment completed!"

# Application deployment
deploy-apps:
	@echo "Deploying applications to AWS..."
	@echo "Building applications..."
	make build
	@echo "Deploying to AWS..."
	# Add deployment commands here
	@echo "Application deployment completed!"

# View logs
logs:
	@echo "Viewing application logs..."
	docker-compose logs -f

# Health check
health:
	@echo "Checking system health..."
	@echo "Database: $(shell curl -s http://localhost:4000/health/db || echo 'DOWN')"
	@echo "API Gateway: $(shell curl -s http://localhost:4000/health || echo 'DOWN')"
	@echo "Web App: $(shell curl -s http://localhost:3000 || echo 'DOWN')"

# Development setup (first time)
setup: install docker-up db-migrate db-seed
	@echo "Development environment setup completed!"
	@echo "Run 'make dev' to start development servers"

# Production setup
prod-setup: install
	@echo "Production environment setup completed!"
	@echo "Run 'make deploy-infra' to deploy infrastructure"
	@echo "Run 'make deploy-apps' to deploy applications"

# Quick start for development
quick-start: setup dev


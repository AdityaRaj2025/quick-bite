# Quick Bite - Restaurant QR Ordering System

A modern, scalable restaurant QR ordering system built with clean architecture principles and AWS services.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Presentation │    │   Application   │    │     Domain      │
│      Layer     │    │      Layer      │    │      Layer      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Next.js Web  │    │ • Use Cases     │    │ • Entities      │
│ • Mobile App   │    │ • DTOs          │    │ • Value Objects │
│ • Admin Panel  │    │ • Validators    │    │ • Domain Rules  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Infrastructure  │
                    │      Layer      │
                    ├─────────────────┤
                    │ • AWS Services  │
                    │ • Repositories  │
                    │ • External APIs │
                    └─────────────────┘
```

## 🚀 Features

- **QR Code Ordering**: Contactless menu browsing and ordering
- **Real-time Updates**: Live order status tracking
- **Multi-language Support**: Internationalization for global restaurants
- **Role-based Access**: Customer, Staff, Admin, and Kitchen interfaces
- **Order Management**: Complete order lifecycle with audit trail
- **Menu Management**: Dynamic menu with categories and options

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Query** for server state

### Backend
- **Fastify** for high-performance API
- **TypeScript** throughout
- **Zod** for validation
- **JWT** for authentication

### Infrastructure
- **AWS RDS** for PostgreSQL database
- **AWS S3** for file storage
- **AWS Lambda** for serverless functions
- **AWS API Gateway** for API management
- **AWS CloudFront** for CDN
- **AWS SQS** for message queuing

### Database
- **PostgreSQL** with Drizzle ORM
- **Redis** for caching and sessions

## 📁 Project Structure

```
quick-bite/
├── apps/
│   ├── web/                 # Customer-facing web app
│   ├── admin/               # Restaurant management panel
│   ├── staff/               # Staff interface
│   └── kitchen/             # Kitchen display system
├── packages/
│   ├── core/                # Domain entities & business logic
│   ├── shared/              # Common utilities & types
│   └── ui/                  # Reusable UI components
├── services/
│   ├── api-gateway/         # Main API service
│   ├── order-processor/     # Order processing service
│   └── notification/        # Notification service
├── infrastructure/
│   ├── terraform/           # Infrastructure as Code
│   ├── docker/              # Local development
│   └── scripts/             # Deployment scripts
└── docs/                    # Architecture documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- AWS CLI configured
- Terraform installed

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone <repository>
   cd quick-bite
   npm install
   ```

2. **Start local services:**
   ```bash
   make dev
   ```

3. **Access applications:**
   - Customer App: http://localhost:3000
   - Admin Panel: http://localhost:3001
   - API Gateway: http://localhost:4000
   - Adminer (DB): http://localhost:8080

### Production Deployment

1. **Deploy infrastructure:**
   ```bash
   make deploy-infra
   ```

2. **Deploy applications:**
   ```bash
   make deploy-apps
   ```

## 📚 Documentation

- [Architecture Decision Records](./docs/adr/)
- [API Documentation](./docs/api/)
- [Deployment Guide](./docs/deployment/)
- [Development Guide](./docs/development/)

## Key Commands
make dev - Start all development servers
make build - Build all applications
make test - Run all tests
make lint - Run linting
make clean - Clean build artifacts
make docker-up - Start local infrastructure
make health - Check system health

## 🤝 Contributing

1. Follow the [Conventional Commits](https://conventionalcommits.org/) standard
2. Create feature branches from `main`
3. Ensure all tests pass
4. Submit a pull request with clear description

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

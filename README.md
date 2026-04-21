# MERN Stack Microservices — ECS + S3/CloudFront

## Architecture Overview

```
Internet → CloudFront → S3 (React Frontend)
                    ↓
         Application Load Balancer
                    ↓
    ┌───────────────────────────────┐
    │         ECS Cluster           │
    │  ┌─────────┐  ┌───────────┐  │
    │  │API      │  │User       │  │
    │  │Gateway  │  │Service    │  │
    │  └─────────┘  └───────────┘  │
    │  ┌──────────┐ ┌───────────┐  │
    │  │Product   │ │Order      │  │
    │  │Service   │ │Service    │  │
    │  └──────────┘ └───────────┘  │
    └───────────────────────────────┘
                    ↓
             MongoDB Atlas
```

## Services
| Service | Port | Description |
|---|---|---|
| api-gateway | 3000 | Routes requests to microservices |
| user-service | 3001 | Auth, user management |
| product-service | 3002 | Product CRUD |
| order-service | 3003 | Order management |

## Quick Start (Local Dev)
```bash
docker-compose up --build
```

## Deploy to AWS
```bash
# 1. Push images to ECR
cd infrastructure/ecr && bash push-images.sh

# 2. Deploy ECS services
cd infrastructure/ecs && bash deploy.sh

# 3. Deploy frontend to S3 + CloudFront
cd infrastructure/cloudfront && bash deploy-frontend.sh
```

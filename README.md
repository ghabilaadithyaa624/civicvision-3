# CivicVision AI

Enterprise AI-powered civic infrastructure platform — a monorepo containing the backend API, frontend web app, and computer-vision AI microservice used to detect, classify, and manage civic infrastructure issues (potholes, garbage, damaged signage, etc.) at city scale.

## Monorepo Structure

```
civicvision3-ai/
├── apps/
│   ├── frontend/       # React 19 + TypeScript + Vite web app
│   ├── backend/        # Node.js 22 + Express + TypeScript API
│   └── ai-service/     # Python + FastAPI + PyTorch/YOLOv11 inference service
├── packages/
│   ├── shared-ui/      # Shared React component library
│   ├── shared-types/   # Shared TypeScript types/interfaces (contracts)
│   └── config/         # Shared lint/tsconfig/build configs
├── infra/
│   ├── docker/         # Service Dockerfiles
│   ├── terraform/      # Infrastructure as Code (cloud provisioning)
│   ├── kubernetes/     # K8s manifests for orchestration
│   ├── nginx/          # Reverse proxy / edge config
│   └── monitoring/     # Prometheus/Grafana/logging configs
├── docs/                # Architecture decision records, API docs
├── scripts/             # Dev/ops automation scripts
├── docker-compose.yml   # Local multi-service orchestration
└── .env.example         # Root environment variable template
```

## Tech Stack

| Layer     | Technology                                                                 |
|-----------|-----------------------------------------------------------------------------|
| Frontend  | React 19, TypeScript, Vite, Redux Toolkit, React Query, TailwindCSS         |
| Backend   | Node.js 22, Express, TypeScript, Prisma, PostgreSQL, Redis, JWT             |
| AI Service| Python, FastAPI, PyTorch, YOLOv11, OpenCV, MLflow                           |
| Infra     | Docker, Docker Compose, Terraform, Kubernetes, Nginx                        |

## Build Status

This project is being built **module-by-module** with review checkpoints between each stage:

- [x] Module 1 — Monorepo root scaffold
- [x] Module 2 — Backend core (config, app bootstrap, health check)
- [x] Module 3 — Backend database layer (Prisma + PostgreSQL)
- [x] Module 4 — Backend auth module (JWT + bcrypt, user repository/service)
- [x] Module 5 — Frontend scaffold (Vite + routing + state)
- [x] Module 6 — AI service scaffold (FastAPI + health check)
- [x] Module 7 — Docker & docker-compose integration
- [x] Module 8 — Shared packages (types, UI, config)
- [x] Module 9 — CI/CD (.github workflows)
- [ ] Module 10 — Infra (Terraform / Kubernetes / Nginx / monitoring)

## Getting Started

```bash
# 1. Clone and install root workspace dependencies
npm install

# 2. Copy environment templates
cp .env.example .env

# 3. Start local infra (once docker-compose services are added)
npm run docker:up
```

## License

Proprietary — CivicVision AI Team.

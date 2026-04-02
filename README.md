# TaskFlow - Secure DevSecOps Microservices Web App

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![GitHub stars](https://img.shields.io/github/stars/abdulraheem381/Taskflow-devsecops-ecs-pipeline)
![DevSecOps](https://img.shields.io/badge/DevSecOps-Ready-orange)

**A realistic internal Task Management System built as a 3-microservice architecture — specifically designed as the sample application for a professional DevSecOps CI/CD pipeline on AWS ECS (Fargate).**

This app demonstrates modern microservices patterns, security-first development, and production-ready practices that recruiters in Islamabad and global remote companies look for in 2026 DevOps fresher portfolios.

---

## Screenshots

### Login Page
![Login Page](./screenshots/login-page.png)

*Clean, professional login with JWT authentication*

### Dashboard (Light Mode)
![Dashboard Light](./screenshots/dashboard-light.png)

*Kanban-style task board with drag-and-drop*

### Dashboard (Dark Mode)
![Dashboard Dark](./screenshots/dashboard-dark.png)

*Fully responsive with dark/light mode toggle*

*(Add your 3 screenshots here — create a `screenshots/` folder in the repo and name files exactly as above)*

---

## Features

- **3 independent microservices** working together
- Full user authentication (register + login with JWT)
- Kanban-style task board with drag-and-drop
- CRUD operations for tasks with priority, assignee, due dates
- Protected routes (only authenticated users see their tasks)
- Responsive UI with dark/light mode
- Production-ready Dockerfiles for each service
- Health checks on all services
- Structured logging and input validation
- Ready for security scanning (Trivy, SonarQube, Snyk, Checkov)

---

## Architecture

```
taskflow-microservices/
├── frontend/          → React + Vite + Tailwind + Axios
├── auth-service/      → Node.js + Express + JWT + SQLite
├── tasks-service/     → Node.js + Express + SQLite
├── docker-compose.yml → Local testing of all 3 services
└── (each service has its own Dockerfile)
```

All services communicate via REST + Bearer tokens. No external database required.

---

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Frontend       | React 18 + Vite + Tailwind CSS + React DnD |
| Backend        | Node.js 20 + Express + JWT + bcrypt |
| Database       | SQLite (better-sqlite3)             |
| Container      | Docker (multi-stage, non-root)      |
| Orchestration  | docker-compose (local) + AWS ECS (production) |
| Security       | Helmet, rate limiting, Joi validation |

---

## Local Development

### 1. Clone & Run with Docker (Recommended)
```bash
git clone https://github.com/abdulraheem381/Taskflow-devsecops-ecs-pipeline.git
cd Taskflow-devsecops-ecs-pipeline
docker-compose up --build
```

Open http://localhost:3000

### 2. Run without Docker (for development)
```bash
# Terminal 1 - Frontend
cd frontend && npm install && npm run dev

# Terminal 2 - Auth Service
cd auth-service && npm install && npm run dev

# Terminal 3 - Tasks Service
cd tasks-service && npm install && npm run dev
```

---

## For DevSecOps Portfolio Pipeline

This repository is **Project 1** of my 2026 DevSecOps portfolio:
- Used in a full **security-first CI/CD pipeline** on **AWS ECS (Fargate)**
- Terraform provisions ECS + ECR
- GitHub Actions runs build → test → Trivy → SonarQube → Snyk → Checkov → deploy
- AWS CloudWatch for monitoring + alerts

**Next:** The complete pipeline repo will be linked here once built.

---

## Blog & Demo
- **Blog Post:** Coming soon on [abdulraheem.cloud](https://abdulraheem.cloud)

---

**Built as part of "DevOps Projects" — Abdul Raheem**  

⭐ Star this repo if it helps you learn DevSecOps!
```



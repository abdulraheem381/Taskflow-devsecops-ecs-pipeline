# Terraform ECS Deployment

This Terraform stack deploys the app to **AWS ECS Fargate** as **one ECS service running one task definition with 3 containers**:

- `frontend` on port `8080`
- `auth-service` on port `4001`
- `tasks-service` on port `4002`

There is **no load balancer** in this version. The frontend container is exposed directly on the task public IP at port `8080`. It proxies `/api/auth` and `/api/tasks` to the backend sidecars over `127.0.0.1`.

## What It Creates

- VPC with 2 public subnets
- Internet Gateway and public routing
- Security group for the ECS task
- ECS cluster
- ECS task definition with all 3 containers
- ECS service on Fargate
- CloudWatch log group
- IAM execution role and task role

## Tradeoff

This is cheaper because there is no ALB, but it also means:

- no stable DNS name from the infrastructure
- the app is reached on `http://<task-public-ip>:8080`
- if ECS replaces the task, the public IP changes
- scaling past one task is not practical without adding a load balancer

## Important Note About SQLite

`auth-service` and `tasks-service` currently use SQLite files inside the task (`/app/data/*.db`). In this Terraform stack those files live on **ephemeral task storage**, which means the data is lost if the task is replaced or rescheduled.

For a portfolio/demo deployment this is acceptable. For persistent data, move SQLite to **EFS** or replace it with **RDS/DynamoDB**.

## Usage

1. Build and push the three images to ECR.
2. Copy `terraform.tfvars.example` to `terraform.tfvars`.
3. Set your ECR image URIs and `jwt_secret`.
4. Run:

```bash
terraform init
terraform plan
terraform apply
```

After apply, get the task public IP from the ECS console or the task ENI in EC2, then open `http://<task-public-ip>:8080`.

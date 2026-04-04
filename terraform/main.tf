data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_iam_policy_document" "ecs_task_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

locals {
  name = var.project_name

  tags = merge(var.tags, {
    Name = var.project_name
  })

  azs = slice(data.aws_availability_zones.available.names, 0, length(var.public_subnet_cidrs))
}

resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(local.tags, {
    Name = "${local.name}-vpc"
  })
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = merge(local.tags, {
    Name = "${local.name}-igw"
  })
}

resource "aws_subnet" "public" {
  count = length(var.public_subnet_cidrs)

  vpc_id                  = aws_vpc.this.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = local.azs[count.index]
  map_public_ip_on_launch = true

  tags = merge(local.tags, {
    Name = "${local.name}-public-${count.index + 1}"
    Tier = "public"
  })
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  tags = merge(local.tags, {
    Name = "${local.name}-public-rt"
  })
}

resource "aws_route_table_association" "public" {
  count = length(aws_subnet.public)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "ecs_service" {
  name        = "${local.name}-ecs-sg"
  description = "Allow internet traffic to the frontend container"
  vpc_id      = aws_vpc.this.id

  ingress {
    description = "Frontend traffic from the internet"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.tags, {
    Name = "${local.name}-ecs-sg"
  })
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${local.name}"
  retention_in_days = var.log_retention_days

  tags = merge(local.tags, {
    Name = "${local.name}-logs"
  })
}

resource "aws_iam_role" "ecs_execution" {
  name               = "${local.name}-ecs-execution-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role.json

  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "ecs_execution" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "ecs_task" {
  name               = "${local.name}-ecs-task-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role.json

  tags = local.tags
}

resource "aws_ecs_cluster" "this" {
  name = "${local.name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = merge(local.tags, {
    Name = "${local.name}-cluster"
  })
}

resource "aws_ecs_task_definition" "this" {
  family                   = "${local.name}-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = tostring(var.task_cpu)
  memory                   = tostring(var.task_memory)
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn



  container_definitions = jsonencode([
    {
      name      = "auth-service"
      image     = var.auth_image
      essential = true
      cpu       = 256
      memory    = 512
      portMappings = [
        {
          containerPort = 4001
          hostPort      = 4001
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "PORT", value = "4001" },
        { name = "NODE_ENV", value = "production" },
        { name = "JWT_SECRET", value = var.jwt_secret },
        { name = "JWT_EXPIRES_IN", value = var.jwt_expires_in },
        { name = "DB_PATH", value = "/app/data/auth.db" },
        { name = "CORS_ORIGIN", value = "*" },
        { name = "LOG_LEVEL", value = "info" }
      ]
      healthCheck = {
        command     = ["CMD-SHELL", "node -e \"fetch('http://127.0.0.1:4001/health').then((res)=>process.exit(res.ok?0:1)).catch(()=>process.exit(1))\""]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 60
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "auth-service"
        }
      }
    },
    {
      name      = "tasks-service"
      image     = var.tasks_image
      essential = true
      cpu       = 256
      memory    = 512
      portMappings = [
        {
          containerPort = 4002
          hostPort      = 4002
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "PORT", value = "4002" },
        { name = "NODE_ENV", value = "production" },
        { name = "JWT_SECRET", value = var.jwt_secret },
        { name = "DB_PATH", value = "/app/data/tasks.db" },
        { name = "CORS_ORIGIN", value = "*" },
        { name = "LOG_LEVEL", value = "info" }
      ]
      healthCheck = {
        command     = ["CMD-SHELL", "node -e \"fetch('http://127.0.0.1:4002/health').then((res)=>process.exit(res.ok?0:1)).catch(()=>process.exit(1))\""]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 60
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "tasks-service"
        }
      }
    },
    {
      name      = "frontend"
      image     = var.frontend_image
      essential = true
      cpu       = 256
      memory    = 512
      dependsOn = [
        {
          containerName = "auth-service"
          condition     = "HEALTHY"
        },
        {
          containerName = "tasks-service"
          condition     = "HEALTHY"
        }
      ]
      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
          protocol      = "tcp"
        }
      ]
      healthCheck = {
        command     = ["CMD-SHELL", "wget --quiet --tries=1 --spider http://127.0.0.1:8080/health || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 60
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "frontend"
        }
      }
    }
  ])

  tags = merge(local.tags, {
    Name = "${local.name}-task"
  })
}

resource "aws_ecs_service" "this" {
  name                   = "${local.name}-service"
  cluster                = aws_ecs_cluster.this.id
  task_definition        = aws_ecs_task_definition.this.arn
  desired_count          = var.desired_count
  launch_type            = "FARGATE"
  enable_execute_command = true

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.ecs_service.id]
    assign_public_ip = true
  }

  tags = merge(local.tags, {
    Name = "${local.name}-service"
  })
}

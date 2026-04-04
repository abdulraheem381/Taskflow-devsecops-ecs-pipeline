aws_region     = "ap-south-2"
project_name   = "taskflow"
desired_count  = 1

frontend_image = "abdulraheem381/taskflow-frontend:latest"
auth_image     = "abdulraheem381/taskflow-auth-service:latest"
tasks_image    = "abdulraheem381/taskflow-tasks-service:latest"

jwt_secret = "J9k1A8bL4xP7mQ2yV5nC0wE6rT3zH8sF"

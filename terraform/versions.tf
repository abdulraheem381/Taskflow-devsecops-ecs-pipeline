terraform {
  backend "s3" {
    bucket         = "taskflow-terraform-state-abdulraheem"
    key            = "state/terraform.tfstate"
    region         = "ap-south-2"
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.39.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

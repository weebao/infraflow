#!/usr/bin/env ts-node

/**
 * Terraform EC2 Configuration Generator
 *
 * Generates Terraform configuration files for deploying an AWS EC2 instance.
 * Supports optional Docker installation, security groups, VPC setup, and load balancing.
 *
 * Usage:
 *   ts-node generateEC2Terraform.ts [options]
 *
 * Options:
 *   --docker        Include Docker setup
 *   --security      Include security group configurations
 *   --vpc           Include VPC and networking configurations
 *   --load-balancer Include Load Balancer configuration
 *   -o, --output    Output directory for Terraform files (default: current directory)
 */

import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';

// Initialize Commander for CLI argument parsing
const program = new Command();

program
  .description('Generate Terraform configuration files for AWS EC2 instances.')
  .option('--docker', 'Include Docker setup')
  .option('--security', 'Include security group configurations')
  .option('--vpc', 'Include VPC and networking configurations')
  .option('--load-balancer', 'Include Load Balancer configuration')
  .option('-o, --output <directory>', 'Output directory for Terraform files', '.');

program.parse(process.argv);

const options = program.opts();

// Ensure output directory exists
const outputDir: string = options.output;
fs.mkdirSync(outputDir, { recursive: true });

// Helper function to write files
function writeFile(fileName: string, content: string) {
  const filePath = path.join(outputDir, fileName);
  fs.writeFileSync(filePath, content.trim(), 'utf8');
  console.log(`Generated ${filePath}`);
}

// Generate `variables_ec2_2.tf`
function generateVariablesTF(): string {
  const lines: string[] = [
    'variable "ami_id" {',
    '  description = "AMI ID for the EC2 instance"',
    '  type        = string',
    '  default     = "ami-011899242bb902164"', // Ubuntu 20.04 LTS // us-east-1
    '}',
    '',
    'variable "instance_type" {',
    '  description = "EC2 instance type"',
    '  type        = string',
    '  default     = "t2.micro"',
    '}',
    '',
    'variable "key_name" {',
    '  description = "The name of the SSH key pair to use for the EC2 instance."',
    '  type        = string',
    '}',
    '',
    'variable "instance_count" {',
    '  description = "Number of EC2 instances to create."',
    '  type        = number',
    '  default     = 1',
    '}',
  ];

  if (options.security) {
    lines.push(
      '',
      'variable "allowed_ssh_cidr" {',
      '  description = "CIDR block allowed to SSH into the EC2 instance."',
      '  type        = string',
      '  default     = "0.0.0.0/0"', // Replace with specific IP for security
      '}',
      '',
      'variable "allowed_http_cidr" {',
      '  description = "CIDR block allowed HTTP access to the EC2 instance."',
      '  type        = string',
      '  default     = "0.0.0.0/0"',
      '}'
    );
  }

  if (options.docker) {
    lines.push(
      '',
      'variable "docker_image" {',
      '  description = "Docker image to run on the EC2 instance."',
      '  type        = string',
      '}',
      '',
      'variable "docker_container_name" {',
      '  description = "Name of the Docker container to run."',
      '  type        = string',
      '  default     = "my_docker_container"',
      '}'
    );
  }

  if (options.vpc) {
    lines.push(
      '',
      'variable "vpc_cidr" {',
      '  description = "CIDR block for the VPC."',
      '  type        = string',
      '  default     = "10.0.0.0/16"',
      '}',
      '',
      'variable "subnet_cidr" {',
      '  description = "CIDR block for the subnet."',
      '  type        = string',
      '  default     = "10.0.1.0/24"',
      '}',
      '',
      'variable "availability_zone" {',
      '  description = "Availability zone for the subnet."',
      '  type        = string',
      '  default     = "us-east-1a"',
      '}'
    );
  }

  if (options.loadBalancer) {
    lines.push(
      '',
      'variable "lb_name" {',
      '  description = "Name of the Load Balancer."',
      '  type        = string',
      '  default     = "example-lb"',
      '}',
      '',
      'variable "lb_port" {',
      '  description = "Port for Load Balancer to listen on."',
      '  type        = number',
      '  default     = 80',
      '}'
    );
  }

  return lines.join('\n');
}

// Generate `outputs_ec2_2.tf`
function generateOutputsTF(): string {
  const lines: string[] = [
    'output "instance_ids" {',
    '  description = "The IDs of the EC2 instances."',
    '  value       = aws_instance.ec2.*.id',
    '}',
    '',
    'output "instance_public_ips" {',
    '  description = "The public IP addresses of the EC2 instances."',
    '  value       = aws_instance.ec2.*.public_ip',
    '}',
    '',
    'output "instance_public_dns" {',
    '  description = "The public DNS of the EC2 instances."',
    '  value       = aws_instance.ec2.*.public_dns',
    '}',
  ];

  if (options.vpc) {
    lines.push(
      '',
      'output "vpc_id" {',
      '  description = "The ID of the VPC."',
      '  value       = aws_vpc.main.id',
      '}',
      '',
      'output "subnet_id" {',
      '  description = "The ID of the Subnet."',
      '  value       = aws_subnet.main.id',
      '}'
    );
  }

  if (options.loadBalancer) {
    lines.push(
      '',
      'output "load_balancer_dns" {',
      '  description = "The DNS name of the Load Balancer."',
      '  value       = aws_lb.lb.dns_name',
      '}'
    );
  }

  return lines.join('\n');
}

// Generate `main_ec2_2.tf`
function generateMainTF(): string {
  const lines: string[] = [];

  if (options.vpc) {
    lines.push(
      '',
      '# VPC',
      'resource "aws_vpc" "main" {',
      '  cidr_block = var.vpc_cidr',
      '  tags = {',
      '    Name = "example-vpc"',
      '  }',
      '',
      '  lifecycle {',
      '    prevent_destroy = true', // Prevents accidental deletion
      '  }',
      '}',
      '',
      '# Subnet',
      'resource "aws_subnet" "main" {',
      '  vpc_id                  = aws_vpc.main.id',
      '  cidr_block              = var.subnet_cidr',
      '  availability_zone       = var.availability_zone',
      '  map_public_ip_on_launch = true',
      '  tags = {',
      '    Name = "example-subnet"',
      '  }',
      '',
      '  depends_on = [aws_vpc.main]', // Ensures VPC is created first',
      '}',
      '',
      '# Internet Gateway',
      'resource "aws_internet_gateway" "igw" {',
      '  vpc_id = aws_vpc.main.id',
      '  tags = {',
      '    Name = "example-igw"',
      '  }',
      '',
      '  depends_on = [aws_vpc.main]', // Ensures VPC is created before the gateway',
      '}',
      '',
      '# Route Table',
      'resource "aws_route_table" "rt" {',
      '  vpc_id = aws_vpc.main.id',
      '  route {',
      '    cidr_block = "0.0.0.0/0"',
      '    gateway_id = aws_internet_gateway.igw.id',
      '  }',
      '  tags = {',
      '    Name = "example-route-table"',
      '  }',
      '',
      '  depends_on = [aws_internet_gateway.igw]', // Ensures the IGW is created before the route table',
      '}',
      '',
      '# Route Table Association',
      'resource "aws_route_table_association" "rta" {',
      '  subnet_id      = aws_subnet.main.id',
      '  route_table_id = aws_route_table.rt.id',
      '',
      '  depends_on = [aws_route_table.rt, aws_subnet.main]', // Ensures the route table and subnet are created before associating',
      '}'
    );
  }

  if (options.security) {
    lines.push(
      '',
      '# Security Group',
      'resource "aws_security_group" "sg" {',
      '  name        = "example-sg"',
      '  description = "Security group for EC2 instance"',
      options.vpc ? '  vpc_id      = aws_vpc.main.id' : '',
      '  ingress {',
      '    description = "Allow SSH"',
      '    from_port   = 22',
      '    to_port     = 22',
      '    protocol    = "tcp"',
      '    cidr_blocks = [var.allowed_ssh_cidr]',
      '  }',
      '  ingress {',
      '    description = "Allow HTTP"',
      '    from_port   = 80',
      '    to_port     = 80',
      '    protocol    = "tcp"',
      '    cidr_blocks = [var.allowed_http_cidr]',
      '  }',
      '  egress {',
      '    from_port   = 0',
      '    to_port     = 0',
      '    protocol    = "-1"',
      '    cidr_blocks = ["0.0.0.0/0"]',
      '  }',
      '  tags = {',
      '    Name = "example-sg"',
      '  }',
      '',
      '  lifecycle {',
      '    create_before_destroy = true', // Ensures a new SG is created before an old one is destroyed in updates',
      '  }',
      '}'
    );
  }

  lines.push(
    '',
    '# EC2 Instance',
    'resource "aws_instance" "ec2" {',
    '  count                 = var.instance_count',
    '  ami                   = var.ami_id',
    '  instance_type         = var.instance_type',
    options.vpc ? '  subnet_id            = aws_subnet.main.id' : '',
    options.security ? '  vpc_security_group_ids = [aws_security_group.sg.id]' : '',
    '  key_name              = var.key_name',
    '',
    '  lifecycle {',
    '    create_before_destroy = true', // Ensures replacement instance is created before deleting the old one',
    '  }',
    '',
    options.vpc ? '  depends_on = [aws_subnet.main, aws_security_group.sg]' : 'depends_on = [aws_security_group.sg]', // Dependency for EC2 on VPC and SG',
  );

  if (options.docker) {
    lines.push(
      '  user_data = <<-EOF',
      '              #!/bin/bash',
      '              yum update -y',
      '              amazon-linux-extras install docker -y',
      '              service docker start',
      '              usermod -a -G docker ec2-user',
      `              docker run -d --name \${var.docker_container_name} -p 80:80 \${var.docker_image}`,
      '              EOF'
    );
  }

  lines.push(
    '  tags = {',
    '    Name = "example-instance"',
    '  }',
    '}'
  );

  if (options.loadBalancer) {
    lines.push(
      '',
      '# Load Balancer',
      'resource "aws_lb" "lb" {',
      '  name               = var.lb_name',
      '  load_balancer_type = "application"',
      options.vpc ? '  subnets            = [aws_subnet.main.id]' : '',
      options.security ? '  security_groups    = [aws_security_group.lb_sg.id]' : '',
      '  tags = {',
      '    Name = var.lb_name',
      '  }',
      '',
      '  lifecycle {',
      '    prevent_destroy = true', // Prevents accidental deletion of the Load Balancer',
      '  }',
      '}',
      '',
      '# Target Group',
      'resource "aws_lb_target_group" "tg" {',
      '  name     = "${var.lb_name}-tg"',
      '  port     = var.lb_port',
      '  protocol = "HTTP"',
      options.vpc ? '  vpc_id   = aws_vpc.main.id' : '',
      '',
      '  depends_on = [aws_lb.lb]', // Ensures Load Balancer is created before the target group',
      '}',
      '',
      '# Listener',
      'resource "aws_lb_listener" "listener" {',
      '  load_balancer_arn = aws_lb.lb.arn',
      '  port              = var.lb_port',
      '  protocol          = "HTTP"',
      '  default_action {',
      '    type             = "forward"',
      '    target_group_arn = aws_lb_target_group.tg.arn',
      '  }',
      '',
      '  depends_on = [aws_lb_target_group.tg]', // Ensures Target Group is created before Listener',
      '}',
      '',
      '# Register Targets',
      'resource "aws_lb_target_group_attachment" "attachment" {',
      '  count            = var.instance_count',
      '  target_group_arn = aws_lb_target_group.tg.arn',
      '  target_id        = aws_instance.ec2[count.index].id',
      '  port             = var.lb_port',
      '',
      '  depends_on = [aws_lb_listener.listener, aws_instance.ec2]', // Ensures Listener and EC2 are created before attachment',
      '}'
    );
  }

  return lines.join('\n');
}

// Main function to generate Terraform files
function generateTerraformFiles() {
  writeFile('variables_ec2_2.tf', generateVariablesTF());
  writeFile('outputs_ec2_2.tf', generateOutputsTF());
  writeFile('main_ec2_2.tf', generateMainTF());
  console.log('Terraform configuration files have been successfully generated.');
}

// Execute the script
generateTerraformFiles();

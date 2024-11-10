#!/usr/bin/env ts-node

/**
 * Terraform Lambda Configuration Generator
 *
 * Generates Terraform configuration files for deploying an AWS Lambda function.
 * Supports optional API Gateway setup, VPC configuration, environment variables, IAM roles, and Lambda Layers.
 *
 * Usage:
 *   ts-node generateLambdaTerraform.ts [options]
 *
 * Options:
 *   --api-gateway        Include API Gateway setup
 *   --vpc                Include VPC and networking configurations
 *   --environment        Include environment variables
 *   --layers             Include Lambda Layers
 *   --schedule           Include scheduled CloudWatch Events
 *   -o, --output         Output directory for Terraform files (default: current directory)
 */

import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';

// Initialize Commander for CLI argument parsing
const program = new Command();

program
  .description('Generate Terraform configuration files for AWS Lambda functions.')
  .option('--api-gateway', 'Include API Gateway setup')
  .option('--vpc', 'Include VPC and networking configurations')
  .option('--environment', 'Include environment variables')
  .option('--layers', 'Include Lambda Layers')
  .option('--schedule', 'Include scheduled CloudWatch Events')
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

// Generate `variables_lambda.tf`
function generateVariablesTF(): string {
  const lines: string[] = [
    'variable "lambda_function_name" {',
    '  description = "Name of the Lambda function"',
    '  type        = string',
    '  default     = "my_lambda_function"',
    '}',
    '',
    'variable "lambda_runtime" {',
    '  description = "Runtime environment for the Lambda function"',
    '  type        = string',
    '  default     = "nodejs18.x"',
    '}',
    '',
    'variable "lambda_handler" {',
    '  description = "Handler for the Lambda function"',
    '  type        = string',
    '  default     = "index.handler"',
    '}',
    '',
    'variable "lambda_zip_file" {',
    '  description = "Path to the zipped Lambda function code"',
    '  type        = string',
    '  default     = "lambda_function_payload.zip"',
    '}',
    '',
    'variable "lambda_role_name" {',
    '  description = "Name of the IAM role for Lambda"',
    '  type        = string',
    '  default     = "lambda_execution_role"',
    '}',
  ];

  if (options.apiGateway) {
    lines.push(
      '',
      'variable "api_gateway_name" {',
      '  description = "Name of the API Gateway"',
      '  type        = string',
      '  default     = "my_api_gateway"',
      '}',
      '',
      'variable "api_gateway_stage" {',
      '  description = "Stage name for the API Gateway"',
      '  type        = string',
      '  default     = "dev"',
      '}'
    );
  }

  if (options.vpc) {
    lines.push(
      '',
      'variable "vpc_id" {',
      '  description = "ID of the VPC"',
      '  type        = string',
      '}',
      '',
      'variable "subnet_ids" {',
      '  description = "List of Subnet IDs for the Lambda function"',
      '  type        = list(string)',
      '}',
      '',
      'variable "security_group_ids" {',
      '  description = "List of Security Group IDs for the Lambda function"',
      '  type        = list(string)',
      '}'
    );
  }

  if (options.environment) {
    lines.push(
      '',
      'variable "environment_variables" {',
      '  description = "Environment variables for the Lambda function"',
      '  type        = map(string)',
      '  default     = {',
      '    ENV = "production"',
      '  }',
      '}'
    );
  }

  if (options.layers) {
    lines.push(
      '',
      'variable "lambda_layers" {',
      '  description = "List of Lambda Layer ARNs to attach"',
      '  type        = list(string)',
      '  default     = []',
      '}'
    );
  }

  if (options.schedule) {
    lines.push(
      '',
      'variable "schedule_expression" {',
      '  description = "Cron expression for scheduled events"',
      '  type        = string',
      '  default     = "rate(5 minutes)"',
      '}'
    );
  }

  return lines.join('\n');
}

// Generate `outputs_lambda.tf`
function generateOutputsTF(): string {
  const lines: string[] = [
    'output "lambda_function_arn" {',
    '  description = "ARN of the Lambda function"',
    '  value       = aws_lambda_function.lambda.arn',
    '}',
    '',
    'output "lambda_function_invoke_arn" {',
    '  description = "Invoke ARN of the Lambda function"',
    '  value       = aws_lambda_function.lambda.invoke_arn',
    '}',
  ];

  if (options.apiGateway) {
    lines.push(
      '',
      'output "api_gateway_invoke_url" {',
      '  description = "Invoke URL of the API Gateway"',
      '  value       = aws_api_gateway_stage.stage.invoke_url',
      '}'
    );
  }

  return lines.join('\n');
}

// Generate `main_lambda.tf`
function generateMainTF(): string {
  const lines: string[] = [];

  // IAM Role for Lambda
  lines.push(
    '',
    '# IAM Role for Lambda',
    'resource "aws_iam_role" "lambda_role" {',
    '  name = var.lambda_role_name',
    '',
    '  assume_role_policy = jsonencode({',
    '    Version = "2012-10-17",',
    '    Statement = [{',
    '      Action = "sts:AssumeRole",',
    '      Effect = "Allow",',
    '      Principal = {',
    '        Service = "lambda.amazonaws.com",',
    '      },',
    '    }],',
    '  })',
    '',
    '  tags = {',
    '    Name = var.lambda_role_name',
    '  }',
    '}',
    '',
    '# IAM Policy Attachment for Lambda',
    'resource "aws_iam_role_policy_attachment" "lambda_policy_attachment" {',
    '  role       = aws_iam_role.lambda_role.name',
    '  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"',
    '}'
  );

  if (options.vpc) {
    lines.push(
      '',
      '# Additional IAM Policy for VPC Access',
      'resource "aws_iam_role_policy_attachment" "lambda_vpc_policy_attachment" {',
      '  role       = aws_iam_role.lambda_role.name',
      '  policy_arn = "arn:aws:iam::aws:policy/AmazonVPCFullAccess"',
      '}'
    );
  }

  // Lambda Function
  lines.push(
    '',
    '# Lambda Function',
    'resource "aws_lambda_function" "lambda" {',
    '  function_name = var.lambda_function_name',
    '  role          = aws_iam_role.lambda_role.arn',
    '  handler       = var.lambda_handler',
    '  runtime       = var.lambda_runtime',
    '  filename      = var.lambda_zip_file',
    '',
    '  source_code_hash = filebase64sha256(var.lambda_zip_file)',
    '',
    ...(options.environment
      ? [
          '  environment {',
          '    variables = var.environment_variables',
          '  }',
        ]
      : []),
    ...(options.layers
      ? [
          '  layers = var.lambda_layers',
        ]
      : []),
    ...(options.vpc
      ? [
          '  vpc_config {',
          '    subnet_ids         = var.subnet_ids',
          '    security_group_ids = var.security_group_ids',
          '  }',
        ]
      : []),
    '  tags = {',
    '    Name = var.lambda_function_name',
    '  }',
    '}'
  );

  // API Gateway Integration
  if (options.apiGateway) {
    lines.push(
      '',
      '# API Gateway',
      'resource "aws_api_gateway_rest_api" "api" {',
      '  name        = var.api_gateway_name',
      '  description = "API Gateway for Lambda function"',
      '}',
      '',
      'resource "aws_api_gateway_resource" "resource" {',
      '  rest_api_id = aws_api_gateway_rest_api.api.id',
      '  parent_id   = aws_api_gateway_rest_api.api.root_resource_id',
      '  path_part   = "execute"',
      '}',
      '',
      'resource "aws_api_gateway_method" "method" {',
      '  rest_api_id   = aws_api_gateway_rest_api.api.id',
      '  resource_id   = aws_api_gateway_resource.resource.id',
      '  http_method   = "POST"',
      '  authorization = "NONE"',
      '}',
      '',
      'resource "aws_api_gateway_integration" "integration" {',
      '  rest_api_id             = aws_api_gateway_rest_api.api.id',
      '  resource_id             = aws_api_gateway_resource.resource.id',
      '  http_method             = aws_api_gateway_method.method.http_method',
      '  integration_http_method = "POST"',
      '  type                    = "AWS_PROXY"',
      '  uri                     = aws_lambda_function.lambda.invoke_arn',
      '}',
      '',
      'resource "aws_api_gateway_stage" "stage" {',
      '  stage_name    = var.api_gateway_stage',
      '  rest_api_id   = aws_api_gateway_rest_api.api.id',
      '  deployment_id = aws_api_gateway_deployment.deployment.id',
      '}',
      '',
      'resource "aws_api_gateway_deployment" "deployment" {',
      '  depends_on = [aws_api_gateway_integration.integration]',
      '',
      '  rest_api_id = aws_api_gateway_rest_api.api.id',
      '  stage_name  = var.api_gateway_stage',
      '}',
      '',
      '# Allow API Gateway to invoke Lambda',
      'resource "aws_lambda_permission" "api_gateway" {',
      '  statement_id  = "AllowAPIGatewayInvoke"',
      '  action        = "lambda:InvokeFunction"',
      '  function_name = aws_lambda_function.lambda.function_name',
      '  principal     = "apigateway.amazonaws.com"',
      '  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"',
      '}'
    );
  }

  // VPC Resources (if any) - Typically managed externally or by other scripts
  // This script assumes VPC resources are provided if --vpc is specified

  // Scheduled Events
  if (options.schedule) {
    lines.push(
      '',
      '# CloudWatch Event Rule for Scheduled Invocation',
      'resource "aws_cloudwatch_event_rule" "schedule" {',
      '  name                = "${var.lambda_function_name}-schedule"',
      '  schedule_expression = var.schedule_expression',
      '  description         = "Scheduled event to trigger Lambda function"',
      '}',
      '',
      '# CloudWatch Event Target',
      'resource "aws_cloudwatch_event_target" "target" {',
      '  rule      = aws_cloudwatch_event_rule.schedule.name',
      '  target_id = "LambdaFunctionTarget"',
      '  arn       = aws_lambda_function.lambda.arn',
      '}',
      '',
      '# Allow CloudWatch Events to Invoke Lambda',
      'resource "aws_lambda_permission" "cloudwatch" {',
      '  statement_id  = "AllowCloudWatchInvoke"',
      '  action        = "lambda:InvokeFunction"',
      '  function_name = aws_lambda_function.lambda.function_name',
      '  principal     = "events.amazonaws.com"',
      '  source_arn    = aws_cloudwatch_event_rule.schedule.arn',
      '}'
    );
  }

  return lines.join('\n');
}

// Generate `providers_lambda.tf`
function generateProvidersTF(): string {
  const lines: string[] = [
    'provider "aws" {',
    '  region = "us-east-1" # Change to your desired region',
    '}',
  ];

  return lines.join('\n');
}

// Main function to generate Terraform files
function generateTerraformFiles() {
  writeFile('providers_lambda.tf', generateProvidersTF());
  writeFile('variables_lambda.tf', generateVariablesTF());
  writeFile('outputs_lambda.tf', generateOutputsTF());
  writeFile('main_lambda.tf', generateMainTF());
  console.log('Terraform configuration files have been successfully generated.');
}

// Execute the script
generateTerraformFiles();

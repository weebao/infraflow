#!/usr/bin/env ts-node

/**
 * Terraform RDS Configuration Generator
 *
 * Generates Terraform configuration files for deploying an AWS RDS instance.
 * Supports options for setting the database engine, instance class, storage, backup, and more.
 *
 * Usage:
 *   ts-node generateRDSTerraform.ts [options]
 *
 * Options:
 *   --engine <engine>        Database engine for RDS instance (default: mysql)
 *   --engine-version <ver>   Database engine version (default: 8.0)
 *   --instance-class <class> Instance class for the RDS instance (default: db.t2.micro)
 *   --storage <size>         Allocated storage size in GB (default: 20)
 *   --backup-retention <days> Backup retention period in days (default: 7)
 *   --multi-az               Enable Multi-AZ deployment for high availability
 *   -o, --output <directory> Output directory for Terraform files (default: current directory)
 */

import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';

// Initialize Commander for CLI argument parsing
const program = new Command();

program
  .description('Generate Terraform configuration files for an AWS RDS instance.')
  .option('--engine <engine>', 'Database engine for RDS instance', 'mysql')
  .option('--engine-version <ver>', 'Database engine version', '8.0')
  .option('--instance-class <class>', 'Instance class for the RDS instance', 'db.t2.micro')
  .option('--storage <size>', 'Allocated storage size in GB', '20')
  .option('--backup-retention <days>', 'Backup retention period in days', '7')
  .option('--multi-az', 'Enable Multi-AZ deployment for high availability')
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

// Generate `variables.tf`
function generateVariablesTF(): string {
  const lines: string[] = [
    'variable "rds_identifier" {',
    '  description = "Identifier for the RDS instance."',
    '  type        = string',
    '  default     = "example-rds"',
    '}',
    '',
    'variable "rds_username" {',
    '  description = "Username for the RDS instance."',
    '  type        = string',
    '}',
    '',
    'variable "rds_password" {',
    '  description = "Password for the RDS instance."',
    '  type        = string',
    '  sensitive   = true',
    '}',
    '',
    'variable "rds_db_name" {',
    '  description = "Name of the initial database to create."',
    '  type        = string',
    '  default     = "mydb"',
    '}',
    '',
    `variable "rds_engine" {`,
    `  description = "The database engine to use."`,
    `  type        = string`,
    `  default     = "${options.engine}"`,
    `}`,
    '',
    `variable "rds_engine_version" {`,
    `  description = "The version of the database engine."`,
    `  type        = string`,
    `  default     = "${options.engineVersion}"`,
    `}`,
    '',
    `variable "rds_instance_class" {`,
    `  description = "The instance type of the RDS instance."`,
    `  type        = string`,
    `  default     = "${options.instanceClass}"`,
    `}`,
    '',
    `variable "rds_allocated_storage" {`,
    `  description = "Allocated storage size in GB."`,
    `  type        = number`,
    `  default     = ${options.storage}`,
    `}`,
    '',
    `variable "backup_retention_period" {`,
    `  description = "Backup retention period in days."`,
    `  type        = number`,
    `  default     = ${options.backupRetention}`,
    `}`,
    '',
    `variable "multi_az" {`,
    `  description = "Enable Multi-AZ deployment for high availability."`,
    `  type        = bool`,
    `  default     = ${options.multiAz ? 'true' : 'false'}`,
    `}`
  ];

  return lines.join('\n');
}

// Generate `outputs.tf`
function generateOutputsTF(): string {
  const lines: string[] = [
    'output "rds_instance_id" {',
    '  description = "The ID of the RDS instance."',
    '  value       = aws_db_instance.db.id',
    '}',
    '',
    'output "rds_instance_endpoint" {',
    '  description = "The endpoint of the RDS instance."',
    '  value       = aws_db_instance.db.endpoint',
    '}',
    '',
    'output "rds_instance_arn" {',
    '  description = "The ARN of the RDS instance."',
    '  value       = aws_db_instance.db.arn',
    '}',
  ];

  return lines.join('\n');
}

// Generate `main.tf`
function generateMainTF(): string {
  const lines: string[] = [
    'resource "aws_db_instance" "db" {',
    '  identifier              = var.rds_identifier',
    '  engine                  = var.rds_engine',
    '  engine_version          = var.rds_engine_version',
    '  instance_class          = var.rds_instance_class',
    '  allocated_storage       = var.rds_allocated_storage',
    '  name                    = var.rds_db_name',
    '  username                = var.rds_username',
    '  password                = var.rds_password',
    '  backup_retention_period = var.backup_retention_period',
    '  multi_az                = var.multi_az',
    '',
    '  tags = {',
    '    Name = "example-rds"',
    '  }',
    '}'
  ];

  return lines.join('\n');
}

// Main function to generate Terraform files
function generateTerraformFiles() {
  writeFile('variables_rds_2.tf', generateVariablesTF());
  writeFile('outputs_rds_2.tf', generateOutputsTF());
  writeFile('main_rds_2.tf', generateMainTF());
  console.log('Terraform configuration files for RDS instance have been successfully generated.');
}

// Execute the script
generateTerraformFiles();

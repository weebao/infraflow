#!/usr/bin/env ts-node

/**
 * Terraform S3 Configuration Generator
 *
 * Generates Terraform configuration files for deploying an AWS S3 bucket.
 * Supports optional versioning, access control, and lifecycle policies.
 *
 * Usage:
 *   ts-node generateS3Terraform.ts [options]
 *
 * Options:
 *   --versioning           Enable versioning for the S3 bucket
 *   --acl <acl>            Set Access Control List (ACL) for the S3 bucket (default: private)
 *   --lifecycle            Include a lifecycle rule for the S3 bucket
 *   -o, --output <directory> Output directory for Terraform files (default: current directory)
 */

import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';

// Initialize Commander for CLI argument parsing
const program = new Command();

program
  .description('Generate Terraform configuration files for an AWS S3 bucket.')
  .option('--versioning', 'Enable versioning for the S3 bucket')
  .option('--acl <acl>', 'Set Access Control List (ACL) for the S3 bucket', 'private')
  .option('--lifecycle', 'Include a lifecycle rule for the S3 bucket')
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
    'variable "s3_bucket_name" {',
    '  description = "The name of the S3 bucket."',
    '  type        = string',
    '}',
    '',
    'variable "s3_acl" {',
    '  description = "The ACL for the S3 bucket."',
    '  type        = string',
    `  default     = "${options.acl}"`,
    '}',
  ];

  if (options.versioning) {
    lines.push(
      '',
      'variable "enable_versioning" {',
      '  description = "Enable versioning for the S3 bucket."',
      '  type        = bool',
      '  default     = true',
      '}'
    );
  }

  return lines.join('\n');
}

// Generate `outputs.tf`
function generateOutputsTF(): string {
  const lines: string[] = [
    'output "s3_bucket_id" {',
    '  description = "The ID of the S3 bucket."',
    '  value       = aws_s3_bucket.bucket.id',
    '}',
    '',
    'output "s3_bucket_arn" {',
    '  description = "The ARN of the S3 bucket."',
    '  value       = aws_s3_bucket.bucket.arn',
    '}',
  ];

  return lines.join('\n');
}

// Generate `main.tf`
function generateMainTF(): string {
  const lines: string[] = [
    'resource "aws_s3_bucket" "bucket" {',
    '  bucket = var.s3_bucket_name',
    '  acl    = var.s3_acl',
  ];

  if (options.versioning) {
    lines.push(
      '',
      '  versioning {',
      '    enabled = var.enable_versioning',
      '  }'
    );
  }

  if (options.lifecycle) {
    lines.push(
      '',
      '  lifecycle_rule {',
      '    id      = "log"',
      '    enabled = true',
      '',
      '    transition {',
      '      days          = 30',
      '      storage_class = "STANDARD_IA"',
      '    }',
      '',
      '    expiration {',
      '      days = 365',
      '    }',
      '',
      '    noncurrent_version_expiration {',
      '      days = 90',
      '    }',
      '  }'
    );
  }

  lines.push('}');

  return lines.join('\n');
}

// Main function to generate Terraform files
function generateTerraformFiles() {
writeFile('variables_s3_2.tf', generateVariablesTF());
writeFile('outputs_s3_2.tf', generateOutputsTF());
writeFile('main_s3_2.tf', generateMainTF());
  console.log('Terraform configuration files for S3 bucket have been successfully generated.');
}

// Execute the script
generateTerraformFiles();

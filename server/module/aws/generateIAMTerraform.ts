#!/usr/bin/env ts-node

/**
 * Terraform IAM Configuration Generator
 *
 * Generates Terraform configuration files for setting up IAM roles, policies, and users in AWS.
 * Supports options for creating roles, attaching policies, and creating users with access keys.
 *
 * Usage:
 *   ts-node generateIAMTerraform.ts [options]
 *
 * Options:
 *   --role <roleName>              IAM Role name to create
 *   --policy <policyName>           IAM Policy name to create
 *   --policy-json <policyFile>      JSON file containing the policy document
 *   --user <userName>               IAM User name to create
 *   --attach-policy-role <role>     Attach policy to role
 *   --attach-policy-user <user>     Attach policy to user
 *   -o, --output <directory>        Output directory for Terraform files (default: current directory)
 */

import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';

// Initialize Commander for CLI argument parsing
const program = new Command();

program
  .description('Generate Terraform configuration files for AWS IAM setup.')
  .option('--role <roleName>', 'IAM Role name to create')
  .option('--policy <policyName>', 'IAM Policy name to create')
  .option('--policy-json <policyFile>', 'JSON file containing the policy document')
  .option('--user <userName>', 'IAM User name to create')
  .option('--attach-policy-role <role>', 'Attach the created policy to a specified role')
  .option('--attach-policy-user <user>', 'Attach the created policy to a specified user')
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

// Generate `variables.tf` for IAM settings
function generateVariablesTF(): string {
  const lines: string[] = [];

  if (options.role) {
    lines.push(
      `variable "role_name" {`,
      `  description = "Name of the IAM role to create."`,
      `  type        = string`,
      `  default     = "${options.role}"`,
      `}`,
      ''
    );
  }

  if (options.policy) {
    lines.push(
      `variable "policy_name" {`,
      `  description = "Name of the IAM policy to create."`,
      `  type        = string`,
      `  default     = "${options.policy}"`,
      `}`,
      '',
      `variable "policy_document" {`,
      `  description = "IAM Policy document JSON for the policy."`,
      `  type        = string`,
      `  default     = file("${options.policyJson}")`, // Loads JSON policy from file
      `}`
    );
  }

  if (options.user) {
    lines.push(
      `variable "user_name" {`,
      `  description = "Name of the IAM user to create."`,
      `  type        = string`,
      `  default     = "${options.user}"`,
      `}`
    );
  }

  return lines.join('\n');
}

// Generate `outputs.tf`
function generateOutputsTF(): string {
  const lines: string[] = [];

  if (options.role) {
    lines.push(
      'output "role_arn" {',
      '  description = "The ARN of the IAM role."',
      '  value       = aws_iam_role.role.arn',
      '}',
      ''
    );
  }

  if (options.policy) {
    lines.push(
      'output "policy_arn" {',
      '  description = "The ARN of the IAM policy."',
      '  value       = aws_iam_policy.policy.arn',
      '}',
      ''
    );
  }

  if (options.user) {
    lines.push(
      'output "user_arn" {',
      '  description = "The ARN of the IAM user."',
      '  value       = aws_iam_user.user.arn',
      '}',
      ''
    );
  }

  return lines.join('\n');
}

// Generate `main.tf`
function generateMainTF(): string {
  const lines: string[] = [];

  if (options.role) {
    lines.push(
      'resource "aws_iam_role" "role" {',
      '  name               = var.role_name',
      '  assume_role_policy = <<EOF',
      '  {',
      '    "Version": "2012-10-17",',
      '    "Statement": [',
      '      {',
      '        "Action": "sts:AssumeRole",',
      '        "Principal": { "Service": "ec2.amazonaws.com" },',
      '        "Effect": "Allow"',
      '      }',
      '    ]',
      '  }',
      '  EOF',
      '}'
    );
  }

  if (options.policy) {
    lines.push(
      '',
      'resource "aws_iam_policy" "policy" {',
      '  name        = var.policy_name',
      '  policy      = var.policy_document',
      '}'
    );
  }

  if (options.user) {
    lines.push(
      '',
      'resource "aws_iam_user" "user" {',
      '  name = var.user_name',
      '}'
    );
  }

  if (options.attachPolicyRole && options.policy && options.role) {
    lines.push(
      '',
      'resource "aws_iam_role_policy_attachment" "role_policy_attachment" {',
      '  role       = aws_iam_role.role.name',
      '  policy_arn = aws_iam_policy.policy.arn',
      '',
      '  depends_on = [aws_iam_role.role, aws_iam_policy.policy]', // Ensure the role and policy are created first',
      '}'
    );
  }

  if (options.attachPolicyUser && options.policy && options.user) {
    lines.push(
      '',
      'resource "aws_iam_user_policy_attachment" "user_policy_attachment" {',
      '  user       = aws_iam_user.user.name',
      '  policy_arn = aws_iam_policy.policy.arn',
      '',
      '  depends_on = [aws_iam_user.user, aws_iam_policy.policy]', // Ensure the user and policy are created first',
      '}'
    );
  }

  return lines.join('\n');
}

// Main function to generate Terraform files
function generateTerraformFiles() {
  writeFile('variables_iam_1.tf', generateVariablesTF());
  writeFile('outputs_iam_1.tf', generateOutputsTF());
  writeFile('main_iam_1.tf', generateMainTF());
  console.log('Terraform configuration files for IAM setup have been successfully generated.');
}

// Execute the script
generateTerraformFiles();

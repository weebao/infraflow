#!/usr/bin/env ts-node

/**
 * Terraform DynamoDB Configuration Generator
 *
 * Generates Terraform configuration files for deploying an AWS DynamoDB table.
 * Supports options for table name, billing mode, key schema, attribute definitions,
 * global secondary indexes, stream settings, and lifecycle configurations.
 *
 * Usage:
 *   ts-node generateDynamoDBTerraform.ts [options]
 *
 * Options:
 *   --table-name <name>               Name of the DynamoDB table (required)
 *   --hash-key <attribute>            Name of the hash (partition) key (required)
 *   --hash-key-type <type>            Type of the hash key (S for String, N for Number, B for Binary) (required)
 *   --range-key <attribute>           Name of the range (sort) key (optional)
 *   --range-key-type <type>           Type of the range key (S, N, B) (required if --range-key is set)
 *   --billing-mode <mode>             Billing mode: PROVISIONED or PAY_PER_REQUEST (default: PAY_PER_REQUEST)
 *   --read-capacity <number>          Read capacity units (required if billing mode is PROVISIONED)
 *   --write-capacity <number>         Write capacity units (required if billing mode is PROVISIONED)
 *   --attribute <name:type>           Define an attribute (can be specified multiple times)
 *   --gsi <name:hash_key:type[:range_key:type]>  Define a Global Secondary Index (can be specified multiple times)
 *   --stream-enabled                  Enable DynamoDB streams
 *   --stream-view-type <type>         Stream view type: NEW_IMAGE, OLD_IMAGE, NEW_AND_OLD_IMAGES, KEYS_ONLY
 *   --lifecycle-prevent-destroy       Add lifecycle block to prevent destruction
 *   -o, --output <directory>          Output directory for Terraform files (default: current directory)
 */

import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';

// Initialize Commander for CLI argument parsing
const program = new Command();

program
  .description('Generate Terraform configuration files for an AWS DynamoDB table.')
  .requiredOption('--table-name <name>', 'Name of the DynamoDB table')
  .requiredOption('--hash-key <attribute>', 'Name of the hash (partition) key')
  .requiredOption('--hash-key-type <type>', 'Type of the hash key (S, N, B)')
  .option('--range-key <attribute>', 'Name of the range (sort) key')
  .option('--range-key-type <type>', 'Type of the range key (S, N, B)')
  .option('--billing-mode <mode>', 'Billing mode: PROVISIONED or PAY_PER_REQUEST', 'PAY_PER_REQUEST')
  .option('--read-capacity <number>', 'Read capacity units (required if billing mode is PROVISIONED)', parseInt)
  .option('--write-capacity <number>', 'Write capacity units (required if billing mode is PROVISIONED)', parseInt)
  .option('--attribute <name:type>', 'Define an attribute (can be specified multiple times)', collect, [])
  .option('--gsi <name:hash_key:type[:range_key:type]>', 'Define a Global Secondary Index (can be specified multiple times)', collect, [])
  .option('--stream-enabled', 'Enable DynamoDB streams')
  .option('--stream-view-type <type>', 'Stream view type: NEW_IMAGE, OLD_IMAGE, NEW_AND_OLD_IMAGES, KEYS_ONLY')
  .option('--lifecycle-prevent-destroy', 'Add lifecycle block to prevent destruction')
  .option('-o, --output <directory>', 'Output directory for Terraform files', '.');

program.parse(process.argv);

const options = program.opts();

// Validate required options based on billing mode
if (options.billingMode === 'PROVISIONED') {
  if (options.readCapacity === undefined || options.writeCapacity === undefined) {
    console.error('Error: --read-capacity and --write-capacity are required when billing mode is PROVISIONED.');
    process.exit(1);
  }
}

if (options.rangeKey && !options.rangeKeyType) {
  console.error('Error: --range-key-type is required when --range-key is specified.');
  process.exit(1);
}

if (options.streamViewType && !options.streamEnabled) {
  console.error('Error: --stream-enabled must be set when --stream-view-type is specified.');
  process.exit(1);
}

// Ensure output directory exists
const outputDir: string = options.output;
fs.mkdirSync(outputDir, { recursive: true });

// Helper function to collect multiple CLI options
function collect(value: string, previous: string[]) {
  return previous.concat([value]);
}

// Helper function to write files
function writeFile(fileName: string, content: string) {
  const filePath = path.join(outputDir, fileName);
  fs.writeFileSync(filePath, content.trim(), 'utf8');
  console.log(`Generated ${filePath}`);
}

// Generate `variables.tf`
function generateVariablesTF(): string {
  const lines: string[] = [
    `variable "table_name" {`,
    `  description = "Name of the DynamoDB table."`,
    `  type        = string`,
    `  default     = "${options.tableName}"`,
    `}`,
    '',
    `variable "hash_key" {`,
    `  description = "Name of the hash (partition) key."`,
    `  type        = string`,
    `  default     = "${options.hashKey}"`,
    `}`,
    '',
    `variable "hash_key_type" {`,
    `  description = "Type of the hash key (S, N, B)."`,
    `  type        = string`,
    `  default     = "${options.hashKeyType}"`,
    `}`
  ];

  if (options.rangeKey) {
    lines.push(
      '',
      `variable "range_key" {`,
      `  description = "Name of the range (sort) key."`,
      `  type        = string`,
      `  default     = "${options.rangeKey}"`,
      `}`,
      '',
      `variable "range_key_type" {`,
      `  description = "Type of the range key (S, N, B)."`,
      `  type        = string`,
      `  default     = "${options.rangeKeyType}"`,
      `}`
    );
  }

  lines.push(
    '',
    `variable "billing_mode" {`,
    `  description = "Billing mode for the DynamoDB table."`,
    `  type        = string`,
    `  default     = "${options.billingMode}"`,
    `}`
  );

  if (options.billingMode === 'PROVISIONED') {
    lines.push(
      '',
      `variable "read_capacity" {`,
      `  description = "Read capacity units."`,
      `  type        = number`,
      `  default     = ${options.readCapacity}`,
      `}`,
      '',
      `variable "write_capacity" {`,
      `  description = "Write capacity units."`,
      `  type        = number`,
      `  default     = ${options.writeCapacity}`,
      `}`
    );
  }

  // Attributes
  if (options.attribute.length > 0) {
    lines.push(
      '',
      `variable "attributes" {`,
      `  description = "List of attribute definitions."`,
      `  type        = list(object({`,
      `    name = string`,
      `    type = string`,
      `  }))`,
      `  default     = [`
    );

    options.attribute.forEach((attr: string) => {
      const [name, type] = attr.split(':');
      lines.push(`    { name = "${name}", type = "${type}" },`);
    });

    lines.push(`  ]`,
      `}`
    );
  }

  // Global Secondary Indexes
  if (options.gsi.length > 0) {
    lines.push(
      '',
      `variable "global_secondary_indexes" {`,
      `  description = "List of Global Secondary Indexes."`,
      `  type        = list(object({`,
      `    name            = string`,
      `    hash_key        = string`,
      `    hash_key_type   = string`,
      `    range_key       = optional(string)`,
      `    range_key_type  = optional(string)`,
      `    read_capacity   = optional(number)`,
      `    write_capacity  = optional(number)`,
      `  }))`,
      `  default     = [`
    );

    options.gsi.forEach((gsi: string) => {
      const parts = gsi.split(':');
      const name = parts[0];
      const hashKey = parts[1];
      const hashKeyType = parts[2];
      let rangeKey = '';
      let rangeKeyType = '';
      let readCapacity = '';
      let writeCapacity = '';

      if (parts.length > 3) {
        rangeKey = parts[3];
        rangeKeyType = parts[4] || '';
      }
      // For simplicity, assume provisioned billing mode for GSIs if billing mode is PROVISIONED
      if (options.billingMode === 'PROVISIONED') {
        readCapacity = parts[5] || '5';
        writeCapacity = parts[6] || '5';
      }

      let gsiLine = `    { name = "${name}", hash_key = "${hashKey}", hash_key_type = "${hashKeyType}"`;

      if (rangeKey && rangeKeyType) {
        gsiLine += `, range_key = "${rangeKey}", range_key_type = "${rangeKeyType}"`;
      }

      if (options.billingMode === 'PROVISIONED') {
        gsiLine += `, read_capacity = ${readCapacity}, write_capacity = ${writeCapacity}`;
      }

      gsiLine += ' },';
      lines.push(gsiLine);
    });

    lines.push(`  ]`,
      `}`
    );
  }

  // Stream settings
  if (options.streamEnabled) {
    lines.push(
      '',
      `variable "stream_enabled" {`,
      `  description = "Enable DynamoDB streams."`,
      `  type        = bool`,
      `  default     = true`,
      `}`,
      '',
      `variable "stream_view_type" {`,
      `  description = "Stream view type."`,
      `  type        = string`,
      `  default     = "${options.streamViewType || 'NEW_IMAGE'}"`,
      `}`
    );
  }

  // Lifecycle Prevent Destroy
  if (options.lifecyclePreventDestroy) {
    lines.push(
      '',
      `variable "prevent_destroy" {`,
      `  description = "Prevent destruction of the DynamoDB table."`,
      `  type        = bool`,
      `  default     = true`,
      `}`
    );
  }

  return lines.join('\n');
}

// Generate `outputs.tf`
function generateOutputsTF(): string {
  const lines: string[] = [
    `output "dynamodb_table_name" {`,
    `  description = "The name of the DynamoDB table."`,
    `  value       = aws_dynamodb_table.table.name`,
    `}`,
    '',
    `output "dynamodb_table_arn" {`,
    `  description = "The ARN of the DynamoDB table."`,
    `  value       = aws_dynamodb_table.table.arn`,
    `}`,
    ''
  ];

  return lines.join('\n');
}

// Generate `main.tf`
function generateMainTF(): string {
  const lines: string[] = [
    `resource "aws_dynamodb_table" "table" {`,
    `  name           = var.table_name`,
    `  billing_mode   = var.billing_mode`,
    `  hash_key       = var.hash_key`,
  ];

  if (options.rangeKey) {
    lines.push(`  range_key      = var.range_key`);
  }

  // Attribute Definitions
  if (options.attribute.length > 0) {
    lines.push(
      `  attribute {`
    );

    options.attribute.forEach((attr: string) => {
      const [name, type] = attr.split(':');
      lines.push(`    name = "${name}"`);
      lines.push(`    type = "${type}"`);
    });

    lines.push(`  }`);
  }

  // Provisioned Throughput
  if (options.billingMode === 'PROVISIONED') {
    lines.push(
      `  read_capacity  = var.read_capacity`,
      `  write_capacity = var.write_capacity`
    );
  }

  // Global Secondary Indexes
  if (options.gsi.length > 0) {
    lines.push(``);

    options.gsi.forEach((gsi: string) => {
      const parts = gsi.split(':');
      const name = parts[0];
      const hashKey = parts[1];
      const hashKeyType = parts[2];
      let rangeKey = '';
      let rangeKeyType = '';
      let readCapacity = '';
      let writeCapacity = '';

      if (parts.length > 3) {
        rangeKey = parts[3];
        rangeKeyType = parts[4] || '';
      }

      if (options.billingMode === 'PROVISIONED') {
        readCapacity = parts[5] || '5';
        writeCapacity = parts[6] || '5';
      }

      lines.push(`  global_secondary_index {`);
      lines.push(`    name               = "${name}"`);
      lines.push(`    hash_key           = "${hashKey}"`);
      lines.push(`    hash_key_type      = "${hashKeyType}"`);

      if (rangeKey && rangeKeyType) {
        lines.push(`    range_key          = "${rangeKey}"`);
        lines.push(`    range_key_type     = "${rangeKeyType}"`);
      }

      lines.push(`    projection_type    = "ALL"`);

      if (options.billingMode === 'PROVISIONED') {
        lines.push(`    read_capacity      = ${readCapacity}`);
        lines.push(`    write_capacity     = ${writeCapacity}`);
      }

      lines.push(`  }`);
      lines.push(``);
    });
  }

  // Stream Settings
  if (options.streamEnabled) {
    lines.push(
      `  stream_enabled   = var.stream_enabled`,
      `  stream_view_type = var.stream_view_type`
    );
  }

  // Lifecycle Block
  if (options.lifecyclePreventDestroy) {
    lines.push(
      '',
      `  lifecycle {`,
      `    prevent_destroy = var.prevent_destroy`,
      `  }`
    );
  }

  lines.push(`}`);

  // Global Secondary Index Attachments (if any)
  // Not needed as GSIs are defined inline

  return lines.join('\n');
}

// Main function to generate Terraform files
function generateTerraformFiles() {
  writeFile('variables_dynamo_2.tf', generateVariablesTF());
  writeFile('main_dynamo_2.tf', generateMainTF());
  writeFile('outputs_dynamo_2.tf', generateOutputsTF());
  console.log('Terraform configuration files for DynamoDB table have been successfully generated.');
}

// Execute the script
generateTerraformFiles();

#!/usr/bin/env ts-node

/**
 * Terraform Route53 Configuration Generator
 *
 * Generates Terraform configuration files for setting up AWS Route 53 hosted zones and DNS records.
 * Supports options for creating public/private hosted zones, defining DNS records (A, CNAME, MX, etc.),
 * and managing lifecycle configurations.
 *
 * Usage:
 *   ts-node generateRoute53Terraform.ts [options]
 *
 * Options:
 *   --hosted-zone <name>                  Name of the hosted zone (required)
 *   --hosted-zone-type <type>             Type of the hosted zone: PUBLIC or PRIVATE (default: PUBLIC)
 *   --vpc-id <vpcId>                      VPC ID for private hosted zones (required if hosted zone type is PRIVATE)
 *   --record <recordType:name:value:ttl>   Define a DNS record (can be specified multiple times)
 *   --prevent-destroy                     Add lifecycle block to prevent destruction
 *   -o, --output <directory>              Output directory for Terraform files (default: current directory)
 */

import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';

// Initialize Commander for CLI argument parsing
const program = new Command();

program
  .description('Generate Terraform configuration files for AWS Route 53 hosted zones and DNS records.')
  .requiredOption('--hosted-zone <name>', 'Name of the hosted zone')
  .option('--hosted-zone-type <type>', 'Type of the hosted zone: PUBLIC or PRIVATE', 'PUBLIC')
  .option('--vpc-id <vpcId>', 'VPC ID for private hosted zones')
  .option('--record <recordType:name:value:ttl>', 'Define a DNS record (can be specified multiple times)', collect, [])
  .option('--prevent-destroy', 'Add lifecycle block to prevent destruction')
  .option('-o, --output <directory>', 'Output directory for Terraform files', '.');

program.parse(process.argv);

const options = program.opts();

// Validate options
if (options.hostedZoneType.toUpperCase() === 'PRIVATE' && !options.vpcId) {
  console.error('Error: --vpc-id is required when hosted zone type is PRIVATE.');
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

// Parse DNS records
interface DNSRecord {
  type: string;
  name: string;
  value: string;
  ttl: number;
}

function parseDNSRecords(records: string[]): DNSRecord[] {
  return records.map(record => {
    const parts = record.split(':');
    if (parts.length < 4) {
      console.error(`Error: Invalid record format "${record}". Expected format: type:name:value:ttl`);
      process.exit(1);
    }
    const [type, name, value, ttlStr] = parts;
    const ttl = parseInt(ttlStr, 10);
    if (isNaN(ttl)) {
      console.error(`Error: Invalid TTL value "${ttlStr}" in record "${record}".`);
      process.exit(1);
    }
    return {
      type: type.toUpperCase(),
      name,
      value,
      ttl,
    };
  });
}

const dnsRecords: DNSRecord[] = parseDNSRecords(options.record);

// Generate `variables.tf`
function generateVariablesTF(): string {
  const lines: string[] = [
    `variable "hosted_zone_name" {`,
    `  description = "Name of the Route53 hosted zone."`,
    `  type        = string`,
    `  default     = "${options.hostedZone}"`,
    `}`,
    '',
    `variable "hosted_zone_type" {`,
    `  description = "Type of the hosted zone: PUBLIC or PRIVATE."`,
    `  type        = string`,
    `  default     = "${options.hostedZoneType.toUpperCase()}"`,
    `}`,
  ];

  if (options.hostedZoneType.toUpperCase() === 'PRIVATE') {
    lines.push(
      '',
      `variable "vpc_id" {`,
      `  description = "VPC ID for the private hosted zone."`,
      `  type        = string`,
      `  default     = "${options.vpcId}"`,
      `}`
    );
  }

  if (dnsRecords.length > 0) {
    lines.push(
      '',
      `variable "dns_records" {`,
      `  description = "List of DNS records to create."`,
      `  type = list(object({`,
      `    type  = string`,
      `    name  = string`,
      `    value = string`,
      `    ttl   = number`,
      `  }))`,
      `  default = [`
    );

    dnsRecords.forEach(record => {
      lines.push(
        `    {`,
        `      type  = "${record.type}"`,
        `      name  = "${record.name}"`,
        `      value = "${record.value}"`,
        `      ttl   = ${record.ttl}`,
        `    },`
      );
    });

    lines.push(`  ]`, `}`);
  }

  // Lifecycle Prevent Destroy
  if (options.preventDestroy) {
    lines.push(
      '',
      `variable "prevent_destroy" {`,
      `  description = "Prevent destruction of the hosted zone."`,
      `  type        = bool`,
      `  default     = true`,
      `}`
    );
  }

  return lines.join('\n');
}

// Generate `main.tf`
function generateMainTF(): string {
  const lines: string[] = [];

  // Hosted Zone
  lines.push(
    '',
    `resource "aws_route53_zone" "hosted_zone" {`,
    `  name = var.hosted_zone_name`,
    `  type = var.hosted_zone_type`,
  );

  if (options.hostedZoneType.toUpperCase() === 'PRIVATE') {
    lines.push(`  vpc {`, `    vpc_id = var.vpc_id`, `  }`);
  }

  if (options.preventDestroy) {
    lines.push(
      '',
      `  lifecycle {`,
      `    prevent_destroy = var.prevent_destroy`,
      `  }`
    );
  }

  lines.push(`}`);

  // DNS Records
  if (dnsRecords.length > 0) {
    dnsRecords.forEach((record, index) => {
      const resourceName = `record_${index + 1}`;
      lines.push(
        '',
        `resource "aws_route53_record" "${resourceName}" {`,
        `  zone_id = aws_route53_zone.hosted_zone.zone_id`,
        `  name    = var.dns_records[${index}].name`,
        `  type    = var.dns_records[${index}].type`,
        `  ttl     = var.dns_records[${index}].ttl`,
        `  records = [var.dns_records[${index}].value]`,
        `  depends_on = [aws_route53_zone.hosted_zone]`,
        `}`
      );
    });
  }

  return lines.join('\n');
}

// Generate `outputs.tf`
function generateOutputsTF(): string {
  const lines: string[] = [
    `output "hosted_zone_id" {`,
    `  description = "The ID of the Route53 hosted zone."`,
    `  value       = aws_route53_zone.hosted_zone.zone_id`,
    `}`,
    '',
    `output "hosted_zone_name_servers" {`,
    `  description = "The name servers for the hosted zone."`,
    `  value       = aws_route53_zone.hosted_zone.name_servers`,
    `}`,
  ];

  if (dnsRecords.length > 0) {
    lines.push(
      '',
      `output "dns_record_ids" {`,
      `  description = "The IDs of the DNS records."`,
      `  value       = [${dnsRecords.map((_, index) => `aws_route53_record.record_${index + 1}.id`).join(', ')}]`,
      `}`
    );
  }

  return lines.join('\n');
}

// Main function to generate Terraform files
function generateTerraformFiles() {
  writeFile('variables_route53_3.tf', generateVariablesTF());
  writeFile('main_route53_3.tf', generateMainTF());
  writeFile('outputs_route53_3.tf', generateOutputsTF());
  console.log('Terraform configuration files for Route53 have been successfully generated.');
}

// Execute the script
generateTerraformFiles();

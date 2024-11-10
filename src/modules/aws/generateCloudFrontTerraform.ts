#!/usr/bin/env ts-node

/**
 * Terraform CloudFront Configuration Generator
 *
 * Generates Terraform configuration files for deploying an AWS CloudFront distribution.
 * Supports options for origin settings, SSL configurations, logging, price class, and more.
 *
 * Usage:
 *   ts-node generateCloudFrontTerraform.ts [options]
 *
 * Options:
 *   --distribution-name <name>          Name of the CloudFront distribution (required)
 *   --origin-domain-name <domain>       Origin domain name (e.g., S3 bucket, ALB) (required)
 *   --origin-id <id>                    Origin identifier (required)
 *   --default-root-object <object>      Default root object (default: index.html)
 *   --enabled                           Enable the CloudFront distribution (default: true)
 *   --comment <text>                    Comment for the distribution
 *   --price-class <priceClass>          Price class (PriceClass_100, PriceClass_200, PriceClass_All) (default: PriceClass_All)
 *   --viewer-protocol-policy <policy>    Viewer protocol policy (allow-all, redirect-to-https, https-only) (default: redirect-to-https)
 *   --ssl-certificate-arn <arn>         SSL certificate ARN for HTTPS (required if viewer protocol policy is redirect-to-https or https-only)
 *   --minimum-tls-version <version>      Minimum TLS version (TLSv1.2_2019, TLSv1.2_2021) (default: TLSv1.2_2019)
 *   --logging-enabled                   Enable access logging
 *   --logging-s3-bucket <bucket>        S3 bucket for CloudFront access logs (required if logging enabled)
 *   --logging-prefix <prefix>            S3 prefix for CloudFront access logs (default: cloudfront-logs/)
 *   --geo-restriction <type>             Geo restriction type (none, blacklist, whitelist) (default: none)
 *   --geo-restriction-ids <ids>          Comma-separated list of country codes for geo restriction
 *   --prevent-destroy                    Add lifecycle block to prevent destruction
 *   -o, --output <directory>            Output directory for Terraform files (default: current directory)
 */

import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';

// Initialize Commander for CLI argument parsing
const program = new Command();

program
  .description('Generate Terraform configuration files for AWS CloudFront distribution.')
  .requiredOption('--distribution-name <name>', 'Name of the CloudFront distribution')
  .requiredOption('--origin-domain-name <domain>', 'Origin domain name (e.g., S3 bucket, ALB)')
  .requiredOption('--origin-id <id>', 'Origin identifier')
  .option('--default-root-object <object>', 'Default root object', 'index.html')
  .option('--enabled', 'Enable the CloudFront distribution', true)
  .option('--comment <text>', 'Comment for the distribution')
  .option('--price-class <priceClass>', 'Price class (PriceClass_100, PriceClass_200, PriceClass_All)', 'PriceClass_All')
  .option('--viewer-protocol-policy <policy>', 'Viewer protocol policy (allow-all, redirect-to-https, https-only)', 'redirect-to-https')
  .option('--ssl-certificate-arn <arn>', 'SSL certificate ARN for HTTPS')
  .option('--minimum-tls-version <version>', 'Minimum TLS version (TLSv1.2_2019, TLSv1.2_2021)', 'TLSv1.2_2019')
  .option('--logging-enabled', 'Enable access logging')
  .option('--logging-s3-bucket <bucket>', 'S3 bucket for CloudFront access logs')
  .option('--logging-prefix <prefix>', 'S3 prefix for CloudFront access logs', 'cloudfront-logs/')
  .option('--geo-restriction <type>', 'Geo restriction type (none, blacklist, whitelist)', 'none')
  .option('--geo-restriction-ids <ids>', 'Comma-separated list of country codes for geo restriction')
  .option('--prevent-destroy', 'Add lifecycle block to prevent destruction')
  .option('-o, --output <directory>', 'Output directory for Terraform files', '.');

program.parse(process.argv);

const options = program.opts();

// Validate required options based on other options
if (
  (options.viewerProtocolPolicy === 'redirect-to-https' ||
    options.viewerProtocolPolicy === 'https-only') &&
  !options.sslCertificateArn
) {
  console.error('Error: --ssl-certificate-arn is required when viewer protocol policy is redirect-to-https or https-only.');
  process.exit(1);
}

if (options.loggingEnabled && !options.loggingS3Bucket) {
  console.error('Error: --logging-s3-bucket is required when logging is enabled.');
  process.exit(1);
}

if (
  (options.geoRestriction === 'blacklist' || options.geoRestriction === 'whitelist') &&
  !options.geoRestrictionIds
) {
  console.error('Error: --geo-restriction-ids is required when geo restriction type is blacklist or whitelist.');
  process.exit(1);
}

// Parse geo restriction IDs into a list
let geoRestrictionIds: string[] = [];
if (options.geoRestrictionIds) {
  geoRestrictionIds = options.geoRestrictionIds.split(',').map((id: string) => id.trim().toUpperCase());
}

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
    `variable "distribution_name" {`,
    `  description = "Name of the CloudFront distribution."`,
    `  type        = string`,
    `  default     = "${options.distributionName}"`,
    `}`,
    '',
    `variable "origin_domain_name" {`,
    `  description = "Origin domain name (e.g., S3 bucket, ALB)."`,
    `  type        = string`,
    `  default     = "${options.originDomainName}"`,
    `}`,
    '',
    `variable "origin_id" {`,
    `  description = "Origin identifier."`,
    `  type        = string`,
    `  default     = "${options.originId}"`,
    `}`,
    '',
    `variable "default_root_object" {`,
    `  description = "Default root object."`,
    `  type        = string`,
    `  default     = "${options.defaultRootObject}"`,
    `}`,
    '',
    `variable "enabled" {`,
    `  description = "Enable the CloudFront distribution."`,
    `  type        = bool`,
    `  default     = ${options.enabled}`,
    `}`,
    '',
    `variable "comment" {`,
    `  description = "Comment for the distribution."`,
    `  type        = string`,
    `  default     = "${options.comment || ''}"`,
    `}`,
    '',
    `variable "price_class" {`,
    `  description = "Price class for the distribution."`,
    `  type        = string`,
    `  default     = "${options.priceClass}"`,
    `}`,
    '',
    `variable "viewer_protocol_policy" {`,
    `  description = "Viewer protocol policy."`,
    `  type        = string`,
    `  default     = "${options.viewerProtocolPolicy}"`,
    `}`,
  ];

  if (options.sslCertificateArn) {
    lines.push(
      '',
      `variable "ssl_certificate_arn" {`,
      `  description = "SSL certificate ARN for HTTPS."`,
      `  type        = string`,
      `  default     = "${options.sslCertificateArn}"`,
      `}`
    );
  }

  lines.push(
    '',
    `variable "minimum_tls_version" {`,
    `  description = "Minimum TLS version."`,
    `  type        = string`,
    `  default     = "${options.minimumTlsVersion}"`,
    `}`
  );

  if (options.loggingEnabled) {
    lines.push(
      '',
      `variable "logging_enabled" {`,
      `  description = "Enable access logging."`,
      `  type        = bool`,
      `  default     = true`,
      `}`,
      '',
      `variable "logging_s3_bucket" {`,
      `  description = "S3 bucket for CloudFront access logs."`,
      `  type        = string`,
      `  default     = "${options.loggingS3Bucket}"`,
      `}`,
      '',
      `variable "logging_prefix" {`,
      `  description = "S3 prefix for CloudFront access logs."`,
      `  type        = string`,
      `  default     = "${options.loggingPrefix}"`,
      `}`
    );
  } else {
    lines.push(
      '',
      `variable "logging_enabled" {`,
      `  description = "Enable access logging."`,
      `  type        = bool`,
      `  default     = false`,
      `}`
    );
  }

  lines.push(
    '',
    `variable "geo_restriction" {`,
    `  description = "Geo restriction type (none, blacklist, whitelist)."`,
    `  type        = string`,
    `  default     = "${options.geoRestriction}"`,
    `}`
  );

  if (geoRestrictionIds.length > 0) {
    lines.push(
      '',
      `variable "geo_restriction_ids" {`,
      `  description = "List of country codes for geo restriction."`,
      `  type        = list(string)`,
      `  default     = [${geoRestrictionIds.map(id => `"${id}"`).join(', ')}]`,
      `}`
    );
  }

  if (options.preventDestroy) {
    lines.push(
      '',
      `variable "prevent_destroy" {`,
      `  description = "Prevent destruction of the CloudFront distribution."`,
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

  lines.push(
    '',
    `resource "aws_cloudfront_distribution" "distribution" {`,
    `  origin {`,
    `    domain_name = var.origin_domain_name`,
    `    origin_id   = var.origin_id`,
    '',
    `    # S3 Origin Configuration (Uncomment if origin is S3)`,
    `    # s3_origin_config {`,
    `    #   origin_access_identity = "origin-access-identity/cloudfront/EXAMPLE"`,
    `    # }`,
    '',
    `    # Custom Origin Configuration (Uncomment if origin is custom)`,
    `    # custom_origin_config {`,
    `    #   http_port              = 80`,
    `    #   https_port             = 443`,
    `    #   origin_protocol_policy = "https-only"`,
    `    #   origin_ssl_protocols   = ["TLSv1.2"]`,
    `    # }`,
    `  }`,
    '',
    `  enabled             = var.enabled`,
    `  is_ipv6_enabled     = true`,
    `  comment             = var.comment`,
    `  default_root_object = var.default_root_object`,
    '',
    `  aliases = []`,
    '',
    `  default_cache_behavior {`,
    `    target_origin_id       = var.origin_id`,
    `    viewer_protocol_policy = var.viewer_protocol_policy`,
    '',
    `    allowed_methods = ["GET", "HEAD", "OPTIONS"],`,
    `    cached_methods  = ["GET", "HEAD"],`,
    '',
    `    forwarded_values {`,
    `      query_string = false`,
    `      cookies {`,
    `        forward = "none"`,
    `      }`,
    `    }`,
    '',
    `    # Minimum TTL for cached objects`,
    `    min_ttl                = 0`,
    `    default_ttl            = 3600`,
    `    max_ttl                = 86400`,
    `  }`,
    '',
    `  price_class = var.price_class`,
    '',
    `  viewer_certificate {`,
    `    cloudfront_default_certificate = false`,
    `    acm_certificate_arn            = var.ssl_certificate_arn`,
    `    ssl_support_method             = "sni-only"`,
    `    minimum_protocol_version       = var.minimum_tls_version`,
    `  }`,
    '',
    `  restrictions {`,
    `    geo_restriction {`,
    `      restriction_type = var.geo_restriction`,
  );

  if (geoRestrictionIds.length > 0) {
    lines.push(`      locations        = var.geo_restriction_ids`);
  }

  lines.push(`    }`, `  }`);

  // Logging
  if (options.loggingEnabled) {
    lines.push(
      '',
      `  logging_config {`,
      `    include_cookies = false`,
      `    bucket          = var.logging_s3_bucket`,
      `    prefix          = var.logging_prefix`,
      `  }`
    );
  }

  // Lifecycle Block
  if (options.preventDestroy) {
    lines.push(
      '',
      `  lifecycle {`,
      `    prevent_destroy = var.prevent_destroy`,
      `  }`
    );
  }

  lines.push(`}`);

  return lines.join('\n');
}

// Generate `outputs.tf`
function generateOutputsTF(): string {
  const lines: string[] = [
    `output "cloudfront_distribution_id" {`,
    `  description = "The ID of the CloudFront distribution."`,
    `  value       = aws_cloudfront_distribution.distribution.id`,
    `}`,
    '',
    `output "cloudfront_distribution_domain_name" {`,
    `  description = "The domain name corresponding to the CloudFront distribution."`,
    `  value       = aws_cloudfront_distribution.distribution.domain_name`,
    `}`,
    '',
    `output "cloudfront_distribution_arn" {`,
    `  description = "The ARN of the CloudFront distribution."`,
    `  value       = aws_cloudfront_distribution.distribution.arn`,
    `}`
  ];

  return lines.join('\n');
}

// Main function to generate Terraform files
function generateTerraformFiles() {
  writeFile('variables_cloudfront_3.tf', generateVariablesTF());
  writeFile('main_cloudfront_3.tf', generateMainTF());
  writeFile('outputs_cloudfront_3.tf', generateOutputsTF());
  console.log('Terraform configuration files for CloudFront distribution have been successfully generated.');
}

// Execute the script
generateTerraformFiles();

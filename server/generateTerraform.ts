#!/usr/bin/env ts-node

import { promises as fs } from 'fs';
import * as path from 'path';
import { Command } from 'commander';

interface ProviderConfig {
  name: string;
  source: string;
  version: string;
  configuration: string;
  variables: string;
}

const providerConfigs: Record<string, ProviderConfig> = {
  aws: {
    name: 'aws',
    source: 'hashicorp/aws',
    version: '~> 4.0',
    configuration: `
      provider "aws" {
        region = var.aws_region
      }`.trim(),
    variables: `
      variable "aws_region" {
        description = "AWS region"
        type        = string
        default     = "us-west-2"
      }

      variable "aws_profile" {
        description = "AWS profile"
        type        = string
        default     = "default"
      }`.trim(),
  },
  gcp: {
    name: 'google',
    source: 'hashicorp/google',
    version: '~> 5.0',
    configuration: `
      provider "google" {
        project = var.gcp_project
        region  = var.gcp_region
      }`.trim(),
    variables: `
      variable "gcp_project" {
        description = "GCP project ID"
        type        = string
        default     = "my-gcp-project"
      }

      variable "gcp_region" {
        description = "GCP region"
        type        = string
        default     = "us-central1"
      }`.trim(),
  },
  azure: {
    name: 'azurerm',
    source: 'hashicorp/azurerm',
    version: '~> 3.0',
    configuration: `
      provider "azurerm" {
        features {}
      }`.trim(),
    variables: `
      variable "azure_location" {
        description = "Azure location"
        type        = string
        default     = "East US"
      }`.trim(),
  },
};

function generateVersionsTF(providers: ProviderConfig[]): string {
  const requiredProviders = providers
    .map(
      (p) => `
  ${p.name} = {
    source  = "${p.source}"
    version = "${p.version}"
  }`.trim()
    )
    .join('\n');

  return `
terraform {
  required_version = ">= 1.3.0"
  required_providers {
${requiredProviders}
  }
}`.trim();
}

function generateProviderTF(providers: ProviderConfig[]): string {
  return providers.map((p) => p.configuration).join('\n\n');
}

function generateVariablesTF(providers: ProviderConfig[]): string {
  const variables = providers
    .map((p) => p.variables)
    .filter(Boolean)
    .join('\n\n');
  return variables.trim();
}

async function main() {
  const program = new Command();

  program
    .version('1.1.0')
    .description('Generate Terraform configuration files.')
    .requiredOption(
      '-p, --providers <providers...>',
      'Providers to include (aws, gcp, azure)'
    )
    .option('-o, --output <directory>', 'Output directory', '.')
    .parse(process.argv);

  const options = program.opts();
  const selectedProviders = options.providers.map((p: string) =>
    p.toLowerCase()
  );
  const outputDir = options.output;

  const validProviders = Object.keys(providerConfigs);
  const invalidProviders = selectedProviders.filter(
    (p: string) => !validProviders.includes(p)
  );

  if (invalidProviders.length > 0) {
    console.error(
      `Invalid providers: ${invalidProviders.join(', ')}`
    );
    console.error(
      `Valid providers are: ${validProviders.join(', ')}`
    );
    process.exit(1);
  }

  const selectedProviderConfigs = selectedProviders.map(
    (p: string) => providerConfigs[p]
  );

  try {
    await fs.mkdir(outputDir, { recursive: true });

    const versionsTFContent = generateVersionsTF(
      selectedProviderConfigs
    );
    await fs.writeFile(
      path.join(outputDir, 'versions.tf'),
      versionsTFContent
    );
    console.log('Generated versions.tf');

    const providerTFContent = generateProviderTF(
      selectedProviderConfigs
    );
    await fs.writeFile(
      path.join(outputDir, 'provider.tf'),
      providerTFContent
    );
    console.log('Generated provider.tf');

    const variablesTFContent = generateVariablesTF(
      selectedProviderConfigs
    );
    if (variablesTFContent) {
      await fs.writeFile(
        path.join(outputDir, 'variables.tf'),
        variablesTFContent
      );
      console.log('Generated variables.tf');
    }

    // Additional file generation can be added here
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();

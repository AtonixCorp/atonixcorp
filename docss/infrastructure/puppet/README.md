# AtonixCorp - Puppet Configuration Management

## Overview
This directory contains Puppet manifests and modules for managing the AtonixCorp platform infrastructure.

## Directory Structure
```
puppet/
├── manifests/           # Main Puppet manifests
├── modules/            # Custom Puppet modules
├── hieradata/          # Hiera configuration data
├── environments/       # Environment-specific configs
└── scripts/           # Helper scripts
```

## Modules
- `atonixcorp::platform` - Main platform deployment
- `atonixcorp::security` - Security configuration
- `atonixcorp::monitoring` - Monitoring setup
- `atonixcorp::networking` - Network configuration

## Usage
```bash
# Apply main site manifest
puppet apply manifests/site.pp

# Test configuration
puppet parser validate manifests/site.pp

# Dry run
puppet apply --noop manifests/site.pp
```
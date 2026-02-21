# Hardware Integration Deployment Guide

This guide covers deploying the AtonixCorp hardware integration to various environments.

## Deployment Overview

The hardware integration supports multiple deployment scenarios:

- **Development:** Local development with simulators
- **Staging:** Pre-production testing with real hardware
- **Production:** Full production deployment
- **Edge:** Resource-constrained edge devices
- **Cloud:** Cloud-based hardware security services

## Prerequisites

### System Requirements

#### Minimum Requirements
- CPU: x86-64 or ARM64
- RAM: 4GB
- Storage: 20GB
- Network: 100Mbps

#### Recommended Requirements
- CPU: Multi-core x86-64 with hardware security extensions
- RAM: 8GB+
- Storage: 50GB SSD
- Network: 1Gbps

### Software Dependencies

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
    docker.io \
    docker-compose \
    git \
    git-lfs \
    python3 \
    python3-pip \
    build-essential \
    cmake \
    ninja-build

# Install Git LFS
git lfs install
```

### Hardware Security Requirements

#### TPM 2.0
- Discrete TPM 2.0 module or fTPM
- TPM 2.0 compliant firmware

#### Intel SGX
- 6th generation Intel Core or Xeon processor
- SGX-enabled BIOS
- SGX PSW/SDK installed

#### AMD SEV
- AMD EPYC or Ryzen processor with SEV support
- SEV-enabled BIOS and kernel

#### OP-TEE
- ARM TrustZone capable processor
- OP-TEE compatible firmware

## Development Deployment

### Local Development Setup

```bash
# Clone repository
git clone https://github.com/AtonixCorp/atonixcorp.git
cd atonixcorp/atonix-hardware-integration

# Pull large files
git lfs pull

# Start development environment
docker-compose -f docker/docker-compose.yml up -d

# Run tests
docker-compose -f docker/docker-compose.yml exec hardware-ci \
    bash -c "cd tests/hardware-security && ./run-hardware-tests.sh"
```

### Development Configuration

```yaml
# docker/.env
COMPOSE_PROJECT_NAME=atonix-hardware-dev
USE_SIMULATORS=true
ENABLE_DEBUG=true
LOG_LEVEL=DEBUG

# Hardware configuration
TPM_DEVICE=/dev/tpm0
SGX_DEBUG=true
SEV_POLICY=0x01
OPTEE_DEVICE=/dev/tee0
```

## Staging Deployment

### Staging Environment Setup

```bash
# Create staging directory
mkdir -p /opt/atonix/staging/hardware-integration
cd /opt/atonix/staging/hardware-integration

# Clone repository
git clone https://github.com/AtonixCorp/atonixcorp.git .
git checkout staging
git lfs pull

# Configure environment
cp docker/.env.staging docker/.env
nano docker/.env
```

### Staging Configuration

```yaml
# docker/.env.staging
COMPOSE_PROJECT_NAME=atonix-hardware-staging
USE_SIMULATORS=false
ENABLE_DEBUG=true
LOG_LEVEL=INFO

# Hardware configuration
TPM_DEVICE=/dev/tpm0
SGX_DEBUG=false
SEV_POLICY=0x03  # Enable SEV-ES
OPTEE_DEVICE=/dev/tee0

# Monitoring
ENABLE_MONITORING=true
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000

# Security
ENABLE_AUDIT=true
AUDIT_LOG_PATH=/var/log/atonix/hardware-audit.log
```

### Deploy to Staging

```bash
# Build and deploy
docker-compose -f docker/docker-compose.yml build
docker-compose -f docker/docker-compose.yml up -d

# Run integration tests
docker-compose -f docker/docker-compose.yml exec hardware-ci \
    bash -c "cd tests/hardware-security && ./run-integration-tests.sh"

# Check health
curl http://localhost:8080/health
```

## Production Deployment

### Production Server Setup

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install dependencies
sudo apt-get install -y \
    docker.io \
    docker-compose \
    git \
    git-lfs \
    python3 \
    python3-pip \
    fail2ban \
    ufw \
    auditd \
    rsyslog

# Configure firewall
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Configure audit logging
sudo systemctl enable auditd
sudo systemctl start auditd

# Create deployment user
sudo useradd -m -s /bin/bash atonix
sudo usermod -aG docker atonix
sudo mkdir -p /opt/atonix/production
sudo chown atonix:atonix /opt/atonix/production
```

### Production Deployment

```bash
# Switch to deployment user
sudo -u atonix bash

# Deploy application
cd /opt/atonix/production
git clone https://github.com/AtonixCorp/atonixcorp.git .
git checkout production
git lfs pull

# Configure production environment
cp docker/.env.production docker/.env
nano docker/.env

# Deploy
docker-compose -f docker/docker-compose.yml build
docker-compose -f docker/docker-compose.yml up -d

# Enable services
sudo systemctl enable docker
sudo systemctl enable containerd
```

### Production Configuration

```yaml
# docker/.env.production
COMPOSE_PROJECT_NAME=atonix-hardware-prod
USE_SIMULATORS=false
ENABLE_DEBUG=false
LOG_LEVEL=WARNING

# Hardware configuration
TPM_DEVICE=/dev/tpm0
SGX_DEBUG=false
SEV_POLICY=0x07  # Full SEV protection
OPTEE_DEVICE=/dev/tee0

# Security
ENABLE_AUDIT=true
AUDIT_LOG_PATH=/var/log/atonix/hardware-audit.log
ENABLE_FIPS=true
FIPS_MODE=true

# Monitoring
ENABLE_MONITORING=true
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
ALERTMANAGER_PORT=9093

# High availability
ENABLE_HA=true
REDIS_URL=redis://redis:6379
POSTGRES_URL=postgresql://user:pass@postgres:5432/hardware

# Backup
ENABLE_BACKUP=true
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION=30
```

## Edge Deployment

### Edge Device Requirements

- ARM64 or x86-64 processor
- 2GB RAM minimum
- 8GB storage minimum
- Power-efficient operation

### Edge Deployment Script

```bash
#!/bin/bash
# deploy-edge.sh

set -e

# Configuration
EDGE_DEVICE_IP="192.168.1.100"
EDGE_USER="atonix"
DEPLOY_PATH="/opt/atonix/edge"

# Copy files to edge device
scp -r atonix-hardware-integration ${EDGE_USER}@${EDGE_DEVICE_IP}:${DEPLOY_PATH}

# Remote deployment
ssh ${EDGE_USER}@${EDGE_DEVICE_IP} << EOF
cd ${DEPLOY_PATH}

# Install dependencies
sudo apt-get update
sudo apt-get install -y docker.io docker-compose git python3

# Configure for edge
export DOCKER_HOST=unix:///var/run/docker.sock
export COMPOSE_PROJECT_NAME=atonix-edge

# Build minimal image
docker build -f docker/Dockerfile.edge -t atonix-hardware-edge .

# Run edge services
docker-compose -f docker/docker-compose.edge.yml up -d

# Configure auto-start
sudo systemctl enable docker
EOF
```

### Edge Configuration

```yaml
# docker/docker-compose.edge.yml
version: '3.8'

services:
  hardware-edge:
    image: atonix-hardware-edge
    restart: unless-stopped
    devices:
      - /dev/tpm0:/dev/tpm0
      - /dev/sgx:/dev/sgx
    volumes:
      - ./config:/etc/atonix
      - ./data:/var/lib/atonix
    environment:
      - EDGE_MODE=true
      - LOW_POWER=true
      - ENABLE_COMPRESSION=true
    networks:
      - edge-network

  monitoring:
    image: prom/prometheus:latest
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - edge-network

networks:
  edge-network:
    driver: bridge
```

## Cloud Deployment

### AWS Deployment

#### EC2 Instance Setup

```bash
# Launch EC2 instance with hardware security support
aws ec2 run-instances \
    --image-id ami-0abcdef1234567890 \
    --instance-type c5.xlarge \
    --key-name my-key-pair \
    --security-groups sg-12345678 \
    --user-data file://cloud-init.sh \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=Atonix-Hardware}]'
```

#### Cloud-Init Script

```yaml
# cloud-init.sh
#cloud-config
package_update: true
package_upgrade: true

packages:
  - docker.io
  - docker-compose
  - git
  - git-lfs
  - python3
  - python3-pip

runcmd:
  - systemctl enable docker
  - systemctl start docker
  - usermod -aG docker ubuntu
  - git lfs install
  - cd /home/ubuntu
  - git clone https://github.com/AtonixCorp/atonixcorp.git
  - cd atonixcorp/atonix-hardware-integration
  - git lfs pull
  - cp docker/.env.aws docker/.env
  - docker-compose -f docker/docker-compose.yml up -d
```

#### AWS Configuration

```yaml
# docker/.env.aws
COMPOSE_PROJECT_NAME=atonix-hardware-aws
USE_SIMULATORS=false
ENABLE_DEBUG=false
LOG_LEVEL=INFO

# AWS-specific configuration
AWS_REGION=us-east-1
AWS_INSTANCE_ID=i-1234567890abcdef0
ENABLE_CLOUDWATCH=true
CLOUDWATCH_LOG_GROUP=/atonix/hardware

# Hardware configuration (Nitro TPM)
TPM_DEVICE=/dev/nitro_tpm
ENABLE_NITRO_ENCLAVES=true
NITRO_ENCLAVE_CID=16

# Load balancing
ENABLE_ALB=true
ALB_TARGET_GROUP=arn:aws:elasticloadbalancing:region:account:targetgroup/tg-name/123456789
```

### Azure Deployment

#### Azure VM Setup

```bash
# Create VM with security features
az vm create \
    --resource-group atonix-rg \
    --name atonix-hardware-vm \
    --image Ubuntu2204 \
    --size Standard_D4s_v3 \
    --admin-username atonix \
    --generate-ssh-keys \
    --security-type TrustedLaunch \
    --enable-secure-boot true \
    --enable-vtpm true
```

#### Azure Configuration

```yaml
# docker/.env.azure
COMPOSE_PROJECT_NAME=atonix-hardware-azure
USE_SIMULATORS=false
ENABLE_DEBUG=false
LOG_LEVEL=INFO

# Azure-specific configuration
AZURE_SUBSCRIPTION_ID=12345678-1234-1234-1234-123456789abc
AZURE_RESOURCE_GROUP=atonix-rg
AZURE_VM_NAME=atonix-hardware-vm

# Hardware configuration (vTPM)
TPM_DEVICE=/dev/tpm0
ENABLE_AZURE_ATTESTATION=true
AZURE_ATTESTATION_PROVIDER=atonix-attestation

# Key Vault integration
ENABLE_AZURE_KEYVAULT=true
AZURE_KEYVAULT_URL=https://atonix-kv.vault.azure.net/
```

### GCP Deployment

#### GCE Instance Setup

```bash
# Create VM with Shielded VM features
gcloud compute instances create atonix-hardware \
    --zone=us-central1-a \
    --machine-type=n1-standard-4 \
    --network-tier=PREMIUM \
    --maintenance-policy=MIGRATE \
    --image=ubuntu-2004-focal-v20220118 \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=50GB \
    --boot-disk-type=pd-standard \
    --boot-disk-device-name=atonix-hardware \
    --shielded-secure-boot \
    --shielded-vtpm \
    --shielded-integrity-monitoring \
    --metadata-from-file startup-script=startup.sh
```

#### GCP Configuration

```yaml
# docker/.env.gcp
COMPOSE_PROJECT_NAME=atonix-hardware-gcp
USE_SIMULATORS=false
ENABLE_DEBUG=false
LOG_LEVEL=INFO

# GCP-specific configuration
GCP_PROJECT_ID=atonix-project
GCP_ZONE=us-central1-a
GCP_INSTANCE_NAME=atonix-hardware

# Hardware configuration (Shielded VM)
TPM_DEVICE=/dev/tpm0
ENABLE_GCP_SHIELDED_VM=true

# Cloud Logging
ENABLE_STACKDRIVER=true
STACKDRIVER_LOG_NAME=atonix-hardware

# Secret Manager
ENABLE_GCP_SECRETS=true
GCP_SECRETS_PROJECT=atonix-project
```

## Multi-Environment Deployment

### Blue-Green Deployment

```bash
# Deploy to blue environment
docker-compose -f docker/docker-compose.blue.yml up -d

# Run tests on blue
docker-compose -f docker/docker-compose.blue.yml exec hardware-ci \
    bash -c "cd tests/hardware-security && ./run-smoke-tests.sh"

# Switch traffic to blue
# Update load balancer configuration

# Deploy to green environment
docker-compose -f docker/docker-compose.green.yml up -d

# Run tests on green
docker-compose -f docker/docker-compose.green.yml exec hardware-ci \
    bash -c "cd tests/hardware-security && ./run-smoke-tests.sh"

# Switch traffic to green
# Update load balancer configuration

# Shutdown blue environment
docker-compose -f docker/docker-compose.blue.yml down
```

### Canary Deployment

```bash
# Deploy canary version
docker-compose -f docker/docker-compose.canary.yml up -d

# Route 10% traffic to canary
# Update load balancer weights

# Monitor canary metrics
curl http://canary-service:8080/metrics

# If successful, increase traffic
# Update load balancer weights to 25%, 50%, 100%

# Full deployment or rollback
if [ "$CANARY_SUCCESS" = "true" ]; then
    docker-compose -f docker/docker-compose.prod.yml up -d
    docker-compose -f docker/docker-compose.canary.yml down
else
    docker-compose -f docker/docker-compose.canary.yml down
fi
```

## Monitoring and Observability

### Prometheus Metrics

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'hardware-integration'
    static_configs:
      - targets: ['hardware-service:8080']
    metrics_path: '/metrics'

  - job_name: 'tpm-metrics'
    static_configs:
      - targets: ['tpm-exporter:8080']

  - job_name: 'sgx-metrics'
    static_configs:
      - targets: ['sgx-exporter:8080']
```

### Grafana Dashboards

Key metrics to monitor:
- TPM operation latency
- SGX enclave creation time
- SEV VM startup time
- OP-TEE call performance
- Hardware error rates
- Security event logs

### Alerting Rules

```yaml
# monitoring/alerts.yml
groups:
  - name: hardware-integration
    rules:
      - alert: TPMUnavailable
        expr: up{job="tpm-exporter"} == 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "TPM device unavailable"

      - alert: SGXEnclaveFailure
        expr: rate(sgx_enclave_creation_failures_total[5m]) > 0
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "SGX enclave creation failures detected"
```

## Backup and Recovery

### Backup Strategy

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/opt/atonix/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup configurations
tar -czf $BACKUP_DIR/config_$DATE.tar.gz \
    /etc/atonix/ \
    /opt/atonix/production/docker/.env

# Backup data
docker run --rm \
    -v atonix_hardware_data:/data \
    -v $BACKUP_DIR:/backup \
    alpine tar czf /backup/data_$DATE.tar.gz -C / data

# Backup TPM state (if supported)
tpm2_nvread -C o 0x1500016 > $BACKUP_DIR/tpm_state_$DATE.bin

# Cleanup old backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.bin" -mtime +30 -delete
```

### Recovery Procedure

```bash
# Stop services
docker-compose down

# Restore configurations
tar -xzf /opt/atonix/backups/config_latest.tar.gz -C /

# Restore data
docker run --rm \
    -v atonix_hardware_data:/data \
    -v /opt/atonix/backups:/backup \
    alpine sh -c "cd /data && tar xzf /backup/data_latest.tar.gz"

# Restore TPM state
tpm2_nvwrite -C o 0x1500016 -i /opt/atonix/backups/tpm_state_latest.bin

# Start services
docker-compose up -d
```

## Security Hardening

### Production Security Checklist

- [ ] Enable FIPS mode
- [ ] Configure secure boot
- [ ] Set up TPM ownership
- [ ] Enable audit logging
- [ ] Configure firewall rules
- [ ] Set up log rotation
- [ ] Enable disk encryption
- [ ] Configure backup encryption
- [ ] Set up monitoring alerts
- [ ] Review access controls

### Security Configuration

```bash
# Enable FIPS mode
sudo apt-get install openssh-server
sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl reload sshd

# Configure audit rules
sudo auditctl -a always,exit -F arch=b64 -S execve -k exec
sudo auditctl -a always,exit -F arch=b32 -S execve -k exec

# Set up log rotation
sudo cat > /etc/logrotate.d/atonix << EOF
/var/log/atonix/*.log {
    daily
    rotate 30
    compress
    missingok
    notifempty
    create 0644 atonix atonix
    postrotate
        systemctl reload rsyslog
    endscript
}
EOF
```

## Scaling Considerations

### Horizontal Scaling

```yaml
# docker/docker-compose.scaled.yml
version: '3.8'

services:
  hardware-service:
    image: atonix-hardware:latest
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:alpine
    deploy:
      replicas: 1

  postgres:
    image: postgres:13
    deploy:
      replicas: 1
    environment:
      POSTGRES_DB: hardware
      POSTGRES_USER: atonix
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Load Balancing

```nginx
# nginx.conf
upstream hardware_backend {
    server hardware-service-1:8080;
    server hardware-service-2:8080;
    server hardware-service-3:8080;
}

server {
    listen 80;
    server_name hardware.atonixcorp.com;

    location / {
        proxy_pass http://hardware_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /metrics {
        proxy_pass http://hardware_backend;
    }
}
```

## Maintenance Procedures

### Regular Maintenance Tasks

```bash
# Weekly tasks
# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Update Docker images
docker-compose pull
docker-compose up -d

# Rotate logs
sudo logrotate -f /etc/logrotate.d/atonix

# Check disk usage
df -h

# Monitor hardware health
# Check TPM status
tpm2_selftest

# Check SGX status
# Check SEV status
```

### Emergency Procedures

#### Service Failure

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs hardware-service

# Restart service
docker-compose restart hardware-service

# If restart fails, redeploy
docker-compose up -d --force-recreate hardware-service
```

#### Hardware Failure

```bash
# Check hardware status
dmesg | grep -i tpm
dmesg | grep -i sgx
dmesg | grep -i sev

# Try hardware reset
# TPM reset
tpm2_startup -c

# System reboot if necessary
sudo reboot
```

## Compliance and Auditing

### Security Compliance

- **NIST SP 800-193**: Platform Firmware Resiliency
- **FIPS 140-2/3**: Cryptographic module validation
- **PCI DSS**: Payment card industry security
- **HIPAA**: Health insurance portability and accountability

### Audit Logging

```bash
# Configure audit rules for hardware operations
sudo auditctl -a always,exit -F path=/dev/tpm0 -F perm=rwxa -k tpm_access
sudo auditctl -a always,exit -F path=/dev/sgx -F perm=rwxa -k sgx_access
sudo auditctl -a always,exit -F path=/dev/tee0 -F perm=rwxa -k optee_access

# View audit logs
sudo ausearch -k tpm_access
sudo ausearch -k sgx_access
sudo ausearch -k optee_access
```

This deployment guide provides comprehensive instructions for deploying the AtonixCorp hardware integration across various environments. Always test deployments in staging before production rollout, and implement proper monitoring and backup procedures.

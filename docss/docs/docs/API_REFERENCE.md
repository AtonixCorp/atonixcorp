# AtonixCorp API Documentation

## Overview

The AtonixCorp API provides comprehensive access to all platform capabilities through industry-standard REST and GraphQL interfaces.

### Base URL
```
https://api.atonixcorp.com/v1
```

### Authentication
All requests require authentication via JWT Bearer token in the `Authorization` header:
```bash
Authorization: Bearer <JWT_TOKEN>
```

### Response Format
All responses are in JSON format with consistent structure:

**Success Response (2xx)**
```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "request_id": "req_12345",
    "timestamp": "2026-02-17T10:30:00Z"
  }
}
```

**Error Response (4xx/5xx)**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Description of the error",
    "details": { /* additional context */ }
  },
  "meta": {
    "request_id": "req_12345",
    "timestamp": "2026-02-17T10:30:00Z"
  }
}
```

---

## Compute API

### Virtual Machines

#### Create VM
```http
POST /compute/instances
Content-Type: application/json

{
  "name": "web-server-01",
  "image_id": "ubuntu-20.04-lts",
  "flavor": "m1.large",
  "network_id": "default",
  "key_pair": "my-keypair",
  "tags": ["production", "web"],
  "metadata": {
    "environment": "prod",
    "owner": "ops-team"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "instance_id": "i-0a1b2c3d4e5f6g7h8",
    "name": "web-server-01",
    "status": "building",
    "created_at": "2026-02-17T10:30:00Z",
    "public_ip": "203.0.113.42",
    "private_ip": "10.0.1.5",
    "flavor": {
      "name": "m1.large",
      "vcpus": 4,
      "memory_mb": 8192,
      "disk_gb": 80
    }
  }
}
```

#### List VMs
```http
GET /compute/instances?status=running&limit=20&offset=0
```

#### Get VM Details
```http
GET /compute/instances/{instance_id}
```

#### Update VM
```http
PATCH /compute/instances/{instance_id}

{
  "name": "web-server-01-updated",
  "metadata": {"owner": "devops-team"}
}
```

#### Delete VM
```http
DELETE /compute/instances/{instance_id}
```

#### Manage Instance
- **Start**: `POST /compute/instances/{instance_id}/start`
- **Stop**: `POST /compute/instances/{instance_id}/stop`
- **Reboot**: `POST /compute/instances/{instance_id}/reboot`
- **Resize**: `POST /compute/instances/{instance_id}/resize` (with new flavor)

---

### Kubernetes Clusters

#### Create Cluster
```http
POST /compute/kubernetes/clusters

{
  "name": "prod-cluster-01",
  "version": "1.29.0",
  "node_count": 3,
  "node_type": "m1.xlarge",
  "network_id": "vpc-prod",
  "region": "us-west-2",
  "auto_scaling": {
    "enabled": true,
    "min_nodes": 3,
    "max_nodes": 10
  },
  "addons": ["monitoring", "ingress", "storage-class"]
}
```

#### List Clusters
```http
GET /compute/kubernetes/clusters
```

#### Get Cluster Details
```http
GET /compute/kubernetes/clusters/{cluster_id}
```

#### Deploy Application
```http
POST /compute/kubernetes/clusters/{cluster_id}/deployments

{
  "name": "nginx-app",
  "namespace": "production",
  "image": "nginx:latest",
  "replicas": 3,
  "resources": {
    "requests": {"cpu": "100m", "memory": "128Mi"},
    "limits": {"cpu": "500m", "memory": "512Mi"}
  }
}
```

---

### Serverless Functions

#### Create Function
```http
POST /compute/serverless/functions

{
  "name": "process-image",
  "runtime": "python3.11",
  "handler": "index.handler",
  "source": "s3://my-bucket/function.zip",
  "timeout": 300,
  "memory_mb": 512,
  "environment": {
    "BUCKET_NAME": "my-bucket",
    "REGION": "us-west-2"
  },
  "triggers": [
    {
      "type": "s3",
      "bucket": "uploads",
      "events": ["s3:ObjectCreated:*"]
    }
  ]
}
```

#### Invoke Function
```http
POST /compute/serverless/functions/{function_id}/invoke

{
  "payload": {"image_key": "logo.png"}
}
```

#### List Functions
```http
GET /compute/serverless/functions
```

---

## Storage API

### Object Storage (S3-Compatible)

#### Create Bucket
```http
POST /storage/buckets

{
  "name": "my-app-data",
  "region": "us-west-2",
  "acl": "private",
  "versioning": true,
  "encryption": {
    "enabled": true,
    "algorithm": "AES-256"
  }
}
```

#### Upload Object
```http
PUT /storage/buckets/{bucket_id}/objects/{object_key}
Content-Type: application/octet-stream

[binary data]
```

#### Get Object
```http
GET /storage/buckets/{bucket_id}/objects/{object_key}
```

#### List Objects
```http
GET /storage/buckets/{bucket_id}/objects?prefix=logs/&delimiter=/
```

#### Delete Object
```http
DELETE /storage/buckets/{bucket_id}/objects/{object_key}
```

### Block Storage (EBS-Like)

#### Create Volume
```http
POST /storage/volumes

{
  "name": "database-volume",
  "size_gb": 500,
  "type": "ssd",
  "encryption": true,
  "iops": 3000,
  "tags": ["database", "production"]
}
```

#### Attach Volume
```http
POST /storage/volumes/{volume_id}/attach

{
  "instance_id": "i-0a1b2c3d4e5f6g7h8",
  "device_path": "/dev/sdf"
}
```

#### Create Snapshot
```http
POST /storage/volumes/{volume_id}/snapshots

{
  "name": "db-backup-daily",
  "description": "Daily database backup"
}
```

#### Create Volume from Snapshot
```http
POST /storage/volumes

{
  "snapshot_id": "snap-0a1b2c3d4e5f6g7h8",
  "size_gb": 500,
  "type": "ssd"
}
```

### File Storage (NFS/SMB)

#### Create Share
```http
POST /storage/file-shares

{
  "name": "project-data",
  "size_gb": 1000,
  "protocol": "nfs",
  "encryption": true,
  "backup": {
    "enabled": true,
    "frequency": "daily",
    "retention_days": 30
  }
}
```

#### Mount Instructions
```http
GET /storage/file-shares/{share_id}/mount-info
```

---

## Networking API

### Virtual Private Cloud (VPC)

#### Create VPC
```http
POST /networking/vpcs

{
  "name": "production-vpc",
  "cidr_block": "10.0.0.0/16",
  "enable_dns": true,
  "tags": ["production"]
}
```

#### Create Subnet
```http
POST /networking/vpcs/{vpc_id}/subnets

{
  "name": "public-subnet-1a",
  "cidr_block": "10.0.1.0/24",
  "availability_zone": "us-west-2a",
  "assign_public_ip": true
}
```

#### Create Route Table
```http
POST /networking/vpcs/{vpc_id}/route-tables

{
  "name": "public-routes",
  "routes": [
    {
      "destination": "0.0.0.0/0",
      "target_type": "gateway",
      "target_id": "igw-xyz"
    }
  ]
}
```

### Load Balancer

#### Create Load Balancer
```http
POST /networking/load-balancers

{
  "name": "api-lb",
  "type": "application",
  "scheme": "internet-facing",
  "subnets": ["subnet-1", "subnet-2"],
  "tags": ["production"]
}
```

#### Create Target Group
```http
POST /networking/load-balancers/{lb_id}/target-groups

{
  "name": "api-targets",
  "protocol": "HTTP",
  "port": 8080,
  "vpc_id": "vpc-xyz",
  "health_check": {
    "enabled": true,
    "path": "/health",
    "interval": 30,
    "timeout": 5,
    "healthy_threshold": 2,
    "unhealthy_threshold": 3
  }
}
```

#### Register Target
```http
POST /networking/load-balancers/{lb_id}/target-groups/{tg_id}/targets

{
  "targets": [
    {"id": "i-0a1b2c3d4e5f6g7h8", "port": 8080},
    {"id": "i-1b2c3d4e5f6g7h8i9", "port": 8080}
  ]
}
```

### Content Delivery Network (CDN)

#### Create Distribution
```http
POST /networking/cdn/distributions

{
  "name": "website-cdn",
  "origin": {
    "domain": "origin.example.com",
    "protocol": "https"
  },
  "behaviors": [
    {
      "path_pattern": "/api/*",
      "allowed_methods": ["GET", "POST", "PUT", "DELETE"],
      "cache_policy": "no-cache"
    }
  ],
  "cache_behaviors": {
    "default_ttl": 86400,
    "max_ttl": 31536000
  }
}
```

#### Invalidate Cache
```http
POST /networking/cdn/distributions/{distribution_id}/invalidate

{
  "paths": ["/index.html", "/api/*"]
}
```

---

## Automation API

### Infrastructure as Code

#### Create Stack
```http
POST /automation/stacks

{
  "name": "web-app-stack",
  "template": "s3://templates/web-app.yaml",
  "parameters": {
    "instance_type": "m1.xlarge",
    "database_size": "100GB"
  },
  "tags": {"Environment": "production"}
}
```

#### Get Stack
```http
GET /automation/stacks/{stack_id}
```

#### Update Stack
```http
PATCH /automation/stacks/{stack_id}

{
  "template": "s3://templates/web-app-v2.yaml",
  "parameters": {"instance_type": "m1.2xlarge"}
}
```

#### Delete Stack
```http
DELETE /automation/stacks/{stack_id}
```

### Scheduled Tasks

#### Create Scheduled Task
```http
POST /automation/scheduled-tasks

{
  "name": "daily-backup",
  "action": "backup_database",
  "schedule": "0 2 * * *",
  "parameters": {
    "database_id": "db-123",
    "retention_days": 30
  },
  "enabled": true
}
```

---

## Monitoring & Analytics API

### Get Metrics
```http
GET /monitoring/metrics?resource_type=instance&resource_id=i-xyz&metric=cpu_usage&start_time=2026-02-17T00:00:00Z&end_time=2026-02-18T00:00:00Z&interval=300s
```

### Create Alert
```http
POST /monitoring/alerts

{
  "name": "high-cpu",
  "metric": "compute.cpu_usage",
  "condition": "greater_than",
  "threshold": 80,
  "duration": 300,
  "actions": [
    {"type": "notification", "endpoint": "ops@company.com"},
    {"type": "auto_scale", "direction": "up", "count": 2}
  ]
}
```

### List Logs
```http
GET /monitoring/logs?resource_id=i-xyz&level=ERROR&start_time=2026-02-17T00:00:00Z
```

---

## GraphQL API

### Endpoint
```
POST https://api.atonixcorp.com/graphql
```

### Example Queries

#### Get Instance with Metrics
```graphql
query GetInstance {
  instance(id: "i-xyz") {
    id
    name
    status
    created_at
    metrics(interval: "1h") {
      cpu_usage
      memory_usage
      network_in
      network_out
    }
    volumes {
      id
      name
      size_gb
    }
  }
}
```

#### List Instances with Filtering
```graphql
query ListInstances {
  instances(
    status: RUNNING
    tag: "production"
    limit: 20
  ) {
    id
    name
    ip_address
    flavor {
      name
      vcpus
      memory_mb
    }
  }
}
```

#### Real-time Subscriptions
```graphql
subscription OnInstanceStateChange {
  instanceStateChanged(instance_id: "i-xyz") {
    instance_id
    previous_state
    new_state
    timestamp
  }
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| INVALID_REQUEST | 400 | Request validation failed |
| UNAUTHORIZED | 401 | Authentication failed |
| FORBIDDEN | 403 | Permission denied |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| QUOTA_EXCEEDED | 429 | Quota limit reached |
| INTERNAL_ERROR | 500 | Server error |
| SERVICE_UNAVAILABLE | 503 | Service temporarily unavailable |

---

## Rate Limiting

- **Requests per second**: 100 (standard), 1000 (premium)
- **Requests per day**: 1,000,000 (standard), unlimited (enterprise)
- **Header**: `X-RateLimit-Remaining`

---

## Pagination

All list endpoints support pagination:
```
GET /resource?limit=20&offset=0
```

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 1000
  }
}
```

---

## Webhooks

### Supported Events
- `compute.instance.created`
- `compute.instance.deleted`
- `compute.instance.state_changed`
- `storage.volume.created`
- `storage.bucket.quota_exceeded`
- `networking.load_balancer.target_unhealthy`
- `automation.stack.completed`
- `security.alert.triggered`

### Create Webhook
```http
POST /webhooks

{
  "url": "https://your-app.com/webhook",
  "events": ["compute.instance.created", "compute.instance.deleted"],
  "secret": "webhook_secret_key"
}
```

---

**Last Updated**: February 17, 2026  
**API Version**: 1.0.0

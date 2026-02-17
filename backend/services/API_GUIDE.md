# AtonixCorp Cloud Services - API Guide

## Overview

This guide documents the RESTful API for the AtonixCorp cloud services platform, built with Django REST Framework (DRF).

## API Structure

The API is organized into three main service modules:

1. **Compute Service** - VMs, Kubernetes, Serverless Functions, Auto-Scaling
2. **Storage Service** - Object Storage, Block Storage, File Storage, Backups
3. **Networking Service** - VPCs, Load Balancers, CDN, DNS, VPN

## Base URL

```
http://localhost:8000/api/v1/services/
```

## Authentication

All API endpoints require authentication. Supported methods:

### API Key Authentication
```http
Authorization: Token YOUR_API_KEY
```

### OAuth 2.0
```
GET /api/auth/token/
POST /api/auth/refresh/
```

## Common Response Format

### Success Response (200 OK)
```json
{
  "id": "resource-id",
  "name": "Resource Name",
  "status": "running",
  "created_at": "2026-02-17T10:30:00Z",
  "tags": {"environment": "production"}
}
```

### Error Response (400+ status)
```json
{
  "error": "Error message",
  "details": {
    "field_name": ["Error description"]
  }
}
```

## Pagination

All list endpoints support pagination:

```
GET /api/v1/services/instances/?page=1&page_size=20
```

Response includes:
```json
{
  "count": 100,
  "next": "http://.../instances/?page=2",
  "previous": null,
  "results": [...]
}
```

## Filtering & Search

### Filter by Status
```
GET /api/v1/services/instances/?status=running
```

### Search
```
GET /api/v1/services/instances/?search=my-instance
```

### Combine Multiple Filters
```
GET /api/v1/services/instances/?owner=user123&status=running&availability_zone=us-west-2a
```

---

# COMPUTE SERVICE API

## Virtual Machines (Instances)

### List Instances
```http
GET /api/v1/services/instances/
Authorization: Token YOUR_API_KEY
```

**Query Parameters:**
- `status` - Filter by status (pending, running, stopped, terminated)
- `flavor` - Filter by instance type
- `search` - Search by instance ID or name
- `page` - Pagination

**Response:**
```json
[
  {
    "resource_id": "res-abc123",
    "instance_id": "i-0123456789",
    "name": "web-server-01",
    "status": "running",
    "flavor_name": "t3.large",
    "image_name": "Ubuntu 22.04",
    "private_ip": "10.0.1.50",
    "public_ip": "203.0.113.45",
    "created_at": "2026-02-15T10:00:00Z"
  }
]
```

### Create Instance
```http
POST /api/v1/services/instances/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "name": "web-server-02",
  "description": "Production web server",
  "flavor": "t3-large",
  "image": "ami-ubuntu2204",
  "vpc_id": "vpc-12345678",
  "subnet_id": "subnet-87654321",
  "security_groups": ["sg-default", "sg-web"],
  "root_volume_size_gb": 100,
  "enable_monitoring": true,
  "tags": {
    "environment": "production",
    "team": "platform"
  }
}
```

**Response:** (201 Created)
```json
{
  "resource_id": "res-xyz789",
  "instance_id": "i-new987654",
  "name": "web-server-02",
  "status": "pending",
  "...": "..."
}
```

### Get Instance Details
```http
GET /api/v1/services/instances/{instance_id}/
Authorization: Token YOUR_API_KEY
```

### Update Instance
```http
PATCH /api/v1/services/instances/{instance_id}/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "name": "web-server-02-prod",
  "enable_monitoring": true,
  "tags": {"version": "2.0"}
}
```

### Start Instance
```http
POST /api/v1/services/instances/{instance_id}/start/
Authorization: Token YOUR_API_KEY
```

### Stop Instance
```http
POST /api/v1/services/instances/{instance_id}/stop/
Authorization: Token YOUR_API_KEY
```

### Terminate Instance
```http
POST /api/v1/services/instances/{instance_id}/terminate/
Authorization: Token YOUR_API_KEY
```

### Get Instance Metrics
```http
GET /api/v1/services/instances/{instance_id}/metrics/
Authorization: Token YOUR_API_KEY
```

**Response:**
```json
[
  {
    "cpu_usage_percent": 42.5,
    "memory_usage_percent": 68.3,
    "disk_usage_percent": 45.0,
    "network_in_bytes": 1024000,
    "network_out_bytes": 512000,
    "created_at": "2026-02-17T10:30:00Z"
  }
]
```

## Flavors (Instance Types)

### List Available Flavors
```http
GET /api/v1/services/flavors/
```

**Response:**
```json
[
  {
    "flavor_id": "t3-micro",
    "name": "t3.micro",
    "vcpus": 1,
    "memory_mb": 1024,
    "disk_gb": 8,
    "network_bandwidth_gbps": 0.5,
    "gpu_count": 0,
    "hourly_cost_usd": "0.0104",
    "is_active": true,
    "is_gpu": false
  }
]
```

### List GPU Flavors
```http
GET /api/v1/services/flavors/gpu_flavors/
```

## Images (OS Templates)

### List Images
```http
GET /api/v1/services/images/?is_public=true
```

### Create Custom Image
```http
POST /api/v1/services/images/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "name": "my-custom-app-image",
  "description": "Custom app with dependencies",
  "os_type": "linux",
  "os_name": "Ubuntu",
  "os_version": "22.04",
  "size_gb": 50
}
```

## Kubernetes Clusters

### Create Cluster
```http
POST /api/v1/services/kubernetes-clusters/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "name": "prod-cluster",
  "description": "Production Kubernetes cluster",
  "kubernetes_version": "1.29.0",
  "node_count": 3,
  "node_flavor": "t3-xlarge",
  "vpc_id": "vpc-12345678",
  "auto_scaling_enabled": true,
  "min_nodes": 2,
  "max_nodes": 10,
  "rbac_enabled": true,
  "network_policy_enabled": true,
  "region": "us-west-2"
}
```

### List Cluster Nodes
```http
GET /api/v1/services/kubernetes-clusters/{cluster_id}/nodes/
```

### Scale Cluster
```http
POST /api/v1/services/kubernetes-clusters/{cluster_id}/scale/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "desired_count": 5
}
```

## Serverless Functions

### Create Function
```http
POST /api/v1/services/serverless-functions/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "name": "image-processor",
  "description": "Process and resize images",
  "runtime": "python3.11",
  "handler": "handler.process_image",
  "timeout_seconds": 300,
  "memory_mb": 512,
  "code_uri": "s3://my-bucket/code.zip",
  "environment_variables": {
    "BUCKET_NAME": "output-bucket",
    "MAX_SIZE": "1024"
  }
}
```

### Invoke Function
```http
POST /api/v1/services/serverless-functions/{function_id}/invoke/
Authorization: Token YOUR_API_KEY
```

### Add Function Trigger
```http
POST /api/v1/services/serverless-functions/{function_id}/add_trigger/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "trigger_type": "s3",
  "config": {
    "bucket": "input-bucket",
    "events": ["s3:ObjectCreated:*"]
  }
}
```

## Auto-Scaling Groups

### Create Auto-Scaling Group
```http
POST /api/v1/services/auto-scaling-groups/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "name": "web-fleet",
  "min_size": 2,
  "max_size": 10,
  "desired_capacity": 4,
  "launch_template_id": "lt-0123456789abcdef",
  "health_check_type": "elb"
}
```

### Update Desired Capacity
```http
POST /api/v1/services/auto-scaling-groups/{asg_id}/update_capacity/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "desired_capacity": 6
}
```

### Add Scaling Policy
```http
POST /api/v1/services/auto-scaling-groups/{asg_id}/add_policy/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "policy_type": "target-tracking",
  "metric_name": "CPUUtilization",
  "target_value": 70.0,
  "adjustment_type": "ChangeInCapacity"
}
```

---

# STORAGE SERVICE API

## Object Storage (Buckets)

### Create Bucket
```http
POST /api/v1/services/buckets/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "bucket_name": "my-application-data",
  "region": "us-west-2",
  "acl": "private",
  "versioning_enabled": true,
  "encryption_enabled": true,
  "encryption_type": "sse-s3",
  "logging_enabled": false
}
```

### List Buckets
```http
GET /api/v1/services/buckets/
Authorization: Token YOUR_API_KEY
```

### Get Bucket Objects
```http
GET /api/v1/services/buckets/{bucket_id}/objects/
```

### Bucket Statistics
```http
GET /api/v1/services/buckets/{bucket_id}/statistics/
```

**Response:**
```json
{
  "total_objects": 15420,
  "total_size_gb": 245.8,
  "versioning_enabled": true,
  "encryption_enabled": true,
  "average_object_size_mb": 16.5
}
```

### Enable Versioning
```http
POST /api/v1/services/buckets/{bucket_id}/enable_versioning/
Authorization: Token YOUR_API_KEY
```

### Enable Logging
```http
POST /api/v1/services/buckets/{bucket_id}/enable_logging/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "log_target_bucket": "my-logs-bucket",
  "log_prefix": "access-logs/"
}
```

## Objects (S3 Objects)

### Upload Object
```http
POST /api/v1/services/s3-objects/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "object_key": "data/config.json",
  "bucket": "my-app-bucket",
  "content_type": "application/json",
  "storage_class": "standard",
  "is_public": false,
  "metadata": {
    "version": "1.0",
    "author": "system"
  }
}
```

### Make Object Public
```http
POST /api/v1/services/s3-objects/{object_id}/make_public/
Authorization: Token YOUR_API_KEY
```

### Change Storage Class
```http
POST /api/v1/services/s3-objects/{object_id}/change_storage_class/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "storage_class": "glacier"
}
```

## Block Storage (Volumes)

### Create Volume
```http
POST /api/v1/services/volumes/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "name": "database-store",
  "size_gb": 500,
  "volume_type": "gp3",
  "availability_zone": "us-west-2a",
  "iops": 3000,
  "throughput_mbps": 125,
  "encryption_enabled": true
}
```

### Attach Volume
```http
POST /api/v1/services/volumes/{volume_id}/attach/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "instance_id": "i-0123456789",
  "device": "/dev/sdf"
}
```

### Create Snapshot
```http
POST /api/v1/services/volumes/{volume_id}/create_snapshot/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "description": "Daily backup"
}
```

## Snapshots

### Restore from Snapshot
```http
POST /api/v1/services/snapshots/{snapshot_id}/restore/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "name": "restored-volume",
  "volume_type": "gp3",
  "availability_zone": "us-west-2a"
}
```

## File Shares

### Create File Share
```http
POST /api/v1/services/file-shares/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "name": "shared-data",
  "size_gb": 1000,
  "protocol": "nfs",
  "vpc_id": "vpc-12345678",
  "subnet_id": "subnet-87654321",
  "allowed_clients": ["10.0.0.0/8"],
  "performance_tier": "standard"
}
```

### Mount File Share
```http
POST /api/v1/services/file-shares/{file_share_id}/mount/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "instance_id": "i-0123456789",
  "mount_path": "/mnt/shared-data",
  "mount_options": "nfsvers=4.1,rsize=1048576,wsize=1048576"
}
```

## Encryption Keys

### Create Encryption Key
```http
POST /api/v1/services/encryption-keys/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "name": "app-key",
  "description": "Key for application data encryption",
  "key_type": "symmetric",
  "algorithm": "AES_256",
  "rotation_enabled": true,
  "rotation_period_days": 90
}
```

### Rotate Key
```http
POST /api/v1/services/encryption-keys/{key_id}/rotate/
Authorization: Token YOUR_API_KEY
```

## Backup Policies

### Create Backup Policy
```http
POST /api/v1/services/backup-policies/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "name": "daily-backups",
  "description": "Daily database backups",
  "resource_type": "volume",
  "resource_ids": ["vol-12345678"],
  "schedule_frequency": "daily",
  "schedule_time": "02:00",
  "retention_days": 30
}
```

### Trigger Backup
```http
POST /api/v1/services/backup-policies/{policy_id}/trigger_backup/
Authorization: Token YOUR_API_KEY
```

---

# NETWORKING SERVICE API

## VPCs

### Create VPC
```http
POST /api/v1/services/vpcs/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "name": "prod-vpc",
  "description": "Production VPC",
  "cidr_block": "10.0.0.0/16",
  "enable_dns_hostnames": true,
  "enable_dns_support": true,
  "region": "us-west-2"
}
```

### List VPCs
```http
GET /api/v1/services/vpcs/
Authorization: Token YOUR_API_KEY
```

### Get VPC Subnets
```http
GET /api/v1/services/vpcs/{vpc_id}/subnets/
```

### Get VPC Security Groups
```http
GET /api/v1/services/vpcs/{vpc_id}/security_groups/
```

## Subnets

### Create Subnet
```http
POST /api/v1/services/subnets/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "vpc": "vpc-12345678",
  "cidr_block": "10.0.1.0/24",
  "availability_zone": "us-west-2a",
  "map_public_ip_on_launch": true
}
```

## Security Groups

### Create Security Group
```http
POST /api/v1/services/security-groups/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "name": "web-sg",
  "description": "Security group for web servers",
  "vpc": "vpc-12345678"
}
```

### Add Ingress Rule
```http
POST /api/v1/services/security-groups/{sg_id}/authorize_ingress/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "protocol": "tcp",
  "from_port": 443,
  "to_port": 443,
  "cidr": "0.0.0.0/0"
}
```

## Load Balancers

### Create Load Balancer
```http
POST /api/v1/services/load-balancers/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "name": "web-lb",
  "description": "Load balancer for web servers",
  "lb_type": "application",
  "vpc_id": "vpc-12345678",
  "subnets": ["subnet-1", "subnet-2"],
  "security_groups": ["sg-12345678"],
  "scheme": "internet-facing",
  "idle_timeout_seconds": 60
}
```

### Register Target
```http
POST /api/v1/services/target-groups/{tg_id}/register_target/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "target_id": "i-0123456789",
  "port": 8080
}
```

## Load Balancer Target Groups

### Create Target Group
```http
POST /api/v1/services/load-balancers/{lb_id}/add_target_group/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "name": "web-tg",
  "protocol": "HTTP",
  "port": 80,
  "vpc_id": "vpc-12345678",
  "target_type": "instance",
  "health_check_enabled": true,
  "health_check_path": "/health"
}
```

## Route Tables

### Create Route
```http
POST /api/v1/services/route-tables/{rt_id}/add_route/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "destination_cidr": "0.0.0.0/0",
  "target_type": "internet-gateway",
  "target_id": "igw-12345678"
}
```

## DNS Records

### Create DNS Record
```http
POST /api/v1/services/dns-records/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "zone_id": "zone-12345678",
  "name": "www.example.com",
  "record_type": "A",
  "ttl": 300,
  "values": ["203.0.113.1"],
  "routing_policy": "simple"
}
```

## CDN Distributions

### Create CDN Distribution
```http
POST /api/v1/services/cdn-distributions/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "name": "cdn-dist",
  "origin_domain": "api.example.com",
  "domain_names": ["cdn.example.com"],
  "default_root_object": "index.html",
  "require_https": true,
  "price_class": "all"
}
```

### Invalidate Cache
```http
POST /api/v1/services/cdn-distributions/{dist_id}/invalidate_cache/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "paths": ["/api/v1/*", "/assets/*"]
}
```

## VPN

### Create VPN Connection
```http
POST /api/v1/services/vpn-connections/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "vpn_gateway": "vpn-gw-12345678",
  "customer_gateway": "cgw-87654321",
  "static_routes_only": false
}
```

---

## Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | BAD_REQUEST | Invalid request parameters |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Permission denied |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource conflict (duplicate, wrong state, etc.) |
| 429 | RATE_LIMITED | Too many requests |
| 500 | SERVER_ERROR | Internal server error |

## Rate Limiting

API enforces rate limiting:
- **Authenticated Users**: 1000 requests/hour
- **Anonymous**: 100 requests/hour

Headers in response:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1648764000
```

## Webhooks

Subscribe to resource events:
```http
POST /api/v1/webhooks/
Authorization: Token YOUR_API_KEY
Content-Type: application/json

{
  "event": "instance.state_changed",
  "url": "https://your-server.com/webhook",
  "active": true
}
```

---

## SDK Examples

### Python
```python
import requests

API_KEY = "your-api-key"
headers = {"Authorization": f"Token {API_KEY}"}

# List instances
response = requests.get(
    "http://localhost:8000/api/v1/services/instances/",
    headers=headers
)
instances = response.json()

# Create instance
instance_data = {
    "name": "web-server",
    "flavor": "t3-large",
    "image": "ami-ubuntu2204",
    "vpc_id": "vpc-12345678"
}
response = requests.post(
    "http://localhost:8000/api/v1/services/instances/",
    json=instance_data,
    headers=headers
)
```

### JavaScript/Node.js
```javascript
const API_KEY = "your-api-key";

// List instances
fetch("http://localhost:8000/api/v1/services/instances/", {
  method: "GET",
  headers: {
    "Authorization": `Token ${API_KEY}`
  }
})
  .then(r => r.json())
  .then(instances => console.log(instances));

// Create instance
fetch("http://localhost:8000/api/v1/services/instances/", {
  method: "POST",
  headers: {
    "Authorization": `Token ${API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: "web-server",
    flavor: "t3-large",
    image: "ami-ubuntu2204",
    vpc_id: "vpc-12345678"
  })
})
```

### cURL
```bash
# List instances
curl -X GET "http://localhost:8000/api/v1/services/instances/" \
  -H "Authorization: Token YOUR_API_KEY"

# Create instance
curl -X POST "http://localhost:8000/api/v1/services/instances/" \
  -H "Authorization: Token YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "web-server",
    "flavor": "t3-large",
    "image": "ami-ubuntu2204",
    "vpc_id": "vpc-12345678"
  }'
```

---

## Testing

Run tests for API:
```bash
python manage.py test services.tests
```

Test specific service:
```bash
python manage.py test services.tests.ComputeServiceTests
python manage.py test services.tests.StorageServiceTests
python manage.py test services.tests.NetworkingServiceTests
```

---

## Troubleshooting

### 401 Unauthorized
- Verify API token is valid
- Check token hasn't expired
- Ensure Authorization header format is correct

### 403 Forbidden  
- Verify user has permission for resource type
- Check resource ownership
- Review IAM policies

### 404 Not Found
- Verify resource ID is correct
- Check resource hasn't been deleted
- Verify region/availability zone

### 409 Conflict
- Verify resource isn't already in operation
- Check resource state (may need to be running/stopped)
- Ensure parameters are valid for current state

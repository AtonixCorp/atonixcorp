# AtonixCorp Storage Service Documentation

## Overview
The Storage Service provides comprehensive data storage solutions including object storage, block storage, file storage, and intelligent tiering.

---

## Object Storage (S3-Compatible)

### Features
- Unlimited storage capacity
- S3-compatible API
- Versioning and lifecycle policies
- Server-side encryption (AES-256)
- Cross-region replication
- Multi-part upload support
- Static website hosting

### Bucket Management

#### Create Bucket
```bash
# CLI
atonix-cli storage buckets create \
  --name my-app-data \
  --region us-west-2 \
  --acl private \
  --versioning enabled \
  --encryption enabled

# API
curl -X POST https://api.atonixcorp.com/v1/storage/buckets \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "my-app-data",
    "region": "us-west-2",
    "acl": "private",
    "versioning": true,
    "encryption": {
      "enabled": true,
      "algorithm": "AES-256"
    }
  }'
```

#### List Buckets
```bash
atonix-cli storage buckets list

# AWS CLI compatible
aws s3 ls --endpoint-url https://api.atonixcorp.com
```

#### Configure Bucket

##### Versioning
```bash
atonix-cli storage buckets update my-app-data \
  --versioning enabled
```

##### Lifecycle Policy
```bash
atonix-cli storage buckets lifecycle-policy my-app-data \
  --add-rule '{
    "prefix": "logs/",
    "days": 90,
    "action": "delete"
  }' \
  --add-rule '{
    "prefix": "archive/",
    "days": 30,
    "action": "transition-to-cold"
  }'
```

##### CORS Policy
```json
{
  "CORSRules": [
    {
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedOrigins": ["https://example.com"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### Object Operations

#### Upload Objects
```bash
# Single object
atonix-cli storage objects put my-app-data data.json \
  --metadata "environment=production"

# Multipart upload (large files)
atonix-cli storage objects put my-app-data large-file.zip \
  --multipart \
  --part-size 100MB

# AWS CLI compatible
aws s3 cp data.json s3://my-app-data/ \
  --endpoint-url https://api.atonixcorp.com
```

#### Download Objects
```bash
atonix-cli storage objects get my-app-data data.json \
  --output ./data.json

# With version
atonix-cli storage objects get my-app-data data.json \
  --version-id v123456 \
  --output ./data.json
```

#### List Objects
```bash
# List all objects
atonix-cli storage objects list my-app-data

# With prefix
atonix-cli storage objects list my-app-data \
  --prefix logs/2026-02-17/

# With delimiter (folder-like listing)
atonix-cli storage objects list my-app-data \
  --prefix logs/ \
  --delimiter /
```

#### Delete Objects
```bash
# Delete single object
atonix-cli storage objects delete my-app-data data.json

# Delete multiple objects
atonix-cli storage objects delete my-app-data \
  --prefix logs/old/ \
  --recursive
```

#### Object Metadata
```bash
# Get metadata
atonix-cli storage objects metadata my-app-data data.json

# Update metadata
atonix-cli storage objects update-metadata my-app-data data.json \
  --metadata "environment=production,team=engineering"
```

### Server-Side Encryption

#### SSE with Managed Keys (SSE-S3)
```bash
atonix-cli storage buckets encryption update my-app-data \
  --type sse-s3
```

#### SSE with Customer Managed Keys (SSE-KMS)
```bash
# Create encryption key
atonix-cli security encryption-keys create \
  --name my-bucket-key \
  --region us-west-2

# Configure bucket
atonix-cli storage buckets encryption update my-app-data \
  --type sse-kms \
  --key-id key-123456
```

#### Client-Side Encryption (CSE)
```python
import boto3
from atonixcorp.client import AtonixCorp

client = AtonixCorp(
    access_key='YOUR_ACCESS_KEY',
    secret_key='YOUR_SECRET_KEY',
    encryption={
        'type': 'client-side',
        'key': 'my-encryption-key'
    }
)

# Upload encrypted object
client.put_object(
    Bucket='my-app-data',
    Key='sensitive-data.json',
    Body=b'secret data'
)
```

### Access Control

#### Bucket ACL
```bash
atonix-cli storage buckets acl update my-app-data \
  --acl "public-read"  # or private, authenticated-read
```

#### Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-app-data/public/*"
    },
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::my-app-data",
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": ["203.0.113.0/24"]
        }
      }
    }
  ]
}
```

#### Pre-signed URLs
```bash
# Generate pre-signed URL (valid for 1 hour)
atonix-cli storage objects presigned-url my-app-data data.json \
  --expiration 3600
```

### Replication

#### Cross-Region Replication
```bash
atonix-cli storage buckets replication create \
  --source-bucket my-app-data \
  --destination-bucket my-app-data-backup \
  --destination-region eu-west-1 \
  --enable-delete-marker-replication
```

#### Same-Region Replication
```bash
atonix-cli storage buckets replication create \
  --source-bucket my-app-data \
  --destination-bucket my-app-data-staging \
  --enable-delete-marker-replication
```

---

## Block Storage

### Volume Types

| Type | Performance | Use Case | Cost |
|------|-------------|----------|------|
| gp3 | General | Most workloads | $ |
| io2 | High I/O | Databases | $$$ |
| st1 | Throughput | Big data | $$ |
| sc1 | Cold | Archives | $ |

### Volume Management

#### Create Volume
```bash
atonix-cli storage volumes create \
  --name database-volume \
  --size 500 \
  --type io2 \
  --iops 3000 \
  --availability-zone us-west-2a
```

#### Attach Volume
```bash
# Attach to instance
atonix-cli storage volumes attach database-volume \
  --instance i-0a1b2c3d \
  --device /dev/sdf

# SSH to instance and mount
ssh ec2-user@instance-ip
lsblk  # Find device name (typically /dev/nvf1 or similar)
sudo mkfs.ext4 /dev/nvf1
sudo mkdir /data
sudo mount /dev/nvf1 /data
```

#### Resize Volume
```bash
# Modify size
atonix-cli storage volumes modify database-volume \
  --size 1000

# Extend filesystem (on running instance)
ssh ec2-user@instance-ip
sudo growpart /dev/nvf1 1
sudo resize2fs /dev/nvf1
```

### Snapshots

#### Create Snapshot
```bash
atonix-cli storage volumes snapshots create \
  --volume database-volume \
  --description "Pre-upgrade backup"
```

#### Schedule Snapshots
```bash
atonix-cli storage volumes snapshots schedule \
  --volume database-volume \
  --frequency daily \
  --retention 30
```

#### Create Volume from Snapshot
```bash
atonix-cli storage volumes create \
  --from-snapshot snap-0a1b2c3d \
  --size 500 \
  --type io2
```

### Encryption

#### Enable Encryption
```bash
# New volume with encryption
atonix-cli storage volumes create \
  --name secure-volume \
  --size 500 \
  --encrypted true \
  --kms-key-id my-encryption-key

# Or enable by default
atonix-cli storage volumes enable-encryption-by-default
```

---

## File Storage (NFS/SMB)

### Share Management

#### Create Share
```bash
atonix-cli storage file-shares create \
  --name project-data \
  --size 1000 \
  --protocol nfs \
  --availability-zone us-west-2a
```

#### Mount Share

**Linux/Mac (NFS)**
```bash
mkdir /mnt/project-data

# Get mount command
MOUNT_CMD=$(atonix-cli storage file-shares mount-command project-data)

# Mount
sudo mount -t nfs4 $(echo $MOUNT_CMD)
```

**Windows (SMB)**
```powershell
# Get share path
$sharePath = atonix-cli storage file-shares get project-data --format=sharepath

# Mount drive
net use Z: "$sharePath"
```

### Access Control

#### NFS Export Policy
```bash
atonix-cli storage file-shares export-policy create \
  --share project-data \
  --add-rule '{
    "subnet": "10.0.0.0/24",
    "access": "rw",
    "squash": "no_root_squash"
  }'
```

### Backup Configuration

#### Create Backup Policy
```bash
atonix-cli storage file-shares backup-policy create \
  --share project-data \
  --frequency daily \
  --retention-days 30
```

#### On-Demand Backup
```bash
atonix-cli storage file-shares backup create \
  --share project-data \
  --description "Pre-release backup"
```

---

## Intelligent Tiering

### Tiering Strategy

#### Auto Tiering Configuration
```bash
atonix-cli storage tiering enable \
  --bucket my-app-data \
  --strategy auto
```

#### Tiering Policies
```json
{
  "hot_to_warm": {
    "days": 30,
    "threshold_gb": 100
  },
  "warm_to_cold": {
    "days": 90,
    "threshold_gb": 500
  },
  "cold_deletion": {
    "days": 365
  }
}
```

### Manual Tiering

#### Move Objects to Cold
```bash
atonix-cli storage objects tier-move \
  --bucket my-app-data \
  --from hot \
  --to cold \
  --prefix "logs/2025-01/"
```

#### Transition Lifecycle
```bash
atonix-cli storage buckets update my-app-data \
  --lifecycle-rule '{
    "transitions": [
      {
        "days": 30,
        "destination_class": "warm"
      },
      {
        "days": 90,
        "destination_class": "cold"
      }
    ]
  }'
```

### Cost Analysis

#### Get Tiering Report
```bash
atonix-cli storage tiering report \
  --bucket my-app-data \
  --period monthly
```

---

## Backup & Disaster Recovery

### Automated Backups

#### Schedule Backups
```bash
atonix-cli storage backup-policies create \
  --bucket my-app-data \
  --frequency daily \
  --time "02:00" \
  --retention 30
```

#### Cross-Region Backup
```bash
atonix-cli storage backup-policies create \
  --bucket my-app-data \
  --frequency weekly \
  --retention 52 \
  --destination-region eu-west-1
```

### Restore Points

#### List Backups
```bash
atonix-cli storage backups list my-app-data
```

#### Restore from Backup
```bash
# Restore entire bucket
atonix-cli storage backups restore \
  --bucket my-app-data \
  --backup-date 2026-02-17

# Restore specific object
atonix-cli storage backups restore \
  --bucket my-app-data \
  --key data.json \
  --backup-date 2026-02-15
```

---

## Performance Optimization

### Upload Optimization
```python
import boto3

s3 = boto3.client('s3', endpoint_url='https://api.atonixcorp.com')

# Multipart upload for large files
with open('large-file.zip', 'rb') as f:
    s3.upload_fileobj(
        f,
        'my-app-data',
        'large-file.zip',
        Config=boto3.s3.transfer.TransferConfig(
            multipart_threshold=100*1024*1024,  # 100MB
            max_concurrency=10,
            multipart_chunksize=10*1024*1024    # 10MB chunks
        )
    )
```

### Caching Strategy
```bash
# CloudFront CDN caching
atonix-cli storage cdn create-distribution \
  --bucket my-app-data \
  --default-ttl 86400 \
  --max-ttl 31536000
```

---

## Monitoring & Analytics

### Storage Metrics
```bash
# Get bucket size
atonix-cli storage buckets metrics my-app-data \
  --metric size

# Get object count
atonix-cli storage buckets metrics my-app-data \
  --metric object-count

# Get bandwidth usage
atonix-cli storage buckets metrics my-app-data \
  --metric bandwidth
```

### Cost Analysis
```bash
# Monthly cost breakdown
atonix-cli storage cost-analysis \
  --bucket my-app-data \
  --period monthly
```

---

## Best Practices

### Security
1. Enable versioning for critical data
2. Enable encryption by default
3. Use bucket policies for access control
4. Enable access logging
5. Regular security audits

### Performance
1. Use multipart uploads for large files
2. Enable transfer acceleration
3. Use CloudFront CDN
4. Implement intelligent caching

### Cost Optimization
1. Enable intelligent tiering
2. Delete old versions
3. Use lifecycle policies
4. Monitor and right-size storage
5. Use compression

---

**Last Updated**: February 17, 2026  
**Version**: 1.0.0

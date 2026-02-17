# AtonixCorp Compute Service Documentation

## Overview
The Compute Service provides high-performance, scalable compute resources for diverse workload types, from traditional virtual machines to containerized applications and serverless functions.

---

## Virtual Machines (VMs)

### Capabilities
- Full VM lifecycle management
- Multiple OS options (Linux, Windows)
- Flexible hardware configurations
- GPU acceleration
- Auto-scaling groups

### Instance Types
| Type | vCPUs | Memory | Storage | Use Case |
|------|-------|--------|---------|----------|
| t3.micro | 1 | 1GB | 8GB SSD | Development, testing |
| t3.small | 2 | 2GB | 20GB SSD | Small applications |
| m5.large | 2 | 8GB | 100GB SSD | General purpose |
| m5.xlarge | 4 | 16GB | 200GB SSD | Web servers, apps |
| m5.2xlarge | 8 | 32GB | 500GB SSD | Databases, workloads |
| c5.large | 2 | 4GB | 100GB SSD | Compute-optimized |
| c5.xlarge | 4 | 8GB | 200GB SSD | High CPU apps |
| r5.large | 2 | 16GB | 100GB SSD | Memory-optimized |
| r5.xlarge | 4 | 32GB | 200GB SSD | In-memory databases |
| g4dn.xlarge | 4 | 16GB | 250GB SSD | GPU-accelerated |

### Supported Operating Systems
- **Linux**: Ubuntu 20.04/22.04, CentOS 7/8, Debian 11/12
- **Windows**: Windows Server 2019/2022
- **Custom**: BYOL (Bring Your Own License)

### Creating a VM

```bash
# Using CLI
atonix-cli compute instances create \
  --name web-server-01 \
  --image ubuntu-22.04 \
  --flavor m5.large \
  --key-pair my-keypair \
  --subnet subnet-prod-1a \
  --tags "environment=production,team=engineering"

# Using API
curl -X POST https://api.atonixcorp.com/v1/compute/instances \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "web-server-01",
    "image_id": "img-ubuntu-22.04",
    "flavor": "m5.large",
    "key_pair": "my-keypair",
    "subnet_id": "subnet-prod-1a",
    "tags": ["environment:production", "team:engineering"]
  }'
```

### Managing VMs

#### Start/Stop/Reboot
```bash
# Start stopped instance
atonix-cli compute instances start i-0a1b2c3d

# Stop running instance
atonix-cli compute instances stop i-0a1b2c3d

# Reboot instance
atonix-cli compute instances reboot i-0a1b2c3d

# Terminate instance
atonix-cli compute instances terminate i-0a1b2c3d
```

#### Resize Instance
```bash
# Resize requires stopping the instance
atonix-cli compute instances stop i-0a1b2c3d
atonix-cli compute instances resize i-0a1b2c3d --flavor m5.xlarge
atonix-cli compute instances start i-0a1b2c3d
```

#### Snapshot and Backup
```bash
# Create snapshot
atonix-cli compute instances snapshot i-0a1b2c3d \
  --name web-server-backup-2026-02-17

# Create AMI from snapshot
atonix-cli compute images create-from-instance i-0a1b2c3d \
  --name my-web-server-image
```

### Auto-Scaling

#### Create Auto-Scaling Group
```bash
atonix-cli compute auto-scaling create \
  --name web-asg \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 3 \
  --launch-template web-server-v1 \
  --health-check-type elb \
  --health-check-grace-period 300
```

#### Scaling Policies
```bash
# Target tracking scaling
atonix-cli compute auto-scaling policies create \
  --asg-name web-asg \
  --policy-name cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-value 70.0 \
  --metric-name CPUUtilization

# Step scaling
atonix-cli compute auto-scaling policies create \
  --asg-name web-asg \
  --policy-name cpu-step-scaling \
  --policy-type StepScaling \
  --metric-name CPUUtilization \
  --steps "scale-up-at-80|scale-down-at-30"
```

---

## Kubernetes Clusters

### Cluster Management

#### Create Cluster
```bash
atonix-cli compute kubernetes clusters create \
  --name prod-cluster \
  --version 1.29.0 \
  --nodes 3 \
  --node-type m5.xlarge \
  --network vpc-prod \
  --addons metrics-server,ingress-nginx,storage-class
```

#### Get Kubeconfig
```bash
atonix-cli compute kubernetes clusters get-kubeconfig prod-cluster \
  --output kubeconfig.yaml

export KUBECONFIG=kubeconfig.yaml
kubectl get nodes
```

#### Scale Cluster
```bash
# Add nodes
kubectl scale deployment atonix-worker --replicas=5

# Or using CLI
atonix-cli compute kubernetes clusters scale prod-cluster --nodes 5
```

### Deploying Applications

#### Deploy Nginx
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  namespace: production
spec:
  selector:
    matchLabels:
      app: nginx
  replicas: 3
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi

---
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
  namespace: production
spec:
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

### Monitoring Clusters

#### Check Cluster Health
```bash
kubectl cluster-info
kubectl get nodes -o wide
kubectl get pods --all-namespaces
```

#### Access Metrics
```bash
export KUBECONFIG=kubeconfig.yaml

# Pod metrics
kubectl top pods -n production

# Node metrics
kubectl top nodes

# Tail logs
kubectl logs -f deployment/nginx -n production
```

---

## Serverless Functions

### Function Runtimes
- Python 3.11, 3.10
- Node.js 20.x, 18.x
- Go 1.21, 1.20
- Java 17, 11
- Custom containers

### Creating Functions

#### Python Example
```python
# handler.py
import json
import boto3

s3_client = boto3.client('s3')

def handler(event, context):
    '''
    Process S3 event and transform images
    '''
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    
    # Get object
    response = s3_client.get_object(Bucket=bucket, Key=key)
    
    # Process image
    # ... image processing logic ...
    
    # Upload result
    s3_client.put_object(
        Bucket=bucket,
        Key=f'processed/{key}',
        Body=processed_image
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Process complete'})
    }
```

#### Deploy Function
```bash
# Package function
zip function.zip handler.py

# Create function
atonix-cli compute serverless functions create \
  --name process-image \
  --runtime python3.11 \
  --handler handler.handler \
  --source function.zip \
  --timeout 300 \
  --memory 512 \
  --environment "BUCKET_NAME=my-bucket"
```

### Environment Variables
```bash
atonix-cli compute serverless functions update \
  --name process-image \
  --environment "KEY1=value1,KEY2=value2"
```

### Triggering Functions

#### S3 Event Trigger
```bash
atonix-cli compute serverless triggers create \
  --function process-image \
  --type s3 \
  --source bucket:uploads \
  --events "s3:ObjectCreated:*"
```

#### HTTP Trigger
```bash
atonix-cli compute serverless triggers create \
  --function process-image \
  --type http \
  --path /process-image \
  --methods GET,POST
```

#### Scheduled Trigger (Cron)
```bash
atonix-cli compute serverless triggers create \
  --function daily-cleanup \
  --type schedule \
  --schedule "0 2 * * *"  # 2 AM daily
```

### Invoking Functions

#### Synchronous Invocation
```bash
atonix-cli compute serverless functions invoke \
  --name process-image \
  --payload '{"image_key": "logo.png"}'
```

#### Asynchronous Invocation
```bash
atonix-cli compute serverless functions invoke \
  --name process-image \
  --payload '{"image_key": "logo.png"}' \
  --async
```

---

## GPU Accelerated Computing

### GPU Instances
| Instance | GPUs | GPU Type | Memory | Use Case |
|----------|------|----------|--------|----------|
| g4dn.xlarge | 1 | T4 | 16GB | Deep learning, inference |
| g4dn.2xlarge | 1 | T4 | 32GB | Training, large models |
| p3.2xlarge | 8 | V100 | 256GB | Large-scale training |
| p4d.24xlarge | 8 | A100 | 320GB | HPC, massive training |

### Running GPU Workloads

#### TensorFlow Example
```bash
atonix-cli compute instances create \
  --name gpu-ml-01 \
  --flavor p3.2xlarge \
  --image ubuntu-22.04-cuda-12.1 \
  --key-pair my-keypair

# SSH into instance
ssh -i my-keypair.pem ec2-user@ip-address

# Train model
python train.py --gpu
```

#### Container-based GPU
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod
spec:
  containers:
  - name: gpu-container
    image: tensorflow/tensorflow:latest-gpu
    resources:
      limits:
        nvidia.com/gpu: 1
```

---

## Best Practices

### Security
1. **Use Security Groups**: Restrict inbound traffic
2. **Enable Encryption**: Enable EBS encryption by default
3. **Key Management**: Rotate SSH keys regularly
4. **IMDSv2**: Require IMDSv2 for EC2 metadata
5. **Monitoring**: Enable CloudWatch detailed monitoring

### Performance
1. **Instance Placement**: Use placement groups for low latency
2. **EBS Optimization**: Enable EBS optimization for high I/O
3. **Network Performance**: Use enhanced networking
4. **Monitoring**: Monitor CPU, memory, disk I/O

### Cost Optimization
1. **Right Sizing**: Monitor and adjust instance types
2. **Spot Instances**: Use spot instances for non-critical workloads
3. **Reserved Instances**: Purchase RIs for predictable workloads
4. **Scheduling**: Stop instances when not in use
5. **Disk Cleanup**: Regular cleanup of snapshots and volumes

---

**Last Updated**: February 17, 2026  
**Version**: 1.0.0

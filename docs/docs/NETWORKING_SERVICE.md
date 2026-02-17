# AtonixCorp Networking Service Documentation

## Overview
The Networking Service provides comprehensive networking capabilities including VPCs, subnets, load balancers, and CDN.

---

## Virtual Private Cloud (VPC)

### VPC Fundamentals

#### Create VPC
```bash
atonix-cli networking vpcs create \
  --name production-vpc \
  --cidr-block 10.0.0.0/16 \
  --enable-dns true \
  --region us-west-2
```

#### VPC Configuration

##### DNS Settings
```bash
atonix-cli networking vpcs update production-vpc \
  --dns-hostnames enabled \
  --dns-resolution enabled
```

##### DHCP Options
```bash
atonix-cli networking vpcs dhcp-options create \
  --name production-dhcp \
  --domain-name example.com \
  --domain-name-servers 10.0.0.2
```

### Subnets

#### Create Subnets
```bash
# Public subnet
atonix-cli networking subnets create \
  --name public-subnet-1a \
  --vpc production-vpc \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-west-2a \
  --assign-public-ip true

# Private subnet
atonix-cli networking subnets create \
  --name private-subnet-1a \
  --vpc production-vpc \
  --cidr-block 10.0.10.0/24 \
  --availability-zone us-west-2a \
  --assign-public-ip false
```

#### Multi-AZ Deployment
```bash
# Create subnets in multiple AZs for HA
for az in us-west-2a us-west-2b us-west-2c; do
  atonix-cli networking subnets create \
    --name public-subnet-${az: -1} \
    --vpc production-vpc \
    --cidr-block 10.0.${i}.0/24 \
    --availability-zone $az \
    --assign-public-ip true
  ((i++))
done
```

### Internet And NAT Gateways

#### Create Internet Gateway
```bash
atonix-cli networking internet-gateways create \
  --name production-igw \
  --vpc production-vpc

# Verify attachment
atonix-cli networking internet-gateways describe production-igw
```

#### Create NAT Gateway
```bash
# Allocate elastic IP
atonix-cli networking elastic-ips allocate \
  --name nat-eip

# Create NAT Gateway in public subnet
atonix-cli networking nat-gateways create \
  --name production-nat \
  --subnet public-subnet-1a \
  --elastic-ip nat-eip
```

### Route Tables

#### Create and Configure Route Table
```bash
# Public route table
atonix-cli networking route-tables create \
  --name public-routes \
  --vpc production-vpc

# Add route to Internet Gateway
atonix-cli networking route-tables add-route \
  --route-table public-routes \
  --destination 0.0.0.0/0 \
  --target-type internet-gateway \
  --target-id production-igw

# Associate with public subnet
atonix-cli networking route-tables associate \
  --route-table public-routes \
  --subnet public-subnet-1a
```

#### Private Route Table
```bash
# Private route table
atonix-cli networking route-tables create \
  --name private-routes \
  --vpc production-vpc

# Add route through NAT Gateway
atonix-cli networking route-tables add-route \
  --route-table private-routes \
  --destination 0.0.0.0/0 \
  --target-type nat-gateway \
  --target-id production-nat

# Associate with private subnet
atonix-cli networking route-tables associate \
  --route-table private-routes \
  --subnet private-subnet-1a
```

---

## Security Groups

### Security Group Management

#### Create Security Group
```bash
atonix-cli networking security-groups create \
  --name web-sg \
  --vpc production-vpc \
  --description "Security group for web servers"
```

#### Configure Inbound Rules
```bash
# Allow HTTP from anywhere
atonix-cli networking security-group-rules authorize \
  --group web-sg \
  --type ingress \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

# Allow HTTPS from anywhere
atonix-cli networking security-group-rules authorize \
  --group web-sg \
  --type ingress \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Allow SSH from office network only
atonix-cli networking security-group-rules authorize \
  --group web-sg \
  --type ingress \
  --protocol tcp \
  --port 22 \
  --cidr 203.0.113.0/24

# Allow traffic from database security group
atonix-cli networking security-group-rules authorize \
  --group database-sg \
  --type ingress \
  --protocol tcp \
  --port 5432 \
  --source-security-group web-sg
```

#### Configure Outbound Rules
```bash
# Allow all outbound traffic (default)
atonix-cli networking security-group-rules authorize \
  --group web-sg \
  --type egress \
  --protocol -1 \
  --cidr 0.0.0.0/0
```

### Security Group Templates

#### Web Server Group
```bash
atonix-cli networking security-group-templates apply web-server \
  --vpc production-vpc \
  --name web-sg
```

#### Database Server Group
```bash
atonix-cli networking security-group-templates apply database-server \
  --vpc production-vpc \
  --name db-sg \
  --allowed-source web-sg  # Allow traffic from web-sg
```

---

## Load Balancers

### Application Load Balancer (ALB)

#### Create Load Balancer
```bash
atonix-cli networking load-balancers create \
  --name api-alb \
  --type application \
  --scheme internet-facing \
  --subnets public-subnet-1a public-subnet-1b \
  --security-groups web-sg \
  --enable-access-logs true
```

#### Create Target Group
```bash
atonix-cli networking target-groups create \
  --name api-targets \
  --vpc production-vpc \
  --protocol HTTP \
  --port 8080 \
  --health-check-enabled true \
  --health-check-path /health \
  --health-check-interval 30 \
  --health-check-timeout 5 \
  --healthy-threshold 2 \
  --unhealthy-threshold 3
```

#### Register Targets
```bash
atonix-cli networking target-groups add-targets \
  --target-group api-targets \
  --targets i-0a1b2c3d:8080 i-1b2c3d4e:8080 i-2c3d4e5f:8080
```

#### Create Listener
```bash
# HTTP Listener (redirect to HTTPS)
atonix-cli networking listeners create \
  --load-balancer api-alb \
  --protocol HTTP \
  --port 80 \
  --default-action redirect \
  --redirect-protocol HTTPS \
  --redirect-port 443

# HTTPS Listener
atonix-cli networking listeners create \
  --load-balancer api-alb \
  --protocol HTTPS \
  --port 443 \
  --certificate-arn arn:aws:acm:certificate \
  --ssl-policy ELBSecurityPolicy-TLS-1-2-2017-01 \
  --default-action forward \
  --target-group api-targets
```

#### Listener Rules
```bash
# Route /api requests to api-targets
atonix-cli networking listening-rules create \
  --listener api-alb-https \
  --priority 1 \
  --path-pattern /api/* \
  --target-group api-targets

# Route /static requests to cdn
atonix-cli networking listening-rules create \
  --listener api-alb-https \
  --priority 2 \
  --path-pattern /static/* \
  --action redirect \
  --redirect-url https://cdn.example.com/static
```

### Network Load Balancer (NLB)

#### Create High-Performance NLB
```bash
atonix-cli networking load-balancers create \
  --name api-nlb \
  --type network \
  --scheme internet-facing \
  --subnets public-subnet-1a public-subnet-1b \
  --enable-cross-zone true
```

#### UDP Traffic Balancing
```bash
atonix-cli networking target-groups create \
  --name game-servers \
  --vpc production-vpc \
  --protocol UDP \
  --port 27015 \
  --health-check-protocol UDP
```

### Load Balancer Monitoring

#### Get Metrics
```bash
atonix-cli networking load-balancers metrics api-alb \
  --metric ActiveConnectionCount \
  --metric NewConnectionCount \
  --metric ProcessedBytes
```

---

## Content Delivery Network (CDN)

### CDN Distribution

#### Create Distribution
```bash
atonix-cli networking cdn distributions create \
  --name website-cdn \
  --origin-domain api.example.com \
  --origin-protocol https \
  --default-root-object index.html \
  --enable-compression true \
  --enable-ipv6 true
```

#### Cache Behaviors

##### Default Behavior
```bash
atonix-cli networking cdn cache-behaviors create \
  --distribution website-cdn \
  --path-pattern "*" \
  --allowed-methods GET HEAD OPTIONS \
  --cached-methods GET HEAD \
  --ttl 86400 \
  --compress true
```

##### API Endpoints (No Cache)
```bash
atonix-cli networking cdn cache-behaviors create \
  --distribution website-cdn \
  --path-pattern "/api/*" \
  --allowed-methods ALL \
  --cache-policy no-cache \
  --compress true
```

##### Static Assets (Long TTL)
```bash
atonix-cli networking cdn cache-behaviors create \
  --distribution website-cdn \
  --path-pattern "/static/*" \
  --allowed-methods GET HEAD \
  --cached-methods GET HEAD \
  --ttl 31536000 \
  --compress true
```

### Cache Invalidation
```bash
# Invalidate specific paths
atonix-cli networking cdn invalidate \
  --distribution website-cdn \
  --paths "/index.html" "/api/*"

# Invalidate all
atonix-cli networking cdn invalidate \
  --distribution website-cdn \
  --paths "/*"
```

### Origin Configuration

#### Multiple Origins
```bash
# Add second origin
atonix-cli networking cdn add-origin \
  --distribution website-cdn \
  --origin-id api-backup \
  --origin-domain api-backup.example.com \
  --origin-protocol https
```

#### Origin Shield
```bash
atonix-cli networking cdn enable-origin-shield \
  --distribution website-cdn \
  --region us-west-2
```

---

## Virtual Private Network (VPN)

### Site-to-Site VPN

#### Create Virtual Gateway
```bash
atonix-cli networking virtual-gateways create \
  --name vpn-gateway \
  --vpc production-vpc \
  --type ipsec.1
```

#### Create Customer Gateway
```bash
atonix-cli networking customer-gateways create \
  --name office-gateway \
  --type ipsec.1 \
  --public-ip 203.0.113.10 \
  --bgp-asn 65000
```

#### Create VPN Connection
```bash
atonix-cli networking vpn-connections create \
  --name office-vpn \
  --type ipsec.1 \
  --customer-gateway office-gateway \
  --virtual-gateway vpn-gateway \
  --options "TunnelOptions[0].TunnelInsideCidr=169.254.10.0/30"
```

### Client VPN

#### Create VPN Endpoint
```bash
atonix-cli networking client-vpn-endpoints create \
  --name client-vpn \
  --client-cidr-block 10.50.0.0/16 \
  --server-certificate-arn arn:aws:acm:certificate \
  --client-certificate-revocation-list-arn arn:aws:acm:certificate
```

---

## DNS Management

### Route 53 (DNS Service)

#### Create Hosted Zone
```bash
atonix-cli networking hosted-zones create \
  --name example.com \
  --type public
```

#### Add Records

##### A Record
```bash
atonix-cli networking route53 add-record \
  --hosted-zone example.com \
  --name api.example.com \
  --type A \
  --ttl 300 \
  --value 203.0.113.42
```

##### CNAME Record
```bash
atonix-cli networking route53 add-record \
  --hosted-zone example.com \
  --name www.example.com \
  --type CNAME \
  --ttl 300 \
  --value api.example.com
```

##### Alias Record (for AWS resources)
```bash
atonix-cli networking route53 add-record \
  --hosted-zone example.com \
  --name api.example.com \
  --type A \
  --alias-target api-alb-123456.us-west-2.elb.amazonaws.com
```

##### MX Record
```bash
atonix-cli networking route53 add-record \
  --hosted-zone example.com \
  --name example.com \
  --type MX \
  --ttl 300 \
  --value "10 mail.example.com"
```

#### Health Checks
```bash
atonix-cli networking route53 health-checks create \
  --name api-health \
  --type http \
  --resource-path /health \
  --port 443 \
  --protocol HTTPS
```

#### Routing Policies

##### Weighted Routing
```bash
atonix-cli networking route53 add-record \
  --hosted-zone example.com \
  --name api.example.com \
  --type A \
  --routing-policy weighted \
  --weight 100 \
  --set-identifier primary \
  --value 203.0.113.42

atonix-cli networking route53 add-record \
  --hosted-zone example.com \
  --name api.example.com \
  --type A \
  --routing-policy weighted \
  --weight 50 \
  --set-identifier secondary \
  --value 203.0.113.43
```

##### Latency Routing
```bash
atonix-cli networking route53 add-record \
  --hosted-zone example.com \
  --name api.example.com \
  --type A \
  --routing-policy latency \
  --region us-west-2 \
  --set-identifier us-west \
  --value 203.0.113.42
```

---

## Network Monitoring

### VPC Flow Logs

#### Enable Flow Logs
```bash
atonix-cli networking vpc-flow-logs enable \
  --vpc production-vpc \
  --traffic-type ALL \
  --log-destination-type cloudwatch-logs
```

#### Query Flow Logs
```bash
atonix-cli networking vpc-flow-logs query \
  --log-group vpc-flow-logs \
  --src-ip 10.0.0.0/8 \
  --start-time 2026-02-17T00:00:00Z
```

---

## Best Practices

### Security
1. Use private subnets for backend services
2. Implement security group rules (least privilege)
3. Enable VPC Flow Logs for monitoring
4. Use NACLs for additional protection
5. Enable encryption for all traffic

### Performance
1. Use multiple AZs for availability
2. Implement connection pooling
3. Use CloudFront for static assets
4. Enable compression
5. Monitor and optimize routing

### Cost Optimization
1. Right-size NAT gateways
2. Use endpoint services instead of NAT
3. Clean up unused resources
4. Use reserved capacity for predictable traffic
5. Monitor data transfer costs

---

**Last Updated**: February 17, 2026  
**Version**: 1.0.0

# [SHIP] Pushing AtonixCorp Platform to Quay.io Registry

## [CLIPBOARD] Prerequisites

1. **Quay.io Account**: You need an account at [quay.io](https://quay.io)
2. **Repository**: Create a repository `atonixdev/atonixcorp` on Quay.io
3. **Permissions**: Ensure your account has push permissions to the repository

## [LOCKED] Step 1: Login to Quay.io

```bash
# Login using the build script
./build.sh login

# Or login directly with nerdctl
nerdctl login quay.io
```

When prompted, enter:
- **Username**: Your Quay.io username (probably `atonixdev`)
- **Password**: Your Quay.io password or robot token

## [PACKAGE] Step 2: Build the Container (if not already built)

```bash
# Build the latest container
./build.sh build
```

## 🏷️ Step 3: Tag for Registry

```bash
# Tag with latest
./build.sh tag

# Or tag with specific version
VERSION=v1.0.0 ./build.sh tag
```

This will create the tag: `quay.io/atonixdev/atonixcorp:latest` (or your specified version)

## 📤 Step 4: Push to Quay.io

```bash
# Push latest
./build.sh push

# Or push specific version
VERSION=v1.0.0 ./build.sh push
```

## 🚀 Step 5: One-Command Release (Recommended)

```bash
# Build, tag, and push latest
./build.sh release

# Build, tag, and push specific version
VERSION=v1.0.0 ./build.sh release
```

## [SEARCH] Verification

After pushing, you can verify the image is available:

```bash
# Pull from registry to test
nerdctl pull quay.io/atonixdev/atonixcorp:latest

# Run from registry
nerdctl run -d -p 8080:8080 quay.io/atonixdev/atonixcorp:latest
```

## [NETWORK] Production Deployment from Registry

Once pushed to Quay.io, you can deploy to production:

```bash
# On production server
docker pull quay.io/atonixdev/atonixcorp:latest

# Run in production
docker run -d \
  -p 8080:8080 \
  -e DATABASE_URL="postgresql://user:pass@your-db:5432/dbname" \
  -e REDIS_URL="redis://your-redis:6379" \
  -e DEBUG=False \
  -e ALLOWED_HOSTS="your-domain.com" \
  --name atonixcorp \
  quay.io/atonixdev/atonixcorp:latest
```

## [TOOLS] Advanced Usage

### Multiple Versions

```bash
# Development version
VERSION=dev ./build.sh release

# Staging version  
VERSION=staging ./build.sh release

# Production version
VERSION=v1.0.0 ./build.sh release
```

### Custom Registry

```bash
# Use different registry
REGISTRY=your-registry.com/yourorg ./build.sh release
```

## [METRICS] Registry Information

- **Registry**: `quay.io/atonixdev`
- **Repository**: `atonixcorp`
- **Full Image Name**: `quay.io/atonixdev/atonixcorp:latest`
- **Size**: ~505 MB
- **Architecture**: linux/amd64

## [SECURE] Security Notes

1. **Robot Tokens**: For CI/CD, use Quay.io robot tokens instead of personal passwords
2. **Private Repository**: Consider making the repository private if this is proprietary code
3. **Vulnerability Scanning**: Quay.io provides automatic vulnerability scanning

## [ALERT] Troubleshooting

### Authentication Issues
```bash
# Clear credentials and re-login
nerdctl logout quay.io
./build.sh login
```

### Push Failures
```bash
# Check if image exists locally
nerdctl images | grep atonixcorp

# Rebuild if necessary
./build.sh build
./build.sh tag
./build.sh push
```

### Permission Errors
- Verify you have write access to `quay.io/atonixdev/atonixcorp`
- Check if the repository exists on Quay.io
- Ensure you're logged in with the correct account

---

## [OK] Quick Start Commands

```bash
# 1. Login to Quay.io
./build.sh login

# 2. Build and push latest
./build.sh release

# 3. Deploy from registry
docker run -d -p 8080:8080 quay.io/atonixdev/atonixcorp:latest
```

[SUCCESS] **Your unified AtonixCorp Platform container is now ready for production deployment from Quay.io!**
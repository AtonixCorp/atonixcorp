# Hardware Integration Setup Guide

This guide provides step-by-step instructions for setting up the AtonixCorp hardware integration environment.

## Prerequisites

### System Requirements

- **Operating System**: Ubuntu 20.04 LTS or later, CentOS 7+ or RHEL 8+
- **CPU**: x86-64 or ARM64 with virtualization support
- **Memory**: Minimum 8GB RAM, recommended 16GB+
- **Storage**: 50GB free disk space for Yocto builds
- **Network**: Internet connection for package downloads

### Required Software

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
    git \
    git-lfs \
    docker.io \
    docker-compose \
    python3 \
    python3-pip \
    build-essential \
    cmake \
    ninja-build \
    qemu-system-x86 \
    qemu-system-arm \
    libssl-dev \
    libtss2-dev \
    libsgx-dcap-ql-dev \
    libsgx-urts \
    optee-client-dev \
    optee-os-dev

# Enable Docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER

# Install Git LFS
curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
sudo apt-get install git-lfs
git lfs install

# Install Python packages
pip3 install --user \
    pyyaml \
    jinja2 \
    requests \
    cryptography \
    pytest \
    pytest-cov \
    junit-xml
```

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/AtonixCorp/atonixcorp-platform.git
cd atonixcorp-platform/atonix-hardware-integration

# Pull large files
git lfs pull
```

### 2. Initialize Submodules

```bash
# Initialize Yocto layers
git submodule update --init --recursive
```

### 3. Configure Environment

```bash
# Copy environment template
cp docker/.env.example docker/.env

# Edit configuration
nano docker/.env
```

### 4. Start Development Environment

```bash
# Start all services
docker-compose -f docker/docker-compose.yml up -d

# Wait for services to start
docker-compose -f docker/docker-compose.yml ps

# Enter development container
docker-compose -f docker/docker-compose.yml exec hardware-ci bash
```

## Yocto Build Setup

### Initialize Yocto Environment

```bash
cd yocto

# Initialize build directory
source oe-init-build-env build-qemuarm64

# Configure for AtonixCorp hardware
bitbake-layers add-layer ../meta-atonix-hardware

# Configure local.conf
cat >> conf/local.conf << EOF
# AtonixCorp Hardware Configuration
MACHINE = "qemuarm64"
DISTRO = "atonixcorp-hardware"

# Enable hardware security features
ENABLE_TPM = "1"
ENABLE_SGX = "1"
ENABLE_SEV = "1"
ENABLE_OPTEE = "1"

# Build optimization
BB_NUMBER_THREADS = "4"
PARALLEL_MAKE = "4"
EOF
```

### Build Base Image

```bash
# Build minimal image
bitbake core-image-minimal

# Build hardware security image
bitbake atonixcorp-hardware-image
```

### Build SDK

```bash
# Build SDK for application development
bitbake atonixcorp-hardware-image -c populate_sdk
```

## Hardware Security Setup

### TPM 2.0 Configuration

#### Software TPM (Development)

```bash
# Install TPM simulator
sudo apt-get install tpm2-tools tpm2-abrmd

# Start TPM simulator
tpm2-abrmd --allow-root

# Initialize TPM
tpm2_startup -c
tpm2_selftest
```

#### Hardware TPM (Production)

```bash
# Check TPM device
ls -la /dev/tpm*

# Install TPM tools
sudo apt-get install tpm2-tools

# Take ownership (one-time setup)
tpm2_takeownership -o ownerpass -e endorsepass -l lockpass

# Create primary key
tpm2_createprimary -c primary.ctx

# Create signing key
tpm2_create -C primary.ctx -u key.pub -r key.priv -o key.name
```

### Intel SGX Setup

```bash
# Install SGX SDK
wget https://download.01.org/intel-sgx/sgx-linux/2.17/distro/ubuntu20.04-server/sgx_linux_x64_sdk_2.17.100.3.bin
chmod +x sgx_linux_x64_sdk_2.17.100.3.bin
./sgx_linux_x64_sdk_2.17.100.3.bin --noexec --target sgx

# Install SGX PSW
sudo apt-get install libsgx-pce-logic libsgx-ae-qe3 libsgx-ae-qve libsgx-qe3-logic libsgx-dcap-ql

# Configure SGX
source sgx/sgxsdk/environment
```

### AMD SEV Setup

```bash
# Check SEV support
dmesg | grep -i sev

# Enable SEV in kernel
echo "options kvm_amd sev=1" | sudo tee /etc/modprobe.d/kvm_amd.conf

# Reload KVM module
sudo modprobe -r kvm_amd
sudo modprobe kvm_amd

# Verify SEV is enabled
cat /sys/module/kvm_amd/parameters/sev
```

### OP-TEE Setup

```bash
# Build OP-TEE
cd optee
make toolchains
make all

# Install OP-TEE client
sudo make install

# Start OP-TEE services
sudo systemctl enable tee-supplicant
sudo systemctl start tee-supplicant
```

## Testing Setup

### Run Hardware Tests

```bash
cd tests/hardware-security

# Run all tests
./run-hardware-tests.sh

# Run specific test suite
pytest test_tpm.py -v
pytest test_sgx.py -v
pytest test_sev.py -v
pytest test_optee.py -v
```

### Test Results

```bash
# View test results
cat test-results.xml

# View coverage report
cat coverage.xml
```

## Development Workflow

### 1. Code Changes

```bash
# Create feature branch
git checkout -b feature/hardware-security-enhancement

# Make changes
# ... edit files ...

# Run tests
cd tests/hardware-security
./run-hardware-tests.sh
```

### 2. Build Verification

```bash
# Build Yocto image
cd yocto
./build-yocto.sh

# Test in QEMU
runqemu qemuarm64 nographic
```

### 3. Commit and Push

```bash
# Add changes
git add .

# Commit with message
git commit -m "feat: enhance hardware security features"

# Push to branch
git push origin feature/hardware-security-enhancement
```

## Deployment

### Local Testing

```bash
# Build and test locally
docker-compose -f docker/docker-compose.yml up --build

# Run integration tests
docker-compose -f docker/docker-compose.yml exec hardware-ci \
    bash -c "cd tests/hardware-security && ./run-hardware-tests.sh"
```

### CI/CD Pipeline

The GitLab CI pipeline automatically:
1. Validates configuration
2. Builds Yocto images
3. Runs hardware tests
4. Deploys to staging
5. Performs security audits

### Production Deployment

```bash
# Tag release
git tag v1.0.0

# Push tags
git push origin --tags

# CI/CD handles deployment
```

## Troubleshooting

### Build Issues

#### Yocto Build Fails

```bash
# Clear caches
cd yocto
rm -rf build-*/tmp/ build-*/sstate-cache/

# Rebuild
./build-yocto.sh
```

#### Out of Disk Space

```bash
# Clean Docker
docker system prune -a

# Clean Yocto
cd yocto
rm -rf build-*/downloads/ build-*/sstate-cache/
```

### Hardware Issues

#### TPM Not Detected

```bash
# Check device
ls -la /dev/tpm*

# Check kernel modules
lsmod | grep tpm

# Load modules
sudo modprobe tpm_tis
sudo modprobe tpm_crb
```

#### SGX Not Working

```bash
# Check SGX support
cpuid | grep -i sgx

# Check BIOS settings
# Enable SGX in BIOS

# Check kernel
dmesg | grep -i sgx
```

#### SEV Not Enabled

```bash
# Check CPU support
cat /proc/cpuinfo | grep -i sev

# Enable in BIOS
# Set SVM Mode to Enabled

# Check kernel parameters
cat /proc/cmdline | grep sev
```

### Docker Issues

#### Permission Denied

```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### Container Won't Start

```bash
# Check logs
docker-compose -f docker/docker-compose.yml logs

# Rebuild containers
docker-compose -f docker/docker-compose.yml build --no-cache
```

## Support

### Documentation

- [Yocto Project Documentation](https://docs.yoctoproject.org/)
- [TPM 2.0 Specification](https://trustedcomputinggroup.org/resource/tpm-2-0-mobile-reference-architecture/)
- [Intel SGX Documentation](https://software.intel.com/content/www/us/en/develop/topics/software-guard-extensions.html)
- [AMD SEV Documentation](https://developer.amd.com/sev/)
- [OP-TEE Documentation](https://optee.readthedocs.io/)

### Getting Help

1. Check existing issues on GitHub
2. Review documentation in docs/
3. Create a new issue with detailed information
4. Contact the development team

### Security Issues

Report security vulnerabilities privately to security@atonixcorp.com

# Hardware Integration Troubleshooting Guide

This guide helps diagnose and resolve common issues with the AtonixCorp hardware integration.

## Quick Diagnosis

### System Health Check

```bash
# Run comprehensive health check
cd atonix-hardware-integration
./scripts/health-check.sh
```

This script checks:
- Hardware security module availability
- Docker environment status
- Yocto build environment
- Test suite integrity

### Log Collection

```bash
# Collect all logs
./scripts/collect-logs.sh

# View recent errors
journalctl -u docker -n 50
journalctl -u containerd -n 50
dmesg | tail -50
```

## Yocto Build Issues

### Build Fails with "No space left on device"

**Symptoms:**
- Build stops with disk space errors
- `df -h` shows low disk space

**Solutions:**

```bash
# Check disk usage
df -h

# Clean Yocto build cache
cd yocto
rm -rf build-*/tmp/ build-*/sstate-cache/

# Clean Docker
docker system prune -a -f

# Restart with clean build
./build-yocto.sh
```

### BitBake Fails with "ParseError"

**Symptoms:**
- Configuration syntax errors
- Layer dependency issues

**Solutions:**

```bash
# Check layer configuration
cd yocto
bitbake-layers show-layers

# Validate configuration
bitbake -p

# Check for syntax errors
python3 -m py_compile conf/local.conf
python3 -m py_compile conf/bblayers.conf
```

### QEMU Fails to Start

**Symptoms:**
- `runqemu` fails with KVM errors
- Permission denied on `/dev/kvm`

**Solutions:**

```bash
# Check KVM support
ls -la /dev/kvm

# Add user to KVM group
sudo usermod -aG kvm $USER
newgrp kvm

# Enable virtualization in BIOS
# Check BIOS settings for VT-x/AMD-V

# Restart system
sudo reboot
```

## Hardware Security Issues

### TPM Not Detected

**Symptoms:**
- `/dev/tpm*` devices not present
- TPM commands fail with "device not found"

**Diagnosis:**

```bash
# Check TPM devices
ls -la /dev/tpm*

# Check kernel modules
lsmod | grep tpm

# Check dmesg for TPM messages
dmesg | grep -i tpm

# Check TPM version
cat /sys/class/tpm/tpm0/tpm_version_major
```

**Solutions:**

```bash
# Load TPM modules
sudo modprobe tpm_tis
sudo modprobe tpm_crb

# For TPM 2.0
sudo modprobe tpm_tis_core
sudo modprobe tpm_tis

# Make modules persistent
echo "tpm_tis" | sudo tee /etc/modules-load.d/tpm.conf
echo "tpm_crb" | sudo tee -a /etc/modules-load.d/tpm.conf

# Check BIOS settings
# Enable TPM in BIOS
# Set TPM to 2.0 mode if available
```

### TPM Commands Fail

**Symptoms:**
- `tpm2_*` commands return errors
- "TPM not initialized" messages

**Solutions:**

```bash
# Start TPM resource manager
sudo systemctl start tpm2-abrmd

# Initialize TPM (destructive)
tpm2_startup -c -T device

# Clear TPM (if locked)
tpm2_clear -T device

# Check TPM status
tpm2_selftest -T device
tpm2_getrandom -T device 4
```

### SGX Not Working

**Symptoms:**
- SGX enclaves fail to create
- "SGX not supported" errors

**Diagnosis:**

```bash
# Check CPU support
grep sgx /proc/cpuinfo

# Check kernel support
dmesg | grep sgx

# Check SGX device
ls -la /dev/sgx*

# Check BIOS settings
# SGX must be enabled in BIOS
```

**Solutions:**

```bash
# Install SGX drivers
sudo apt-get install linux-image-generic-hwe-20.04

# Load SGX modules
sudo modprobe isgx

# Make persistent
echo "isgx" | sudo tee /etc/modules-load.d/sgx.conf

# Install SGX SDK/PSW
# Download from Intel website
# Run installer as root
```

### AMD SEV Issues

**Symptoms:**
- SEV VMs fail to start
- "SEV not supported" errors

**Diagnosis:**

```bash
# Check CPU support
grep sev /proc/cpuinfo

# Check kernel parameters
cat /proc/cmdline | grep sev

# Check KVM module parameters
cat /sys/module/kvm_amd/parameters/sev
```

**Solutions:**

```bash
# Enable SEV in kernel
echo "options kvm_amd sev=1" | sudo tee /etc/modprobe.d/kvm_amd.conf

# Reload KVM module
sudo modprobe -r kvm_amd
sudo modprobe kvm_amd

# Check BIOS settings
# Enable SVM (AMD virtualization)
# Enable SEV if available

# Restart system
sudo reboot
```

### OP-TEE Not Available

**Symptoms:**
- OP-TEE commands fail
- `/dev/tee*` not present

**Diagnosis:**

```bash
# Check TEE devices
ls -la /dev/tee*

# Check OP-TEE service
sudo systemctl status tee-supplicant

# Check kernel modules
lsmod | grep optee
```

**Solutions:**

```bash
# Start OP-TEE service
sudo systemctl enable tee-supplicant
sudo systemctl start tee-supplicant

# Load OP-TEE modules
sudo modprobe optee
sudo modprobe optee_armtz

# Make persistent
echo "optee" | sudo tee /etc/modules-load.d/optee.conf
echo "optee_armtz" | sudo tee -a /etc/modules-load.d/optee.conf
```

## Docker Issues

### Container Won't Start

**Symptoms:**
- `docker-compose up` fails
- Permission denied errors

**Diagnosis:**

```bash
# Check Docker service
sudo systemctl status docker

# Check user permissions
groups $USER | grep docker

# Check Docker logs
sudo journalctl -u docker -n 50
```

**Solutions:**

```bash
# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Restart Docker daemon
sudo systemctl restart docker
```

### Container Build Fails

**Symptoms:**
- `docker build` fails with various errors
- Network or package download issues

**Solutions:**

```bash
# Clear Docker cache
docker system prune -a -f

# Rebuild without cache
docker-compose build --no-cache

# Check network connectivity
ping google.com

# Check proxy settings if behind corporate proxy
# Set HTTP_PROXY and HTTPS_PROXY environment variables
```

### Volume Mount Issues

**Symptoms:**
- Files not accessible in containers
- Permission denied on mounted volumes

**Solutions:**

```bash
# Check file permissions
ls -la /path/to/host/directory

# Fix permissions
sudo chown -R $USER:$USER /path/to/host/directory

# Check SELinux/AppArmor
# Disable if causing issues (not recommended for production)
sudo setenforce 0  # SELinux
sudo systemctl stop apparmor  # AppArmor
```

## Testing Issues

### Tests Fail with Import Errors

**Symptoms:**
- Python import errors
- Module not found errors

**Solutions:**

```bash
# Install dependencies
pip3 install -r requirements.txt

# Check Python path
python3 -c "import sys; print(sys.path)"

# Install in development mode
pip3 install -e .
```

### Hardware Tests Fail

**Symptoms:**
- Tests skip with "hardware not available"
- Test failures due to missing devices

**Solutions:**

```bash
# Run tests with verbose output
pytest -v -s

# Check test configuration
cat tests/hardware-security/config.yaml

# Run specific test with debug
pytest test_tpm.py::test_basic_functionality -v -s

# Use simulators for testing
export USE_SIMULATORS=1
./run-hardware-tests.sh
```

### Test Results Not Generated

**Symptoms:**
- No test output files
- CI/CD fails to find results

**Solutions:**

```bash
# Check test output directory
ls -la test-results/

# Run tests with output
pytest --junitxml=test-results.xml --cov-report=xml

# Check permissions
sudo chown -R $USER:$USER test-results/
```

## CI/CD Issues

### Pipeline Fails at Build Stage

**Symptoms:**
- GitLab CI build stage fails
- Docker build errors in pipeline

**Solutions:**

```bash
# Test build locally
docker build -f docker/Dockerfile .

# Check GitLab runner
sudo gitlab-runner status

# Clear runner cache
sudo gitlab-runner cache clean

# Check pipeline configuration
gitlab-ci-pipelines lint .gitlab-ci.yml
```

### Pipeline Fails at Test Stage

**Symptoms:**
- Tests pass locally but fail in CI
- Environment differences

**Solutions:**

```bash
# Run tests in same environment as CI
docker run --rm -it registry.gitlab.com/atonixcorp/hardware-ci:latest \
    bash -c "cd tests/hardware-security && ./run-hardware-tests.sh"

# Check environment variables
env | grep CI

# Compare local vs CI environment
diff <(env | sort) <(docker run --rm registry.gitlab.com/atonixcorp/hardware-ci:latest env | sort)
```

## Performance Issues

### Slow Yocto Builds

**Symptoms:**
- Builds take excessively long
- High CPU/memory usage

**Solutions:**

```bash
# Increase parallel jobs
# Edit conf/local.conf
BB_NUMBER_THREADS = "8"
PARALLEL_MAKE = "8"

# Use shared state cache
# Configure SSTATE_DIR and DL_DIR for shared storage

# Enable build history
# INHERIT += "buildhistory"
# BUILDHISTORY_COMMIT = "1"
```

### High Memory Usage

**Symptoms:**
- System runs out of memory during builds
- OOM killer terminates processes

**Solutions:**

```bash
# Check memory usage
free -h

# Reduce parallel jobs
BB_NUMBER_THREADS = "2"
PARALLEL_MAKE = "2"

# Add swap space
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Security Issues

### Permission Denied on Security Devices

**Symptoms:**
- Access denied to `/dev/tpm*`, `/dev/sgx*`
- Security operations fail

**Solutions:**

```bash
# Check device permissions
ls -la /dev/tpm0

# Add user to security groups
sudo usermod -aG tss $USER  # TPM
sudo usermod -aG sgx $USER  # SGX

# Create udev rules for persistent permissions
# /etc/udev/rules.d/99-hardware-security.rules
SUBSYSTEM=="tpm", MODE="0660", GROUP="tss"
SUBSYSTEM=="sgx", MODE="0660", GROUP="sgx"

# Reload udev rules
sudo udevadm control --reload-rules
sudo udevadm trigger
```

### Certificate Validation Failures

**Symptoms:**
- TLS/SSL certificate errors
- Remote attestation failures

**Solutions:**

```bash
# Update CA certificates
sudo apt-get install ca-certificates
sudo update-ca-certificates

# Check certificate validity
openssl s_client -connect attestation.intel.com:443

# Update SGX certificates
# Download latest from Intel
```

## Network Issues

### Download Failures

**Symptoms:**
- Package downloads fail
- Network timeouts

**Solutions:**

```bash
# Check network connectivity
ping 8.8.8.8

# Configure proxy if needed
export http_proxy=http://proxy.company.com:8080
export https_proxy=http://proxy.company.com:8080

# Configure in Docker
# Edit ~/.docker/config.json
{
  "proxies": {
    "default": {
      "httpProxy": "http://proxy.company.com:8080",
      "httpsProxy": "http://proxy.company.com:8080"
    }
  }
}
```

### Firewall Issues

**Symptoms:**
- Connection refused errors
- Port blocking

**Solutions:**

```bash
# Check firewall status
sudo ufw status
sudo iptables -L

# Allow necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 2376/tcp  # Docker
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Disable firewall temporarily for testing
sudo ufw disable
```

## Advanced Debugging

### Kernel Debugging

```bash
# Enable kernel debug logging
echo "module tpm +p" | sudo tee /sys/kernel/debug/dynamic_debug/control
echo "module sgx +p" | sudo tee /sys/kernel/debug/dynamic_debug/control

# View kernel logs
dmesg -w

# Check kernel config
zcat /proc/config.gz | grep -i tpm
zcat /proc/config.gz | grep -i sgx
zcat /proc/config.gz | grep -i sev
```

### Hardware Debugging

```bash
# Use hardware debug tools
lspci -v | grep -i tpm
lspci -v | grep -i sgx
lsusb -v | grep -i tpm

# Check ACPI tables
sudo apt-get install acpica-tools
acpidump > acpi.dat
acpixtract -a acpi.dat
iasl -d *.dat
```

### Core Dump Analysis

```bash
# Enable core dumps
ulimit -c unlimited
echo "core.%e.%p.%t" | sudo tee /proc/sys/kernel/core_pattern

# Analyze core dump
gdb /path/to/binary /path/to/core
```

## Getting Help

### Information to Provide

When reporting issues, include:

1. **System Information:**
   ```bash
   uname -a
   lsb_release -a
   free -h
   df -h
   ```

2. **Hardware Information:**
   ```bash
   lscpu
   lspci -v
   lsmod
   ```

3. **Logs:**
   ```bash
   journalctl -u docker --since "1 hour ago"
   dmesg | tail -100
   ```

4. **Configuration Files:**
   - `conf/local.conf`
   - `conf/bblayers.conf`
   - `docker-compose.yml`
   - `.gitlab-ci.yml`

5. **Error Messages:**
   - Exact error output
   - Steps to reproduce
   - Expected vs actual behavior

### Support Channels

1. **GitHub Issues:** For bugs and feature requests
2. **Documentation:** Check docs/ directory
3. **Community Forum:** For general questions
4. **Enterprise Support:** For urgent production issues

### Emergency Contacts

- **Security Issues:** security@atonixcorp.com
- **Production Down:** urgent@atonixcorp.com
- **General Support:** support@atonixcorp.com

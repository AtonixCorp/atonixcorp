#!/bin/bash
# AtonixCorp Hardware Integration - Yocto Build Script
# This script sets up and builds Yocto for AtonixCorp hardware platforms

set -e

# Configuration
YOCTO_VERSION="kirkstone"
MACHINE="qemuarm64"
BUILD_DIR="build-${MACHINE}"
DOWNLOAD_DIR="${HOME}/yocto-downloads"
SSTATE_DIR="${HOME}/yocto-sstate"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check for required packages
    REQUIRED_PACKAGES="git cmake g++ gcc make pkg-config subversion chrpath cpio python3 python3-pip python3-pexpect xz-utils debianutils iputils-ping python3-git python3-jinja2 libegl1-mesa libsdl1.2-dev pylint3 xterm python3-subunit mesa-common-dev"

    for pkg in $REQUIRED_PACKAGES; do
        if ! dpkg -l | grep -q "^ii  $pkg"; then
            log_error "Missing package: $pkg"
            log_info "Install with: sudo apt-get install $pkg"
            exit 1
        fi
    done

    # Check for git-lfs
    if ! command -v git-lfs &> /dev/null; then
        log_error "git-lfs is not installed"
        log_info "Install with: sudo apt-get install git-lfs"
        exit 1
    fi

    log_info "Prerequisites check passed"
}

# Setup Yocto environment
setup_yocto() {
    log_info "Setting up Yocto environment..."

    # Create directories
    mkdir -p $DOWNLOAD_DIR
    mkdir -p $SSTATE_DIR

    # Clone Poky (Yocto reference distribution)
    if [ ! -d "poky" ]; then
        log_info "Cloning Poky..."
        git clone -b $YOCTO_VERSION git://git.yoctoproject.org/poky.git
    else
        log_info "Poky already exists, updating..."
        cd poky
        git checkout $YOCTO_VERSION
        git pull
        cd ..
    fi

    # Clone meta layers
    META_LAYERS=(
        "git://git.openembedded.org/meta-openembedded"
        "git://git.yoctoproject.org/meta-raspberrypi"
        "git://git.yoctoproject.org/meta-security"
        "https://github.com/AtonixCorp/meta-atonix-hardware.git"
    )

    for meta_url in "${META_LAYERS[@]}"; do
        meta_name=$(basename "$meta_url" .git)
        if [ ! -d "$meta_name" ]; then
            log_info "Cloning $meta_name..."
            git clone "$meta_url"
        fi
    done

    log_info "Yocto environment setup complete"
}

# Initialize build environment
init_build() {
    log_info "Initializing build environment..."

    cd poky

    # Source the build environment
    source oe-init-build-env $BUILD_DIR

    # Configure build
    cat > conf/local.conf << EOF
# AtonixCorp Hardware Integration Build Configuration

MACHINE = "${MACHINE}"
DISTRO = "atonix-hardware"

# Parallel build settings
BB_NUMBER_THREADS = "8"
PARALLEL_MAKE = "-j 8"

# Download and sstate directories
DL_DIR = "${DOWNLOAD_DIR}"
SSTATE_DIR = "${SSTATE_DIR}"

# Enable security features
DISTRO_FEATURES:append = " systemd security"
DISTRO_FEATURES:remove = " sysvinit"

# AtonixCorp specific features
DISTRO_FEATURES:append = " atonix-hardware tpm2 sgx sev optee trustzone"

# Kernel configuration
KERNEL_FEATURES:append = " features/security/security.scc"

# Package management
PACKAGE_CLASSES = "package_rpm"

# Image features
IMAGE_FEATURES:append = " ssh-server-openssh"
IMAGE_FEATURES:append = " debug-tweaks"

# Extra packages for hardware integration
IMAGE_INSTALL:append = " \
    tpm2-tools \
    tpm2-abrmd \
    tpm2-tss \
    intel-sgx-sdk \
    amd-sev \
    optee-client \
    optee-os \
    trustzone-tools \
    atonix-hardware-support \
"

EOF

    # Configure bblayers.conf
    cat > conf/bblayers.conf << EOF
# AtonixCorp Hardware Integration Layer Configuration

BBPATH = "\${TOPDIR}"
BBFILES ?= ""

BBLAYERS ?= " \\
  \${TOPDIR}/../meta \\
  \${TOPDIR}/../meta-poky \\
  \${TOPDIR}/../meta-yocto-bsp \\
  \${TOPDIR}/../meta-openembedded/meta-oe \\
  \${TOPDIR}/../meta-openembedded/meta-python \\
  \${TOPDIR}/../meta-openembedded/meta-networking \\
  \${TOPDIR}/../meta-openembedded/meta-filesystems \\
  \${TOPDIR}/../meta-raspberrypi \\
  \${TOPDIR}/../meta-security \\
  \${TOPDIR}/../meta-atonix-hardware \\
  "

EOF

    cd ..
    log_info "Build environment initialized"
}

# Build image
build_image() {
    log_info "Building AtonixCorp hardware image..."

    cd poky/$BUILD_DIR

    # Build core-image-minimal with hardware support
    bitbake core-image-atonix-hardware

    # Build SDK for development
    bitbake core-image-atonix-hardware -c populate_sdk

    cd ../..
    log_info "Image build complete"
}

# Main execution
main() {
    log_info "Starting AtonixCorp Hardware Integration Yocto Build"

    check_prerequisites
    setup_yocto
    init_build
    build_image

    log_info "AtonixCorp Hardware Integration build completed successfully!"
    log_info "Output images are available in: poky/$BUILD_DIR/tmp/deploy/images/$MACHINE/"
    log_info "SDK is available in: poky/$BUILD_DIR/tmp/deploy/sdk/"
}

# Run main function
main "$@"

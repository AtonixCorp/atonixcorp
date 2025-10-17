#!/bin/bash
# AtonixCorp Hardware Integration Docker Entrypoint

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Setup environment
setup_environment() {
    log_info "Setting up hardware integration environment..."

    # Create necessary directories
    mkdir -p /workspace/yocto/downloads
    mkdir -p /workspace/yocto/sstate-cache
    mkdir -p /workspace/reports
    mkdir -p /workspace/coverage

    # Set environment variables
    export YOCTO_DOWNLOAD_DIR="/workspace/yocto/downloads"
    export YOCTO_SSTATE_DIR="/workspace/yocto/sstate-cache"
    export TEST_RESULTS_DIR="/workspace/reports"
    export COVERAGE_DIR="/workspace/coverage"

    log_success "Environment setup complete"
}

# Configure Docker in Docker
setup_dind() {
    if [ -n "$DOCKER_HOST" ]; then
        log_info "Docker-in-Docker detected, configuring..."

        # Wait for Docker daemon to be ready
        while ! docker info >/dev/null 2>&1; do
            log_warning "Waiting for Docker daemon..."
            sleep 1
        done

        log_success "Docker daemon ready"
    fi
}

# Setup Git LFS
setup_git_lfs() {
    log_info "Setting up Git LFS..."

    if command -v git-lfs >/dev/null 2>&1; then
        git lfs install
        log_success "Git LFS configured"
    else
        log_warning "Git LFS not available"
    fi
}

# Main setup
main() {
    log_info "Starting AtonixCorp Hardware Integration Container"

    setup_environment
    setup_dind
    setup_git_lfs

    log_success "Container ready for hardware integration tasks"

    # Execute the command passed to the container
    exec "$@"
}

main "$@"

#!/bin/bash

# Generate Concourse keys for secure communication
set -e

KEYS_DIR="./config/keys"

echo "Generating Concourse keys..."

# Create keys directory
mkdir -p "$KEYS_DIR"

# Generate session signing key
ssh-keygen -t rsa -f "$KEYS_DIR/session_signing_key" -N '' -C "concourse-session-signing"

# Generate TSA host key
ssh-keygen -t rsa -f "$KEYS_DIR/tsa_host_key" -N '' -C "concourse-tsa-host"

# Generate worker key
ssh-keygen -t rsa -f "$KEYS_DIR/worker_key" -N '' -C "concourse-worker"

# Create authorized keys file for workers
cp "$KEYS_DIR/worker_key.pub" "$KEYS_DIR/authorized_worker_keys"

echo "Keys generated successfully in $KEYS_DIR/"
echo ""
echo "Generated files:"
echo "- session_signing_key (private)"
echo "- session_signing_key.pub (public)"
echo "- tsa_host_key (private)"
echo "- tsa_host_key.pub (public)"
echo "- worker_key (private)"
echo "- worker_key.pub (public)"
echo "- authorized_worker_keys"

# Set proper permissions
chmod 600 "$KEYS_DIR"/*
chmod 644 "$KEYS_DIR"/*.pub "$KEYS_DIR/authorized_worker_keys"

echo ""
echo "Permissions set correctly."
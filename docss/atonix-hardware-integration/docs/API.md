# Hardware Integration API Documentation

This document describes the APIs and interfaces for interacting with hardware security features in the AtonixCorp platform.

## Overview

The hardware integration provides APIs for:

- **TPM Operations**: Key management, signing, encryption
- **SGX Enclaves**: Trusted execution environments
- **SEV VMs**: Encrypted virtual machines
- **OP-TEE**: Trusted applications and secure storage
- **TrustZone**: Secure world operations

## TPM 2.0 API

### Key Management

#### Create Primary Key

```python
from atonixcorp.hardware.tpm import TPMManager

tpm = TPMManager()
primary_key = tpm.create_primary_key(
    algorithm="RSA",
    key_size=2048,
    persistent_handle=0x81000000
)
```

#### Generate Key Pair

```python
key_pair = tpm.generate_key_pair(
    parent_handle=primary_key.handle,
    algorithm="ECC",
    curve="NIST_P256",
    persistent_handle=0x81000001
)
```

#### Load Key

```python
loaded_key = tpm.load_key(
    parent_handle=primary_key.handle,
    private_blob=key_pair.private_blob,
    public_blob=key_pair.public_blob
)
```

### Cryptographic Operations

#### Sign Data

```python
signature = tpm.sign(
    key_handle=loaded_key.handle,
    data=b"Hello, World!",
    scheme="RSASSA"
)
```

#### Verify Signature

```python
is_valid = tpm.verify_signature(
    key_handle=loaded_key.handle,
    data=b"Hello, World!",
    signature=signature,
    scheme="RSASSA"
)
```

#### Encrypt Data

```python
encrypted_data = tpm.encrypt(
    key_handle=loaded_key.handle,
    data=b"Secret message",
    mode="CFB"
)
```

#### Decrypt Data

```python
decrypted_data = tpm.decrypt(
    key_handle=loaded_key.handle,
    encrypted_data=encrypted_data,
    mode="CFB"
)
```

### Platform Integrity

#### PCR Extend

```python
tpm.extend_pcr(
    pcr_index=0,
    data=b"Measurement data"
)
```

#### PCR Read

```python
pcr_value = tpm.read_pcr(pcr_index=0)
```

#### Quote PCRs

```python
quote = tpm.quote_pcrs(
    key_handle=loaded_key.handle,
    pcr_indices=[0, 1, 2, 3],
    qualifying_data=b"Nonce"
)
```

## Intel SGX API

### Enclave Creation

```python
from atonixcorp.hardware.sgx import SGXManager

sgx = SGXManager()

# Create enclave
enclave = sgx.create_enclave(
    enclave_file="secure_enclave.signed.so",
    debug=False
)
```

### Secure Calls

```python
# Call enclave function
result = sgx.ecall(
    enclave_id=enclave.id,
    function_id=1,
    input_data=b"Input data"
)
```

### Local Attestation

```python
# Generate report
report = sgx.create_report(
    enclave_id=enclave.id,
    target_info=target_enclave_info,
    report_data=b"Report data"
)

# Verify report
is_valid = sgx.verify_report(report)
```

### Remote Attestation

```python
# Get quote
quote = sgx.get_quote(
    enclave_id=enclave.id,
    spid="Service Provider ID",
    linkable=True
)

# Verify quote with IAS
verification_result = sgx.verify_quote_with_ias(
    quote=quote,
    ias_api_key="API Key"
)
```

## AMD SEV API

### VM Creation

```python
from atonixcorp.hardware.sev import SEVManager

sev = SEVManager()

# Create SEV-enabled VM
vm = sev.create_vm(
    memory_size=4096,  # MB
    vcpu_count=2,
    encrypted=True
)
```

### Key Management

```python
# Generate launch key
launch_key = sev.generate_launch_key()

# Measure VM
measurement = sev.measure_vm(vm.id)

# Inject launch secret
sev.inject_launch_secret(
    vm_id=vm.id,
    secret=b"Launch secret",
    header=b"Header"
)
```

### VM Operations

```python
# Start VM
sev.start_vm(vm.id)

# Get VM status
status = sev.get_vm_status(vm.id)

# Stop VM
sev.stop_vm(vm.id)
```

## OP-TEE API

### Trusted Application

```python
from atonixcorp.hardware.optee import OPTEEClient

optee = OPTEEClient()

# Open session with TA
session = optee.open_session(
    ta_uuid="12345678-1234-1234-1234-123456789abc"
)
```

### Secure Storage

```python
# Store data
optee.store_data(
    session_id=session.id,
    object_id=b"object_id",
    data=b"Secret data",
    flags=TEE_DATA_FLAG_ACCESS_WRITE |
          TEE_DATA_FLAG_ACCESS_READ |
          TEE_DATA_FLAG_SHARE_READ
)

# Load data
data = optee.load_data(
    session_id=session.id,
    object_id=b"object_id"
)
```

### Cryptographic Operations

```python
# Generate key
key = optee.generate_key(
    session_id=session.id,
    algorithm=TEE_ALG_RSA_PKCS1_SHA256,
    key_size=2048
)

# Sign data
signature = optee.sign(
    session_id=session.id,
    key_id=key.id,
    data=b"Data to sign"
)

# Verify signature
is_valid = optee.verify_signature(
    session_id=session.id,
    key_id=key.id,
    data=b"Data to sign",
    signature=signature
)
```

## ARM TrustZone API

### Secure World Calls

```python
from atonixcorp.hardware.trustzone import TrustZoneClient

tz = TrustZoneClient()

# SMC call
result = tz.smc_call(
    function_id=0x1000,
    arg1=0x1234,
    arg2=0x5678,
    arg3=0x9abc,
    arg4=0xdef0
)
```

### Secure Storage

```python
# Store secure data
tz.store_secure_data(
    object_id="secure_object",
    data=b"Secure data",
    flags=TZ_DATA_FLAG_ENCRYPTED
)

# Load secure data
data = tz.load_secure_data(object_id="secure_object")
```

## Common API Patterns

### Error Handling

```python
try:
    result = tpm.sign(key_handle, data)
except TPMError as e:
    if e.code == TPM_RC_BAD_TAG:
        # Handle invalid key
        pass
    elif e.code == TPM_RC_SIGNATURE:
        # Handle signature failure
        pass
    else:
        raise
```

### Asynchronous Operations

```python
import asyncio

async def async_operation():
    # Start operation
    operation_id = await tpm.start_async_sign(key_handle, data)

    # Wait for completion
    result = await tpm.wait_for_completion(operation_id)

    return result

# Usage
signature = asyncio.run(async_operation())
```

### Context Managers

```python
with TPMManager() as tpm:
    with tpm.create_primary_key() as primary:
        with tpm.generate_key_pair(primary.handle) as key_pair:
            signature = tpm.sign(key_pair.handle, data)
```

## Configuration

### TPM Configuration

```yaml
tpm:
  device: "/dev/tpm0"
  simulator: false
  owner_auth: "owner_password"
  endorsement_auth: "endorsement_password"
  lock_auth: "lock_password"
```

### SGX Configuration

```yaml
sgx:
  debug: false
  launch_token_path: "/var/lib/sgx/launch_token"
  ias_api_key: "Intel Attestation Service Key"
  spid: "Service Provider ID"
```

### SEV Configuration

```yaml
sev:
  policy: 0x01  # SEV policy flags
  cert_chain_path: "/etc/sev/cert_chain.pem"
  vcek_path: "/etc/sev/vcek.pem"
```

### OP-TEE Configuration

```yaml
optee:
  device: "/dev/tee0"
  ta_path: "/lib/optee_armtz"
  client_library: "/usr/lib/libteec.so"
```

## Security Considerations

### Key Management

- Use hardware-backed keys when possible
- Implement proper key rotation policies
- Store keys securely with appropriate permissions
- Use key wrapping for sensitive operations

### Access Control

- Implement role-based access control
- Use secure authentication mechanisms
- Log all security operations
- Implement rate limiting for cryptographic operations

### Audit Logging

```python
# Enable audit logging
tpm.enable_audit_logging(log_file="/var/log/tpm-audit.log")

# Log security events
tpm.log_event(
    event_type="KEY_ACCESS",
    key_handle=key.handle,
    operation="SIGN",
    result="SUCCESS"
)
```

## Performance Considerations

### TPM Operations

- Primary key creation: ~100ms
- Key generation: ~50ms
- Signing (RSA-2048): ~10ms
- PCR extend: ~5ms

### SGX Operations

- Enclave creation: ~200ms
- ECall: ~1-10ms
- Local attestation: ~50ms
- Remote attestation: ~500ms (network dependent)

### SEV Operations

- VM creation: ~1000ms
- Key injection: ~100ms
- VM startup: ~500ms

### OP-TEE Operations

- Session creation: ~10ms
- TA invocation: ~1-5ms
- Secure storage: ~5ms per operation

## Testing

### Unit Tests

```python
import pytest
from atonixcorp.hardware.tpm import TPMManager

class TestTPMManager:
    def test_create_primary_key(self):
        with TPMManager() as tpm:
            key = tpm.create_primary_key()
            assert key.handle is not None

    def test_sign_verify(self):
        with TPMManager() as tpm:
            primary = tpm.create_primary_key()
            key_pair = tpm.generate_key_pair(primary.handle)

            data = b"Test data"
            signature = tpm.sign(key_pair.handle, data)
            is_valid = tpm.verify_signature(key_pair.handle, data, signature)

            assert is_valid
```

### Integration Tests

```python
def test_full_workflow():
    # Test complete hardware security workflow
    with TPMManager() as tpm, SGXManager() as sgx:
        # Create keys
        primary = tpm.create_primary_key()
        key_pair = tpm.generate_key_pair(primary.handle)

        # Create enclave
        enclave = sgx.create_enclave("test_enclave.signed.so")

        # Perform secure operation
        result = sgx.ecall(enclave.id, 1, b"test input")

        # Sign result
        signature = tpm.sign(key_pair.handle, result)

        assert signature is not None
```

## Troubleshooting

### Common Issues

#### TPM Device Not Found

```python
# Check device
ls -la /dev/tpm*

# Check kernel modules
lsmod | grep tpm

# Load modules manually
sudo modprobe tpm_tis
sudo modprobe tpm_crb
```

#### SGX Not Supported

```python
# Check CPU support
grep sgx /proc/cpuinfo

# Check BIOS settings
# Enable SGX in BIOS

# Check kernel support
dmesg | grep sgx
```

#### SEV Not Enabled

```python
# Check CPU support
grep sev /proc/cpuinfo

# Check kernel parameters
cat /proc/cmdline | grep sev

# Enable SEV
echo "options kvm_amd sev=1" | sudo tee /etc/modprobe.d/kvm_amd.conf
sudo modprobe -r kvm_amd
sudo modprobe kvm_amd
```

#### OP-TEE Not Running

```python
# Check service status
sudo systemctl status tee-supplicant

# Start service
sudo systemctl start tee-supplicant

# Check device
ls -la /dev/tee*
```

## Version History

- **v1.0.0**: Initial release with TPM, SGX, SEV, OP-TEE support
- **v1.1.0**: Added TrustZone support and async operations
- **v1.2.0**: Improved error handling and audit logging
- **v2.0.0**: Major rewrite with improved performance and security

SUMMARY = "AtonixCorp Hardware Integration Package Group"
DESCRIPTION = "Package group containing all hardware integration components for AtonixCorp platforms"
LICENSE = "MIT"

inherit packagegroup

PACKAGES = " \
    packagegroup-atonix-hardware \
    packagegroup-atonix-hardware-security \
    packagegroup-atonix-hardware-tools \
"

RDEPENDS:packagegroup-atonix-hardware = " \
    packagegroup-atonix-hardware-security \
    packagegroup-atonix-hardware-tools \
"

RDEPENDS:packagegroup-atonix-hardware-security = " \
    tpm2-tools \
    tpm2-abrmd \
    tpm2-tss \
    intel-sgx-sdk \
    intel-sgx-psw \
    amd-sev \
    optee-client \
    optee-os \
    trustzone-tools \
    secure-boot-support \
    libtss2 \
    libtss2-tcti-device \
    libtss2-tcti-mssim \
    libtss2-tcti-swtpm \
"

RDEPENDS:packagegroup-atonix-hardware-tools = " \
    atonix-hardware-support \
    atonix-security-monitor \
    atonix-firmware-update \
    hardware-test-suite \
    security-audit-tools \
    firmware-update-manager \
"

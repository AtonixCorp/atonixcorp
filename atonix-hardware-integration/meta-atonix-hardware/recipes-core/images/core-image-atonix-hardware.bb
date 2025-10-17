SUMMARY = "AtonixCorp Hardware Integration Image"
DESCRIPTION = "Base image for AtonixCorp hardware platforms with security and integration features"
LICENSE = "MIT"

inherit core-image

# Base packages
IMAGE_INSTALL:append = " \
    packagegroup-core-boot \
    packagegroup-core-security \
    packagegroup-atonix-hardware \
"

# Hardware security packages
IMAGE_INSTALL:append = " \
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
"

# Development and debugging tools
IMAGE_INSTALL:append = " \
    openssh \
    openssh-sftp-server \
    gdb \
    strace \
    tcpdump \
    iperf3 \
    htop \
    vim \
    python3 \
    python3-pip \
"

# AtonixCorp specific packages
IMAGE_INSTALL:append = " \
    atonix-hardware-support \
    atonix-security-monitor \
    atonix-firmware-update \
"

# Image features
IMAGE_FEATURES:append = " \
    ssh-server-openssh \
    debug-tweaks \
    package-management \
    hardware-acceleration \
"

# Root filesystem size (in MB)
IMAGE_ROOTFS_SIZE = "8192"

# Bootloader configuration
IMAGE_BOOT_FILES = " \
    ${KERNEL_IMAGETYPE} \
    ${@make_dtb_boot_files(d)} \
"

# EFI support for secure boot
IMAGE_FSTYPES:append = " wic.vmdk wic.vdi"

# Post-processing commands
ROOTFS_POSTPROCESS_COMMAND += " \
    set_secure_boot; \
    configure_hardware_security; \
"

set_secure_boot() {
    # Configure secure boot settings
    if [ -f ${IMAGE_ROOTFS}/etc/default/grub ]; then
        sed -i 's/GRUB_CMDLINE_LINUX_DEFAULT="/GRUB_CMDLINE_LINUX_DEFAULT="security=selinux selinux=1 /g' ${IMAGE_ROOTFS}/etc/default/grub
    fi
}

configure_hardware_security() {
    # Configure TPM and security modules
    mkdir -p ${IMAGE_ROOTFS}/etc/atonix/hardware
    echo "HARDWARE_SECURITY_ENABLED=1" > ${IMAGE_ROOTFS}/etc/atonix/hardware/config
    echo "TPM_ENABLED=1" >> ${IMAGE_ROOTFS}/etc/atonix/hardware/config
    echo "SGX_ENABLED=1" >> ${IMAGE_ROOTFS}/etc/atonix/hardware/config
    echo "SEV_ENABLED=1" >> ${IMAGE_ROOTFS}/etc/atonix/hardware/config
}

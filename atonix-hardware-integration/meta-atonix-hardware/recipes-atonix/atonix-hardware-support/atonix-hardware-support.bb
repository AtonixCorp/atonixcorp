SUMMARY = "AtonixCorp Hardware Support Package"
DESCRIPTION = "Core hardware support utilities and drivers for AtonixCorp platforms"
LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://${COMMON_LICENSE_DIR}/MIT;md5=0835ade698e0bcf8506ecda2f7b4f302"

SRC_URI = " \
    file://hardware-detect.sh \
    file://hardware-config.service \
    file://atonix-hardware.conf \
"

S = "${WORKDIR}"

inherit systemd

SYSTEMD_SERVICE:${PN} = "hardware-config.service"

do_install() {
    install -d ${D}${bindir}
    install -d ${D}${sysconfdir}/atonix
    install -d ${D}${systemd_system_unitdir}

    # Install hardware detection script
    install -m 0755 ${WORKDIR}/hardware-detect.sh ${D}${bindir}/atonix-hardware-detect

    # Install configuration file
    install -m 0644 ${WORKDIR}/atonix-hardware.conf ${D}${sysconfdir}/atonix/

    # Install systemd service
    install -m 0644 ${WORKDIR}/hardware-config.service ${D}${systemd_system_unitdir}/
}

FILES:${PN} = " \
    ${bindir}/atonix-hardware-detect \
    ${sysconfdir}/atonix/atonix-hardware.conf \
    ${systemd_system_unitdir}/hardware-config.service \
"

RDEPENDS:${PN} = "bash systemd"

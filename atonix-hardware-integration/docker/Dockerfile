# AtonixCorp Hardware Integration CI Environment
FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Install base packages
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    git-lfs \
    curl \
    wget \
    python3 \
    python3-pip \
    python3-dev \
    openjdk-11-jdk \
    qemu-user-static \
    binfmt-support \
    debootstrap \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

# Install Yocto build dependencies
RUN apt-get update && apt-get install -y \
    gawk \
    wget \
    git-core \
    diffstat \
    unzip \
    texinfo \
    gcc-multilib \
    build-essential \
    chrpath \
    socat \
    cpio \
    python3-pexpect \
    xz-utils \
    debianutils \
    iputils-ping \
    python3-git \
    python3-jinja2 \
    libegl1-mesa \
    libsdl1.2-dev \
    pylint3 \
    xterm \
    python3-subunit \
    mesa-common-dev \
    && rm -rf /var/lib/apt/lists/*

# Install hardware security tools
RUN apt-get update && apt-get install -y \
    tpm2-tools \
    tpm2-abrmd \
    libtss2-dev \
    libtss2-tcti-device \
    libtss2-tcti-mssim \
    libtss2-tcti-swtpm \
    && rm -rf /var/lib/apt/lists/*

# Install testing tools
RUN pip3 install --no-cache-dir \
    pytest \
    pytest-cov \
    pytest-xdist \
    junit-xml \
    coverage \
    mock

# Install Node.js for frontend testing
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn

# Create workspace directory
RUN mkdir -p /workspace
WORKDIR /workspace

# Setup user
RUN useradd -m -s /bin/bash atonix \
    && chown -R atonix:atonix /workspace

USER atonix

# Set up Git LFS
RUN git lfs install

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

CMD ["/bin/bash"]

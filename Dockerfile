# Build stage
FROM nvcr.io/nvidia/nvhpc:25.1-devel-cuda_multi-ubuntu24.04 AS build

RUN apt-get update && \
    wget https://go.dev/dl/go1.19.linux-amd64.tar.gz && \
    tar -C /usr/local -xzf go1.19.linux-amd64.tar.gz && \
    rm go1.19.linux-amd64.tar.gz

ENV PATH="/usr/local/go/bin:$PATH"

RUN mkdir /source && \
    cd /source && \
    git clone https://github.com/UoB-HPC/CloverLeaf-OpenACC.git && \
    cd CloverLeaf-OpenACC && \
    make COMPILER=PGI FLAGS_PGI="-Mpreprocess -fast -acc -Minfo=acc -gpu=ccall -tp=px"

# Runtime stage
FROM nvcr.io/nvidia/nvhpc:25.1-runtime-cuda11.8-ubuntu22.04

COPY --from=build /source/CloverLeaf-OpenACC/clover_leaf /opt/CloverLeaf-OpenACC/bin/
COPY --from=build /source/CloverLeaf-OpenACC/InputDecks /opt/CloverLeaf-OpenACC/InputDecks

ENV PATH=/opt/CloverLeaf-OpenACC/bin:$PATH

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    openssh-server gnupg redis-server gcc arduino \
    mariadb-server postgresql apache2 libapache2-mod-wsgi-py3 nginx sudo \
    vim libssl-dev libffi-dev cargo net-tools curl iputils-ping build-essential \
    pkg-config libmariadb-dev-compat libmariadb-dev libpq-dev libxml2-dev python3-dev \
    python3-pip python3-setuptools python3-wheel postgresql-client && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean && \
    mkdir /var/run/sshd && \
    echo 'root:${ROOT_PASSWORD:-password}' | chpasswd && \
    sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config && \
    sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    sed -i 's/UsePAM yes/UsePAM no/' /etc/ssh/sshd_config

RUN curl -fsSL -o Miniconda3-latest-Linux-x86_64.sh https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh && \
    bash Miniconda3-latest-Linux-x86_64.sh -b -p /opt/conda && \
    rm Miniconda3-latest-Linux-x86_64.sh

ENV PATH="/opt/conda/bin:$PATH"

RUN conda config --set show_channel_urls yes && \
    conda config --add channels conda-forge && \
    conda config --add channels defaults && \
    conda config --set channel_priority strict && \
    conda update -n base -c defaults conda && \
    conda install -c conda-forge mamba && \
    mamba install -c conda-forge jupyterlab jupyterlab-git jupyterlab-lsp jupyterlab_code_formatter \
    jupyterlab-system-monitor jupyterlab-drawio jupyter xtensor-python

RUN pip install tensorflow && \
    pip install --upgrade pip setuptools wheel

COPY Quetzal/requirements.txt /app/Quetzal/
RUN pip install -r Quetzal/requirements.txt --use-deprecated=legacy-resolver

COPY Quetzal /app/Quetzal
COPY Quetzal/staticpyruns/sync_directories.py /app/Quetzal/staticpyruns/
COPY Quetzal/encryption/server_security.py /app/Quetzal/encryption/

RUN a2enmod wsgi

COPY start_services.sh /app/start_services.sh
RUN chmod +x /app/start_services.sh

COPY README.md /app/README.md
COPY db/mysql-init.sql /app/Quetzal/docker-entrypoint-initdb.d/
COPY db/postgres-init.sql /app/Quetzal/docker-entrypoint-initdb.d/
COPY Quetzal/init-db.sql /app/Quetzal/docker-entrypoint-initdb.d/
COPY Quetzal/go-dqlite-quetzal.go /app/Quetzal/docker-entrypoint-initdb.d/

EXPOSE 80 2222 6379 3306 5432 59876 5000 8888

CMD ["/app/start_services.sh"]
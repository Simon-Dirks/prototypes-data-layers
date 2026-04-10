FROM eclipse-temurin:21-jre

WORKDIR /app

# Install Jena
ENV JENA_HOME=/usr/local/bin/jena
ENV PATH=$PATH:$JENA_HOME/bin
ARG JENA_VERSION=6.0.0

# Releases: https://archive.apache.org/dist/jena/binaries/?C=M;O=D
RUN wget -q https://archive.apache.org/dist/jena/binaries/apache-jena-${JENA_VERSION}.tar.gz -O /tmp/jena.tar.gz && \
    tar -xzf /tmp/jena.tar.gz -C /tmp && \
    mkdir -p ${JENA_HOME} && \
    mv /tmp/apache-jena-${JENA_VERSION}/* ${JENA_HOME}

CMD ["bash"]

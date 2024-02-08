FROM alpine AS tailscale
RUN apk add --no-cache curl
ARG TARGETARCH
ARG TSVERSION=1.58.2
RUN curl -fSsLo /tmp/tailscale.tgz https://pkgs.tailscale.com/stable/tailscale_${TSVERSION}_${TARGETARCH}.tgz \
    && mkdir /out \
    && tar -C /out -xzf /tmp/tailscale.tgz --strip-components=1


FROM golang:1.21.4-alpine AS docker-router-builder

ENV CGO_ENABLED=0
WORKDIR /app
COPY vm/docker-router /app
RUN cd /app && \
    go mod download && \
    go build -mod=mod -o=/usr/bin/docker-router


FROM golang:1.21.4-alpine AS docker-router-builder

ENV CGO_ENABLED=0
WORKDIR /app
COPY vm/docker-router /app
RUN cd /app && \
    go mod download && \
    go build -mod=mod -o=/usr/bin/docker-router

FROM golang:1.21.4-alpine AS coredns-builder
ARG COREDNS_VERS=1.10.1
ARG PLUGIN_PRIO=50
ENV CGO_ENABLED=0
WORKDIR /app
RUN cd /app && \
    apk add git && \
    git clone https://github.com/coredns/coredns.git && \
    git clone https://github.com/kevinjqiu/coredns-dockerdiscovery.git && \
    cd coredns && \
    git checkout v${COREDNS_VERS} && \
    go mod download && \
    sed -i "s/^#.*//g; /^$/d; $PLUGIN_PRIO i docker:dockerdiscovery" plugin.cfg && \
    ls -l /app/ && \
    go mod edit -replace dockerdiscovery=/app/coredns-dockerdiscovery &&\
    go generate coredns.go && \
    go build -mod=mod -o=/usr/bin/coredns

FROM node:18.14-alpine AS ui-builder
WORKDIR /app/ui
# cache packages in layer
COPY ui/package.json /app/ui/package.json
COPY ui/yarn.lock /app/ui/yarn.lock
ARG TARGETARCH
RUN yarn config set cache-folder /usr/local/share/.cache/yarn-${TARGETARCH}
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn-${TARGETARCH} yarn
# install
COPY ui /app/ui
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn-${TARGETARCH} yarn build

FROM debian:bullseye-slim
ARG S6_OVERLAY_VERSION=3.1.6.2
ARG TARGETARCH
LABEL org.opencontainers.image.title="desktop-connector" \
    org.opencontainers.image.description="Desktop-connector lets you connect directly to your container from the desktop without exposing ports." \
    org.opencontainers.image.authors="ytcheng." \
    org.opencontainers.image.vendor="ytcheng." \
    com.docker.desktop.extension.icon="https://raw.githubusercontent.com/ytcheng/desktop-connector/main/connector.svg" \
    com.docker.desktop.extension.api.version=">=0.2.3" \
    com.docker.extension.screenshots='[{"alt": "main page", "url": "https://raw.githubusercontent.com/ytcheng/desktop-connector/main/screenshot/1.jpg"},{"alt": "setting page", "url": "https://raw.githubusercontent.com/ytcheng/desktop-connector/main/screenshot/2.jpg"}]' \
    com.docker.extension.detailed-description="The Desktop Connector is an extension based on Tailscale that provides additional functionality for your container connections and access. With the Desktop Connector, you can create a secure virtual private network and connect your containers to it within minutes. Any containers with exposed ports are accessible to other devices on the Tailscale network.\
    The Desktop Connector adds the following features on top of Tailscale:\
\
    Direct container-to-container connectivity: Connect to containers directly using their IP addresses without exposing ports.\
    Domain name allocation: Assign unique domain names to each container for easier communication between containers and accessing them from the desktop.\
    <h3>About Tailscale</h3> Tailscale is a zero-config VPN that can be installed on any device in minutes, manages firewall rules for you, and works from anywhere. Regardless of the number of firewalls or containerization layers between devices, Tailscale ensures reliable connectivity. With robust access control rules enforced on each device, users on your network can only access what they are authorized to.\
    For more details, please visit <a href="https://tailscale.com">tailscale.com</a>." \
    com.docker.extension.publisher-url="https://github.com/ytcheng"\
    com.docker.extension.additional-urls='[{"title":"Website","url":"https://github.com/ytcheng/desktop-connector"}]'\
    com.docker.extension.categories="networking"\
    com.docker.extension.changelog="<p>Extension changelog<ul> <li>New feature A</li> <li>Bug fix on feature B</li></ul></p>"
RUN apt-get update \
    && apt-get install -y \
    ca-certificates \
    iptables \
    iproute2 \
    iputils-ping\
    net-tools\ 
    procps \
    inotify-tools \
    xz-utils \
    curl \
    && rm -rf /var/lib/apt/lists/*

ADD https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-noarch.tar.xz /tmp
RUN tar -C / -Jxpf /tmp/s6-overlay-noarch.tar.xz && rm /tmp/s6-overlay-noarch.tar.xz
RUN if [ "$TARGETARCH" = "arm" ] ||  [ "$TARGETARCH" = "arm64" ]; then \
        curl -fSsLo /tmp/s6-overlay-arm.tar.xz https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-arm.tar.xz &&\
        tar -C / -Jxpf /tmp/s6-overlay-arm.tar.xz &&\
        rm  /tmp/s6-overlay-arm.tar.xz;  \
    else \
        curl -fSsLo /tmp/s6-overlay-x86_64.tar.xz https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-x86_64.tar.xz &&\
        tar -C / -Jxpf /tmp/s6-overlay-x86_64.tar.xz &&\
        rm /tmp/s6-overlay-x86_64.tar.xz;  \
    fi
# ADD https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-arm.tar.xz /tmp
# RUN tar -C / -Jxpf /tmp/s6-overlay-arm.tar.xz
ADD https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-symlinks-noarch.tar.xz /tmp
RUN tar -C / -Jxpf /tmp/s6-overlay-symlinks-noarch.tar.xz && rm /tmp/s6-overlay-symlinks-noarch.tar.xz
ADD https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-symlinks-arch.tar.xz /tmp
RUN tar -C / -Jxpf /tmp/s6-overlay-symlinks-arch.tar.xz && rm /tmp/s6-overlay-symlinks-arch.tar.xz
ENTRYPOINT ["/init"]
COPY vm/root /
COPY --from=tailscale /out/tailscale /app/tailscale
COPY --from=tailscale /out/tailscaled /app/tailscaled
COPY --from=ui-builder /app/ui/dist ui
COPY connector.svg .
COPY metadata.json .
# COPY background-output.sh /app/background-output.sh
# COPY wait-for-exit.sh /app/wait-for-exit.sh
COPY vm/docker-compose.yaml .
COPY host/hostname darwin/hostname
COPY host/hostname.cmd windows/hostname.cmd
COPY host/hostname.sh linux/hostname.sh
COPY host/host-tailscale darwin/host-tailscale
COPY host/host-tailscale.cmd windows/host-tailscale.cmd
COPY host/host-tailscale.sh linux/host-tailscale.sh
COPY --from=coredns-builder /usr/bin/coredns /usr/bin/coredns
COPY --from=docker-router-builder  /usr/bin/docker-router /usr/bin/docker-router
ENV TS_HOST_ENV dde
# CMD /app/tailscaled --state=/var/lib/tailscale/tailscaled.state --tun=userspace-networking

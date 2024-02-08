#!/bin/bash
generate_dns_confs () {
    # mkdir -p /config/coredns

    if [[ -z "$DOMAIN_NAME" ]] ; then
        DOMAIN_NAME="loc"
    fi
    if [[ -z "$HOSTNAME_DOMAIN_NAME" ]] ; then
        HOSTNAME_DOMAIN_NAME="loc"
    fi
    if [[ -z "$LABEL_NAME" ]] ; then
        LABEL_NAME="coredns.dockerdiscovery.host"
    fi
    if [[ -z "$DOCKER_NETWORK" ]] ; then
        DOCKER_NETWORK="\"\""
    fi
    if [[ -z "$COMPOSE_DOMAIN_NAME" ]] ; then
        COMPOSE_DOMAIN_NAME="loc"
    fi
    eval "$(printf %s)
    cat <<DUDE > /config/coredns/Corefile
$(cat /config/coredns/Corefile.template)

DUDE"
}

for arg in "$@"; do
    case "$arg" in
        --label=*)
            label="${arg#*=}"
            LABEL_NAME=$label
            echo "label  value: $label"
            ;;
        --suffix=*)
            suffix="${arg#*=}"
            COMPOSE_DOMAIN_NAME=$suffix
            DOMAIN_NAME=$suffix
            HOSTNAME_DOMAIN_NAME=$suffix
            DOCKER_NETWORK=""
            echo "suffix value: $suffix"
            ;;
        *)
            # 处理其他未知参数
            echo "Unknown argument: $arg"
            ;;
    esac
done

cat <<DUDE > /config/.corednsconfigfile
DOMAIN_NAME="$DOMAIN_NAME"
HOSTNAME_DOMAIN_NAME="$HOSTNAME_DOMAIN_NAME"
LABEL_NAME="$LABEL_NAME"
DOCKER_NETWORK="$DOCKER_NETWORK"
COMPOSE_DOMAIN_NAME="$COMPOSE_DOMAIN_NAME"
DUDE
. /config/.corednsconfigfile
generate_dns_confs
/usr/bin/s6-svc -t /run/service/svc-coredns


#!/bin/bash

TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" \
  --connect-timeout 2 --max-time 5)

set_env_var() {
  local key="$1" value="$2" file="$3"
  if grep -q "^${key}=" "${file}" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${value}|" "${file}"
  else
    echo "${key}=${value}" >> "${file}"
  fi
}

FALLBACK_ID="$(hostname 2>/dev/null || echo "unknown")"

if [ -z "${TOKEN}" ]; then
  echo "WARNING: Could not retrieve IMDSv2 token, falling back to hostname (${FALLBACK_ID})" >&2
  set_env_var "AWSLOGS_STREAM" "api-${FALLBACK_ID}" /var/app/staging/.env
  exit 0
fi

INSTANCE_ID=$(curl -sf -H "X-aws-ec2-metadata-token: ${TOKEN}" \
  http://169.254.169.254/latest/meta-data/instance-id \
  --connect-timeout 2 --max-time 5)

if [ -z "${INSTANCE_ID}" ] || [[ "${INSTANCE_ID}" != i-* ]]; then
  echo "WARNING: Could not retrieve instance ID, falling back to hostname (${FALLBACK_ID})" >&2
  INSTANCE_ID="${FALLBACK_ID}"
fi

set_env_var "AWSLOGS_STREAM" "api-${INSTANCE_ID}" /var/app/staging/.env

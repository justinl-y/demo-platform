#!/bin/bash

TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
INSTANCE_ID=$(curl -s -H "X-aws-ec2-metadata-token: ${TOKEN}" \
  http://169.254.169.254/latest/meta-data/instance-id)

if [ -z "${INSTANCE_ID}" ]; then
  echo "WARNING: Could not retrieve instance ID, using fallback stream name" >&2
  INSTANCE_ID="unknown"
fi

echo "AWSLOGS_STREAM=api-${INSTANCE_ID}" >> /var/app/staging/.env

#!/usr/bin/env bash
set -euo pipefail

PROFILE="${AWS_PROFILE:-api-demo-stage}"

if ! command -v aws >/dev/null 2>&1; then
  echo "aws CLI is required but was not found in PATH" >&2
  exit 1
fi

echo "Starting AWS SSO login for profile '${PROFILE}'..."
aws sso login --profile "${PROFILE}"

# Fetch and extract credentials securely
creds=$(aws configure export-credentials --profile "${PROFILE}" --format env) || {
  echo "Unable to export credentials for profile '${PROFILE}'. Ensure aws CLI v2 is installed and profile is SSO configured." >&2
  exit 1
}

AWS_ACCESS_KEY_ID=$(echo "$creds" | grep AWS_ACCESS_KEY_ID | cut -d= -f2)
AWS_SECRET_ACCESS_KEY=$(echo "$creds" | grep AWS_SECRET_ACCESS_KEY | cut -d= -f2)
AWS_SESSION_TOKEN=$(echo "$creds" | grep AWS_SESSION_TOKEN | cut -d= -f2 || echo "")

: "${AWS_ACCESS_KEY_ID:?Missing AWS_ACCESS_KEY_ID from SSO profile}"
: "${AWS_SECRET_ACCESS_KEY:?Missing AWS_SECRET_ACCESS_KEY from SSO profile}"

export API_DEMO_AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}"
export API_DEMO_AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}"
export API_DEMO_AWS_SESSION_TOKEN="${AWS_SESSION_TOKEN:-}"

exec npm run api-up

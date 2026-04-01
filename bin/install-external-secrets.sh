#!/usr/bin/env bash
set -euo pipefail

CURRENT_DIR="$(pwd)"
NAMESPACE="${1:-meet}"
SECRET_NAME="${2:-bitwarden-cli-meet}"

# Check if kubectl is available
check_prerequisites() {
  if ! command -v kubectl >/dev/null 2>&1; then
    echo "Error: kubectl is not installed or not in PATH" >&2
    exit 1
  fi

  if ! command -v helm >/dev/null 2>&1; then
    echo "Error: helm is not installed or not in PATH" >&2
    exit 1
  fi
}

# Check if secret already exists
check_secret_exists() {
  kubectl -n "${NAMESPACE}" get secrets "${SECRET_NAME}" >/dev/null 2>&1
}

# Collect user input securely
get_user_input() {
  echo "Please provide the following information:"
  read -r -p "Enter your Vaultwarden email login: " LOGIN
  read -r -s -p "Enter your Vaultwarden password: " PASSWORD
  echo
  read -r -p "Enter your Vaultwarden server url: " URL
}

# Create the secret without writing credentials to disk
create_secret() {
  # Create YAML in-memory and apply via stdin
  # Note: using --dry-run=client -o yaml ensures kubectl generates a correct Secret manifest.
  kubectl -n "${NAMESPACE}" create secret generic "${SECRET_NAME}" \
    --from-literal=BW_HOST="${URL}" \
    --from-literal=BW_PASSWORD="${PASSWORD}" \
    --from-literal=BW_USERNAME="${LOGIN}" \
    --dry-run=client -o yaml | kubectl -n "${NAMESPACE}" apply -f -
}

# Install external-secrets using Helm
install_external_secrets() {
  if ! kubectl get ns external-secrets >/dev/null 2>&1; then
    echo "Installing external-secrets…"
    helm repo add external-secrets https://charts.external-secrets.io
    helm upgrade --install external-secrets \
      external-secrets/external-secrets \
      -n external-secrets \
      --create-namespace \
      --set installCRDs=true
  else
    echo "External secrets already deployed"
  fi
}

main() {
  check_prerequisites

  if check_secret_exists; then
    echo "Secret '${SECRET_NAME}' already present in namespace '${NAMESPACE}'"
    exit 0
  fi

  get_user_input

  echo
  echo "Creating Vaultwarden secret…"
  create_secret

  install_external_secrets

  echo "Secret installation completed successfully"
}

main "$@"
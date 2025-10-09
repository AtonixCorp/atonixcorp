#!/usr/bin/env bash
# Start all existing nerdctl containers (useful at boot)
# Usage: sudo /path/to/nerdctl-start-all.sh
set -euo pipefail
IFS=$'\n\t'

if ! command -v nerdctl >/dev/null 2>&1; then
  echo "nerdctl not found in PATH"
  exit 1
fi

# Ensure containerd is running (best-effort)
if systemctl is-active --quiet containerd; then
  echo "containerd is active"
else
  echo "containerd is not active; attempting to start it"
  sudo systemctl start containerd || true
fi

# Start all containers that are currently stopped (created/exited)
containers=$(nerdctl ps -a -q)
if [ -z "${containers}" ]; then
  echo "No containers found"
  exit 0
fi

# Start each container if it's not already running and update restart policy
started=0
updated=0
for id in ${containers}; do
  status=$(nerdctl inspect -f '{{.State.Status}}' "${id}" 2>/dev/null || echo "unknown")
  restart_policy=$(nerdctl inspect -f '{{.HostConfig.RestartPolicy.Name}}' "${id}" 2>/dev/null || echo "no")
  name=$(nerdctl inspect -f '{{.Name}}' "${id}" 2>/dev/null | sed 's/^\///' || echo "unknown")
  
  case "${status}" in
    running)
      # Update restart policy if needed - prioritize 'always' for backend/frontend
      if [ "${restart_policy}" = "no" ] || [ "${restart_policy}" = "" ]; then
        # Set restart=always for backend and frontend containers
        if echo "${name}" | grep -qE "(backend|frontend)"; then
          echo "Updating restart policy to 'always' for ${name} (${id})"
          nerdctl update --restart=always "${id}" 2>/dev/null || echo "Failed to update restart policy for ${id}"
        else
          echo "Updating restart policy to 'unless-stopped' for ${name} (${id})"
          nerdctl update --restart=unless-stopped "${id}" 2>/dev/null || echo "Failed to update restart policy for ${id}"
        fi
        updated=$((updated+1))
      fi
      ;;
    created|exited|stopped|paused|unknown)
      echo "Starting container ${name} (${id}) (status: ${status})"
      if nerdctl start "${id}"; then
        started=$((started+1))
        # Update restart policy after starting - prioritize 'always' for backend/frontend
        if [ "${restart_policy}" = "no" ] || [ "${restart_policy}" = "" ]; then
          if echo "${name}" | grep -qE "(backend|frontend)"; then
            echo "Setting restart policy to 'always' for ${name}"
            nerdctl update --restart=always "${id}" 2>/dev/null || echo "Failed to update restart policy for ${id}"
          else
            echo "Setting restart policy to 'unless-stopped' for ${name}"
            nerdctl update --restart=unless-stopped "${id}" 2>/dev/null || echo "Failed to update restart policy for ${id}"
          fi
          updated=$((updated+1))
        fi
      else
        echo "Failed to start ${id}"
      fi
      ;;
    *)
      echo "Skipping ${name} (${id}) (status: ${status})"
      ;;
  esac
done

echo "Started ${started} container(s), updated restart policy on ${updated} container(s)"
exit 0

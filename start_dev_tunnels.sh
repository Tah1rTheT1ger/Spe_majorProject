#!/bin/bash

# Configuration: Define the services, their ClusterIP port, and the desired local port.
# NOTE: The local port can be the same as the cluster port if it's not in use.

SERVICE_MAP=(
    "auth-service:4000:8081"
    "patient-service:4100:8082"
    "scans-service:4200:8083"
    "appointment-service:4300:8084"
    "billing-service:4400:8085"
    "prescription-service:4500:8086"
    "vault-service:8200:8200"    # Crucial for Jenkins/Vault interaction
    "mongo:27017:27017"          # Access the database locally
)

PIDS=()

echo "Starting Port Forwarding Tunnels..."
echo "-----------------------------------"

for entry in "${SERVICE_MAP[@]}"; do
    IFS=':' read -r SERVICE_NAME CLUSTER_PORT LOCAL_PORT <<< "$entry"

    echo "Starting tunnel for ${SERVICE_NAME} (Local: ${LOCAL_PORT} -> Cluster: ${CLUSTER_PORT})..."

    # Execute the kubectl command in the background (&) and suppress standard output (1)
    # Redirect stderr (2) to a specific log file for later inspection
    kubectl port-forward svc/"$SERVICE_NAME" "$LOCAL_PORT":"$CLUSTER_PORT" > /dev/null 2> /tmp/pf_err_"${SERVICE_NAME}".log &

    # Store the Process ID (PID) of the background job
    PIDS+=($!)

    # Give kubectl a moment to start the tunnel
    sleep 1

    # Check if the process is still running (i.e., didn't exit immediately with an error)
    if kill -0 ${PIDS[-1]} 2> /dev/null; then
        echo "   ✅ Tunnel started. Access at http://localhost:$LOCAL_PORT"
    else
        echo "   ❌ ERROR: Failed to start tunnel for ${SERVICE_NAME}. Check /tmp/pf_err_${SERVICE_NAME}.log"
    fi
done

echo ""
echo "-----------------------------------"
echo "All tunnels launched. PIDs: ${PIDS[*]}"
echo "To stop all tunnels, run: kill ${PIDS[*]}"
echo "-----------------------------------"

# Keep the script running in the foreground until manually stopped (or you kill the PIDs)
wait
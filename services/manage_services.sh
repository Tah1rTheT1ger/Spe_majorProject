#!/bin/bash

# Define the list of services to start
SERVICES=(
  "auth-service"
  "appointment-service"
  "patient-service"
  "billing-service"
  "prescription-service"
  "scans-service"
)

# File to store the PIDs of all launched services
PID_FILE="services_pids.txt"

# --- Function to Start all Services ---
start_all() {
  echo "--- Starting all services... ---"
  
  # Clear old PIDs before starting new ones
  > $PID_FILE 
  
  for SERVICE in "${SERVICES[@]}"; do
    if [ -d "$SERVICE" ]; then
      echo "Starting $SERVICE..."
      # Change directory, execute 'node server.js' in the background, 
      # and redirect output to a log file for review
      (cd $SERVICE && node server.js > ../logs/$SERVICE.log 2>&1 &)
      
      # Record the PID of the last background process ($!)
      echo $! >> $PID_FILE
      echo "  -> PID: $! (Logs: logs/$SERVICE.log)"
    else
      echo "Error: Service directory '$SERVICE' not found."
    fi
  done
  
  echo ""
  echo "All services launched. PIDs are stored in $PID_FILE."
  echo "Use './manage_services.sh stop' to shut them down."
}

# --- Function to Stop all Services ---
stop_all() {
  if [ -f $PID_FILE ]; then
    echo "--- Stopping services... ---"
    
    # Read PIDs from the file and kill each process
    while IFS= read -r PID; do
      if ps -p $PID > /dev/null; then
        echo "Killing process $PID..."
        kill $PID
      fi
    done < $PID_FILE
    
    # Clean up the PID file
    rm $PID_FILE
    echo ""
    echo "All services stopped and $PID_FILE removed."
  else
    echo "No $PID_FILE found. Are the services running?"
  fi
}

# --- Main Execution Block ---

# Create a logs directory if it doesn't exist
mkdir -p logs

case "$1" in
  start)
    start_all
    ;;
  stop)
    stop_all
    ;;
  *)
    echo "Usage: $0 {start|stop}"
    exit 1
esac

exit 0
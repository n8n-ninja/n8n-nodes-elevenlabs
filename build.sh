#!/bin/bash
# build.sh - Build n8n custom node and copy to n8n custom directory

# Set project name - change this for different modules
PROJECT_NAME="elevenlabs"

# Set your project directory
PROJECT_DIR=~/n8n_dev/n8n-nodes-${PROJECT_NAME}
N8N_CUSTOM_DIR=~/.n8n/custom/n8n-nodes-${PROJECT_NAME}

# Change to project directory
echo "Changing to project directory: $PROJECT_DIR"
cd $PROJECT_DIR || { echo "Error: Could not change to project directory"; exit 1; }

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
  echo "node_modules not found, installing dependencies..."
  pnpm install
  if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
  fi
fi

# Check for --build flag
if [ "$1" = "--build" ]; then
  # Extract current version from package.json
  CURRENT_VERSION=$(grep -o '"version": "[^"]*"' package.json | cut -d'"' -f4)

  # Display alert and confirmation
  echo "⚠️ IMPORTANT ⚠️"
  echo "Current package version is: $CURRENT_VERSION"
  echo "Please make sure you have incremented the version number in package.json before proceeding!"
  echo ""
  read -p "Do you want to continue with npm publish? (yes/no): " CONFIRM

  if [[ "$CONFIRM" != "yes" && "$CONFIRM" != "y" ]]; then
    echo "Build and publish cancelled."
    exit 0
  fi

  # Clean up custom directory
  echo "Cleaning up custom directory: $N8N_CUSTOM_DIR"
  # Ensure the directory exists before trying to clean it
  mkdir -p $N8N_CUSTOM_DIR
  # Remove all contents of the custom directory
  rm -rf $N8N_CUSTOM_DIR/*
  echo "All files in $N8N_CUSTOM_DIR have been removed"

  # Run the build
  echo "Building project..."
  pnpm run build
  if [ $? -ne 0 ]; then
    echo "Error: Build failed"
    exit 1
  fi

  # Run npm publish
  echo "Running npm publish..."
  npm publish

  echo "Build and publish completed successfully"
  exit 0
fi

# Normal build process (without --build flag)
# Run build
echo "Building project..."
pnpm run build
if [ $? -ne 0 ]; then
  echo "Error: Build failed"
  exit 1
fi

# Clean up custom directory
echo "Cleaning up custom directory: $N8N_CUSTOM_DIR"
# Ensure the directory exists before trying to clean it
mkdir -p $N8N_CUSTOM_DIR
# Remove all contents of the custom directory
rm -rf $N8N_CUSTOM_DIR/*
echo "All files in $N8N_CUSTOM_DIR have been removed"

# Copy built files
echo "Copying files to n8n custom directory: $N8N_CUSTOM_DIR"
cp -r dist/* $N8N_CUSTOM_DIR/

echo "Build and installation completed successfully"
echo "Restarting n8n..."

# Try different methods to restart n8n
# Method 1: If running as systemd service
if systemctl is-active --quiet n8n; then
  sudo systemctl restart n8n
  echo "Restarted n8n via systemd"
  exit 0
fi

# Method 3: Manual restart (kill and start again)
pkill -f "n8n start" || true
echo "Killed existing n8n process"
nohup n8n start > /dev/null 2>&1 &
echo "Started n8n in background"
echo "n8n restarted successfully"

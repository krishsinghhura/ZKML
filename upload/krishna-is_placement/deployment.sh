#!/bin/bash

set -e

echo "🔧 Running setup inside EC2..."

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_NAME="$(basename "$APP_DIR")"

cd "$APP_DIR"
echo "📁 Current directory: $APP_DIR"

# Create venv if not exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install requirements
echo "📚 Installing Python packages..."
pip install --upgrade pip
pip install -r requirements.txt

# Kill old running app if any
echo "🛑 Killing old app if running..."
pkill -f "$APP_DIR/app.py" || true

# Start new app in background
echo "🚀 Starting Python app..."
nohup "$APP_DIR/venv/bin/python" "$APP_DIR/app.py" > "$APP_DIR/app.log" 2>&1 &

echo "🎉 App started in background!"
echo "📄 Logs: $APP_DIR/app.log"

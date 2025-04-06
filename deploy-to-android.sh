#!/bin/bash

# Exit on error
set -e

# Set JAVA_HOME to Java 21
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64

# Check if Android device is connected
if ! adb devices | grep -q "device$"; then
  echo "No Android device connected. Please connect your device and enable USB debugging."
  exit 1
fi

echo "Android device found. Building and deploying app..."

# Build the web assets
echo "Building web assets..."
npm run build

# Sync the web assets to the Android project
echo "Syncing to Android project..."
npx cap sync android

# Build the Android app
echo "Building Android app..."
cd android && ./gradlew assembleDebug && cd ..

# Install the app on the device
echo "Installing app on device..."
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Launch the app
echo "Launching app..."
adb shell am start -n io.ionic.starter/io.ionic.starter.MainActivity

echo "Deployment complete! The app should now be running on your device."

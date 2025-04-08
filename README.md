# Bounce Mobile App

A mobile application built with Ionic and Capacitor.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (v6 or higher)
- [Java Development Kit (JDK) 21](https://openjdk.org/)
- [Android Studio](https://developer.android.com/studio) with Android SDK
- [Android Debug Bridge (adb)](https://developer.android.com/studio/command-line/adb)

## Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd bounce-mobile-v1
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Install Java 21 (if not already installed):

   ```bash
   sudo apt-get install openjdk-21-jdk
   ```

4. Set JAVA_HOME environment variable:
   ```bash
   export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
   ```

## Development

### Running in the browser

To run the app in the browser for development:

```bash
npm run start
```

This will start a development server at http://localhost:8100/

### Building the app

To build the web assets:

```bash
npm run build
```

### Syncing with Capacitor

After building, sync the web assets with the Capacitor project:

```bash
npx cap sync android
```

### Building the Android app

To build the Android app:

```bash
cd android
./gradlew assembleDebug
cd ..
```

This will generate an APK file at `android/app/build/outputs/apk/debug/app-debug.apk`.

## Deploying to Android Device

### Manual Deployment

1. Enable Developer Options on your Android phone:

   - Go to Settings > About phone
   - Tap "Build number" 7 times until you see "You are now a developer!"
   - Go back to Settings > System > Developer options
   - Enable "USB debugging"

2. Connect your phone to your computer with a USB cable

   - When prompted on your phone, allow USB debugging
   - You may need to select "File Transfer" or "MTP" mode on your phone

3. Install the app using ADB:

   ```bash
   adb install -r android/app/build/outputs/apk/debug/app-debug.apk
   ```

4. Launch the app:
   ```bash
   adb shell am start -n io.ionic.starter/io.ionic.starter.MainActivity
   ```

### Automated Deployment

We've included a script to automate the build and deployment process:

```bash
./deploy-to-android.sh
```

This script will:

- Check if an Android device is connected
- Build the web assets
- Sync them to the Android project
- Build the Android app
- Install and launch the app on your device

## Project Structure

- `src/` - Source code for the Ionic app
  - `components/` - React components
  - `pages/` - App pages
  - `services/` - Service classes for API communication
  - `context/` - React context providers
  - `hooks/` - Custom React hooks
  - `theme/` - Theme variables
- `android/` - Android platform code
- `resources/` - App icons and splash screens
- `public/` - Public assets

## CORS Handling for Mobile Devices

When running on a mobile device, the app uses a special proxy service to handle API requests and avoid CORS issues:

1. The `ProxyService` in `src/services/proxy.service.ts` detects whether the app is running on a native platform
2. For native platforms, it uses a `no-cors` mode approach with FormData to send requests
3. Since `no-cors` mode returns opaque responses that can't be read, the service returns mock responses for testing
4. For web/development, it uses regular fetch with JSON

This approach allows the app to communicate with the API server from a mobile device without CORS errors.

## Contributing

1. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:

   ```bash
   git commit -m "Description of changes"
   ```

3. Push to your branch:

   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a pull request

## License

[MIT](LICENSE)

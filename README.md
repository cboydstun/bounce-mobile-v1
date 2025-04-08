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
    - `ContactStatusBadge.tsx` - Visual indicator for contact status
    - `ContactsList.tsx` - Paginated list of contacts with status update functionality
    - `ContactsFilter.tsx` - Filter controls for contacts
  - `pages/` - App pages
    - `Dashboard.tsx` - Main dashboard with contact summaries and metrics
    - `Contacts.tsx` - Detailed contacts management page
    - `Calendar.tsx` - Calendar view for scheduled events (placeholder)
  - `services/` - Service classes for API communication
    - `contacts.service.ts` - Service for contacts API interactions
    - `proxy.service.ts` - Proxy service for handling CORS issues
  - `context/` - React context providers
  - `hooks/` - Custom React hooks
    - `useContacts.ts` - Hook for contacts data management
  - `types/` - TypeScript type definitions
    - `contact.ts` - Contact interfaces and types
  - `theme/` - Theme variables
- `android/` - Android platform code
- `resources/` - App icons and splash screens
- `public/` - Public assets

## Features

### Contacts Management

The app includes a comprehensive contacts management system:

- **Dashboard Overview**

  - Summary cards showing total, pending, and confirmed contacts
  - Upcoming events section (next 7 days)
  - Recent contacts with quick status update functionality

- **Detailed Contacts Management**

  - Paginated list of all contacts
  - Filtering by date range and confirmation status
  - Status update functionality (Confirmed, Pending, Called/Texted, Declined, Cancelled)
  - Detailed contact information display

- **Calendar View**
  - Placeholder for future calendar implementation

### Authentication

- Secure login system
- Protected routes for authenticated users
- Session management

## CORS Handling

The app uses two approaches to handle CORS issues:

### Development Environment

When running in development mode, the app uses Vite's built-in proxy:

```javascript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'https://www.satxbounce.com',
      changeOrigin: true,
      secure: false
    }
  }
}
```

This configuration proxies all `/api` requests through the development server to avoid CORS issues during development.

### Mobile Devices

When running on a mobile device, the app uses a special proxy service to handle API requests:

1. The `ProxyService` in `src/services/proxy.service.ts` detects whether the app is running on a native platform
2. For native platforms, it uses a `no-cors` mode approach with FormData to send requests
3. Since `no-cors` mode returns opaque responses that can't be read, the service returns mock responses for testing
4. For web/development, it uses relative URLs to leverage the Vite proxy

This dual approach allows the app to communicate with the API server from both development environments and mobile devices without CORS errors.

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

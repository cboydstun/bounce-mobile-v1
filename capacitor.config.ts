import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'bounce-mobile-v1',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: ['satxbounce.com', 'localhost']
  }
};

export default config;

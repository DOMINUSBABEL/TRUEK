import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dominusbabel.truek',
  appName: 'TRUEK',
  webDir: 'dist',
  server: {
    hostname: 'truekio-72021.firebaseapp.com',
    androidScheme: 'https'
  }
};

export default config;

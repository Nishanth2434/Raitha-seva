import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.raithaseva.app",
  appName: "Raitha Seva",
  webDir: "dist-capacitor",
  server: {
    // Allow cleartext traffic for local dev; remove for production APK
    cleartext: false,
    androidScheme: "https",
  },
  android: {
    buildOptions: {
      // Signing is handled by Android Studio / Gradle for release builds
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#16a34a",
      showSpinner: false,
      androidSpinnerStyle: "small",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true,
    },
    Camera: {
      // Permissions are declared in AndroidManifest.xml
    },
  },
};

export default config;

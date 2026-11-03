/**
 * Capacitor / SPA entry point.
 *
 * This is the client-only bootstrap used by the Capacitor Android build.
 * It bypasses TanStack Start's SSR runtime and uses plain browser routing
 * via TanStack Router.
 *
 * Configures:
 * 1. PWA elements (camera, file picker)
 * 2. Native Android back-button handling via @capacitor/app
 * 3. Android status bar (brand green #16a34a) via @capacitor/status-bar
 * 4. Splash screen dismissal via @capacitor/splash-screen
 */
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { defineCustomElements } from "@ionic/pwa-elements/loader";

// Register Ionic PWA Elements for camera UI & file picker fallback
defineCustomElements(window).catch(() => {
  // Optional dependency; silently skip if missing
});

const router = getRouter();

function CapacitorAppRoot() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // 1. Android Status Bar styling
    StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    StatusBar.setBackgroundColor({ color: "#16a34a" }).catch(() => {});

    // 2. Hide splash screen after app mounts
    SplashScreen.hide().catch(() => {});

    // 3. Android hardware / gesture back button handling
    const backListener = CapApp.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        // If on root page, exit or minimize
        CapApp.exitApp();
      }
    });

    return () => {
      backListener.then((sub) => sub.remove()).catch(() => {});
    };
  }, []);

  return <RouterProvider router={router} />;
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <CapacitorAppRoot />
  </React.StrictMode>,
);

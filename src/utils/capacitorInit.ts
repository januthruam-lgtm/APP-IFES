import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { App as CapApp } from "@capacitor/app";
import { Keyboard, KeyboardStyle } from "@capacitor/keyboard";

// Production backend URL for packaged Android APK calls
export const BACKEND_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  "https://ais-dev-pzvdq3wll2wmaa436tu5nt-801563813870.us-east1.run.app";

/**
 * Intercepts relative /api/ fetch calls when running inside Capacitor Android APK
 * to route them to the live cloud backend.
 */
export function setupNativeNetworkBridge() {
  if (typeof window === "undefined") return;

  const originalFetch = window.fetch;
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
    if (Capacitor.isNativePlatform()) {
      if (typeof input === "string" && input.startsWith("/api/")) {
        input = `${BACKEND_URL}${input}`;
      } else if (
        input instanceof URL &&
        input.pathname.startsWith("/api/") &&
        (input.origin.includes("localhost") || input.origin.includes("capacitor://"))
      ) {
        input = new URL(`${BACKEND_URL}${input.pathname}${input.search}`);
      }
    }
    return originalFetch.call(this, input, init);
  };
}

/**
 * Initializes native Android device features (StatusBar, SplashScreen, BackButton, Keyboard)
 */
export function initializeCapacitorApp(handlers?: {
  onBackButtonPressed?: () => boolean; // returns true if handled
}) {
  if (typeof window === "undefined" || !Capacitor.isNativePlatform()) {
    return;
  }

  // 1. Setup Network Bridge
  setupNativeNetworkBridge();

  // 2. Configure Android Status Bar
  try {
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: "#050512" }).catch(() => {});
  } catch (err) {
    console.warn("[Capacitor] StatusBar error:", err);
  }

  // 3. Configure Virtual Keyboard
  try {
    Keyboard.setStyle({ style: KeyboardStyle.Dark }).catch(() => {});
    Keyboard.setAccessoryBarVisible({ isVisible: false }).catch(() => {});
  } catch (err) {
    console.warn("[Capacitor] Keyboard config error:", err);
  }

  // 4. Hide Native Splash Screen smoothly
  try {
    setTimeout(() => {
      SplashScreen.hide({ fadeOutDuration: 300 }).catch(() => {});
    }, 800);
  } catch (err) {
    console.warn("[Capacitor] SplashScreen error:", err);
  }

  // 5. Android Hardware / Gesture Back Button handling
  try {
    CapApp.addListener("backButton", ({ canGoBack }) => {
      if (handlers?.onBackButtonPressed) {
        const handled = handlers.onBackButtonPressed();
        if (handled) return;
      }

      // Dispatches custom event for modals or tabs to catch
      const event = new CustomEvent("android_hardware_back_button", { cancelable: true });
      const dispatched = window.dispatchEvent(event);

      if (!dispatched || event.defaultPrevented) {
        return;
      }

      if (canGoBack) {
        window.history.back();
      } else {
        CapApp.exitApp();
      }
    });
  } catch (err) {
    console.warn("[Capacitor] BackButton listener error:", err);
  }
}

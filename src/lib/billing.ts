import { Capacitor } from "@capacitor/core";
import {
  Purchases,
  type PurchasesOffering,
  type PurchasesPackage,
} from "@revenuecat/purchases-capacitor";
import { ENTITLEMENT } from "./plans";

let initPromise: Promise<void> | null = null;
let ready = false;

export function initBilling(userId?: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return Promise.resolve();
  if (initPromise) return initPromise;

  initPromise = Purchases.configure({
    apiKey: import.meta.env.VITE_REVENUECAT_ANDROID_KEY,
    appUserID: userId || undefined,
  })
    .then(() => {
      ready = true;
    })
    .catch((e) => {
      console.warn("Billing indisponível:", e);
    });

  return initPromise;
}

export async function getOffering(): Promise<PurchasesOffering | null> {
  await initPromise;
  if (!ready) return null;
  const { current } = await Purchases.getOfferings();
  return current ?? null;
}

export async function buy(pkg: PurchasesPackage): Promise<boolean> {
  const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
  return Boolean(customerInfo.entitlements.active[ENTITLEMENT]);
}

export async function restore(): Promise<boolean> {
  await initPromise;
  if (!ready) return false;
  const { customerInfo } = await Purchases.restorePurchases();
  return Boolean(customerInfo.entitlements.active[ENTITLEMENT]);
}

export async function isPro(): Promise<boolean> {
  // Atalho só para testar no navegador em modo dev
  if (import.meta.env.DEV && localStorage.getItem("brain_studio_dev_pro") === "true") {
    return true;
  }
  await initPromise;
  if (!ready) return false;
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return Boolean(customerInfo.entitlements.active[ENTITLEMENT]);
  } catch {
    return false;
  }
}
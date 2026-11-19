import { Capacitor } from '@capacitor/core';

// Safe dynamic reference to CapacitorUpdater
let CapacitorUpdater = null;
if (Capacitor.isNativePlatform()) {
  import('@capgo/capacitor-updater').then((mod) => {
    CapacitorUpdater = mod.CapacitorUpdater;
    // Tell Capgo the initial bundle booted successfully
    notifyAppReady();
  }).catch((err) => {
    console.warn('[Updater] Capgo plugin load notice:', err.message);
  });
}

/**
 * Notifies Capgo native plugin that the app mounted successfully.
 * Must be called on each startup to prevent automatic rollback.
 */
export async function notifyAppReady() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    if (!CapacitorUpdater) {
      const mod = await import('@capgo/capacitor-updater');
      CapacitorUpdater = mod.CapacitorUpdater;
    }
    await CapacitorUpdater.notifyAppReady();
    console.log('[Updater] App ready notification sent to Capgo.');
  } catch (err) {
    console.warn('[Updater] notifyAppReady notice:', err.message);
  }
}

/**
 * Semantic version comparison: returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal.
 */
export function compareVersions(v1, v2) {
  if (!v1 || !v2) return 0;
  const clean1 = String(v1).replace(/^v/i, '').trim();
  const clean2 = String(v2).replace(/^v/i, '').trim();
  const parts1 = clean1.split('.').map(n => parseInt(n, 10) || 0);
  const parts2 = clean2.split('.').map(n => parseInt(n, 10) || 0);
  const len = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < len; i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

export function isVersionNewer(remoteVersion, localVersion) {
  return compareVersions(remoteVersion, localVersion) > 0;
}

/**
 * Downloads and applies an OTA live bundle via Capgo.
 * @param {string} bundleUrl Direct URL to web bundle .zip
 * @param {string} bundleVersion Version/tag for the bundle (e.g. "1.0.1-web")
 */
export async function downloadAndApplyBundle(bundleUrl, bundleVersion) {
  if (!Capacitor.isNativePlatform()) {
    console.log('[Updater] OTA bundle download skipped (web browser).');
    return { success: false, reason: 'web_platform' };
  }
  if (!bundleUrl) {
    return { success: false, reason: 'missing_url' };
  }

  try {
    if (!CapacitorUpdater) {
      const mod = await import('@capgo/capacitor-updater');
      CapacitorUpdater = mod.CapacitorUpdater;
    }

    console.log(`[Updater] Downloading live OTA bundle v${bundleVersion} from ${bundleUrl}...`);
    const res = await CapacitorUpdater.download({
      url: bundleUrl,
      version: bundleVersion || `ota_${Date.now()}`
    });

    if (res && res.id) {
      await CapacitorUpdater.set({ id: res.id });
      console.log(`[Updater] Live OTA bundle set to ${res.id}. Ready for next launch.`);
      return { success: true, bundleId: res.id };
    }
    return { success: false, reason: 'no_bundle_id' };
  } catch (err) {
    console.error('[Updater] Error applying live OTA bundle:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Trigger immediate reload of the webview with updated bundle.
 */
export async function reloadApp() {
  if (!Capacitor.isNativePlatform()) {
    window.location.reload();
    return;
  }
  try {
    if (!CapacitorUpdater) {
      const mod = await import('@capgo/capacitor-updater');
      CapacitorUpdater = mod.CapacitorUpdater;
    }
    await CapacitorUpdater.reload();
  } catch {
    window.location.reload();
  }
}

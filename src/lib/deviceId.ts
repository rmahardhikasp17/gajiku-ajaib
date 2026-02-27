// ── Device ID utility ──
// Generates a stable random ID stored in localStorage.
// Used for backup metadata to identify which device exported the data.
// Not PII — just a random string.

const DEVICE_ID_KEY = 'gajiku_device_id';

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = generateDeviceId();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function generateDeviceId(): string {
  // 16 random hex bytes → 32-char string
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

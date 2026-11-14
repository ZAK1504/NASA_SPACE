import A from 'aladin-lite';

let isInitialized = false;
let initPromise: Promise<any> | null = null;

export async function getAladinInstance(): Promise<any> {
  if (typeof window === 'undefined') return null;

  // Ensure window.A is set
  if (!(window as any).A) {
    (window as any).A = A;
  }

  if (isInitialized) {
    return A;
  }

  if (!initPromise) {
    initPromise = (async () => {
      try {
        if (A.init && typeof A.init.then === 'function') {
          await A.init;
        }
        isInitialized = true;
        (window as any).A = A;
        return A;
      } catch (err) {
        console.error('Aladin Lite WebGL initialization error:', err);
        throw err;
      }
    })();
  }

  return initPromise;
}

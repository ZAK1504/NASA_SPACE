import A from 'aladin-lite';

let isInitialized = false;
let initPromise: Promise<any> | null = null;

export async function getAladinInstance(): Promise<any> {
  if (typeof window === 'undefined') return null;

  // Ensure window.A is set
  if (!(window as any).A) {
    (window as any).A = A;
  }

  // Whitelist high-availability NASA/IPAC IRSA mirrors and local endpoints
  // to prevent Aladin Lite from proxying requests through dead Strasbourg CGI proxies
  try {
    if (A && A.Utils && Array.isArray(A.Utils.HTTPS_WHITELIST)) {
      const allowedHosts = [
        'irsa.ipac.caltech.edu',
        '127.0.0.1',
        'localhost',
        typeof window !== 'undefined' && window.location ? window.location.hostname : ''
      ].filter(Boolean);

      allowedHosts.forEach((host) => {
        if (!A.Utils.HTTPS_WHITELIST.includes(host)) {
          A.Utils.HTTPS_WHITELIST.push(host);
        }
      });
    }
  } catch (e) {
    console.warn('Could not update Aladin HTTPS_WHITELIST:', e);
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

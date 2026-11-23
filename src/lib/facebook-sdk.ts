export interface FacebookSdkAuthResponse {
  accessToken: string;
  userID: string;
  expiresIn?: number;
  signedRequest?: string;
  grantedScopes?: string;
}

export interface FacebookSdkLoginStatus {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: FacebookSdkAuthResponse;
}

interface FacebookGlobalApi {
  init: (params: {
    appId: string;
    cookie?: boolean;
    xfbml?: boolean;
    version: string;
  }) => void;
  AppEvents: {
    logPageView: () => void;
  };
  getLoginStatus: (callback: (response: FacebookSdkLoginStatus) => void, roundtrip?: boolean) => void;
  login: (
    callback: (response: FacebookSdkLoginStatus) => void,
    options?: { scope?: string; return_scopes?: boolean }
  ) => void;
  logout: (callback?: (response: unknown) => void) => void;
  api: (path: string, params: Record<string, unknown>, callback: (response: any) => void) => void;
}

declare global {
  interface Window {
    FB?: FacebookGlobalApi;
    fbAsyncInit?: () => void;
    __FB_APP_ID__?: string;
    __FB_API_VERSION__?: string;
    __AVLIVE_FB_INITIALIZED_APP_ID__?: string;
    __avliveLoadFacebookSdk?: () => void;
  }
}

const DEFAULT_FB_API_VERSION = 'v22.0';
let cachedSdkConfigPromise: Promise<{ appId: string; version: string }> | null = null;

export async function getConfiguredFacebookSdkConfig(): Promise<{
  appId: string;
  version: string;
}> {
  if (typeof window === 'undefined') {
    return { appId: '', version: DEFAULT_FB_API_VERSION };
  }

  const inlineAppId = (window.__FB_APP_ID__ || '').trim();
  const viteAppId = String(import.meta.env.VITE_FACEBOOK_APP_ID || '').trim();
  const inlineVersion = (window.__FB_API_VERSION__ || DEFAULT_FB_API_VERSION).trim();

  if (inlineAppId && inlineAppId !== '{your-app-id}') {
    return { appId: inlineAppId, version: inlineVersion };
  }
  if (viteAppId && viteAppId !== '{your-app-id}') {
    window.__FB_APP_ID__ = viteAppId;
    return { appId: viteAppId, version: inlineVersion };
  }

  if (!cachedSdkConfigPromise) {
    cachedSdkConfigPromise = fetch('/api/facebook/sdk-config')
      .then(async (res) => {
        if (!res.ok) return { appId: '', version: DEFAULT_FB_API_VERSION };
        const data = await res.json();
        const resolvedId = typeof data?.appId === 'string' ? data.appId.trim() : '';
        const resolvedVersion =
          typeof data?.version === 'string' && data.version.trim()
            ? data.version.trim()
            : DEFAULT_FB_API_VERSION;
        if (resolvedId) {
          window.__FB_APP_ID__ = resolvedId;
          window.__FB_API_VERSION__ = resolvedVersion;
        }
        return { appId: resolvedId, version: resolvedVersion };
      })
      .catch(() => ({ appId: '', version: DEFAULT_FB_API_VERSION }));
  }

  return cachedSdkConfigPromise;
}

function triggerFacebookSdkScriptLoad(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (typeof window.__avliveLoadFacebookSdk === 'function') {
    window.__avliveLoadFacebookSdk();
    return;
  }
  if (document.getElementById('facebook-jssdk')) return;
  const js = document.createElement('script');
  js.id = 'facebook-jssdk';
  js.async = true;
  js.defer = true;
  js.crossOrigin = 'anonymous';
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  const fjs = document.getElementsByTagName('script')[0];
  if (fjs && fjs.parentNode) {
    fjs.parentNode.insertBefore(js, fjs);
  } else {
    document.head.appendChild(js);
  }
}

function waitForFbGlobal(timeoutMs = 7000): Promise<FacebookGlobalApi | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.FB) return Promise.resolve(window.FB);

  triggerFacebookSdkScriptLoad();

  return new Promise((resolve) => {
    let settled = false;
    const finish = (fb: FacebookGlobalApi | null) => {
      if (settled) return;
      settled = true;
      window.removeEventListener('avlive:fb-sdk-ready', onReady);
      clearInterval(pollTimer);
      clearTimeout(timeoutTimer);
      resolve(fb);
    };

    const onReady = () => finish(window.FB || null);
    window.addEventListener('avlive:fb-sdk-ready', onReady);

    const pollTimer = window.setInterval(() => {
      if (window.FB) {
        finish(window.FB);
      }
    }, 100);

    const timeoutTimer = window.setTimeout(() => {
      finish(window.FB || null);
    }, timeoutMs);
  });
}

export async function ensureFacebookSdkReady(): Promise<{
  ready: boolean;
  appId: string;
  version: string;
  error?: string;
}> {
  const { appId, version } = await getConfiguredFacebookSdkConfig();
  if (!appId) {
    return {
      ready: false,
      appId: '',
      version,
      error: 'FACEBOOK_APP_ID is not configured yet in AI Studio Secrets.',
    };
  }

  const fb = await waitForFbGlobal();
  if (!fb) {
    return {
      ready: false,
      appId,
      version,
      error: 'Facebook JavaScript SDK could not be loaded (blocked by browser or offline).',
    };
  }

  if (window.__AVLIVE_FB_INITIALIZED_APP_ID__ !== appId) {
    fb.init({
      appId,
      cookie: true,
      xfbml: true,
      version,
    });
    fb.AppEvents.logPageView();
    window.__AVLIVE_FB_INITIALIZED_APP_ID__ = appId;
  }

  return { ready: true, appId, version };
}

export async function getFacebookSdkLoginStatus(): Promise<FacebookSdkLoginStatus> {
  const status = await ensureFacebookSdkReady();
  if (!status.ready || !window.FB) {
    return { status: 'unknown' };
  }

  return new Promise((resolve) => {
    window.FB!.getLoginStatus((response) => {
      resolve(response || { status: 'unknown' });
    });
  });
}

export async function loginWithFacebookSdk(
  scope = 'public_profile,email'
): Promise<FacebookSdkLoginStatus> {
  const status = await ensureFacebookSdkReady();
  if (!status.ready || !window.FB) {
    throw new Error(status.error || 'Facebook SDK is not ready.');
  }

  return new Promise((resolve, reject) => {
    window.FB!.login(
      (response) => {
        if (!response || response.status !== 'connected' || !response.authResponse?.accessToken) {
          reject(new Error('Facebook login was cancelled or permissions were not granted.'));
          return;
        }
        resolve(response);
      },
      { scope, return_scopes: true }
    );
  });
}

export async function logoutFacebookSdk(): Promise<void> {
  if (typeof window === 'undefined' || !window.FB || !window.__AVLIVE_FB_INITIALIZED_APP_ID__) {
    return;
  }
  await new Promise<void>((resolve) => {
    try {
      window.FB!.getLoginStatus((res) => {
        if (res?.status === 'connected') {
          window.FB!.logout(() => resolve());
        } else {
          resolve();
        }
      });
    } catch {
      resolve();
    }
  });
}

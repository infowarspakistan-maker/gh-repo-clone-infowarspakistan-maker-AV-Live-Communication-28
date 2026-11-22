import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
} from 'firebase/storage';
import {
  GoogleAuthProvider,
  signInWithPopup,
  reauthenticateWithPopup,
} from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import {
  auth,
  storage,
  productsStorage,
  PRODUCTS_STORAGE_BUCKET,
} from './client';
import {
  compressImageFile,
  formatFileSizeKb,
  toSeoImageSlug,
} from '../client-image-compressor';

export { PRODUCTS_STORAGE_BUCKET };
export const PRODUCTS_FOLDER_PREFIX = 'Products';
export const STORAGE_OWNER_EMAIL = 'infowarspakistan@gmail.com';
const GCS_TOKEN_STORAGE_KEY = 'avlive_gcs_products_oauth_token';
const GCS_TOKEN_EXP_KEY = 'avlive_gcs_products_oauth_exp';

export interface StorageProductImage {
  name: string;
  fullPath: string;
  gsPath: string;
  downloadUrl: string;
  contentType: string;
  sizeBytes: number;
  updatedAt: string;
}

export interface StorageUploadResult {
  downloadUrl: string;
  gmcJpgUrl?: string;
  fullPath: string;
  gsPath: string;
  sizeBytes: number;
  originalBytes: number;
  savingsPercent: number;
  provider: 'gcs-oauth' | 'firebase-sdk' | 'site-vault';
}

export interface StorageListResult {
  items: StorageProductImage[];
  authRequired: boolean;
  provider: 'gcs-oauth' | 'firebase-sdk' | 'none';
  error?: string;
}

export interface StorageDeleteResult {
  deleted: boolean;
  authRequired?: boolean;
  reason?: string;
}

export function getGcsOAuthToken(): string | null {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;
  try {
    const token = window.sessionStorage.getItem(GCS_TOKEN_STORAGE_KEY);
    const exp = Number(window.sessionStorage.getItem(GCS_TOKEN_EXP_KEY) || '0');
    if (token && (!exp || Date.now() < exp)) {
      return token;
    }
    if (exp && Date.now() >= exp) {
      window.sessionStorage.removeItem(GCS_TOKEN_STORAGE_KEY);
      window.sessionStorage.removeItem(GCS_TOKEN_EXP_KEY);
    }
  } catch {
    // ignore storage errors
  }
  return null;
}

export function clearGcsOAuthToken(): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    window.sessionStorage.removeItem(GCS_TOKEN_STORAGE_KEY);
    window.sessionStorage.removeItem(GCS_TOKEN_EXP_KEY);
  } catch {
    // ignore storage errors
  }
}

function saveGcsOAuthToken(token: string): void {
  if (typeof window === 'undefined' || !window.sessionStorage || !token) return;
  try {
    window.sessionStorage.setItem(GCS_TOKEN_STORAGE_KEY, token);
    // Google OAuth access tokens typically remain valid ~55 minutes
    window.sessionStorage.setItem(GCS_TOKEN_EXP_KEY, String(Date.now() + 50 * 60 * 1000));
  } catch {
    // ignore storage errors
  }
}

export async function connectProductsStorageOAuth(): Promise<string> {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/devstorage.read_write');
  provider.setCustomParameters({
    login_hint: STORAGE_OWNER_EMAIL,
    prompt: 'consent',
  });

  const result = auth.currentUser
    ? await reauthenticateWithPopup(auth.currentUser, provider).catch(() =>
        signInWithPopup(auth, provider)
      )
    : await signInWithPopup(auth, provider);

  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential?.accessToken;
  if (!accessToken) {
    throw new Error(
      `Google sign-in completed, but no Cloud Storage OAuth token was returned. Allow storage access for ${STORAGE_OWNER_EMAIL}.`
    );
  }
  saveGcsOAuthToken(accessToken);
  return accessToken;
}

function buildFirebasePublicUrl(
  bucket: string,
  objectPath: string,
  downloadToken?: string
): string {
  const encoded = encodeURIComponent(objectPath);
  return downloadToken
    ? `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encoded}?alt=media&token=${encodeURIComponent(downloadToken)}`
    : `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encoded}?alt=media`;
}

export function isProductsStorageBucketUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return (
    url.includes(PRODUCTS_STORAGE_BUCKET) ||
    url.includes('pacific-exchanger-2dckx.firebasestorage.app') ||
    url.startsWith(`gs://${PRODUCTS_STORAGE_BUCKET}/`)
  );
}

export function parseStorageLocationFromUrl(rawUrl: string): {
  bucket: string;
  objectPath: string;
} | null {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('gs://')) {
    const rest = trimmed.slice(5);
    const slashIdx = rest.indexOf('/');
    if (slashIdx <= 0) return null;
    return {
      bucket: rest.slice(0, slashIdx),
      objectPath: rest.slice(slashIdx + 1),
    };
  }

  // Matches https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<encodedPath>?alt=media...
  const fbMatch = trimmed.match(
    /^https?:\/\/firebasestorage\.googleapis\.com\/v0\/b\/([^/]+)\/o\/([^?]+)/i
  );
  if (fbMatch) {
    return {
      bucket: decodeURIComponent(fbMatch[1]),
      objectPath: decodeURIComponent(fbMatch[2]),
    };
  }

  // Matches https://storage.googleapis.com/<bucket>/<objectPath>
  const gcsMatch = trimmed.match(
    /^https?:\/\/storage\.googleapis\.com\/([^/]+)\/([^?#]+)/i
  );
  if (gcsMatch && gcsMatch[1] !== 'storage') {
    return {
      bucket: decodeURIComponent(gcsMatch[1]),
      objectPath: decodeURIComponent(gcsMatch[2]),
    };
  }

  return null;
}

async function gcsMultipartUpload(
  token: string,
  objectPath: string,
  file: Blob,
  contentType: string
): Promise<string> {
  const downloadToken = uuidv4();
  const boundary = `avlive_${uuidv4().replace(/-/g, '')}`;
  const metadataPart = JSON.stringify({
    name: objectPath,
    contentType,
    cacheControl: 'public, max-age=31536000',
    metadata: {
      firebaseStorageDownloadTokens: downloadToken,
    },
  });

  const body = new Blob(
    [
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadataPart}\r\n`,
      `--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`,
      file,
      `\r\n--${boundary}--`,
    ],
    { type: `multipart/related; boundary=${boundary}` }
  );

  const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(
    PRODUCTS_STORAGE_BUCKET
  )}/o?uploadType=multipart`;

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (res.status === 401 || res.status === 403) {
    if (res.status === 401) clearGcsOAuthToken();
    const errText = await res.text().catch(() => '');
    throw new Error(`GCS_AUTH_REQUIRED:${res.status}:${errText}`);
  }
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`GCS upload failed (${res.status}): ${errText}`);
  }

  return buildFirebasePublicUrl(PRODUCTS_STORAGE_BUCKET, objectPath, downloadToken);
}

export async function listProductsStorageImages(): Promise<StorageListResult> {
  const oauthToken = getGcsOAuthToken();
  if (oauthToken) {
    try {
      const listUrl = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(
        PRODUCTS_STORAGE_BUCKET
      )}/o?prefix=${encodeURIComponent(`${PRODUCTS_FOLDER_PREFIX}/`)}&maxResults=250`;

      const res = await fetch(listUrl, {
        headers: { Authorization: `Bearer ${oauthToken}` },
      });
      if (res.status === 401) {
        clearGcsOAuthToken();
      } else if (res.ok) {
        const data = await res.json();
        const rawItems = Array.isArray(data.items) ? data.items : [];
        const items: StorageProductImage[] = rawItems
          .filter((obj: any) => obj.name && !String(obj.name).endsWith('/'))
          .filter((obj: any) => /\.(webp|jpe?g|png|gif|avif)$/i.test(String(obj.name)))
          .map((obj: any) => {
            const rawTokens = String(obj?.metadata?.firebaseStorageDownloadTokens || '')
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean);
            const fullPath = String(obj.name);
            const fileName = fullPath.split('/').pop() || fullPath;
            return {
              name: fileName,
              fullPath,
              gsPath: `gs://${PRODUCTS_STORAGE_BUCKET}/${fullPath}`,
              downloadUrl: buildFirebasePublicUrl(
                PRODUCTS_STORAGE_BUCKET,
                fullPath,
                rawTokens[0]
              ),
              contentType: String(obj.contentType || 'image/webp'),
              sizeBytes: Number(obj.size || 0),
              updatedAt: String(obj.updated || obj.timeCreated || ''),
            };
          })
          .sort((a: StorageProductImage, b: StorageProductImage) =>
            b.updatedAt.localeCompare(a.updatedAt)
          );

        return { items, authRequired: false, provider: 'gcs-oauth' };
      }
    } catch {
      // Fall through to Firebase Storage SDK check
    }
  }

  try {
    const folderRef = ref(productsStorage, PRODUCTS_FOLDER_PREFIX);
    const listRes = await listAll(folderRef);
    const items: StorageProductImage[] = await Promise.all(
      listRes.items.map(async (itemRef) => {
        const [downloadUrl, meta] = await Promise.all([
          getDownloadURL(itemRef),
          getMetadata(itemRef).catch(() => null),
        ]);
        return {
          name: itemRef.name,
          fullPath: itemRef.fullPath,
          gsPath: `gs://${PRODUCTS_STORAGE_BUCKET}/${itemRef.fullPath}`,
          downloadUrl,
          contentType: meta?.contentType || 'image/webp',
          sizeBytes: meta?.size || 0,
          updatedAt: meta?.updated || '',
        };
      })
    );
    items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return { items, authRequired: false, provider: 'firebase-sdk' };
  } catch (err: any) {
    const msg = String(err?.message || err?.code || err || '');
    const needsAuth =
      msg.includes('unauthorized') ||
      msg.includes('403') ||
      msg.includes('401') ||
      msg.includes('permission');
    return {
      items: [],
      authRequired: needsAuth,
      provider: 'none',
      error: needsAuth
        ? `Authorize Google Storage (${STORAGE_OWNER_EMAIL}) to browse & manage gs://${PRODUCTS_STORAGE_BUCKET}/${PRODUCTS_FOLDER_PREFIX}`
        : msg,
    };
  }
}

export async function uploadToProductsStorage(
  file: File,
  options?: {
    slugHint?: string;
    includeGmcJpg?: boolean;
    allowSiteVaultFallback?: boolean;
  }
): Promise<StorageUploadResult> {
  const seoBase = toSeoImageSlug(options?.slugHint || file.name);
  const compressed = await compressImageFile(file, {
    preset: 'product',
    seoSlug: seoBase,
    includeGmcJpg: options?.includeGmcJpg ?? true,
  });

  const uniqueSuffix = Date.now().toString(36).slice(-4);
  const webpExt = compressed.webpFile.name.split('.').pop() || 'webp';
  const webpObjectPath = `${PRODUCTS_FOLDER_PREFIX}/${compressed.seoSlug}-${uniqueSuffix}.${webpExt}`;
  const jpgObjectPath = `${PRODUCTS_FOLDER_PREFIX}/${compressed.seoSlug}-${uniqueSuffix}.jpg`;

  URL.revokeObjectURL(compressed.previewUrl);

  // 1. Try GCS OAuth (infowarspakistan@gmail.com) directly into gs://studio-5367437135-24ac6.firebasestorage.app/Products/
  const oauthToken = getGcsOAuthToken();
  if (oauthToken) {
    try {
      const downloadUrl = await gcsMultipartUpload(
        oauthToken,
        webpObjectPath,
        compressed.webpFile,
        compressed.webpFile.type || 'image/webp'
      );
      let gmcJpgUrl: string | undefined;
      if (compressed.jpgFile) {
        gmcJpgUrl = await gcsMultipartUpload(
          oauthToken,
          jpgObjectPath,
          compressed.jpgFile,
          'image/jpeg'
        ).catch(() => undefined);
      }
      return {
        downloadUrl,
        gmcJpgUrl,
        fullPath: webpObjectPath,
        gsPath: `gs://${PRODUCTS_STORAGE_BUCKET}/${webpObjectPath}`,
        sizeBytes: compressed.optimizedBytes,
        originalBytes: compressed.originalBytes,
        savingsPercent: compressed.savingsPercent,
        provider: 'gcs-oauth',
      };
    } catch (err: any) {
      if (!String(err?.message || '').startsWith('GCS_AUTH_REQUIRED')) {
        throw err;
      }
    }
  }

  // 2. Try Firebase Storage SDK pointing to gs://studio-5367437135-24ac6.firebasestorage.app/Products/
  try {
    const sRef = ref(productsStorage, webpObjectPath);
    await uploadBytes(sRef, compressed.webpFile, {
      contentType: compressed.webpFile.type || 'image/webp',
      cacheControl: 'public, max-age=31536000',
    });
    const downloadUrl = await getDownloadURL(sRef);

    let gmcJpgUrl: string | undefined;
    if (compressed.jpgFile) {
      try {
        const jpgRef = ref(productsStorage, jpgObjectPath);
        await uploadBytes(jpgRef, compressed.jpgFile, {
          contentType: 'image/jpeg',
          cacheControl: 'public, max-age=31536000',
        });
        gmcJpgUrl = await getDownloadURL(jpgRef);
      } catch {
        // optional GMC JPG mirror
      }
    }

    return {
      downloadUrl,
      gmcJpgUrl,
      fullPath: webpObjectPath,
      gsPath: `gs://${PRODUCTS_STORAGE_BUCKET}/${webpObjectPath}`,
      sizeBytes: compressed.optimizedBytes,
      originalBytes: compressed.originalBytes,
      savingsPercent: compressed.savingsPercent,
      provider: 'firebase-sdk',
    };
  } catch (sdkErr: any) {
    // 3. Fallback to Site Vault (/api/admin/media/upload) if allowed so operator isn't blocked
    if (options?.allowSiteVaultFallback !== false) {
      const idToken = await auth.currentUser?.getIdToken().catch(() => null);
      if (idToken) {
        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            folder: 'products',
            filename: `${compressed.seoSlug}-${uniqueSuffix}`,
            webpBase64: compressed.webpBase64,
            jpgBase64: compressed.jpgBase64,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const finalUrl = data.gmcUrl || data.fullUrl || data.url;
          if (finalUrl) {
            return {
              downloadUrl: finalUrl,
              gmcJpgUrl: data.jpgUrl,
              fullPath: data.url || finalUrl,
              gsPath: finalUrl,
              sizeBytes: data.bytes || compressed.optimizedBytes,
              originalBytes: compressed.originalBytes,
              savingsPercent: compressed.savingsPercent,
              provider: 'site-vault',
            };
          }
        }
      }
    }

    throw new Error(
      `Upload to gs://${PRODUCTS_STORAGE_BUCKET}/Products requires Google Storage authorization (${STORAGE_OWNER_EMAIL}). Original error: ${
        sdkErr?.message || sdkErr
      }`
    );
  }
}

export async function deleteFromProductsStorage(
  urlOrPath: string
): Promise<StorageDeleteResult> {
  const trimmed = String(urlOrPath || '').trim();
  if (!trimmed) return { deleted: false, reason: 'Empty URL' };

  // Check if local workspace image (/images/products/...)
  if (
    trimmed.startsWith('/images/') ||
    trimmed.startsWith('https://avlive.com.pk/images/')
  ) {
    const relPath = trimmed.replace(/^https?:\/\/avlive\.com\.pk/i, '');
    const idToken = await auth.currentUser?.getIdToken().catch(() => null);
    if (!idToken) return { deleted: false, reason: 'Admin sign-in required' };
    const res = await fetch('/api/admin/media', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ path: relPath }),
    });
    return {
      deleted: res.ok,
      reason: res.ok ? undefined : `Local media delete returned ${res.status}`,
    };
  }

  const parsed = parseStorageLocationFromUrl(trimmed);
  const bucket = parsed?.bucket || PRODUCTS_STORAGE_BUCKET;
  const objectPath = parsed?.objectPath || (trimmed.startsWith(`${PRODUCTS_FOLDER_PREFIX}/`) ? trimmed : '');

  if (!objectPath) {
    return { deleted: false, reason: 'External non-storage URL (removed from product only)' };
  }

  // Try GCS OAuth first when deleting from studio-5367437135-24ac6 bucket
  const oauthToken = getGcsOAuthToken();
  if (oauthToken && bucket === PRODUCTS_STORAGE_BUCKET) {
    try {
      const delUrl = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(
        bucket
      )}/o/${encodeURIComponent(objectPath)}`;
      const res = await fetch(delUrl, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${oauthToken}` },
      });
      if (res.ok || res.status === 404) {
        return { deleted: true };
      }
      if (res.status === 401 || res.status === 403) {
        if (res.status === 401) clearGcsOAuthToken();
        return {
          deleted: false,
          authRequired: true,
          reason: `Authorization required to delete from gs://${bucket}/${objectPath}`,
        };
      }
    } catch (err: any) {
      return { deleted: false, reason: err?.message || 'GCS delete request failed' };
    }
  }

  // Try Firebase Storage SDK using matching bucket instance
  try {
    const targetInstance = bucket === PRODUCTS_STORAGE_BUCKET ? productsStorage : storage;
    const objRef = ref(targetInstance, objectPath);
    await deleteObject(objRef);
    return { deleted: true };
  } catch (err: any) {
    const msg = String(err?.message || err?.code || err || '');
    if (msg.includes('object-not-found')) {
      return { deleted: true };
    }
    const authRequired =
      msg.includes('unauthorized') || msg.includes('403') || msg.includes('401');
    return {
      deleted: false,
      authRequired,
      reason: authRequired
        ? `Connect Google Storage (${STORAGE_OWNER_EMAIL}) to delete from gs://${bucket}/${objectPath}`
        : msg,
    };
  }
}

export function formatStorageSavingsSummary(res: StorageUploadResult): string {
  const destLabel =
    res.provider === 'site-vault'
      ? 'Site Media Vault'
      : `Firebase Products Storage (gs://${PRODUCTS_STORAGE_BUCKET}/Products)`;
  return `${formatFileSizeKb(res.originalBytes)} → ${formatFileSizeKb(res.sizeBytes)} (${res.savingsPercent}% lighter) saved to ${destLabel}`;
}

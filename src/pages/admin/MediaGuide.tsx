import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  Image as ImageIcon,
  Database,
  Play,
  BookOpen,
  FileText,
  Upload,
  Zap,
  Trash2,
  RefreshCw,
  FolderOpen,
  Search,
  ArrowRight,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { auth, productsStorage, storage } from '../../lib/firebase/client';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { uploadToProductsStorage } from '../../lib/firebase/products-storage';
import { getProducts, updateProduct, Product } from '../../lib/firebase/firestore-helpers';
import { getCanonicalProductSlug } from '../../lib/gmc-feed';
import {
  compressImageFile,
  formatFileSizeKb,
  toSeoImageSlug,
  ImageOptimizationPreset,
  CompressedImageResult,
} from '../../lib/client-image-compressor';

type MediaFolder = 'products' | 'projects' | 'video-conference' | 'uploads';

interface VaultMediaItem {
  name: string;
  folder: string;
  path: string;
  fullUrl: string;
  sizeBytes: number;
  isHeavy: boolean;
  updatedAt: string;
}

const FOLDER_OPTIONS: Array<{
  id: MediaFolder;
  label: string;
  preset: ImageOptimizationPreset;
  hint: string;
}> = [
  {
    id: 'products',
    label: 'Product Hardware (/images/products/)',
    preset: 'product',
    hint: '1200×900 max WebP + GMC-compatible white-backdrop JPG (~40–90 KB)',
  },
  {
    id: 'projects',
    label: 'Real Event / Project (/images/projects/)',
    preset: 'project',
    hint: '1400×933 max WebP for real Pakistani installations & conferences',
  },
  {
    id: 'video-conference',
    label: 'Boardroom & Hub (/images/video-conference/)',
    preset: 'hero',
    hint: '1600×900 max WebP for hero sliders & Video Conference Hub banners',
  },
  {
    id: 'uploads',
    label: 'General Staging Vault (/images/uploads/)',
    preset: 'product',
    hint: '1200×900 max WebP — drop any photo here so our team/AI can wire it anywhere',
  },
];

export function MediaGuide() {
  const { user } = useAuth();
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [targetFolder, setTargetFolder] = useState<MediaFolder>('products');
  const [seoSlugInput, setSeoSlugInput] = useState('');
  const [includeGmcJpg, setIncludeGmcJpg] = useState(true);
  const [mirrorCloudCdn, setMirrorCloudCdn] = useState(false);

  const [pendingPreviews, setPendingPreviews] = useState<CompressedImageResult[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<{ text: string; tone: 'success' | 'error' } | null>(null);
  const [recentUploads, setRecentUploads] = useState<
    Array<{ url: string; fullUrl: string; gmcUrl?: string; bytes: number; cloudUrl?: string }>
  >([]);

  const [vaultItems, setVaultItems] = useState<VaultMediaItem[]>([]);
  const [vaultLoading, setVaultLoading] = useState(true);
  const [folderFilter, setFolderFilter] = useState<string>('all');
  const [vaultSearch, setVaultSearch] = useState('');
  const [reoptimizingPath, setReoptimizingPath] = useState<string | null>(null);

  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [assignBusyUrl, setAssignBusyUrl] = useState<string | null>(null);
  const [showLegacyGuide, setShowLegacyGuide] = useState(false);

  const activeFolderConfig =
    FOLDER_OPTIONS.find((f) => f.id === targetFolder) || FOLDER_OPTIONS[0];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getAuthToken = async (): Promise<string | null> => {
    try {
      return (await auth.currentUser?.getIdToken()) || null;
    } catch {
      return null;
    }
  };

  const loadVault = useCallback(async () => {
    setVaultLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        setVaultLoading(false);
        return;
      }
      const res = await fetch('/api/admin/media/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setVaultItems(Array.isArray(data.items) ? data.items : []);
      }
    } catch (err) {
      console.error('Failed to load media vault:', err);
    } finally {
      setVaultLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadVault();
    getProducts()
      .then((list) => {
        const sorted = [...list].sort((a, b) =>
          (a.productName || '').localeCompare(b.productName || '')
        );
        setCatalogProducts(sorted);
      })
      .catch(() => {});
  }, [loadVault]);

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    const prod = catalogProducts.find((p) => p.id === productId);
    if (prod) {
      const slug = getCanonicalProductSlug(prod, prod.id).replace(/-pakistan$/, '');
      setSeoSlugInput(slug);
      setTargetFolder('products');
      setIncludeGmcJpg(true);
    }
  };

  const processIncomingFiles = async (files: FileList | File[]) => {
    const fileArr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArr.length === 0) {
      setUploadNotice({ text: 'Please select valid PNG, JPG, or WebP image files.', tone: 'error' });
      return;
    }

    setIsCompressing(true);
    setUploadNotice(null);
    try {
      const results: CompressedImageResult[] = [];
      for (let i = 0; i < fileArr.length; i++) {
        const f = fileArr[i];
        const customSlug =
          seoSlugInput.trim() && fileArr.length === 1
            ? toSeoImageSlug(seoSlugInput)
            : seoSlugInput.trim()
            ? `${toSeoImageSlug(seoSlugInput)}-${i + 1}`
            : toSeoImageSlug(f.name);
        const compressed = await compressImageFile(f, {
          preset: activeFolderConfig.preset,
          seoSlug: customSlug,
          includeGmcJpg: targetFolder === 'products' ? includeGmcJpg : false,
        });
        results.push(compressed);
      }
      setPendingPreviews((prev) => [...prev, ...results]);
    } catch (err: any) {
      setUploadNotice({
        text: err?.message || 'Failed to compress selected images in browser.',
        tone: 'error',
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleUploadAll = async () => {
    if (pendingPreviews.length === 0) return;
    setIsUploading(true);
    setUploadNotice(null);
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Admin login session required to save files.');
      }

      const uploadedBatch: Array<{
        url: string;
        fullUrl: string;
        gmcUrl?: string;
        bytes: number;
        cloudUrl?: string;
      }> = [];

      for (const item of pendingPreviews) {
        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            folder: targetFolder,
            filename: item.seoSlug,
            webpBase64: item.webpBase64,
            jpgBase64: item.jpgBase64,
          }),
        });

        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload?.error || `Failed to save ${item.seoSlug}`);
        }

        let cloudUrl: string | undefined;
        if (mirrorCloudCdn) {
          try {
            if (targetFolder === 'products') {
              const cloudRes = await uploadToProductsStorage(item.webpFile, {
                slugHint: item.seoSlug,
                includeGmcJpg: false,
                allowSiteVaultFallback: false,
              });
              cloudUrl = cloudRes.downloadUrl;
            } else {
              const sRef = storageRef(productsStorage || storage, `media/${targetFolder}/${item.webpFile.name}`);
              await uploadBytes(sRef, item.webpFile);
              cloudUrl = await getDownloadURL(sRef);
            }
          } catch {
            // Local workspace upload already succeeded; cloud backup is optional
          }
        }

        uploadedBatch.push({
          url: payload.url,
          fullUrl: payload.fullUrl,
          gmcUrl: payload.gmcUrl,
          bytes: payload.bytes || item.optimizedBytes,
          cloudUrl,
        });
        URL.revokeObjectURL(item.previewUrl);
      }

      setRecentUploads((prev) => [...uploadedBatch, ...prev]);
      setPendingPreviews([]);
      setUploadNotice({
        text: `Saved ${uploadedBatch.length} lightweight image(s) to /images/${targetFolder}/ — ready for instant use & AI updates.`,
        tone: 'success',
      });
      loadVault();
    } catch (err: any) {
      setUploadNotice({
        text: err?.message || 'Upload failed. Please verify your admin session.',
        tone: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAssignToProduct = async (imageUrl: string, mode: 'main' | 'gallery') => {
    if (!selectedProductId) {
      setUploadNotice({
        text: 'Select a target product in the "Quick-Assign Product" dropdown first.',
        tone: 'error',
      });
      return;
    }
    const prod = catalogProducts.find((p) => p.id === selectedProductId);
    if (!prod || !prod.id) return;

    setAssignBusyUrl(imageUrl);
    try {
      const normalizedUrl = imageUrl.startsWith('http')
        ? imageUrl
        : `https://avlive.com.pk${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
      const existing = Array.isArray(prod.images) ? prod.images.filter(Boolean) : [];
      const nextImages =
        mode === 'main'
          ? Array.from(new Set([normalizedUrl, ...existing]))
          : Array.from(new Set([...existing, normalizedUrl]));

      await updateProduct(prod.id, {
        image: mode === 'main' ? normalizedUrl : prod.image || normalizedUrl,
        images: nextImages,
        additionalImages: nextImages.slice(1, 11),
        imagesCustomized: true,
      });

      setCatalogProducts((prev) =>
        prev.map((item) =>
          item.id === prod.id
            ? {
                ...item,
                image: mode === 'main' ? normalizedUrl : item.image || normalizedUrl,
                images: nextImages,
              }
            : item
        )
      );

      setUploadNotice({
        text: `${mode === 'main' ? 'Replaced main image' : 'Added to gallery'} on "${prod.productName}"!`,
        tone: 'success',
      });
    } catch (err: any) {
      setUploadNotice({
        text: err?.message || 'Could not update product in Firestore (check admin permissions).',
        tone: 'error',
      });
    } finally {
      setAssignBusyUrl(null);
    }
  };

  const handleReoptimizeExisting = async (item: VaultMediaItem) => {
    setReoptimizingPath(item.path);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Admin login required');
      const imgRes = await fetch(item.path);
      const blob = await imgRes.blob();
      const file = new File([blob], item.name, { type: blob.type || 'image/jpeg' });
      const preset: ImageOptimizationPreset =
        item.folder === 'projects'
          ? 'project'
          : item.folder === 'video-conference'
          ? 'hero'
          : 'product';
      const compressed = await compressImageFile(file, {
        preset,
        seoSlug: item.name.replace(/\.[^.]+$/, ''),
        includeGmcJpg: item.name.toLowerCase().endsWith('.jpg') || item.name.toLowerCase().endsWith('.jpeg'),
      });
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          folder: item.folder === 'teleprompter' ? 'uploads' : item.folder,
          filename: compressed.seoSlug,
          webpBase64: item.name.toLowerCase().endsWith('.webp') ? compressed.webpBase64 : '',
          jpgBase64: !item.name.toLowerCase().endsWith('.webp') ? compressed.jpgBase64 || compressed.webpBase64 : '',
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || 'Re-optimization failed');
      }
      URL.revokeObjectURL(compressed.previewUrl);
      setUploadNotice({
        text: `Shrank ${item.name}: ${formatFileSizeKb(item.sizeBytes)} → ${formatFileSizeKb(
          compressed.jpgBytes || compressed.optimizedBytes
        )}`,
        tone: 'success',
      });
      loadVault();
    } catch (err: any) {
      setUploadNotice({ text: err?.message || 'Re-optimization failed.', tone: 'error' });
    } finally {
      setReoptimizingPath(null);
    }
  };

  const handleDeleteAsset = async (item: VaultMediaItem) => {
    if (!confirm(`Delete ${item.path} from the workspace? Make sure no active page links to it.`)) return;
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Admin login required');
      const res = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ path: item.path }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setVaultItems((prev) => prev.filter((x) => x.path !== item.path));
      setUploadNotice({ text: `Deleted ${item.path}`, tone: 'success' });
    } catch (err: any) {
      setUploadNotice({ text: err?.message || 'Delete failed', tone: 'error' });
    }
  };

  const filteredVaultItems = useMemo(() => {
    const q = vaultSearch.trim().toLowerCase();
    return vaultItems.filter((item) => {
      if (folderFilter !== 'all' && item.folder !== folderFilter) return false;
      if (q && !item.name.toLowerCase().includes(q) && !item.folder.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [vaultItems, folderFilter, vaultSearch]);

  const vaultStats = useMemo(() => {
    const totalBytes = vaultItems.reduce((acc, i) => acc + i.sizeBytes, 0);
    const heavyCount = vaultItems.filter((i) => i.isHeavy).length;
    return { count: vaultItems.length, totalBytes, heavyCount };
  }, [vaultItems]);

  const cheatSheetItems = [
    {
      media: 'Product Image',
      url: 'https://avlive.com.pk/images/products/polycom-group-500-eagleeye-iv.jpg',
      location: '/admin/products-all → Edit Product → Main Image URL',
      type: 'Product',
    },
    {
      media: 'Hero Slide',
      url: '/images/projects/world-bank-president-stage.webp',
      location: '/admin/homepage-editor → Hero Slides → Image URL',
      type: 'Homepage',
    },
    {
      media: 'Project / Case Study',
      url: '/images/projects/meta-values-summit.webp',
      location: 'Public /images/projects/ folder',
      type: 'Homepage',
    },
    {
      media: 'Video Conference Room',
      url: '/images/video-conference/boardroom-hero.webp',
      location: 'Public /images/video-conference/ folder',
      type: 'Services',
    },
  ];

  const dosAndDonts = [
    {
      type: 'do',
      title: 'What to Do (Lightweight Best Practices)',
      items: [
        {
          text: 'Upload directly via the Optimizer Dropzone above',
          desc: 'Photos are automatically resized & compressed to < 90 KB WebP before saving.',
        },
        {
          text: 'Use descriptive SEO slugs (e.g. poly-x52-boardroom)',
          desc: 'Clean filenames improve Google Image Search rankings and let us update pages instantly.',
        },
        {
          text: 'Target under 150 KB per image',
          desc: 'Keeps mobile Lighthouse Performance at 98–100 and instant LCP on 4G.',
        },
      ],
    },
    {
      type: 'dont',
      title: 'What NOT to Do',
      items: [
        {
          text: 'Never upload raw 4MB–10MB DSLR or PNG screenshots',
          desc: 'Uncompressed files bloat mobile page weight and harm SEO.',
        },
        {
          text: 'Never paste C:\\Users\\... local computer file paths',
          desc: 'Always upload into the Vault so files live at https://avlive.com.pk/images/...',
        },
        {
          text: 'Never use stock placeholder URLs (via.placeholder.com)',
          desc: 'Delete placeholder assets from the Vault grid and assign real hardware photos.',
        },
      ],
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm"
        id="media-guide-header"
      >
        <div>
          <div className="flex items-center gap-2 text-[#00B4D8] font-bold text-xs uppercase tracking-widest mb-1">
            <Zap size={14} />
            Zero-Bloat Media Pipeline
          </div>
          <h1 className="text-3xl font-black text-[#1A2B4C] tracking-tight uppercase">
            Media Vault &amp; Auto-Image Optimizer
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Drop any raw PNG/JPG photos here. Your browser automatically shrinks them to ultra-lightweight
            WebP (&lt; 90 KB) and saves them straight into <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">/public/images/</code> so
            you can assign them in 1 click or ask the AI to wire them across the site.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 border border-emerald-200">
            <CheckCircle2 size={14} /> {vaultStats.count} Assets ({formatFileSizeKb(vaultStats.totalBytes)})
          </div>
          {vaultStats.heavyCount > 0 && (
            <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 border border-amber-200">
              {vaultStats.heavyCount} Heavy (&gt;200 KB)
            </div>
          )}
        </div>
      </div>

      {uploadNotice && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 ${
            uploadNotice.tone === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <span>{uploadNotice.text}</span>
          <button
            type="button"
            onClick={() => setUploadNotice(null)}
            className="text-current opacity-60 hover:opacity-100 font-black"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Upload & Auto-Compress Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-[#1A2B4C] font-black text-sm uppercase tracking-wider">
            <Sparkles size={16} className="text-[#00B4D8]" />
            1. Configure Destination &amp; Weight Preset
          </div>

          <div>
            <label
              htmlFor="vault-folder-select"
              className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5"
            >
              Target Workspace Folder
            </label>
            <select
              id="vault-folder-select"
              value={targetFolder}
              onChange={(e) => setTargetFolder(e.target.value as MediaFolder)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
            >
              {FOLDER_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-500 mt-1.5 leading-snug">{activeFolderConfig.hint}</p>
          </div>

          <div>
            <label
              htmlFor="vault-product-select"
              className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5"
            >
              Quick-Assign Product (Optional)
            </label>
            <select
              id="vault-product-select"
              value={selectedProductId}
              onChange={(e) => handleSelectProduct(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
            >
              <option value="">-- Select product to swap its image --</option>
              {catalogProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productName} ({p.brand || 'AV'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="vault-seo-slug"
              className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5"
            >
              SEO Filename Slug (Auto-formatted)
            </label>
            <input
              id="vault-seo-slug"
              type="text"
              placeholder="e.g. poly-studio-x52-boardroom"
              value={seoSlugInput}
              onChange={(e) => setSeoSlugInput(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-mono text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
            />
          </div>

          <div className="space-y-2.5 pt-1">
            {targetFolder === 'products' && (
              <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeGmcJpg}
                  onChange={(e) => setIncludeGmcJpg(e.target.checked)}
                  className="rounded border-gray-300 text-[#00B4D8] focus:ring-[#00B4D8]"
                />
                <span>Also save compressed .jpg for Google Merchant Center</span>
              </label>
            )}
            <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={mirrorCloudCdn}
                onChange={(e) => setMirrorCloudCdn(e.target.checked)}
                className="rounded border-gray-300 text-[#00B4D8] focus:ring-[#00B4D8]"
              />
              <span>Also backup lightweight WebP to Firebase Cloud Storage</span>
            </label>
          </div>
        </div>

        {/* Dropzone & Compression Preview Column */}
        <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm lg:col-span-2 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-[#1A2B4C] font-black text-sm uppercase tracking-wider">
                <Upload size={16} className="text-[#00B4D8]" />
                2. Drop Photos (Auto-Compressed Client-Side Before Upload)
              </div>
              {pendingPreviews.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    pendingPreviews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
                    setPendingPreviews([]);
                  }}
                  className="text-[11px] font-bold text-red-500 hover:underline"
                >
                  Clear Queue
                </button>
              )}
            </div>

            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.length) {
                  processIncomingFiles(e.dataTransfer.files);
                }
              }}
              className="block border-2 border-dashed border-[#00B4D8]/40 bg-[#00B4D8]/5 hover:bg-[#00B4D8]/10 rounded-3xl p-8 text-center cursor-pointer transition-all"
            >
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    processIncomingFiles(e.target.files);
                  }
                  e.target.value = '';
                }}
              />
              {isCompressing ? (
                <div className="flex flex-col items-center gap-2 text-[#1A2B4C]">
                  <Loader2 className="animate-spin text-[#00B4D8]" size={28} />
                  <span className="text-xs font-black uppercase tracking-wider">
                    Resizing &amp; Encoding Lightweight WebP...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-gray-100 flex items-center justify-center text-[#00B4D8]">
                    <Upload size={22} />
                  </div>
                  <div className="text-sm font-black text-[#1A2B4C]">
                    Click or Drag &amp; Drop Any High-Res Photos Here
                  </div>
                  <div className="text-xs text-gray-500">
                    A 5 MB camera photo shrinks to ~50 KB WebP right in your browser before uploading.
                  </div>
                </div>
              )}
            </label>
          </div>

          {pendingPreviews.length > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {pendingPreviews.map((item, idx) => (
                  <div
                    key={`${item.seoSlug}-${idx}`}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100"
                  >
                    <img
                      src={item.previewUrl}
                      alt={item.seoSlug}
                      title={item.seoSlug}
                      className="w-14 h-14 rounded-xl object-cover bg-white border border-gray-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-mono font-bold text-[#1A2B4C] truncate">
                        {item.seoSlug}.webp
                      </div>
                      <div className="text-[11px] font-bold text-emerald-600">
                        {formatFileSizeKb(item.originalBytes)} → {formatFileSizeKb(item.optimizedBytes)} (
                        {item.savingsPercent}% saved)
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {item.width}×{item.height}px{item.jpgBytes ? ` • JPG ${formatFileSizeKb(item.jpgBytes)}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                disabled={isUploading}
                onClick={handleUploadAll}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#1A2B4C] hover:bg-[#00B4D8] text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving to /images/{targetFolder}/...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Save {pendingPreviews.length} Optimized File(s) to /images/{targetFolder}/
                  </>
                )}
              </button>
            </div>
          )}

          {recentUploads.length > 0 && (
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
              <div className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">
                Just Uploaded &amp; Ready Across Website
              </div>
              {recentUploads.slice(0, 4).map((up, idx) => (
                <div
                  key={`${up.url}-${idx}`}
                  className="bg-white p-2.5 rounded-xl border border-emerald-100 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={up.url}
                      alt={up.url}
                      title={up.url}
                      className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-mono font-bold text-[#1A2B4C] truncate">{up.url}</div>
                      <div className="text-[10px] text-emerald-700 font-bold">
                        {formatFileSizeKb(up.bytes)} • HTTP 200 Static Ready
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(up.gmcUrl || up.fullUrl, `up-full-${idx}`)}
                      className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-[#1A2B4C] hover:text-white text-[#1A2B4C] font-bold text-[11px] flex items-center gap-1"
                    >
                      {copiedText === `up-full-${idx}` ? <Check size={12} /> : <Copy size={12} />}
                      {copiedText === `up-full-${idx}` ? 'Copied' : 'Copy HTTPS'}
                    </button>
                    {selectedProductId && (
                      <button
                        type="button"
                        disabled={assignBusyUrl === (up.gmcUrl || up.url)}
                        onClick={() => handleAssignToProduct(up.gmcUrl || up.url, 'main')}
                        className="px-2.5 py-1.5 rounded-lg bg-[#00B4D8] hover:bg-[#1A2B4C] text-white font-bold text-[11px] flex items-center gap-1"
                      >
                        <ArrowRight size={12} /> Set Main Image
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Live Vault Browser & Weight Auditor */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-[#1A2B4C] uppercase tracking-tight flex items-center gap-2">
              <FolderOpen className="text-[#00B4D8]" size={20} />
              Workspace Image Vault &amp; Weight Audit
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Inspect every static image in <code className="font-mono bg-gray-100 px-1 rounded">/public/images/</code>, shrink heavy files &gt;200 KB in 1 click, assign to products, or delete useless assets.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Filter filename..."
                value={vaultSearch}
                onChange={(e) => setVaultSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
              />
            </div>
            <button
              type="button"
              onClick={loadVault}
              className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-[#1A2B4C] hover:text-white text-xs font-bold text-[#1A2B4C] flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={13} className={vaultLoading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Folder Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {['all', 'uploads', 'products', 'projects', 'video-conference', 'teleprompter'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFolderFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                folderFilter === f
                  ? 'bg-[#1A2B4C] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? `All (${vaultItems.length})` : `${f} (${vaultItems.filter((x) => x.folder === f).length})`}
            </button>
          ))}
        </div>

        {vaultLoading ? (
          <div className="py-16 text-center text-gray-400 text-xs font-bold flex flex-col items-center gap-2">
            <Loader2 size={24} className="animate-spin text-[#00B4D8]" />
            Scanning workspace image vault...
          </div>
        ) : filteredVaultItems.length === 0 ? (
          <div className="py-14 text-center rounded-3xl border-2 border-dashed border-gray-100 text-gray-400 text-xs font-bold">
            No matching images found in this folder. Upload one above!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVaultItems.map((item) => (
              <div
                key={item.path}
                className="rounded-2xl border border-gray-100 bg-gray-50/50 overflow-hidden flex flex-col hover:shadow-md transition-all"
              >
                <div className="relative h-36 bg-white border-b border-gray-100 flex items-center justify-center p-2">
                  <img
                    loading="lazy"
                    src={item.path}
                    alt={item.name}
                    title={item.path}
                    className="max-h-full max-w-full object-contain"
                  />
                  <span
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-black ${
                      item.isHeavy
                        ? 'bg-red-100 text-red-700'
                        : item.sizeBytes > 120 * 1024
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {formatFileSizeKb(item.sizeBytes)}
                  </span>
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#1A2B4C]/85 text-white text-[9px] font-bold uppercase">
                    {item.folder}
                  </span>
                </div>

                <div className="p-3.5 flex flex-col flex-1 gap-2">
                  <div className="font-mono text-[11px] font-bold text-[#1A2B4C] truncate" title={item.path}>
                    {item.name}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.path, `path-${item.path}`)}
                      className="flex-1 px-2 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-[#00B4D8] text-[10px] font-bold text-[#1A2B4C] flex items-center justify-center gap-1"
                    >
                      {copiedText === `path-${item.path}` ? <Check size={11} /> : <Copy size={11} />}
                      {copiedText === `path-${item.path}` ? 'Copied' : 'Copy Path'}
                    </button>

                    {selectedProductId && (
                      <button
                        type="button"
                        disabled={assignBusyUrl === item.path}
                        onClick={() => handleAssignToProduct(item.path, 'main')}
                        className="flex-1 px-2 py-1.5 rounded-lg bg-[#00B4D8] hover:bg-[#1A2B4C] text-white text-[10px] font-bold flex items-center justify-center gap-1"
                      >
                        Set Product
                      </button>
                    )}

                    {item.isHeavy && (
                      <button
                        type="button"
                        disabled={reoptimizingPath === item.path}
                        onClick={() => handleReoptimizeExisting(item)}
                        title="Shrink this heavy image below 120 KB"
                        className="px-2 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-500 hover:text-white text-amber-900 text-[10px] font-bold flex items-center gap-1"
                      >
                        <Zap size={11} /> {reoptimizingPath === item.path ? '...' : 'Shrink'}
                      </button>
                    )}

                    {item.folder !== 'teleprompter' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAsset(item)}
                        aria-label={`Delete ${item.name}`}
                        title="Delete file"
                        className="px-2 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-400 text-[10px] font-bold"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collapsible Legacy URL Reference Guide */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowLegacyGuide((v) => !v)}
          className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <BookOpen size={18} className="text-[#00B4D8]" />
            <div>
              <div className="text-sm font-black text-[#1A2B4C] uppercase tracking-wider">
                Quick URL Reference &amp; Lightweight Media Rules
              </div>
              <div className="text-xs text-gray-500">
                Where paths map across Products, Hero Slides, and Services
              </div>
            </div>
          </div>
          {showLegacyGuide ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showLegacyGuide && (
          <div className="p-8 pt-2 space-y-8 border-t border-gray-100">
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left border-collapse" id="cheat-sheet-table">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Media Type</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Paste Location</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Example URL</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {cheatSheetItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-[#1A2B4C]">{item.media}</td>
                      <td className="p-4 text-xs font-semibold text-gray-500">{item.location}</td>
                      <td className="p-4 font-mono text-xs text-gray-400 truncate max-w-xs">{item.url}</td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.url, `ref-${index}`)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-[#00B4D8] hover:text-white text-gray-600 inline-flex items-center gap-1.5"
                        >
                          {copiedText === `ref-${index}` ? <Check size={12} /> : <Copy size={12} />}
                          {copiedText === `ref-${index}` ? 'Copied' : 'Copy Link'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="dos-donts-section">
              {dosAndDonts.map((group, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-3xl border ${
                    group.type === 'do'
                      ? 'bg-emerald-50/20 border-emerald-500/15'
                      : 'bg-red-50/20 border-red-500/15'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    {group.type === 'do' ? (
                      <CheckCircle2 className="text-emerald-500" size={18} />
                    ) : (
                      <XCircle className="text-red-500" size={18} />
                    )}
                    <h3 className="text-sm font-black text-[#1A2B4C] uppercase tracking-tight">
                      {group.title}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {group.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-1">
                        <span
                          className={`font-mono text-xs font-bold ${
                            group.type === 'do' ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {item.text}
                        </span>
                        <span className="text-xs text-gray-500">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Upload,
  Trash2,
  RefreshCw,
  Check,
  Copy,
  ImageIcon,
  Search,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Plus,
  Star,
  Cloud,
} from 'lucide-react';
import {
  listProductsStorageImages,
  uploadToProductsStorage,
  deleteFromProductsStorage,
  connectProductsStorageOAuth,
  getGcsOAuthToken,
  formatStorageSavingsSummary,
  PRODUCTS_STORAGE_BUCKET,
  PRODUCTS_FOLDER_PREFIX,
  STORAGE_OWNER_EMAIL,
  StorageProductImage,
} from '../../lib/firebase/products-storage';
import { formatFileSizeKb } from '../../lib/client-image-compressor';

interface ProductsStorageBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSlugHint?: string;
  hasActiveProductForm: boolean;
  onSelectAsMain?: (url: string) => void;
  onAddToAdditional?: (url: string) => void;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

export function ProductsStorageBrowserModal({
  isOpen,
  onClose,
  defaultSlugHint,
  hasActiveProductForm,
  onSelectAsMain,
  onAddToAdditional,
  onNotify,
}: ProductsStorageBrowserModalProps) {
  const [items, setItems] = useState<StorageProductImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [providerLabel, setProviderLabel] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [confirmDeletePath, setConfirmDeletePath] = useState<string | null>(null);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await listProductsStorageImages();
      setItems(res.items);
      setAuthRequired(res.authRequired);
      setProviderLabel(res.provider);
      if (res.error && !res.authRequired) {
        setErrorMsg(res.error);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to read Products storage folder.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchItems();
    }
  }, [isOpen, fetchItems]);

  const handleConnectGoogleStorage = async () => {
    setConnecting(true);
    setErrorMsg(null);
    try {
      await connectProductsStorageOAuth();
      onNotify?.(`Connected Google Storage as ${STORAGE_OWNER_EMAIL}.`, 'success');
      await fetchItems();
    } catch (err: any) {
      const msg = err?.message || `Failed to connect Google Storage (${STORAGE_OWNER_EMAIL}).`;
      setErrorMsg(msg);
      onNotify?.(msg, 'error');
    } finally {
      setConnecting(false);
    }
  };

  const handleUploadFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) {
      setErrorMsg('Please select PNG, JPG, or WebP images.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    try {
      let lastSummary = '';
      for (const file of files) {
        const uploaded = await uploadToProductsStorage(file, {
          slugHint: defaultSlugHint || file.name,
          includeGmcJpg: true,
          allowSiteVaultFallback: true,
        });
        lastSummary = formatStorageSavingsSummary(uploaded);
      }
      onNotify?.(
        files.length === 1 ? lastSummary : `Uploaded ${files.length} compressed product images.`,
        'success'
      );
      await fetchItems();
    } catch (err: any) {
      const msg = err?.message || 'Image upload failed.';
      setErrorMsg(msg);
      onNotify?.(msg, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteObject = async (item: StorageProductImage) => {
    setDeletingPath(item.fullPath);
    try {
      const res = await deleteFromProductsStorage(item.downloadUrl || item.fullPath);
      if (!res.deleted) {
        if (res.authRequired) {
          setAuthRequired(true);
        }
        throw new Error(res.reason || 'Could not delete object from storage.');
      }
      setItems((prev) => prev.filter((x) => x.fullPath !== item.fullPath));
      setConfirmDeletePath(null);
      onNotify?.(`Deleted ${item.name} from Products storage.`, 'success');
    } catch (err: any) {
      const msg = err?.message || 'Delete failed.';
      setErrorMsg(msg);
      onNotify?.(msg, 'error');
    } finally {
      setDeletingPath(null);
    }
  };

  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) => i.name.toLowerCase().includes(q) || i.fullPath.toLowerCase().includes(q)
    );
  }, [items, searchTerm]);

  if (!isOpen) return null;

  const isOAuthConnected = Boolean(getGcsOAuthToken());

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#1A2B4C]/55 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 bg-gray-50/70">
          <div>
            <div className="flex items-center gap-2">
              <Cloud size={18} className="text-[#00B4D8]" />
              <h2 className="text-lg font-black text-[#1A2B4C] tracking-tight">
                Firebase Products Storage Bucket
              </h2>
            </div>
            <p className="text-[11px] font-mono text-gray-500 mt-0.5">
              gs://{PRODUCTS_STORAGE_BUCKET}/{PRODUCTS_FOLDER_PREFIX}/ · Auto-compressed WebP (~40–85 KB)
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isOAuthConnected || providerLabel === 'firebase-sdk' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                <ShieldCheck size={13} /> Storage Linked
              </span>
            ) : (
              <button
                type="button"
                onClick={handleConnectGoogleStorage}
                disabled={connecting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00B4D8] hover:bg-[#1A2B4C] text-white text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-60"
              >
                {connecting ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                Connect {STORAGE_OWNER_EMAIL}
              </button>
            )}
            <button
              type="button"
              onClick={fetchItems}
              disabled={loading}
              aria-label="Refresh Products storage list"
              className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-[#00B4D8] flex items-center justify-center"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close storage browser"
              className="w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Upload & Filter Bar */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter files in Products/..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
            />
          </div>

          <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A2B4C] hover:bg-[#00B4D8] text-white text-[10px] font-black uppercase tracking-widest transition-colors">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            <span>{uploading ? 'Compressing & Uploading...' : 'Upload to Products/'}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              className="hidden"
              onChange={(e) => {
                handleUploadFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/50">
          {authRequired && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 text-xs text-amber-950">
                <AlertCircle size={17} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black">Google Cloud Storage Authorization Needed</p>
                  <p className="text-amber-800 mt-0.5">
                    Click &ldquo;Connect {STORAGE_OWNER_EMAIL}&rdquo; to grant this browser session direct read, upload, and delete access to{' '}
                    <code className="font-mono">gs://{PRODUCTS_STORAGE_BUCKET}/{PRODUCTS_FOLDER_PREFIX}</code>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleConnectGoogleStorage}
                disabled={connecting}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-wider"
              >
                {connecting ? 'Connecting...' : 'Authorize Storage'}
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={15} className="text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#00B4D8] mx-auto mb-3" />
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                Loading gs://{PRODUCTS_STORAGE_BUCKET}/{PRODUCTS_FOLDER_PREFIX}/...
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
              <ImageIcon size={28} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-[#1A2B4C]">
                {authRequired ? 'Authorize storage above to view Products/ files' : 'No images found in Products/'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Upload raw product photos above — they are compressed to fast WebP automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.fullPath}
                  className="bg-white rounded-2xl border border-gray-200/80 p-3 shadow-sm flex flex-col gap-3"
                >
                  <div className="aspect-[4/3] bg-white rounded-xl border border-gray-100 overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={item.downloadUrl}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1A2B4C] truncate" title={item.name}>
                      {item.name}
                    </p>
                    <p className="text-[10px] font-mono text-gray-400">
                      {formatFileSizeKb(item.sizeBytes)} · {item.contentType}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-gray-100">
                    {hasActiveProductForm && onSelectAsMain && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectAsMain(item.downloadUrl);
                          onNotify?.(`Set ${item.name} as Main Image.`, 'success');
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1A2B4C] hover:bg-[#00B4D8] text-white text-[10px] font-black uppercase tracking-wider transition-colors"
                      >
                        <Star size={11} /> Main
                      </button>
                    )}
                    {hasActiveProductForm && onAddToAdditional && (
                      <button
                        type="button"
                        onClick={() => {
                          onAddToAdditional(item.downloadUrl);
                          onNotify?.(`Added ${item.name} to Additional Images.`, 'success');
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0077B6] border border-sky-200 text-[10px] font-black uppercase tracking-wider transition-colors"
                      >
                        <Plus size={11} /> Gallery
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(item.downloadUrl);
                        setCopiedPath(item.fullPath);
                        setTimeout(() => setCopiedPath(null), 1800);
                      }}
                      title="Copy Firebase Storage URL"
                      className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200"
                    >
                      {copiedPath === item.fullPath ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    </button>

                    {confirmDeletePath === item.fullPath ? (
                      <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-lg px-1.5 py-1">
                        <button
                          type="button"
                          disabled={deletingPath === item.fullPath}
                          onClick={() => handleDeleteObject(item)}
                          className="px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-black uppercase"
                        >
                          {deletingPath === item.fullPath ? '...' : 'Del'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeletePath(null)}
                          className="px-1.5 py-0.5 rounded bg-white text-gray-600 text-[9px] font-bold border border-gray-200"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeletePath(item.fullPath)}
                        title="Delete from Firebase Storage"
                        aria-label={`Delete ${item.name} from Storage`}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

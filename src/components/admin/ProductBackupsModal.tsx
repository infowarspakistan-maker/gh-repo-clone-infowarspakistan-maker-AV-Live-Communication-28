import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  X,
  RotateCcw,
  Download,
  Trash2,
  Loader2,
  Archive,
  Camera,
  ImageIcon,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  listProductBackups,
  restoreProductFromBackup,
  deleteProductBackup,
  saveProductBackupSnapshot,
  Product,
  ProductBackup,
} from '../../lib/firebase/firestore-helpers';

interface ProductBackupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

function formatBackupTimestamp(ts: any): string {
  if (!ts) return 'Just now';
  try {
    const date = typeof ts?.toDate === 'function' ? ts.toDate() : new Date(ts);
    return date.toLocaleString('en-PK', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return 'Saved';
  }
}

export function ProductBackupsModal({
  isOpen,
  onClose,
  products,
  onNotify,
}: ProductBackupsModalProps) {
  const [backups, setBackups] = useState<ProductBackup[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [snapshotting, setSnapshotting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadBackups = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listProductBackups();
      setBackups(list);
    } catch (err: any) {
      onNotify?.(err?.message || 'Failed to load product backups.', 'error');
    } finally {
      setLoading(false);
    }
  }, [onNotify]);

  useEffect(() => {
    if (isOpen) {
      loadBackups();
    }
  }, [isOpen, loadBackups]);

  const handleSnapshotAll = async () => {
    if (products.length === 0) return;
    setSnapshotting(true);
    try {
      let count = 0;
      for (const prod of products) {
        if (!prod.id) continue;
        await saveProductBackupSnapshot({ ...prod, id: prod.id }, 'manual_snapshot');
        count++;
      }
      onNotify?.(`Saved ${count} product backup snapshot(s) to Firestore.`, 'success');
      await loadBackups();
    } catch (err: any) {
      onNotify?.(err?.message || 'Snapshot failed.', 'error');
    } finally {
      setSnapshotting(false);
    }
  };

  const handleDownloadJsonBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      totalActiveProducts: products.length,
      totalBackupRecords: backups.length,
      activeProducts: products,
      backupSnapshots: backups,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avlive-products-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify?.('Downloaded full catalog + backup history JSON.', 'success');
  };

  const handleRestore = async (backup: ProductBackup) => {
    if (!backup.id) return;
    setRestoringId(backup.id);
    try {
      await restoreProductFromBackup(backup.id);
      onNotify?.(`Restored "${backup.productName}" (with images & attributes) to catalog.`, 'success');
    } catch (err: any) {
      onNotify?.(err?.message || 'Restore failed.', 'error');
    } finally {
      setRestoringId(null);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    try {
      await deleteProductBackup(backupId);
      setBackups((prev) => prev.filter((b) => b.id !== backupId));
      setConfirmDeleteId(null);
      onNotify?.('Backup entry removed.', 'success');
    } catch (err: any) {
      onNotify?.(err?.message || 'Could not remove backup entry.', 'error');
    }
  };

  if (!isOpen) return null;

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
        className="relative w-full max-w-4xl max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 flex flex-col"
      >
        <div className="px-6 py-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 bg-gray-50/70">
          <div>
            <div className="flex items-center gap-2">
              <Archive size={18} className="text-[#00B4D8]" />
              <h2 className="text-lg font-black text-[#1A2B4C] tracking-tight">
                Product Backups &amp; Deleted Item Recovery
              </h2>
            </div>
            <p className="text-[11px] font-medium text-gray-500 mt-0.5">
              Automatic snapshots are created before deleting any product or changing its images so nothing is lost.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadBackups}
              disabled={loading}
              aria-label="Refresh backup list"
              className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-[#00B4D8] flex items-center justify-center"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close backups modal"
              className="w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-3.5 border-b border-gray-100 bg-white flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSnapshotAll}
              disabled={snapshotting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A2B4C] hover:bg-[#00B4D8] text-white text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-60"
            >
              {snapshotting ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
              {snapshotting ? 'Saving Snapshots...' : `Snapshot All (${products.length})`}
            </button>
            <button
              type="button"
              onClick={handleDownloadJsonBackup}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider transition-colors"
            >
              <Download size={13} /> Download JSON Backup
            </button>
          </div>
          <span className="text-[11px] font-mono text-gray-400">
            {backups.length} backup record(s)
          </span>
        </div>

        {/* List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-slate-50/50">
          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#00B4D8] mx-auto mb-3" />
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                Loading Product Backups...
              </p>
            </div>
          ) : backups.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200 px-6">
              <CheckCircle2 size={28} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-[#1A2B4C]">No product backups recorded yet.</p>
              <p className="text-xs text-gray-400 mt-1">
                Backups appear automatically whenever you delete a product or update images — or click &ldquo;Snapshot All&rdquo; above.
              </p>
            </div>
          ) : (
            backups.map((backup) => {
              const reasonBadge =
                backup.reason === 'before_delete'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : backup.reason === 'before_image_update'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-sky-50 text-[#0077B6] border-sky-200';
              const reasonLabel =
                backup.reason === 'before_delete'
                  ? 'Before Delete'
                  : backup.reason === 'before_image_update'
                  ? 'Before Image Edit'
                  : 'Manual Snapshot';

              return (
                <div
                  key={backup.id}
                  className="bg-white rounded-2xl border border-gray-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                      {backup.images?.[0] ? (
                        <img
                          src={backup.images[0]}
                          alt={backup.productName}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ImageIcon size={18} className="text-gray-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-[#1A2B4C] truncate max-w-[280px]">
                          {backup.productName}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md border text-[9px] font-black uppercase ${reasonBadge}`}>
                          {reasonLabel}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-gray-500 mt-0.5">
                        ID: {backup.gmcId || backup.originalProductId} · {backup.images?.length || 0} image(s) ·{' '}
                        {formatBackupTimestamp(backup.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={restoringId === backup.id}
                      onClick={() => handleRestore(backup)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider disabled:opacity-60"
                    >
                      {restoringId === backup.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <RotateCcw size={12} />
                      )}
                      Restore
                    </button>

                    {confirmDeleteId === backup.id ? (
                      <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-xl px-2 py-1">
                        <button
                          type="button"
                          onClick={() => backup.id && handleDeleteBackup(backup.id)}
                          className="px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-black uppercase"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-1.5 py-0.5 rounded bg-white text-gray-600 text-[9px] font-bold border border-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(backup.id || null)}
                        title="Delete backup record"
                        aria-label={`Delete backup for ${backup.productName}`}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}

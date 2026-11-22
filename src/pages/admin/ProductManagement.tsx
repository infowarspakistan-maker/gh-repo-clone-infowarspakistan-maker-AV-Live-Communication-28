import {
  Plus,
  Trash2,
  Search,
  Filter,
  Download,
  X,
  ImageIcon,
  Loader2,
  FileText,
  Check,
  AlertCircle,
  Copy,
  FileCode2,
  FileSpreadsheet,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Package,
  Barcode,
  Tags,
  Truck,
  Sliders,
  Globe,
  Cloud,
  Archive,
  Upload,
  Star,
  Save,
} from 'lucide-react';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import { GoogleCategoryAutocomplete } from '../../components/admin/GoogleCategoryAutocomplete';
import { ProductsStorageBrowserModal } from '../../components/admin/ProductsStorageBrowserModal';
import { ProductBackupsModal } from '../../components/admin/ProductBackupsModal';
import { Link } from 'react-router-dom';
import {
  subscribeToProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  Product,
  Category,
  getCategories,
} from '../../lib/firebase/firestore-helpers';
import { extractDirectImageUrls } from '../../lib/image-optimize';
import {
  uploadToProductsStorage,
  deleteFromProductsStorage,
  isProductsStorageBucketUrl,
  formatStorageSavingsSummary,
  PRODUCTS_STORAGE_BUCKET,
} from '../../lib/firebase/products-storage';
import {
  formatFileSizeKb,
} from '../../lib/client-image-compressor';
import {
  generateGmcCsv,
  generateGmcXml,
  getCanonicalProductSlug,
  sanitizeTsvText,
} from '../../lib/gmc-feed';
import { inferDefaultGoogleCategory } from '../../lib/google-taxonomy';
import {
  SUPPORTED_CURRENCIES,
  SupportedCurrency,
  convertToPkr,
  normalizeSupportedCurrency,
} from '../../lib/currency';

type AvailabilityOption = 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder';
type ConditionOption = 'new' | 'refurbished' | 'used';
type YesNoOption = 'yes' | 'no';
type WeightUnit = 'kg' | 'lb';
type DimensionUnit = 'cm' | 'in';

interface ProductFormState {
  // 1. Core & Required (GMC)
  gmcId: string;
  productName: string;
  gmcDescription: string;
  productUrl: string;
  mainImageUrl: string;
  availability: AvailabilityOption;
  priceAmount: string;
  priceCurrency: SupportedCurrency;
  brand: string;
  condition: ConditionOption;

  // 2. Identifiers (GMC)
  gtin: string;
  mpn: string;
  identifierExists: YesNoOption;

  // 3. Categorization & Custom Labels (GMC)
  googleProductCategory: string;
  productType: string;
  customLabel0: string;
  customLabel1: string;
  customLabel2: string;
  customLabel3: string;
  customLabel4: string;

  // 4. Shipping & Returns (GMC)
  shippingWeightValue: string;
  shippingWeightUnit: WeightUnit;
  shippingLengthValue: string;
  shippingWidthValue: string;
  shippingHeightValue: string;
  shippingDimensionUnit: DimensionUnit;
  returnPolicyLabel: string;

  // 5. Optional / Advanced (GMC)
  additionalImageUrls: string[];
  videoLink: string;
  isBundle: YesNoOption;
  multipack: string;
  mobileLink: string;
  salePriceAmount: string;

  // 6. Storefront & SEO (Preserved Backward-Compatible Fields)
  categorySlugs: string[];
  stockQuantity: number;
  shortDescription: string;
  description: string;
  specifications: string;
  isActive: boolean;
  isFeatured: boolean;
  seoTags: string;
  seoMetaDescription: string;
  imageAltText: string;
}

function parseMeasurement(raw?: string): { value: string; unit: string } {
  if (!raw) return { value: '', unit: '' };
  const match = String(raw).trim().match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?$/);
  if (!match) return { value: '', unit: '' };
  return {
    value: match[1] || '',
    unit: (match[2] || '').toLowerCase(),
  };
}

function isAllCapsTitle(title: string): boolean {
  const letters = title.replace(/[^a-zA-Z]/g, '');
  return letters.length >= 4 && letters === letters.toUpperCase();
}

function containsHtmlTags(text: string): boolean {
  return /<\/?[a-z][\s\S]*?>/i.test(text);
}

function buildDefaultFormState(): ProductFormState {
  return {
    gmcId: '',
    productName: '',
    gmcDescription: '',
    productUrl: '',
    mainImageUrl: '',
    availability: 'in_stock',
    priceAmount: '',
    priceCurrency: 'PKR',
    brand: '',
    condition: 'new',

    gtin: '',
    mpn: '',
    identifierExists: 'yes',

    googleProductCategory: 'Electronics > Communications > Telephony > Video Conferencing',
    productType: '',
    customLabel0: '',
    customLabel1: '',
    customLabel2: '',
    customLabel3: '',
    customLabel4: '',

    shippingWeightValue: '',
    shippingWeightUnit: 'kg',
    shippingLengthValue: '',
    shippingWidthValue: '',
    shippingHeightValue: '',
    shippingDimensionUnit: 'cm',
    returnPolicyLabel: 'b2b-30-day',

    additionalImageUrls: [],
    videoLink: '',
    isBundle: 'no',
    multipack: '',
    mobileLink: '',
    salePriceAmount: '',

    categorySlugs: [],
    stockQuantity: 10,
    shortDescription: '',
    description: '',
    specifications: '',
    isActive: true,
    isFeatured: false,
    seoTags: '',
    seoMetaDescription: '',
    imageAltText: '',
  };
}

const RETURN_POLICY_PRESETS = [
  'b2b-30-day',
  'pk-30-day-standard',
  'warranty-replacement-only',
  'no-returns-software',
];

const FORM_SECTIONS = [
  { id: 'sec-core', label: '1. Core Required', icon: Package },
  { id: 'sec-identifiers', label: '2. Identifiers', icon: Barcode },
  { id: 'sec-categorization', label: '3. Categorization', icon: Tags },
  { id: 'sec-shipping', label: '4. Shipping & Returns', icon: Truck },
  { id: 'sec-advanced', label: '5. Media & Advanced', icon: Sliders },
  { id: 'sec-storefront', label: '6. Store & SEO', icon: Globe },
] as const;

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isOptimizingUpload, setIsOptimizingUpload] = useState(false);
  const [uploadOptimizationNote, setUploadOptimizationNote] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormState>(buildDefaultFormState);

  const [showStorageBrowserModal, setShowStorageBrowserModal] = useState(false);
  const [showBackupsModal, setShowBackupsModal] = useState(false);
  const [isSavingImagesOnly, setIsSavingImagesOnly] = useState(false);
  const [storageBusyUrl, setStorageBusyUrl] = useState<string | null>(null);

  const normalizeProductImageUrl = (raw: string): string => {
    const trimmed = String(raw || '').trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('/images/')) return `https://avlive.com.pk${trimmed}`;
    return trimmed;
  };

  const handleOptimizedDirectUpload = async (
    file: File,
    targetSlot: 'auto' | 'main' | 'additional' = 'auto'
  ) => {
    setSelectedFile(file);
    setIsOptimizingUpload(true);
    setUploadOptimizationNote(null);
    try {
      const slugBase = formData.productName || formData.gmcId || file.name;
      const uploaded = await uploadToProductsStorage(file, {
        slugHint: slugBase,
        includeGmcJpg: true,
        allowSiteVaultFallback: true,
      });

      const finalUrl = normalizeProductImageUrl(uploaded.gmcJpgUrl || uploaded.downloadUrl);
      if (finalUrl) {
        setFormData((prev) => {
          const useMain = targetSlot === 'main' || (targetSlot === 'auto' && !prev.mainImageUrl.trim());
          if (useMain) {
            const oldMain = prev.mainImageUrl.trim();
            const nextAdditional =
              targetSlot === 'main' && oldMain && oldMain !== finalUrl && !prev.additionalImageUrls.includes(oldMain)
                ? [oldMain, ...prev.additionalImageUrls].slice(0, 10)
                : prev.additionalImageUrls;
            return {
              ...prev,
              mainImageUrl: finalUrl,
              additionalImageUrls: nextAdditional,
            };
          }
          return {
            ...prev,
            additionalImageUrls: prev.additionalImageUrls.includes(finalUrl)
              ? prev.additionalImageUrls
              : [...prev.additionalImageUrls.filter(Boolean).slice(0, 9), finalUrl],
          };
        });
        setSelectedFile(null);
        const summary = formatStorageSavingsSummary(uploaded);
        setUploadOptimizationNote(summary);
        showNotice(`Uploaded ${formatFileSizeKb(uploaded.sizeBytes)} (${uploaded.savingsPercent}% lighter)!`);
      }
    } catch (err: any) {
      setUploadOptimizationNote(err?.message || 'Upload failed — check Storage authorization.');
      showNotice(err?.message || 'Image upload failed.', 'error');
    } finally {
      setIsOptimizingUpload(false);
    }
  };

  const handleDeleteStorageFileForUrl = async (
    url: string,
    slotType: 'main' | 'additional',
    index?: number
  ) => {
    const clean = url.trim();
    if (!clean) return;
    setStorageBusyUrl(clean);
    try {
      const res = await deleteFromProductsStorage(clean);
      if (res.authRequired) {
        showNotice(res.reason || 'Click "Storage: Products/" to authorize Google Storage first.', 'error');
        return;
      }
      if (slotType === 'main') {
        setFormData((prev) => {
          const nextMain = prev.additionalImageUrls[0] || '';
          return {
            ...prev,
            mainImageUrl: nextMain,
            additionalImageUrls: nextMain ? prev.additionalImageUrls.slice(1) : prev.additionalImageUrls,
          };
        });
      } else if (typeof index === 'number') {
        removeAdditionalImageSlot(index);
      }
      showNotice(
        res.deleted
          ? 'Deleted image file from Storage and removed from product.'
          : 'Removed image URL from product.'
      );
    } catch (err: any) {
      showNotice(err?.message || 'Could not delete image file.', 'error');
    } finally {
      setStorageBusyUrl(null);
    }
  };

  const handleSaveImagesOnly = async () => {
    if (!editingId) return;
    setIsSavingImagesOnly(true);
    try {
      const mainImg = normalizeProductImageUrl(formData.mainImageUrl);
      const extraImgs = formData.additionalImageUrls
        .map(normalizeProductImageUrl)
        .filter((u) => /^https?:\/\//i.test(u) && u !== mainImg)
        .slice(0, 10);
      const allImages = Array.from(new Set([mainImg, ...extraImgs].filter((u) => /^https?:\/\//i.test(u))));

      await updateProduct(editingId, {
        image: allImages[0] || '',
        images: allImages,
        additionalImages: allImages.slice(1, 11),
        imagesCustomized: true,
      });

      setFormData((prev) => ({
        ...prev,
        mainImageUrl: allImages[0] || '',
        additionalImageUrls: allImages.slice(1, 11),
      }));
      showNotice('Product images saved (previous version backed up automatically).');
    } catch (err: any) {
      showNotice(err?.message || 'Failed to save product images.', 'error');
    } finally {
      setIsSavingImagesOnly(false);
    }
  };

  // Search, Filter & Exporter States
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | AvailabilityOption>('all');
  const [exportCurrency, setExportCurrency] = useState<'AUTO' | SupportedCurrency>('AUTO');
  const [showFeedPreviewModal, setShowFeedPreviewModal] = useState(false);
  const [previewFormat, setPreviewFormat] = useState<'xml' | 'csv'>('xml');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Bulk Image Modal States (Preserved)
  const [showBulkImageModal, setShowBulkImageModal] = useState(false);
  const [bulkImageText, setBulkImageText] = useState('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [bulkUpdateResult, setBulkUpdateResult] = useState<string | null>(null);

  const formScrollRef = useRef<HTMLFormElement>(null);

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  useEffect(() => {
    getCategories().then(setCategories);

    const unsubscribe = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const derivedAvail: AvailabilityOption =
        p.availability || ((p.stockQuantity ?? 0) > 0 ? 'in_stock' : 'out_of_stock');
      if (availabilityFilter !== 'all' && derivedAvail !== availabilityFilter) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        p.productName,
        p.gmcId,
        p.id,
        p.sku,
        p.mpn,
        p.gtin,
        p.brand,
        p.productType,
        ...(Array.isArray(p.categorySlugs) ? p.categorySlugs : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [products, searchQuery, availabilityFilter]);

  const gmcExportOptions = useMemo(
    () => (exportCurrency === 'AUTO' ? undefined : { currency: exportCurrency }),
    [exportCurrency]
  );

  const feedPreviewContent = useMemo(() => {
    if (!showFeedPreviewModal) return '';
    const sourceList = filteredProducts.length > 0 ? filteredProducts : products;
    return previewFormat === 'xml'
      ? generateGmcXml(sourceList, gmcExportOptions)
      : generateGmcCsv(sourceList, gmcExportOptions);
  }, [showFeedPreviewModal, previewFormat, filteredProducts, products, gmcExportOptions]);

  const triggerDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const sourceList = filteredProducts.length > 0 ? filteredProducts : products;
    const csv = generateGmcCsv(sourceList, gmcExportOptions);
    const suffix = exportCurrency === 'AUTO' ? 'auto' : exportCurrency.toLowerCase();
    triggerDownload(csv, `gmc-products-feed-${suffix}.csv`, 'text/csv');
    showNotice(`Exported ${sourceList.length} products to Google Merchant Center CSV.`);
  };

  const handleExportXml = () => {
    const sourceList = filteredProducts.length > 0 ? filteredProducts : products;
    const xml = generateGmcXml(sourceList, gmcExportOptions);
    const suffix = exportCurrency === 'AUTO' ? 'auto' : exportCurrency.toLowerCase();
    triggerDownload(xml, `gmc-products-feed-${suffix}.xml`, 'application/xml');
    showNotice(`Exported ${sourceList.length} products to Google Merchant Center RSS 2.0 XML.`);
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id || null);

    const allImages = extractDirectImageUrls([
      product.image,
      ...(Array.isArray(product.images) ? product.images : typeof product.images === 'string' ? [product.images] : []),
      ...(Array.isArray(product.additionalImages) ? product.additionalImages : []),
      (product as any).imageUrl,
    ]);
    const mainImage = allImages[0] || '';
    const extraImages = allImages.filter((u) => u !== mainImage).slice(0, 10);

    const parsedWeight = parseMeasurement(product.shippingWeight);
    const parsedLength = parseMeasurement(product.shippingLength);
    const parsedWidth = parseMeasurement(product.shippingWidth);
    const parsedHeight = parseMeasurement(product.shippingHeight);
    const detectedDimUnit: DimensionUnit =
      parsedLength.unit === 'in' || parsedWidth.unit === 'in' || parsedHeight.unit === 'in' ? 'in' : 'cm';

    const canonicalSlug = getCanonicalProductSlug(product, product.id);
    const defaultUrl = `https://avlive.com.pk/product/${canonicalSlug}`;
    const currency = normalizeSupportedCurrency(product.priceCurrency || 'PKR');
    const displayPrice =
      currency !== 'PKR' && Number(product.gmcPrice) > 0
        ? String(product.gmcPrice)
        : product.regularPrice > 0
        ? String(product.regularPrice)
        : product.salePrice > 0
        ? String(product.salePrice)
        : '';
    const displaySalePrice =
      currency !== 'PKR' && Number(product.gmcSalePrice) > 0
        ? String(product.gmcSalePrice)
        : product.salePrice > 0 && product.salePrice < product.regularPrice
        ? String(product.salePrice)
        : '';

    const plainGmcDesc =
      product.gmcDescription ||
      sanitizeTsvText(product.description || product.shortDescription || '', 5000);

    setFormData({
      gmcId: (product.gmcId || product.id || '').slice(0, 50),
      productName: product.productName || '',
      gmcDescription: plainGmcDesc,
      productUrl: product.productUrl || defaultUrl,
      mainImageUrl: mainImage.startsWith('/') ? `https://avlive.com.pk${mainImage}` : mainImage,
      availability:
        product.availability || ((product.stockQuantity ?? 0) > 0 ? 'in_stock' : 'out_of_stock'),
      priceAmount: displayPrice,
      priceCurrency: currency,
      brand: product.brand || '',
      condition: product.condition || 'new',

      gtin: (product.gtin || '').replace(/\D/g, ''),
      mpn: product.mpn || product.sku || '',
      identifierExists: product.identifierExists || 'yes',

      googleProductCategory:
        product.googleProductCategory ||
        inferDefaultGoogleCategory(product.categorySlugs, product.productName),
      productType:
        product.productType ||
        (Array.isArray(product.categorySlugs) && product.categorySlugs.length > 0
          ? product.categorySlugs
              .map((s) =>
                s
                  .split('-')
                  .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
                  .join(' ')
              )
              .join(' > ')
          : ''),
      customLabel0: product.customLabel0 || '',
      customLabel1: product.customLabel1 || '',
      customLabel2: product.customLabel2 || '',
      customLabel3: product.customLabel3 || '',
      customLabel4: product.customLabel4 || '',

      shippingWeightValue: parsedWeight.value,
      shippingWeightUnit: parsedWeight.unit === 'lb' ? 'lb' : 'kg',
      shippingLengthValue: parsedLength.value,
      shippingWidthValue: parsedWidth.value,
      shippingHeightValue: parsedHeight.value,
      shippingDimensionUnit: detectedDimUnit,
      returnPolicyLabel: product.returnPolicyLabel || 'b2b-30-day',

      additionalImageUrls: extraImages.map((u) =>
        u.startsWith('/') ? `https://avlive.com.pk${u}` : u
      ),
      videoLink: product.videoLink || '',
      isBundle: product.isBundle || 'no',
      multipack: product.multipack && product.multipack > 1 ? String(product.multipack) : '',
      mobileLink: product.mobileLink || '',
      salePriceAmount: displaySalePrice,

      categorySlugs: Array.isArray(product.categorySlugs) ? product.categorySlugs : [],
      stockQuantity: product.stockQuantity ?? 10,
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      specifications: product.specifications || '',
      isActive: product.isActive ?? true,
      isFeatured: !!product.isFeatured,
      seoTags: product.seoTags || '',
      seoMetaDescription: product.seoMetaDescription || '',
      imageAltText: product.imageAltText || '',
    });
    setSelectedFile(null);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData(buildDefaultFormState());
    setSelectedFile(null);
  };

  const isDuplicateGmcId = (candidate: string): boolean => {
    const clean = candidate.trim().toLowerCase();
    if (!clean) return false;
    return products.some((p) => {
      if (editingId && p.id === editingId) return false;
      const existingGmcId = (p.gmcId || '').trim().toLowerCase();
      const existingId = (p.id || '').trim().toLowerCase();
      return existingGmcId === clean || existingId === clean;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;

    // Enforce native HTML5 validation across all fields
    if (!formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }

    if (isDuplicateGmcId(formData.gmcId)) {
      showNotice(`Product ID "${formData.gmcId}" already exists. Product ID must be unique.`, 'error');
      return;
    }

    if (isAllCapsTitle(formData.productName)) {
      showNotice('Product Title cannot be in ALL CAPS. Use Title Case with Brand + Model + Key Features.', 'error');
      return;
    }

    if (containsHtmlTags(formData.gmcDescription)) {
      showNotice('GMC Description must be plain text only (no HTML tags). Click "Strip HTML" to clean it.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let mainImage = normalizeProductImageUrl(formData.mainImageUrl);
      if (selectedFile) {
        const uploaded = await uploadToProductsStorage(selectedFile, {
          slugHint: formData.productName || formData.gmcId || selectedFile.name,
          includeGmcJpg: true,
          allowSiteVaultFallback: true,
        });
        if (!mainImage) {
          mainImage = normalizeProductImageUrl(uploaded.gmcJpgUrl || uploaded.downloadUrl);
        }
      }

      const cleanedAdditionalImages = formData.additionalImageUrls
        .map(normalizeProductImageUrl)
        .filter((u) => /^https?:\/\//i.test(u) && u !== mainImage)
        .slice(0, 10);

      const allImages = Array.from(new Set([mainImage, ...cleanedAdditionalImages].filter(Boolean)));

      const parsedPrice = parseFloat(formData.priceAmount) || 0;
      const parsedSale = formData.salePriceAmount.trim() ? parseFloat(formData.salePriceAmount) : 0;

      const regularPricePkr =
        formData.priceCurrency === 'PKR'
          ? Math.round(parsedPrice)
          : Math.round(convertToPkr(parsedPrice, formData.priceCurrency));
      const salePricePkr =
        parsedSale > 0
          ? formData.priceCurrency === 'PKR'
            ? Math.round(parsedSale)
            : Math.round(convertToPkr(parsedSale, formData.priceCurrency))
          : regularPricePkr;

      const shippingWeight = formData.shippingWeightValue.trim()
        ? `${formData.shippingWeightValue.trim()} ${formData.shippingWeightUnit}`
        : '';
      const shippingLength = formData.shippingLengthValue.trim()
        ? `${formData.shippingLengthValue.trim()} ${formData.shippingDimensionUnit}`
        : '';
      const shippingWidth = formData.shippingWidthValue.trim()
        ? `${formData.shippingWidthValue.trim()} ${formData.shippingDimensionUnit}`
        : '';
      const shippingHeight = formData.shippingHeightValue.trim()
        ? `${formData.shippingHeightValue.trim()} ${formData.shippingDimensionUnit}`
        : '';

      const multipackInt = formData.multipack.trim() ? parseInt(formData.multipack, 10) : null;

      const derivedSlug = formData.productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const cleanedCategorySlugs = formData.categorySlugs.map((s) => s.trim()).filter(Boolean);

      const productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
        gmcId: formData.gmcId.trim().slice(0, 50),
        slug: derivedSlug ? (derivedSlug.endsWith('-pakistan') ? derivedSlug : `${derivedSlug}-pakistan`) : undefined,
        productName: formData.productName.trim().slice(0, 150),
        sku: (formData.mpn.trim() || formData.gmcId.trim()).slice(0, 70),
        mpn: formData.identifierExists === 'yes' ? formData.mpn.trim().slice(0, 70) : '',
        gtin: formData.identifierExists === 'yes' ? formData.gtin.replace(/\D/g, '') : '',
        identifierExists: formData.identifierExists,
        gmcDescription: formData.gmcDescription.trim().slice(0, 5000),
        shortDescription:
          formData.shortDescription.trim() || formData.gmcDescription.trim().slice(0, 220),
        description: formData.description.trim() || formData.gmcDescription.trim(),
        productUrl: formData.productUrl.trim(),
        mobileLink: formData.mobileLink.trim(),
        availability: formData.availability,
        condition: formData.condition,
        priceCurrency: formData.priceCurrency,
        gmcPrice: parsedPrice,
        gmcSalePrice: parsedSale > 0 ? parsedSale : 0,
        regularPrice: regularPricePkr,
        salePrice: salePricePkr,
        stockQuantity:
          formData.availability === 'out_of_stock' ? 0 : Math.max(0, Number(formData.stockQuantity) || 0),
        lowStockThreshold: 5,
        images: allImages,
        image: mainImage,
        additionalImages: cleanedAdditionalImages,
        imagesCustomized: true,
        videoLink: formData.videoLink.trim(),
        categoryIds: [],
        categorySlugs:
          cleanedCategorySlugs.length > 0 ? cleanedCategorySlugs : ['video-conferencing'],
        googleProductCategory: formData.googleProductCategory.trim(),
        productType: formData.productType.trim(),
        customLabel0: formData.customLabel0.trim().slice(0, 100),
        customLabel1: formData.customLabel1.trim().slice(0, 100),
        customLabel2: formData.customLabel2.trim().slice(0, 100),
        customLabel3: formData.customLabel3.trim().slice(0, 100),
        customLabel4: formData.customLabel4.trim().slice(0, 100),
        shippingWeight,
        shippingLength,
        shippingWidth,
        shippingHeight,
        returnPolicyLabel: formData.returnPolicyLabel.trim(),
        isBundle: formData.isBundle,
        multipack: multipackInt && multipackInt >= 1 ? multipackInt : null,
        brand: formData.brand.trim(),
        variations: [],
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        specifications: formData.specifications,
        seoTags: formData.seoTags,
        seoMetaDescription: formData.seoMetaDescription,
        imageAltText: formData.imageAltText || `${formData.brand.trim()} ${formData.productName.trim()}`,
      };

      if (editingId) {
        await updateProduct(editingId, productData);
        showNotice(`Updated "${productData.productName}" and synced GMC attributes.`);
      } else {
        await createProduct(productData);
        showNotice(`Created "${productData.productName}" (ID: ${productData.gmcId}) in catalog.`);
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      showNotice('Failed to save product. Check console for details.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkImageUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkImageText.trim()) return;
    setIsBulkUpdating(true);
    setBulkUpdateResult(null);

    try {
      const lines = bulkImageText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      let updatedCount = 0;
      const unmatched: string[] = [];

      for (const line of lines) {
        const urlMatch = line.match(/https?:\/\/\S+/gi);
        if (!urlMatch || urlMatch.length === 0) continue;

        const firstUrlIdx = line.search(/https?:\/\//i);
        const identifierPart = line
          .slice(0, firstUrlIdx)
          .replace(/[|,\t:;-]+$/, '')
          .trim()
          .toLowerCase();

        const urlsPart = line.slice(firstUrlIdx);
        const extractedUrls = extractDirectImageUrls(urlsPart.split(/[\s,|]+/));
        if (!identifierPart || extractedUrls.length === 0) continue;

        const matchedProduct = products.find((p) => {
          const name = (p.productName || '').toLowerCase();
          const sku = (p.sku || '').toLowerCase();
          const id = (p.id || '').toLowerCase();
          const gmcId = (p.gmcId || '').toLowerCase();
          const slug = (p.slug || '').toLowerCase();
          return (
            name === identifierPart ||
            sku === identifierPart ||
            id === identifierPart ||
            gmcId === identifierPart ||
            slug === identifierPart ||
            name.includes(identifierPart) ||
            identifierPart.includes(name) ||
            (sku && sku.includes(identifierPart))
          );
        });

        if (matchedProduct && matchedProduct.id) {
          await updateProduct(matchedProduct.id, {
            images: extractedUrls,
            image: extractedUrls[0],
            additionalImages: extractedUrls.slice(1, 11),
          });
          updatedCount++;
        } else {
          unmatched.push(identifierPart);
        }
      }

      setBulkUpdateResult(
        `Updated ${updatedCount} product(s) with direct external image URLs.${
          unmatched.length > 0 ? ` Unmatched (${unmatched.length}): ${unmatched.join(', ')}` : ''
        }`
      );
    } catch (err) {
      console.error('Error in bulk image update:', err);
      setBulkUpdateResult('Failed to complete bulk update. Check console for details.');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteProduct(id);
      setConfirmDeleteId(null);
      showNotice(
        res.backupId
          ? 'Product archived to Backups & removed from catalog. Open "Backups & Restore" anytime to recover it.'
          : 'Product removed from catalog.'
      );
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotice('Failed to delete product.', 'error');
    }
  };

  const autoGenerateProductUrl = () => {
    const slug = formData.productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!slug) return;
    const withCountry = slug.endsWith('-pakistan') ? slug : `${slug}-pakistan`;
    setFormData((prev) => ({
      ...prev,
      productUrl: `https://avlive.com.pk/product/${withCountry}`,
    }));
  };

  const addAdditionalImageSlot = () => {
    if (formData.additionalImageUrls.length >= 10) return;
    setFormData((prev) => ({
      ...prev,
      additionalImageUrls: [...prev.additionalImageUrls, ''],
    }));
  };

  const updateAdditionalImageSlot = (index: number, value: string) => {
    setFormData((prev) => {
      const next = [...prev.additionalImageUrls];
      next[index] = value;
      return { ...prev, additionalImageUrls: next };
    });
  };

  const removeAdditionalImageSlot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalImageUrls: prev.additionalImageUrls.filter((_, i) => i !== index),
    }));
  };

  const formattedGmcPricePreview = useMemo(() => {
    const n = parseFloat(formData.priceAmount);
    if (!Number.isFinite(n) || n <= 0) return `0.00 ${formData.priceCurrency}`;
    return `${n.toFixed(2)} ${formData.priceCurrency}`;
  }, [formData.priceAmount, formData.priceCurrency]);

  const formattedGmcSalePreview = useMemo(() => {
    const n = parseFloat(formData.salePriceAmount);
    if (!Number.isFinite(n) || n <= 0) return '';
    return `${n.toFixed(2)} ${formData.priceCurrency}`;
  }, [formData.salePriceAmount, formData.priceCurrency]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Inline Status Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`fixed top-5 right-5 z-[150] px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-bold ${
              toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle size={16} className="text-red-500 shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 opacity-60 hover:opacity-100"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 mb-6">
        <div>
          <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.2em] mb-1 block">
            Inventory &amp; Google Merchant Center Control
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1A2B4C] tracking-tight">
            Product Master
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowStorageBrowserModal(true)}
            className="bg-sky-50 hover:bg-sky-100 text-[#0077B6] px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-sky-200 shadow-sm flex items-center gap-2"
          >
            <Cloud size={14} className="text-[#00B4D8]" />
            Storage: Products/
          </button>
          <button
            type="button"
            onClick={() => setShowBackupsModal(true)}
            className="bg-white hover:bg-gray-50 text-[#1A2B4C] px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-gray-200 shadow-sm flex items-center gap-2"
          >
            <Archive size={14} className="text-amber-600" />
            Backups &amp; Restore
          </button>
          <Link
            to="/admin/media-guide"
            className="hidden sm:flex bg-white hover:bg-gray-50 text-[#1A2B4C] px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-gray-200 shadow-sm items-center gap-2"
          >
            <FileText size={14} className="text-[#00B4D8]" />
            Media Guide
          </Link>
          <button
            type="button"
            onClick={() => {
              setBulkUpdateResult(null);
              setShowBulkImageModal(true);
            }}
            className="bg-white hover:bg-gray-50 text-[#1A2B4C] px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-gray-200 shadow-sm flex items-center gap-2"
          >
            <ImageIcon size={14} className="text-[#00B4D8]" />
            Bulk Image URLs
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              resetForm();
              setShowForm(true);
            }}
            className="bg-[#1A2B4C] text-white px-6 py-3.5 rounded-full hover:bg-[#00B4D8] transition-all flex items-center font-black text-[10px] uppercase tracking-widest shadow-lg hover:shadow-xl active:scale-95"
          >
            <Plus size={16} className="mr-2" />
            Add Equipment
          </button>
        </div>
      </div>

      {/* Product Table & GMC Exporter Card */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4">
          {/* Search + Availability Filter */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, Product ID, MPN, GTIN, or brand..."
                className="w-full border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#00B4D8] transition-all bg-gray-50/50 font-medium text-[#1A2B4C]"
              />
            </div>
            <div className="relative flex items-center">
              <Filter size={14} className="absolute left-3.5 text-gray-400 pointer-events-none" />
              <select
                aria-label="Filter by availability"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                className="border border-gray-200 rounded-2xl pl-9 pr-8 py-3 text-[11px] font-black uppercase tracking-wider text-[#1A2B4C] bg-gray-50/50 focus:outline-none focus:border-[#00B4D8]"
              >
                <option value="all">All Status ({products.length})</option>
                <option value="in_stock">in_stock</option>
                <option value="out_of_stock">out_of_stock</option>
                <option value="preorder">preorder</option>
                <option value="backorder">backorder</option>
              </select>
            </div>
          </div>

          {/* GMC XML / CSV Exporter Controls */}
          <div className="flex flex-wrap items-center gap-2.5 bg-slate-50/90 p-2 rounded-2xl border border-gray-200/70">
            <select
              aria-label="GMC Feed Export Currency"
              value={exportCurrency}
              onChange={(e) => setExportCurrency(e.target.value as any)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
            >
              <option value="AUTO">Currency: Per Product</option>
              {SUPPORTED_CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  Feed: {code}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 text-[#1A2B4C] px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <FileSpreadsheet size={14} className="text-emerald-600" />
              Export GMC CSV
            </button>
            <button
              type="button"
              onClick={handleExportXml}
              className="flex items-center gap-1.5 bg-white hover:bg-sky-50 border border-gray-200 hover:border-sky-300 text-[#1A2B4C] px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <FileCode2 size={14} className="text-[#00B4D8]" />
              Export GMC XML
            </button>
            <button
              type="button"
              onClick={() => {
                setPreviewFormat('xml');
                setShowFeedPreviewModal(true);
              }}
              className="flex items-center gap-1.5 bg-[#1A2B4C] hover:bg-[#00B4D8] text-white px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <Download size={13} />
              Preview Feed
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="animate-spin w-10 h-10 text-[#00B4D8] mx-auto mb-4" />
            <div className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">
              Synchronizing Catalog...
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center px-6">
            <p className="text-sm font-bold text-[#1A2B4C]">No matching products found.</p>
            <p className="text-xs text-gray-400 mt-1">
              Clear your search filter or click &ldquo;Add Equipment&rdquo; to create a new GMC-ready SKU.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/30 text-gray-400 uppercase tracking-[0.2em] text-[9px] font-black">
                  <th className="py-5 px-6 whitespace-nowrap">Equipment &amp; GMC ID</th>
                  <th className="py-5 px-6 whitespace-nowrap">Brand &amp; Identifiers</th>
                  <th className="py-5 px-6 whitespace-nowrap">Availability &amp; Stock</th>
                  <th className="py-5 px-6 whitespace-nowrap">Price</th>
                  <th className="py-5 px-6 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const avail: AvailabilityOption =
                    product.availability ||
                    ((product.stockQuantity ?? 0) > 0 ? 'in_stock' : 'out_of_stock');
                  const thumbUrl =
                    (Array.isArray(product.images)
                      ? product.images
                      : typeof product.images === 'string'
                      ? [product.images]
                      : product.image
                      ? [product.image]
                      : [])[0] || '';

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50/60 transition-colors group cursor-pointer"
                      onClick={() => handleEdit(product)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden border border-gray-100 p-2 shrink-0 shadow-sm flex items-center justify-center">
                            {thumbUrl ? (
                              <img
                                loading="lazy"
                                src={thumbUrl}
                                alt={product.productName || 'Equipment thumbnail'}
                                title={product.productName || 'Equipment thumbnail'}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <ImageIcon size={20} className="text-gray-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-[#1A2B4C] text-sm mb-1 max-w-[260px] truncate">
                              {product.productName}
                            </div>
                            <div className="text-[10px] font-mono font-bold text-gray-500 flex flex-wrap items-center gap-2">
                              <span>
                                ID: <span className="text-[#00B4D8]">{product.gmcId || product.id}</span>
                              </span>
                              {product.condition && product.condition !== 'new' && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase text-[9px]">
                                  {product.condition}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-black text-[#1A2B4C] uppercase tracking-wider">
                            {product.brand || 'Unbranded'}
                          </span>
                          <div className="text-[10px] font-mono text-gray-500">
                            MPN: {product.mpn || product.sku || '—'}
                            {product.gtin ? ` · GTIN: ${product.gtin}` : ''}
                          </div>
                          {product.productType && (
                            <span className="text-[10px] text-gray-400 truncate max-w-[220px]">
                              {product.productType}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                avail === 'in_stock'
                                  ? 'bg-emerald-500'
                                  : avail === 'preorder' || avail === 'backorder'
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`}
                            />
                            <span className="font-mono text-[11px] font-bold text-[#1A2B4C]">
                              {avail}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold">
                            {product.stockQuantity} Units · {product.isActive ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-black text-[#1A2B4C]">
                            Rs. {(product.salePrice || product.regularPrice || 0).toLocaleString()}
                          </span>
                          {product.regularPrice > product.salePrice && product.salePrice > 0 && (
                            <span className="text-[10px] font-bold text-gray-400 line-through">
                              Rs. {(product.regularPrice ?? 0).toLocaleString()}
                            </span>
                          )}
                          {product.priceCurrency && product.priceCurrency !== 'PKR' && product.gmcPrice ? (
                            <span className="text-[10px] font-mono text-[#00B4D8] font-bold">
                              GMC: {Number(product.gmcPrice).toFixed(2)} {product.priceCurrency}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div
                          className="flex justify-end items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {confirmDeleteId === product.id ? (
                            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-xl px-2.5 py-1">
                              <span className="text-[10px] font-bold text-red-700">Delete?</span>
                              <button
                                type="button"
                                onClick={() => handleDelete(product.id!)}
                                className="px-2 py-0.5 rounded-lg bg-red-600 text-white text-[10px] font-black"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-0.5 rounded-lg bg-white text-gray-600 text-[10px] font-bold border border-gray-200"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(product.id!)}
                              className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all hover:bg-red-100"
                              title="Delete Product"
                              aria-label={`Delete ${product.productName}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Creation & Editing Drawer (All 5 GMC Sections + Storefront SEO) */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#1A2B4C]/45 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="relative w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col z-10"
            >
              {/* Drawer Header */}
              <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/70 shrink-0">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#1A2B4C] tracking-tight">
                    {editingId ? 'Edit Equipment & GMC Feed Attributes' : 'Create GMC-Compliant Equipment'}
                  </h2>
                  <p className="text-[11px] font-semibold text-gray-500 mt-0.5">
                    Fields marked with <span className="text-red-500 font-black">*</span> are required by Google Merchant Center and validated via HTML5 before submission.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  aria-label="Close product form"
                  className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:shadow-md transition-all flex items-center justify-center shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Sticky Section Quick-Jump Bar (All Sections Stay Mounted for Native HTML5 Validation) */}
              <div className="flex items-center gap-1.5 overflow-x-auto border-b border-gray-100 px-6 py-2.5 bg-white shrink-0">
                {FORM_SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollToSection(sec.id)}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#1A2B4C] bg-gray-50 hover:bg-[#00B4D8]/10 hover:text-[#0077B6] border border-gray-200/80 transition-colors"
                    >
                      <Icon size={12} className="text-[#00B4D8]" />
                      {sec.label}
                    </button>
                  );
                })}
              </div>

              {/* Single Scrollable Form so Native HTML5 Validation Focuses Any Invalid Control */}
              <form
                ref={formScrollRef}
                id="product-form"
                onSubmit={handleSubmit}
                className="p-6 sm:p-8 overflow-y-auto flex-grow space-y-10"
              >
                {/* ================================================================= */}
                {/* 1. CORE & REQUIRED ATTRIBUTES                                     */}
                {/* ================================================================= */}
                <section id="sec-core" className="scroll-mt-4 space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                        <Package size={16} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-[#1A2B4C] uppercase tracking-wider">
                          1. Core &amp; Required Attributes
                        </h3>
                        <p className="text-[11px] text-gray-500 font-medium">
                          Mandatory Google Merchant Center fields — products cannot be submitted if left blank.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                      Required
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* id */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label
                          htmlFor="gmc-id"
                          className="text-[10px] font-black text-gray-500 uppercase tracking-widest"
                        >
                          Product ID <span className="text-red-500">*</span>{' '}
                          <span className="font-mono text-gray-400 normal-case">(id)</span>
                        </label>
                        <span className="text-[10px] font-mono text-gray-400">
                          {formData.gmcId.length}/50
                        </span>
                      </div>
                      <input
                        id="gmc-id"
                        name="id"
                        type="text"
                        required
                        maxLength={50}
                        pattern="^\S+$"
                        title="Unique Product ID, max 50 characters, no spaces (e.g. POLY-X52-01)"
                        placeholder="e.g. POLY-X52-01"
                        value={formData.gmcId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({ ...formData, gmcId: val });
                          if (isDuplicateGmcId(val)) {
                            e.currentTarget.setCustomValidity('This Product ID already exists. Must be unique.');
                          } else {
                            e.currentTarget.setCustomValidity('');
                          }
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-mono font-bold text-[#1A2B4C] text-sm"
                      />
                    </div>

                    {/* brand */}
                    <div>
                      <label
                        htmlFor="gmc-brand"
                        className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5"
                      >
                        Brand <span className="text-red-500">*</span>{' '}
                        <span className="font-mono text-gray-400 normal-case">(brand)</span>
                      </label>
                      <input
                        id="gmc-brand"
                        name="brand"
                        type="text"
                        required
                        maxLength={70}
                        placeholder="e.g. Poly, Cisco, HP, Logitech"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-bold text-[#1A2B4C] text-sm"
                      />
                    </div>

                    {/* title */}
                    <div className="sm:col-span-2">
                      <div className="flex justify-between items-center mb-1.5">
                        <label
                          htmlFor="gmc-title"
                          className="text-[10px] font-black text-gray-500 uppercase tracking-widest"
                        >
                          Product Title <span className="text-red-500">*</span>{' '}
                          <span className="font-mono text-gray-400 normal-case">(title — No ALL CAPS)</span>
                        </label>
                        <span
                          className={`text-[10px] font-mono font-bold ${
                            formData.productName.length > 140 ? 'text-amber-600' : 'text-gray-400'
                          }`}
                        >
                          {formData.productName.length}/150
                        </span>
                      </div>
                      <input
                        id="gmc-title"
                        name="title"
                        type="text"
                        required
                        maxLength={150}
                        placeholder="Brand + Model + Key Features (e.g. Poly Studio X52 All-in-One 4K Video Bar)"
                        value={formData.productName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({ ...formData, productName: val });
                          if (isAllCapsTitle(val)) {
                            e.currentTarget.setCustomValidity(
                              'Google Merchant Center forbids ALL CAPS titles. Use normal capitalization.'
                            );
                          } else {
                            e.currentTarget.setCustomValidity('');
                          }
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-bold text-[#1A2B4C] text-sm"
                      />
                    </div>

                    {/* description (plain text) */}
                    <div className="sm:col-span-2">
                      <div className="flex justify-between items-center mb-1.5">
                        <label
                          htmlFor="gmc-description"
                          className="text-[10px] font-black text-gray-500 uppercase tracking-widest"
                        >
                          Description <span className="text-red-500">*</span>{' '}
                          <span className="font-mono text-gray-400 normal-case">
                            (description — Plain text only, no HTML tags)
                          </span>
                        </label>
                        <div className="flex items-center gap-3">
                          {containsHtmlTags(formData.gmcDescription) && (
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  gmcDescription: sanitizeTsvText(prev.gmcDescription, 5000),
                                }))
                              }
                              className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg hover:bg-amber-100"
                            >
                              Strip HTML Tags
                            </button>
                          )}
                          <span className="text-[10px] font-mono text-gray-400">
                            {formData.gmcDescription.length}/5000
                          </span>
                        </div>
                      </div>
                      <textarea
                        id="gmc-description"
                        name="description"
                        required
                        rows={4}
                        maxLength={5000}
                        placeholder="Write a clear plain-text product description with technical specs and compatibility. Do not include HTML tags."
                        value={formData.gmcDescription}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({ ...formData, gmcDescription: val });
                          if (containsHtmlTags(val)) {
                            e.currentTarget.setCustomValidity(
                              'Plain text only — remove all HTML tags for Google Merchant Center.'
                            );
                          } else {
                            e.currentTarget.setCustomValidity('');
                          }
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] text-sm resize-y"
                      />
                    </div>

                    {/* link */}
                    <div className="sm:col-span-2">
                      <div className="flex justify-between items-center mb-1.5">
                        <label
                          htmlFor="gmc-link"
                          className="text-[10px] font-black text-gray-500 uppercase tracking-widest"
                        >
                          Product URL <span className="text-red-500">*</span>{' '}
                          <span className="font-mono text-gray-400 normal-case">(link)</span>
                        </label>
                        <button
                          type="button"
                          onClick={autoGenerateProductUrl}
                          className="inline-flex items-center gap-1 text-[10px] font-black text-[#00B4D8] hover:underline uppercase tracking-wider"
                        >
                          <Sparkles size={11} /> Auto-generate from Title
                        </button>
                      </div>
                      <input
                        id="gmc-link"
                        name="link"
                        type="url"
                        required
                        placeholder="https://avlive.com.pk/product/poly-studio-x52-pakistan"
                        value={formData.productUrl}
                        onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-mono text-xs text-[#1A2B4C]"
                      />
                    </div>

                    {/* image_link */}
                    <div className="sm:col-span-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <label
                          htmlFor="gmc-image-link"
                          className="text-[10px] font-black text-gray-500 uppercase tracking-widest"
                        >
                          Main Image URL <span className="text-red-500">*</span>{' '}
                          <span className="font-mono text-gray-400 normal-case">
                            (image_link — Stored in gs://{PRODUCTS_STORAGE_BUCKET}/Products)
                          </span>
                        </label>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1A2B4C] hover:bg-[#00B4D8] text-white text-[10px] font-black uppercase tracking-wider transition-colors">
                            <Upload size={11} /> Upload Main
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isOptimizingUpload}
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleOptimizedDirectUpload(file, 'main');
                                e.target.value = '';
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowStorageBrowserModal(true)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0077B6] border border-sky-200 text-[10px] font-black uppercase tracking-wider"
                          >
                            <Cloud size={11} /> Browse Products/
                          </button>
                          {editingId && (
                            <button
                              type="button"
                              disabled={isSavingImagesOnly}
                              onClick={handleSaveImagesOnly}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider disabled:opacity-60"
                            >
                              {isSavingImagesOnly ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                              Save Images
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2.5 items-center">
                        <div className="flex-1">
                          <input
                            id="gmc-image-link"
                            name="image_link"
                            type="url"
                            required={!selectedFile}
                            placeholder="https://firebasestorage.googleapis.com/... or https://avlive.com.pk/images/products/..."
                            value={formData.mainImageUrl}
                            onChange={(e) =>
                              setFormData({ ...formData, mainImageUrl: normalizeProductImageUrl(e.target.value) })
                            }
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-mono text-xs text-[#1A2B4C]"
                          />
                        </div>
                        {formData.mainImageUrl && /^https?:\/\//i.test(formData.mainImageUrl) && (
                          <div className="w-12 h-12 rounded-xl border border-gray-200 bg-white p-1 shrink-0 overflow-hidden flex items-center justify-center">
                            <img
                              src={formData.mainImageUrl}
                              alt={`${formData.productName || 'Product'} main image preview`}
                              title={`${formData.productName || 'Product'} main image preview`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        {formData.mainImageUrl && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  mainImageUrl: prev.additionalImageUrls[0] || '',
                                  additionalImageUrls: prev.additionalImageUrls.slice(1),
                                }))
                              }
                              title="Remove main image from product"
                              aria-label="Remove main image from product"
                              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                            >
                              <X size={14} />
                            </button>
                            {(isProductsStorageBucketUrl(formData.mainImageUrl) ||
                              formData.mainImageUrl.includes('/images/')) && (
                              <button
                                type="button"
                                disabled={storageBusyUrl === formData.mainImageUrl}
                                onClick={() =>
                                  handleDeleteStorageFileForUrl(formData.mainImageUrl, 'main')
                                }
                                title="Delete image file from Storage & remove"
                                aria-label="Delete main image file from Storage"
                                className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors disabled:opacity-50"
                              >
                                {storageBusyUrl === formData.mainImageUrl ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* price + currency */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label
                          htmlFor="gmc-price"
                          className="text-[10px] font-black text-gray-500 uppercase tracking-widest"
                        >
                          Price <span className="text-red-500">*</span>{' '}
                          <span className="font-mono text-gray-400 normal-case">(price)</span>
                        </label>
                        <span className="text-[10px] font-mono font-bold text-[#0077B6]">
                          Feed: {formattedGmcPricePreview}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          id="gmc-price"
                          name="price"
                          type="number"
                          required
                          min="0.01"
                          step="0.01"
                          placeholder="e.g. 1999.00"
                          value={formData.priceAmount}
                          onChange={(e) =>
                            setFormData({ ...formData, priceAmount: e.target.value })
                          }
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-bold text-[#1A2B4C] text-sm"
                        />
                        <select
                          aria-label="Price Currency"
                          value={formData.priceCurrency}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              priceCurrency: e.target.value as SupportedCurrency,
                            })
                          }
                          className="w-24 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-3.5 font-black text-xs text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
                        >
                          {SUPPORTED_CURRENCIES.map((code) => (
                            <option key={code} value={code}>
                              {code}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* availability + condition */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="gmc-availability"
                          className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5"
                        >
                          Availability <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="gmc-availability"
                          name="availability"
                          required
                          value={formData.availability}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              availability: e.target.value as AvailabilityOption,
                            })
                          }
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-3.5 font-mono font-bold text-xs text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
                        >
                          <option value="in_stock">in_stock</option>
                          <option value="out_of_stock">out_of_stock</option>
                          <option value="preorder">preorder</option>
                          <option value="backorder">backorder</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="gmc-condition"
                          className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5"
                        >
                          Condition <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="gmc-condition"
                          name="condition"
                          required
                          value={formData.condition}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              condition: e.target.value as ConditionOption,
                            })
                          }
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-3.5 font-mono font-bold text-xs text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
                        >
                          <option value="new">new</option>
                          <option value="refurbished">refurbished</option>
                          <option value="used">used</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ================================================================= */}
                {/* 2. IDENTIFIERS (CRUCIAL FOR GOOGLE SHOPPING)                      */}
                {/* ================================================================= */}
                <section id="sec-identifiers" className="scroll-mt-4 space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Barcode size={16} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-[#1A2B4C] uppercase tracking-wider">
                          2. Identifiers (Google Shopping)
                        </h3>
                        <p className="text-[11px] text-gray-500 font-medium">
                          Required for branded items to prevent &ldquo;Missing Identifiers&rdquo; disapprovals.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {/* identifier_exists */}
                    <div>
                      <label
                        htmlFor="gmc-identifier-exists"
                        className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5"
                      >
                        Has Identifiers? <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="gmc-identifier-exists"
                        name="identifier_exists"
                        required
                        value={formData.identifierExists}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            identifierExists: e.target.value as YesNoOption,
                          })
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 font-mono font-bold text-xs text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
                      >
                        <option value="yes">yes (Branded / Standard)</option>
                        <option value="no">no (Custom-made only)</option>
                      </select>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Select <code className="font-mono">no</code> ONLY for custom items without barcodes.
                      </p>
                    </div>

                    {/* gtin */}
                    <div>
                      <label
                        htmlFor="gmc-gtin"
                        className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5"
                      >
                        GTIN / UPC / EAN{' '}
                        <span className="font-mono text-gray-400 normal-case">(gtin)</span>
                      </label>
                      <input
                        id="gmc-gtin"
                        name="gtin"
                        type="text"
                        inputMode="numeric"
                        disabled={formData.identifierExists === 'no'}
                        pattern="^(\d{8}|\d{12}|\d{13}|\d{14})$"
                        maxLength={14}
                        title="Enter 8, 12, 13, or 14 digits with no dashes or spaces"
                        placeholder="8, 12, 13, or 14 digits"
                        value={formData.gtin}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            gtin: e.target.value.replace(/\D/g, '').slice(0, 14),
                          })
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-mono font-bold text-[#1A2B4C] text-sm disabled:opacity-50"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        Barcode digits only — no dashes or spaces.
                      </p>
                    </div>

                    {/* mpn */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label
                          htmlFor="gmc-mpn"
                          className="text-[10px] font-black text-gray-500 uppercase tracking-widest"
                        >
                          MPN (Part Number){' '}
                          {formData.identifierExists === 'yes' && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        <span className="text-[10px] font-mono text-gray-400">
                          {formData.mpn.length}/70
                        </span>
                      </div>
                      <input
                        id="gmc-mpn"
                        name="mpn"
                        type="text"
                        required={formData.identifierExists === 'yes'}
                        disabled={formData.identifierExists === 'no'}
                        maxLength={70}
                        placeholder="e.g. 83M85AA"
                        value={formData.mpn}
                        onChange={(e) => setFormData({ ...formData, mpn: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-mono font-bold text-[#1A2B4C] text-sm disabled:opacity-50"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        Must match manufacturer part number exactly.
                      </p>
                    </div>
                  </div>
                </section>

                {/* ================================================================= */}
                {/* 3. CATEGORIZATION & ORGANIZATION                                  */}
                {/* ================================================================= */}
                <section id="sec-categorization" className="scroll-mt-4 space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#0077B6] flex items-center justify-center">
                        <Tags size={16} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-[#1A2B4C] uppercase tracking-wider">
                          3. Categorization &amp; Custom Labels
                        </h3>
                        <p className="text-[11px] text-gray-500 font-medium">
                          Map to Google&apos;s official taxonomy and configure campaign labels (max 100 chars each).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    {/* google_product_category */}
                    <div>
                      <label
                        htmlFor="google_product_category"
                        className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5"
                      >
                        Google Category{' '}
                        <span className="font-mono text-gray-400 normal-case">
                          (google_product_category — Official Taxonomy)
                        </span>
                      </label>
                      <GoogleCategoryAutocomplete
                        id="google_product_category"
                        value={formData.googleProductCategory}
                        onChange={(val) =>
                          setFormData((prev) => ({ ...prev, googleProductCategory: val }))
                        }
                      />
                    </div>

                    {/* product_type */}
                    <div>
                      <label
                        htmlFor="gmc-product-type"
                        className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5"
                      >
                        Store Category{' '}
                        <span className="font-mono text-gray-400 normal-case">(product_type)</span>
                      </label>
                      <input
                        id="gmc-product-type"
                        name="product_type"
                        type="text"
                        list="store-product-type-suggestions"
                        maxLength={750}
                        placeholder="e.g. Video Conferencing > Room Systems"
                        value={formData.productType}
                        onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-semibold text-[#1A2B4C] text-sm"
                      />
                      <datalist id="store-product-type-suggestions">
                        <option value="Video Conferencing > Room Systems" />
                        <option value="Video Conferencing > All-in-One Video Bars" />
                        <option value="Video Conferencing > PTZ Cameras" />
                        <option value="IP Phones & VoIP > SIP Desk Phones" />
                        <option value="Headsets > Wireless UC Headsets" />
                        <option value="Projectors > 4K Laser Projectors" />
                        <option value="Intercom & Paging > Public Address Systems" />
                        <option value="IP Cameras > Enterprise Surveillance" />
                        <option value="Broadcast > Podium Teleprompters" />
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name} />
                        ))}
                      </datalist>
                    </div>

                    {/* custom_label_0 through custom_label_4 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                      {(
                        [
                          {
                            key: 'customLabel0',
                            feedName: 'custom_label_0',
                            label: 'Custom Label 0',
                            placeholder: 'e.g. Poly, High-Margin, Q4-Sale',
                          },
                          {
                            key: 'customLabel1',
                            feedName: 'custom_label_1',
                            label: 'Custom Label 1',
                            placeholder: 'e.g. Video Conferencing',
                          },
                          {
                            key: 'customLabel2',
                            feedName: 'custom_label_2',
                            label: 'Custom Label 2',
                            placeholder: 'e.g. Enterprise-Boardroom',
                          },
                          {
                            key: 'customLabel3',
                            feedName: 'custom_label_3',
                            label: 'Custom Label 3',
                            placeholder: 'e.g. Lahore-In-Stock',
                          },
                          {
                            key: 'customLabel4',
                            feedName: 'custom_label_4',
                            label: 'Custom Label 4',
                            placeholder: 'e.g. Priority-Shopping-Ads',
                          },
                        ] as const
                      ).map((lbl) => (
                        <div key={lbl.key}>
                          <div className="flex justify-between items-center mb-1.5">
                            <label
                              htmlFor={lbl.feedName}
                              className="text-[10px] font-black text-gray-500 uppercase tracking-widest"
                            >
                              {lbl.label}
                            </label>
                            <span className="text-[10px] font-mono text-gray-400">
                              {formData[lbl.key].length}/100
                            </span>
                          </div>
                          <input
                            id={lbl.feedName}
                            name={lbl.feedName}
                            type="text"
                            maxLength={100}
                            placeholder={lbl.placeholder}
                            value={formData[lbl.key]}
                            onChange={(e) =>
                              setFormData({ ...formData, [lbl.key]: e.target.value })
                            }
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* ================================================================= */}
                {/* 4. SHIPPING & RETURNS                                             */}
                {/* ================================================================= */}
                <section id="sec-shipping" className="scroll-mt-4 space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Truck size={16} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-[#1A2B4C] uppercase tracking-wider">
                          4. Shipping &amp; Returns
                        </h3>
                        <p className="text-[11px] text-gray-500 font-medium">
                          Packaged dimensions (shared unit across L × W × H), packaged weight, and GMC return policy label.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* shipping_weight */}
                    <div>
                      <label
                        htmlFor="gmc-shipping-weight"
                        className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5"
                      >
                        Shipping Weight{' '}
                        <span className="font-mono text-gray-400 normal-case">
                          (shipping_weight — Packaged)
                        </span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="gmc-shipping-weight"
                          name="shipping_weight"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="e.g. 8.5"
                          value={formData.shippingWeightValue}
                          onChange={(e) =>
                            setFormData({ ...formData, shippingWeightValue: e.target.value })
                          }
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-[#00B4D8] font-bold text-[#1A2B4C] text-sm"
                        />
                        <select
                          aria-label="Shipping Weight Unit"
                          value={formData.shippingWeightUnit}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              shippingWeightUnit: e.target.value as WeightUnit,
                            })
                          }
                          className="w-20 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-3.5 font-mono font-bold text-xs text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
                        >
                          <option value="kg">kg</option>
                          <option value="lb">lb</option>
                        </select>
                      </div>
                    </div>

                    {/* return_policy_label */}
                    <div>
                      <label
                        htmlFor="gmc-return-policy"
                        className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5"
                      >
                        Return Policy{' '}
                        <span className="font-mono text-gray-400 normal-case">
                          (return_policy_label)
                        </span>
                      </label>
                      <input
                        id="gmc-return-policy"
                        name="return_policy_label"
                        type="text"
                        list="return-policy-presets"
                        maxLength={100}
                        placeholder="e.g. b2b-30-day"
                        value={formData.returnPolicyLabel}
                        onChange={(e) =>
                          setFormData({ ...formData, returnPolicyLabel: e.target.value })
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-[#00B4D8] font-mono font-bold text-xs text-[#1A2B4C]"
                      />
                      <datalist id="return-policy-presets">
                        {RETURN_POLICY_PRESETS.map((preset) => (
                          <option key={preset} value={preset} />
                        ))}
                      </datalist>
                    </div>

                    {/* Shared Shipping Dimensions (Length, Width, Height + Same Unit Dropdown) */}
                    <div className="sm:col-span-2 bg-gray-50/70 border border-gray-200/70 rounded-2xl p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-black text-[#1A2B4C] uppercase tracking-widest">
                          Shipping Dimensions (All 3 share the same unit)
                        </span>
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor="gmc-dim-unit"
                            className="text-[10px] font-bold text-gray-500 uppercase"
                          >
                            Unit:
                          </label>
                          <select
                            id="gmc-dim-unit"
                            value={formData.shippingDimensionUnit}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                shippingDimensionUnit: e.target.value as DimensionUnit,
                              })
                            }
                            className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 font-mono font-bold text-xs text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
                          >
                            <option value="cm">cm (Centimeters)</option>
                            <option value="in">in (Inches)</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label
                            htmlFor="gmc-shipping-length"
                            className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1"
                          >
                            Shipping Length ({formData.shippingDimensionUnit})
                          </label>
                          <input
                            id="gmc-shipping-length"
                            name="shipping_length"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="e.g. 78"
                            value={formData.shippingLengthValue}
                            onChange={(e) =>
                              setFormData({ ...formData, shippingLengthValue: e.target.value })
                            }
                            className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#00B4D8] font-bold text-[#1A2B4C] text-sm"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="gmc-shipping-width"
                            className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1"
                          >
                            Shipping Width ({formData.shippingDimensionUnit})
                          </label>
                          <input
                            id="gmc-shipping-width"
                            name="shipping_width"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="e.g. 18"
                            value={formData.shippingWidthValue}
                            onChange={(e) =>
                              setFormData({ ...formData, shippingWidthValue: e.target.value })
                            }
                            className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#00B4D8] font-bold text-[#1A2B4C] text-sm"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="gmc-shipping-height"
                            className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1"
                          >
                            Shipping Height ({formData.shippingDimensionUnit})
                          </label>
                          <input
                            id="gmc-shipping-height"
                            name="shipping_height"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="e.g. 15"
                            value={formData.shippingHeightValue}
                            onChange={(e) =>
                              setFormData({ ...formData, shippingHeightValue: e.target.value })
                            }
                            className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#00B4D8] font-bold text-[#1A2B4C] text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ================================================================= */}
                {/* 5. OPTIONAL / ADVANCED (HARDWARE)                                 */}
                {/* ================================================================= */}
                <section id="sec-advanced" className="scroll-mt-4 space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Sliders size={16} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-[#1A2B4C] uppercase tracking-wider">
                          5. Optional / Advanced (Pro-AV Hardware)
                        </h3>
                        <p className="text-[11px] text-gray-500 font-medium">
                          Boost Shopping Ads quality with gallery images (up to 10), video demos, bundles, and sale pricing.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Images (Up to 10 URL inputs) */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Additional Images{' '}
                        <span className="font-mono text-gray-400 normal-case">
                          (additional_image_link — {formData.additionalImageUrls.length}/10)
                        </span>
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0077B6] border border-sky-200 transition-colors">
                          <Upload size={12} /> Upload Photo
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isOptimizingUpload || formData.additionalImageUrls.length >= 10}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleOptimizedDirectUpload(file, 'additional');
                              e.target.value = '';
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowStorageBrowserModal(true)}
                          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-[#1A2B4C] hover:border-[#00B4D8] transition-colors"
                        >
                          <Cloud size={12} className="text-[#00B4D8]" /> Pick from Products/
                        </button>
                        <button
                          type="button"
                          disabled={formData.additionalImageUrls.length >= 10}
                          onClick={addAdditionalImageSlot}
                          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl bg-[#1A2B4C] text-white hover:bg-[#00B4D8] disabled:opacity-40 transition-colors"
                        >
                          <Plus size={12} /> Add Image URL
                        </button>
                      </div>
                    </div>

                    {formData.additionalImageUrls.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-4 text-xs text-gray-500 flex items-center justify-between">
                        <span>No additional gallery images configured yet (up to 10 supported).</span>
                        <button
                          type="button"
                          onClick={addAdditionalImageSlot}
                          className="text-[#00B4D8] font-bold hover:underline"
                        >
                          + Add first extra image
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {formData.additionalImageUrls.map((imgUrl, idx) => {
                          const canDeleteStorageFile =
                            isProductsStorageBucketUrl(imgUrl) || imgUrl.includes('/images/');
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-7 text-center text-[10px] font-mono font-bold text-gray-400">
                                #{idx + 1}
                              </span>
                              <input
                                type="url"
                                name={`additional_image_link_${idx}`}
                                placeholder="https://firebasestorage.googleapis.com/... or https://avlive.com.pk/images/products/..."
                                value={imgUrl}
                                onChange={(e) =>
                                  updateAdditionalImageSlot(idx, normalizeProductImageUrl(e.target.value))
                                }
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#00B4D8] font-mono text-xs text-[#1A2B4C]"
                              />
                              {/^https?:\/\//i.test(imgUrl) && (
                                <img
                                  src={imgUrl}
                                  alt={`${formData.productName || 'Product'} additional image ${idx + 1}`}
                                  title={`${formData.productName || 'Product'} additional image ${idx + 1}`}
                                  className="w-9 h-9 rounded-lg border border-gray-200 object-contain bg-white p-0.5 shrink-0"
                                />
                              )}
                              {imgUrl.trim() && (
                                <button
                                  type="button"
                                  title="Make this the Main Image"
                                  onClick={() => {
                                    const promoted = imgUrl.trim();
                                    setFormData((prev) => {
                                      const oldMain = prev.mainImageUrl.trim();
                                      const remaining = prev.additionalImageUrls.filter((_, i) => i !== idx);
                                      const nextAdditional =
                                        oldMain && oldMain !== promoted
                                          ? [oldMain, ...remaining].slice(0, 10)
                                          : remaining;
                                      return {
                                        ...prev,
                                        mainImageUrl: promoted,
                                        additionalImageUrls: nextAdditional,
                                      };
                                    });
                                  }}
                                  className="px-2 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0077B6] text-[9px] font-black uppercase tracking-wider shrink-0"
                                >
                                  <Star size={11} className="inline mr-0.5" /> Main
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeAdditionalImageSlot(idx)}
                                aria-label={`Remove additional image ${idx + 1}`}
                                title="Remove from product"
                                className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <X size={15} />
                              </button>
                              {canDeleteStorageFile && (
                                <button
                                  type="button"
                                  disabled={storageBusyUrl === imgUrl}
                                  onClick={() =>
                                    handleDeleteStorageFileForUrl(imgUrl, 'additional', idx)
                                  }
                                  aria-label={`Delete additional image ${idx + 1} from Storage`}
                                  title="Delete file from Storage"
                                  className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                  {storageBusyUrl === imgUrl ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : (
                                    <Trash2 size={14} />
                                  )}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Auto-Optimized Lightweight Image Upload */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Fast Upload to gs://{PRODUCTS_STORAGE_BUCKET}/Products (Auto-Compressed ~50–90 KB WebP)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowStorageBrowserModal(true)}
                        className="text-[10px] font-black text-[#00B4D8] hover:text-[#1A2B4C] uppercase tracking-wider inline-flex items-center gap-1"
                      >
                        Manage Products/ Bucket <ExternalLink size={11} />
                      </button>
                    </div>
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-[#00B4D8] hover:bg-[#00B4D8]/5 transition-all cursor-pointer bg-gray-50/50 relative overflow-hidden">
                      <input
                        type="file"
                        accept="image/*"
                        id="product-image-upload"
                        disabled={isOptimizingUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleOptimizedDirectUpload(file, 'auto');
                          }
                          e.target.value = '';
                        }}
                      />
                      {isOptimizingUpload ? (
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#00B4D8]">
                          <Loader2 size={16} className="animate-spin" />
                          <span>Compressing to lightweight WebP &amp; uploading to Products/...</span>
                        </div>
                      ) : selectedFile ? (
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700">
                          <Check size={16} />
                          <span>{selectedFile.name} (queued)</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 pointer-events-none">
                          <ImageIcon size={16} className="text-gray-400" />
                          <span>Drop any raw photo here — auto-compressed to ~50–90 KB &amp; saved to Products/</span>
                        </div>
                      )}
                    </div>
                    {uploadOptimizationNote && (
                      <p className="text-[11px] font-bold text-emerald-700 mt-1.5">{uploadOptimizationNote}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* video_link */}
                    <div>
                      <label
                        htmlFor="gmc-video-link"
                        className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5"
                      >
                        Video URL{' '}
                        <span className="font-mono text-gray-400 normal-case">
                          (video_link — YouTube Demo)
                        </span>
                      </label>
                      <input
                        id="gmc-video-link"
                        name="video_link"
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={formData.videoLink}
                        onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-[#00B4D8] font-mono text-xs text-[#1A2B4C]"
                      />
                    </div>

                    {/* mobile_link */}
                    <div>
                      <label
                        htmlFor="gmc-mobile-link"
                        className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5"
                      >
                        Mobile URL{' '}
                        <span className="font-mono text-gray-400 normal-case">
                          (mobile_link — Optional)
                        </span>
                      </label>
                      <input
                        id="gmc-mobile-link"
                        name="mobile_link"
                        type="url"
                        placeholder="Leave blank unless mobile URL differs"
                        value={formData.mobileLink}
                        onChange={(e) => setFormData({ ...formData, mobileLink: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-[#00B4D8] font-mono text-xs text-[#1A2B4C]"
                      />
                    </div>

                    {/* sale_price */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label
                          htmlFor="gmc-sale-price"
                          className="text-[10px] font-black text-gray-500 uppercase tracking-widest"
                        >
                          Sale Price ({formData.priceCurrency}){' '}
                          <span className="font-mono text-gray-400 normal-case">(sale_price)</span>
                        </label>
                        {formattedGmcSalePreview && (
                          <span className="text-[10px] font-mono font-bold text-emerald-700">
                            Feed: {formattedGmcSalePreview}
                          </span>
                        )}
                      </div>
                      <input
                        id="gmc-sale-price"
                        name="sale_price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Optional discounted price"
                        value={formData.salePriceAmount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({ ...formData, salePriceAmount: val });
                          const saleNum = parseFloat(val);
                          const priceNum = parseFloat(formData.priceAmount);
                          if (val && Number.isFinite(saleNum) && Number.isFinite(priceNum) && saleNum >= priceNum) {
                            e.currentTarget.setCustomValidity(
                              'Sale price must be strictly lower than the regular price.'
                            );
                          } else {
                            e.currentTarget.setCustomValidity('');
                          }
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-[#00B4D8] font-bold text-[#1A2B4C] text-sm"
                      />
                    </div>

                    {/* is_bundle & multipack */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="gmc-is-bundle"
                          className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5"
                        >
                          Is Bundle?{' '}
                          <span className="font-mono text-gray-400 normal-case">(is_bundle)</span>
                        </label>
                        <select
                          id="gmc-is-bundle"
                          name="is_bundle"
                          value={formData.isBundle}
                          onChange={(e) =>
                            setFormData({ ...formData, isBundle: e.target.value as YesNoOption })
                          }
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-3.5 font-mono font-bold text-xs text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
                        >
                          <option value="no">no</option>
                          <option value="yes">yes (e.g. X52 + TC10)</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="gmc-multipack"
                          className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5"
                        >
                          Multipack Qty
                        </label>
                        <input
                          id="gmc-multipack"
                          name="multipack"
                          type="number"
                          min="1"
                          step="1"
                          placeholder="Blank or 1"
                          value={formData.multipack}
                          onChange={(e) => setFormData({ ...formData, multipack: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-[#00B4D8] font-bold text-[#1A2B4C] text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* ================================================================= */}
                {/* 6. STOREFRONT PUBLISHING, RICH COPY & SEO (PRESERVED)             */}
                {/* ================================================================= */}
                <section id="sec-storefront" className="scroll-mt-4 space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#1A2B4C] flex items-center justify-center">
                        <Globe size={16} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-[#1A2B4C] uppercase tracking-wider">
                          6. Storefront Catalog, Inventory &amp; SEO
                        </h3>
                        <p className="text-[11px] text-gray-500 font-medium">
                          Controls visibility on avlive.com.pk, stock units, rich specifications, and search metadata.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="store-stock"
                        className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5"
                      >
                        Available Stock Units
                      </label>
                      <input
                        id="store-stock"
                        type="number"
                        min="0"
                        value={formData.stockQuantity}
                        onChange={(e) =>
                          setFormData({ ...formData, stockQuantity: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-[#00B4D8] font-bold text-[#1A2B4C] text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="store-cat-slugs"
                        className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5"
                      >
                        Storefront Category Slugs (Comma Separated)
                      </label>
                      <input
                        id="store-cat-slugs"
                        type="text"
                        placeholder="e.g. video-conferencing, large-room"
                        value={formData.categorySlugs.join(', ')}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            categorySlugs: e.target.value.split(',').map((s) => s.trim()),
                          })
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-[#00B4D8] font-bold text-[#1A2B4C] text-sm"
                      />
                    </div>

                    {/* Active & Featured Flags */}
                    <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-5 h-5 rounded-lg border-gray-300 text-[#00B4D8] focus:ring-[#00B4D8] cursor-pointer"
                      />
                      <div>
                        <label
                          htmlFor="isActive"
                          className="text-[10px] font-black text-[#1A2B4C] uppercase tracking-widest block cursor-pointer select-none"
                        >
                          Active Status
                        </label>
                        <span className="text-[10px] text-gray-400 font-semibold block">
                          Show this product in public catalog navigation
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="w-5 h-5 rounded-lg border-gray-300 text-[#00B4D8] focus:ring-[#00B4D8] cursor-pointer"
                      />
                      <div>
                        <label
                          htmlFor="isFeatured"
                          className="text-[10px] font-black text-[#1A2B4C] uppercase tracking-widest block cursor-pointer select-none"
                        >
                          Featured Showcase
                        </label>
                        <span className="text-[10px] text-gray-400 font-semibold block">
                          Display on the homepage featured section
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Technical Specifications */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Technical Specifications (Format: Label: Value;)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(formData.specifications);
                          showNotice('Specifications copied to clipboard.');
                        }}
                        className="flex items-center gap-1 text-[10px] font-bold text-[#00B4D8] uppercase tracking-widest hover:underline"
                      >
                        <Copy size={12} /> Copy
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Resolution: 4K UltraHD; Field of View: 120 Degrees; Audio: Poly NoiseBlockAI;"
                      value={formData.specifications}
                      onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] font-mono text-xs text-[#1A2B4C]"
                    />
                  </div>

                  {/* Storefront Rich Text Copy */}
                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">
                        Storefront Short Summary (Optional Card Preview)
                      </label>
                      <RichTextEditor
                        value={formData.shortDescription}
                        onChange={(val) => setFormData({ ...formData, shortDescription: val })}
                        placeholder="Brief 1-2 sentence overview for the storefront product card..."
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">
                        Storefront Full Technical Description (Optional Rich HTML)
                      </label>
                      <RichTextEditor
                        value={formData.description}
                        onChange={(val) => setFormData({ ...formData, description: val })}
                        placeholder="Detailed marketing and technical copy for the product page (GMC feed uses the plain-text Description above)..."
                      />
                    </div>
                  </div>

                  {/* SEO Meta Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          SEO Meta Description (Max 160 chars)
                        </label>
                        <span className="text-[10px] font-mono text-gray-400">
                          {formData.seoMetaDescription.length}/160
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        maxLength={160}
                        placeholder="Brief summary for Google Search snippets..."
                        value={formData.seoMetaDescription}
                        onChange={(e) =>
                          setFormData({ ...formData, seoMetaDescription: e.target.value })
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] text-sm text-[#1A2B4C] resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">
                        SEO Tags / Keywords
                      </label>
                      <input
                        type="text"
                        placeholder="Poly Studio X52 Pakistan, Zoom Room Bar"
                        value={formData.seoTags}
                        onChange={(e) => setFormData({ ...formData, seoTags: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] text-sm text-[#1A2B4C]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">
                        Primary Image Alt Text
                      </label>
                      <input
                        type="text"
                        placeholder="Poly Studio X52 4K Video Bar for Boardrooms in Pakistan"
                        value={formData.imageAltText}
                        onChange={(e) => setFormData({ ...formData, imageAltText: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] text-sm text-[#1A2B4C]"
                      />
                    </div>
                  </div>
                </section>
              </form>

              {/* Drawer Footer Actions */}
              <div className="p-5 sm:p-6 border-t border-gray-100 flex gap-4 bg-gray-50/70 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-white border border-gray-200 text-[#1A2B4C] font-black py-3.5 rounded-2xl hover:bg-gray-50 transition-all uppercase tracking-widest text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="product-form"
                  disabled={isSubmitting}
                  className="flex-[2] bg-[#1A2B4C] text-white font-black py-3.5 rounded-2xl hover:bg-[#00B4D8] transition-all shadow-xl shadow-[#1A2B4C]/10 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : editingId ? (
                    'Update Equipment & GMC Feed'
                  ) : (
                    'Publish Equipment to Catalog'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* GMC XML / CSV Feed Preview & Live Endpoints Modal */}
        {showFeedPreviewModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#1A2B4C]/50 backdrop-blur-sm"
              onClick={() => setShowFeedPreviewModal(false)}
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 flex flex-col"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 bg-gray-50/60">
                <div>
                  <h2 className="text-lg font-black text-[#1A2B4C] tracking-tight">
                    Google Merchant Center Feed Exporter (XML &amp; CSV)
                  </h2>
                  <p className="text-[11px] font-semibold text-gray-500 mt-0.5">
                    Maps all 30 Core, Identifier, Taxonomy, Custom Label, Shipping/Returns, and Advanced fields exactly to GMC specs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFeedPreviewModal(false)}
                  className="w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-3.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-white">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewFormat('xml')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${
                      previewFormat === 'xml'
                        ? 'bg-[#1A2B4C] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <FileCode2 size={14} /> RSS 2.0 XML
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFormat('csv')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${
                      previewFormat === 'csv'
                        ? 'bg-[#1A2B4C] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <FileSpreadsheet size={14} /> Exact 30-Col CSV
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={
                      previewFormat === 'xml'
                        ? `/feed/google-merchant.xml${exportCurrency !== 'AUTO' ? `?currency=${exportCurrency}` : ''}`
                        : `/feed/google-merchant.csv${exportCurrency !== 'AUTO' ? `?currency=${exportCurrency}` : ''}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-[10px] font-black uppercase tracking-widest text-[#1A2B4C] hover:border-[#00B4D8]"
                  >
                    <ExternalLink size={13} className="text-[#00B4D8]" /> Live Feed URL
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(feedPreviewContent);
                      showNotice(`Copied GMC ${previewFormat.toUpperCase()} feed to clipboard.`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-[10px] font-black uppercase tracking-widest text-[#1A2B4C] hover:bg-gray-50"
                  >
                    <Copy size={13} /> Copy
                  </button>
                  <button
                    type="button"
                    onClick={previewFormat === 'xml' ? handleExportXml : handleExportCsv}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00B4D8] hover:bg-[#1A2B4C] text-white text-[10px] font-black uppercase tracking-widest transition-colors"
                  >
                    <Download size={13} /> Download .{previewFormat}
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-auto flex-1 bg-slate-950 text-slate-100">
                <pre className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-all">
                  {feedPreviewContent.slice(0, 40000)}
                  {feedPreviewContent.length > 40000
                    ? '\n\n... [Preview truncated at 40KB — click Download to export the complete file] ...'
                    : ''}
                </pre>
              </div>
            </motion.div>
          </div>
        )}

        {/* Bulk External Image URLs Modal (Preserved) */}
        {showBulkImageModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#1A2B4C]/40 backdrop-blur-sm"
              onClick={() => setShowBulkImageModal(false)}
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 flex flex-col"
            >
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-xl font-black text-[#1A2B4C] tracking-tight">
                    Bulk External Image URL Updater
                  </h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                    Paste Product Name or SKU followed by direct external https:// image URL(s)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBulkImageModal(false)}
                  className="w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 transition-all flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleBulkImageUpdate} className="p-8 space-y-5">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                    One product per line (Format: Product Name or SKU | https://direct-image-url.jpg)
                  </label>
                  <textarea
                    rows={8}
                    value={bulkImageText}
                    onChange={(e) => setBulkImageText(e.target.value)}
                    placeholder={`Poly Studio X72 | https://example.com/poly-x72-front.jpg, https://example.com/poly-x72-side.jpg\nCisco Room Kit EQ | https://example.com/cisco-eq.jpg\nLogitech Rally Bar | https://example.com/rally-bar.jpg`}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#00B4D8] font-mono text-xs text-[#1A2B4C] resize-y"
                  />
                </div>

                {bulkUpdateResult && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                    {bulkUpdateResult}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkImageModal(false)}
                    className="px-6 py-3.5 rounded-2xl border border-gray-200 text-[#1A2B4C] font-black text-[10px] uppercase tracking-widest hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isBulkUpdating}
                    className="px-8 py-3.5 rounded-2xl bg-[#1A2B4C] hover:bg-[#00B4D8] text-white font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2"
                  >
                    {isBulkUpdating ? <Loader2 className="animate-spin" size={14} /> : null}
                    Apply External Image URLs
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        <ProductsStorageBrowserModal
          isOpen={showStorageBrowserModal}
          onClose={() => setShowStorageBrowserModal(false)}
          defaultSlugHint={formData.productName || formData.gmcId}
          hasActiveProductForm={showForm}
          onSelectAsMain={(url) => {
            setFormData((prev) => {
              const oldMain = prev.mainImageUrl.trim();
              const nextAdditional =
                oldMain && oldMain !== url && !prev.additionalImageUrls.includes(oldMain)
                  ? [oldMain, ...prev.additionalImageUrls].slice(0, 10)
                  : prev.additionalImageUrls;
              return {
                ...prev,
                mainImageUrl: url,
                additionalImageUrls: nextAdditional,
              };
            });
          }}
          onAddToAdditional={(url) => {
            setFormData((prev) => ({
              ...prev,
              additionalImageUrls:
                prev.additionalImageUrls.includes(url) || prev.mainImageUrl === url
                  ? prev.additionalImageUrls
                  : [...prev.additionalImageUrls.filter(Boolean).slice(0, 9), url],
            }));
          }}
          onNotify={showNotice}
        />

        <ProductBackupsModal
          isOpen={showBackupsModal}
          onClose={() => setShowBackupsModal(false)}
          products={products}
          onNotify={showNotice}
        />
      </AnimatePresence>
    </div>
  );
}

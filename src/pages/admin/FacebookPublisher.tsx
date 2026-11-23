import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Facebook,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Package,
  Briefcase,
  FileText,
  Image as ImageIcon,
  Link2,
  Trash2,
  KeyRound,
  LogOut,
  Search,
  ThumbsUp,
  MessageSquare,
  Share2,
  Sparkles,
} from 'lucide-react';
import {
  Product,
  Service,
  FacebookSettings,
  FacebookPostRecord,
  getProducts,
  getAllServices,
  getFacebookSettings,
  saveFacebookSettings,
  clearFacebookSettings,
  createFacebookPostRecord,
  getFacebookPostRecords,
  deleteFacebookPostRecord,
} from '../../lib/firebase/firestore-helpers';
import { auth } from '../../lib/firebase/client';
import { getProductHref, getCanonicalProductSlug, resolveProductPricing } from '../../lib/gmc-feed';
import { extractDirectImageUrls, DEFAULT_EXTERNAL_PRODUCT_IMAGE } from '../../lib/image-optimize';
import { ensureFacebookSdkReady, loginWithFacebookSdk } from '../../lib/facebook-sdk';

type SourceTab = 'product' | 'service' | 'custom';
type PostFormat = 'photo' | 'link' | 'text';
type ConnectMethod = 'token' | 'oauth';

interface OAuthStatusInfo {
  oauthConfigured: boolean;
  sdkConfigured?: boolean;
  redirectUri: string;
  hasEnvPageToken: boolean;
  envPageId: string | null;
}

interface CandidatePage {
  id: string;
  name: string;
  category: string;
  link: string;
  fanCount: number;
  pictureUrl: string;
}

interface LiveFbPost {
  id: string;
  message: string;
  createdTime: string;
  fullPicture: string;
  permalinkUrl: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
}

function stripHtmlTags(raw: string): string {
  return String(raw || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function toPublicCanonicalUrl(pathOrUrl: string): string {
  const raw = String(pathOrUrl || '').trim();
  if (!raw) return 'https://avlive.com.pk';
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://avlive.com.pk${raw.startsWith('/') ? '' : '/'}${raw}`;
}

function buildProductCaption(
  product: Product,
  includePrice: boolean,
  defaultHashtags: string
): string {
  const pricing = resolveProductPricing(product);
  const activePrice = pricing.salePrice > 0 ? pricing.salePrice : pricing.regularPrice;
  const priceLine =
    includePrice && activePrice > 0
      ? `Price: PKR ${activePrice.toLocaleString('en-PK')}${
          pricing.salePrice > 0 && pricing.regularPrice > pricing.salePrice
            ? ` (Regular PKR ${pricing.regularPrice.toLocaleString('en-PK')})`
            : ''
        }`
      : 'Enterprise & B2B Quotes Available';

  const desc = stripHtmlTags(product.shortDescription || product.description || '').slice(0, 320);
  const productUrl = toPublicCanonicalUrl(getProductHref(product, product.id));
  const brandTag = product.brand
    ? `#${String(product.brand).replace(/[^a-zA-Z0-9]/g, '')}`
    : '';

  return [
    `${product.productName}${product.sku ? ` (${product.sku})` : ''}`,
    '',
    desc || 'Authorized enterprise AV hardware with official warranty and turnkey deployment across Lahore, Karachi & Islamabad.',
    '',
    priceLine,
    `Specs & Order Online: ${productUrl}`,
    'Call / WhatsApp AV Live Engineers: +92 321 4256263',
    '',
    [brandTag, defaultHashtags].filter(Boolean).join(' ').trim(),
  ]
    .join('\n')
    .trim();
}

function buildServiceCaption(service: Service, defaultHashtags: string): string {
  const desc = stripHtmlTags(service.description || '').slice(0, 340);
  const serviceUrl = toPublicCanonicalUrl(`/services/${service.slug || service.id}`);
  const priceLine = service.priceRange ? `Packages Starting: ${service.priceRange}` : 'Turnkey Engineering & SLA Included';

  return [
    service.title,
    '',
    desc || 'Enterprise turnkey AV design, integration, and corporate event production across Pakistan.',
    '',
    priceLine,
    `Explore Service & Request Quote: ${serviceUrl}`,
    '24/7 Engineering Desk: +92 321 4256263',
    '',
    defaultHashtags.trim(),
  ]
    .join('\n')
    .trim();
}

export function FacebookPublisher() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Core data states
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [fbSettings, setFbSettings] = useState<FacebookSettings | null>(null);
  const [oauthStatus, setOauthStatus] = useState<OAuthStatusInfo | null>(null);
  const [postHistory, setPostHistory] = useState<FacebookPostRecord[]>([]);
  const [liveFeed, setLiveFeed] = useState<LiveFbPost[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);

  // Connection form states
  const [connectMethod, setConnectMethod] = useState<ConnectMethod>('token');
  const [manualPageId, setManualPageId] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [disconnectConfirm, setDisconnectConfirm] = useState(false);
  const [oauthHandoffId, setOauthHandoffId] = useState<string | null>(null);
  const [candidatePages, setCandidatePages] = useState<CandidatePage[]>([]);
  const [copiedCallback, setCopiedCallback] = useState<string | null>(null);

  // Preference editing
  const [defaultHashtags, setDefaultHashtags] = useState(
    '#AVLivePakistan #VideoConferencing #CorporateEvents #BoardroomAV'
  );
  const [autoIncludePrice, setAutoIncludePrice] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Composer states
  const [sourceTab, setSourceTab] = useState<SourceTab>('product');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [postFormat, setPostFormat] = useState<PostFormat>('photo');
  const [customTitle, setCustomTitle] = useState('AV Live Pakistan Update');
  const [caption, setCaption] = useState('');
  const [linkUrl, setLinkUrl] = useState('https://avlive.com.pk');
  const [imageUrl, setImageUrl] = useState('');
  const [publishing, setPublishing] = useState(false);

  // History / Feed tabs & feedback
  const [historyTab, setHistoryTab] = useState<'audit' | 'live'>('audit');
  const [deletingLivePostId, setDeletingLivePostId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedProduct = useMemo(
    () =>
      products.find(
        (p) =>
          p.id === selectedProductId ||
          getCanonicalProductSlug(p, p.id) === selectedProductId ||
          p.gmcId === selectedProductId
      ) || null,
    [products, selectedProductId]
  );

  const selectedService = useMemo(
    () =>
      services.find((s) => s.id === selectedServiceId || s.slug === selectedServiceId) || null,
    [services, selectedServiceId]
  );

  const productGalleryOptions = useMemo(() => {
    if (!selectedProduct) return [];
    const urls = extractDirectImageUrls(
      [selectedProduct.image, ...(selectedProduct.images || [])].filter(Boolean)
    );
    return urls.map((u) => toPublicCanonicalUrl(u));
  }, [selectedProduct]);

  const filteredProducts = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    const active = products.filter((p) => p.isActive !== false);
    if (!q) return active;
    return active.filter(
      (p) =>
        p.productName?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.mpn?.toLowerCase().includes(q)
    );
  }, [products, catalogSearch]);

  const filteredServices = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    const active = services.filter((s) => s.isActive !== false);
    if (!q) return active;
    return active.filter(
      (s) =>
        s.title?.toLowerCase().includes(q) ||
        s.slug?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q)
    );
  }, [services, catalogSearch]);

  const getBearerHeaders = async () => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('Admin session expired. Please sign in again.');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  // Load initial data (settings, catalog, history, OAuth readiness)
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      setLoading(true);
      try {
        const [prodList, svcList, savedFb, history] = await Promise.all([
          getProducts(),
          getAllServices(),
          getFacebookSettings().catch(() => null),
          getFacebookPostRecords().catch(() => []),
        ]);

        if (!mounted) return;
        setProducts(prodList);
        setServices(svcList);
        setPostHistory(history);

        if (savedFb) {
          setFbSettings(savedFb);
          if (savedFb.defaultHashtags) setDefaultHashtags(savedFb.defaultHashtags);
          if (typeof savedFb.autoIncludePrice === 'boolean') {
            setAutoIncludePrice(savedFb.autoIncludePrice);
          }
        }

        // Fetch server OAuth status
        try {
          const headers = await getBearerHeaders();
          const statusRes = await fetch('/api/admin/facebook/status', { headers });
          if (statusRes.ok && mounted) {
            const statusData: OAuthStatusInfo = await statusRes.json();
            setOauthStatus(statusData);
          }
        } catch {
          // Non-fatal
        }

        // Apply URL pre-selection if navigated from ProductManagement or ServiceManagement
        const qType = searchParams.get('type');
        const qId = searchParams.get('id');
        if (qType === 'service' && svcList.length > 0) {
          setSourceTab('service');
          const foundSvc =
            svcList.find((s) => s.id === qId || s.slug === qId) || svcList[0];
          if (foundSvc) {
            setSelectedServiceId(foundSvc.id || foundSvc.slug);
          }
        } else if (prodList.length > 0) {
          setSourceTab('product');
          const foundProd =
            (qId &&
              prodList.find(
                (p) =>
                  p.id === qId ||
                  p.sku === qId ||
                  getCanonicalProductSlug(p, p.id) === qId
              )) ||
            prodList[0];
          if (foundProd) {
            setSelectedProductId(foundProd.id || getCanonicalProductSlug(foundProd));
          }
        }
      } catch (err: any) {
        if (mounted) {
          setBanner({
            type: 'error',
            text: err?.message || 'Failed to load Facebook Studio workspace.',
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, []);

  // Populate composer automatically when source item changes
  const applyTemplateForCurrentSelection = () => {
    if (sourceTab === 'product' && selectedProduct) {
      setCaption(buildProductCaption(selectedProduct, autoIncludePrice, defaultHashtags));
      setLinkUrl(toPublicCanonicalUrl(getProductHref(selectedProduct, selectedProduct.id)));
      const firstImg = extractDirectImageUrls([
        selectedProduct.image,
        ...(selectedProduct.images || []),
      ])[0];
      setImageUrl(toPublicCanonicalUrl(firstImg || DEFAULT_EXTERNAL_PRODUCT_IMAGE));
    } else if (sourceTab === 'service' && selectedService) {
      setCaption(buildServiceCaption(selectedService, defaultHashtags));
      setLinkUrl(toPublicCanonicalUrl(`/services/${selectedService.slug || selectedService.id}`));
      setImageUrl(
        toPublicCanonicalUrl(
          selectedService.imageUrl || 'https://avlive.com.pk/images/projects/world-bank-president-stage.webp'
        )
      );
    }
  };

  useEffect(() => {
    if (loading) return;
    if (sourceTab === 'product' && selectedProduct) {
      applyTemplateForCurrentSelection();
    } else if (sourceTab === 'service' && selectedService) {
      applyTemplateForCurrentSelection();
    }
  }, [sourceTab, selectedProductId, selectedServiceId, loading]);

  // Listen for Meta OAuth popup completion
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const origin = event.origin || '';
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'FB_OAUTH_ERROR') {
        setConnecting(false);
        setBanner({
          type: 'error',
          text: event.data.error || 'Facebook authorization was cancelled or declined.',
        });
        return;
      }
      if (event.data?.type === 'FB_OAUTH_PAGES_READY' && event.data?.handoffId) {
        try {
          const headers = await getBearerHeaders();
          const res = await fetch('/api/admin/facebook/oauth/handoff', {
            method: 'POST',
            headers,
            body: JSON.stringify({ handoffId: event.data.handoffId }),
          });
          const data = await res.json();
          if (!res.ok || !Array.isArray(data.pages)) {
            throw new Error(data.error || 'Failed to retrieve Facebook Pages list.');
          }
          if (data.pages.length === 1) {
            await handleSelectOAuthPage(event.data.handoffId, data.pages[0].id);
          } else {
            setOauthHandoffId(event.data.handoffId);
            setCandidatePages(data.pages);
            setConnecting(false);
          }
        } catch (err: any) {
          setConnecting(false);
          setBanner({ type: 'error', text: err?.message || 'OAuth handoff failed.' });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSdkLogin = async () => {
    setConnecting(true);
    setBanner(null);
    try {
      const sdk = await ensureFacebookSdkReady();
      if (!sdk.ready) {
        throw new Error(sdk.error || 'Facebook JavaScript SDK is not initialized yet.');
      }
      const fbAuth = await loginWithFacebookSdk(
        'pages_show_list,pages_read_engagement,pages_manage_posts'
      );
      const userAccessToken = fbAuth.authResponse?.accessToken;
      if (!userAccessToken) {
        throw new Error('No access token returned by Facebook SDK.');
      }

      const headers = await getBearerHeaders();
      const res = await fetch('/api/admin/facebook/sdk-exchange', {
        method: 'POST',
        headers,
        body: JSON.stringify({ userAccessToken }),
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.pages) || !data.handoffId) {
        throw new Error(data.error || 'Failed to list managed Facebook Pages via SDK login.');
      }

      if (data.pages.length === 1) {
        await handleSelectOAuthPage(data.handoffId, data.pages[0].id);
      } else {
        setOauthHandoffId(data.handoffId);
        setCandidatePages(data.pages);
        setConnecting(false);
      }
    } catch (err: any) {
      setConnecting(false);
      setBanner({ type: 'error', text: err?.message || 'Facebook SDK Login failed.' });
    }
  };

  const handleStartOAuth = async () => {
    setConnecting(true);
    setBanner(null);
    try {
      const headers = await getBearerHeaders();
      const res = await fetch('/api/admin/facebook/oauth/url', { headers });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Meta App OAuth is not configured on the server.');
      }
      const popup = window.open(data.url, 'fb_oauth_popup', 'width=640,height=740');
      if (!popup) {
        setConnecting(false);
        setBanner({
          type: 'error',
          text: 'Your browser blocked the Facebook login popup. Allow popups for this site and click Connect again.',
        });
      }
    } catch (err: any) {
      setConnecting(false);
      setBanner({ type: 'error', text: err?.message || 'Failed to initiate Facebook OAuth.' });
    }
  };

  const handleSelectOAuthPage = async (handoffId: string, pageId: string) => {
    setConnecting(true);
    setBanner(null);
    try {
      const headers = await getBearerHeaders();
      const res = await fetch('/api/admin/facebook/oauth/select-page', {
        method: 'POST',
        headers,
        body: JSON.stringify({ handoffId, pageId }),
      });
      const data = await res.json();
      if (!res.ok || !data.page) {
        throw new Error(data.error || 'Failed to connect selected Facebook Page.');
      }

      const nextSettings: FacebookSettings = {
        connected: true,
        pageId: data.page.id,
        pageName: data.page.name,
        pageCategory: data.page.category,
        pageLink: data.page.link,
        pictureUrl: data.page.pictureUrl,
        fanCount: data.page.fanCount,
        connectionMethod: 'oauth',
        pageAccessToken: data.pageAccessToken || '',
        defaultHashtags,
        autoIncludePrice,
        connectedAt: new Date().toISOString(),
        connectedBy: auth.currentUser?.email || 'admin',
      };
      await saveFacebookSettings(nextSettings);
      setFbSettings(nextSettings);
      setCandidatePages([]);
      setOauthHandoffId(null);
      setBanner({
        type: 'success',
        text: `Connected Facebook Page "${data.page.name}" via Meta OAuth.`,
      });
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Failed to save Facebook Page.' });
    } finally {
      setConnecting(false);
    }
  };

  const handleVerifyManualToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    setBanner(null);
    try {
      const headers = await getBearerHeaders();
      const res = await fetch('/api/admin/facebook/verify-token', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          pageId: manualPageId.trim(),
          pageAccessToken: manualToken.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.verified || !data.page) {
        throw new Error(data.error || 'Verification failed against Meta Graph API.');
      }

      const nextSettings: FacebookSettings = {
        connected: true,
        pageId: data.page.id,
        pageName: data.page.name,
        pageCategory: data.page.category,
        pageLink: data.page.link,
        pictureUrl: data.page.pictureUrl,
        fanCount: data.page.fanCount,
        connectionMethod: 'token',
        pageAccessToken: manualToken.trim(),
        defaultHashtags,
        autoIncludePrice,
        connectedAt: new Date().toISOString(),
        connectedBy: auth.currentUser?.email || 'admin',
      };
      await saveFacebookSettings(nextSettings);
      setFbSettings(nextSettings);
      setManualToken('');
      setBanner({
        type: 'success',
        text: `Verified and connected "${data.page.name}" (ID: ${data.page.id}).`,
      });
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Could not verify Facebook Page token.' });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setConnecting(true);
    setBanner(null);
    try {
      const headers = await getBearerHeaders();
      await fetch('/api/admin/facebook/disconnect', {
        method: 'POST',
        headers,
        body: JSON.stringify({ pageId: fbSettings?.pageId || '' }),
      });
      await clearFacebookSettings();
      setFbSettings(null);
      setLiveFeed([]);
      setDisconnectConfirm(false);
      setBanner({ type: 'success', text: 'Disconnected Facebook Page from AV Live Admin.' });
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Failed to disconnect Page.' });
    } finally {
      setConnecting(false);
    }
  };

  const handleSavePrefs = async () => {
    if (!fbSettings?.connected) return;
    setSavingPrefs(true);
    try {
      const updated = {
        ...fbSettings,
        defaultHashtags,
        autoIncludePrice,
      };
      await saveFacebookSettings(updated);
      setFbSettings(updated);
      setBanner({ type: 'success', text: 'Default caption preferences saved.' });
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Failed to save preferences.' });
    } finally {
      setSavingPrefs(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbSettings?.connected || !fbSettings.pageId) {
      setBanner({ type: 'error', text: 'Connect your Facebook Page above before publishing.' });
      return;
    }
    if (!caption.trim()) {
      setBanner({ type: 'error', text: 'Post caption cannot be empty.' });
      return;
    }

    setPublishing(true);
    setBanner(null);

    const itemTitle =
      sourceTab === 'product'
        ? selectedProduct?.productName || 'Product Spotlight'
        : sourceTab === 'service'
        ? selectedService?.title || 'AV Live Service'
        : customTitle || 'Custom Update';
    const itemId =
      sourceTab === 'product'
        ? selectedProduct?.id || selectedProduct?.sku || 'custom-product'
        : sourceTab === 'service'
        ? selectedService?.id || selectedService?.slug || 'custom-service'
        : 'custom';

    try {
      const headers = await getBearerHeaders();
      const res = await fetch('/api/admin/facebook/publish', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          pageId: fbSettings.pageId,
          pageName: fbSettings.pageName,
          pageAccessToken: fbSettings.pageAccessToken || '',
          format: postFormat,
          message: caption.trim(),
          linkUrl: postFormat === 'link' ? linkUrl.trim() : '',
          imageUrl: postFormat === 'photo' ? imageUrl.trim() : '',
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        await createFacebookPostRecord({
          pageId: fbSettings.pageId,
          pageName: fbSettings.pageName,
          itemType: sourceTab,
          itemId,
          title: itemTitle,
          message: caption.trim(),
          postFormat,
          linkUrl: linkUrl.trim(),
          imageUrl: imageUrl.trim(),
          facebookPostId: '',
          permalinkUrl: '',
          status: 'failed',
          errorMessage: String(data.error || 'Publish failed').slice(0, 500),
          publishedBy: auth.currentUser?.email || 'admin',
        }).catch(() => '');
        throw new Error(data.error || 'Meta Graph API rejected the post.');
      }

      await createFacebookPostRecord({
        pageId: fbSettings.pageId,
        pageName: fbSettings.pageName,
        itemType: sourceTab,
        itemId,
        title: itemTitle,
        message: caption.trim(),
        postFormat,
        linkUrl: linkUrl.trim(),
        imageUrl: imageUrl.trim(),
        facebookPostId: data.facebookPostId,
        permalinkUrl: data.permalinkUrl,
        status: 'published',
        errorMessage: '',
        publishedBy: auth.currentUser?.email || 'admin',
      });

      const refreshedHistory = await getFacebookPostRecords().catch(() => postHistory);
      setPostHistory(refreshedHistory);
      setBanner({
        type: 'success',
        text: `Published "${itemTitle}" directly to ${fbSettings.pageName}.`,
      });
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Failed to publish post.' });
    } finally {
      setPublishing(false);
    }
  };

  const handleFetchLiveFeed = async () => {
    if (!fbSettings?.connected) return;
    setLoadingFeed(true);
    setBanner(null);
    try {
      const headers = await getBearerHeaders();
      const res = await fetch('/api/admin/facebook/feed', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          pageId: fbSettings.pageId,
          pageAccessToken: fbSettings.pageAccessToken || '',
        }),
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.posts)) {
        throw new Error(data.error || 'Failed to fetch live Page posts.');
      }
      setLiveFeed(data.posts);
      setHistoryTab('live');
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Could not retrieve live Page feed.' });
    } finally {
      setLoadingFeed(false);
    }
  };

  const handleDeleteLiveFbPost = async (fbPostId: string) => {
    if (!fbSettings?.connected) return;
    try {
      const headers = await getBearerHeaders();
      const res = await fetch(`/api/admin/facebook/post/${encodeURIComponent(fbPostId)}`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
          pageId: fbSettings.pageId,
          pageAccessToken: fbSettings.pageAccessToken || '',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete Facebook post.');
      }
      setLiveFeed((prev) => prev.filter((p) => p.id !== fbPostId));
      setDeletingLivePostId(null);
      setBanner({ type: 'success', text: 'Deleted post from Facebook Page.' });
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Failed to delete post.' });
    }
  };

  const copyText = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedCallback(key);
    setTimeout(() => setCopiedCallback(null), 2000);
  };

  if (loading) {
    return (
      <div className="py-36 text-center">
        <Loader2 className="animate-spin w-10 h-10 text-[#00B4D8] mx-auto mb-4" />
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">
          Loading Facebook Page Studio...
        </p>
      </div>
    );
  }

  const devCallbackUrl =
    'https://ais-dev-qydljobyekedk4xes6n6tm-321126968390.europe-west1.run.app/api/facebook/oauth/callback';
  const sharedCallbackUrl =
    'https://ais-pre-qydljobyekedk4xes6n6tm-321126968390.europe-west1.run.app/api/facebook/oauth/callback';

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#00B4D8] mb-1">
            Marketing & Social Publishing
          </p>
          <h1 className="text-3xl font-bold text-[#1A2B4C] tracking-tight">
            Facebook Page Publisher
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Connect your official Facebook Page and publish AV Live products, services, or updates directly to your feed.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {fbSettings?.connected && (
            <button
              type="button"
              onClick={handleFetchLiveFeed}
              disabled={loadingFeed}
              className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              {loadingFeed ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
              Sync Live Page Feed
            </button>
          )}
          <Link
            to="/admin/settings-general"
            className="px-4 py-2.5 rounded-lg bg-[#1A2B4C] text-white hover:bg-[#00B4D8] text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            Global Social Links
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      {/* Inline Feedback Banner */}
      {banner && (
        <div
          role="status"
          className={`flex items-start justify-between gap-4 p-4 rounded-xl border text-sm ${
            banner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-start gap-3">
            {banner.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{banner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="text-xs font-semibold opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Multi-Page Picker after OAuth */}
      {candidatePages.length > 1 && oauthHandoffId && (
        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#1A2B4C]">Select Facebook Page to Connect</h2>
          <p className="text-sm text-slate-600">
            Multiple Facebook Pages were returned for your Meta account. Choose which Page AV Live should publish to:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidatePages.map((pg) => (
              <button
                key={pg.id}
                type="button"
                onClick={() => handleSelectOAuthPage(oauthHandoffId, pg.id)}
                disabled={connecting}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-[#00B4D8] text-left transition-colors bg-slate-50/50"
              >
                {pg.pictureUrl ? (
                  <img
                    src={pg.pictureUrl}
                    alt={pg.name}
                    className="w-11 h-11 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-lg bg-[#1877F2] text-white flex items-center justify-center shrink-0">
                    <Facebook size={20} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-[#1A2B4C] truncate">{pg.name}</div>
                  <div className="text-xs text-slate-500 truncate">
                    {pg.category} · <span className="tabular-nums">{pg.fanCount.toLocaleString()}</span> followers
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 1. Connection & Authentication Panel */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        {fbSettings?.connected ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-4">
                {fbSettings.pictureUrl ? (
                  <img
                    src={fbSettings.pictureUrl}
                    alt={fbSettings.pageName}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shrink-0">
                    <Facebook size={26} />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-[#1A2B4C]">{fbSettings.pageName}</h2>
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={14} /> Connected
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2 tabular-nums">
                    <span>Page ID: {fbSettings.pageId}</span>
                    <span aria-hidden="true">·</span>
                    <span>{fbSettings.pageCategory || 'Business Page'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{(fbSettings.fanCount || 0).toLocaleString()} followers</span>
                    <span aria-hidden="true">·</span>
                    <span>Method: {fbSettings.connectionMethod === 'oauth' ? 'Meta OAuth' : 'Page Token'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={fbSettings.pageLink || `https://www.facebook.com/${fbSettings.pageId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-2 whitespace-nowrap"
                >
                  Open Facebook Page
                  <ExternalLink size={14} />
                </a>
                {disconnectConfirm ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      disabled={connecting}
                      className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
                    >
                      Confirm Disconnect
                    </button>
                    <button
                      type="button"
                      onClick={() => setDisconnectConfirm(false)}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDisconnectConfirm(true)}
                    className="px-4 py-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-2 whitespace-nowrap"
                  >
                    <LogOut size={14} />
                    Disconnect
                  </button>
                )}
              </div>
            </div>

            {/* Posting Defaults */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              <div className="lg:col-span-6 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Default Hashtags Appended to Generated Posts
                </label>
                <input
                  type="text"
                  value={defaultHashtags}
                  onChange={(e) => setDefaultHashtags(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
                />
              </div>
              <div className="lg:col-span-4 flex items-center gap-3 pb-2">
                <input
                  id="fb-auto-price"
                  type="checkbox"
                  checked={autoIncludePrice}
                  onChange={(e) => setAutoIncludePrice(e.target.checked)}
                  className="w-4 h-4 accent-[#00B4D8] rounded cursor-pointer"
                />
                <label htmlFor="fb-auto-price" className="text-sm text-slate-700 cursor-pointer">
                  Include PKR pricing automatically in Product captions
                </label>
              </div>
              <div className="lg:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSavePrefs}
                  disabled={savingPrefs}
                  className="w-full px-4 py-2 rounded-lg bg-[#1A2B4C] text-white text-xs font-semibold hover:bg-[#00B4D8] transition-colors disabled:opacity-50"
                >
                  {savingPrefs ? 'Saving...' : 'Save Defaults'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#1A2B4C]">Connect Your Facebook Page</h2>
                <p className="text-sm text-slate-600 mt-0.5">
                  Choose instant Page Access Token connection (works immediately with Meta Graph API) or 1-click Meta App OAuth.
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
                <button
                  type="button"
                  onClick={() => setConnectMethod('token')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    connectMethod === 'token'
                      ? 'bg-white text-[#1A2B4C] shadow-sm'
                      : 'text-slate-600 hover:text-[#1A2B4C]'
                  }`}
                >
                  Page Access Token
                </button>
                <button
                  type="button"
                  onClick={() => setConnectMethod('oauth')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    connectMethod === 'oauth'
                      ? 'bg-white text-[#1A2B4C] shadow-sm'
                      : 'text-slate-600 hover:text-[#1A2B4C]'
                  }`}
                >
                  Meta OAuth Login
                </button>
              </div>
            </div>

            {connectMethod === 'token' ? (
              <form onSubmit={handleVerifyManualToken} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="fb-page-id" className="text-xs font-semibold text-slate-700 block">
                        Numeric Facebook Page ID
                      </label>
                      <input
                        id="fb-page-id"
                        type="text"
                        required
                        value={manualPageId}
                        onChange={(e) => setManualPageId(e.target.value)}
                        placeholder="e.g. 104829384712345"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-[#00B4D8]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="fb-page-token" className="text-xs font-semibold text-slate-700 block">
                        Long-Lived Page Access Token
                      </label>
                      <input
                        id="fb-page-token"
                        type="password"
                        required
                        value={manualToken}
                        onChange={(e) => setManualToken(e.target.value)}
                        placeholder="EAAG..."
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-[#00B4D8]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={connecting}
                    className="px-5 py-2.5 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {connecting ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
                    {connecting ? 'Verifying with Meta Graph API...' : 'Verify & Connect Page'}
                  </button>
                </div>

                <div className="lg:col-span-5 bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs text-slate-600 space-y-2 leading-relaxed">
                  <div className="font-bold text-[#1A2B4C]">How to get your Page ID & Token in 60 seconds:</div>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>
                      Open{' '}
                      <a
                        href="https://developers.facebook.com/tools/explorer/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00B4D8] font-semibold hover:underline"
                      >
                        Meta Graph API Explorer
                      </a>{' '}
                      or Business Portfolio System Users.
                    </li>
                    <li>
                      Select permissions <code className="bg-white px-1 rounded border border-slate-200">pages_show_list</code>,{' '}
                      <code className="bg-white px-1 rounded border border-slate-200">pages_read_engagement</code>, and{' '}
                      <code className="bg-white px-1 rounded border border-slate-200">pages_manage_posts</code>.
                    </li>
                    <li>Select your AV Live Page under &ldquo;User or Page&rdquo; and paste the Page Token + numeric Page ID here.</li>
                  </ol>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-6 space-y-4">
                  <p className="text-sm text-slate-600">
                    Connect with the Meta JavaScript SDK (<code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded">FB.login</code>) or standard Meta OAuth popup to authorize and pick any Facebook Page you manage.
                  </p>
                  {!oauthStatus?.oauthConfigured && (
                    <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      Server secrets <code className="font-mono font-semibold">FACEBOOK_APP_ID</code> and{' '}
                      <code className="font-mono font-semibold">FACEBOOK_APP_SECRET</code> are not configured yet in AI Studio Secrets.
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSdkLogin}
                      disabled={connecting}
                      className="px-5 py-2.5 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {connecting ? <Loader2 size={15} className="animate-spin" /> : <Facebook size={15} />}
                      {connecting ? 'Authorizing...' : 'Continue with Facebook (JS SDK)'}
                    </button>
                    <button
                      type="button"
                      onClick={handleStartOAuth}
                      disabled={connecting}
                      className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-[#1A2B4C] text-xs font-semibold inline-flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      OAuth Redirect Popup
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 text-xs text-slate-600">
                  <div className="font-bold text-[#1A2B4C]">
                    Meta App Valid OAuth Redirect URIs (Add both in Facebook Login Settings):
                  </div>
                  {[
                    { key: 'dev', label: 'Development URL', url: devCallbackUrl },
                    { key: 'shared', label: 'Shared/Live URL', url: sharedCallbackUrl },
                  ].map((item) => (
                    <div key={item.key} className="space-y-1">
                      <span className="font-semibold text-slate-700">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-white border border-slate-200 rounded px-2.5 py-1.5 font-mono text-[11px] truncate">
                          {item.url}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyText(item.url, item.key)}
                          className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center gap-1 shrink-0"
                        >
                          {copiedCallback === item.key ? <Check size={12} /> : <Copy size={12} />}
                          {copiedCallback === item.key ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 2. Catalog Composer + Live Facebook Preview */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Item Selector + Composer */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[#1A2B4C]">Compose Post from Catalog</h2>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setSourceTab('product');
                  setSearchParams({ type: 'product' });
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
                  sourceTab === 'product'
                    ? 'bg-white text-[#1A2B4C] shadow-sm'
                    : 'text-slate-600 hover:text-[#1A2B4C]'
                }`}
              >
                <Package size={14} />
                Products ({products.filter((p) => p.isActive !== false).length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSourceTab('service');
                  setSearchParams({ type: 'service' });
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
                  sourceTab === 'service'
                    ? 'bg-white text-[#1A2B4C] shadow-sm'
                    : 'text-slate-600 hover:text-[#1A2B4C]'
                }`}
              >
                <Briefcase size={14} />
                Services ({services.filter((s) => s.isActive !== false).length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSourceTab('custom');
                  setSearchParams({ type: 'custom' });
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
                  sourceTab === 'custom'
                    ? 'bg-white text-[#1A2B4C] shadow-sm'
                    : 'text-slate-600 hover:text-[#1A2B4C]'
                }`}
              >
                <FileText size={14} />
                Custom
              </button>
            </div>
          </div>

          {/* Search & Picker for Product or Service */}
          {sourceTab !== 'custom' ? (
            <div className="space-y-3">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder={
                    sourceTab === 'product'
                      ? 'Search Poly, Cisco, Logitech, Horion, SKU or MPN...'
                      : 'Search Corporate Events, Video Conferencing, SMD LED...'
                  }
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-[#00B4D8]"
                />
              </div>

              <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                {sourceTab === 'product' ? (
                  filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => {
                      const pid = p.id || getCanonicalProductSlug(p);
                      const active = selectedProduct?.id === p.id || selectedProductId === pid;
                      const thumb = extractDirectImageUrls([p.image, ...(p.images || [])])[0];
                      const price = resolveProductPricing(p);
                      return (
                        <button
                          key={pid}
                          type="button"
                          onClick={() => setSelectedProductId(pid)}
                          className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                            active ? 'bg-cyan-50/70' : 'hover:bg-slate-50'
                          }`}
                        >
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={p.productName}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-white"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                              <Package size={16} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-[#1A2B4C] truncate">
                              {p.productName}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 tabular-nums truncate">
                              <span>{p.brand || 'AV Hardware'}</span>
                              <span aria-hidden="true">·</span>
                              <span>{p.sku || p.mpn || 'Catalog SKU'}</span>
                              <span aria-hidden="true">·</span>
                              <span>
                                PKR {(price.salePrice || price.regularPrice || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-sm text-slate-500">
                      No matching products found.
                    </div>
                  )
                ) : filteredServices.length > 0 ? (
                  filteredServices.map((s) => {
                    const sid = s.id || s.slug;
                    const active = selectedService?.id === s.id || selectedServiceId === sid;
                    return (
                      <button
                        key={sid}
                        type="button"
                        onClick={() => setSelectedServiceId(sid)}
                        className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                          active ? 'bg-cyan-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        {s.imageUrl ? (
                          <img
                            src={s.imageUrl}
                            alt={s.title}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                            <Briefcase size={16} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-[#1A2B4C] truncate">
                            {s.title}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {s.category || 'Enterprise Service'} · {s.priceRange || 'Custom Quote'}
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-sm text-slate-500">
                    No matching services found.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label htmlFor="fb-custom-title" className="text-xs font-semibold text-slate-700 block">
                Campaign / Announcement Title (Internal Log)
              </label>
              <input
                id="fb-custom-title"
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm focus:outline-none focus:border-[#00B4D8]"
              />
            </div>
          )}

          {/* Post Form */}
          <form onSubmit={handlePublish} className="space-y-4 pt-2 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPostFormat('photo')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 ${
                    postFormat === 'photo'
                      ? 'bg-white text-[#1A2B4C] shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  <ImageIcon size={14} />
                  Photo + Caption
                </button>
                <button
                  type="button"
                  onClick={() => setPostFormat('link')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 ${
                    postFormat === 'link'
                      ? 'bg-white text-[#1A2B4C] shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  <Link2 size={14} />
                  Link Preview Card
                </button>
                <button
                  type="button"
                  onClick={() => setPostFormat('text')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 ${
                    postFormat === 'text'
                      ? 'bg-white text-[#1A2B4C] shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  <FileText size={14} />
                  Text Only
                </button>
              </div>

              {sourceTab !== 'custom' && (
                <button
                  type="button"
                  onClick={applyTemplateForCurrentSelection}
                  className="text-xs font-semibold text-[#00B4D8] hover:underline flex items-center gap-1.5"
                >
                  <Sparkles size={13} />
                  Regenerate Suggested Copy
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="fb-post-caption" className="text-xs font-semibold text-slate-700">
                  Facebook Post Caption
                </label>
                <span className="text-xs text-slate-500 tabular-nums">
                  {caption.length} / 5000
                </span>
              </div>
              <textarea
                id="fb-post-caption"
                rows={7}
                maxLength={5000}
                required
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write or customize your Facebook Page caption..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
              />
            </div>

            {postFormat === 'link' && (
              <div className="space-y-1.5">
                <label htmlFor="fb-link-url" className="text-xs font-semibold text-slate-700 block">
                  Target Website Link (OpenGraph Card)
                </label>
                <input
                  id="fb-link-url"
                  type="url"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-mono focus:outline-none focus:border-[#00B4D8]"
                />
              </div>
            )}

            {postFormat === 'photo' && (
              <div className="space-y-2">
                <label htmlFor="fb-image-url" className="text-xs font-semibold text-slate-700 block">
                  Public Image URL (Fetched by Meta Servers)
                </label>
                <input
                  id="fb-image-url"
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-mono focus:outline-none focus:border-[#00B4D8]"
                />
                {productGalleryOptions.length > 1 && sourceTab === 'product' && (
                  <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                    {productGalleryOptions.map((imgOpt, i) => (
                      <button
                        key={imgOpt + i}
                        type="button"
                        onClick={() => setImageUrl(imgOpt)}
                        className={`w-12 h-12 rounded-lg overflow-hidden border shrink-0 ${
                          imageUrl === imgOpt ? 'border-[#00B4D8] ring-2 ring-[#00B4D8]/30' : 'border-slate-200'
                        }`}
                      >
                        <img src={imgOpt} alt={`Gallery option ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between gap-4 pt-2">
              <p className="text-xs text-slate-500">
                {fbSettings?.connected
                  ? `Publishing to ${fbSettings.pageName} via Graph API v22.0`
                  : 'Connect a Facebook Page above to enable publishing.'}
              </p>
              <button
                type="submit"
                disabled={publishing || !fbSettings?.connected}
                className="px-6 py-2.5 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {publishing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {publishing ? 'Publishing...' : 'Publish to Facebook Page'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Facebook Post Preview */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1A2B4C]">Live Facebook Feed Preview</h2>
            <span className="text-xs text-slate-500">Desktop & Mobile Mockup</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            {/* Simulated FB Card Header */}
            <div className="p-4 flex items-center gap-3">
              {fbSettings?.pictureUrl ? (
                <img
                  src={fbSettings.pictureUrl}
                  alt={fbSettings.pageName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center shrink-0">
                  <Facebook size={18} />
                </div>
              )}
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {fbSettings?.pageName || 'AV Live Communications Pakistan'}
                </div>
                <div className="text-xs text-slate-500">Just now · Public</div>
              </div>
            </div>

            {/* Simulated Caption */}
            <div className="px-4 pb-3 text-sm text-slate-800 whitespace-pre-wrap break-words leading-relaxed">
              {caption || 'Your generated product or service announcement will appear here.'}
            </div>

            {/* Simulated Media / Link Card */}
            {postFormat === 'photo' && imageUrl && (
              <div className="bg-slate-100 border-y border-slate-200 max-h-72 overflow-hidden flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt="Facebook post preview media"
                  className="w-full max-h-72 object-contain bg-white"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {postFormat === 'link' && (
              <div className="border-y border-slate-200 bg-slate-50">
                {imageUrl && (
                  <div className="max-h-48 overflow-hidden bg-white border-b border-slate-200">
                    <img
                      src={imageUrl}
                      alt="Link preview"
                      className="w-full h-44 object-contain"
                    />
                  </div>
                )}
                <div className="p-3.5 space-y-1">
                  <div className="text-[11px] uppercase tracking-wider text-slate-500">
                    AVLIVE.COM.PK
                  </div>
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {sourceTab === 'product'
                      ? selectedProduct?.productName
                      : sourceTab === 'service'
                      ? selectedService?.title
                      : customTitle}
                  </div>
                  <div className="text-xs text-slate-500 truncate font-mono">{linkUrl}</div>
                </div>
              </div>
            )}

            {/* Simulated FB Action Footer */}
            <div className="px-4 py-2.5 flex items-center justify-around text-xs font-semibold text-slate-500 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <ThumbsUp size={14} /> Like
              </span>
              <span className="flex items-center gap-1.5">
                <MessageSquare size={14} /> Comment
              </span>
              <span className="flex items-center gap-1.5">
                <Share2 size={14} /> Share
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Publish History & Live Facebook Page Feed */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
            <button
              type="button"
              onClick={() => setHistoryTab('audit')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                historyTab === 'audit'
                  ? 'bg-white text-[#1A2B4C] shadow-sm'
                  : 'text-slate-600'
              }`}
            >
              Website Publish History ({postHistory.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setHistoryTab('live');
                if (liveFeed.length === 0 && fbSettings?.connected) {
                  handleFetchLiveFeed();
                }
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                historyTab === 'live'
                  ? 'bg-white text-[#1A2B4C] shadow-sm'
                  : 'text-slate-600'
              }`}
            >
              Live Facebook Page Feed ({liveFeed.length})
            </button>
          </div>
        </div>

        {historyTab === 'audit' ? (
          postHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 pr-4">Item</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Format</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {postHistory.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 pr-4 max-w-md">
                        <div className="font-semibold text-[#1A2B4C] truncate">{row.title}</div>
                        <div className="text-xs text-slate-500 truncate">{row.message}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700 capitalize">
                        {row.itemType}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-600 uppercase">
                        {row.postFormat}
                      </td>
                      <td className="py-3.5 px-4">
                        {row.status === 'published' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 size={14} /> Published
                          </span>
                        ) : (
                          <span
                            title={row.errorMessage}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700"
                          >
                            <AlertCircle size={14} /> Failed
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {row.permalinkUrl && (
                            <a
                              href={row.permalinkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-[#1A2B4C] hover:bg-slate-100 inline-flex items-center gap-1"
                            >
                              View <ExternalLink size={12} />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setCaption(row.message);
                              setPostFormat(row.postFormat);
                              if (row.linkUrl) setLinkUrl(row.linkUrl);
                              if (row.imageUrl) setImageUrl(row.imageUrl);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Reuse Copy
                          </button>
                          {row.id && (
                            <button
                              type="button"
                              onClick={async () => {
                                await deleteFacebookPostRecord(row.id!);
                                setPostHistory((prev) => prev.filter((x) => x.id !== row.id));
                              }}
                              aria-label={`Remove log for ${row.title}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700">No Facebook posts logged yet.</p>
              <p className="text-xs text-slate-500">
                Select any Product or Service above and publish to record its live Facebook permalink here.
              </p>
            </div>
          )
        ) : !fbSettings?.connected ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Connect your Facebook Page to inspect live published posts and engagement metrics.
          </div>
        ) : loadingFeed ? (
          <div className="py-12 text-center">
            <Loader2 className="animate-spin w-6 h-6 text-[#00B4D8] mx-auto mb-2" />
            <p className="text-xs text-slate-500">Fetching recent posts from Meta Graph API...</p>
          </div>
        ) : liveFeed.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveFeed.map((post) => (
              <div
                key={post.id}
                className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-3 bg-slate-50/40"
              >
                <div className="space-y-3">
                  {post.fullPicture && (
                    <img
                      src={post.fullPicture}
                      alt="Facebook post media"
                      className="w-full h-36 object-cover rounded-lg border border-slate-200 bg-white"
                    />
                  )}
                  <p className="text-xs text-slate-700 line-clamp-4 whitespace-pre-wrap">
                    {post.message || '(Media update without caption)'}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500 tabular-nums">
                    <span>
                      {post.createdTime
                        ? new Date(post.createdTime).toLocaleDateString()
                        : 'Recent'}
                    </span>
                    <span>
                      {post.likesCount} likes · {post.commentsCount} comments · {post.sharesCount} shares
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={post.permalinkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#1877F2] hover:underline inline-flex items-center gap-1"
                    >
                      Open Post <ExternalLink size={12} />
                    </a>
                    {deletingLivePostId === post.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDeleteLiveFbPost(post.id)}
                          className="px-2 py-1 rounded bg-rose-600 text-white text-[11px] font-semibold"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingLivePostId(null)}
                          className="px-2 py-1 rounded border border-slate-200 text-slate-600 text-[11px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeletingLivePostId(post.id)}
                        className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-slate-500">
            Click &ldquo;Sync Live Page Feed&rdquo; above to load recent posts from your connected Facebook Page.
          </div>
        )}
      </section>
    </div>
  );
}

export default FacebookPublisher;

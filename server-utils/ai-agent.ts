import { GoogleGenAI, Type } from '@google/genai';
import crypto from 'crypto';
import { getCanonicalProductSlug, resolveProductPricing } from '../src/lib/gmc-feed';
import { FALLBACK_SERVICES_CATALOG } from '../src/lib/services-catalog';
import type {
  AgentActionButton,
  AgentLanguage,
  AgentTurnResponse,
  AIDailyReportMetrics,
  QuoteLineItem,
} from '../src/lib/ai-agent-types';

const SITE_BASE_URL = 'https://avlive.com.pk';

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });
}

export function sanitizeActionUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return `${SITE_BASE_URL}/shop`;
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('/')) {
    return `${SITE_BASE_URL}${trimmed}`;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
  } catch {
    // Fall back to safe shop URL
  }
  return `${SITE_BASE_URL}/shop`;
}

export function detectLanguageHeuristic(text: string): AgentLanguage {
  // Urdu Unicode range (Arabic/Urdu script)
  if (/[\u0600-\u06FF]/.test(text)) {
    return 'ur';
  }
  // Common Roman Urdu tokens
  const romanUrduRegex =
    /\b(salam|assalam|aoa|bhai|sir ji|kya|kia|kitne|kitna|price kya|rate kya|chahiye|chahie|bata|bataen|batao|bhej|bhejen|hum|ham|mera|meri|aap|ap|karachi|lahore|islamabad mein|hai|hain|ho|hoga|mil|milega|shukriya|theek|thik|haan|nahi|nai|zaroor|quote bhej|rate bhej)\b/i;
  if (romanUrduRegex.test(text)) {
    return 'roman_ur';
  }
  return 'en';
}

export function verifyMetaWebhookSignature(
  rawBody: Buffer | string,
  signatureHeader: string | undefined,
  appSecret: string | undefined
): boolean {
  if (!appSecret) return false;
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false;
  const expected =
    'sha256=' +
    crypto
      .createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signatureHeader, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function verify3cxBridgeSignature(
  rawBody: Buffer | string,
  signatureHeader: string | undefined,
  bridgeSecret: string | undefined
): boolean {
  if (!bridgeSecret) return false;
  if (!signatureHeader) return false;
  const cleanSig = signatureHeader.replace(/^sha256=/i, '').trim();
  const expectedHex = crypto
    .createHmac('sha256', bridgeSecret)
    .update(rawBody)
    .digest('hex');
  const a = Buffer.from(expectedHex, 'utf8');
  const b = Buffer.from(cleanSig, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function buildWhatsAppInteractivePayload(
  recipientPhone: string,
  replyText: string,
  buttons: AgentActionButton[]
): Record<string, unknown> {
  const to = recipientPhone.replace(/[^\d]/g, '') || '923001234567';
  const cleanBody = replyText.slice(0, 1024);
  const ctaBtn = buttons.find((b) => b.type === 'cta_url' && b.url);
  const replyBtns = buttons.filter((b) => b.type === 'reply').slice(0, 3);

  if (ctaBtn && ctaBtn.url) {
    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'cta_url',
        body: { text: cleanBody },
        footer: { text: 'AV Live Communications · Lahore · Karachi · Islamabad' },
        action: {
          name: 'cta_url',
          parameters: {
            display_text: ctaBtn.title.slice(0, 20),
            url: sanitizeActionUrl(ctaBtn.url),
          },
        },
      },
    };
  }

  if (replyBtns.length > 0) {
    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: cleanBody },
        footer: { text: 'AV Live Communications' },
        action: {
          buttons: replyBtns.map((btn, idx) => ({
            type: 'reply',
            reply: {
              id: (btn.payload || `btn_${idx + 1}`).slice(0, 64),
              title: btn.title.slice(0, 20),
            },
          })),
        },
      },
    };
  }

  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { body: cleanBody },
  };
}

interface IndexedCatalogItem {
  sku: string;
  name: string;
  brand: string;
  category: string;
  pricePkr: number;
  regularPricePkr: number;
  url: string;
  summary: string;
  searchBlob: string;
}

function rankCatalogItems(
  query: string,
  products: Record<string, any>[]
): {
  topProducts: IndexedCatalogItem[];
  topServices: Array<{
    slug: string;
    title: string;
    priceRange: string;
    url: string;
    summary: string;
  }>;
} {
  const tokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2);

  const mappedProducts: IndexedCatalogItem[] = products.map((p) => {
    const slug = getCanonicalProductSlug(p, p.id);
    const pricing = resolveProductPricing(p);
    const name = String(p.productName || p.name || slug);
    const brand = String(p.brand || 'AV Live');
    const sku = String(p.sku || p.mpn || slug).toUpperCase();
    const category = Array.isArray(p.categorySlugs)
      ? p.categorySlugs.join(', ')
      : String(p.category || 'av-hardware');
    const url = `${SITE_BASE_URL}/product/${slug}`;
    const summary = String(p.shortDescription || p.description || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 180);

    return {
      sku,
      name,
      brand,
      category,
      pricePkr: pricing.effectivePrice,
      regularPricePkr: pricing.regularPrice,
      url,
      summary,
      searchBlob: `${name} ${brand} ${sku} ${category} ${summary}`.toLowerCase(),
    };
  });

  const scoredProducts = mappedProducts
    .map((item) => {
      let score = 0;
      for (const tok of tokens) {
        if (item.name.toLowerCase().includes(tok)) score += 6;
        else if (item.brand.toLowerCase().includes(tok)) score += 4;
        else if (item.sku.toLowerCase().includes(tok)) score += 5;
        else if (item.searchBlob.includes(tok)) score += 2;
      }
      // Boost flagship video conferencing & VoIP SKUs slightly on generic queries
      if (
        tokens.some((t) => ['boardroom', 'meeting', 'room', 'conference', 'zoom', 'teams'].includes(t)) &&
        /poly|cisco|logitech|rally|studio/i.test(item.name)
      ) {
        score += 3;
      }
      if (
        tokens.some((t) => ['3cx', 'pbx', 'voip', 'sip', 'phone', 'call'].includes(t)) &&
        /3cx|grandstream|freepbx|vvx|cisco/i.test(item.name)
      ) {
        score += 4;
      }
      return { item, score };
    })
    .sort((a, b) => b.score - a.score);

  const topProducts = scoredProducts.slice(0, 8).map((s) => s.item);

  const scoredServices = FALLBACK_SERVICES_CATALOG.map((svc) => {
    const blob = `${svc.title} ${svc.description} ${svc.keywords || ''}`.toLowerCase();
    let score = 0;
    for (const tok of tokens) {
      if (blob.includes(tok)) score += 3;
    }
    return {
      score,
      svc: {
        slug: svc.slug,
        title: svc.title,
        priceRange: svc.priceRange || 'Custom Enterprise Quote',
        url: `${SITE_BASE_URL}/services/${svc.slug}`,
        summary: svc.description.slice(0, 160),
      },
    };
  }).sort((a, b) => b.score - a.score);

  return {
    topProducts,
    topServices: scoredServices.slice(0, 4).map((s) => s.svc),
  };
}

function needsExternalWebSearch(message: string): boolean {
  return /\b(compare|vs\.?|versus|compatible|compatibility|firmware|datasheet|spec|specs|latest|release|2025|2026|difference between|alternative to|supports?|zoom certification|teams certification|zoom rooms|teams rooms)\b/i.test(
    message
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function generateAgentTurn(params: {
  message: string;
  history?: Array<{ role: 'customer' | 'agent'; text: string }>;
  channel: 'whatsapp' | 'phone_3cx' | 'web_chat';
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  products: Record<string, any>[];
  allowWebSearch?: boolean;
}): Promise<AgentTurnResponse> {
  const {
    message,
    history = [],
    channel,
    customerName,
    customerPhone = '',
    customerEmail = '',
    products,
    allowWebSearch = true,
  } = params;

  const detectedLang = detectLanguageHeuristic(message);
  const { topProducts, topServices } = rankCatalogItems(message, products);
  const ai = getGenAI();

  let searchContext = '';
  let searchSources: Array<{ title: string; url: string }> = [];
  let usedGoogleSearch = false;

  // Step 1: Optional Google Search grounding for technical compatibility / external comparisons
  if (ai && allowWebSearch && needsExternalWebSearch(message)) {
    try {
      const searchRes = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Briefly answer this enterprise AV / video conferencing / VoIP technical question in 2 concise factual sentences for a Pakistani AV consultant: "${message}"`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      if (searchRes.text && searchRes.text.trim()) {
        searchContext = searchRes.text.trim().slice(0, 600);
        usedGoogleSearch = true;
      }
      const chunks =
        (searchRes as any)?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      for (const ch of chunks) {
        if (ch?.web?.uri && ch?.web?.title) {
          searchSources.push({
            title: String(ch.web.title).slice(0, 80),
            url: sanitizeActionUrl(String(ch.web.uri)),
          });
        }
      }
      searchSources = searchSources.slice(0, 3);
    } catch (searchErr) {
      console.warn('AI Agent Google Search grounding fallback:', searchErr);
    }
  }

  // Step 2: Structured JSON generation with Gemini 4 Hydrogen
  if (ai) {
    try {
      const catalogText = topProducts
        .map(
          (p) =>
            `- ${p.name} | SKU: ${p.sku} | Brand: ${p.brand} | Price: PKR ${p.pricePkr.toLocaleString('en-PK')} | URL: ${p.url}`
        )
        .join('\n');

      const servicesText = topServices
        .map((s) => `- ${s.title} | Range: ${s.priceRange} | URL: ${s.url}`)
        .join('\n');

      const historyText = history
        .slice(-6)
        .map((h) => `${h.role === 'customer' ? 'Customer' : 'Agent'}: ${h.text}`)
        .join('\n');

      const systemPrompt = `You are "Hamza from AV Live Communications" (Johar Town Block N, Lahore | +92 321 425 6263 | avlive.com.pk) — a warm, expert, human-like Pakistani Enterprise AV & Event Technology consultant.

STRICT RULES:
1. LANGUAGE AUTO-DETECTION: Reply naturally in the EXACT language the customer used:
   - If English -> concise professional English ("en").
   - If Urdu script -> polite, natural Urdu script ("ur").
   - If Roman Urdu (e.g., "salam bhai", "kitne ka hai") -> friendly, respectful Pakistani business Roman Urdu ("roman_ur").
2. CONCISE HUMAN REPLIES: Keep replyText to 2–3 short sentences (under 280 characters total). Never sound robotic or list long bullet paragraphs.
3. LINKS MUST BE BUTTONS ONLY: NEVER include raw URLs (no https://... or avlive.com.pk/...) inside replyText! Put all product, service, or quote links exclusively inside the "buttons" array (max 3 buttons, button title <= 20 characters).
4. EXACT PKR GROUNDING: Use ONLY the verified PKR prices and URLs from the AV Live Catalog & Services provided below. Never invent prices or fake URLs.
5. LEAD EXTRACTION & FOLLOW-UP: Extract any mentioned name, company, phone, email, city, interested SKUs, and estimated PKR value. Suggest a realistic follow-up task if the customer is shopping, requesting a quote, or planning an event.
6. ESCALATION: Set escalated=true if the customer asks for a human manager, reports an RMA/refund dispute, mentions an urgent >PKR 2,000,000 tender/event, or expresses frustration.
7. NEVER promise an email has already been sent — say you've prepared the quote/details for our team to confirm and send right away.`;

      const userPrompt = `Channel: ${channel}
Detected language hint: ${detectedLang}
Known customer details: Name="${customerName || ''}", Phone="${customerPhone}", Email="${customerEmail}"

RELEVANT AV LIVE CATALOG (EXACT PKR PRICES):
${catalogText}

RELEVANT AV LIVE SERVICES:
${servicesText}

${searchContext ? `VERIFIED WEB SEARCH TECHNICAL CONTEXT:\n${searchContext}\n` : ''}
${historyText ? `RECENT CONVERSATION:\n${historyText}\n` : ''}
NEW CUSTOMER MESSAGE:
"${message}"

Return structured JSON matching the schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              replyText: { type: Type.STRING },
              language: { type: Type.STRING },
              buttons: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    title: { type: Type.STRING },
                    url: { type: Type.STRING },
                    payload: { type: Type.STRING },
                  },
                  required: ['type', 'title'],
                },
              },
              escalated: { type: Type.BOOLEAN },
              escalationReason: { type: Type.STRING },
              extractedLead: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  company: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  email: { type: Type.STRING },
                  city: { type: Type.STRING },
                  intentSummary: { type: Type.STRING },
                  interestedSkus: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  estimatedValuePkr: { type: Type.NUMBER },
                },
              },
              suggestedTask: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  cadenceStep: { type: Type.STRING },
                  channel: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  dueInDays: { type: Type.NUMBER },
                  notes: { type: Type.STRING },
                },
              },
            },
            required: ['replyText', 'language', 'buttons', 'escalated'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      const lang: AgentLanguage =
        parsed.language === 'ur' || parsed.language === 'roman_ur' || parsed.language === 'en'
          ? parsed.language
          : detectedLang;

      // Strip any accidental raw URL from replyText to strictly enforce button-only links
      const cleanReply = String(parsed.replyText || '')
        .replace(/https?:\/\/\S+/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 340);

      const safeButtons: AgentActionButton[] = (Array.isArray(parsed.buttons) ? parsed.buttons : [])
        .slice(0, 3)
        .map((b: any, i: number) => {
          const isCta = b?.type === 'cta_url' && b?.url;
          return {
            type: isCta ? 'cta_url' : 'reply',
            title: String(b?.title || (isCta ? 'View Details' : 'Request Quote')).slice(0, 20),
            ...(isCta
              ? { url: sanitizeActionUrl(String(b.url)) }
              : { payload: String(b?.payload || `quick_${i + 1}`).slice(0, 64) }),
          };
        });

      // Ensure at least 1 clickable button is always present
      if (safeButtons.length === 0 && topProducts[0]) {
        safeButtons.push(
          { type: 'cta_url', title: 'View Product', url: topProducts[0].url },
          { type: 'reply', title: 'Get PKR Quote', payload: 'request_quote' }
        );
      }

      const extracted = parsed.extractedLead || {};
      const matchedProducts = topProducts.slice(0, 3).map((p) => ({
        sku: p.sku,
        name: p.name,
        pricePkr: p.pricePkr,
        url: p.url,
      }));

      const estimatedValuePkr =
        typeof extracted.estimatedValuePkr === 'number' && Number.isFinite(extracted.estimatedValuePkr)
          ? Math.max(0, Math.round(extracted.estimatedValuePkr))
          : topProducts[0]?.pricePkr || 0;

      const suggestedTask = parsed.suggestedTask?.title
        ? {
            title: String(parsed.suggestedTask.title).slice(0, 180),
            cadenceStep: (['day_1', 'day_3', 'day_7', 'custom'].includes(parsed.suggestedTask.cadenceStep)
              ? parsed.suggestedTask.cadenceStep
              : 'day_1') as 'day_1' | 'day_3' | 'day_7' | 'custom',
            channel: (['whatsapp', 'phone_3cx', 'email', 'internal'].includes(parsed.suggestedTask.channel)
              ? parsed.suggestedTask.channel
              : channel === 'phone_3cx'
                ? 'whatsapp'
                : channel === 'web_chat'
                  ? 'email'
                  : 'whatsapp') as 'whatsapp' | 'phone_3cx' | 'email' | 'internal',
            priority: (['high', 'medium', 'low'].includes(parsed.suggestedTask.priority)
              ? parsed.suggestedTask.priority
              : parsed.escalated
                ? 'high'
                : 'medium') as 'high' | 'medium' | 'low',
            dueInDays:
              typeof parsed.suggestedTask.dueInDays === 'number' && parsed.suggestedTask.dueInDays >= 0
                ? Math.min(30, Math.round(parsed.suggestedTask.dueInDays))
                : 1,
            notes: String(parsed.suggestedTask.notes || '').slice(0, 400),
          }
        : undefined;

      const finalReply =
        cleanReply ||
        `We can help with ${topProducts[0]?.name || 'your AV setup'}! Tap below to view full specs or request a PKR quote.`;

      return {
        replyText: finalReply,
        language: lang,
        buttons: safeButtons,
        groundingSource: usedGoogleSearch ? 'catalog+google_search' : 'catalog',
        searchSources,
        escalated: Boolean(parsed.escalated),
        escalationReason: parsed.escalationReason ? String(parsed.escalationReason).slice(0, 200) : undefined,
        extractedLead: {
          name: extracted.name || customerName || undefined,
          company: extracted.company || undefined,
          phone: extracted.phone || customerPhone || undefined,
          email: extracted.email || customerEmail || undefined,
          city: extracted.city || undefined,
          intentSummary: String(extracted.intentSummary || message).slice(0, 300),
          interestedSkus: Array.isArray(extracted.interestedSkus) && extracted.interestedSkus.length > 0
            ? extracted.interestedSkus.slice(0, 5).map(String)
            : topProducts.slice(0, 2).map((p) => p.sku),
          estimatedValuePkr,
        },
        suggestedTask,
        whatsappPayloadPreview: buildWhatsAppInteractivePayload(customerPhone, finalReply, safeButtons),
        matchedProducts,
      };
    } catch (aiErr) {
      console.warn('Gemini AI Agent turn fallback activated:', aiErr);
    }
  }

  // Deterministic Grounded Fallback (always returns exact PKR prices & clickable buttons even without GEMINI_API_KEY)
  const primary = topProducts[0];
  const secondary = topProducts[1];
  const escalated = /\b(refund|complaint|angry|manager|human|rma|urgent|tender|million)\b/i.test(message);

  let replyText = '';
  if (detectedLang === 'roman_ur') {
    replyText = primary
      ? `Salam! ${primary.name} PKR ${primary.pricePkr.toLocaleString('en-PK')} mein available hai (official warranty + Lahore/Karachi/Islamabad delivery). Niche buttons se details dekh lein ya quote banwa lein.`
      : `Salam! AV Live mein khush amdeed. Hum video conferencing, 3CX VoIP aur corporate events mein madad karte hain — niche button tap karein.`;
  } else if (detectedLang === 'ur') {
    replyText = primary
      ? `السلام علیکم! ${primary.name} کی قیمت PKR ${primary.pricePkr.toLocaleString('en-PK')} ہے (آفیشل وارنٹی اور پورے پاکستان میں ڈیلیوری)۔ تفصیل یا کوٹیشن کے لیے نیچے بٹن دبائیں۔`
      : `السلام علیکم! اے وی لائیو کمیونیکیشنز میں خوش آمدید۔ مکمل تفصیلات یا کوٹیشن کے لیے نیچے بٹن منتخب کریں۔`;
  } else {
    replyText = primary
      ? `Hi! The ${primary.name} is PKR ${primary.pricePkr.toLocaleString('en-PK')} with official warranty & nationwide installation across Pakistan. Tap below for full specs or a formal PKR quote.`
      : `Hi! I'm AV Assist from AV Live Communications. Tap below to browse our live PKR hardware catalog or request a custom boardroom quote.`;
  }

  const buttons: AgentActionButton[] = [];
  if (primary) {
    buttons.push({ type: 'cta_url', title: 'View Product', url: primary.url });
  }
  if (secondary) {
    buttons.push({ type: 'cta_url', title: 'Compare Option', url: secondary.url });
  }
  buttons.push({ type: 'reply', title: 'Request PKR Quote', payload: 'request_quote' });

  return {
    replyText,
    language: detectedLang,
    buttons: buttons.slice(0, 3),
    groundingSource: 'catalog',
    searchSources: [],
    escalated,
    escalationReason: escalated ? 'Customer requested escalation or urgent quote' : undefined,
    extractedLead: {
      name: customerName || undefined,
      phone: customerPhone || undefined,
      email: customerEmail || undefined,
      intentSummary: message.slice(0, 300),
      interestedSkus: primary ? [primary.sku] : [],
      estimatedValuePkr: primary?.pricePkr || 0,
    },
    suggestedTask: {
      title: `Follow up with ${customerName || customerPhone || 'Lead'} on ${primary?.name || 'AV Inquiry'}`,
      cadenceStep: 'day_1',
      channel: channel === 'web_chat' ? 'email' : 'whatsapp',
      priority: escalated ? 'high' : 'medium',
      dueInDays: 1,
      notes: `Auto-logged from ${channel}: "${message.slice(0, 140)}"`,
    },
    whatsappPayloadPreview: buildWhatsAppInteractivePayload(customerPhone, replyText, buttons.slice(0, 3)),
    matchedProducts: topProducts.slice(0, 3).map((p) => ({
      sku: p.sku,
      name: p.name,
      pricePkr: p.pricePkr,
      url: p.url,
    })),
  };
}

export async function transcribeAudioNote(
  audioBase64: string,
  mimeType = 'audio/ogg'
): Promise<string> {
  const ai = getGenAI();
  if (!ai) {
    return '[Voice note received — configure GEMINI_API_KEY for automatic Urdu/English transcription]';
  }
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-transcribe',
    contents: [
      {
        inlineData: {
          mimeType,
          data: audioBase64,
        },
      },
      {
        text: 'Transcribe this customer voice note accurately. Preserve English, Urdu, or Roman Urdu naturally without adding commentary.',
      },
    ],
  });
  return (response.text || '').trim();
}

export function buildFormalPkrQuoteDraft(params: {
  recipientName: string;
  company?: string;
  recipientEmail?: string;
  items: QuoteLineItem[];
  includeGst: boolean;
  notes?: string;
}): {
  subject: string;
  bodyText: string;
  bodyHtml: string;
  subtotalPkr: number;
  gstPkr: number;
  totalPkr: number;
} {
  const quoteRef = `AVL-Q-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
  const subtotalPkr = params.items.reduce(
    (sum, item) => sum + Math.max(0, Number(item.unitPricePkr || 0)) * Math.max(1, Number(item.quantity || 1)),
    0
  );
  const gstPkr = params.includeGst ? Math.round(subtotalPkr * 0.18) : 0;
  const totalPkr = subtotalPkr + gstPkr;

  const subject = `Formal PKR Quotation (${quoteRef}) — AV Live Communications`;

  const textLines = [
    `Dear ${params.recipientName}${params.company ? ` (${params.company})` : ''},`,
    '',
    'Thank you for contacting AV Live Communications. Please find your requested enterprise AV quotation below:',
    '',
    ...params.items.map(
      (item, idx) =>
        `${idx + 1}. ${item.productName} [${item.sku}] — Qty: ${item.quantity} × PKR ${item.unitPricePkr.toLocaleString('en-PK')} = PKR ${(item.unitPricePkr * item.quantity).toLocaleString('en-PK')}`
    ),
    '',
    `Subtotal: PKR ${subtotalPkr.toLocaleString('en-PK')}`,
    ...(params.includeGst ? [`FBR GST (18%): PKR ${gstPkr.toLocaleString('en-PK')}`] : ['Tax: Exclusive of applicable taxes']),
    `Grand Total: PKR ${totalPkr.toLocaleString('en-PK')}`,
    '',
    params.notes ? `Notes: ${params.notes}` : '',
    'Terms: Quote valid for 7 days. Official manufacturer warranty & nationwide installation available in Lahore, Karachi, and Islamabad.',
    '',
    'Best regards,',
    'AV Live Communications Sales Engineering',
    'Johar Town Block N, Lahore | +92 321 425 6263 | https://avlive.com.pk',
  ].filter(Boolean);

  const rowsHtml = params.items
    .map((item) => {
      const lineTotal = item.unitPricePkr * item.quantity;
      const safeName = escapeHtml(item.productName);
      const safeSku = escapeHtml(item.sku);
      const safeUrl = item.productUrl ? sanitizeActionUrl(item.productUrl) : '';
      return `<tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0f172a;">
          <strong>${safeName}</strong><br/>
          <span style="font-size:11px;color:#64748b;font-family:monospace;">SKU: ${safeSku}</span>
          ${safeUrl ? ` · <a href="${escapeHtml(safeUrl)}" style="color:#0082a3;font-size:11px;text-decoration:none;">View Spec Sheet</a>` : ''}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:13px;color:#334155;">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:13px;font-family:monospace;color:#334155;">PKR ${item.unitPricePkr.toLocaleString('en-PK')}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:13px;font-family:monospace;font-weight:700;color:#0f172a;">PKR ${lineTotal.toLocaleString('en-PK')}</td>
      </tr>`;
    })
    .join('');

  const bodyHtml = `<div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;color:#0f172a;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
    <div style="background:#1A2B4C;color:#ffffff;padding:20px 24px;">
      <div style="font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#38bdf8;font-weight:700;">AV Live Communications · Pakistan</div>
      <h2 style="margin:6px 0 0;font-size:20px;font-weight:700;">Commercial Quotation · ${escapeHtml(quoteRef)}</h2>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 14px;font-size:14px;line-height:1.6;">Dear <strong>${escapeHtml(params.recipientName)}</strong>${params.company ? ` (${escapeHtml(params.company)})` : ''},</p>
      <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#334155;">Thank you for speaking with AV Live Communications. Below is your itemized PKR quotation with official warranty and turnkey delivery support across Lahore, Karachi, and Islamabad.</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0;">Equipment / Service</th>
            <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0;">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0;">Unit Price</th>
            <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0;">Line Total</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div style="margin-top:16px;text-align:right;font-size:13px;line-height:1.8;">
        <div>Subtotal: <strong style="font-family:monospace;">PKR ${subtotalPkr.toLocaleString('en-PK')}</strong></div>
        ${
          params.includeGst
            ? `<div>FBR GST (18%): <strong style="font-family:monospace;">PKR ${gstPkr.toLocaleString('en-PK')}</strong></div>`
            : `<div style="color:#64748b;font-size:12px;">Exclusive of applicable taxes</div>`
        }
        <div style="font-size:16px;margin-top:6px;color:#1A2B4C;">Grand Total: <strong style="font-family:monospace;">PKR ${totalPkr.toLocaleString('en-PK')}</strong></div>
      </div>
      ${params.notes ? `<div style="margin-top:16px;padding:12px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;font-size:13px;color:#334155;"><strong>Notes:</strong> ${escapeHtml(params.notes)}</div>` : ''}
      <div style="margin-top:20px;">
        <a href="https://avlive.com.pk/programs/quote" style="display:inline-block;background:#00B4D8;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:700;font-size:13px;">Confirm Order / Schedule Site Survey</a>
      </div>
      <p style="margin:20px 0 0;font-size:12px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:14px;">
        Validity: 7 Days · AV Live Communications, Johar Town Block N, Lahore · +92 321 425 6263
      </p>
    </div>
  </div>`;

  return {
    subject,
    bodyText: textLines.join('\n'),
    bodyHtml,
    subtotalPkr,
    gstPkr,
    totalPkr,
  };
}

export async function synthesizeDailyExecutiveReport(params: {
  reportDate: string;
  metrics: AIDailyReportMetrics;
  topLeads: Array<{ name: string; company?: string; stage: string; estimatedValuePkr?: number; channel: string }>;
  overdueTaskTitles: string[];
}): Promise<{ summaryText: string; summaryHtml: string }> {
  const { reportDate, metrics, topLeads, overdueTaskTitles } = params;
  const ai = getGenAI();

  let executiveNarrative = `AV Live AI Sales Operations handled ${metrics.totalConversations} conversations today (${metrics.whatsappChats} WhatsApp, ${metrics.phoneCalls3cx} 3CX voice calls, ${metrics.webChats} web chats), capturing ${metrics.newLeads} active leads worth PKR ${metrics.pipelinePkr.toLocaleString('en-PK')} in pipeline. ${metrics.quotesDrafted} quotes are drafted/queued and ${metrics.overdueTasks} follow-up tasks require attention.`;

  if (ai) {
    try {
      const prompt = `Write a sharp, 4-sentence executive daily sales briefing for the Director of AV Live Communications (Pakistan) for ${reportDate}.
Metrics:
- Total Conversations: ${metrics.totalConversations} (WhatsApp: ${metrics.whatsappChats}, 3CX Calls: ${metrics.phoneCalls3cx}, Web: ${metrics.webChats})
- New/Active Leads: ${metrics.newLeads}
- Quotes Drafted: ${metrics.quotesDrafted}, Sent: ${metrics.quotesSent}
- Pipeline Value: PKR ${metrics.pipelinePkr.toLocaleString('en-PK')}
- Pending Follow-Up Tasks: ${metrics.pendingTasks} (Overdue: ${metrics.overdueTasks})
- Human Escalations: ${metrics.escalations}
Top Leads: ${topLeads.slice(0, 5).map((l) => `${l.name} (${l.channel}, PKR ${(l.estimatedValuePkr || 0).toLocaleString('en-PK')})`).join('; ') || 'None yet'}
Overdue Tasks: ${overdueTaskTitles.slice(0, 5).join('; ') || 'None'}

Give clear operational priorities for tomorrow morning in crisp business English. No markdown headings or raw URLs.`;

      const res = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
      });
      if (res.text && res.text.trim()) {
        executiveNarrative = res.text.trim().slice(0, 1500);
      }
    } catch (err) {
      console.warn('Daily report Gemini fallback:', err);
    }
  }

  const summaryHtml = `<div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;color:#0f172a;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
    <div style="background:#1A2B4C;color:#ffffff;padding:20px 24px;">
      <div style="font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#38bdf8;font-weight:700;">AV Live AI Sales &amp; Voice Operations</div>
      <h2 style="margin:6px 0 0;font-size:20px;">Daily Executive Briefing · ${escapeHtml(reportDate)}</h2>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 18px;font-size:14px;line-height:1.65;color:#1e293b;">${escapeHtml(executiveNarrative)}</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;font-size:13px;">
        <tr style="background:#f8fafc;">
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;">WhatsApp / 3CX / Web</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:monospace;font-weight:700;">${metrics.whatsappChats} / ${metrics.phoneCalls3cx} / ${metrics.webChats}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;">Active Leads &amp; Escalations</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:monospace;font-weight:700;">${metrics.newLeads} leads · ${metrics.escalations} escalations</td>
        </tr>
        <tr style="background:#f8fafc;">
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;">Quotes (Drafted / Sent)</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:monospace;font-weight:700;">${metrics.quotesDrafted} / ${metrics.quotesSent}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;">Open PKR Pipeline</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:monospace;font-weight:700;color:#0082a3;">PKR ${metrics.pipelinePkr.toLocaleString('en-PK')}</td>
        </tr>
        <tr style="background:#f8fafc;">
          <td style="padding:10px 12px;color:#64748b;">Follow-Up Tasks (Pending / Overdue)</td>
          <td style="padding:10px 12px;text-align:right;font-family:monospace;font-weight:700;">${metrics.pendingTasks} / ${metrics.overdueTasks}</td>
        </tr>
      </table>
      ${
        overdueTaskTitles.length > 0
          ? `<div style="margin-top:16px;padding:12px 14px;background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;font-size:13px;color:#9a3412;"><strong>Overdue Follow-Ups:</strong> ${escapeHtml(overdueTaskTitles.slice(0, 5).join(' · '))}</div>`
          : ''
      }
      <p style="margin:20px 0 0;font-size:12px;color:#64748b;">Generated by AV Live AI Sales Console · https://avlive.com.pk/admin/ai-agent</p>
    </div>
  </div>`;

  return {
    summaryText: executiveNarrative,
    summaryHtml,
  };
}

export async function dispatchWhatsAppCloudMessage(params: {
  recipientPhone: string;
  replyText: string;
  buttons: AgentActionButton[];
}): Promise<{ dispatched: boolean; mode: 'live' | 'dry_run'; messageId?: string; payload: Record<string, unknown>; error?: string }> {
  const payload = buildWhatsAppInteractivePayload(
    params.recipientPhone,
    params.replyText,
    params.buttons
  );

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return {
      dispatched: false,
      mode: 'dry_run',
      payload,
      error: 'WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not configured in environment secrets.',
    };
  }

  try {
    const graphUrl = `https://graph.facebook.com/v22.0/${encodeURIComponent(phoneNumberId)}/messages`;
    const res = await fetch(graphUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        dispatched: false,
        mode: 'live',
        payload,
        error: data?.error?.message || `Meta Graph API returned HTTP ${res.status}`,
      };
    }
    return {
      dispatched: true,
      mode: 'live',
      messageId: data?.messages?.[0]?.id,
      payload,
    };
  } catch (err: any) {
    return {
      dispatched: false,
      mode: 'live',
      payload,
      error: err?.message || 'Network error calling Meta Graph API',
    };
  }
}

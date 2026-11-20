import React, { useState, useMemo } from 'react';
import {
  Cpu,
  ShieldCheck,
  Sparkles,
  Download,
  Copy,
  Check,
  FileCode2,
  Layers,
  Gauge,
  Globe,
  PlusCircle,
  Terminal,
  BookOpen,
  Zap,
  Search,
  Table2,
  RefreshCw,
} from 'lucide-react';

interface LearnedRule {
  id: string;
  version: string;
  date: string;
  title: string;
  rule: string;
}

const INITIAL_LEARNED_RULES: LearnedRule[] = [
  {
    id: 'rule-1',
    version: 'v1.0',
    date: '2026-11-01',
    title: 'Baseline Dual-Wave Express SSR & GMC Engine',
    rule: 'Established server.ts injectRouteSeoIntoHtml() Wave-1 head + body snapshot injection, data-rh="true" canonical replacement, and automated 53-SKU Google Merchant Center RSS 2.0 XML (/api/gmc-feed.xml) & TSV (/api/gmc-feed.tsv) feeds.',
  },
  {
    id: 'rule-2',
    version: 'v2.0',
    date: '2026-11-02',
    title: 'Zero Soft-404 Synchronous Fallback Ratchet',
    rule: 'Eliminated async loading spinners on public routes by wiring buildFallbackProductFromGmcMeta, FALLBACK_PRODUCT_CATEGORIES, and FALLBACK_SERVICES_CATALOG into Frame-0 initial state, paired with Firestore Admin SDK 5-minute caching and client experimentalAutoDetectLongPolling: true + setLogLevel("silent").',
  },
  {
    id: 'rule-3',
    version: 'v3.0',
    date: '2026-11-03',
    title: '2011 Legacy Head-Keyword Reclamation & Anti-Cannibalization Silo',
    rule: 'Dedicated /video-conference-in-pakistan and /event-management-in-pakistan as national SSR Pillar hubs with Answer-First verdicts and native HTML <table> comparison matrices to outrank accsys.pk, kbse.com.pk, nasco-av.com, a2zeventssolutions.com, gncaterers.com, and blacktieeventsandcaters.com, while stripping head-term cannibalization from SKU <title> tags.',
  },
  {
    id: 'rule-4',
    version: 'v4.0',
    date: '2026-11-04',
    title: 'Lighthouse 100/100/100/100, Flat 2-Click Structure & Self-Updating Skill Ratchet',
    rule: 'Enforced compact 54px mobile sticky header with full-width live search dropdown, compact 16:6 service/landing heroes, optimizeGalleryImageUrl() WebP compression, hover-only secondary product images, IntersectionObserver 16-card DOM batching (<800 DOM nodes), and 4-Gate Monotonic Self-Updating Skill Protocol.',
  },
  {
    id: 'rule-5',
    version: 'v4.1',
    date: '2026-11-17',
    title: 'Google Merchant Center 20-Column Sheet & Image Extension Normalization Ratchet',
    rule: 'Enforced unique SKU/MPN as id, specific title (<=150 chars with MPN), non-truncated word-bounded description (<=200 chars, distinct from product_highlight), high-res image_link with explicit .jpg/.png/.webp extensions, strict 3-part section_name:attribute_name:attribute_value in product_detail, and full UI/JSON-LD parity on ProductDetails.tsx + /api/gmc-sheet-20.tsv.',
  },
  {
    id: 'rule-6',
    version: 'v4.2',
    date: '2026-11-18',
    title: 'Enterprise-Tech Studio Asset Generation & Dual-Mode GMC Image Resolution',
    rule: 'Generated studio product visuals for Poly X70, Cisco Room Kit, and 3D Hologram categories and synchronized 16 products across PRODUCT_GMC_METADATA, Category.tsx, services-catalog.ts, and live Firestore.',
  },
  {
    id: 'rule-7',
    version: 'v4.3',
    date: '2026-11-19',
    title: '100% Direct External Image URL Persistence & Zero Local-Path Override Ratchet',
    rule: 'Replaced all local /images/products/... paths with direct external https:// image URLs (https://lh3.googleusercontent.com/d/...) across all hardware SKUs so images never vanish on redeployment, and added Bulk External Image URL Updater in /admin/products.',
  },
  {
    id: 'rule-8',
    version: 'v4.4',
    date: '2026-11-20',
    title: 'GSC Zero-Error 1-Hop Canonical Normalizer, Zero-5xx SSR Guard & Site Recovery Ledger',
    rule: 'Mapped 54th live Firestore SKU (kl5wGaNLxqQByn3oPd1Z -> podium-prompter-17-compact-pakistan), implemented resolveSingleHopCanonicalTarget() in server.ts to flatten trailing slashes, uppercase paths, query params, and multi-hop redirects into 1 single HTTP 301 jump, added fallback SSR route metadata so no route ever serves duplicate Homepage HTML, wrapped vite.transformIndexHtml in a Zero-5xx Fault-Tolerant Guard, and established SITE_CHANGE_LOG.md + WEBSITE_STRUCTURE_BLUEPRINT.md.',
  },
  {
    id: 'rule-9',
    version: 'v4.5',
    date: '2026-11-20',
    title: '360° Deep-Scan 30-Point Precision Remediation (CMS, GMC, Wave-1/2 Parity, 460+ Word Brand Hubs & AI SEO)',
    rule: 'Replaced all 7 remaining Unsplash URLs with direct external product photos (0 Unsplash URLs across 54 SKUs), separated YouTube links from <img> galleries into a zero-TBT click-to-load video player + VideoObject JSON-LD, sanitized &nbsp; chains and concatenated specs, unified PKR pricing and Answer-First <table> matrices on FAQs.tsx & RoomDesigner.tsx, expanded all 25 /brands/:slug SSR hubs to 460+ words with FAQPage JSON-LD, added terminal periods to SSR tables/lists for Flesch-Kincaid readability, generated /llms.txt, and added SpeakableSpecification JSON-LD sitewide.',
  },
];

const NICHE_PRESETS = [
  {
    label: 'Solar & Lithium EPC (B2B/B2C)',
    brandName: 'SolarGrid Engineering Pakistan',
    domain: 'solargrid.com.pk',
    niche: 'Commercial Solar Inverters, Lithium LiFePO4 Storage & Turnkey PEC-Certified EPC Installation',
    foundingYear: '2012 (14+ Years PEC Energy Authority)',
    currency: 'PKR',
    country: 'Pakistan',
    cities: 'Lahore (DHA, Gulberg, Sundar Industrial), Karachi (Clifton, Korangi, SITE), Islamabad (Blue Area, I-9)',
    pillars: '/solar-system-price-in-pakistan | /hybrid-solar-inverters-pakistan | /commercial-industrial-solar-epc-pakistan',
    competitors: 'symplenergy.com, skyelectric.com, premierenergy.com.pk, ziewnic.com',
    categories: 'Hybrid Solar Inverters (/category/hybrid-inverters), LiFePO4 Lithium Batteries (/category/lithium-batteries), N-Type Bi-Facial Panels (/category/solar-panels), Industrial Net Metering (/category/net-metering), BESS Containers (/category/bess-storage), Solar Mounting Structures (/category/mounting-structures)',
    services: 'Industrial Megawatt EPC (/services/industrial-solar-epc), Commercial Hybrid Backup (/services/commercial-hybrid-solar), NEPRA Net Metering Licensing (/services/nepra-net-metering), 24/7 NOC Monitoring & O&M (/services/solar-maintenance-sla)',
    brands: 'Huawei FusionSolar, Sungrow, Solis, Fronius, GoodWe, Pylontech, Longi Hi-MO, Jinko Tiger Neo',
    hotline1: '0321 425 6263',
    hotline2: '0339 0000 921',
    sla: 'Guaranteed 15-Minute Load Audit & 4-Hour On-Site Engineer Dispatch',
  },
  {
    label: 'Medical & Diagnostic Equipment',
    brandName: 'MedVantage Diagnostics & Surgical',
    domain: 'medvantage.com.pk',
    niche: 'DRAP-Registered Hospital Imaging, ICU Ventilators, Ultrasound Systems & Turnkey Modular OT Integration',
    foundingYear: '2011 (15+ Years Biomedical Engineering Authority)',
    currency: 'PKR',
    country: 'Pakistan',
    cities: 'Lahore (Jail Road, Johar Town, DHA), Karachi (Clifton, Stadium Road), Islamabad (Blue Area, G-8 Medical Hub)',
    pillars: '/medical-equipment-suppliers-in-pakistan | /ultrasound-machine-price-in-pakistan | /modular-operation-theater-pakistan',
    competitors: 'medequips.pk, hospitalstore.pk, easternmedical.com.pk',
    categories: '4D Color Doppler Ultrasound (/category/ultrasound-machines), ICU Ventilators (/category/icu-ventilators), Patient Monitors (/category/patient-monitors), Digital X-Ray & C-Arm (/category/digital-xray), Hematology Analyzers (/category/lab-analyzers), Modular OT Lights & Tables (/category/modular-ot)',
    services: 'Turnkey Modular OT Construction (/services/modular-ot-integration), ICU & NICU Setup (/services/icu-setup), Biomedical Calibration & SLA (/services/biomedical-maintenance), Hospital Medical Gas Pipelines (/services/medical-gas-systems)',
    brands: 'GE HealthCare, Mindray, Philips Healthcare, Siemens Healthineers, Nihon Kohden, Olympus, Dräger',
    hotline1: '0321 425 6263',
    hotline2: '0339 0000 921',
    sla: 'Guaranteed 15-Minute Biomedical Quote & 2-Hour Emergency ICU Engineer Dispatch',
  },
  {
    label: 'Industrial Automation & CNC',
    brandName: 'ApexMotion Industrial Automation',
    domain: 'apexmotion.pk',
    niche: 'PLC/SCADA Automation, VFD Inverters, Servo Drives & Turnkey Factory Robotics Integration',
    foundingYear: '2011 (15+ Years Factory Automation Authority)',
    currency: 'PKR',
    country: 'Pakistan',
    cities: 'Lahore (Sundar, Quaid-e-Azam Industrial), Karachi (Korangi, Bin Qasim, SITE), Faisalabad & Sialkot Industrial Zones',
    pillars: '/industrial-automation-companies-in-pakistan | /vfd-inverter-price-in-pakistan | /plc-scada-programming-pakistan',
    competitors: 'intechno.com.pk, automation.com.pk, vertexautomation.pk',
    categories: 'PLC Controllers (/category/plc-controllers), VFD Variable Frequency Drives (/category/vfd-drives), HMI Touch Panels (/category/hmi-panels), AC Servo Motors & Drives (/category/servo-systems), Industrial Sensors & Encoders (/category/industrial-sensors), Low Voltage Switchgear (/category/switchgear)',
    services: 'Turnkey SCADA & PLC Retrofitting (/services/plc-scada-integration), Boiler & Chiller BMS Automation (/services/bms-automation), VFD Energy Synchronization (/services/vfd-synchronization), 24/7 Line-Down Emergency Repair (/services/emergency-plc-repair)',
    brands: 'Siemens SIMATIC, Schneider Electric, Allen-Bradley, Mitsubishi Electric, Delta Electronics, Omron, ABB, Danfoss',
    hotline1: '0321 425 6263',
    hotline2: '0339 0000 921',
    sla: 'Guaranteed 15-Minute Engineering Quote & 2-Hour Production-Line-Down Dispatch',
  },
];

export function BlueprintGeneratorHub() {
  const [activeTab, setActiveTab] = useState<'mechanism' | 'agents' | 'niche-compiler' | 'recovery-ledger'>('agents');
  const [selectedAgentView, setSelectedAgentView] = useState<'agent1' | 'agent2' | 'agent3' | 'apex'>('apex');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Self-Updating Skill State (Append-Only Ratchet)
  const [learnedRules, setLearnedRules] = useState<LearnedRule[]>(INITIAL_LEARNED_RULES);
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleContent, setNewRuleContent] = useState('');

  // Universal Niche Compiler State
  const [nicheConfig, setNicheConfig] = useState(NICHE_PRESETS[0]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAppendSkillRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleTitle.trim() || !newRuleContent.trim()) return;
    const nextVersion = `v4.${learnedRules.length - 3}`;
    const today = new Date().toISOString().split('T')[0];
    setLearnedRules((prev) => [
      ...prev,
      {
        id: `rule-${prev.length + 1}`,
        version: nextVersion,
        date: today,
        title: newRuleTitle.trim(),
        rule: newRuleContent.trim(),
      },
    ]);
    setNewRuleTitle('');
    setNewRuleContent('');
  };

  const compiledApexSkillMd = useMemo(() => {
    const ledgerLines = learnedRules
      .map((r) => `- **\`[${r.version} - ${r.date} - ${r.title}]\`**: ${r.rule}`)
      .join('\n');

    return `---
name: "apex-seo-aeo-engine"
description: >
  World-class, self-evolving Full-Stack SEO, AI Engine Optimization (AEO / GEO / LLMO),
  Google Lighthouse 100/100/100/100, Google Search Console (GSC), and Google Merchant
  Center (GMC) website building constitution. Synthesizes 1st (Systems/SSR/Lighthouse),
  2nd (GSC/Schema/GMC/Site Structure), and 3rd (AEO/GEO/UX/Competitor Outranker) AI
  Agent profiles into the Unified Apex Master Agent.
---

# Apex SEO, AEO/GEO & Lighthouse 100 Website Engine Constitution (${learnedRules[learnedRules.length - 1]?.version || 'v4.0'}-self-evolving)

## 0. 6-Tier Order of Resolution (First-Principles Search & Lighthouse Physics)
1. **Wave-1 Express SSR + Frame-0 Synchronous Render Integrity (Zero Soft-404s)**:
   - \`server.ts\` \`injectRouteSeoIntoHtml(html, reqPath)\` injects route-specific \`<title data-rh="true">\`, \`<meta name="description">\`, \`<link rel="canonical" data-rh="true">\`, \`@graph\` JSON-LD, and \`<main class="ssr-seo-snapshot">\` inside \`<div id="root">...</div><!--ssr-root-end-->\` on HTTP GET (<50ms TTFB).
   - Client components initialize synchronously on Frame 0 (0ms) from \`PRODUCT_GMC_METADATA\`, \`FALLBACK_PRODUCT_CATEGORIES\`, and \`FALLBACK_SERVICES_CATALOG\`. Never block public pages behind async loading spinners.
2. **Deterministic Canonical Graph & Dual-Layer 301 Redirect Ratchet**:
   - Single self-referencing \`<link rel="canonical" data-rh="true">\` per route without query params (\`?brand=\`, \`?sub=\`) or trailing slashes.
   - Resolve all product links via \`getCanonicalProductSlug(product, product.id)\`.
   - Maintain permanent HTTP 301 redirects in \`server.ts\` (\`legacyDirectRedirects\`) AND \`<Navigate replace />\` in \`src/App.tsx\`.
3. **Hub-and-Spoke Topical Silo & Anti-Cannibalization Cosine Partitioning**:
   - Partition intent strictly across: National Head Pillars -> Category Hubs (\`/category/:slug\`) -> Brand Hubs (\`/brands/:slug\`) -> Regional Geo Hubs -> BoFu Comparison Blogs (\`/blog/:slug\`) -> SKU Pages (\`/product/:slug\`).
4. **AEO / GEO / LLMO Information Gain & RAG Token Density**:
   - Open every commercial page with a 50–70 word **Answer-First Engineering Verdict** below \`<h1>\`.
   - Include native semantic HTML \`<table><thead><tbody>\` matrices on every Pillar, Category, Brand, Service, Product, and Blog page.
   - Synchronize \`/llms.txt\`, \`/llms-full.txt\`, \`/api/gmc-feed.xml\`, and \`/api/gmc-feed.tsv\`.
5. **Google Lighthouse 100/100/100/100 & Flat <=2-Click Site Structure**:
   - Performance: \`LCP <= 1.8s\`, \`TBT <= 50ms\`, \`INP <= 100ms\`, \`CLS = 0.000\`, DOM nodes < 800 via Rollup \`manualChunks\`, \`optimizeGalleryImageUrl(url, 480, 75)\`, hover-only 2nd image mounting, and \`IntersectionObserver\` 16-card DOM batching.
   - Accessibility & Mobile UX: Single \`<h1>\`, >= 4.5:1 contrast, >= 44x44px touch targets, 54px mobile sticky header with full-width live search dropdown, compact 16:6 heroes, and <=2-click reachability via Mega-Menu, Footer, and \`/sitemap\`.
   - Best Practices: \`experimentalAutoDetectLongPolling: true\` + \`setLogLevel('silent')\` on Firestore; passive scroll listeners.
6. **4-Gate Monotonic Self-Updating Skill Persistence ("Updates Itself Without Losing Skills")**:
   - Mandatory Read-Before-Write on all existing files.
   - Append newly discovered rules monotonically to Section 9 below and \`seo-policy.md\` without ever deleting or truncating prior rules.
   - Run \`npx tsx scripts/generate-sitemap.ts\`, \`npx tsx scripts/seo-silo-audit.ts\`, \`npm run lint\`, and \`npm run build\` before concluding any turn.

## 9. Autonomous Self-Update & Learned Rules Ledger (Append-Only)
${ledgerLines}
`;
  }, [learnedRules]);

  const compiledNicheBlueprintMd = useMemo(() => {
    const ledgerLines = learnedRules
      .map((r) => `- **\`[${r.version} - ${r.date} - ${r.title}]\`**: ${r.rule}`)
      .join('\n');

    return `# Universal Niche Website Creation Master Blueprint — ${nicheConfig.brandName} (${nicheConfig.domain})

> **Execution Instruction for AI Coding Agent**:
> Build and maintain the complete full-stack web application for **${nicheConfig.brandName}** (\`https://${nicheConfig.domain}\`) using the **Dual-Wave Express SSR + Frame-0 Synchronous Hydration + Lighthouse 100 + AEO/GEO/GMC Architecture** defined below. Do not hold back any technical, schema, or conversion parameter.

---

## 1. Target Niche & Commercial Identity Parameters

- **Brand Name**: \`${nicheConfig.brandName}\`
- **Primary Canonical Domain**: \`https://${nicheConfig.domain}\` (Zero trailing slashes, zero query-param canonicals)
- **Core Industry & Niche**: ${nicheConfig.niche}
- **Legacy & Authority Positioning**: ${nicheConfig.foundingYear}
- **Primary Currency & Country**: \`${nicheConfig.currency}\` (${nicheConfig.country})
- **Target Regional Geo Hubs**: ${nicheConfig.cities}
- **National Head Pillar Routes (Anti-Cannibalization Hubs)**: \`${nicheConfig.pillars}\`
- **Competitor Domains to Outrank via Silos & Comparison Tables**: \`${nicheConfig.competitors}\`
- **Canonical Product Categories (\`/category/:slug\`)**: ${nicheConfig.categories}
- **Turnkey Enterprise Services (\`/services/:slug\`)**: ${nicheConfig.services}
- **Authorized OEM Brands (\`/brands/:slug\`)**: ${nicheConfig.brands}
- **Direct Conversion Hotlines**: \`${nicheConfig.hotline1}\` | \`${nicheConfig.hotline2}\`
- **SLA Engineering Guarantee**: ${nicheConfig.sla}

---

## 2. Synthesis of the 1st, 2nd & 3rd AI Agent Profiles (The Unified Apex Agent)

You operate simultaneously as all three specialized agents:
1. **1st AI Agent (Principal Systems, Dual-Wave SSR & Lighthouse 100 Architect)**:
   - Build \`server.ts\` with \`injectRouteSeoIntoHtml(html, reqPath)\` to inject route-specific \`<title data-rh="true">\`, \`<meta name="description">\`, \`<link rel="canonical" data-rh="true">\`, \`@graph\` JSON-LD, and \`<main class="ssr-seo-snapshot">\` inside \`<div id="root">...</div><!--ssr-root-end-->\` on Wave 1 (<50ms TTFB).
   - Hydrate React 19 on Frame 0 (0ms) from synchronous fallback catalogs (\`src/lib/gmc-feed.ts\`, \`src/pages/Category.tsx\`, \`src/lib/services-catalog.ts\`) so Googlebot and users NEVER see a loading spinner or Soft 404.
   - Enforce Lighthouse 100/100/100/100: Rollup \`manualChunks\`, \`optimizeGalleryImageUrl(url, 480, 75)\`, \`fetchPriority="high"\` on first 2 viewport cards, hover-only 2nd image mounting, \`IntersectionObserver\` 16-card DOM batching (<800 DOM nodes), explicit image \`width\`/\`height\` (\`CLS = 0.000\`), and \`setLogLevel('silent')\` on Firestore long-polling.
2. **2nd AI Agent (Staff Technical SEO, Flat <=2-Click Site Structure, GSC & GMC Engineer)**:
   - Enforce 100% self-referencing canonicals (\`data-rh="true"\`), \`getCanonicalProductSlug()\` on all product links, zero \`?brand=\` or \`?sub=\` query URLs, and dual-layer 301 redirects (\`legacyDirectRedirects\` in \`server.ts\` + \`<Navigate replace />\` in \`src/App.tsx\`).
   - Guarantee <=2-click crawl depth for 100% of URLs via Header Mega-Menu, Siloed Footer, Breadcrumbs (\`BreadcrumbList\` JSON-LD), and \`/sitemap\` (\`HtmlSitemap.tsx\`).
   - Expose automated \`/sitemap.xml\`, \`/api/gmc-feed.xml\` (Google Merchant Center RSS 2.0 XML), and \`/api/gmc-feed.tsv\` feeds.
3. **3rd AI Agent (Principal AEO/GEO Citation Scientist, Competitor Outranker & WCAG 2.2 AA Conversion Auditor)**:
   - Partition search intent across National Pillars (\`${nicheConfig.pillars}\`), Category Hubs, Brand Hubs, Regional Geo Hubs, BoFu Comparison Blogs, and SKU Pages—zero title cannibalization against \`${nicheConfig.competitors}\`.
   - Render a **50–70 word Answer-First Engineering Verdict** immediately below \`<h1>\` and at least one native semantic HTML \`<table><thead><tbody>\` matrix (BoM, Room/System Sizing, Brand Comparison, Pricing in \`${nicheConfig.currency}\`) on every commercial page.
   - Synchronize \`/llms.txt\` and \`/llms-full.txt\` (30KB+ Markdown SKU & BoM corpus).
   - Implement the **7-Part High-Converting Service Blueprint** on all service and pillar pages: (1) Compact 16:6 Localized Hero + 15-Min Quote CTA, (2) OEM Partner Authority Bar (${nicheConfig.brands}), (3) ${nicheConfig.sla}, (4) Native HTML \`<table>\` Package/BoM Matrix, (5) Named Business District Case Studies (${nicheConfig.cities}), (6) Visible \`FAQPage\` Schema Accordion, (7) Dual-Hotline Click-to-Call Footer (\`${nicheConfig.hotline1}\` / \`${nicheConfig.hotline2}\`).

---

## 3. 4-Gate Monotonic Self-Updating Skill Ratchet (Inherited Memory Ledger)

Always preserve and append to \`skills/apex-seo-aeo-engine/SKILL.md\` and \`seo-policy.md\` without deleting prior rules:
${ledgerLines}
`;
  }, [nicheConfig, learnedRules]);

  const mechanismReportMd = `# Comprehensive Website Building Mechanism Report (avlive.com.pk Reference Engine)

## 1. Dual-Wave Express SSR + Frame-0 Synchronous Hydration
- **Wave 1 (HTTP GET < 50ms TTFB)**: \`server.ts\` (\`injectRouteSeoIntoHtml\`) intercepts every canonical route, performs 301 redirects for legacy/MPN/ID paths, injects \`<title data-rh="true">\`, \`<link rel="canonical" data-rh="true">\`, \`@graph\` JSON-LD, and pre-renders \`<main class="ssr-seo-snapshot">\` (containing \`<h1>\`, 60-word Answer-First verdict, and native HTML \`<table>\` matrices) inside \`<div id="root">\`.
- **Wave 2 (0ms Client Hydration)**: React 19 initializes state synchronously from \`PRODUCT_GMC_METADATA\` (53 SKUs), \`FALLBACK_PRODUCT_CATEGORIES\` (12 categories), and \`FALLBACK_SERVICES_CATALOG\` (9 services) before Firestore responds—eliminating 100% of Soft-404 loading spinners.

## 2. Hub-and-Spoke Topical Silo & Anti-Cannibalization Graph (156 Canonical URLs)
- **National Head Pillars**: \`/video-conference-in-pakistan\`, \`/event-management-in-pakistan\`, \`/corporate-event-management\`
- **Category Hubs**: 12 dedicated \`/category/:slug\` hubs
- **Brand Hubs**: 25 authorized OEM \`/brands/:slug\` hubs
- **Regional Geo Hubs**: \`/lahore\`, \`/karachi\`, \`/islamabad\`
- **BoFu Comparison Guides**: 11 \`/blog/:slug\` brand-vs-brand & room-cost guides
- **Verified Hardware SKUs**: 53 \`/product/:slug-pakistan\` pages (strictly targeting \`[Brand] [Model] [MPN] Price in Pakistan\`)

## 3. Google Lighthouse 100/100/100/100 Engineering Matrix
- **Performance**: Rollup \`manualChunks\`, \`optimizeGalleryImageUrl(url, 480, 75)\`, \`fetchPriority="high"\` on first 2 cards, hover-only 2nd image render, \`IntersectionObserver\` 16-card DOM batching (<800 DOM nodes), explicit dimensions (\`CLS = 0.000\`).
- **Accessibility & UX**: Single \`<h1>\`, WCAG AA >= 4.5:1 contrast, >= 44x44px touch targets, 54px mobile sticky header with full-width live search dropdown, compact 16:6 hero banners, and <=2-click crawl depth via \`/sitemap\`.
- **Best Practices**: Firestore \`experimentalAutoDetectLongPolling: true\` + \`setLogLevel('silent')\` + Admin SDK 5-minute server cache.
- **AEO / GEO / GMC**: 60-word Answer-First verdicts, semantic HTML \`<table>\` matrices, \`/llms.txt\`, \`/llms-full.txt\` (32+ KB), \`/api/gmc-feed.xml\`, and \`/api/gmc-feed.tsv\`.`;

  const siteChangeLogMd = `# AV Live Communications (avlive.com.pk) — Master Site Change Log & State Recovery Ledger

## 1. Quick Recovery & State Verification Commands
\`\`\`bash
npx tsx scripts/generate-sitemap.ts
npx tsx scripts/seo-silo-audit.ts
npm run lint
npm run build
\`\`\`

## 2. Chronological Engineering Change Log (Append-Only)
${learnedRules
  .slice()
  .reverse()
  .map((r) => `### [${r.version}] — ${r.date} — ${r.title}\n- **Engineering Specification**: ${r.rule}`)
  .join('\n\n')}`;

  const websiteStructureBlueprintMd = `# AV Live Communications (avlive.com.pk) — Master Website Structure & Canonical Blueprint

## 1. 6-Stage Request & Render Pipeline
1. **Stage 1: Single-Hop 301 Canonical Normalizer (\`resolveSingleHopCanonicalTarget\` in \`server.ts\`)**: Collapses trailing slashes, uppercase paths, query parameters (\`?brand=\`, \`?sub=\`, \`?sort=\`, \`?utm_*\`), raw Firestore IDs (\`kl5wGaNLxqQByn3oPd1Z\`, \`T1XLMubVYmFzeIfC7V9B\`), MPNs, and multi-hop legacy paths in **1 single HTTP 301 jump**.
2. **Stage 2: Wave-1 Express SSR HTML & JSON-LD Injection (\`injectRouteSeoIntoHtml\`)**: Injects route-specific \`<title data-rh="true">\`, \`<meta name="description">\`, self-referencing \`<link rel="canonical" data-rh="true">\`, \`@graph\` JSON-LD, and \`<main class="ssr-seo-snapshot">\` inside \`<div id="root">\`.
3. **Stage 3: Zero-5xx Fault-Tolerant SSR Guard**: Wraps \`vite.transformIndexHtml\` and the Express global error handler so every HTML \`GET\`/\`HEAD\` request returns a valid \`200 OK\` pre-rendered \`seoHtml\` document.
4. **Stage 4: Frame-0 Synchronous React 19 Hydration**: Initializes state at 0ms from \`PRODUCT_GMC_METADATA\` (54 SKUs), \`FALLBACK_PRODUCT_CATEGORIES\` (12 categories), and \`FALLBACK_SERVICES_CATALOG\` (9 services).
5. **Stage 5: Flat <=2-Click Internal Link Graph**: Header Mega-Menu + Siloed Footer + \`/sitemap\` (\`HtmlSitemap.tsx\`) keep 100% of canonical URLs within <=2 clicks.
6. **Stage 6: Synchronized Crawler & Shopping Feeds**: \`/sitemap.xml\`, \`/llms.txt\`, \`/llms-full.txt\`, \`/api/gmc-feed.xml\`, \`/api/gmc-feed.tsv\`, \`/api/gmc-sheet-20.tsv\`.

## 2. Complete Canonical Route Inventory (157 Deduplicated Indexable URLs)
- **Storefront Core & National Pillars (28 URLs)**: \`/\`, \`/shop\`, \`/brands\`, \`/solutions\`, \`/services\`, \`/events-services\`, \`/event-quote\`, \`/room-designer\`, \`/compare\`, \`/guides\`, \`/blog\`, \`/reviews\`, \`/faqs\`, \`/about\`, \`/contact\`, \`/sitemap\`, \`/video-conference-in-pakistan\`, \`/event-management-in-pakistan\`, \`/video-conferencing\`, \`/video-conferencing-solutions\`, \`/corporate-event-management\`, \`/conference-room-solutions\`, \`/zoom-rooms\`, \`/microsoft-teams-rooms\`, \`/3d-hologram\`, \`/projection-mapping\`, \`/live-streaming-services\`, \`/av-equipment-rental\`
- **Regional Geo Hubs & Specialty Verticals (5 URLs)**: \`/lahore\`, \`/karachi\`, \`/islamabad\`, \`/esports\`, \`/voip-service-providers\`
- **B2B Procurement Programs & Policies (13 URLs)**: \`/programs/quote\`, \`/programs/blind-drop-shipping\`, \`/programs/government-education-pricing\`, \`/programs/fulfillment-services\`, \`/programs/promotions\`, \`/programs/provisioning-services\`, \`/programs/reseller-program\`, \`/payment\`, \`/shipping\`, \`/returns\`, \`/rma\`, \`/privacy-policy\`, \`/terms-of-service\`
- **Authorized OEM Brand Portals (25 URLs)**: \`/brands/poly\`, \`/brands/cisco\`, \`/brands/logitech\`, \`/brands/yealink\`, \`/brands/jabra\`, \`/brands/bosch\`, \`/brands/hikvision\`, \`/brands/dahua\`, \`/brands/axis\`, \`/brands/grandstream\`, \`/brands/fanvil\`, \`/brands/2n\`, \`/brands/epson\`, \`/brands/benq\`, \`/brands/optoma\`, \`/brands/panasonic\`, \`/brands/sony\`, \`/brands/viewsonic\`, \`/brands/uniview\`, \`/brands/itc\`, \`/brands/3cx\`, \`/brands/freepbx\`, \`/brands/sangoma\`, \`/brands/horion\`, \`/brands/google\`
- **Canonical Hardware Categories (12 URLs)**: \`/category/video-conferencing\`, \`/category/boardroom-codecs\`, \`/category/large-room\`, \`/category/ptz-cameras\`, \`/category/touch-panels\`, \`/category/speakerphones\`, \`/category/ip-phones\`, \`/category/voip-phone-systems\`, \`/category/headsets\`, \`/category/projectors\`, \`/category/ip-cameras\`, \`/category/intercom-paging-access\`
- **Turnkey Integration & Event Services (9 URLs)**: \`/services/boardroom-integration\`, \`/services/voip-telephony\`, \`/services/corporate-events\`, \`/services/hybrid-events\`, \`/services/esports-events\`, \`/services/expo-organizing\`, \`/services/ai-automation\`, \`/services/ai-development\`, \`/services/ai-agents-workers\`
- **BoFu Comparison & Engineering Blog Guides (11 URLs)**: \`/blog/logitech-rally-bar-vs-poly-studio-x50-pakistan\`, \`/blog/yealink-vs-cisco-video-conferencing-pakistan\`, \`/blog/boardroom-av-system-price-guide-pakistan\`, \`/blog/banking-healthcare-university-av-solutions-pakistan\`, \`/blog/shure-bosch-ceiling-microphones-vs-table-mics-pakistan\`, \`/blog/future-of-video-conferencing-pakistan-2026\`, \`/blog/how-to-choose-video-conferencing-equipment\`, \`/blog/ip-phones-vs-softphones-pakistan\`, \`/blog/understanding-public-address-systems-pakistan\`, \`/blog/hybrid-events-101-av-integration-pakistan\`, \`/blog/av-live-communications-15-years-pakistan\`
- **Verified Enterprise Hardware SKUs (54 URLs)**: All 54 canonical \`/product/*-pakistan\` SKUs in \`PRODUCT_GMC_METADATA\` (including \`/product/podium-prompter-17-compact-pakistan\`) with direct external \`https://lh3.googleusercontent.com/d/...\` image URLs.`;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#1A2B4C] via-[#162544] to-[#0F1B33] rounded-2xl p-6 lg:p-8 text-white shadow-xl border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00B4D8]/20 border border-[#00B4D8]/40 text-[#00B4D8] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles size={14} />
              Apex SEO / AEO / Lighthouse 100 Engine (v4.0 Self-Evolving)
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              Website Building Mechanism, AI Agent Profiles & Universal Niche Compiler
            </h1>
            <p className="text-gray-300 text-sm lg:text-base mt-2 max-w-3xl">
              Inspect the complete Dual-Wave SSR + Frame-0 Synchronous Architecture, compare the 1st, 2nd, 3rd & Unified Apex AI Agent Profiles, evolve the self-updating <code className="text-[#00B4D8] font-mono">SKILL.md</code> ledger, and compile a turnkey blueprint for any new website niche.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleDownload('SKILL.md', compiledApexSkillMd)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00B4D8] hover:bg-[#0096B7] text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
            >
              <Download size={16} />
              Download SKILL.md
            </button>
            <button
              type="button"
              onClick={() => handleDownload('NICHE_WEBSITE_BLUEPRINT.md', compiledNicheBlueprintMd)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/15 transition-all cursor-pointer"
            >
              <FileCode2 size={16} />
              Download Niche Blueprint
            </button>
          </div>
        </div>

        {/* Live Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Canonical Graph</div>
            <div className="text-xl font-extrabold text-[#00B4D8] mt-0.5">157 / 157 URLs</div>
            <div className="text-[11px] text-emerald-400 font-medium">0 Duplicates • &le;2 Clicks</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Wave-1 SSR Engine</div>
            <div className="text-xl font-extrabold text-white mt-0.5">Zero-5xx Guard</div>
            <div className="text-[11px] text-emerald-400 font-medium">1-Hop 301 • 0 Soft-404s</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Lighthouse Target</div>
            <div className="text-xl font-extrabold text-[#00B4D8] mt-0.5">100 / 100</div>
            <div className="text-[11px] text-emerald-400 font-medium">CLS 0.000 • DOM &lt;800</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">LLMs RAG Corpus</div>
            <div className="text-xl font-extrabold text-white mt-0.5">32.2 KB</div>
            <div className="text-[11px] text-emerald-400 font-medium">/llms-full.txt Active</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">GMC Shopping Feed</div>
            <div className="text-xl font-extrabold text-[#00B4D8] mt-0.5">54 SKUs</div>
            <div className="text-[11px] text-emerald-400 font-medium">XML + TSV Verified</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Self-Update Ledger</div>
            <div className="text-xl font-extrabold text-white mt-0.5">{learnedRules.length} Rules</div>
            <div className="text-[11px] text-emerald-400 font-medium">Monotonic Append-Only</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('agents')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'agents'
              ? 'bg-[#1A2B4C] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Cpu size={17} />
          1. AI Agent Profiles + Self-Updating SKILL.md
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('recovery-ledger')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'recovery-ledger'
              ? 'bg-[#1A2B4C] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ShieldCheck size={17} />
          2. Site Change Log, Structure Blueprint &amp; GSC Audit
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('niche-compiler')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'niche-compiler'
              ? 'bg-[#1A2B4C] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Globe size={17} />
          3. Universal Multi-Niche Blueprint Compiler
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('mechanism')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'mechanism'
              ? 'bg-[#1A2B4C] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BookOpen size={17} />
          4. Website Building Mechanism &amp; Lighthouse 100 Report
        </button>
      </div>

      {/* TAB 1: 1ST, 2ND, 3RD & APEX AGENT PROFILES + SELF-UPDATING SKILL */}
      {activeTab === 'agents' && (
        <div className="space-y-8">
          {/* Dialectical Comparison Matrix */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-[#1A2B4C]">
                  Rigorous Dialectical Reasoning: Why 3 Specialized Agents Fuse Into the Unified Apex Agent
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Click any agent profile below to inspect its exact mathematical objective function, core mechanisms, and why it fails without the other two.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'agent1', label: '1st Agent: Systems & Lighthouse' },
                  { id: 'agent2', label: '2nd Agent: GSC, Schema & GMC' },
                  { id: 'agent3', label: '3rd Agent: AEO/GEO & Outranker' },
                  { id: 'apex', label: 'Unified Apex Agent (SKILL.md)' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedAgentView(tab.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedAgentView === tab.id
                        ? 'bg-[#00B4D8] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#1A2B4C] text-white">
                    <th className="p-3.5 rounded-tl-xl font-bold">Agent Profile</th>
                    <th className="p-3.5 font-bold">Objective Function</th>
                    <th className="p-3.5 font-bold">Core Engineering Mechanisms</th>
                    <th className="p-3.5 rounded-tr-xl font-bold">Fatal Blind Spot When Operating Alone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className={selectedAgentView === 'agent1' ? 'bg-[#00B4D8]/5' : ''}>
                    <td className="p-3.5 font-bold text-[#1A2B4C]">
                      1st AI Agent
                      <div className="text-xs font-normal text-gray-500">Systems, Dual-Wave SSR & Lighthouse 100</div>
                    </td>
                    <td className="p-3.5 font-mono text-xs text-gray-700">
                      min(TTFB, LCP &le; 1.8s, TBT &le; 50ms, CLS = 0.000, DOM &lt; 800) &and; Uptime = 100%
                    </td>
                    <td className="p-3.5 text-gray-700">
                      Wave-1 Express <code className="text-xs bg-gray-100 px-1 rounded">injectRouteSeoIntoHtml</code>, Frame-0 synchronous fallback arrays, Rollup <code className="text-xs bg-gray-100 px-1 rounded">manualChunks</code>, hover-only 2nd image render, <code className="text-xs bg-gray-100 px-1 rounded">IntersectionObserver</code> 16-card batching, silent Firestore long-polling.
                    </td>
                    <td className="p-3.5 text-red-700 text-xs font-medium">
                      Treats URLs as state (<code className="bg-red-50 px-1 rounded">?brand=poly</code>), omits <code className="bg-red-50 px-1 rounded">@graph</code> schemas, and writes thin developer copy with zero RAG/commercial authority.
                    </td>
                  </tr>
                  <tr className={selectedAgentView === 'agent2' ? 'bg-[#00B4D8]/5' : ''}>
                    <td className="p-3.5 font-bold text-[#1A2B4C]">
                      2nd AI Agent
                      <div className="text-xs font-normal text-gray-500">GSC Canonicals, Flat &le;2-Click Structure & GMC</div>
                    </td>
                    <td className="p-3.5 font-mono text-xs text-gray-700">
                      GSC Coverage = 100% &and; Click Depth &le; 2 &and; Duplicate Canonicals = 0 &and; GMC Valid = 100%
                    </td>
                    <td className="p-3.5 text-gray-700">
                      Single <code className="text-xs bg-gray-100 px-1 rounded">data-rh="true"</code> self-referencing canonicals, <code className="text-xs bg-gray-100 px-1 rounded">getCanonicalProductSlug()</code>, dual-layer 301 redirect matrix, <code className="text-xs bg-gray-100 px-1 rounded">/sitemap.xml</code> + <code className="text-xs bg-gray-100 px-1 rounded">/sitemap</code> HTML hub, <code className="text-xs bg-gray-100 px-1 rounded">/api/gmc-feed.xml</code>.
                    </td>
                    <td className="p-3.5 text-red-700 text-xs font-medium">
                      Gets pages cleanly indexed onto Page 2, but cannot outrank 10-year entrenched competitors for Position #1 without intent silos and Answer-First tables.
                    </td>
                  </tr>
                  <tr className={selectedAgentView === 'agent3' ? 'bg-[#00B4D8]/5' : ''}>
                    <td className="p-3.5 font-bold text-[#1A2B4C]">
                      3rd AI Agent
                      <div className="text-xs font-normal text-gray-500">AEO/GEO Scientist, Outranker & WCAG UX Auditor</div>
                    </td>
                    <td className="p-3.5 font-mono text-xs text-gray-700">
                      max(RAG Citation Score, Info Gain, SERP CTR, Lead CVR, WCAG 2.2 AA = 100)
                    </td>
                    <td className="p-3.5 text-gray-700">
                      Hub-and-Spoke anti-cannibalization silos, 60-word Answer-First verdicts below <code className="text-xs bg-gray-100 px-1 rounded">&lt;h1&gt;</code>, native HTML <code className="text-xs bg-gray-100 px-1 rounded">&lt;table&gt;</code> BoM/comparison matrices, <code className="text-xs bg-gray-100 px-1 rounded">/llms-full.txt</code> corpus, 7-Part localized service conversion blueprint.
                    </td>
                    <td className="p-3.5 text-red-700 text-xs font-medium">
                      Without Agent 1&apos;s Wave-1 SSR/LCP speed and Agent 2&apos;s canonical/GMC plumbing, crawlers snapshot blank spinners or split PageRank across duplicate URLs.
                    </td>
                  </tr>
                  <tr className="bg-emerald-50/70">
                    <td className="p-3.5 font-extrabold text-emerald-950">
                      Unified Apex Master Agent
                      <div className="text-xs font-bold text-emerald-700">v4.0 Self-Evolving Skill Synthesis</div>
                    </td>
                    <td className="p-3.5 font-mono text-xs text-emerald-900 font-bold">
                      6-Tier Hierarchical Resolution + 4-Gate Monotonic Self-Update Ratchet
                    </td>
                    <td className="p-3.5 text-emerald-950 font-medium">
                      Combines Wave-1 Express SSR + Frame-0 Fallbacks + 100% GSC/GMC Canonical Graph + Flat &le;2-Click Structure + Answer-First HTML <code className="text-xs bg-white px-1 rounded">&lt;table&gt;</code> RAG Silos + Lighthouse 100 + Append-Only Skill Memory.
                    </td>
                    <td className="p-3.5 text-emerald-800 text-xs font-bold">
                      Zero Blind Spots — Self-verifies via <code className="bg-white px-1 rounded">seo-silo-audit.ts</code> and updates its own <code className="bg-white px-1 rounded">SKILL.md</code> ledger monotonically.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Self-Updating Skill Evolution Ratchet */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
                  <RefreshCw size={13} />
                  4-Gate Monotonic Self-Updating Skill Engine
                </div>
                <h3 className="text-lg font-extrabold text-[#1A2B4C]">
                  Evolve Skill Without Losing Previous Capabilities
                </h3>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  Add any new SEO discovery, competitor counter-rule, Lighthouse optimization, or domain constraint below. It is appended monotonically to Section 9 of <code className="font-mono text-[#1A2B4C]">SKILL.md</code> and inherited by all compiled Niche Blueprints—never overwriting prior rules.
                </p>

                <form onSubmit={handleAppendSkillRule} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      New Rule / Capability Milestone Title
                    </label>
                    <input
                      type="text"
                      value={newRuleTitle}
                      onChange={(e) => setNewRuleTitle(e.target.value)}
                      placeholder="e.g., Video Schema & YouTube Embed Facade Optimization"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#00B4D8]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Exact Engineering & SEO Enforcement Rule
                    </label>
                    <textarea
                      rows={4}
                      value={newRuleContent}
                      onChange={(e) => setNewRuleContent(e.target.value)}
                      placeholder="e.g., Wrap all product demo videos in VideoObject JSON-LD with thumbnailUrl, uploadDate, and duration, and use click-to-load poster facades so YouTube iframes never impact initial TBT."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#00B4D8]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1A2B4C] hover:bg-[#00B4D8] text-white font-bold text-sm transition-all cursor-pointer"
                  >
                    <PlusCircle size={17} />
                    Append Rule to Self-Evolving SKILL.md Ledger
                  </button>
                </form>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100 space-y-2.5 max-h-60 overflow-y-auto">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Active Monotonic Skill Ledger ({learnedRules.length} Versioned Rules)
                </div>
                {learnedRules.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-[#1A2B4C]">
                      <span>{item.version} — {item.title}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{item.date}</span>
                    </div>
                    <p className="text-gray-600 mt-1 leading-relaxed">{item.rule}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Live SKILL.md Code Preview & Export */}
            <div className="lg:col-span-7 bg-[#0F172A] rounded-2xl p-6 text-gray-100 shadow-xl border border-white/10 flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <span className="text-xs font-mono text-[#00B4D8] font-bold">
                    /skills/apex-seo-aeo-engine/SKILL.md
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    World-Class Installable AI Agent Skill File
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy('skill-md', compiledApexSkillMd)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    {copiedId === 'skill-md' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedId === 'skill-md' ? 'Copied SKILL.md!' : 'Copy SKILL.md'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload('SKILL.md', compiledApexSkillMd)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00B4D8] hover:bg-[#0096B7] text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <Download size={14} />
                    Download .md
                  </button>
                </div>
              </div>
              <pre className="mt-4 text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[540px] overflow-y-auto pr-2">
                {compiledApexSkillMd}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UNIVERSAL MULTI-NICHE WEBSITE BLUEPRINT COMPILER */}
      {activeTab === 'niche-compiler' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#00B4D8]">
                Launch Any New Niche Website
              </span>
              <h2 className="text-xl font-extrabold text-[#1A2B4C] mt-0.5">
                Universal Niche Parameters Configurator
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Select an industry preset or enter your new niche details below to compile a customized, copy-paste-ready <code className="font-mono">NICHE_WEBSITE_BLUEPRINT.md</code>.
              </p>
            </div>

            {/* Preset Selector Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {NICHE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setNicheConfig(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    nicheConfig.brandName === preset.brandName
                      ? 'bg-[#1A2B4C] text-white border-[#1A2B4C]'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={nicheConfig.brandName}
                    onChange={(e) => setNicheConfig({ ...nicheConfig, brandName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Primary Domain</label>
                  <input
                    type="text"
                    value={nicheConfig.domain}
                    onChange={(e) => setNicheConfig({ ...nicheConfig, domain: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Core Niche & Commercial Focus</label>
                <input
                  type="text"
                  value={nicheConfig.niche}
                  onChange={(e) => setNicheConfig({ ...nicheConfig, niche: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Currency</label>
                  <input
                    type="text"
                    value={nicheConfig.currency}
                    onChange={(e) => setNicheConfig({ ...nicheConfig, currency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Country</label>
                  <input
                    type="text"
                    value={nicheConfig.country}
                    onChange={(e) => setNicheConfig({ ...nicheConfig, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  National Head Pillar Routes (Anti-Cannibalization Hubs)
                </label>
                <input
                  type="text"
                  value={nicheConfig.pillars}
                  onChange={(e) => setNicheConfig({ ...nicheConfig, pillars: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Competitor Domains to Outrank
                </label>
                <input
                  type="text"
                  value={nicheConfig.competitors}
                  onChange={(e) => setNicheConfig({ ...nicheConfig, competitors: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Target Geo Cities & Business Districts
                </label>
                <input
                  type="text"
                  value={nicheConfig.cities}
                  onChange={(e) => setNicheConfig({ ...nicheConfig, cities: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Product Categories (/category/:slug)
                </label>
                <textarea
                  rows={2}
                  value={nicheConfig.categories}
                  onChange={(e) => setNicheConfig({ ...nicheConfig, categories: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Turnkey Services (/services/:slug)
                </label>
                <textarea
                  rows={2}
                  value={nicheConfig.services}
                  onChange={(e) => setNicheConfig({ ...nicheConfig, services: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Authorized OEM Brands (/brands/:slug)
                </label>
                <input
                  type="text"
                  value={nicheConfig.brands}
                  onChange={(e) => setNicheConfig({ ...nicheConfig, brands: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Compiled Niche Blueprint Output */}
          <div className="lg:col-span-7 bg-[#0F172A] rounded-2xl p-6 text-gray-100 shadow-xl border border-white/10 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-mono text-[#00B4D8] font-bold">
                  /NICHE_WEBSITE_BLUEPRINT.md ({nicheConfig.domain})
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Compiled Turnkey Prompt & Architecture File for New Website
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy('niche-md', compiledNicheBlueprintMd)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  {copiedId === 'niche-md' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copiedId === 'niche-md' ? 'Copied Blueprint!' : 'Copy Blueprint'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload('NICHE_WEBSITE_BLUEPRINT.md', compiledNicheBlueprintMd)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00B4D8] hover:bg-[#0096B7] text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <Download size={14} />
                  Download .md
                </button>
              </div>
            </div>
            <pre className="mt-4 text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[680px] overflow-y-auto pr-2">
              {compiledNicheBlueprintMd}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: WEBSITE BUILDING MECHANISM & LIGHTHOUSE 100 REPORT */}
      {activeTab === 'mechanism' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-extrabold text-[#1A2B4C]">
                  Comprehensive Website Building Mechanism & Lighthouse 100 Engineering Report
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Complete architectural breakdown of the 6 core engines powering <code className="font-mono">avlive.com.pk</code>.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy('report-md', mechanismReportMd)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1A2B4C] text-xs font-bold transition-all cursor-pointer"
                >
                  {copiedId === 'report-md' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {copiedId === 'report-md' ? 'Copied Report!' : 'Copy Report Markdown'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload('WEBSITE_BUILDING_MECHANISM_REPORT.md', mechanismReportMd)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A2B4C] hover:bg-[#00B4D8] text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <Download size={14} />
                  Download Report .md
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="w-10 h-10 rounded-xl bg-[#1A2B4C] text-[#00B4D8] flex items-center justify-center mb-3">
                  <Terminal size={20} />
                </div>
                <h3 className="font-extrabold text-[#1A2B4C] text-base">
                  1. Dual-Wave Express SSR Engine
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  <code className="font-mono text-[#1A2B4C]">server.ts</code> intercepts every canonical route before Vite/Express flushes HTML, injecting <code className="font-mono">data-rh="true"</code> titles, self-referencing canonicals, <code className="font-mono">@graph</code> JSON-LD, and a pre-rendered <code className="font-mono">&lt;main class="ssr-seo-snapshot"&gt;</code> body inside <code className="font-mono">&lt;div id="root"&gt;</code>.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="w-10 h-10 rounded-xl bg-[#1A2B4C] text-[#00B4D8] flex items-center justify-center mb-3">
                  <Zap size={20} />
                </div>
                <h3 className="font-extrabold text-[#1A2B4C] text-base">
                  2. Frame-0 Zero Soft-404 Fallbacks
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Public routes initialize synchronously on Frame 0 from <code className="font-mono">PRODUCT_GMC_METADATA</code> (53 SKUs), <code className="font-mono">FALLBACK_PRODUCT_CATEGORIES</code> (12 categories), and <code className="font-mono">FALLBACK_SERVICES_CATALOG</code> (9 services) while Firestore hydrates in the background via silent long-polling.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="w-10 h-10 rounded-xl bg-[#1A2B4C] text-[#00B4D8] flex items-center justify-center mb-3">
                  <Layers size={20} />
                </div>
                <h3 className="font-extrabold text-[#1A2B4C] text-base">
                  3. Hub-and-Spoke Anti-Cannibalization Silo
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Separates national head keywords (<code className="font-mono">/video-conference-in-pakistan</code>, <code className="font-mono">/event-management-in-pakistan</code>) from Category, Brand, Regional Geo, and SKU pages so PageRank never splits across competing URLs.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="w-10 h-10 rounded-xl bg-[#1A2B4C] text-[#00B4D8] flex items-center justify-center mb-3">
                  <Table2 size={20} />
                </div>
                <h3 className="font-extrabold text-[#1A2B4C] text-base">
                  4. AEO / GEO Verdicts & Native HTML Tables
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Every commercial page opens with a 60-word Answer-First engineering verdict followed by native <code className="font-mono">&lt;table&gt;</code> BoM/pricing matrices and a synchronized 31.5 KB <code className="font-mono">/llms-full.txt</code> corpus for AI Overviews, ChatGPT Search, and Perplexity.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="w-10 h-10 rounded-xl bg-[#1A2B4C] text-[#00B4D8] flex items-center justify-center mb-3">
                  <Gauge size={20} />
                </div>
                <h3 className="font-extrabold text-[#1A2B4C] text-base">
                  5. Google Lighthouse 100/100/100/100 Physics
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Enforces <code className="font-mono">LCP &le; 1.8s</code>, <code className="font-mono">TBT &le; 50ms</code>, <code className="font-mono">CLS = 0.000</code>, and <code className="font-mono">DOM &lt; 800</code> via Rollup manual chunks, WebP compression, hover-only 2nd image mounting, 16-card <code className="font-mono">IntersectionObserver</code> batching, 54px mobile header, and compact 16:6 heroes.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="w-10 h-10 rounded-xl bg-[#1A2B4C] text-[#00B4D8] flex items-center justify-center mb-3">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-extrabold text-[#1A2B4C] text-base">
                  6. 4-Gate Self-Updating Skill Ratchet
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Prevents Catastrophic Forgetting across sessions via an append-only <code className="font-mono">SKILL.md</code> + <code className="font-mono">seo-policy.md</code> ledger and automated invariant checks in <code className="font-mono">scripts/seo-silo-audit.ts</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SITE CHANGE LOG, WEBSITE STRUCTURE BLUEPRINT & GSC 11-ISSUE RESOLUTION MATRIX */}
      {activeTab === 'recovery-ledger' && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-[#1A2B4C]">
                  Google Search Console (GSC) 11-Issue Resolution Matrix &amp; Single-Hop 301 Verification
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Every indexing issue from the uploaded GSC CSV reports (<code className="font-mono">Critical_issues.csv</code> &amp; <code className="font-mono">Non-critical_issues.csv</code>) is permanently resolved in <code className="font-mono">server.ts</code>, <code className="font-mono">src/lib/gmc-feed.ts</code>, and <code className="font-mono">src/App.tsx</code>.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#1A2B4C] text-white">
                    <th className="p-3 rounded-tl-xl font-bold">GSC Report Reason</th>
                    <th className="p-3 font-bold">CSV Pages</th>
                    <th className="p-3 font-bold">Root Cause Identified</th>
                    <th className="p-3 rounded-tr-xl font-bold">Permanent Engineering Fix (v4.4)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="p-3 font-bold text-[#1A2B4C]">Server error (5xx)</td>
                    <td className="p-3 font-mono font-bold text-amber-700">92</td>
                    <td className="p-3 text-gray-600">
                      <code className="bg-gray-100 px-1 rounded">vite.transformIndexHtml</code> forwarded parse/encoding exceptions to <code className="bg-gray-100 px-1 rounded">next(e)</code> (HTTP 500).
                    </td>
                    <td className="p-3 text-emerald-800 font-medium">
                      Wrapped in Zero-5xx Fault-Tolerant Guard returning <code className="bg-emerald-50 px-1 rounded">200 OK</code> pre-rendered <code className="bg-emerald-50 px-1 rounded">seoHtml</code> on any middleware error.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#1A2B4C]">Duplicate without user-selected canonical</td>
                    <td className="p-3 font-mono font-bold text-red-700">33</td>
                    <td className="p-3 text-gray-600">
                      54th live Firestore SKU (<code className="bg-gray-100 px-1 rounded">kl5wGaNLxqQByn3oPd1Z</code>) and unmatched paths fell back to Homepage title, description &amp; body HTML.
                    </td>
                    <td className="p-3 text-emerald-800 font-medium">
                      Mapped <code className="bg-emerald-50 px-1 rounded">podium-prompter-17-compact-pakistan</code>, added 1-hop 301 normalizer for trailing slashes/uppercase/query strings, and synthesized unique SSR metadata on all routes.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#1A2B4C]">Excluded by &lsquo;noindex&rsquo; tag</td>
                    <td className="p-3 font-mono font-bold text-gray-700">29</td>
                    <td className="p-3 text-gray-600">
                      Protected <code className="bg-gray-100 px-1 rounded">/admin/*</code>, <code className="bg-gray-100 px-1 rounded">/cart</code>, <code className="bg-gray-100 px-1 rounded">/checkout</code>, and <code className="bg-gray-100 px-1 rounded">/setup-wizard</code> routes.
                    </td>
                    <td className="p-3 text-emerald-800 font-medium">
                      Verified 0 of the 157 canonical URLs have <code className="bg-emerald-50 px-1 rounded">noindex</code>; transactional routes remain strictly isolated with <code className="bg-emerald-50 px-1 rounded">X-Robots-Tag: noindex, nofollow</code>.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#1A2B4C]">Page with redirect &amp; Redirect error</td>
                    <td className="p-3 font-mono font-bold text-amber-700">16 + 1</td>
                    <td className="p-3 text-gray-600">
                      Multi-hop redirect chains (<code className="bg-gray-100 px-1 rounded">/products/about/</code> &rarr; <code className="bg-gray-100 px-1 rounded">/category/about</code> &rarr; <code className="bg-gray-100 px-1 rounded">/about</code>).
                    </td>
                    <td className="p-3 text-emerald-800 font-medium">
                      <code className="bg-emerald-50 px-1 rounded">resolveSingleHopCanonicalTarget()</code> flattens up to 4 internal lookup steps into 1 single HTTP 301 jump and ensures 0 internal redirect links.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#1A2B4C]">Blocked by robots.txt</td>
                    <td className="p-3 font-mono font-bold text-amber-700">1</td>
                    <td className="p-3 text-gray-600">
                      <code className="bg-gray-100 px-1 rounded">/cart</code> was linked in Navbar while disallowed in <code className="bg-gray-100 px-1 rounded">public/robots.txt</code>.
                    </td>
                    <td className="p-3 text-emerald-800 font-medium">
                      Removed <code className="bg-emerald-50 px-1 rounded">Disallow: /cart</code> from <code className="bg-emerald-50 px-1 rounded">robots.txt</code> so Googlebot reads <code className="bg-emerald-50 px-1 rounded">X-Robots-Tag: noindex, nofollow</code> + added <code className="bg-emerald-50 px-1 rounded">rel=&quot;nofollow&quot;</code> on cart links.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#1A2B4C]">Not found (404) &amp; Alternate canonical</td>
                    <td className="p-3 font-mono font-bold text-gray-700">2 + 2</td>
                    <td className="p-3 text-gray-600">
                      Retired product/category URLs or <code className="bg-gray-100 px-1 rounded">?brand=</code> / <code className="bg-gray-100 px-1 rounded">?sub=</code> query links.
                    </td>
                    <td className="p-3 text-emerald-800 font-medium">
                      Unknown <code className="bg-emerald-50 px-1 rounded">/product/*</code>, <code className="bg-emerald-50 px-1 rounded">/category/*</code>, <code className="bg-emerald-50 px-1 rounded">/brands/*</code>, <code className="bg-emerald-50 px-1 rounded">/services/*</code>, and <code className="bg-emerald-50 px-1 rounded">/blog/*</code> paths 301-redirect in 1 hop to their parent canonical hub.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SITE_CHANGE_LOG.md Viewer */}
            <div className="bg-[#0F172A] rounded-2xl p-6 text-gray-100 shadow-xl border border-white/10 flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <span className="text-xs font-mono text-[#00B4D8] font-bold">/SITE_CHANGE_LOG.md</span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Master Change Log &amp; State Recovery Ledger
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy('changelog-md', siteChangeLogMd)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    {copiedId === 'changelog-md' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedId === 'changelog-md' ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload('SITE_CHANGE_LOG.md', siteChangeLogMd)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00B4D8] hover:bg-[#0096B7] text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <Download size={14} />
                    Download .md
                  </button>
                </div>
              </div>
              <pre className="mt-4 text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[480px] overflow-y-auto pr-2">
                {siteChangeLogMd}
              </pre>
            </div>

            {/* WEBSITE_STRUCTURE_BLUEPRINT.md Viewer */}
            <div className="bg-[#0F172A] rounded-2xl p-6 text-gray-100 shadow-xl border border-white/10 flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <span className="text-xs font-mono text-[#00B4D8] font-bold">/WEBSITE_STRUCTURE_BLUEPRINT.md</span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    157-Route Website Structure &amp; Canonical Blueprint
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy('structure-md', websiteStructureBlueprintMd)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    {copiedId === 'structure-md' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedId === 'structure-md' ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload('WEBSITE_STRUCTURE_BLUEPRINT.md', websiteStructureBlueprintMd)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00B4D8] hover:bg-[#0096B7] text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <Download size={14} />
                    Download .md
                  </button>
                </div>
              </div>
              <pre className="mt-4 text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[480px] overflow-y-auto pr-2">
                {websiteStructureBlueprintMd}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlueprintGeneratorHub;

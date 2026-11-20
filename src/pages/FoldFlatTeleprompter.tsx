import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  SlidersHorizontal,
  MonitorPlay,
  Check,
  Download,
  Phone,
  FileText,
  ArrowRight,
  ShoppingCart,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { addToCart } from '../lib/cart';

type ViewerPosition = 'speaker' | 'audience' | 'wings';
type HingeAngle = 68 | 70 | 78 | 0;
type ChassisModel = '17' | '22';
type QuoteMode = 'package' | 'single';
type PackageOptionKey = 'A' | 'B' | 'C';
type SingleModelKey = '17-std' | '17-smart' | '22-std' | '22-smart';

const WORKFLOW_STEPS: Record<
  1 | 2 | 3,
  {
    step: 1 | 2 | 3;
    timing: string;
    title: string;
    summary: string;
    meta: string;
    detail: string;
    geometry: string;
    speakerFit: string;
    image: string;
    imageAlt: string;
  }
> = {
  1: {
    step: 1,
    timing: '0–10 seconds',
    title: 'Place the 1.2" unibody',
    summary:
      'Set the folded matte-black aluminium chassis onto any lectern or podium top. Its 1:1 perimeter fits compact desks (16.0" × 13.5") and flagship stage lecterns (22.0" × 15.0") with zero overhang clutter.',
    meta: 'Flush ~10 mm anti-glow rim',
    detail:
      'The 1.2" unibody conceals the recessed IPS LCD behind the podium rim and matte-black velvet baffle. Audience members and front broadcast cameras see only a low-profile lectern surface.',
    geometry: 'Folded: 0° · 1.2" profile',
    speakerFit: '16.0"×13.5" (17") / 22.0"×15.0" (22")',
    image: '/images/teleprompter/slide-06.webp',
    imageAlt: 'AV Live 1.2-inch ultra-slim fold-flat aluminium unibody deployed vs folded flat for transport',
  },
  2: {
    step: 2,
    timing: '10–20 seconds',
    title: 'Lift & lock the micro-hinges',
    summary:
      'Raise the frameless beam-splitter glass from 0° to one of three tactile ergonomic detents: 68°, 70°–73°, or 78°. Speakers from 5\'0" to 6\'5" maintain natural straight-ahead eye contact.',
    meta: '3-stop dual front micro-hinges',
    detail:
      'Dual front precision micro-hinges lock cleanly at 68°, 70°–73°, or 78° so presenters from 5\'0" to 6\'5" maintain direct eye contact without neck tilt.',
    geometry: '3-Stop Detent: 68° / 70°–73° / 78°',
    speakerFit: 'Fits speakers 5\'0"–6\'5"',
    image: '/images/teleprompter/slide-05.webp',
    imageAlt: 'Precision 70-degree micro-hinge geometry and speaker sightline elevation diagram',
  },
  3: {
    step: 3,
    timing: '20–30 seconds',
    title: 'Connect HDMI or boot Mini PC',
    summary:
      'Standard editions link via a single HDMI + DC cable straight to any Front-of-House (FOH) AV switcher. Standalone Smart editions boot directly from the integrated Mini PC pre-configured for dark-mode prompting.',
    meta: '400+ nit IPS & dark-mode UI',
    detail:
      'Standard editions connect via single-cable HDMI + DC to any FOH switcher. Standalone Smart editions boot an integrated Mini PC pre-configured for dark-mode prompting.',
    geometry: 'I/O: HDMI+DC or Mini PC',
    speakerFit: '400+ nit IPS · Dark-mode UI',
    image: '/images/teleprompter/slide-08.webp',
    imageAlt: 'Comparison of 17-inch Standard HDMI FOH Edition vs 17-inch Standalone Smart Mini PC Edition',
  },
};

const UNIT_PRICES: Record<
  SingleModelKey,
  {
    sku: string;
    name: string;
    shortName: string;
    series: string;
    price: number;
    caseName: string;
    casePrice: number;
    specs: string[];
  }
> = {
  '17-std': {
    sku: 'AVL-PT-17-STD',
    name: 'AV Live 17" Compact — Standard (HDMI FOH)',
    shortName: '17" Compact Standard',
    series: '17" Compact',
    price: 160000,
    caseName: '17" Hard Aluminium EVA Briefcase',
    casePrice: 30000,
    specs: [
      '17" (5:4) 400+ nit Privacy IPS (13.3" × 10.6")',
      'Single-cable HDMI + DC to FOH switcher',
      'Folded base: 16.0" × 13.5" × 1.2"',
    ],
  },
  '17-smart': {
    sku: 'AVL-PT-17-SMART',
    name: 'AV Live 17" Compact — Standalone Smart (Mini PC)',
    shortName: '17" Compact Smart',
    series: '17" Compact',
    price: 220000,
    caseName: '17" Hard Aluminium EVA Briefcase',
    casePrice: 30000,
    specs: [
      '17" (5:4) 400+ nit Privacy IPS',
      'Built-in Mini PC pre-configured for dark-mode prompting',
      'Folded base: 16.0" D',
    ],
  },
  '22-std': {
    sku: 'AVL-PT-22-STD',
    name: 'AV Live 22" Flagship — Standard (HDMI FOH)',
    shortName: '22" Flagship Standard',
    series: '22" Flagship',
    price: 220000,
    caseName: '22" Wheeled Aluminium EVA Trolley Case',
    casePrice: 40000,
    specs: [
      '22" Widescreen 400+ nit Privacy IPS',
      'Single-cable HDMI + DC to FOH switcher',
      'Folded base: 22.0" × 15.0" × 1.2"',
    ],
  },
  '22-smart': {
    sku: 'AVL-PT-22-SMART',
    name: 'AV Live 22" Flagship — Standalone Smart (Mini PC)',
    shortName: '22" Flagship Smart',
    series: '22" Flagship',
    price: 280000,
    caseName: '22" Wheeled Aluminium EVA Trolley Case',
    casePrice: 40000,
    specs: [
      '22" Widescreen 400+ nit Privacy IPS',
      'Built-in Mini PC pre-configured for dark-mode prompting',
      'Folded base: 17.5" D',
    ],
  },
};

const PACKAGES: Record<
  PackageOptionKey,
  {
    sku: string;
    name: string;
    subtitle: string;
    productOnly: number;
    withCases: number;
  }
> = {
  A: {
    sku: 'AVL-PT-PKG-A',
    name: 'Option A — Standard Pair (17" Std + 22" Std)',
    subtitle: '17" Std (HDMI) + 22" Std (HDMI)',
    productOnly: 380000,
    withCases: 450000,
  },
  B: {
    sku: 'AVL-PT-PKG-B',
    name: 'Option B — Mixed Pair (1× Std + 1× Standalone Smart)',
    subtitle: '1× Standard (HDMI) + 1× Standalone Smart',
    productOnly: 440000,
    withCases: 510000,
  },
  C: {
    sku: 'AVL-PT-PKG-C',
    name: 'Option C — Smart Pair (17" Smart + 22" Smart)',
    subtitle: '17" Standalone Smart + 22" Standalone Smart',
    productOnly: 500000,
    withCases: 570000,
  },
};

const PDF_GALLERY_SLIDES = [
  {
    src: '/images/teleprompter/slide-01.webp',
    label: 'Stage Overview',
    caption: 'AV Live 17" Compact Stealth Podium Teleprompter — Engineered for the Spotlight, Invisible to the Audience.',
  },
  {
    src: '/images/teleprompter/slide-02.webp',
    label: '400+ Nit Privacy IPS',
    caption: 'Ultra-Bright 400+ nit flush IPS display with 4-way ±30° microlouver privacy filter and 0% audience reflection.',
  },
  {
    src: '/images/teleprompter/slide-03.webp',
    label: 'Speaker vs Audience',
    caption: '80% high-clarity full-color slides exclusively for the presenter vs 0% visible text for audience and cameras.',
  },
  {
    src: '/images/teleprompter/slide-04.webp',
    label: '3-Layer Optical Stack',
    caption: 'Exploded view: Layer 1 (60/40 AR Glass), Layer 2 (17" Recessed IPS LCD), Layer 3 (Matte-Black Velvet Stealth Baffle).',
  },
  {
    src: '/images/teleprompter/slide-05.webp',
    label: '70° Micro-Hinge Geometry',
    caption: '3-stop ergonomic friction lock (68° / 70°–73° / 78°) with 4.4" inward overhang and 12.2" rise for speakers 5\'0"–6\'5".',
  },
  {
    src: '/images/teleprompter/slide-06.webp',
    label: '1.2" Fold-Flat Unibody',
    caption: '1:1 fold-flat aluminium unibody nests optical glass cleanly at 0° inside the 16.0" × 13.5" × 1.2" perimeter.',
  },
  {
    src: '/images/teleprompter/slide-07.webp',
    label: 'Deployment Scenarios',
    caption: 'Built for Executive Keynotes, Government Briefings, Live Multi-Camera Broadcasts, and Product Launches.',
  },
  {
    src: '/images/teleprompter/slide-08.webp',
    label: 'Standard vs Smart Edition',
    caption: 'Choose single-cable HDMI FOH connectivity or Standalone Smart Edition with integrated dark-mode Mini PC.',
  },
  {
    src: '/images/teleprompter/slide-09.webp',
    label: 'CNC EVA Flight Case',
    caption: 'Optional hard aluminium briefcase (17") and wheeled trolley flight case (22") with custom CNC-cut EVA foam.',
  },
  {
    src: '/images/teleprompter/slide-10.webp',
    label: 'PKR Investment & QA',
    caption: 'Transparent PKR turnkey pricing backed by full stage-light optical quality assurance prior to handover.',
  },
];

function formatPKR(num: number): string {
  return `PKR ${Math.round(num).toLocaleString('en-GB')}`;
}

export function FoldFlatTeleprompter() {
  const navigate = useNavigate();

  // Workflow & Gallery State
  const [workflowStep, setWorkflowStep] = useState<1 | 2 | 3>(1);
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);

  // Optical Simulator State
  const [viewer, setViewer] = useState<ViewerPosition>('speaker');
  const [angle, setAngle] = useState<HingeAngle>(70);
  const [chassisModel, setChassisModel] = useState<ChassisModel>('17');

  // Commercial Quote Builder State
  const [quoteMode, setQuoteMode] = useState<QuoteMode>('package');
  const [packageOption, setPackageOption] = useState<PackageOptionKey>('A');
  const [packageCases, setPackageCases] = useState<boolean>(false);
  const [singleModel, setSingleModel] = useState<SingleModelKey>('17-std');
  const [singleQty, setSingleQty] = useState<number>(1);
  const [singleCase, setSingleCase] = useState<boolean>(false);
  const [resetArmed, setResetArmed] = useState<boolean>(false);
  const [quoteStatus, setQuoteStatus] = useState<string>('');

  const activeWorkflow = WORKFLOW_STEPS[workflowStep];
  const activeSlide = PDF_GALLERY_SLIDES[activeSlideIdx] || PDF_GALLERY_SLIDES[0];

  // Computed Optical SVG Geometry
  const opticsCalc = useMemo(() => {
    const pivotX = 420;
    const pivotY = 264;
    const len = chassisModel === '22' ? 190 : 172;
    const effAngle = angle === 70 ? 71.5 : angle;
    const rad = (effAngle * Math.PI) / 180;
    const endX = pivotX - Math.cos(rad) * len;
    const endY = pivotY - Math.sin(rad) * len;

    const is22 = chassisModel === '22';
    const dimLabel =
      angle === 0
        ? is22
          ? '22" Flagship Folded (0°): 22.0" × 15.0" × 1.2" (Std) / 17.5" D (Smart)'
          : '17" Compact Folded (0°): 16.0" × 13.5" × 1.2" (Std) / 16.0" D (Smart)'
        : is22
          ? `22" Flagship at ${angle === 70 ? '70°–73°' : `${angle}°`}: 4.6" Inward Overhang · 12.7" Rise (at 70°)`
          : `17" Compact at ${angle === 70 ? '70°–73°' : `${angle}°`}: 4.4" Inward Overhang · 12.2" Rise (at 70°)`;

    const subLabel =
      angle === 0
        ? 'Optical glass nests cleanly inside the 1:1 aluminium base perimeter'
        : is22
          ? 'Frameless 21.0" × 13.5" (3–4 mm) 60/40 AR Glass'
          : 'Frameless 15.0" × 13.0" (3 mm) 60/40 AR Glass';

    let glassVal = '80% High-Clarity Full-Colour';
    let glassDesc =
      'Crisp full-colour slides, data charts, and cue timers reflected straight into the presenter’s natural sightline.';
    let ipsVal = '~20% Residual (80% Less Spread)';
    let ipsDesc =
      'The 4-way ±30° microlouver filter and matte-black velvet baffle eliminate upward glow onto the speaker’s chin and face.';

    if (angle === 0) {
      glassVal = 'Stowed Flat at 0°';
      glassDesc =
        'Optical glass folds flush inside the 1.2" unibody perimeter for briefcase or wheeled trolley transport.';
      ipsVal = 'Protected Flush Panel';
      ipsDesc =
        '100% flat & flush (~10 mm rim) with 4-way microlouver glossy-up surface protected during transit.';
    } else if (viewer === 'audience') {
      glassVal = '0% Display · 0% Reflection';
      glassDesc =
        'Audience members and broadcast front cameras look straight through crystal-clear AR glass with zero visible text.';
      ipsVal = 'Concealed Behind Rim & Filter';
      ipsDesc =
        'The recessed 400+ nit IPS panel sits completely hidden behind the lectern rim and anti-spill baffle.';
    } else if (viewer === 'wings') {
      glassVal = 'Crystal Clear · Zero Side Glow';
      glassDesc =
        'From the side stage or auditorium wings, the frameless optical glass shows zero glare or projected text.';
      ipsVal = 'Pitch-Black (>30° 4-Way Cutoff)';
      ipsDesc =
        'The 4-way (±30°) microlouver Privacy Protector cuts off off-axis IPS luminance completely beyond 30°.';
    }

    return {
      pivotX,
      pivotY,
      endX: Number(endX.toFixed(1)),
      endY: Number(endY.toFixed(1)),
      dimLabel,
      subLabel,
      glassVal,
      glassDesc,
      ipsVal,
      ipsDesc,
      coneOpacity: angle === 0 ? 0.04 : viewer === 'wings' ? 0.03 : 0.12,
      coneLabel:
        angle === 0
          ? 'Folded Flat at 0° Inside 1.2" Base'
          : viewer === 'wings'
            ? '>30° Side Cutoff · Pitch-Black IPS'
            : '±30° 4-Way Microlouver Envelope',
      speakerRayOpacity: angle === 0 ? 0.12 : viewer === 'speaker' ? 1 : 0.25,
      audienceRayOpacity: angle === 0 ? 0.12 : viewer === 'audience' ? 1 : 0.35,
    };
  }, [viewer, angle, chassisModel]);

  // Computed Quote Summary
  const quoteSummary = useMemo(() => {
    const lines: { label: string; value: string }[] = [];
    let total = 0;
    let cartName = '';
    let cartSku = '';

    if (quoteMode === 'package') {
      const pkg = PACKAGES[packageOption];
      total = packageCases ? pkg.withCases : pkg.productOnly;
      cartSku = packageCases ? `${pkg.sku}-EVA` : pkg.sku;
      cartName = packageCases ? `${pkg.name} + CNC EVA Flight Cases` : pkg.name;
      lines.push({ label: pkg.name, value: formatPKR(pkg.productOnly) });
      if (packageCases) {
        lines.push({ label: '17" EVA Briefcase + 22" Wheeled EVA Trolley', value: formatPKR(70000) });
      }
      lines.push({ label: 'Stage-light optical QC alignment & HDMI/AC kit', value: 'Included' });
    } else {
      const unit = UNIT_PRICES[singleModel];
      const safeQty = Math.max(1, Math.min(10, singleQty || 1));
      const hwTotal = unit.price * safeQty;
      const caseTotal = singleCase ? unit.casePrice * safeQty : 0;
      total = hwTotal + caseTotal;
      cartSku = singleCase ? `${unit.sku}-EVA` : unit.sku;
      cartName = singleCase ? `${unit.name} + ${unit.caseName}` : unit.name;
      lines.push({ label: `${safeQty}× ${unit.name}`, value: formatPKR(hwTotal) });
      if (singleCase) {
        lines.push({ label: `${safeQty}× ${unit.caseName}`, value: formatPKR(caseTotal) });
      }
      lines.push({ label: '1-Year hardware, IPS & micro-hinge warranty', value: 'Included' });
    }

    const advance = Math.round(total * 0.7);
    const balance = total - advance;
    return { total, advance, balance, lines, cartName, cartSku };
  }, [quoteMode, packageOption, packageCases, singleModel, singleQty, singleCase]);

  const handleDownloadQuote = () => {
    const detailLine =
      quoteMode === 'package'
        ? `Package: ${PACKAGES[packageOption].name}\nEVA Flight Cases: ${
            packageCases ? 'Included (17" Briefcase + 22" Wheeled Trolley)' : 'Product Only (No External Case)'
          }`
        : `Model: ${singleQty}× ${UNIT_PRICES[singleModel].name}\nEVA Flight Case: ${
            singleCase ? UNIT_PRICES[singleModel].caseName : 'None'
          }`;

    const content = [
      'AV LIVE COMMUNICATION — COMMERCIAL QUOTE SUMMARY',
      'Proposal Reference: AVL-PT-2026 | Validity: 15 Calendar Days from 19 November 2026',
      '----------------------------------------------------------------------',
      detailLine,
      '',
      `Net Commercial Total (Excl. Taxes): ${formatPKR(quoteSummary.total)}`,
      `70% Advance on PO Confirmation: ${formatPKR(quoteSummary.advance)}`,
      `30% Balance on Pre-Delivery QC: ${formatPKR(quoteSummary.balance)}`,
      '',
      'Lead Time: 20–25 working days in Lahore (includes on-site podium walkthrough)',
      'Warranty: 1-year hardware, IPS display & micro-hinge warranty (excl. glass breakage/liquid)',
      'Contact: 0339 0000921 | 0321 425 6263 | www.avlive.com.pk | Lahore, Pakistan',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AV-Live-Teleprompter-Quote-AVL-PT-2026.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setQuoteStatus('Quote summary downloaded (Ref: AVL-PT-2026).');
  };

  const handleAddConfiguredToCart = () => {
    const unitQty = quoteMode === 'single' ? Math.max(1, Math.min(10, singleQty || 1)) : 1;
    const unitPrice = Math.round(quoteSummary.total / unitQty);
    addToCart(
      {
        id: quoteSummary.cartSku,
        name: quoteSummary.cartName,
        price: unitPrice,
        image: '/images/teleprompter/slide-02.jpg',
        brand: 'AV Live Communication',
        sku: quoteSummary.cartSku,
      },
      unitQty
    );
    setQuoteStatus(`Added "${quoteSummary.cartName}" to your quotation cart.`);
  };

  const handleSelectEditionToConfigure = (modelKey: SingleModelKey) => {
    setQuoteMode('single');
    setSingleModel(modelKey);
    setSingleQty(1);
    setQuoteStatus(`Loaded ${UNIT_PRICES[modelKey].shortName} into the live PKR configurator.`);
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleResetQuote = () => {
    if (!resetArmed) {
      setResetArmed(true);
      setTimeout(() => setResetArmed(false), 3500);
      return;
    }
    setResetArmed(false);
    setQuoteMode('package');
    setPackageOption('A');
    setPackageCases(false);
    setSingleModel('17-std');
    setSingleQty(1);
    setSingleCase(false);
    setQuoteStatus('Configuration reset to Option A — Standard Pair.');
  };

  const canonicalUrl = 'https://avlive.com.pk/podium-teleprompter';

  const pageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${canonicalUrl}#product`,
        name: 'AV Live Fold-Flat Podium Teleprompter (17" Compact & 22" Flagship Series)',
        sku: 'AVL-PT-2026',
        mpn: 'AV-PP-17C',
        gtin12: '610807990543',
        gtin: '610807990543',
        brand: {
          '@type': 'Brand',
          name: 'AV Live Communication',
        },
        image: [
          'https://avlive.com.pk/images/teleprompter/slide-01.jpg',
          'https://avlive.com.pk/images/teleprompter/slide-02.jpg',
          'https://avlive.com.pk/images/teleprompter/slide-03.jpg',
          'https://avlive.com.pk/images/teleprompter/slide-04.jpg',
        ],
        description:
          'Ultra-slim 1.2-inch matte-black aluminium fold-flat podium teleprompter with a flush 400+ nit IPS panel, 4-way ±30° stealth privacy microlouver, and frameless 70° 60/40 AR optical beam-splitter glass.',
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'PKR',
          lowPrice: '160000',
          highPrice: '570000',
          offerCount: '7',
          validFrom: '2026-01-01',
          priceValidUntil: '2027-12-31',
          availability: 'https://schema.org/InStock',
          url: canonicalUrl,
          shippingDetails: {
            '@type': 'OfferShippingDetails',
            shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'PKR' },
            shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'PK' },
            deliveryTime: {
              '@type': 'ShippingDeliveryTime',
              handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
              transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 5, unitCode: 'DAY' },
            },
          },
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: 'PK',
            returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
            merchantReturnDays: 30,
            returnMethod: 'https://schema.org/ReturnByMail',
            returnFees: 'https://schema.org/FreeReturn',
          },
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonicalUrl}#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How quickly can the AV Live Fold-Flat Podium Teleprompter be deployed on a lectern?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The 1.2-inch fold-flat aluminium unibody drops onto any existing lectern in 30 seconds: place the base, lift the frameless 60/40 AR beam-splitter glass to 68°, 70°–73°, or 78°, and connect HDMI + DC or boot the built-in Mini PC.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can the audience or front broadcast cameras see the script or facial glow?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. The frameless 70° 60/40 AR glass provides 80% full-color readability to the presenter and 0% visible text or reflection to the audience. The 4-way ±30° stealth privacy microlouver and matte-black velvet baffle reduce off-axis light spread by 80% to eliminate upward chin glow.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is the PKR price of the 17" Compact and 22" Flagship Podium Teleprompter in Pakistan?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'In Pakistan (Proposal Ref: AVL-PT-2026), the 17" Compact Standard HDMI edition is PKR 160,000, the 17" Standalone Smart Mini PC edition is PKR 220,000, the 22" Flagship Standard HDMI edition is PKR 220,000, and the 22" Standalone Smart edition is PKR 280,000. Optional CNC EVA flight cases are PKR 30,000 (17") and PKR 40,000 (22").',
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="bg-[#fbfbfd] text-[#1d1d1f] min-h-screen">
      <SEO
        title='AV Live Fold-Flat Podium Teleprompter | 17" & 22" Stealth IPS'
        description='Ultra-slim 1.2" fold-flat podium teleprompter by AV Live. 30-sec setup, 400+ nit IPS, 4-way ±30° privacy filter & PKR packages.'
        url={canonicalUrl}
        image="https://avlive.com.pk/images/teleprompter/slide-01.jpg"
        imageAlt='AV Live 17" Compact & 22" Flagship Fold-Flat Stealth Podium Teleprompter'
        type="product"
        schema={pageSchema}
      />

      {/* Breadcrumbs & Clean Contextual Section Jump Bar */}
      <div className="bg-white border-b border-[#e5e5ea]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <Breadcrumbs
            items={[
              { label: 'Shop', path: '/shop' },
              { label: 'Video Conferencing', path: '/category/video-conferencing' },
              { label: 'Fold-Flat Podium Teleprompter' },
            ]}
          />
          <nav aria-label="Teleprompter sections" className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#6e6e73]">
            <a href="#workflow" className="hover:text-[#1d1d1f] transition-colors whitespace-nowrap">
              Workflow
            </a>
            <a href="#optics" className="hover:text-[#1d1d1f] transition-colors whitespace-nowrap">
              Optics
            </a>
            <a href="#specifications" className="hover:text-[#1d1d1f] transition-colors whitespace-nowrap">
              Specifications
            </a>
            <a href="#pricing" className="hover:text-[#1d1d1f] transition-colors whitespace-nowrap">
              Packages &amp; Pricing
            </a>
            <a href="#warranty" className="hover:text-[#1d1d1f] transition-colors whitespace-nowrap">
              Warranty
            </a>
            <a
              href="/assets/aistudio/AV_Live_Stealth_Teleprompter_4ff82fdb.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#006bd6] hover:underline whitespace-nowrap inline-flex items-center gap-1"
            >
              <FileText size={14} />
              <span>PDF Datasheet</span>
            </a>
          </nav>
        </div>
      </div>

      {/* Section 1: Showroom Hero + PDF Visual Anchor + Core Hardware Metrics */}
      <section className="py-10 sm:py-14 lg:py-16 bg-[#fbfbfd]" aria-labelledby="teleprompter-hero-title">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <p className="text-xs sm:text-sm font-semibold text-[#bf4800] tracking-tight mb-2">
              17&Prime; Compact &amp; 22&Prime; Flagship Series &middot; Proposal Ref AVL-PT-2026
            </p>
            <h1
              id="teleprompter-hero-title"
              className="text-3xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-[-0.03em] leading-[1.06] text-[#1d1d1f] [text-wrap:balance]"
            >
              Stealth privacy prompting, folded flat to 1.2 inches.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#6e6e73] leading-relaxed">
              Engineered by AV Live Communication for executive keynotes, diplomatic briefings, and broadcast stages.
              Drop onto any existing lectern in 30 seconds for full-colour speaker clarity with 0% audience reflection
              and zero facial up-lighting.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-5">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 bg-[#006bd6] hover:bg-[#0058b0] text-white font-semibold text-sm px-6 py-3 min-h-[44px] rounded-full transition-colors whitespace-nowrap"
              >
                <span>Configure PKR Package</span>
                <ArrowRight size={15} />
              </a>
              <a
                href="/assets/aistudio/AV_Live_Stealth_Teleprompter_4ff82fdb.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#e8e8ed] hover:bg-[#dcdce1] text-[#1d1d1f] font-semibold text-sm px-6 py-3 min-h-[44px] rounded-full transition-colors whitespace-nowrap"
              >
                <Download size={15} />
                <span>Download PDF Brochure</span>
              </a>
              <a
                href="#optics"
                className="inline-flex items-center text-sm font-semibold text-[#006bd6] hover:underline min-h-[44px] px-2 whitespace-nowrap"
              >
                Inspect optical architecture &rsaquo;
              </a>
            </div>
          </div>

          {/* Interactive PDF Reference Visual Stage */}
          <div className="bg-[#111318] rounded-3xl overflow-hidden border border-[#e5e5ea] mb-8 sm:mb-10">
            <div className="relative aspect-[16/9] w-full bg-[#111318]">
              <img
                src={activeSlide.src}
                alt={activeSlide.caption}
                width={1280}
                height={720}
                fetchPriority="high"
                loading="eager"
                className="w-full h-full object-contain bg-[#111318]"
              />
              <button
                type="button"
                aria-label="Previous brochure slide"
                onClick={() =>
                  setActiveSlideIdx((prev) => (prev === 0 ? PDF_GALLERY_SLIDES.length - 1 : prev - 1))
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                aria-label="Next brochure slide"
                onClick={() =>
                  setActiveSlideIdx((prev) => (prev === PDF_GALLERY_SLIDES.length - 1 ? 0 : prev + 1))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="bg-[#181b22] px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10">
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#9aa4b2] tabular-nums">
                  Datasheet Visual {activeSlideIdx + 1} / {PDF_GALLERY_SLIDES.length} &middot; {activeSlide.label}
                </p>
                <p className="text-sm text-white font-medium mt-0.5">{activeSlide.caption}</p>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0">
                {PDF_GALLERY_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.src}
                    type="button"
                    onClick={() => setActiveSlideIdx(idx)}
                    aria-label={`View slide ${idx + 1}: ${slide.label}`}
                    className={`w-12 h-7 rounded-md overflow-hidden border transition-all shrink-0 cursor-pointer ${
                      idx === activeSlideIdx
                        ? 'border-[#00B4D8] ring-2 ring-[#00B4D8]/40 opacity-100'
                        : 'border-white/15 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={slide.src}
                      alt={slide.label}
                      width={96}
                      height={54}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4 Core Hardware Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" aria-label="Core hardware metrics">
            <article className="bg-[#f5f5f7] rounded-2xl p-6 text-center flex flex-col justify-center">
              <span className="text-xs font-medium text-[#6e6e73]">Lectern deployment</span>
              <div className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-[#1d1d1f] tabular-nums mt-1">
                30 <span className="text-lg font-semibold text-[#6e6e73]">sec</span>
              </div>
              <p className="text-xs sm:text-sm text-[#6e6e73] mt-1.5">Presidential-style frameless drop-in setup</p>
            </article>
            <article className="bg-[#f5f5f7] rounded-2xl p-6 text-center flex flex-col justify-center">
              <span className="text-xs font-medium text-[#6e6e73]">Optical glass readability</span>
              <div className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-[#1d1d1f] tabular-nums mt-1">
                80% <span className="text-lg font-semibold text-[#6e6e73]">/ 0%</span>
              </div>
              <p className="text-xs sm:text-sm text-[#6e6e73] mt-1.5">Speaker clarity vs audience visibility</p>
            </article>
            <article className="bg-[#f5f5f7] rounded-2xl p-6 text-center flex flex-col justify-center">
              <span className="text-xs font-medium text-[#6e6e73]">Off-axis light reduction</span>
              <div className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-[#1d1d1f] tabular-nums mt-1">
                80%
              </div>
              <p className="text-xs sm:text-sm text-[#6e6e73] mt-1.5">4-way &plusmn;30&deg; stealth microlouver cut-off</p>
            </article>
            <article className="bg-[#f5f5f7] rounded-2xl p-6 text-center flex flex-col justify-center">
              <span className="text-xs font-medium text-[#6e6e73]">Fold-flat unibody</span>
              <div className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-[#1d1d1f] tabular-nums mt-1">
                1.2<span className="text-lg font-semibold text-[#6e6e73]">&Prime;</span>
              </div>
              <p className="text-xs sm:text-sm text-[#6e6e73] mt-1.5">Folds to 0&deg; cleanly inside base perimeter</p>
            </article>
          </div>
        </div>
      </section>

      {/* Section 2: 30-Second Drop-In Podium Workflow */}
      <section id="workflow" className="py-14 sm:py-16 bg-[#f5f5f7]" aria-labelledby="workflow-title">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <p className="text-xs sm:text-sm font-semibold text-[#bf4800] mb-2">30-Second Drop-In Podium Workflow</p>
            <h2
              id="workflow-title"
              className="text-2xl sm:text-4xl font-bold tracking-[-0.025em] text-[#1d1d1f] [text-wrap:balance]"
            >
              From flight case to live keynote in three deliberate moves.
            </h2>
            <p className="mt-3 text-base text-[#6e6e73]">
              Unlike conventional pedestal prompters with bulky hoods and external camera brackets, the 1:1 fold-flat
              aluminium unibody rests directly on your existing lectern.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" role="group" aria-label="Deployment workflow steps">
            {([1, 2, 3] as const).map((stepNum) => {
              const item = WORKFLOW_STEPS[stepNum];
              const isSelected = workflowStep === stepNum;
              const StepIcon = stepNum === 1 ? Layers : stepNum === 2 ? SlidersHorizontal : MonitorPlay;
              return (
                <button
                  key={stepNum}
                  type="button"
                  onClick={() => setWorkflowStep(stepNum)}
                  className={`text-left bg-white rounded-2xl p-6 flex flex-col gap-2.5 transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-[#006bd6] ring-2 ring-[#006bd6]/20 shadow-md'
                      : 'border-[#e5e5ea] hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#006bd6]">
                    <StepIcon size={16} aria-hidden="true" />
                    <span>
                      Step {stepNum} &middot; {item.timing}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold tracking-[-0.015em] text-[#1d1d1f]">{item.title}</h3>
                  <p className="text-sm text-[#6e6e73] leading-relaxed">{item.summary}</p>
                  <span className="mt-auto pt-2 text-xs font-semibold text-[#1d1d1f]">{item.meta}</span>
                </button>
              );
            })}
          </div>

          {/* Live Selected Workflow Visual + Detail Bar */}
          <div className="mt-6 bg-white rounded-2xl border border-[#e5e5ea] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch" aria-live="polite">
            <div className="lg:col-span-5 bg-[#111318]">
              <img
                src={activeWorkflow.image}
                alt={activeWorkflow.imageAlt}
                width={800}
                height={450}
                loading="lazy"
                className="w-full h-full object-cover min-h-[220px]"
              />
            </div>
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
              <p className="text-xs font-semibold text-[#006bd6]">
                Step {activeWorkflow.step} Selected &middot; {activeWorkflow.timing}
              </p>
              <h3 className="text-xl font-bold text-[#1d1d1f] mt-1">{activeWorkflow.title}</h3>
              <p className="text-sm sm:text-base text-[#6e6e73] leading-relaxed mt-2">{activeWorkflow.detail}</p>
              <div className="mt-5 pt-4 border-t border-[#e5e5ea] flex flex-wrap items-center gap-4 text-xs font-semibold text-[#1d1d1f] tabular-nums">
                <span>{activeWorkflow.geometry}</span>
                <span aria-hidden="true" className="text-[#aeaeb2]">
                  /
                </span>
                <span>{activeWorkflow.speakerFit}</span>
              </div>
            </div>
          </div>

          {/* Deployment Scenarios + Reference Slide */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <article className="bg-white rounded-2xl p-6 border border-[#e5e5ea]">
                <h3 className="text-base font-bold text-[#1d1d1f]">Executive Keynotes &amp; Corporate Summits</h3>
                <p className="text-sm text-[#6e6e73] mt-2 leading-relaxed">
                  Keeps speakers locked onto audience eye contact while tracking live slides, data charts, and stage
                  timers in full colour.
                </p>
              </article>
              <article className="bg-white rounded-2xl p-6 border border-[#e5e5ea]">
                <h3 className="text-base font-bold text-[#1d1d1f]">Government Briefings &amp; Diplomatic Events</h3>
                <p className="text-sm text-[#6e6e73] mt-2 leading-relaxed">
                  Drops onto existing lecterns in 30 seconds with a discreet, presidential-style frameless glass
                  profile and zero stage clutter.
                </p>
              </article>
              <article className="bg-white rounded-2xl p-6 border border-[#e5e5ea]">
                <h3 className="text-base font-bold text-[#1d1d1f]">Live Broadcasts, Award Shows &amp; Town Halls</h3>
                <p className="text-sm text-[#6e6e73] mt-2 leading-relaxed">
                  Ensures clean multi-camera sightlines with 0% audience reflection and zero upward chin or facial glow
                  under stage lighting.
                </p>
              </article>
              <article className="bg-white rounded-2xl p-6 border border-[#e5e5ea]">
                <h3 className="text-base font-bold text-[#1d1d1f]">Product Launches &amp; Investor Days</h3>
                <p className="text-sm text-[#6e6e73] mt-2 leading-relaxed">
                  Displays vibrant dashboards and scripted cues exclusively to the presenter without distracting
                  side-stage monitors.
                </p>
              </article>
            </div>
            <div className="lg:col-span-5 bg-[#111318] rounded-2xl overflow-hidden border border-[#e5e5ea]">
              <img
                src="/images/teleprompter/slide-07.webp"
                alt="Deployment scenarios: Executive Keynotes, Live Broadcasts, Government Briefings, and Product Launches"
                width={800}
                height={450}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Optical Engineering Simulator + PDF Reference Plates */}
      <section id="optics" className="py-14 sm:py-16 bg-[#fbfbfd]" aria-labelledby="optics-title">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <p className="text-xs sm:text-sm font-semibold text-[#bf4800] mb-2">Optical Engineering</p>
            <h2
              id="optics-title"
              className="text-2xl sm:text-4xl font-bold tracking-[-0.025em] text-[#1d1d1f] [text-wrap:balance]"
            >
              Full-colour slides for the presenter. Crystal-clear glass for the room.
            </h2>
            <p className="mt-3 text-base text-[#6e6e73]">
              Explore how the 400+ nit IPS panel, 4-way &plusmn;30&deg; stealth privacy microlouver, and frameless
              70&deg; optical glass isolate visibility strictly to the presenter&rsquo;s sightline.
            </p>
          </div>

          {/* Interactive Optical Simulator */}
          <div className="bg-[#f5f5f7] rounded-3xl p-5 sm:p-8 border border-[#e5e5ea]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <div>
                <span className="block text-xs font-semibold text-[#1d1d1f] mb-2">Viewer Position</span>
                <div className="flex flex-wrap gap-1 p-1 bg-[#e8e8ed] rounded-full">
                  {(
                    [
                      { key: 'speaker', label: 'Presenter (70°)' },
                      { key: 'audience', label: 'Audience / Cam' },
                      { key: 'wings', label: 'Side (>30°)' },
                    ] as const
                  ).map((btn) => (
                    <button
                      key={btn.key}
                      type="button"
                      onClick={() => setViewer(btn.key)}
                      className={`flex-1 min-h-[38px] px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                        viewer === btn.key ? 'bg-white text-[#1d1d1f] shadow-xs' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-[#1d1d1f] mb-2">Micro-Hinge Stop</span>
                <div className="flex flex-wrap gap-1 p-1 bg-[#e8e8ed] rounded-full">
                  {(
                    [
                      { key: 68, label: '68°' },
                      { key: 70, label: '70°–73°' },
                      { key: 78, label: '78°' },
                      { key: 0, label: '0° Flat' },
                    ] as const
                  ).map((btn) => (
                    <button
                      key={btn.key}
                      type="button"
                      onClick={() => setAngle(btn.key)}
                      className={`flex-1 min-h-[38px] px-2.5 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                        angle === btn.key ? 'bg-white text-[#1d1d1f] shadow-xs' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-[#1d1d1f] mb-2">Chassis Series</span>
                <div className="flex flex-wrap gap-1 p-1 bg-[#e8e8ed] rounded-full">
                  {(
                    [
                      { key: '17', label: '17" Compact' },
                      { key: '22', label: '22" Flagship' },
                    ] as const
                  ).map((btn) => (
                    <button
                      key={btn.key}
                      type="button"
                      onClick={() => setChassisModel(btn.key)}
                      className={`flex-1 min-h-[38px] px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                        chassisModel === btn.key
                          ? 'bg-white text-[#1d1d1f] shadow-xs'
                          : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-6 border border-[#e5e5ea]">
                <svg
                  viewBox="0 0 640 360"
                  role="img"
                  aria-label="Interactive side-profile optical schematic of the AV Live Fold-Flat Podium Teleprompter"
                  className="w-full h-auto block"
                >
                  <rect x="40" y="290" width="560" height="16" rx="4" fill="#dcdce1" />
                  <text x="52" y="324" fill="#6e6e73" fontSize="12" fontWeight="500">
                    Existing Lectern / Podium Surface
                  </text>

                  <rect x="160" y="264" width="280" height="26" rx="6" fill="#1d1d1f" />
                  <rect x="180" y="262" width="240" height="6" rx="2" fill="#006bd6" />
                  <text x="300" y="281" textAnchor="middle" fill="#fbfbfd" fontSize="11" fontWeight="600">
                    1.2&Prime; Aluminium Unibody &middot; 400+ Nit Privacy IPS
                  </text>

                  <polygon
                    points="210,262 390,262 430,130 170,130"
                    fill="#006bd6"
                    opacity={opticsCalc.coneOpacity}
                  />
                  <line x1="210" y1="262" x2="170" y2="130" stroke="#006bd6" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
                  <line x1="390" y1="262" x2="430" y2="130" stroke="#006bd6" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
                  <text x="300" y="246" textAnchor="middle" fill="#006bd6" fontSize="11" fontWeight="600">
                    {opticsCalc.coneLabel}
                  </text>

                  <g>
                    <line
                      x1={opticsCalc.pivotX}
                      y1={opticsCalc.pivotY}
                      x2={opticsCalc.endX}
                      y2={opticsCalc.endY}
                      stroke="#006bd6"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                    <circle cx={opticsCalc.pivotX} cy={opticsCalc.pivotY} r="6" fill="#bf4800" />
                  </g>

                  <g opacity={opticsCalc.speakerRayOpacity}>
                    <line x1="300" y1="262" x2="386" y2="156" stroke="#006bd6" strokeWidth="2.5" />
                    <line x1="386" y1="156" x2="108" y2="114" stroke="#006bd6" strokeWidth="2.5" />
                    <circle cx="100" cy="112" r="16" fill="#e8f1fd" stroke="#006bd6" strokeWidth="2" />
                    <text x="100" y="84" textAnchor="middle" fill="#1d1d1f" fontSize="12" fontWeight="600">
                      Presenter Sightline
                    </text>
                    <text x="100" y="144" textAnchor="middle" fill="#006bd6" fontSize="11" fontWeight="600">
                      80% Vivid Clarity
                    </text>
                  </g>

                  <g opacity={opticsCalc.audienceRayOpacity}>
                    <line x1="560" y1="136" x2="395" y2="154" stroke="#bf4800" strokeWidth="2" strokeDasharray="5 4" />
                    <circle cx="572" cy="134" r="16" fill="#f5f5f7" stroke="#bf4800" strokeWidth="2" />
                    <text x="556" y="106" textAnchor="middle" fill="#1d1d1f" fontSize="12" fontWeight="600">
                      Audience / Camera
                    </text>
                    <text x="556" y="168" textAnchor="middle" fill="#bf4800" fontSize="11" fontWeight="600">
                      0% Reflection
                    </text>
                  </g>

                  <text x="300" y="34" textAnchor="middle" fill="#1d1d1f" fontSize="13" fontWeight="600">
                    {opticsCalc.dimLabel}
                  </text>
                  <text x="300" y="54" textAnchor="middle" fill="#6e6e73" fontSize="12">
                    {opticsCalc.subLabel}
                  </text>
                </svg>
              </div>

              <div className="lg:col-span-5 space-y-4" aria-live="polite">
                <div className="bg-white rounded-2xl p-5 border border-[#e5e5ea]">
                  <p className="text-xs font-semibold text-[#6e6e73]">Frameless Optical Glass View</p>
                  <p className="text-xl font-bold text-[#1d1d1f] mt-1 tabular-nums">{opticsCalc.glassVal}</p>
                  <p className="text-sm text-[#6e6e73] mt-1.5 leading-relaxed">{opticsCalc.glassDesc}</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#e5e5ea]">
                  <p className="text-xs font-semibold text-[#6e6e73]">Recessed IPS LCD &amp; Face Glow</p>
                  <p className="text-xl font-bold text-[#1d1d1f] mt-1 tabular-nums">{opticsCalc.ipsVal}</p>
                  <p className="text-sm text-[#6e6e73] mt-1.5 leading-relaxed">{opticsCalc.ipsDesc}</p>
                </div>

                <div className="bg-[#e8f1fd] text-[#0058b0] rounded-2xl p-5 text-xs sm:text-sm leading-relaxed">
                  <strong>Optical Coating Note:</strong> AV Live engineers its frameless 70&deg; glass with a precision{' '}
                  <strong>60/40 anti-reflective (AR)</strong> coating (3 mm on 17&Prime; Compact; 3&ndash;4 mm on
                  22&Prime; Flagship), delivering 80% speaker readability and 0% rear text bleed. Compared against
                  standard 70/30 beam-splitter glass, the 60/40 AR ratio paired with the 400+ nit privacy IPS ensures
                  superior daytime and bright-stage legibility without ghosting.
                </div>
              </div>
            </div>
          </div>

          {/* Visual Proof Plates from PDF (Speaker vs Audience & 3-Layer Stack) */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <figure className="bg-white rounded-2xl overflow-hidden border border-[#e5e5ea]">
              <img
                src="/images/teleprompter/slide-03.webp"
                alt="The Speaker's World (80% High-Clarity Readability) vs The Audience's World (0% Visible Text)"
                width={800}
                height={450}
                loading="lazy"
                className="w-full aspect-video object-cover bg-[#111318]"
              />
              <figcaption className="p-4 text-xs sm:text-sm text-[#6e6e73]">
                <strong className="text-[#1d1d1f]">Dual-World Optical Isolation:</strong> Presenter views crisp 80%
                full-colour dashboards while front-row attendees and broadcast cameras see crystal-clear glass.
              </figcaption>
            </figure>

            <figure className="bg-white rounded-2xl overflow-hidden border border-[#e5e5ea]">
              <img
                src="/images/teleprompter/slide-04.webp"
                alt="3-Layer Optical Stack: 60/40 AR Glass, 17-inch Recessed IPS LCD, and Matte-Black Velvet Stealth Baffle"
                width={800}
                height={450}
                loading="lazy"
                className="w-full aspect-video object-cover bg-[#111318]"
              />
              <figcaption className="p-4 text-xs sm:text-sm text-[#6e6e73]">
                <strong className="text-[#1d1d1f]">Three-Layer Stealth Stack:</strong> 3 mm frameless 60/40 AR glass
                over a flush 17&Prime; (5:4) IPS LCD framed by a matte-black velvet baffle and 4-way microlouver.
              </figcaption>
            </figure>
          </div>

          {/* Quantitative Performance Comparisons (Zero-JS-Overhead Native Bars) */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <article className="bg-[#f5f5f7] rounded-2xl p-6 border border-[#e5e5ea]">
              <h3 className="text-lg font-bold text-[#1d1d1f]">Optical Glass Visibility by Viewer (%)</h3>
              <p className="text-xs sm:text-sm text-[#6e6e73] mt-1 mb-6">
                Measured clarity on the 70&deg; frameless 60/40 AR glass vs audience rear sightline.
              </p>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm font-semibold text-[#1d1d1f] mb-1.5 tabular-nums">
                    <span>Speaker View (70&deg; Optical Glass)</span>
                    <span className="text-[#006bd6]">80%</span>
                  </div>
                  <div className="h-3.5 w-full bg-[#e5e5ea] rounded-full overflow-hidden">
                    <div className="h-full bg-[#006bd6] rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs sm:text-sm font-semibold text-[#1d1d1f] mb-1.5 tabular-nums">
                    <span>Audience View (Back of Glass)</span>
                    <span className="text-[#6e6e73]">0%</span>
                  </div>
                  <div className="h-3.5 w-full bg-[#e5e5ea] rounded-full overflow-hidden">
                    <div className="h-full bg-[#aeaeb2] rounded-full" style={{ width: '2%' }} />
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-[#6e6e73] mt-6">
                Source: AV Live Podium Teleprompter Datasheet (17&Prime; &amp; 22&Prime; Series).
              </p>
            </article>

            <article className="bg-[#f5f5f7] rounded-2xl p-6 border border-[#e5e5ea]">
              <h3 className="text-lg font-bold text-[#1d1d1f]">IPS Brightness Spread &amp; Face Glow (%)</h3>
              <p className="text-xs sm:text-sm text-[#6e6e73] mt-1 mb-6">
                Off-axis light spill comparison: unfiltered IPS vs 4-way &plusmn;30&deg; privacy IPS + velvet baffle.
              </p>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm font-semibold text-[#1d1d1f] mb-1.5 tabular-nums">
                    <span>Standard IPS (Unfiltered Light Spill)</span>
                    <span className="text-[#6e6e73]">100%</span>
                  </div>
                  <div className="h-3.5 w-full bg-[#e5e5ea] rounded-full overflow-hidden">
                    <div className="h-full bg-[#aeaeb2] rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs sm:text-sm font-semibold text-[#1d1d1f] mb-1.5 tabular-nums">
                    <span>AV Live Privacy IPS (&plusmn;30&deg; + Baffle)</span>
                    <span className="text-[#bf4800]">20% (80% Lower)</span>
                  </div>
                  <div className="h-3.5 w-full bg-[#e5e5ea] rounded-full overflow-hidden">
                    <div className="h-full bg-[#bf4800] rounded-full" style={{ width: '20%' }} />
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-[#6e6e73] mt-6">
                Source: AV Live Podium Teleprompter Datasheet (80% off-axis spread reduction).
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Section 4: Editions & Inch-by-Inch Specifications */}
      <section id="specifications" className="py-14 sm:py-16 bg-[#f5f5f7]" aria-labelledby="specs-title">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <p className="text-xs sm:text-sm font-semibold text-[#bf4800] mb-2">Editions &amp; Architecture</p>
            <h2
              id="specs-title"
              className="text-2xl sm:text-4xl font-bold tracking-[-0.025em] text-[#1d1d1f] [text-wrap:balance]"
            >
              Two chassis footprints. Standard HDMI or Standalone Smart Mini PC.
            </h2>
            <p className="mt-3 text-base text-[#6e6e73]">
              Every edition shares the 1.2&Prime; matte-black aluminium unibody, 400+ nit flat privacy IPS panel,
              anti-spill baffle rim, frameless 60/40 AR glass, AC power adapter, and HDMI cable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" aria-label="Available hardware editions">
            {(Object.keys(UNIT_PRICES) as SingleModelKey[]).map((key) => {
              const ed = UNIT_PRICES[key];
              return (
                <article
                  key={key}
                  className="bg-white rounded-2xl p-6 border border-[#e5e5ea] flex flex-col justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-[#006bd6]">{ed.series}</p>
                    <h3 className="text-lg font-bold text-[#1d1d1f] mt-1">
                      {key.endsWith('smart') ? 'Standalone Smart' : 'Standard (HDMI FOH)'}
                    </h3>
                    <div className="text-2xl font-bold tracking-[-0.025em] text-[#1d1d1f] tabular-nums mt-2">
                      {formatPKR(ed.price)}
                    </div>
                    <ul className="mt-4 space-y-2 text-xs sm:text-sm text-[#6e6e73]">
                      {ed.specs.map((sp) => (
                        <li key={sp} className="flex items-start gap-2">
                          <Check size={15} className="text-[#006bd6] shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{sp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectEditionToConfigure(key)}
                    className="mt-6 w-full py-2.5 px-4 rounded-full bg-[#f5f5f7] hover:bg-[#006bd6] text-[#1d1d1f] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Configure Edition
                  </button>
                </article>
              );
            })}
          </div>

          {/* Inch-by-Inch Technical Specification Table */}
          <div className="mt-10 bg-white rounded-2xl p-6 sm:p-8 border border-[#e5e5ea]">
            <h3 className="text-xl font-bold text-[#1d1d1f] mb-4">Technical Specifications (Inch-by-Inch)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm tabular-nums">
                <thead>
                  <tr className="border-b border-[#e5e5ea] text-[#6e6e73] font-semibold">
                    <th scope="col" className="py-3 pr-4">Specification</th>
                    <th scope="col" className="py-3 px-4">AV Live 17&Prime; Compact</th>
                    <th scope="col" className="py-3 pl-4">AV Live 22&Prime; Flagship</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5ea] text-[#1d1d1f]">
                  <tr>
                    <th scope="row" className="py-3 pr-4 font-semibold">Display Panel</th>
                    <td className="py-3 px-4">17&Prime; (5:4) 400+ nit IPS (13.3&Prime; &times; 10.6&Prime;)</td>
                    <td className="py-3 pl-4">22&Prime; Widescreen 400+ nit IPS</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-3 pr-4 font-semibold">Display Mounting</th>
                    <td className="py-3 px-4">100% flat &amp; flush (~10 mm rim)</td>
                    <td className="py-3 pl-4">100% flat &amp; flush (~10 mm rim)</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-3 pr-4 font-semibold">Privacy Protector</th>
                    <td className="py-3 px-4">4-way (&plusmn;30&deg;) microlouver (glossy up)</td>
                    <td className="py-3 pl-4">4-way (&plusmn;30&deg;) microlouver (glossy up)</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-3 pr-4 font-semibold">Anti-Glow Baffle</th>
                    <td className="py-3 px-4">Matte-black velvet rim + dark-mode UI</td>
                    <td className="py-3 pl-4">Matte-black velvet rim + dark-mode UI</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-3 pr-4 font-semibold">Optical Glass</th>
                    <td className="py-3 px-4">15.0&Prime; &times; 13.0&Prime; (3 mm) frameless 60/40 AR</td>
                    <td className="py-3 pl-4">21.0&Prime; &times; 13.5&Prime; (3&ndash;4 mm) frameless 60/40 AR</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-3 pr-4 font-semibold">Micro-Hinge Stops</th>
                    <td className="py-3 px-4">Dual front hinges (68&deg; / 70&deg;&ndash;73&deg; / 78&deg;)</td>
                    <td className="py-3 pl-4">Dual front hinges (68&deg; / 70&deg;&ndash;73&deg; / 78&deg;)</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-3 pr-4 font-semibold">70&deg; Geometry</th>
                    <td className="py-3 px-4">4.4&Prime; inward overhang; 12.2&Prime; rise</td>
                    <td className="py-3 pl-4">4.6&Prime; inward overhang; 12.7&Prime; rise</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-3 pr-4 font-semibold">Folded 1:1 Base</th>
                    <td className="py-3 px-4">16.0&Prime; &times; 13.5&Prime; &times; 1.2&Prime; (Std) / 16.0&Prime; D (Smart)</td>
                    <td className="py-3 pl-4">22.0&Prime; &times; 15.0&Prime; &times; 1.2&Prime; (Std) / 17.5&Prime; D (Smart)</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-3 pr-4 font-semibold">I/O &amp; Editions</th>
                    <td className="py-3 px-4">HDMI + DC (Std) / Mini PC (Smart)</td>
                    <td className="py-3 pl-4">HDMI + DC (Std) / Mini PC (Smart)</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-3 pr-4 font-semibold">Optional Case</th>
                    <td className="py-3 px-4">Hard aluminium EVA briefcase (add-on)</td>
                    <td className="py-3 pl-4">Hard aluminium EVA trolley (add-on)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Optical Behaviour by Viewing Angle Table */}
          <div className="mt-6 bg-white rounded-2xl p-6 sm:p-8 border border-[#e5e5ea]">
            <h3 className="text-xl font-bold text-[#1d1d1f] mb-4">Optical Behaviour by Viewing Angle</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#e5e5ea] text-[#6e6e73] font-semibold">
                    <th scope="col" className="py-3 pr-4">Viewer Position</th>
                    <th scope="col" className="py-3 px-4">Recessed IPS LCD</th>
                    <th scope="col" className="py-3 pl-4">Frameless 70&deg; Optical Glass</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5ea] text-[#1d1d1f]">
                  <tr>
                    <th scope="row" className="py-3 pr-4 font-semibold">Audience / Cameras</th>
                    <td className="py-3 px-4">Concealed behind podium rim &amp; filter</td>
                    <td className="py-3 pl-4 font-bold">0% display, 0% text, 0% reflection</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-3 pr-4 font-semibold">Side Stage / Wings</th>
                    <td className="py-3 px-4">Pitch-black (&gt;30&deg; 4-way cutoff)</td>
                    <td className="py-3 pl-4">Crystal clear, zero side glow</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-3 pr-4 font-semibold">Presenter / Speaker</th>
                    <td className="py-3 px-4">Dimmed to ~20% (80% less spread)</td>
                    <td className="py-3 pl-4 font-bold">80% high-clarity full-colour display</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Commercial Packages & Live PKR Quote Builder */}
      <section id="pricing" className="py-14 sm:py-16 bg-[#fbfbfd]" aria-labelledby="pricing-title">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <p className="text-xs sm:text-sm font-semibold text-[#bf4800] mb-2">
              Proposal Ref: AVL-PT-2026 &middot; Currency: PKR
            </p>
            <h2
              id="pricing-title"
              className="text-2xl sm:text-4xl font-bold tracking-[-0.025em] text-[#1d1d1f] [text-wrap:balance]"
            >
              Commercial packages, EVA flight cases, and live quote builder.
            </h2>
            <p className="mt-3 text-base text-[#6e6e73]">
              Configure an individual 17&Prime; or 22&Prime; unit, or select a combined two-unit touring package
              (1&times; 17&Prime; + 1&times; 22&Prime;) with CNC EVA flight cases.
            </p>
          </div>

          <div className="bg-[#f5f5f7] rounded-3xl p-5 sm:p-8 border border-[#e5e5ea] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Controls Column */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="block text-xs font-semibold text-[#1d1d1f] mb-2">Quote Configuration Mode</span>
                <div className="flex gap-1 p-1 bg-[#e8e8ed] rounded-full">
                  <button
                    type="button"
                    onClick={() => setQuoteMode('package')}
                    className={`flex-1 min-h-[40px] px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                      quoteMode === 'package' ? 'bg-white text-[#1d1d1f] shadow-xs' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                    }`}
                  >
                    2-Unit Touring Package
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuoteMode('single')}
                    className={`flex-1 min-h-[40px] px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                      quoteMode === 'single' ? 'bg-white text-[#1d1d1f] shadow-xs' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                    }`}
                  >
                    Single-Unit Builder
                  </button>
                </div>
              </div>

              {quoteMode === 'package' ? (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="select-package" className="block text-xs font-semibold text-[#1d1d1f] mb-2">
                      Select Combined 2-Unit Package (1&times; 17&Prime; + 1&times; 22&Prime;)
                    </label>
                    <select
                      id="select-package"
                      value={packageOption}
                      onChange={(e) => setPackageOption(e.target.value as PackageOptionKey)}
                      className="w-full min-h-[44px] bg-white border border-[#d2d2d7] rounded-full px-4 py-2.5 text-sm text-[#1d1d1f] focus:outline-none focus:border-[#006bd6]"
                    >
                      <option value="A">Option A — Standard Pair (17&Prime; Standard HDMI + 22&Prime; Standard HDMI)</option>
                      <option value="B">Option B — Mixed Pair (1&times; Standard HDMI + 1&times; Standalone Smart)</option>
                      <option value="C">Option C — Smart Pair (17&Prime; Standalone Smart + 22&Prime; Standalone Smart)</option>
                    </select>
                  </div>

                  <label className="flex items-center justify-between gap-4 bg-white rounded-2xl p-4 sm:p-5 border border-[#e5e5ea] cursor-pointer">
                    <div>
                      <div className="text-sm font-semibold text-[#1d1d1f]">
                        Include Custom Hard Aluminium EVA Flight Cases
                      </div>
                      <div className="text-xs text-[#6e6e73] mt-0.5">
                        Adds 17&Prime; Hard EVA Briefcase (PKR 30,000) + 22&Prime; Wheeled EVA Trolley Case (PKR 40,000)
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={packageCases}
                      onChange={(e) => setPackageCases(e.target.checked)}
                      className="w-5 h-5 accent-[#006bd6] shrink-0"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="select-single-model" className="block text-xs font-semibold text-[#1d1d1f] mb-2">
                      Hardware Model &amp; Edition
                    </label>
                    <select
                      id="select-single-model"
                      value={singleModel}
                      onChange={(e) => setSingleModel(e.target.value as SingleModelKey)}
                      className="w-full min-h-[44px] bg-white border border-[#d2d2d7] rounded-full px-4 py-2.5 text-sm text-[#1d1d1f] focus:outline-none focus:border-[#006bd6]"
                    >
                      <option value="17-std">AV Live 17&Prime; Compact — Standard (HDMI FOH) &middot; PKR 160,000</option>
                      <option value="17-smart">AV Live 17&Prime; Compact — Standalone Smart (Mini PC) &middot; PKR 220,000</option>
                      <option value="22-std">AV Live 22&Prime; Flagship — Standard (HDMI FOH) &middot; PKR 220,000</option>
                      <option value="22-smart">AV Live 22&Prime; Flagship — Standalone Smart (Mini PC) &middot; PKR 280,000</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="input-single-qty" className="block text-xs font-semibold text-[#1d1d1f] mb-2">
                      Unit Quantity (1–10)
                    </label>
                    <input
                      id="input-single-qty"
                      type="number"
                      min={1}
                      max={10}
                      value={singleQty}
                      onChange={(e) => setSingleQty(Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 1)))}
                      className="w-full min-h-[44px] bg-white border border-[#d2d2d7] rounded-full px-4 py-2.5 text-sm text-[#1d1d1f] tabular-nums focus:outline-none focus:border-[#006bd6]"
                    />
                  </div>

                  <label className="flex items-center justify-between gap-4 bg-white rounded-2xl p-4 sm:p-5 border border-[#e5e5ea] cursor-pointer">
                    <div>
                      <div className="text-sm font-semibold text-[#1d1d1f]">
                        Add {UNIT_PRICES[singleModel].caseName}
                      </div>
                      <div className="text-xs text-[#6e6e73] mt-0.5">
                        Custom CNC EVA foam protection (+{formatPKR(UNIT_PRICES[singleModel].casePrice)} per unit)
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={singleCase}
                      onChange={(e) => setSingleCase(e.target.checked)}
                      className="w-5 h-5 accent-[#006bd6] shrink-0"
                    />
                  </label>
                </div>
              )}

              {/* Touring Case PDF Reference Visual */}
              <div className="bg-white rounded-2xl overflow-hidden border border-[#e5e5ea] grid grid-cols-1 sm:grid-cols-12 items-center">
                <img
                  src="/images/teleprompter/slide-09.webp"
                  alt="Hard Aluminium EVA Flight Case with Custom CNC-Cut Foam Interior"
                  width={600}
                  height={338}
                  loading="lazy"
                  className="sm:col-span-5 w-full h-full object-cover min-h-[140px] bg-[#111318]"
                />
                <div className="sm:col-span-7 p-4">
                  <p className="text-xs font-semibold text-[#006bd6]">Touring &amp; Mobility Add-On</p>
                  <h3 className="text-sm font-bold text-[#1d1d1f] mt-0.5">Custom CNC-Cut EVA Flight Cases</h3>
                  <p className="text-xs text-[#6e6e73] mt-1 leading-relaxed">
                    Precision aluminium unibody shell engineered to protect the 60/40 AR optical glass and recessed
                    privacy IPS display during nationwide event transport.
                  </p>
                </div>
              </div>
            </div>

            {/* Live PKR Summary Panel */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 border border-[#e5e5ea] space-y-5" aria-live="polite">
              <div>
                <p className="text-xs font-semibold text-[#006bd6]">Proposal Ref: AVL-PT-2026</p>
                <p className="text-xs text-[#6e6e73] mt-1">Net Commercial Total (Excl. Taxes)</p>
                <p className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-[#1d1d1f] tabular-nums mt-1">
                  {formatPKR(quoteSummary.total)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#f5f5f7] rounded-xl p-4 tabular-nums">
                <div>
                  <div className="text-[11px] font-medium text-[#6e6e73]">70% Advance (On PO)</div>
                  <div className="text-base sm:text-lg font-bold text-[#1d1d1f] mt-0.5">
                    {formatPKR(quoteSummary.advance)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-[#6e6e73]">30% Balance (QC Handover)</div>
                  <div className="text-base sm:text-lg font-bold text-[#1d1d1f] mt-0.5">
                    {formatPKR(quoteSummary.balance)}
                  </div>
                </div>
              </div>

              <ul className="divide-y divide-[#e5e5ea] text-xs sm:text-sm tabular-nums">
                {quoteSummary.lines.map((line) => (
                  <li key={line.label} className="py-2.5 flex justify-between gap-3">
                    <span className="text-[#6e6e73]">{line.label}</span>
                    <strong className="text-[#1d1d1f] shrink-0">{line.value}</strong>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleAddConfiguredToCart}
                  className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#1A2B4C] hover:bg-[#006bd6] text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-colors cursor-pointer"
                >
                  <ShoppingCart size={16} />
                  <span>Add Configured Package to Cart</span>
                </button>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadQuote}
                    className="min-h-[44px] inline-flex items-center justify-center gap-1.5 bg-[#006bd6] hover:bg-[#0058b0] text-white font-semibold text-xs px-4 py-2.5 rounded-full transition-colors cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Quote (.txt)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetQuote}
                    className="min-h-[44px] inline-flex items-center justify-center gap-1.5 bg-[#e8e8ed] hover:bg-[#dcdce1] text-[#1d1d1f] font-semibold text-xs px-4 py-2.5 rounded-full transition-colors cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>{resetArmed ? 'Confirm Reset' : 'Reset'}</span>
                  </button>
                </div>
              </div>

              {quoteStatus && (
                <p className="text-xs font-semibold text-[#248a3d]" role="status">
                  {quoteStatus}{' '}
                  {quoteStatus.includes('cart') && (
                    <button
                      type="button"
                      onClick={() => navigate('/cart')}
                      className="underline text-[#006bd6] ml-1 cursor-pointer"
                    >
                      View Cart
                    </button>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Reference Pricing Tables */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#f5f5f7] rounded-2xl p-6 border border-[#e5e5ea]">
              <h3 className="text-lg font-bold text-[#1d1d1f] mb-4">Unit Hardware &amp; Mobility Pricing</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm tabular-nums">
                  <thead>
                    <tr className="border-b border-[#d2d2d7] text-[#6e6e73] font-semibold">
                      <th scope="col" className="py-2.5 pr-3">Model / Add-On</th>
                      <th scope="col" className="py-2.5 px-3">Configuration</th>
                      <th scope="col" className="py-2.5 pl-3 text-right">Price (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5ea] text-[#1d1d1f]">
                    <tr>
                      <th scope="row" className="py-2.5 pr-3 font-semibold">17&Prime; Compact Standard</th>
                      <td className="py-2.5 px-3 text-[#6e6e73]">17&Prime; (5:4) 400+ nit Privacy IPS, HDMI FOH</td>
                      <td className="py-2.5 pl-3 text-right font-bold">PKR 160,000</td>
                    </tr>
                    <tr>
                      <th scope="row" className="py-2.5 pr-3 font-semibold">17&Prime; Compact Smart</th>
                      <td className="py-2.5 px-3 text-[#6e6e73]">17&Prime; (5:4) Privacy IPS + Built-in Mini PC</td>
                      <td className="py-2.5 pl-3 text-right font-bold">PKR 220,000</td>
                    </tr>
                    <tr>
                      <th scope="row" className="py-2.5 pr-3 font-semibold">22&Prime; Flagship Standard</th>
                      <td className="py-2.5 px-3 text-[#6e6e73]">22&Prime; Widescreen 400+ nit Privacy IPS, HDMI</td>
                      <td className="py-2.5 pl-3 text-right font-bold">PKR 220,000</td>
                    </tr>
                    <tr>
                      <th scope="row" className="py-2.5 pr-3 font-semibold">22&Prime; Flagship Smart</th>
                      <td className="py-2.5 px-3 text-[#6e6e73]">22&Prime; Widescreen Privacy IPS + Mini PC</td>
                      <td className="py-2.5 pl-3 text-right font-bold">PKR 280,000</td>
                    </tr>
                    <tr>
                      <th scope="row" className="py-2.5 pr-3 font-semibold">17&Prime; EVA Briefcase</th>
                      <td className="py-2.5 px-3 text-[#6e6e73]">Hard aluminium exterior, CNC EVA foam, handle</td>
                      <td className="py-2.5 pl-3 text-right font-bold">PKR 30,000</td>
                    </tr>
                    <tr>
                      <th scope="row" className="py-2.5 pr-3 font-semibold">22&Prime; EVA Trolley Case</th>
                      <td className="py-2.5 px-3 text-[#6e6e73]">Flight case, CNC EVA foam, trolley wheels</td>
                      <td className="py-2.5 pl-3 text-right font-bold">PKR 40,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#f5f5f7] rounded-2xl p-6 border border-[#e5e5ea]">
              <h3 className="text-lg font-bold text-[#1d1d1f] mb-4">
                Combined 2-Unit Packages (1&times; 17&Prime; + 1&times; 22&Prime;)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm tabular-nums">
                  <thead>
                    <tr className="border-b border-[#d2d2d7] text-[#6e6e73] font-semibold">
                      <th scope="col" className="py-2.5 pr-3">Package Option</th>
                      <th scope="col" className="py-2.5 px-3 text-right">Product Only</th>
                      <th scope="col" className="py-2.5 pl-3 text-right">With EVA Cases</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5ea] text-[#1d1d1f]">
                    <tr>
                      <th scope="row" className="py-3 pr-3 font-semibold">
                        Option A — Standard Pair
                        <span className="block font-normal text-xs text-[#6e6e73]">17&Prime; Std + 22&Prime; Std (HDMI)</span>
                      </th>
                      <td className="py-3 px-3 text-right font-bold">PKR 380,000</td>
                      <td className="py-3 pl-3 text-right font-bold">PKR 450,000</td>
                    </tr>
                    <tr>
                      <th scope="row" className="py-3 pr-3 font-semibold">
                        Option B — Mixed Pair
                        <span className="block font-normal text-xs text-[#6e6e73]">1&times; Standard + 1&times; Standalone Smart</span>
                      </th>
                      <td className="py-3 px-3 text-right font-bold">PKR 440,000</td>
                      <td className="py-3 pl-3 text-right font-bold">PKR 510,000</td>
                    </tr>
                    <tr>
                      <th scope="row" className="py-3 pr-3 font-semibold">
                        Option C — Smart Pair
                        <span className="block font-normal text-xs text-[#6e6e73]">17&Prime; Smart + 22&Prime; Smart (Mini PC)</span>
                      </th>
                      <td className="py-3 px-3 text-right font-bold">PKR 500,000</td>
                      <td className="py-3 pl-3 text-right font-bold">PKR 570,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[#6e6e73] mt-4 leading-relaxed">
                Each unit includes the 1.2&Prime; matte-black aluminium unibody base, 400+ nit privacy IPS display,
                anti-spill baffle rim, frameless 70&deg; 60/40 AR glass, AC power adapter, and HDMI cable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Warranty, QA & Live Optical Demo */}
      <section id="warranty" className="py-14 sm:py-16 bg-[#f5f5f7] border-t border-[#e5e5ea]" aria-labelledby="warranty-title">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <p className="text-xs sm:text-sm font-semibold text-[#bf4800] mb-2">Commercial Terms &amp; Quality Assurance</p>
            <h2
              id="warranty-title"
              className="text-2xl sm:text-4xl font-bold tracking-[-0.025em] text-[#1d1d1f] [text-wrap:balance]"
            >
              One-year hardware warranty and stage-light optical handover.
            </h2>
            <p className="mt-3 text-base text-[#6e6e73]">
              Fabricated and aligned in Lahore with an on-site podium walkthrough or insured nationwide courier dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <article className="bg-white rounded-2xl p-6 border border-[#e5e5ea]">
              <p className="text-xs font-semibold text-[#248a3d]">1-Year Coverage</p>
              <h3 className="text-base font-bold text-[#1d1d1f] mt-1">Hardware &amp; Micro-Hinge Warranty</h3>
              <p className="text-sm text-[#6e6e73] mt-2 leading-relaxed">
                Comprehensive 1-year warranty covering chassis hardware, the 400+ nit IPS display panel, and dual
                precision front micro-hinges. Excludes physical optical glass breakage or liquid damage.
              </p>
            </article>

            <article className="bg-white rounded-2xl p-6 border border-[#e5e5ea]">
              <p className="text-xs font-semibold text-[#006bd6]">70% / 30% Schedule</p>
              <h3 className="text-base font-bold text-[#1d1d1f] mt-1">Payment &amp; Proposal Validity</h3>
              <p className="text-sm text-[#6e6e73] mt-2 leading-relaxed">
                70% advance payment upon Purchase Order confirmation; 30% balance payable upon pre-delivery QC
                inspection and handover. PKR prices remain valid for 15 calendar days from 19 November 2026.
              </p>
            </article>

            <article className="bg-white rounded-2xl p-6 border border-[#e5e5ea]">
              <p className="text-xs font-semibold text-[#006bd6]">20–25 Working Days</p>
              <h3 className="text-base font-bold text-[#1d1d1f] mt-1">Fabrication &amp; Delivery</h3>
              <p className="text-sm text-[#6e6e73] mt-2 leading-relaxed">
                Lead time of 20–25 working days in Lahore, including an on-site podium setup walkthrough. Nationwide
                insured courier shipping across Pakistan is available on actuals.
              </p>
            </article>

            <article className="bg-white rounded-2xl p-6 border border-[#e5e5ea]">
              <p className="text-xs font-semibold text-[#006bd6]">Pre-Handover QA</p>
              <h3 className="text-base font-bold text-[#1d1d1f] mt-1">Stage-Light Optical Alignment</h3>
              <p className="text-sm text-[#6e6e73] mt-2 leading-relaxed">
                Every unit undergoes stage-light optical alignment prior to handover, verifying 80% speaker
                readability, 0% audience reflection, and 80% off-axis brightness spread reduction.
              </p>
            </article>

            <article className="bg-white rounded-2xl p-6 border border-[#e5e5ea]">
              <p className="text-xs font-semibold text-[#006bd6]">Net Commercial Pricing</p>
              <h3 className="text-base font-bold text-[#1d1d1f] mt-1">Taxes &amp; Duties</h3>
              <p className="text-sm text-[#6e6e73] mt-2 leading-relaxed">
                Quoted PKR totals represent net commercial hardware prices and exclude applicable government sales or
                withholding taxes unless explicitly stated on a formal FBR GST tax invoice.
              </p>
            </article>

            <article className="bg-[#1A2B4C] text-white rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-[#00B4D8]">Lahore, Karachi &amp; Islamabad</p>
                <h3 className="text-lg font-bold mt-1">Request a Live Optical Demo</h3>
                <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
                  Test the 60/40 AR optical clarity and &plusmn;30&deg; stealth privacy microlouver under live stage
                  lighting at our Johar Town, Lahore showroom.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <a
                  href="tel:+923390000921"
                  className="inline-flex items-center gap-1.5 bg-[#00B4D8] hover:bg-[#0096B4] text-white text-xs font-bold px-4 py-2.5 rounded-full transition-colors"
                >
                  <Phone size={14} />
                  <span>0339 0000 921</span>
                </a>
                <Link
                  to="/programs/quote"
                  className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-full transition-colors"
                >
                  <span>Official PO Quote</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          </div>

          {/* Related Category & Product Cross-Links */}
          <div className="mt-10 pt-8 border-t border-[#d2d2d7] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold text-[#006bd6]">
              <Link to="/category/video-conferencing" className="hover:underline">
                Video Conferencing Systems &rsaquo;
              </Link>
              <Link to="/category/boardroom-codecs" className="hover:underline">
                Boardroom Codecs &amp; Executive Stages &rsaquo;
              </Link>
              <Link to="/category/large-room" className="hover:underline">
                Large Boardroom Systems &rsaquo;
              </Link>
              <Link to="/category/touch-panels" className="hover:underline">
                Interactive Panels &amp; Stage Displays &rsaquo;
              </Link>
              <Link to="/room-designer" className="hover:underline">
                3D Room Designer &amp; LED Calculator &rsaquo;
              </Link>
            </div>
            <p className="text-xs text-[#6e6e73]">
              AV Live Communication &middot; Ref: AVL-PT-2026 &middot; Lahore, Pakistan
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

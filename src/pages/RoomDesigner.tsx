import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Download,
  ExternalLink,
  Layers,
  Mic,
  Monitor,
  RotateCcw,
  Ruler,
  ShoppingCart,
  SlidersHorizontal,
  Video,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useCurrency } from '../contexts/CurrencyContext';
import { CurrencySelector } from '../components/CurrencySelector';
import { db } from '../lib/firebase/client';
import { addToCart } from '../lib/cart';
import {
  ConferenceRoom3DCanvas,
  ConferenceRoom3DHandle,
  CameraPresetKey,
  RoomOverlayFlags,
} from '../components/ConferenceRoom3DCanvas';
import { ConferenceRoom2DPlan } from '../components/ConferenceRoom2DPlan';
import {
  DisplayMode,
  DisplaySizeInches,
  MeasurementUnit,
  ROOM_ENDPOINTS,
  ROOM_PRESETS,
  RoomDesignerState,
  RoomPresetId,
  SmdPitch,
  TableFinish,
  TableShape,
  WallAcousticStyle,
  computeRoomEngineering,
  createInitialRoomState,
  formatDim,
} from '../lib/room-designer-catalog';

type InspectorTab = 'room' | 'hardware' | 'bom';
type ViewportMode = '3d' | '2d';

const HASH_CODE_TO_PRESET: Record<string, RoomPresetId> = {
  focus: 'focus',
  smallroom: 'small',
  small: 'small',
  mediumroom: 'medium',
  medium: 'medium',
  largeroom: 'large',
  large: 'large',
  boardroom: 'executive',
  executive: 'executive',
  auditorium: 'auditorium',
};

function resolveInitialPresetFromLocation(): RoomPresetId {
  if (typeof window === 'undefined') return 'medium';
  const hashMatch = window.location.hash.match(/#\/room\/([a-z0-9_-]+)/i);
  if (hashMatch && HASH_CODE_TO_PRESET[hashMatch[1].toLowerCase()]) {
    return HASH_CODE_TO_PRESET[hashMatch[1].toLowerCase()];
  }
  const params = new URLSearchParams(window.location.search);
  const qRoom = params.get('room')?.toLowerCase();
  if (qRoom && HASH_CODE_TO_PRESET[qRoom]) {
    return HASH_CODE_TO_PRESET[qRoom];
  }
  return 'medium';
}

export function RoomDesigner() {
  const [state, setState] = useState<RoomDesignerState>(() =>
    createInitialRoomState(resolveInitialPresetFromLocation())
  );
  const [unit, setUnit] = useState<MeasurementUnit>('m');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('3d');
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('room');
  const [cameraPreset, setCameraPreset] = useState<CameraPresetKey>('iso');
  const [presetNonce, setPresetNonce] = useState(0);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [overlays, setOverlays] = useState<RoomOverlayFlags>({
    showCameraFov: true,
    showMicZones: true,
    showViewingZone: true,
    showSeatStatus: true,
  });

  const [cartNotice, setCartNotice] = useState<string | null>(null);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyForm, setSurveyForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    notes: '',
  });
  const [surveySubmitting, setSurveySubmitting] = useState(false);
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  const [surveyError, setSurveyError] = useState<string | null>(null);

  const canvas3DRef = useRef<ConferenceRoom3DHandle | null>(null);
  const { currency, formatPrice, formatExactPkr } = useCurrency();

  const report = useMemo(() => computeRoomEngineering(state), [state]);
  const activeEndpoint = useMemo(
    () => ROOM_ENDPOINTS.find((e) => e.slug === state.endpointSlug) || ROOM_ENDPOINTS[3],
    [state.endpointSlug]
  );

  // Sync preset hash route gently (#/room/mediumroom/1 style) without touching canonical path
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const presetObj = ROOM_PRESETS.find((p) => p.id === state.presetId);
    if (presetObj && window.location.pathname === '/room-designer') {
      const targetHash = `#/room/${presetObj.code}`;
      if (window.location.hash !== targetHash) {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${targetHash}`);
      }
    }
  }, [state.presetId]);

  const applyPreset = (id: RoomPresetId) => {
    setState(createInitialRoomState(id));
    setCameraPreset('iso');
    setPresetNonce((n) => n + 1);
  };

  const triggerCameraPreset = (preset: CameraPresetKey) => {
    setViewportMode('3d');
    setCameraPreset(preset);
    setPresetNonce((n) => n + 1);
    canvas3DRef.current?.setCameraPreset(preset);
  };

  const updateRoomDim = (field: 'roomWidthM' | 'roomLengthM' | 'ceilingHeightM', val: number) => {
    setState((prev) => {
      const next = { ...prev, [field]: val };
      // Keep table geometry safely inside updated room envelope
      next.tableWidthM = Math.min(next.tableWidthM, Math.max(0.9, next.roomWidthM - 1.2));
      next.tableLengthM = Math.min(next.tableLengthM, Math.max(1.2, next.roomLengthM - 1.7));
      next.tableOffsetFromWallM = Math.min(
        next.tableOffsetFromWallM,
        Math.max(0.8, next.roomLengthM - next.tableLengthM - 0.6)
      );
      return next;
    });
  };

  const handleSelectEndpoint = (slug: string) => {
    const dev = ROOM_ENDPOINTS.find((e) => e.slug === slug);
    if (!dev) return;
    setState((prev) => ({
      ...prev,
      endpointSlug: slug,
      expansionMics: Math.min(prev.expansionMics, dev.maxExpansionMics),
      includeCeilingMic: dev.supportsCeilingMic ? prev.includeCeilingMic : false,
      displayMode:
        !dev.supportsDualDisplay && prev.displayMode === 'dual' ? 'single' : prev.displayMode,
    }));
  };

  const handleAddBomToCart = () => {
    report.bomItems.forEach((item) => {
      addToCart(
        {
          id: item.id,
          name: item.name,
          price: item.unitPricePkr,
          image: activeEndpoint.image,
          brand: item.brand,
        },
        item.qty
      );
    });
    setCartNotice(
      `Added ${report.bomItems.length} room line items (${formatPrice(report.totalPkr)}) to your cart.`
    );
    window.setTimeout(() => setCartNotice(null), 5000);
  };

  const handleDownloadArchitecturalPdf = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    // Top Branded Header
    doc.setFillColor(26, 43, 76);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('AV LIVE COMMUNICATIONS', 14, 13);
    doc.setFontSize(10);
    doc.setTextColor(0, 180, 216);
    doc.text('3D Conference Room Blueprint, Acoustic Coverage & BoM Quotation', 14, 20);

    doc.setTextColor(220, 230, 240);
    doc.setFontSize(8.5);
    doc.text(`Ref: AVL-${Math.floor(100000 + Math.random() * 900000)}`, 160, 13);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 19);

    let y = 36;

    // Optional live 3D snapshot capture
    const snapshot = canvas3DRef.current?.captureSnapshot();
    if (snapshot) {
      try {
        doc.addImage(snapshot, 'JPEG', 14, y, 182, 86);
        y += 92;
      } catch {
        // Ignore if WebGL buffer cannot be read
      }
    }

    // Room & Engineering Telemetry Summary
    doc.setTextColor(26, 43, 76);
    doc.setFontSize(12);
    doc.text('1. Architectural Room & Engineering Summary', 14, y);
    y += 7;

    doc.setFontSize(9.5);
    doc.setTextColor(50, 60, 75);
    const summaryLines = [
      `Room Dimensions: ${formatDim(state.roomWidthM, unit)} W x ${formatDim(
        state.roomLengthM,
        unit
      )} L x ${formatDim(state.ceilingHeightM, unit)} H (${report.areaSqM} m² / ${report.areaSqFt} sq ft)`,
      `Table & Seating: ${state.seats} Seats · ${state.tableShape.toUpperCase()} (${formatDim(
        state.tableLengthM,
        unit
      )} x ${formatDim(state.tableWidthM, unit)}) · Front Clearance ${formatDim(report.frontClearanceM, unit)}`,
      `Primary Video System: ${activeEndpoint.name} (${activeEndpoint.mpn}) · ${activeEndpoint.fovDeg}° FOV`,
      `Display Configuration: ${
        state.displayMode === 'smd-wall'
          ? `${state.smdPitch} SMD Wall (${report.smdStats.cols}x${report.smdStats.rows} = ${report.smdStats.totalCabinets} cabinets, ${report.smdStats.nativeResX}x${report.smdStats.nativeResY} px, ${report.smdStats.weightKg} kg)`
          : `${state.displayMode === 'dual' ? 'Dual' : 'Single'} ${state.displaySizeInches}" Commercial 4K Display`
      }`,
      `Readiness Metrics: Camera Framing ${report.fovCoveragePct}% (${report.seatsInFovCount}/${report.seatPoints.length} seats) · Mic Coverage ${report.micCoveragePct}% · Max Viewer ${report.furthestSeatDistM}m`,
    ];

    summaryLines.forEach((line) => {
      doc.text(line, 14, y);
      y += 5.5;
    });

    y += 5;
    doc.setTextColor(26, 43, 76);
    doc.setFontSize(12);
    doc.text('2. Hardware & Engineering Bill of Materials (BoM)', 14, y);
    y += 6;

    // BOM Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFontSize(8.5);
    doc.setTextColor(26, 43, 76);
    doc.text('Item / Model', 16, y + 4.8);
    doc.text('MPN', 106, y + 4.8);
    doc.text('Qty', 136, y + 4.8);
    doc.text(`Subtotal (${currency})`, 155, y + 4.8);
    y += 10;

    doc.setTextColor(30, 41, 59);
    report.bomItems.forEach((item) => {
      if (y > 268) {
        doc.addPage();
        y = 20;
      }
      const title = item.name.length > 52 ? `${item.name.slice(0, 49)}...` : item.name;
      doc.text(title, 16, y);
      doc.text(item.mpn, 106, y);
      doc.text(String(item.qty), 138, y);
      doc.text(formatPrice(item.lineTotalPkr), 155, y);
      y += 6;
    });

    y += 4;
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, 196, y);
    y += 7;
    doc.setFontSize(11);
    doc.setTextColor(26, 43, 76);
    const totalLine =
      currency === 'PKR'
        ? `Total Turnkey Room Estimate: ${formatExactPkr(report.totalPkr)} PKR`
        : `Total Turnkey Estimate: ${formatPrice(report.totalPkr, { withCode: true })} (Base: ${formatExactPkr(
            report.totalPkr
          )} PKR)`;
    doc.text(totalLine, 14, y);

    y += 7;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'AV Live Communications · Johar Town Block N, Lahore | Clifton, Karachi | Blue Area, Islamabad · +92 321 4256263',
      14,
      y
    );

    doc.save(`AV_Live_Conference_Room_${state.presetId.toUpperCase()}.pdf`);
  };

  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyForm.name.trim() || !surveyForm.email.trim()) return;
    setSurveySubmitting(true);
    setSurveyError(null);
    try {
      // Strictly adhere to the 11-key Firestore validation blueprint in firestore.rules
      await addDoc(collection(db, 'wizard_leads'), {
        customerName: surveyForm.name.trim().slice(0, 200),
        email: surveyForm.email.trim().slice(0, 200),
        company: surveyForm.company.trim().slice(0, 200),
        phone: surveyForm.phone.trim().slice(0, 50),
        notes: `${surveyForm.notes.trim()} | Room ${state.roomWidthM}x${state.roomLengthM}x${state.ceilingHeightM}m, ${state.seats} seats, ${state.displayMode}`.slice(
          0,
          2000
        ),
        answers: {
          roomSize: `${state.presetId} (${state.seats} seats · ${state.roomWidthM}x${state.roomLengthM}m)`,
          equipmentFocus: `${activeEndpoint.name} (${activeEndpoint.mpn})`,
          layoutStyle: `${state.tableShape} · ${
            state.displayMode === 'smd-wall'
              ? `${state.smdWidthM}x${state.smdHeightM}m ${state.smdPitch} SMD`
              : `${state.displayMode} ${state.displaySizeInches}"`
          }`,
        },
        recommendedBundle: `${activeEndpoint.name} + ${
          state.displayMode === 'smd-wall'
            ? `${state.smdPitch} SMD Wall`
            : `${state.displayMode} ${state.displaySizeInches}" 4K`
        }`.slice(0, 200),
        selectedAddons: report.bomItems.slice(0, 20).map((b) => `${b.qty}x ${b.mpn}`),
        totalProjectEstimate: report.totalPkr,
        createdAt: serverTimestamp(),
        status: 'new',
      });
      setSurveySubmitted(true);
      setSurveyForm({ name: '', email: '', company: '', phone: '', notes: '' });
    } catch (err) {
      console.error('Failed to submit room survey:', err);
      setSurveyError('Could not save your request right now. Please call +92 321 4256263.');
    } finally {
      setSurveySubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-6 lg:py-8 text-[#1A2B4C]">
      <SEO
        title="3D Conference Room Designer & AV Planner | AV Live"
        description="Configure your meeting room dimensions, seating capacity & camera/microphone coverage with the AV Live interactive boardroom planner."
        url="https://avlive.com.pk/room-designer"
        image="https://avlive.com.pk/images/video-conference/boardroom-hero.webp"
        imageAlt="Interactive 3D Conference Room Designer & SMD LED Wall Planner"
        schema={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebApplication',
              '@id': 'https://avlive.com.pk/room-designer#app',
              name: 'AV Live 3D Conference Room Designer & Acoustic BoM Calculator',
              url: 'https://avlive.com.pk/room-designer',
              applicationCategory: 'DesignApplication',
              operatingSystem: 'All',
              description:
                'Interactive 3D conference room planner and AV Bill of Materials (BoM) calculator for Pakistani enterprises.',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'PKR' },
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://avlive.com.pk' },
                { '@type': 'ListItem', position: 2, name: 'Room Designer', item: 'https://avlive.com.pk/room-designer' },
              ],
            },
          ],
        }}
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Solutions', path: '/solutions' }, { label: '3D Conference Room Designer' }]} />

        {/* Cart Confirmation Notice */}
        {cartNotice && (
          <div className="mb-4 bg-[#1A2B4C] text-white px-5 py-3 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5 text-sm font-medium">
              <CheckCircle2 size={18} className="text-[#00B4D8] shrink-0" />
              <span>{cartNotice}</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/cart"
                className="px-3.5 py-1.5 bg-[#00B4D8] hover:bg-[#009bc2] text-white rounded-lg text-xs font-bold whitespace-nowrap"
              >
                Open Cart
              </Link>
              <button
                type="button"
                onClick={() => setCartNotice(null)}
                aria-label="Dismiss notification"
                className="text-slate-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Header Strip */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1.5">
              <Link to="/solutions" className="text-[#00B4D8] hover:underline">
                Enterprise AV Solutions
              </Link>
              <span aria-hidden="true">·</span>
              <span>Interactive Spatial Configurator</span>
              <span aria-hidden="true">·</span>
              <span>500×500mm SMD &amp; UC Sizing</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1A2B4C]">
              3D Conference Room Designer &amp; AV Planner
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1.5 max-w-3xl">
              Model your room architecture, seating layout, camera field of view, beamforming microphone coverage, and commercial display or SMD LED video wall with live Bill of Materials pricing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="inline-flex items-center bg-white border border-slate-200 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setUnit('m')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  unit === 'm' ? 'bg-[#1A2B4C] text-white' : 'text-slate-600 hover:text-[#1A2B4C]'
                }`}
              >
                Meters (m)
              </button>
              <button
                type="button"
                onClick={() => setUnit('ft')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  unit === 'ft' ? 'bg-[#1A2B4C] text-white' : 'text-slate-600 hover:text-[#1A2B4C]'
                }`}
              >
                Feet (ft)
              </button>
            </div>
            <CurrencySelector variant="pill" />
            <button
              type="button"
              onClick={handleDownloadArchitecturalPdf}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A2B4C] hover:bg-[#0f1c33] text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
            >
              <Download size={14} />
              Export 3D Spec PDF
            </button>
          </div>
        </div>

        {/* Room Archetype Preset Bar (Webex Designer Room Selector Strip) */}
        <div
          role="tablist"
          aria-label="Conference room templates"
          className="bg-white border border-slate-200 rounded-xl p-1.5 mb-5 flex items-center gap-1.5 overflow-x-auto"
        >
          {ROOM_PRESETS.map((preset) => {
            const active = state.presetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => applyPreset(preset.id)}
                className={`flex-1 min-w-[140px] text-left px-3.5 py-2.5 rounded-lg transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#1A2B4C] text-white shadow-xs'
                    : 'bg-transparent text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs font-bold leading-tight">{preset.label}</div>
                <div
                  className={`text-[11px] mt-0.5 tabular-nums ${
                    active ? 'text-[#7dd3fc]' : 'text-slate-500'
                  }`}
                >
                  {preset.capacityLabel} · {formatDim(preset.roomWidthM, unit)}×{formatDim(preset.roomLengthM, unit)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Studio Workspace Split: Unobstructed Viewport + Structured Right Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left 8 Cols: 3D / 2D Interactive Canvas */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col relative min-h-[500px] lg:h-[660px]">
            {/* Top Viewport Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white border-b border-slate-200 z-10">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 tabular-nums">
                <span className="font-bold text-[#1A2B4C]">
                  {formatDim(state.roomWidthM, unit)} × {formatDim(state.roomLengthM, unit)} ×{' '}
                  {formatDim(state.ceilingHeightM, unit)}
                </span>
                <span aria-hidden="true">·</span>
                <span>{state.seats} Seats</span>
                <span aria-hidden="true">·</span>
                <span>
                  Camera FOV:{' '}
                  <strong className={report.fovCoveragePct === 100 ? 'text-emerald-700' : 'text-amber-700'}>
                    {report.fovCoveragePct}%
                  </strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Mic Pickup:{' '}
                  <strong className={report.micCoveragePct === 100 ? 'text-emerald-700' : 'text-amber-700'}>
                    {report.micCoveragePct}%
                  </strong>
                </span>
              </div>

              <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewportMode('3d')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    viewportMode === '3d' ? 'bg-white text-[#1A2B4C] shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <Box size={13} />
                  3D View
                </button>
                <button
                  type="button"
                  onClick={() => setViewportMode('2d')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    viewportMode === '2d' ? 'bg-white text-[#1A2B4C] shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <Ruler size={13} />
                  2D Floorplan
                </button>
              </div>
            </div>

            {/* Canvas Body */}
            <div className="relative flex-1 min-h-[420px] bg-[#f1f5f9]">
              {viewportMode === '3d' ? (
                <ConferenceRoom3DCanvas
                  ref={canvas3DRef}
                  state={state}
                  report={report}
                  overlays={overlays}
                  cameraPreset={cameraPreset}
                  presetNonce={presetNonce}
                  onWebglFallback={() => setViewportMode('2d')}
                />
              ) : (
                <ConferenceRoom2DPlan
                  state={state}
                  report={report}
                  overlays={overlays}
                  unit={unit}
                />
              )}

              {/* Unified Collapsible Bottom Control Dock (Solid Surface — No backdrop-blur over WebGL) */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[96%] max-w-[780px] z-20 flex flex-col items-center pointer-events-none">
                <button
                  type="button"
                  onClick={() => setDockCollapsed((c) => !c)}
                  className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-white bg-[#1A2B4C] hover:bg-[#253b66] rounded-t-lg border border-b-0 border-white/15"
                >
                  {dockCollapsed ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  {dockCollapsed ? 'Show Controls' : 'Hide Controls'}
                </button>

                {!dockCollapsed && (
                  <div className="pointer-events-auto w-full bg-[#1A2B4C] text-white rounded-xl border border-white/15 px-3 py-2.5 shadow-lg flex flex-wrap items-center justify-between gap-2.5">
                    {/* Camera Presets */}
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[11px] text-slate-300 font-medium mr-1 hidden sm:inline">
                        View:
                      </span>
                      {(
                        [
                          { id: 'iso', label: '3D Corner' },
                          { id: 'front', label: 'Camera POV' },
                          { id: 'top', label: 'Top Plan' },
                          { id: 'seat', label: 'Eye-Level' },
                        ] as { id: CameraPresetKey; label: string }[]
                      ).map((cam) => (
                        <button
                          key={cam.id}
                          type="button"
                          onClick={() => triggerCameraPreset(cam.id)}
                          className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap ${
                            viewportMode === '3d' && cameraPreset === cam.id
                              ? 'bg-[#00B4D8] text-white'
                              : 'bg-white/10 text-slate-200 hover:bg-white/20'
                          }`}
                        >
                          {cam.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => triggerCameraPreset('iso')}
                        aria-label="Reset camera view"
                        className="p-1.5 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-md"
                      >
                        <RotateCcw size={13} />
                      </button>
                    </div>

                    {/* Spatial Overlays */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setOverlays((o) => ({ ...o, showCameraFov: !o.showCameraFov }))}
                        className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md border transition-colors whitespace-nowrap ${
                          overlays.showCameraFov
                            ? 'bg-[#0284c7]/30 border-[#38bdf8] text-[#bae6fd]'
                            : 'bg-transparent border-white/20 text-slate-300'
                        }`}
                      >
                        Camera FOV
                      </button>
                      <button
                        type="button"
                        onClick={() => setOverlays((o) => ({ ...o, showMicZones: !o.showMicZones }))}
                        className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md border transition-colors whitespace-nowrap ${
                          overlays.showMicZones
                            ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                            : 'bg-transparent border-white/20 text-slate-300'
                        }`}
                      >
                        Mic Pickup
                      </button>
                      <button
                        type="button"
                        onClick={() => setOverlays((o) => ({ ...o, showViewingZone: !o.showViewingZone }))}
                        className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md border transition-colors whitespace-nowrap ${
                          overlays.showViewingZone
                            ? 'bg-indigo-500/25 border-indigo-400 text-indigo-200'
                            : 'bg-transparent border-white/20 text-slate-300'
                        }`}
                      >
                        4/6/8 Zone
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Tabbed Architectural & AV Configurator */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl flex flex-col lg:h-[660px] overflow-hidden">
            {/* Inspector Tabs */}
            <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 p-1.5 gap-1">
              {(
                [
                  { id: 'room', label: 'Room & Table', icon: Compass },
                  { id: 'hardware', label: 'AV & Displays', icon: Video },
                  { id: 'bom', label: 'BoM & Quote', icon: Layers },
                ] as { id: InspectorTab; label: string; icon: React.ElementType }[]
              ).map((tab) => {
                const Icon = tab.icon;
                const active = inspectorTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setInspectorTab(tab.id)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-white text-[#1A2B4C] shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-[#1A2B4C]'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Inspector Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {inspectorTab === 'room' && (
                <>
                  {/* Room Envelope Dimensions */}
                  <div className="space-y-4">
                    <h2 className="text-sm font-bold text-[#1A2B4C] border-b border-slate-100 pb-2">
                      Room Architecture Dimensions
                    </h2>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <label htmlFor="room-width">Room Width</label>
                        <span className="font-mono tabular-nums text-[#1A2B4C]">
                          {formatDim(state.roomWidthM, unit)}
                        </span>
                      </div>
                      <input
                        id="room-width"
                        type="range"
                        min="3"
                        max="14"
                        step="0.2"
                        value={state.roomWidthM}
                        onChange={(e) => updateRoomDim('roomWidthM', parseFloat(e.target.value))}
                        className="w-full accent-[#00B4D8]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <label htmlFor="room-length">Room Depth (Display to Back Wall)</label>
                        <span className="font-mono tabular-nums text-[#1A2B4C]">
                          {formatDim(state.roomLengthM, unit)}
                        </span>
                      </div>
                      <input
                        id="room-length"
                        type="range"
                        min="3.4"
                        max="18"
                        step="0.2"
                        value={state.roomLengthM}
                        onChange={(e) => updateRoomDim('roomLengthM', parseFloat(e.target.value))}
                        className="w-full accent-[#00B4D8]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <label htmlFor="room-ceiling">Ceiling Height</label>
                        <span className="font-mono tabular-nums text-[#1A2B4C]">
                          {formatDim(state.ceilingHeightM, unit)}
                        </span>
                      </div>
                      <input
                        id="room-ceiling"
                        type="range"
                        min="2.5"
                        max="6"
                        step="0.1"
                        value={state.ceilingHeightM}
                        onChange={(e) => updateRoomDim('ceilingHeightM', parseFloat(e.target.value))}
                        className="w-full accent-[#00B4D8]"
                      />
                    </div>
                  </div>

                  {/* Table Geometry & Seating */}
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <h2 className="text-sm font-bold text-[#1A2B4C]">Table &amp; Seating Layout</h2>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-2">
                        Table Shape
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(
                          [
                            { id: 'boat', label: 'Boat' },
                            { id: 'rectangle', label: 'Rectangle' },
                            { id: 'oval', label: 'Oval' },
                            { id: 'u-shape', label: 'U-Shape' },
                            { id: 'classroom', label: 'Classroom' },
                          ] as { id: TableShape; label: string }[]
                        ).map((shape) => (
                          <button
                            key={shape.id}
                            type="button"
                            onClick={() => setState((p) => ({ ...p, tableShape: shape.id }))}
                            className={`px-2.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                              state.tableShape === shape.id
                                ? 'bg-[#1A2B4C] text-white border-[#1A2B4C]'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-[#00B4D8]'
                            }`}
                          >
                            {shape.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <label htmlFor="seat-count">Participant Seats</label>
                        <span className="font-mono tabular-nums text-[#1A2B4C]">{state.seats} Seats</span>
                      </div>
                      <input
                        id="seat-count"
                        type="range"
                        min="2"
                        max="30"
                        step="1"
                        value={state.seats}
                        onChange={(e) => setState((p) => ({ ...p, seats: parseInt(e.target.value, 10) }))}
                        className="w-full accent-[#00B4D8]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <label htmlFor="table-length">Table Length</label>
                          <span className="font-mono tabular-nums">{formatDim(state.tableLengthM, unit)}</span>
                        </div>
                        <input
                          id="table-length"
                          type="range"
                          min="1.2"
                          max={Math.max(1.8, Number((state.roomLengthM - 1.8).toFixed(1)))}
                          step="0.2"
                          value={state.tableLengthM}
                          onChange={(e) =>
                            setState((p) => ({ ...p, tableLengthM: parseFloat(e.target.value) }))
                          }
                          className="w-full accent-[#00B4D8]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <label htmlFor="table-width">Table Width</label>
                          <span className="font-mono tabular-nums">{formatDim(state.tableWidthM, unit)}</span>
                        </div>
                        <input
                          id="table-width"
                          type="range"
                          min="0.9"
                          max={Math.max(1.2, Number((state.roomWidthM - 1.2).toFixed(1)))}
                          step="0.1"
                          value={state.tableWidthM}
                          onChange={(e) =>
                            setState((p) => ({ ...p, tableWidthM: parseFloat(e.target.value) }))
                          }
                          className="w-full accent-[#00B4D8]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <label htmlFor="table-offset">Display-to-Table Offset</label>
                        <span className="font-mono tabular-nums">
                          {formatDim(state.tableOffsetFromWallM, unit)}
                        </span>
                      </div>
                      <input
                        id="table-offset"
                        type="range"
                        min="0.8"
                        max={Math.max(1.0, Number((state.roomLengthM - state.tableLengthM - 0.6).toFixed(1)))}
                        step="0.1"
                        value={state.tableOffsetFromWallM}
                        onChange={(e) =>
                          setState((p) => ({
                            ...p,
                            tableOffsetFromWallM: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full accent-[#00B4D8]"
                      />
                    </div>
                  </div>

                  {/* Surface Materials */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <h2 className="text-sm font-bold text-[#1A2B4C]">Finishes &amp; Wall Acoustics</h2>
                    <div className="grid grid-cols-4 gap-2">
                      {(
                        [
                          { id: 'oak', label: 'Oak', swatch: '#c89d6c' },
                          { id: 'walnut', label: 'Walnut', swatch: '#5d3d28' },
                          { id: 'birch', label: 'Birch', swatch: '#e3cfb2' },
                          { id: 'charcoal', label: 'Charcoal', swatch: '#2b303a' },
                        ] as { id: TableFinish; label: string; swatch: string }[]
                      ).map((fin) => (
                        <button
                          key={fin.id}
                          type="button"
                          onClick={() => setState((p) => ({ ...p, tableFinish: fin.id }))}
                          className={`p-2 rounded-lg border text-center transition-colors ${
                            state.tableFinish === fin.id
                              ? 'border-[#00B4D8] bg-slate-50 font-bold'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span
                            className="block w-5 h-5 rounded-full mx-auto mb-1 border border-black/15"
                            style={{ backgroundColor: fin.swatch }}
                          />
                          <span className="text-[11px]">{fin.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      {(
                        [
                          { id: 'slatted-wood', label: 'Wood Slats' },
                          { id: 'matte-plaster', label: 'Matte Wall' },
                          { id: 'glass-partition', label: 'Glass Wall' },
                        ] as { id: WallAcousticStyle; label: string }[]
                      ).map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() =>
                            setState((p) => ({
                              ...p,
                              wallStyle: w.id,
                              includeAcousticPanels: w.id === 'glass-partition' ? true : p.includeAcousticPanels,
                            }))
                          }
                          className={`px-2 py-2 text-xs font-semibold rounded-lg border whitespace-nowrap ${
                            state.wallStyle === w.id
                              ? 'bg-[#1A2B4C] text-white border-[#1A2B4C]'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-[#00B4D8]'
                          }`}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {inspectorTab === 'hardware' && (
                <>
                  {/* Display Wall Configurator */}
                  <div className="space-y-3">
                    <h2 className="text-sm font-bold text-[#1A2B4C] flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Monitor size={15} className="text-[#00B4D8]" />
                      Display Wall Configuration
                    </h2>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          { id: 'single', label: 'Single 4K' },
                          { id: 'dual', label: 'Dual 4K' },
                          { id: 'smd-wall', label: 'SMD LED Wall' },
                        ] as { id: DisplayMode; label: string }[]
                      ).map((dm) => {
                        const disabled = dm.id === 'dual' && !activeEndpoint.supportsDualDisplay;
                        return (
                          <button
                            key={dm.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => setState((p) => ({ ...p, displayMode: dm.id }))}
                            className={`px-2 py-2 text-xs font-semibold rounded-lg border whitespace-nowrap ${
                              state.displayMode === dm.id
                                ? 'bg-[#1A2B4C] text-white border-[#1A2B4C]'
                                : disabled
                                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-[#00B4D8]'
                            }`}
                          >
                            {dm.label}
                          </button>
                        );
                      })}
                    </div>

                    {state.displayMode === 'smd-wall' ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-[#1A2B4C]">
                          <span>500×500mm SMD LED Matrix</span>
                          <span className="font-mono tabular-nums text-[#00B4D8]">
                            {report.smdStats.cols}×{report.smdStats.rows} ({report.smdStats.totalCabinets} blocks)
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex justify-between text-[11px] font-semibold mb-1">
                              <label htmlFor="smd-w">Width</label>
                              <span className="font-mono tabular-nums">{state.smdWidthM}m</span>
                            </div>
                            <input
                              id="smd-w"
                              type="range"
                              min="1.5"
                              max={Math.min(12, Math.max(3, Math.floor((state.roomWidthM - 0.5) * 2) / 2))}
                              step="0.5"
                              value={state.smdWidthM}
                              onChange={(e) =>
                                setState((p) => ({ ...p, smdWidthM: parseFloat(e.target.value) }))
                              }
                              className="w-full accent-[#00B4D8]"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-[11px] font-semibold mb-1">
                              <label htmlFor="smd-h">Height</label>
                              <span className="font-mono tabular-nums">{state.smdHeightM}m</span>
                            </div>
                            <input
                              id="smd-h"
                              type="range"
                              min="1"
                              max={Math.min(5, Math.max(1.5, Math.floor((state.ceilingHeightM - 0.6) * 2) / 2))}
                              step="0.5"
                              value={state.smdHeightM}
                              onChange={(e) =>
                                setState((p) => ({ ...p, smdHeightM: parseFloat(e.target.value) }))
                              }
                              className="w-full accent-[#00B4D8]"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['P2.5', 'P2.9', 'P3.9'] as SmdPitch[]).map((pitch) => (
                            <button
                              key={pitch}
                              type="button"
                              onClick={() => setState((p) => ({ ...p, smdPitch: pitch }))}
                              className={`py-1.5 text-xs font-bold rounded-md border ${
                                state.smdPitch === pitch
                                  ? 'bg-[#00B4D8] text-white border-[#00B4D8]'
                                  : 'bg-white text-slate-700 border-slate-200'
                              }`}
                            >
                              {pitch}
                            </button>
                          ))}
                        </div>
                        <div className="text-[11px] text-slate-600 flex justify-between font-mono tabular-nums">
                          <span>
                            {report.smdStats.nativeResX}×{report.smdStats.nativeResY} px
                          </span>
                          <span>{report.smdStats.weightKg} kg load</span>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-5 gap-1.5">
                        {([55, 65, 75, 86, 98] as DisplaySizeInches[]).map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setState((p) => ({ ...p, displaySizeInches: sz }))}
                            className={`py-2 text-xs font-bold rounded-lg border tabular-nums ${
                              state.displaySizeInches === sz
                                ? 'bg-[#00B4D8] text-white border-[#00B4D8]'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-[#00B4D8]'
                            }`}
                          >
                            {sz}&quot;
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Video Conferencing System Selector */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <h2 className="text-sm font-bold text-[#1A2B4C] flex items-center gap-2">
                      <Video size={15} className="text-[#00B4D8]" />
                      Video Conference Codec / Bar
                    </h2>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {ROOM_ENDPOINTS.map((dev) => {
                        const selected = state.endpointSlug === dev.slug;
                        return (
                          <button
                            key={dev.slug}
                            type="button"
                            onClick={() => handleSelectEndpoint(dev.slug)}
                            className={`w-full text-left p-3 rounded-xl border transition-colors ${
                              selected
                                ? 'bg-[#1A2B4C]/5 border-[#00B4D8]'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="text-xs font-bold text-[#1A2B4C]">{dev.name}</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {dev.brand} · {dev.fovDeg}° FOV · {dev.micPickupM}m Mic
                                </div>
                              </div>
                              <div className="text-xs font-bold text-[#00B4D8] tabular-nums whitespace-nowrap">
                                {formatPrice(dev.unitPricePkr, { compact: true })}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Microphones & Room Engineering Add-ons */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-[#1A2B4C] flex items-center gap-2">
                        <Mic size={15} className="text-[#00B4D8]" />
                        Microphones &amp; Control
                      </h2>
                      {report.recommendedExpansionMics > state.expansionMics && (
                        <button
                          type="button"
                          onClick={() =>
                            setState((p) => ({
                              ...p,
                              expansionMics: report.recommendedExpansionMics,
                            }))
                          }
                          className="text-[11px] font-bold text-[#00B4D8] hover:underline"
                        >
                          Auto-add {report.recommendedExpansionMics} pod(s)
                        </button>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <label htmlFor="exp-mics">
                          Table Expansion Mic Pods (Max {activeEndpoint.maxExpansionMics})
                        </label>
                        <span className="font-mono tabular-nums">{state.expansionMics} Pods</span>
                      </div>
                      <input
                        id="exp-mics"
                        type="range"
                        min="0"
                        max={activeEndpoint.maxExpansionMics}
                        step="1"
                        disabled={activeEndpoint.maxExpansionMics === 0}
                        value={state.expansionMics}
                        onChange={(e) =>
                          setState((p) => ({ ...p, expansionMics: parseInt(e.target.value, 10) }))
                        }
                        className="w-full accent-[#00B4D8]"
                      />
                    </div>

                    <div className="space-y-2 text-xs">
                      {activeEndpoint.supportsCeilingMic && (
                        <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                          <span className="font-semibold text-slate-700">
                            Ceiling Beamforming Mic Tile (Dante PoE+)
                          </span>
                          <input
                            type="checkbox"
                            checked={state.includeCeilingMic}
                            onChange={(e) =>
                              setState((p) => ({ ...p, includeCeilingMic: e.target.checked }))
                            }
                            className="accent-[#00B4D8] w-4 h-4"
                          />
                        </label>
                      )}

                      {!activeEndpoint.includesTouchController && (
                        <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                          <span className="font-semibold text-slate-700">
                            Tabletop Touch Controller Console
                          </span>
                          <input
                            type="checkbox"
                            checked={state.includeTouchController}
                            onChange={(e) =>
                              setState((p) => ({ ...p, includeTouchController: e.target.checked }))
                            }
                            className="accent-[#00B4D8] w-4 h-4"
                          />
                        </label>
                      )}

                      <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                        <span className="font-semibold text-slate-700">
                          Architectural Acoustic Wall Panels (NRC 0.85)
                        </span>
                        <input
                          type="checkbox"
                          checked={state.includeAcousticPanels}
                          onChange={(e) =>
                            setState((p) => ({ ...p, includeAcousticPanels: e.target.checked }))
                          }
                          className="accent-[#00B4D8] w-4 h-4"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                        <span className="font-semibold text-slate-700">
                          Concealed Cabling &amp; On-Site Commissioning
                        </span>
                        <input
                          type="checkbox"
                          checked={state.includeInstallationKit}
                          onChange={(e) =>
                            setState((p) => ({ ...p, includeInstallationKit: e.target.checked }))
                          }
                          className="accent-[#00B4D8] w-4 h-4"
                        />
                      </label>
                    </div>
                  </div>
                </>
              )}

              {inspectorTab === 'bom' && (
                <>
                  {/* Engineering Diagnostics */}
                  <div className="space-y-2.5">
                    <h2 className="text-sm font-bold text-[#1A2B4C] flex items-center gap-2 border-b border-slate-100 pb-2">
                      <SlidersHorizontal size={15} className="text-[#00B4D8]" />
                      Room Readiness Diagnostics
                    </h2>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="font-medium text-slate-700">Camera FOV Coverage</span>
                        <span
                          className={`inline-flex items-center gap-1 font-bold tabular-nums ${
                            report.cameraFovStatus === 'pass' ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {report.cameraFovStatus === 'pass' ? (
                            <CheckCircle2 size={13} />
                          ) : (
                            <AlertTriangle size={13} />
                          )}
                          {report.seatsInFovCount}/{report.seatPoints.length} Seats ({report.fovCoveragePct}%)
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="font-medium text-slate-700">Acoustic Mic Pickup</span>
                        <span
                          className={`inline-flex items-center gap-1 font-bold tabular-nums ${
                            report.micCoverageStatus === 'pass' ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {report.micCoverageStatus === 'pass' ? (
                            <CheckCircle2 size={13} />
                          ) : (
                            <AlertTriangle size={13} />
                          )}
                          {report.seatsInMicCount}/{report.seatPoints.length} Seats ({report.micCoveragePct}%)
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="font-medium text-slate-700">Display Sightline (4/6/8 Rule)</span>
                        <span
                          className={`inline-flex items-center gap-1 font-bold tabular-nums ${
                            report.displaySizingStatus === 'pass' ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {report.displaySizingStatus === 'pass' ? (
                            <CheckCircle2 size={13} />
                          ) : (
                            <AlertTriangle size={13} />
                          )}
                          {report.displaySizingStatus === 'pass'
                            ? `Optimal (${report.furthestSeatDistM}m max)`
                            : report.displaySizingStatus === 'undersized'
                            ? `Increase Size (${report.furthestSeatDistM}m > ${report.maxViewingDistM}m)`
                            : `Close (${report.nearestSeatDistM}m < ${report.minViewingDistM}m)`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="font-medium text-slate-700">Perimeter Walkways</span>
                        <span
                          className={`inline-flex items-center gap-1 font-bold tabular-nums ${
                            report.walkwayStatus === 'pass' ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {report.walkwayStatus === 'pass' ? 'Clear' : 'Tight Clearance'} (Side{' '}
                          {formatDim(report.sideClearanceM, unit)})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Itemized BOM */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <h2 className="text-sm font-bold text-[#1A2B4C]">
                      Itemized Room Bill of Materials ({report.bomItems.length})
                    </h2>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {report.bomItems.map((item) => (
                        <div key={item.id} className="p-3 bg-white flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#1A2B4C] leading-snug">
                              {item.href ? (
                                <Link
                                  to={item.href}
                                  className="hover:text-[#00B4D8] inline-flex items-center gap-1"
                                >
                                  <span>{item.name}</span>
                                  <ExternalLink size={11} className="shrink-0" />
                                </Link>
                              ) : (
                                item.name
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                              {item.mpn} · Qty {item.qty}
                            </div>
                          </div>
                          <div className="text-xs font-bold text-[#1A2B4C] tabular-nums whitespace-nowrap">
                            {formatPrice(item.lineTotalPkr)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Persistent Inspector Footer Pricing & Actions */}
            <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    Estimated Room Total ({currency})
                  </div>
                  {currency !== 'PKR' && (
                    <div className="text-[11px] text-slate-400 tabular-nums">
                      Base: {formatExactPkr(report.totalPkr)} PKR
                    </div>
                  )}
                </div>
                <div className="text-xl font-black text-[#1A2B4C] tabular-nums">
                  {formatPrice(report.totalPkr)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleAddBomToCart}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#00B4D8] hover:bg-[#009bc2] text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                >
                  <ShoppingCart size={14} />
                  Add Kit to Cart
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSurveySubmitted(false);
                    setSurveyError(null);
                    setShowSurveyModal(true);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#1A2B4C] hover:bg-[#0f1c33] text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                >
                  Book Site Survey
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Architectural KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500 font-medium">Floor Area &amp; Occupancy</div>
            <div className="text-xl font-bold text-[#1A2B4C] mt-1 tabular-nums">
              {report.areaSqM} m² ({report.areaSqFt} sq ft)
            </div>
            <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
              {state.seats} Seats · {state.tableShape} layout
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500 font-medium">Optical Framing Coverage</div>
            <div className="text-xl font-bold text-[#1A2B4C] mt-1 tabular-nums">
              {report.fovCoveragePct}% ({report.seatsInFovCount}/{report.seatPoints.length})
            </div>
            <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
              {activeEndpoint.fovDeg}° FOV · Max dist {report.furthestSeatDistM}m
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500 font-medium">Acoustic Microphone Reach</div>
            <div className="text-xl font-bold text-[#1A2B4C] mt-1 tabular-nums">
              {report.micCoveragePct}% ({report.seatsInMicCount}/{report.seatPoints.length})
            </div>
            <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
              {report.micNodes.length} Active Pickup Zone{report.micNodes.length > 1 ? 's' : ''}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500 font-medium">
              {state.displayMode === 'smd-wall' ? '500×500mm SMD LED Wall' : 'Display Sightline Spec'}
            </div>
            <div className="text-xl font-bold text-[#1A2B4C] mt-1 tabular-nums">
              {state.displayMode === 'smd-wall'
                ? `${report.smdStats.totalCabinets} Cabinets (${report.smdStats.weightKg} kg)`
                : `${state.displayMode === 'dual' ? 'Dual' : 'Single'} ${state.displaySizeInches}" 4K`}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
              {state.displayMode === 'smd-wall'
                ? `${report.smdStats.nativeResX}×${report.smdStats.nativeResY} px (${state.smdPitch})`
                : `4/6/8 Optimal: ${report.minViewingDistM}m – ${report.maxViewingDistM}m`}
            </div>
          </div>
        </div>

        {/* Answer-First Engineering Verdict & Reference Tables (Preserves SEO/AEO Parity) */}
        <div className="mt-10 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="border border-slate-200 bg-slate-50 rounded-xl p-5">
            <h2 className="text-sm font-bold text-[#00B4D8] uppercase tracking-wider mb-1.5">
              Answer-First Boardroom &amp; SMD Engineering Verdict
            </h2>
            <p className="text-sm text-[#1A2B4C] leading-relaxed font-medium">
              Every AV Live conference room and SMD video wall integrates calibrated{' '}
              <Link to="/product/poly-studio-x52-pakistan" className="text-[#00B4D8] font-bold hover:underline">
                HP Poly Studio X52
              </Link>
              ,{' '}
              <Link to="/product/polycom-realpresence-group-500-pakistan" className="text-[#00B4D8] font-bold hover:underline">
                Polycom Group 500
              </Link>
              ,{' '}
              <Link to="/product/cisco-room-kit-plus-pakistan" className="text-[#00B4D8] font-bold hover:underline">
                Cisco Room Kit Plus
              </Link>
              , and{' '}
              <Link to="/product/logitech-rally-bar-pakistan" className="text-[#00B4D8] font-bold hover:underline">
                Logitech Rally Bar
              </Link>{' '}
              codecs alongside precision 500×500mm die-cast SMD cabinets (7.5 kg per block, 3840Hz broadcast refresh) backed by nationwide acoustic surveys in Lahore, Karachi, and Islamabad.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs sm:text-sm tabular-nums">
              <caption className="bg-slate-50 text-[#1A2B4C] font-bold text-left px-4 py-3 text-xs uppercase tracking-wider border-b border-slate-200">
                500×500mm SMD LED Cabinet Pixel Pitch &amp; Reference Pricing Matrix ({currency})
              </caption>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <th className="py-3 px-4">Pixel Pitch</th>
                  <th className="py-3 px-4">Pixels per 500×500mm Cabinet</th>
                  <th className="py-3 px-4">Optimal Viewing Distance</th>
                  <th className="py-3 px-4">Reference Cabinet Price ({currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-bold text-[#1A2B4C]">P2.5 Indoor Fine-Pitch</td>
                  <td className="py-3 px-4 font-mono">200 × 200 px (40,000 px)</td>
                  <td className="py-3 px-4">2.5 Meters+ (Boardrooms &amp; Auditoriums)</td>
                  <td className="py-3 px-4 font-bold text-[#00B4D8]">{formatPrice(145000)} / Cabinet</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#1A2B4C]">P2.9 Indoor Broadcast</td>
                  <td className="py-3 px-4 font-mono">172 × 172 px (29,584 px)</td>
                  <td className="py-3 px-4">3.0 Meters+ (Corporate Stages &amp; Halls)</td>
                  <td className="py-3 px-4 font-bold text-[#00B4D8]">{formatPrice(125000)} / Cabinet</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#1A2B4C]">P3.9 High-Bright Event Stage</td>
                  <td className="py-3 px-4 font-mono">128 × 128 px (16,384 px)</td>
                  <td className="py-3 px-4">4.0 Meters+ (Expos, Concerts &amp; Outdoor)</td>
                  <td className="py-3 px-4 font-bold text-[#00B4D8]">{formatPrice(105000)} / Cabinet</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs font-bold">
            <h3 className="text-sm font-bold text-[#1A2B4C]">
              Explore Turnkey Boardroom &amp; Hybrid Architecture Hubs
            </h3>
            <div className="flex flex-wrap gap-4">
              <Link to="/video-conference" className="text-[#00B4D8] hover:underline">
                Video Conference Hub &amp; Configurator
              </Link>
              <Link to="/video-conference-in-pakistan" className="text-[#00B4D8] hover:underline">
                Pakistan VC Pricing Guide
              </Link>
              <Link to="/solutions" className="text-[#00B4D8] hover:underline">
                All AV Solutions
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Site Survey & Engineering Lead Modal */}
      {showSurveyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#1A2B4C]">
                  Request Architectural Site Survey &amp; Quote
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                  {state.seats}-Seat {state.presetId} room · {formatDim(state.roomWidthM, unit)}×
                  {formatDim(state.roomLengthM, unit)} · Est. {formatPrice(report.totalPkr)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSurveyModal(false)}
                aria-label="Close modal"
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {surveySubmitted ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 size={40} className="text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-[#1A2B4C]">Survey Request Logged</h3>
                <p className="text-xs text-slate-600">
                  Our certified AV engineering team in Lahore, Karachi, or Islamabad will contact you with CAD elevation drawings and FBR tax-compliant pricing.
                </p>
                <button
                  type="button"
                  onClick={() => setShowSurveyModal(false)}
                  className="px-5 py-2.5 bg-[#1A2B4C] text-white text-xs font-bold rounded-lg"
                >
                  Return to Designer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSurveySubmit} className="space-y-3.5">
                {surveyError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                    {surveyError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={200}
                      value={surveyForm.name}
                      onChange={(e) => setSurveyForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      maxLength={200}
                      value={surveyForm.email}
                      onChange={(e) => setSurveyForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Organization / Company
                    </label>
                    <input
                      type="text"
                      maxLength={200}
                      value={surveyForm.company}
                      onChange={(e) => setSurveyForm((f) => ({ ...f, company: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      maxLength={50}
                      value={surveyForm.phone}
                      onChange={(e) => setSurveyForm((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City &amp; Project Notes
                  </label>
                  <textarea
                    rows={3}
                    maxLength={1200}
                    value={surveyForm.notes}
                    onChange={(e) => setSurveyForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="e.g., Lahore Gulberg boardroom, dual 75-inch screens, Microsoft Teams Rooms integration..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSurveyModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={surveySubmitting}
                    className="px-5 py-2 bg-[#00B4D8] hover:bg-[#009bc2] text-white text-xs font-bold rounded-lg disabled:opacity-60"
                  >
                    {surveySubmitting ? 'Submitting...' : 'Submit Survey Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

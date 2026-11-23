import { PRODUCT_GMC_METADATA, getProductHref } from './gmc-feed';

export type RoomPresetId =
  | 'focus'
  | 'small'
  | 'medium'
  | 'large'
  | 'executive'
  | 'auditorium';

export type TableShape =
  | 'rectangle'
  | 'boat'
  | 'oval'
  | 'u-shape'
  | 'classroom';

export type TableFinish = 'oak' | 'walnut' | 'birch' | 'charcoal';

export type WallAcousticStyle =
  | 'slatted-wood'
  | 'matte-plaster'
  | 'glass-partition';

export type DisplayMode = 'single' | 'dual' | 'smd-wall';
export type DisplaySizeInches = 55 | 65 | 75 | 86 | 98;
export type SmdPitch = 'P2.5' | 'P2.9' | 'P3.9';
export type MeasurementUnit = 'm' | 'ft';

export interface RoomEndpointDevice {
  slug: string;
  name: string;
  brand: 'HP Poly' | 'Cisco' | 'Logitech' | 'Horion';
  mpn: string;
  tier: 'Huddle' | 'Medium' | 'Large' | 'Auditorium';
  formFactor: 'video-bar' | 'dual-lens-bar' | 'quad-cam-kit' | 'modular-ptz' | 'smart-board';
  fovDeg: number;
  maxOpticalDistanceM: number;
  micPickupM: number;
  maxExpansionMics: number;
  supportsDualDisplay: boolean;
  supportsCeilingMic: boolean;
  includesTouchController: boolean;
  summary: string;
  platforms: string;
  unitPricePkr: number;
  image: string;
}

export interface RoomPresetTemplate {
  id: RoomPresetId;
  code: string;
  label: string;
  capacityLabel: string;
  roomWidthM: number;
  roomLengthM: number;
  ceilingHeightM: number;
  tableShape: TableShape;
  tableLengthM: number;
  tableWidthM: number;
  tableOffsetFromWallM: number;
  seats: number;
  displayMode: DisplayMode;
  displaySizeInches: DisplaySizeInches;
  smdWidthM: number;
  smdHeightM: number;
  smdPitch: SmdPitch;
  endpointSlug: string;
  expansionMics: number;
  includeCeilingMic: boolean;
  includeTouchController: boolean;
  tableFinish: TableFinish;
  wallStyle: WallAcousticStyle;
  description: string;
}

export interface RoomDesignerState {
  presetId: RoomPresetId;
  roomWidthM: number;
  roomLengthM: number;
  ceilingHeightM: number;
  tableShape: TableShape;
  tableLengthM: number;
  tableWidthM: number;
  tableOffsetFromWallM: number;
  seats: number;
  displayMode: DisplayMode;
  displaySizeInches: DisplaySizeInches;
  smdWidthM: number;
  smdHeightM: number;
  smdPitch: SmdPitch;
  endpointSlug: string;
  expansionMics: number;
  includeCeilingMic: boolean;
  includeTouchController: boolean;
  includeInstallationKit: boolean;
  includeAcousticPanels: boolean;
  tableFinish: TableFinish;
  wallStyle: WallAcousticStyle;
}

export interface SeatPoint {
  index: number;
  x: number; // meters relative to room center (X = width)
  z: number; // meters relative to front display wall (Z = 0 at display wall, +Z into room)
  angleRad: number; // chair facing direction
  distanceFromCamM: number;
  angleFromCamDeg: number;
  inCameraFov: boolean;
  inOptimalRange: boolean;
  inMicPickup: boolean;
  status: 'optimal' | 'edge' | 'out';
}

export interface MicNode {
  id: string;
  label: string;
  type: 'bar' | 'table-pod' | 'ceiling-array';
  x: number;
  z: number;
  radiusM: number;
}

export interface BomLineItem {
  id: string;
  slug?: string;
  href?: string;
  name: string;
  brand: string;
  mpn: string;
  category: 'Codec & Camera' | 'Display System' | 'Microphones & Control' | 'Engineering & Mounts';
  qty: number;
  unitPricePkr: number;
  lineTotalPkr: number;
}

export interface RoomEngineeringReport {
  areaSqM: number;
  areaSqFt: number;
  displayWidthM: number;
  displayHeightM: number;
  displayCenterY: number;
  minViewingDistM: number;
  maxViewingDistM: number;
  furthestSeatDistM: number;
  nearestSeatDistM: number;
  frontClearanceM: number;
  rearClearanceM: number;
  sideClearanceM: number;
  walkwayStatus: 'pass' | 'tight';
  cameraFovStatus: 'pass' | 'partial' | 'warning';
  micCoverageStatus: 'pass' | 'partial' | 'warning';
  displaySizingStatus: 'pass' | 'oversized' | 'undersized';
  seatsInFovCount: number;
  seatsInMicCount: number;
  fovCoveragePct: number;
  micCoveragePct: number;
  readinessScore: number;
  recommendedExpansionMics: number;
  seatPoints: SeatPoint[];
  micNodes: MicNode[];
  smdStats: {
    cols: number;
    rows: number;
    totalCabinets: number;
    weightKg: number;
    nativeResX: number;
    nativeResY: number;
    pricePerCabinetPkr: number;
    powerPeakWatts: number;
    aspectRatioLabel: string;
  };
  bomItems: BomLineItem[];
  totalPkr: number;
}

const getMetaPrice = (slug: string, fallback: number): number => {
  const meta = PRODUCT_GMC_METADATA[slug];
  if (!meta) return fallback;
  return meta.salePrice || meta.regularPrice || fallback;
};

const getMetaImage = (slug: string, fallback: string): string => {
  const meta = PRODUCT_GMC_METADATA[slug];
  return meta?.images?.[0] || fallback;
};

export const ROOM_ENDPOINTS: RoomEndpointDevice[] = [
  {
    slug: 'poly-studio-usb-video-bar-pakistan',
    name: 'Poly Studio USB Video Bar',
    brand: 'HP Poly',
    mpn: '7200-85830-012',
    tier: 'Huddle',
    formFactor: 'video-bar',
    fovDeg: 120,
    maxOpticalDistanceM: 4.8,
    micPickupM: 4.5,
    maxExpansionMics: 1,
    supportsDualDisplay: false,
    supportsCeilingMic: false,
    includesTouchController: false,
    summary: '4K 120° FOV DirectorAI speaker-tracking USB bar with Acoustic Fence.',
    platforms: 'USB BYOD · Teams · Zoom · Meet',
    unitPricePkr: getMetaPrice('poly-studio-usb-video-bar-pakistan', 248000),
    image: getMetaImage('poly-studio-usb-video-bar-pakistan', '/images/video-conference/huddle-space.webp'),
  },
  {
    slug: 'poly-studio-x32-pakistan',
    name: 'HP Poly Studio X32',
    brand: 'HP Poly',
    mpn: 'A3SV5AA',
    tier: 'Huddle',
    formFactor: 'video-bar',
    fovDeg: 120,
    maxOpticalDistanceM: 5.0,
    micPickupM: 4.6,
    maxExpansionMics: 1,
    supportsDualDisplay: true,
    supportsCeilingMic: false,
    includesTouchController: false,
    summary: 'Standalone Poly VideoOS 4K appliance bar for huddle & focus rooms.',
    platforms: 'Native Teams · Zoom · SIP/H.323',
    unitPricePkr: getMetaPrice('poly-studio-x32-pakistan', 495000),
    image: getMetaImage('poly-studio-x32-pakistan', '/images/video-conference/huddle-space.webp'),
  },
  {
    slug: 'logitech-rally-bar-mini-pakistan',
    name: 'Logitech Rally Bar Mini',
    brand: 'Logitech',
    mpn: '960-001336',
    tier: 'Huddle',
    formFactor: 'video-bar',
    fovDeg: 120,
    maxOpticalDistanceM: 5.2,
    micPickupM: 4.8,
    maxExpansionMics: 2,
    supportsDualDisplay: true,
    supportsCeilingMic: false,
    includesTouchController: false,
    summary: 'Motorized pan/tilt 120° 4K bar with RightSight 2 AI Viewfinder.',
    platforms: 'CollabOS · Teams · Zoom · USB',
    unitPricePkr: getMetaPrice('logitech-rally-bar-mini-pakistan', 635000),
    image: getMetaImage('logitech-rally-bar-mini-pakistan', '/images/video-conference/huddle-space.webp'),
  },
  {
    slug: 'poly-studio-x52-pakistan',
    name: 'HP Poly Studio X52',
    brand: 'HP Poly',
    mpn: '7200-87620-001',
    tier: 'Medium',
    formFactor: 'video-bar',
    fovDeg: 95,
    maxOpticalDistanceM: 7.2,
    micPickupM: 6.1,
    maxExpansionMics: 2,
    supportsDualDisplay: true,
    supportsCeilingMic: false,
    includesTouchController: false,
    summary: '20MP 4K UltraHD bar with 95° low-distortion optics & DirectorAI.',
    platforms: 'Native Teams · Zoom · Webex · SIP',
    unitPricePkr: getMetaPrice('poly-studio-x52-pakistan', 765000),
    image: getMetaImage('poly-studio-x52-pakistan', '/images/video-conference/boardroom-hero.webp'),
  },
  {
    slug: 'cisco-room-bar-pakistan',
    name: 'Cisco Room Bar + Navigator',
    brand: 'Cisco',
    mpn: 'CS-BAR-NR-K9',
    tier: 'Medium',
    formFactor: 'video-bar',
    fovDeg: 120,
    maxOpticalDistanceM: 6.5,
    micPickupM: 5.5,
    maxExpansionMics: 2,
    supportsDualDisplay: true,
    supportsCeilingMic: false,
    includesTouchController: true,
    summary: 'All-in-one Webex & Teams bar including 10.1" Room Navigator panel.',
    platforms: 'Cisco Webex · Teams · Zoom · USB-C',
    unitPricePkr: getMetaPrice('cisco-room-bar-pakistan', 895000),
    image: getMetaImage('cisco-room-bar-pakistan', '/images/products/cisco-room-kit-studio.jpg'),
  },
  {
    slug: 'logitech-rally-bar-pakistan',
    name: 'Logitech Rally Bar',
    brand: 'Logitech',
    mpn: '960-001308',
    tier: 'Medium',
    formFactor: 'video-bar',
    fovDeg: 90,
    maxOpticalDistanceM: 8.5,
    micPickupM: 7.0,
    maxExpansionMics: 4,
    supportsDualDisplay: true,
    supportsCeilingMic: true,
    includesTouchController: false,
    summary: '5x optical / 15x total PTZ zoom with up to 4 daisy-chained mic pods.',
    platforms: 'CollabOS · Teams · Zoom · BYOD',
    unitPricePkr: getMetaPrice('logitech-rally-bar-pakistan', 865000),
    image: getMetaImage('logitech-rally-bar-pakistan', '/images/video-conference/boardroom-hero.webp'),
  },
  {
    slug: 'cisco-room-kit-pakistan',
    name: 'Cisco Room Kit',
    brand: 'Cisco',
    mpn: 'CS-KIT-K9',
    tier: 'Medium',
    formFactor: 'video-bar',
    fovDeg: 83,
    maxOpticalDistanceM: 8.0,
    micPickupM: 6.0,
    maxExpansionMics: 2,
    supportsDualDisplay: true,
    supportsCeilingMic: false,
    includesTouchController: true,
    summary: '5K UltraHD integrated bar with 6-element beamforming mic array.',
    platforms: 'Webex · Teams · SIP · H.323',
    unitPricePkr: getMetaPrice('cisco-room-kit-pakistan', 1190000),
    image: getMetaImage('cisco-room-kit-pakistan', '/images/products/cisco-room-kit-studio.jpg'),
  },
  {
    slug: 'horion-k6a-bundle-special-offer',
    name: 'Horion 65" K6A 4K Smart Board',
    brand: 'Horion',
    mpn: 'HRN-K6A-65-BUNDLE',
    tier: 'Medium',
    formFactor: 'smart-board',
    fovDeg: 120,
    maxOpticalDistanceM: 7.5,
    micPickupM: 8.0,
    maxExpansionMics: 1,
    supportsDualDisplay: false,
    supportsCeilingMic: false,
    includesTouchController: true,
    summary: '65" 4K interactive display with integrated 48MP AI camera & 8-mic array.',
    platforms: 'Android 13 + Windows OPS · Zoom · Teams',
    unitPricePkr: getMetaPrice('horion-k6a-bundle-special-offer', 645000),
    image: getMetaImage('horion-k6a-bundle-special-offer', '/images/video-conference/boardroom-hero.webp'),
  },
  {
    slug: 'poly-studio-x72-pakistan',
    name: 'HP Poly Studio X72 Dual-4K Bar',
    brand: 'HP Poly',
    mpn: 'A4LZ8AA',
    tier: 'Large',
    formFactor: 'dual-lens-bar',
    fovDeg: 120,
    maxOpticalDistanceM: 10.5,
    micPickupM: 7.6,
    maxExpansionMics: 3,
    supportsDualDisplay: true,
    supportsCeilingMic: true,
    includesTouchController: false,
    summary: 'Dual 20MP wide + telephoto 4K lenses for deep executive boardrooms.',
    platforms: 'Native Teams · Zoom · SIP · H.323',
    unitPricePkr: getMetaPrice('poly-studio-x72-pakistan', 1165000),
    image: getMetaImage('poly-studio-x72-pakistan', '/images/products/poly-x70-studio.jpg'),
  },
  {
    slug: 'polycom-realpresence-group-500-pakistan',
    name: 'Polycom RealPresence Group 500',
    brand: 'HP Poly',
    mpn: '7200-64550-001',
    tier: 'Large',
    formFactor: 'modular-ptz',
    fovDeg: 78,
    maxOpticalDistanceM: 12.0,
    micPickupM: 7.5,
    maxExpansionMics: 4,
    supportsDualDisplay: true,
    supportsCeilingMic: true,
    includesTouchController: false,
    summary: 'EagleEye IV 12x optical PTZ codec for sovereign SIP/H.323 boardrooms.',
    platforms: 'On-Premises SIP / H.323 · AES-256',
    unitPricePkr: getMetaPrice('polycom-realpresence-group-500-pakistan', 745000),
    image: getMetaImage('polycom-realpresence-group-500-pakistan', '/images/products/polycom-group-500-eagleeye-iv.jpg'),
  },
  {
    slug: 'cisco-room-kit-plus-pakistan',
    name: 'Cisco Room Kit Plus (Quad Camera)',
    brand: 'Cisco',
    mpn: 'CS-KITPLPTZ4K-K9',
    tier: 'Large',
    formFactor: 'quad-cam-kit',
    fovDeg: 83,
    maxOpticalDistanceM: 12.5,
    micPickupM: 8.5,
    maxExpansionMics: 4,
    supportsDualDisplay: true,
    supportsCeilingMic: true,
    includesTouchController: true,
    summary: '5K Quad Camera speaker-tracking bar + Codec Plus + Navigator.',
    platforms: 'Webex · Teams Interop · SIP/H.323',
    unitPricePkr: getMetaPrice('cisco-room-kit-plus-pakistan', 1780000),
    image: getMetaImage('cisco-room-kit-plus-pakistan', '/images/products/cisco-room-kit-eq.webp'),
  },
  {
    slug: 'poly-g7500-pakistan',
    name: 'HP Poly G7500 Modular 4K Codec',
    brand: 'HP Poly',
    mpn: '7200-87310-001',
    tier: 'Auditorium',
    formFactor: 'modular-ptz',
    fovDeg: 85,
    maxOpticalDistanceM: 16.0,
    micPickupM: 9.0,
    maxExpansionMics: 4,
    supportsDualDisplay: true,
    supportsCeilingMic: true,
    includesTouchController: false,
    summary: 'Modular dual-4K codec with PoE+ IP table/ceiling mics & multi-PTZ.',
    platforms: 'Teams · Zoom · Native H.323 / SIP',
    unitPricePkr: getMetaPrice('poly-g7500-pakistan', 1420000),
    image: getMetaImage('poly-g7500-pakistan', '/images/products/poly-x70-boardroom.jpg'),
  },
  {
    slug: 'cisco-room-kit-eq-pakistan',
    name: 'Cisco Room Kit EQ + Quad Camera',
    brand: 'Cisco',
    mpn: 'CS-KIT-EQ-C-K9',
    tier: 'Auditorium',
    formFactor: 'quad-cam-kit',
    fovDeg: 83,
    maxOpticalDistanceM: 18.0,
    micPickupM: 10.0,
    maxExpansionMics: 4,
    supportsDualDisplay: true,
    supportsCeilingMic: true,
    includesTouchController: true,
    summary: 'NVIDIA AI Codec EQ + Quad Camera supporting triple 4K & SMD walls.',
    platforms: 'Webex · Native Teams · SIP/H.323',
    unitPricePkr: getMetaPrice('cisco-room-kit-eq-pakistan', 2620000),
    image: getMetaImage('cisco-room-kit-eq-pakistan', '/images/products/cisco-room-kit-eq.webp'),
  },
];

export const ROOM_PRESETS: RoomPresetTemplate[] = [
  {
    id: 'focus',
    code: 'focus/1',
    label: 'Focus Huddle',
    capacityLabel: '2–4 Seats',
    roomWidthM: 3.4,
    roomLengthM: 3.8,
    ceilingHeightM: 2.8,
    tableShape: 'oval',
    tableLengthM: 1.5,
    tableWidthM: 1.0,
    tableOffsetFromWallM: 1.15,
    seats: 4,
    displayMode: 'single',
    displaySizeInches: 55,
    smdWidthM: 2.5,
    smdHeightM: 1.5,
    smdPitch: 'P2.5',
    endpointSlug: 'poly-studio-usb-video-bar-pakistan',
    expansionMics: 0,
    includeCeilingMic: false,
    includeTouchController: false,
    tableFinish: 'birch',
    wallStyle: 'glass-partition',
    description: 'Compact booth or 4-person huddle pod with 120° wide-angle camera optics.',
  },
  {
    id: 'small',
    code: 'smallroom/1',
    label: 'Small Room',
    capacityLabel: '4–6 Seats',
    roomWidthM: 4.2,
    roomLengthM: 4.8,
    ceilingHeightM: 2.9,
    tableShape: 'boat',
    tableLengthM: 2.2,
    tableWidthM: 1.1,
    tableOffsetFromWallM: 1.25,
    seats: 6,
    displayMode: 'single',
    displaySizeInches: 65,
    smdWidthM: 3.0,
    smdHeightM: 2.0,
    smdPitch: 'P2.5',
    endpointSlug: 'poly-studio-x32-pakistan',
    expansionMics: 0,
    includeCeilingMic: false,
    includeTouchController: true,
    tableFinish: 'oak',
    wallStyle: 'slatted-wood',
    description: 'Everyday 6-person meeting space with all-in-one appliance bar and 65" 4K display.',
  },
  {
    id: 'medium',
    code: 'mediumroom/1',
    label: 'Medium Room',
    capacityLabel: '8–12 Seats',
    roomWidthM: 5.2,
    roomLengthM: 6.4,
    ceilingHeightM: 3.0,
    tableShape: 'boat',
    tableLengthM: 3.4,
    tableWidthM: 1.35,
    tableOffsetFromWallM: 1.35,
    seats: 10,
    displayMode: 'dual',
    displaySizeInches: 75,
    smdWidthM: 3.5,
    smdHeightM: 2.0,
    smdPitch: 'P2.5',
    endpointSlug: 'poly-studio-x52-pakistan',
    expansionMics: 1,
    includeCeilingMic: false,
    includeTouchController: true,
    tableFinish: 'oak',
    wallStyle: 'slatted-wood',
    description: 'Standard 10-seat enterprise conference room with dual 75" 4K screens & DirectorAI.',
  },
  {
    id: 'large',
    code: 'largeroom/1',
    label: 'Large Boardroom',
    capacityLabel: '14–18 Seats',
    roomWidthM: 6.5,
    roomLengthM: 8.6,
    ceilingHeightM: 3.2,
    tableShape: 'boat',
    tableLengthM: 5.2,
    tableWidthM: 1.65,
    tableOffsetFromWallM: 1.5,
    seats: 16,
    displayMode: 'dual',
    displaySizeInches: 86,
    smdWidthM: 4.5,
    smdHeightM: 2.5,
    smdPitch: 'P2.5',
    endpointSlug: 'poly-studio-x72-pakistan',
    expansionMics: 2,
    includeCeilingMic: false,
    includeTouchController: true,
    tableFinish: 'walnut',
    wallStyle: 'slatted-wood',
    description: 'Dual-lens optical boardroom engineered for 16 seats with dual 86" displays.',
  },
  {
    id: 'executive',
    code: 'boardroom/1',
    label: 'U-Shape Executive',
    capacityLabel: '16–24 Seats',
    roomWidthM: 8.0,
    roomLengthM: 10.2,
    ceilingHeightM: 3.6,
    tableShape: 'u-shape',
    tableLengthM: 6.2,
    tableWidthM: 3.8,
    tableOffsetFromWallM: 1.7,
    seats: 18,
    displayMode: 'smd-wall',
    displaySizeInches: 98,
    smdWidthM: 4.5,
    smdHeightM: 2.5,
    smdPitch: 'P2.5',
    endpointSlug: 'cisco-room-kit-plus-pakistan',
    expansionMics: 3,
    includeCeilingMic: true,
    includeTouchController: true,
    tableFinish: 'walnut',
    wallStyle: 'slatted-wood',
    description: 'C-suite U-shape boardroom with seamless 4.5×2.5m P2.5 SMD wall & Quad Camera.',
  },
  {
    id: 'auditorium',
    code: 'auditorium/1',
    label: 'Auditorium / Hall',
    capacityLabel: '24–36 Seats',
    roomWidthM: 10.5,
    roomLengthM: 13.0,
    ceilingHeightM: 4.5,
    tableShape: 'classroom',
    tableLengthM: 8.0,
    tableWidthM: 5.6,
    tableOffsetFromWallM: 2.3,
    seats: 24,
    displayMode: 'smd-wall',
    displaySizeInches: 98,
    smdWidthM: 6.0,
    smdHeightM: 3.5,
    smdPitch: 'P2.9',
    endpointSlug: 'cisco-room-kit-eq-pakistan',
    expansionMics: 4,
    includeCeilingMic: true,
    includeTouchController: true,
    tableFinish: 'charcoal',
    wallStyle: 'matte-plaster',
    description: 'Divisible training hall & townhall auditorium with 6×3.5m P2.9 SMD LED wall.',
  },
];

// Reference PKR unit prices grounded to AV Live institutional estimates
export const DISPLAY_PRICES_PKR: Record<DisplaySizeInches, number> = {
  55: 235000,
  65: 345000,
  75: 560000,
  86: 840000,
  98: 1650000,
};

export const SMD_PRICE_PER_CABINET_PKR: Record<SmdPitch, number> = {
  'P2.5': 145000,
  'P2.9': 125000,
  'P3.9': 105000,
};

export const ACCESSORY_PRICES_PKR = {
  tableExpansionMic: 78000,
  ceilingBeamformingArray: 245000,
  touchController: 118000,
  dualDisplayMountKit: 85000,
  singleDisplayMountKit: 42000,
  smdProcessorAndTrussKit: 285000,
  turnkeyInstallAndCabling: 95000,
  acousticWallTreatmentPerSqM: 14500,
};

export function createInitialRoomState(presetId: RoomPresetId = 'medium'): RoomDesignerState {
  const preset = ROOM_PRESETS.find((p) => p.id === presetId) || ROOM_PRESETS[2];
  return {
    presetId: preset.id,
    roomWidthM: preset.roomWidthM,
    roomLengthM: preset.roomLengthM,
    ceilingHeightM: preset.ceilingHeightM,
    tableShape: preset.tableShape,
    tableLengthM: preset.tableLengthM,
    tableWidthM: preset.tableWidthM,
    tableOffsetFromWallM: preset.tableOffsetFromWallM,
    seats: preset.seats,
    displayMode: preset.displayMode,
    displaySizeInches: preset.displaySizeInches,
    smdWidthM: preset.smdWidthM,
    smdHeightM: preset.smdHeightM,
    smdPitch: preset.smdPitch,
    endpointSlug: preset.endpointSlug,
    expansionMics: preset.expansionMics,
    includeCeilingMic: preset.includeCeilingMic,
    includeTouchController: preset.includeTouchController,
    includeInstallationKit: true,
    includeAcousticPanels: preset.wallStyle === 'glass-partition',
    tableFinish: preset.tableFinish,
    wallStyle: preset.wallStyle,
  };
}

export function getDisplayPhysicalSizeM(
  displayMode: DisplayMode,
  displaySizeInches: DisplaySizeInches,
  smdWidthM: number,
  smdHeightM: number
): { widthM: number; heightM: number } {
  if (displayMode === 'smd-wall') {
    const cols = Math.max(2, Math.ceil(smdWidthM / 0.5));
    const rows = Math.max(2, Math.ceil(smdHeightM / 0.5));
    return {
      widthM: cols * 0.5,
      heightM: rows * 0.5,
    };
  }
  // 16:9 commercial panel physical bounds (+ slim bezel)
  const diagM = displaySizeInches * 0.0254;
  const singleW = diagM * (16 / Math.sqrt(16 * 16 + 9 * 9));
  const singleH = diagM * (9 / Math.sqrt(16 * 16 + 9 * 9));
  return {
    widthM: displayMode === 'dual' ? singleW * 2 + 0.06 : singleW,
    heightM: singleH,
  };
}

function generateSeatCoordinates(state: RoomDesignerState): { x: number; z: number; angleRad: number }[] {
  const { tableShape, tableLengthM, tableWidthM, tableOffsetFromWallM, seats } = state;
  const zStart = tableOffsetFromWallM;
  const zEnd = zStart + tableLengthM;
  const zMid = zStart + tableLengthM / 2;
  const coords: { x: number; z: number; angleRad: number }[] = [];

  if (tableShape === 'classroom') {
    const rowCount = seats >= 18 ? 3 : seats >= 8 ? 2 : 1;
    const perRow = Math.ceil(seats / rowCount);
    const rowSpacing = Math.max(1.25, tableLengthM / Math.max(rowCount, 1));
    for (let i = 0; i < seats; i++) {
      const r = Math.floor(i / perRow);
      const col = i % perRow;
      const countInThisRow = r === rowCount - 1 ? seats - r * perRow : perRow;
      const spanX = Math.max(1.4, tableWidthM - 0.5);
      const x = countInThisRow === 1 ? 0 : -spanX / 2 + (col / (countInThisRow - 1)) * spanX;
      const z = zStart + r * rowSpacing + 0.55;
      coords.push({ x, z, angleRad: Math.PI }); // facing display wall (-Z)
    }
    return coords;
  }

  if (tableShape === 'u-shape') {
    // Back bridge (facing -Z toward display) + Left arm (facing +X) + Right arm (facing -X)
    const backSeats = Math.max(2, Math.round(seats * 0.28));
    const rem = Math.max(0, seats - backSeats);
    const leftSeats = Math.ceil(rem / 2);
    const rightSeats = rem - leftSeats;

    const spanX = Math.max(1.0, tableWidthM - 1.1);
    for (let i = 0; i < backSeats; i++) {
      const x = backSeats === 1 ? 0 : -spanX / 2 + (i / (backSeats - 1)) * spanX;
      coords.push({ x, z: zEnd + 0.38, angleRad: Math.PI });
    }
    const armOffset = tableWidthM / 2 + 0.36;
    const armLen = Math.max(1.2, tableLengthM - 0.8);
    for (let i = 0; i < leftSeats; i++) {
      const z = zStart + 0.45 + ((i + 0.5) / Math.max(leftSeats, 1)) * armLen;
      coords.push({ x: -armOffset, z, angleRad: Math.PI / 2 });
    }
    for (let i = 0; i < rightSeats; i++) {
      const z = zStart + 0.45 + ((i + 0.5) / Math.max(rightSeats, 1)) * armLen;
      coords.push({ x: armOffset, z, angleRad: -Math.PI / 2 });
    }
    return coords;
  }

  if (tableShape === 'oval' && seats <= 6 && tableLengthM <= 2.2) {
    // Round / compact oval radial seating, keeping front clear for camera sightlines
    const rx = tableWidthM / 2 + 0.36;
    const rz = tableLengthM / 2 + 0.36;
    for (let i = 0; i < seats; i++) {
      // Spread from 38 deg to 322 deg around Z+ so no chair completely blocks display center
      const frac = seats === 1 ? 0.5 : i / (seats - 1);
      const theta = (0.22 + frac * 1.56) * Math.PI; // avoids theta=0 (front display axis)
      const x = Math.sin(theta) * rx;
      const z = zMid - Math.cos(theta) * rz;
      const angleRad = Math.atan2(-x, zMid - z);
      coords.push({ x, z, angleRad });
    }
    return coords;
  }

  // Standard Rectangle / Boat / Oval Boardroom: Head seat at far end + symmetric flanks
  const hasFarHeadSeat = seats >= 5;
  const sideTotal = hasFarHeadSeat ? seats - 1 : seats;
  const leftCount = Math.ceil(sideTotal / 2);
  const rightCount = sideTotal - leftCount;
  const usableLen = Math.max(0.9, tableLengthM - 0.65);

  const getFlankX = (zPos: number) => {
    if (tableShape === 'boat') {
      const norm = (zPos - zMid) / Math.max(tableLengthM / 2, 0.5);
      // Taper slightly narrower at ends, fuller in center
      return (tableWidthM / 2) * (1 - 0.14 * norm * norm) + 0.36;
    }
    if (tableShape === 'oval') {
      const norm = (zPos - zMid) / Math.max(tableLengthM / 2, 0.5);
      return (tableWidthM / 2) * Math.sqrt(Math.max(0.45, 1 - 0.55 * norm * norm)) + 0.36;
    }
    return tableWidthM / 2 + 0.36;
  };

  for (let i = 0; i < leftCount; i++) {
    const z = zStart + 0.32 + ((i + 0.5) / Math.max(leftCount, 1)) * usableLen;
    coords.push({ x: -getFlankX(z), z, angleRad: Math.PI / 2 });
  }
  for (let i = 0; i < rightCount; i++) {
    const z = zStart + 0.32 + ((i + 0.5) / Math.max(rightCount, 1)) * usableLen;
    coords.push({ x: getFlankX(z), z, angleRad: -Math.PI / 2 });
  }
  if (hasFarHeadSeat) {
    coords.push({ x: 0, z: zEnd + 0.38, angleRad: Math.PI });
  }

  return coords;
}

export function computeRoomEngineering(state: RoomDesignerState): RoomEngineeringReport {
  const endpoint =
    ROOM_ENDPOINTS.find((e) => e.slug === state.endpointSlug) || ROOM_ENDPOINTS[3];

  const { widthM: displayWidthM, heightM: displayHeightM } = getDisplayPhysicalSizeM(
    state.displayMode,
    state.displaySizeInches,
    state.smdWidthM,
    state.smdHeightM
  );
  const displayCenterY =
    state.displayMode === 'smd-wall'
      ? Math.max(0.9 + displayHeightM / 2, Math.min(state.ceilingHeightM - displayHeightM / 2 - 0.15, 2.0))
      : 1.48;

  // Camera sits immediately below display (or at top of smart board) on front wall z ≈ 0.16m
  const camZ = 0.16;

  // Mic nodes (main bar + optional expansion pods along table spine + optional ceiling tile)
  const micNodes: MicNode[] = [
    {
      id: 'bar-main',
      label: `${endpoint.name} Built-in Array`,
      type: 'bar',
      x: 0,
      z: camZ,
      radiusM: endpoint.micPickupM,
    },
  ];

  const activePods = Math.min(state.expansionMics, endpoint.maxExpansionMics);
  if (activePods > 0) {
    const tStart = state.tableOffsetFromWallM + 0.7;
    const tEnd = state.tableOffsetFromWallM + state.tableLengthM - 0.55;
    for (let i = 0; i < activePods; i++) {
      const frac = activePods === 1 ? 0.62 : (i + 0.5) / activePods;
      const podZ = tStart + frac * Math.max(0.8, tEnd - tStart);
      micNodes.push({
        id: `pod-${i + 1}`,
        label: `Table Expansion Mic #${i + 1}`,
        type: 'table-pod',
        x: 0,
        z: podZ,
        radiusM: 2.5,
      });
    }
  }

  if (state.includeCeilingMic && endpoint.supportsCeilingMic) {
    const centerZ = state.tableOffsetFromWallM + state.tableLengthM * 0.55;
    micNodes.push({
      id: 'ceiling-array-1',
      label: 'Ceiling Beamforming Mic Tile',
      type: 'ceiling-array',
      x: 0,
      z: centerZ,
      radiusM: 4.5,
    });
  }

  // Evaluate each seat against camera FOV + mic coverage
  const halfFovDeg = endpoint.fovDeg / 2;
  const rawSeats = generateSeatCoordinates(state);
  let nearestSeatDistM = Infinity;
  let furthestSeatDistM = 0;

  const seatPoints: SeatPoint[] = rawSeats.map((pt, idx) => {
    const dz = Math.max(0.2, pt.z - camZ);
    const dx = Math.abs(pt.x);
    const dist = Math.hypot(dx, dz);
    const angleDeg = (Math.atan2(dx, dz) * 180) / Math.PI;
    const inCameraFov = angleDeg <= halfFovDeg;
    const inOptimalRange = dist <= endpoint.maxOpticalDistanceM;
    const inMicPickup = micNodes.some((m) => Math.hypot(pt.x - m.x, pt.z - m.z) <= m.radiusM);

    nearestSeatDistM = Math.min(nearestSeatDistM, dist);
    furthestSeatDistM = Math.max(furthestSeatDistM, dist);

    let status: 'optimal' | 'edge' | 'out' = 'optimal';
    if (!inCameraFov) {
      status = 'out';
    } else if (!inMicPickup || !inOptimalRange) {
      status = 'edge';
    }

    return {
      index: idx + 1,
      x: pt.x,
      z: pt.z,
      angleRad: pt.angleRad,
      distanceFromCamM: dist,
      angleFromCamDeg: angleDeg,
      inCameraFov,
      inOptimalRange,
      inMicPickup,
      status,
    };
  });

  if (!Number.isFinite(nearestSeatDistM)) nearestSeatDistM = 1.5;

  const seatsInFovCount = seatPoints.filter((s) => s.inCameraFov).length;
  const seatsInMicCount = seatPoints.filter((s) => s.inMicPickup).length;
  const fovCoveragePct = seatPoints.length ? Math.round((seatsInFovCount / seatPoints.length) * 100) : 100;
  const micCoveragePct = seatPoints.length ? Math.round((seatsInMicCount / seatPoints.length) * 100) : 100;

  // AVIXA DISCAS / 4-6-8 Rule
  const minViewingDistM = Math.max(1.2, Number((displayHeightM * 1.5).toFixed(2)));
  const maxViewingDistM = Number((displayHeightM * 6.0).toFixed(2));
  const displaySizingStatus: RoomEngineeringReport['displaySizingStatus'] =
    furthestSeatDistM > maxViewingDistM + 0.3
      ? 'undersized'
      : nearestSeatDistM < minViewingDistM - 0.2
      ? 'oversized'
      : 'pass';

  // Walkways & clearances
  const frontClearanceM = Number(state.tableOffsetFromWallM.toFixed(2));
  const rearClearanceM = Number(
    (state.roomLengthM - (state.tableOffsetFromWallM + state.tableLengthM + 0.55)).toFixed(2)
  );
  const sideClearanceM = Number(
    ((state.roomWidthM - (state.tableWidthM + 1.1)) / 2).toFixed(2)
  );
  const walkwayStatus: 'pass' | 'tight' =
    frontClearanceM >= 0.9 && rearClearanceM >= 0.7 && sideClearanceM >= 0.6 ? 'pass' : 'tight';

  const cameraFovStatus: RoomEngineeringReport['cameraFovStatus'] =
    fovCoveragePct === 100 && furthestSeatDistM <= endpoint.maxOpticalDistanceM
      ? 'pass'
      : fovCoveragePct >= 80
      ? 'partial'
      : 'warning';

  const micCoverageStatus: RoomEngineeringReport['micCoverageStatus'] =
    micCoveragePct === 100 ? 'pass' : micCoveragePct >= 75 ? 'partial' : 'warning';

  // Recommended expansion pods based on furthest seat vs bar mic pickup
  const recommendedExpansionMics =
    furthestSeatDistM <= endpoint.micPickupM
      ? 0
      : Math.min(endpoint.maxExpansionMics, Math.ceil((furthestSeatDistM - endpoint.micPickupM) / 2.2));

  // Readiness Score (weighted technical engineering metric)
  const score =
    Math.round(
      fovCoveragePct * 0.35 +
        micCoveragePct * 0.35 +
        (displaySizingStatus === 'pass' ? 20 : 10) +
        (walkwayStatus === 'pass' ? 10 : 4)
    );

  // SMD LED Cabinet Math (strictly 500x500mm block rules)
  const smdCols = Math.max(2, Math.ceil(state.smdWidthM / 0.5));
  const smdRows = Math.max(2, Math.ceil(state.smdHeightM / 0.5));
  const totalCabinets = smdCols * smdRows;
  const pxPerBlock = state.smdPitch === 'P2.5' ? 200 : state.smdPitch === 'P2.9' ? 172 : 128;
  const pricePerCab = SMD_PRICE_PER_CABINET_PKR[state.smdPitch];

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const div = gcd(smdCols, smdRows);

  const smdStats = {
    cols: smdCols,
    rows: smdRows,
    totalCabinets,
    weightKg: totalCabinets * 7.5,
    nativeResX: smdCols * pxPerBlock,
    nativeResY: smdRows * pxPerBlock,
    pricePerCabinetPkr: pricePerCab,
    powerPeakWatts: totalCabinets * 145,
    aspectRatioLabel: `${smdCols / div}:${smdRows / div}`,
  };

  // Build itemized Bill of Materials
  const bomItems: BomLineItem[] = [
    {
      id: `endpoint-${endpoint.slug}`,
      slug: endpoint.slug,
      href: getProductHref({ slug: endpoint.slug }, endpoint.slug),
      name: endpoint.name,
      brand: endpoint.brand,
      mpn: endpoint.mpn,
      category: 'Codec & Camera',
      qty: 1,
      unitPricePkr: endpoint.unitPricePkr,
      lineTotalPkr: endpoint.unitPricePkr,
    },
  ];

  // Add Display Hardware (Skip separate display line if Smart Board single mode already supplies the screen)
  if (state.displayMode === 'smd-wall') {
    const wallPrice = totalCabinets * pricePerCab;
    bomItems.push({
      id: `smd-wall-${state.smdPitch}-${smdCols}x${smdRows}`,
      name: `${smdCols * 0.5}m × ${smdRows * 0.5}m Seamless ${state.smdPitch} SMD LED Wall (${totalCabinets} × 500×500mm Cabinets)`,
      brand: 'AV Live SMD',
      mpn: `AVL-${state.smdPitch}-${smdCols}X${smdRows}`,
      category: 'Display System',
      qty: totalCabinets,
      unitPricePkr: pricePerCab,
      lineTotalPkr: wallPrice,
    });
    bomItems.push({
      id: 'smd-novastar-processor',
      name: 'NovaStar 4K Sending Controller + Precision Steel Wall Frame',
      brand: 'NovaStar / AV Live',
      mpn: 'NV-4K-TRUSS',
      category: 'Engineering & Mounts',
      qty: 1,
      unitPricePkr: ACCESSORY_PRICES_PKR.smdProcessorAndTrussKit,
      lineTotalPkr: ACCESSORY_PRICES_PKR.smdProcessorAndTrussKit,
    });
  } else if (endpoint.formFactor !== 'smart-board' || state.displayMode === 'dual') {
    const qtyDisplays = state.displayMode === 'dual' ? 2 : 1;
    const panelUnit = DISPLAY_PRICES_PKR[state.displaySizeInches];
    bomItems.push({
      id: `commercial-display-${state.displaySizeInches}`,
      name: `${state.displaySizeInches}" Commercial 4K UHD Non-Glare Display`,
      brand: 'Commercial 4K',
      mpn: `AV-DISP-${state.displaySizeInches}UHD`,
      category: 'Display System',
      qty: qtyDisplays,
      unitPricePkr: panelUnit,
      lineTotalPkr: panelUnit * qtyDisplays,
    });

    const mountCost =
      qtyDisplays === 2
        ? ACCESSORY_PRICES_PKR.dualDisplayMountKit
        : ACCESSORY_PRICES_PKR.singleDisplayMountKit;
    bomItems.push({
      id: `display-mount-${qtyDisplays}`,
      name:
        qtyDisplays === 2
          ? 'Dual-Screen Heavy Duty Cantilever Wall Mount & Camera Shelf'
          : 'Heavy-Duty Tilt Wall Mount & Bar Bracket',
      brand: 'AV Live Hardware',
      mpn: qtyDisplays === 2 ? 'AVL-MNT-DUAL' : 'AVL-MNT-SINGLE',
      category: 'Engineering & Mounts',
      qty: 1,
      unitPricePkr: mountCost,
      lineTotalPkr: mountCost,
    });
  }

  if (activePods > 0) {
    bomItems.push({
      id: 'expansion-table-mics',
      name: `${endpoint.brand} Digital Expansion Table Microphone Pod`,
      brand: endpoint.brand,
      mpn: `${endpoint.brand.toUpperCase().replace(/\s+/g, '')}-MIC-POD`,
      category: 'Microphones & Control',
      qty: activePods,
      unitPricePkr: ACCESSORY_PRICES_PKR.tableExpansionMic,
      lineTotalPkr: ACCESSORY_PRICES_PKR.tableExpansionMic * activePods,
    });
  }

  if (state.includeCeilingMic && endpoint.supportsCeilingMic) {
    bomItems.push({
      id: 'ceiling-beamforming-mic',
      name: 'Dante PoE+ Ceiling Beamforming Microphone Array Tile',
      brand: 'Shure / Poly',
      mpn: 'CEIL-MXA-ARRAY',
      category: 'Microphones & Control',
      qty: 1,
      unitPricePkr: ACCESSORY_PRICES_PKR.ceilingBeamformingArray,
      lineTotalPkr: ACCESSORY_PRICES_PKR.ceilingBeamformingArray,
    });
  }

  if (state.includeTouchController && !endpoint.includesTouchController) {
    bomItems.push({
      id: 'tabletop-touch-controller',
      name:
        endpoint.brand === 'Logitech'
          ? 'Logitech Tap IP PoE Meeting Controller'
          : 'Poly TC10 10.1" PoE Tabletop Touch Console',
      brand: endpoint.brand,
      mpn: endpoint.brand === 'Logitech' ? '952-000088' : '2200-37760-001',
      category: 'Microphones & Control',
      qty: 1,
      unitPricePkr: ACCESSORY_PRICES_PKR.touchController,
      lineTotalPkr: ACCESSORY_PRICES_PKR.touchController,
    });
  }

  if (state.includeAcousticPanels) {
    const acousticSqM = Math.max(4, Math.round(state.roomLengthM * 0.9));
    bomItems.push({
      id: 'acoustic-wall-treatment',
      name: `NRC 0.85 Architectural Acoustic Slatted Panels (${acousticSqM} m²)`,
      brand: 'AV Live Acoustics',
      mpn: 'AVL-ACOUSTIC-SLAT',
      category: 'Engineering & Mounts',
      qty: acousticSqM,
      unitPricePkr: ACCESSORY_PRICES_PKR.acousticWallTreatmentPerSqM,
      lineTotalPkr: ACCESSORY_PRICES_PKR.acousticWallTreatmentPerSqM * acousticSqM,
    });
  }

  if (state.includeInstallationKit) {
    bomItems.push({
      id: 'turnkey-integration-cabling',
      name: 'Concealed Cat6A/HDMI-2.1 Cabling, Floor Box & Certified Commissioning',
      brand: 'AV Live Engineering',
      mpn: 'AVL-TURNKEY-SLA',
      category: 'Engineering & Mounts',
      qty: 1,
      unitPricePkr: ACCESSORY_PRICES_PKR.turnkeyInstallAndCabling,
      lineTotalPkr: ACCESSORY_PRICES_PKR.turnkeyInstallAndCabling,
    });
  }

  const totalPkr = bomItems.reduce((sum, item) => sum + item.lineTotalPkr, 0);

  return {
    areaSqM: Number((state.roomWidthM * state.roomLengthM).toFixed(1)),
    areaSqFt: Math.round(state.roomWidthM * state.roomLengthM * 10.7639),
    displayWidthM: Number(displayWidthM.toFixed(2)),
    displayHeightM: Number(displayHeightM.toFixed(2)),
    displayCenterY,
    minViewingDistM,
    maxViewingDistM,
    furthestSeatDistM: Number(furthestSeatDistM.toFixed(2)),
    nearestSeatDistM: Number(nearestSeatDistM.toFixed(2)),
    frontClearanceM,
    rearClearanceM,
    sideClearanceM,
    walkwayStatus,
    cameraFovStatus,
    micCoverageStatus,
    displaySizingStatus,
    seatsInFovCount,
    seatsInMicCount,
    fovCoveragePct,
    micCoveragePct,
    readinessScore: score,
    recommendedExpansionMics,
    seatPoints,
    micNodes,
    smdStats,
    bomItems,
    totalPkr,
  };
}

export function formatDim(meters: number, unit: MeasurementUnit): string {
  if (unit === 'ft') {
    const totalInches = Math.round(meters * 39.3701);
    const ft = Math.floor(totalInches / 12);
    const inch = totalInches % 12;
    return `${ft}' ${inch}"`;
  }
  return `${meters.toFixed(1)} m`;
}

// Official Google Product Taxonomy Subset for Enterprise Pro-AV, Video Conferencing, Telephony, Broadcast & Electronics
// Reference: https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt

export interface GoogleTaxonomyCategory {
  id: number;
  path: string;
  keywords?: string[];
}

export const GOOGLE_PRODUCT_TAXONOMY: GoogleTaxonomyCategory[] = [
  // Video Conferencing & Telephony (Core AV Live Hardware)
  {
    id: 283,
    path: 'Electronics > Communications > Telephony > Video Conferencing',
    keywords: ['poly', 'cisco', 'logitech', 'video bar', 'room kit', 'codec', 'g7500', 'x50', 'x52', 'x70', 'x72', 'rally', 'zoom', 'teams', 'webex', 'boardroom'],
  },
  {
    id: 268,
    path: 'Electronics > Communications > Telephony > Corded Phones',
    keywords: ['ip phone', 'voip', 'sip phone', 'desk phone', 'yealink', 'grandstream', 'fanvil', 'polycom', 'vvx'],
  },
  {
    id: 266,
    path: 'Electronics > Communications > Telephony',
    keywords: ['pbx', 'ucm', '3cx', 'freepbx', 'voip gateway', 'telephony', 'sip'],
  },
  {
    id: 267,
    path: 'Electronics > Communications > Telephony > Conference Phones',
    keywords: ['conference phone', 'speakerphone', 'trio', 'spider', 'cp965', 'table mic'],
  },
  {
    id: 269,
    path: 'Electronics > Communications > Telephony > Cordless Phones',
    keywords: ['dect', 'wireless phone', 'handset'],
  },
  {
    id: 505295,
    path: 'Electronics > Communications > Telephony > Telephone Accessories',
    keywords: ['expansion module', 'poe injector', 'handset cord', 'phone stand'],
  },
  {
    id: 505296,
    path: 'Electronics > Communications > Telephony > Telephone Accessories > Telephone Headsets',
    keywords: ['headset', 'jabra', 'blackwire', 'voyager', 'evolve', 'call center', 'uc headset', 'bh70'],
  },
  {
    id: 264,
    path: 'Electronics > Communications > Intercoms',
    keywords: ['intercom', '2n', 'door station', 'access control', 'paging', 'sip intercom', 'axis a8105'],
  },
  {
    id: 265,
    path: 'Electronics > Communications > Intercom Accessories',
    keywords: ['intercom bracket', 'rfid reader', 'door relay'],
  },
  {
    id: 262,
    path: 'Electronics > Communications',
    keywords: ['unified communications', 'av hardware', 'collaboration'],
  },

  // Audio, Microphones, PA Systems & Headsets
  {
    id: 3295,
    path: 'Electronics > Audio > Audio Components > Headsets',
    keywords: ['wireless headset', 'bluetooth headset', 'anc headset', 'usb headset'],
  },
  {
    id: 505771,
    path: 'Electronics > Audio > Audio Components > Headphones & Headsets > Headphones',
    keywords: ['studio headphones', 'monitoring', 'earphones'],
  },
  {
    id: 223,
    path: 'Electronics > Audio',
    keywords: ['sound system', 'pro audio', 'acoustic'],
  },
  {
    id: 225,
    path: 'Electronics > Audio > Audio Components > Microphones',
    keywords: ['microphone', 'ceiling mic', 'gooseneck', 'delegate mic', 'shure', 'vissonic', 'bosch', 'lapel', 'wireless mic'],
  },
  {
    id: 249,
    path: 'Electronics > Audio > Audio Components > Speakers',
    keywords: ['line array', 'pa speaker', 'ceiling speaker', 'column speaker', 'subwoofer', 'monitor'],
  },
  {
    id: 247,
    path: 'Electronics > Audio > Audio Components > Public Address Systems',
    keywords: ['pa system', 'public address', 'bosch paviro', 'itc', 'evacuation', 'zone amplifier', 'paging horn'],
  },
  {
    id: 224,
    path: 'Electronics > Audio > Audio Components > Audio Amplifiers',
    keywords: ['power amplifier', 'mixer amplifier', 'dsp amplifier', '100v'],
  },
  {
    id: 246,
    path: 'Electronics > Audio > Audio Components > Audio Mixers',
    keywords: ['digital mixer', 'mixing console', 'dsp', 'biamp', 'q-sys', 'soundcraft', 'behringer'],
  },
  {
    id: 245,
    path: 'Electronics > Audio > Audio Components > Audio Processors',
    keywords: ['dsp', 'echo cancellation', 'aec', 'audio matrix', 'dante'],
  },
  {
    id: 5171,
    path: 'Electronics > Audio > Audio Components > Simultaneous Interpretation Systems',
    keywords: ['bosch', 'interpreter', 'translation', 'ir receiver', 'delegate system'],
  },
  {
    id: 230,
    path: 'Electronics > Audio > Audio Accessories > Microphone Stands',
    keywords: ['mic stand', 'boom arm', 'shock mount'],
  },

  // Projectors, Displays, Interactive Flat Panels & LED/SMD Video Walls
  {
    id: 342,
    path: 'Electronics > Video > Projectors',
    keywords: ['projector', 'benq', 'epson', 'optoma', 'panasonic', 'sony', 'viewsonic', 'laser projector', '4k projector'],
  },
  {
    id: 2997,
    path: 'Electronics > Video > Projectors > Multimedia Projectors',
    keywords: ['multimedia projector', 'boardroom projector', 'auditorium projector', 'lumen'],
  },
  {
    id: 3000,
    path: 'Electronics > Video > Video Accessories > Projection Screens',
    keywords: ['projector screen', 'motorized screen', 'fast fold screen'],
  },
  {
    id: 305,
    path: 'Electronics > Video > Televisions',
    keywords: ['commercial display', '4k display', 'smart tv', 'signage'],
  },
  {
    id: 3001,
    path: 'Electronics > Video > Computer Monitors',
    keywords: ['monitor', 'interactive display', 'touch display', 'horion', 'smart board', 'ifp'],
  },
  {
    id: 505397,
    path: 'Electronics > Video > Video Accessories > Digital Signage',
    keywords: ['digital signage', 'smd', 'led wall', 'led screen', 'video wall', 'standee', 'kiosk'],
  },
  {
    id: 404,
    path: 'Electronics > Video > Televisions & Video > Video Wall Displays',
    keywords: ['video wall', 'smd cabinet', 'fine pitch led', 'p2.5', 'p3.9'],
  },
  {
    id: 505396,
    path: 'Electronics > Video > Video Accessories > Television & Monitor Mounts',
    keywords: ['tv mount', 'floor stand', 'mobile cart', 'wall bracket', 'vesa'],
  },

  // Broadcast, Video Switching, Teleprompters & Cameras
  {
    id: 312,
    path: 'Electronics > Video > Video Editing Hardware & Production Equipment',
    keywords: ['switcher', 'blackmagic', 'atem', 'analog way', 'novastar', 'led processor', 'capture card', 'broadcast'],
  },
  {
    id: 499969,
    path: 'Electronics > Video > Video Accessories > Teleprompters',
    keywords: ['teleprompter', 'podium prompter', 'autocue', 'beam splitter', 'presidential prompter'],
  },
  {
    id: 311,
    path: 'Electronics > Video > Video Players & Recorders',
    keywords: ['recorder', 'hyperdeck', 'media server', 'playback'],
  },
  {
    id: 152,
    path: 'Cameras & Optics > Cameras > Video Cameras',
    keywords: ['ptz camera', 'camcorder', '4k camera', 'eagleeye', 'auto tracking', 'ndi camera', 'broadcast camera'],
  },
  {
    id: 2092,
    path: 'Cameras & Optics > Cameras > Webcams',
    keywords: ['webcam', 'usb camera', 'personal conferencing', 'brio', 'poly p5', 'poly p15'],
  },
  {
    id: 386,
    path: 'Cameras & Optics > Cameras > Surveillance Cameras',
    keywords: ['ip camera', 'cctv', 'hikvision', 'dahua', 'axis', 'uniview', 'dome camera', 'bullet camera', 'colorvu', 'ptz surveillance'],
  },
  {
    id: 2562,
    path: 'Cameras & Optics > Camera & Optic Accessories > Tripods & Monopods',
    keywords: ['tripod', 'fluid head', 'camera stand'],
  },
  {
    id: 141,
    path: 'Cameras & Optics',
    keywords: ['camera', 'lens', 'optics'],
  },

  // AV Signal Routing, Control Systems & Touch Panels
  {
    id: 2046,
    path: 'Electronics > Video > Video Accessories > Video Splitters & Switches',
    keywords: ['hdmi matrix', 'sdi switcher', 'kvm', 'video extender', 'hdbaset', 'extron', 'crestron', 'kramer'],
  },
  {
    id: 2047,
    path: 'Electronics > Video > Video Accessories > Video Transmitters',
    keywords: ['wireless presentation', 'barco clickshare', 'hdmi transmitter', 'ndi encoder', 'hdmi over ip'],
  },
  {
    id: 309,
    path: 'Electronics > Electronics Accessories > Remote Controls',
    keywords: ['touch controller', 'tc8', 'tc10', 'room navigator', 'tap ip', 'control panel'],
  },

  // Networking, Servers & Computing
  {
    id: 284,
    path: 'Electronics > Networking',
    keywords: ['network', 'poe', 'enterprise wifi'],
  },
  {
    id: 292,
    path: 'Electronics > Networking > Hubs & Switches',
    keywords: ['poe switch', 'managed switch', 'gigabit switch', 'av over ip switch', 'netgear', 'cisco switch'],
  },
  {
    id: 291,
    path: 'Electronics > Networking > Routers',
    keywords: ['router', 'firewall', 'gateway', 'sd-wan'],
  },
  {
    id: 297,
    path: 'Electronics > Networking > Wireless Access Points',
    keywords: ['access point', 'wifi 6', 'wifi 7', 'unifi'],
  },
  {
    id: 325,
    path: 'Electronics > Computers > Desktop Computers',
    keywords: ['mini pc', 'compute', 'nuc', 'meeting room pc', 'zoom room pc', 'teams room compute'],
  },
  {
    id: 328,
    path: 'Electronics > Computers > Laptops',
    keywords: ['laptop', 'workstation', 'media laptop'],
  },
  {
    id: 4745,
    path: 'Electronics > Computers > Tablet Computers',
    keywords: ['tablet', 'room scheduler', 'booking panel'],
  },
  {
    id: 331,
    path: 'Electronics > Computers > Computer Servers',
    keywords: ['server', 'media server', 'pbx appliance', 'nvr'],
  },

  // Cables, Power & Racks
  {
    id: 263,
    path: 'Electronics > Electronics Accessories > Cables',
    keywords: ['hdmi cable', 'sdi cable', 'xlr', 'cat6', 'fiber optic', 'usb-c'],
  },
  {
    id: 261,
    path: 'Electronics > Electronics Accessories > Power > UPS',
    keywords: ['ups', 'power backup', 'pdu', 'rack power'],
  },
  {
    id: 4519,
    path: 'Electronics > Electronics Accessories > Electronics Cabinets & Racks',
    keywords: ['av rack', 'server cabinet', 'flight case', '19-inch rack'],
  },

  // Stage Lighting & Event Production
  {
    id: 505351,
    path: 'Arts & Entertainment > Party & Celebration > Special Effects > Stage Lighting',
    keywords: ['stage lighting', 'moving head', 'dmx', 'par light', 'fresnel', 'studio light', 'led panel'],
  },
  {
    id: 505352,
    path: 'Arts & Entertainment > Party & Celebration > Special Effects > Lighting Controllers',
    keywords: ['dmx controller', 'lighting console'],
  },

  // Software & Licenses
  {
    id: 313,
    path: 'Software > Computer Software',
    keywords: ['license', 'google meet license', 'zoom license', '3cx license', 'software', 'subscription'],
  },
  {
    id: 5301,
    path: 'Software > Computer Software > Business & Productivity Software',
    keywords: ['enterprise license', 'cloud pbx', 'room license', 'management software'],
  },

  // Office Furniture & Conference Rooms
  {
    id: 6362,
    path: 'Furniture > Office Furniture > Conference Room Tables',
    keywords: ['boardroom table', 'conference table', 'podium', 'lectern'],
  },
  {
    id: 6978,
    path: 'Office Supplies > Presentation Supplies > Dry-Erase Boards',
    keywords: ['whiteboard', 'smartboard', 'interactive board'],
  },

  // Top-level Fallback
  {
    id: 222,
    path: 'Electronics',
    keywords: ['electronics', 'hardware', 'equipment'],
  },
];

/**
 * Formats a taxonomy entry in Google Merchant Center's accepted canonical string format.
 */
export function formatGoogleTaxonomyOption(cat: GoogleTaxonomyCategory): string {
  return cat.path;
}

/**
 * Searches official Google Product Taxonomy entries by ID, path segments, or hardware keywords.
 */
export function searchGoogleTaxonomy(query: string, limit = 15): GoogleTaxonomyCategory[] {
  const q = query.trim().toLowerCase();
  if (!q) return GOOGLE_PRODUCT_TAXONOMY.slice(0, limit);

  const tokens = q.split(/\s+/).filter(Boolean);
  const scored = GOOGLE_PRODUCT_TAXONOMY.map((cat) => {
    const idStr = String(cat.id);
    const pathLower = cat.path.toLowerCase();
    const kwLower = (cat.keywords || []).join(' ').toLowerCase();

    let score = 0;
    if (idStr === q) score += 100;
    else if (idStr.startsWith(q)) score += 60;

    if (pathLower === q) score += 90;
    else if (pathLower.includes(q)) score += 45;

    if (kwLower.includes(q)) score += 35;

    let allTokensMatch = true;
    for (const token of tokens) {
      if (idStr.includes(token) || pathLower.includes(token) || kwLower.includes(token)) {
        score += 15;
      } else {
        allTokensMatch = false;
      }
    }

    if (!allTokensMatch && score < 30) return { cat, score: 0 };
    return { cat, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.cat);
}

/**
 * Infers the best matching official Google Product Taxonomy path from store categories or product name.
 */
export function inferDefaultGoogleCategory(
  categorySlugs?: string[] | string,
  productName?: string
): string {
  const slugs = Array.isArray(categorySlugs)
    ? categorySlugs.join(' ').toLowerCase()
    : String(categorySlugs || '').toLowerCase();
  const text = `${slugs} ${String(productName || '').toLowerCase()}`;

  if (/teleprompter|prompter/.test(text)) {
    return 'Electronics > Video > Video Accessories > Teleprompters';
  }
  if (/headset|evolve|blackwire|voyager|bh70/.test(text)) {
    return 'Electronics > Communications > Telephony > Telephone Accessories > Telephone Headsets';
  }
  if (/projector|benq|epson|optoma|pt-rq|pt-vmz|lsd400|bravia projector/.test(text)) {
    return 'Electronics > Video > Projectors';
  }
  if (/intercom|door station|2n|a8105/.test(text)) {
    return 'Electronics > Communications > Intercoms';
  }
  if (/pa system|paviro|va-6200|public address|paging/.test(text)) {
    return 'Electronics > Audio > Audio Components > Public Address Systems';
  }
  if (/ip-camera|camera|hikvision|dahua|uniview|m3065|colorvu|surveillance/.test(text)) {
    return 'Cameras & Optics > Cameras > Surveillance Cameras';
  }
  if (/ip-phone|gxp|sip-t|vvx|fanvil/.test(text)) {
    return 'Electronics > Communications > Telephony > Corded Phones';
  }
  if (/3cx|freepbx|ucm63|pbx|voip/.test(text)) {
    return 'Electronics > Communications > Telephony';
  }
  if (/license|google meet hardware/.test(text)) {
    return 'Software > Computer Software > Business & Productivity Software';
  }
  if (/horion|interactive|display|smd|led wall/.test(text)) {
    return 'Electronics > Video > Computer Monitors';
  }
  if (/mic|microphone|shure|vissonic/.test(text)) {
    return 'Electronics > Audio > Audio Components > Microphones';
  }

  return 'Electronics > Communications > Telephony > Video Conferencing';
}

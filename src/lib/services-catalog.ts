import { Service } from './firebase/firestore-helpers';

export interface EnrichedService extends Service {
  faqs?: { q: string; a: string }[];
  keywords?: string;
}

export const FALLBACK_SERVICES_CATALOG: EnrichedService[] = [
  {
    id: 'corporate-events',
    slug: 'corporate-events',
    title: 'Corporate Event Management & Turnkey Stage Production in Pakistan',
    description:
      'End-to-end Corporate event management, executive summit staging, fine-pitch SMD LED video walls, line-array PA sound, and 3D Hologram Display production across Lahore, Karachi, and Islamabad.',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3062/3062634.png',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1400',
    isActive: true,
    order: 1,
    category: 'Event Production',
    serviceType: 'Corporate event management',
    priceRange: 'PKR 150,000 - PKR 5,000,000+',
    keywords:
      'Corporate event management, Event management, events, hybrid event, Hologram Display, Video Conference in Pakistan, Video conference, Polycom Group 500, Poly X70, corporate events Lahore Karachi Islamabad',
    detailedContent: `
      <h2>Turnkey Corporate Event Management in Lahore, Karachi & Islamabad</h2>
      <p>AV Live Communications is Pakistan's premier engineering-led <strong>Corporate event management</strong> partner. Unlike traditional event planners who outsource technical gear, we own and operate an extensive inventory of fine-pitch SMD LED walls, digital line-array audio systems, <strong>3D Hologram Display</strong> stages, and enterprise <strong>Video conference</strong> codecs including the <strong>Polycom Group 500</strong> and <strong>Poly Studio X70 (Poly X70)</strong>.</p>
      <h3>What Our Corporate Event Management Covers:</h3>
      <ul>
        <li><strong>Executive Keynotes & Annual General Meetings (AGMs):</strong> Complete stage design, confidence monitors, motorized podiums, and redundant wireless gooseneck microphones.</li>
        <li><strong>Product Launches & 3D Hologram Reveals:</strong> High-impact <strong>Hologram Display</strong> stage projection, Pepper's Ghost illusions, and 20,000+ ANSI lumen laser projection mapping.</li>
        <li><strong>Boardroom-to-Ballroom Video Conference Bridging:</strong> Seamless two-way integration between live hotel ballrooms (PC, Serena, Marriott, Expo Centre) and remote global executives via <strong>Polycom Group 500</strong> and <strong>Poly X70</strong> hardware.</li>
        <li><strong>Precision Acoustic & Lighting Engineering:</strong> DMX intelligent moving-head lighting rigs, digital mixing consoles, and acoustic room tuning for zero feedback.</li>
      </ul>
    `,
    faqs: [
      {
        q: 'Which cities in Pakistan does AV Live cover for Corporate event management?',
        a: 'We provide full-scale Corporate event management, on-site AV engineering, and stage production in Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, and Peshawar.'
      },
      {
        q: 'Can you integrate a 3D Hologram Display or remote Video conference speaker into our corporate event?',
        a: 'Yes. We specialize in holographic executive telepresence and 3D Hologram Display product launches, as well as bridging remote speakers via Poly X70 and Polycom Group 500 codecs into the live stage LED wall.'
      }
    ]
  },
  {
    id: 'hybrid-events',
    slug: 'hybrid-events',
    title: 'Hybrid Event Production & Live Video Conference Broadcasting in Pakistan',
    description:
      'Broadcast-grade hybrid event engineering combining multi-camera SDI switching, zero-echo acoustic mix-minus, and enterprise Video Conference in Pakistan via Poly X70 and Polycom Group 500.',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1400',
    isActive: true,
    order: 2,
    category: 'Hybrid & Broadcast',
    serviceType: 'hybrid event',
    priceRange: 'PKR 120,000 - PKR 3,500,000',
    keywords:
      'hybrid event, Video Conference in Pakistan, Video conference, Polycom Group 500, Poly X70, Corporate event management, Event management, Hologram Display, events',
    detailedContent: `
      <h2>Enterprise Hybrid Event Engineering & Multi-Camera Broadcast</h2>
      <p>Modern corporate summits require flawless synchronization between in-person attendees and remote participants. AV Live engineers broadcast-grade <strong>hybrid event</strong> environments across Pakistan, uniting live venue production with enterprise <strong>Video Conference in Pakistan</strong> infrastructure.</p>
      <h3>Key Technical Capabilities:</h3>
      <ul>
        <li><strong>Hardware Codec Bridging:</strong> Direct SDI/HDMI integration with <strong>Polycom RealPresence Group 500</strong>, <strong>Poly Studio X70 (Poly X70)</strong>, Zoom Rooms, and Microsoft Teams Rooms.</li>
        <li><strong>Multi-Camera 4K PTZ & Broadcast Switching:</strong> Optical PTZ cameras, live lower-thirds graphics, picture-in-picture presentation layouts, and multi-CDN simulcasting (YouTube, LinkedIn Live, Zoom, Teams).</li>
        <li><strong>DSP Mix-Minus Audio Routing:</strong> Dedicated digital signal processing so remote <strong>Video conference</strong> callers hear crystal-clear venue audio with zero acoustic echo or latency.</li>
        <li><strong>Interactive Audience Q&A:</strong> Wireless catch-mics, Delegate conference microphone arrays, and real-time remote participant projection on stage SMD screens.</li>
      </ul>
    `,
    faqs: [
      {
        q: 'How do you prevent audio echo between the live hall PA system and remote Zoom/Teams participants?',
        a: 'We deploy hardware DSP acoustic echo cancellation (AEC) and dedicated mix-minus buses linked to enterprise codecs like the Polycom Group 500 and Poly X70, ensuring zero feedback for both in-room and remote audiences.'
      },
      {
        q: 'Can you stream a hybrid event simultaneously to Zoom, Microsoft Teams, and YouTube?',
        a: 'Yes, our hardware encoders and broadcast switchers support bonded multi-network cellular/fiber internet and simultaneous 1080p60 RTMP streaming to Zoom Webinars, Microsoft Teams Town Halls, YouTube, and Facebook.'
      }
    ]
  },
  {
    id: 'expo-organizing',
    slug: 'expo-organizing',
    title: 'Expo Organizing, Custom Exhibition Booths & Hologram Display Pavilions',
    description:
      'Turnkey trade show and expo organizing in Pakistan featuring custom 3D exhibition stalls, SMD video walls, interactive kiosks, and 3D Hologram Display attractors at Expo Centre Lahore & Karachi.',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1995/1995515.png',
    imageUrl: 'https://images.unsplash.com/photo-1559223607-a43c990c692c?auto=format&fit=crop&q=80&w=1400',
    isActive: true,
    order: 3,
    category: 'Exhibitions & Trade Shows',
    serviceType: 'Event management',
    priceRange: 'PKR 250,000 - PKR 8,000,000',
    keywords:
      'Expo organizing Pakistan, Event management, Corporate event management, Hologram Display, events, hybrid event, Video Conference in Pakistan',
    detailedContent: `
      <h2>Turnkey Exhibition Pavilions & Trade Show Engineering</h2>
      <p>Stand out at Lahore Expo Centre, Karachi Expo Centre, and Pak-China Friendship Centre Islamabad with AV Live's custom <strong>Expo Organizing</strong> and bespoke booth fabrication services.</p>
      <ul>
        <li><strong>3D Hologram Display Attractors:</strong> Draw maximum foot traffic to your exhibition stall using floating 3D holographic LED fan walls and holographic display pyramids.</li>
        <li><strong>Curved & Corner SMD LED Video Walls:</strong> Seamless P2.5 and P1.8 fine-pitch LED cabinets integrated flush into custom woodwork and aluminum truss structures.</li>
        <li><strong>Interactive Touch Kiosks & Meeting Pods:</strong> Sound-isolated booth meeting zones equipped with <strong>Poly X70</strong> video bars for instant demos with global headquarters.</li>
      </ul>
    `,
    faqs: [
      {
        q: 'Do you provide 3D Hologram Displays for exhibition booths at Lahore and Karachi Expo Centres?',
        a: 'Yes! We rent and install single and multi-fan 3D Hologram Display matrices and holographic showcase cabinets specifically designed to stop foot traffic at crowded trade expos.'
      }
    ]
  },
  {
    id: 'esports-events',
    slug: 'esports-events',
    title: 'e-Sports Tournament Arena Setup & Broadcast Production in Pakistan',
    description:
      'High-refresh tournament LAN arenas, low-latency SDI broadcast observation, stage SMD LED walls, and concert-grade lighting for e-Sports events across Pakistan.',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/686/686589.png',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1400',
    isActive: true,
    order: 4,
    category: 'Esports & Experiential',
    serviceType: 'Event management',
    priceRange: 'PKR 300,000 - PKR 6,000,000',
    keywords:
      'esports events Pakistan, Event management, Corporate event management, hybrid event, Hologram Display, events',
    detailedContent: `
      <h2>Championship-Grade e-Sports Arena & Broadcast Engineering</h2>
      <p>AV Live engineers full-scale competitive gaming stages, player booths, caster desks, and multi-stream observer production for Pakistan's largest e-Sports tournaments and university championships.</p>
      <ul>
        <li><strong>Stage & Player Pod Fabrication:</strong> Custom 5v5 sound-dampened player stages with DMX reactive lighting and player face-cams.</li>
        <li><strong>Ultra-Wide SMD LED Scoreboards & Main Screens:</strong> Zero-tearing 60fps+ LED wall processors for live gameplay, instant replays, and <strong>3D Hologram Display</strong> trophy/character reveals.</li>
        <li><strong>Live Caster Desk & Multi-Platform Broadcast:</strong> Real-time NDI/SDI game capture, shoutcaster audio consoles, and Twitch/YouTube 1080p60 broadcast pipelines.</li>
      </ul>
    `,
    faqs: [
      {
        q: 'Can AV Live handle both the stage SMD screens and the live Twitch/YouTube observer broadcast?',
        a: 'Yes, we provide complete end-to-end e-Sports production including stage trussing, P2.5 SMD LED walls, player comms, shoutcaster desks, and multi-camera live broadcast switching.'
      }
    ]
  },
  {
    id: 'ai-development',
    slug: 'ai-development',
    title: 'Enterprise AI Development & Smart AV Room Intelligence in Pakistan',
    description:
      'Custom enterprise AI software development, intelligent meeting room analytics, automated transcription, and computer-vision integration for corporate operations in Pakistan.',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1400',
    isActive: true,
    order: 5,
    category: 'AI & Automation',
    serviceType: 'Enterprise AI Development',
    priceRange: 'Custom Enterprise Scope',
    keywords:
      'AI development Pakistan, Video Conference in Pakistan, Corporate event management, hybrid event, Poly X70',
    detailedContent: `
      <h2>Custom AI Software & Unified Communications Intelligence</h2>
      <p>We build secure, enterprise-grade AI applications that integrate with your corporate communication stack, ERP/CRM systems, and smart boardroom infrastructure across Pakistan.</p>
      <ul>
        <li><strong>Automated Meeting Intelligence:</strong> Urdu and English bilingual meeting transcription, action-item extraction, and CRM logging integrated with Zoom Rooms and Microsoft Teams Rooms.</li>
        <li><strong>Event Registration & Facial Check-In:</strong> Fast QR and computer-vision attendee check-in kiosks for large-scale <strong>Corporate event management</strong> and expos.</li>
        <li><strong>Private RAG Knowledge Bases:</strong> Secure internal enterprise search and knowledge assistants deployed on your cloud or on-premise infrastructure.</li>
      </ul>
    `,
    faqs: [
      {
        q: 'Can your AI solutions integrate with our existing Video conference and CRM systems?',
        a: 'Yes, we build custom API integrations connecting Zoom, Microsoft Teams, 3CX/Cisco VoIP systems, and enterprise CRMs like HubSpot, Salesforce, and custom ERPs.'
      }
    ]
  },
  {
    id: 'ai-agents-workers',
    slug: 'ai-agents-workers',
    title: 'Autonomous AI Agents & Digital Workers for Enterprise Support',
    description:
      '24/7 autonomous AI agents for lead qualification, SIP/VoIP voice reception, WhatsApp business automation, and technical support triage in Pakistan.',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png',
    imageUrl: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&q=80&w=1400',
    isActive: true,
    order: 6,
    category: 'AI & Automation',
    serviceType: 'AI Digital Workers',
    priceRange: 'Custom Enterprise Scope',
    keywords:
      'AI agents Pakistan, VoIP AI integration, Corporate event management, Video Conference in Pakistan',
    detailedContent: `
      <h2>24/7 Autonomous AI Digital Workers & Voice/Chat Agents</h2>
      <p>Deploy intelligent AI agents that handle customer inquiries, schedule boardroom demonstrations, manage event RSVP confirmations, and route SIP/VoIP calls automatically.</p>
      <ul>
        <li><strong>Omnichannel Event & Sales Concierge:</strong> Automated WhatsApp, web, and voice agents for instant event registration, booth inquiries, and hardware quote generation.</li>
        <li><strong>SIP & IP-PBX Voice Integration:</strong> Connect AI voice agents directly with 3CX, Grandstream UCM, and Cisco Call Manager systems.</li>
      </ul>
    `,
    faqs: [
      {
        q: 'Do your AI agents support WhatsApp and local Pakistani VoIP PBX trunks?',
        a: 'Yes, our AI agents integrate directly with WhatsApp Business API, web chat, and SIP-based IP PBX platforms such as 3CX and Grandstream.'
      }
    ]
  },
  {
    id: 'ai-automation',
    slug: 'ai-automation',
    title: 'Enterprise Workflow & n8n Business Process Automation in Pakistan',
    description:
      'End-to-end business workflow automation using n8n, webhooks, CRM synchronization, automated B2B quotation pipelines, and smart AV room scheduling.',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1087/1087840.png',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1400',
    isActive: true,
    order: 7,
    category: 'AI & Automation',
    serviceType: 'Workflow Automation',
    priceRange: 'Custom Enterprise Scope',
    keywords:
      'AI automation Pakistan, n8n workflow automation, Corporate event management, Video Conference in Pakistan',
    detailedContent: `
      <h2>Enterprise Workflow & Smart Boardroom Automation</h2>
      <p>Eliminate manual data entry and operational bottlenecks with AV Live's custom n8n and API workflow automation engineering.</p>
      <ul>
        <li><strong>Automated B2B Procurement & Quote Pipelines:</strong> Instant quotation generation, NTN tax calculation, and Google Sheets / ERP synchronization.</li>
        <li><strong>Smart Conference Room Provisioning:</strong> Automated calendar-to-boardroom wake-up triggers, lighting presets, and <strong>Video conference</strong> session launch.</li>
      </ul>
    `,
    faqs: [
      {
        q: 'Can you automate event lead capture and B2B hardware quote workflows?',
        a: 'Yes, we design resilient n8n and webhook pipelines that route leads from your website, expos, and hybrid events directly into Google Sheets, Slack, WhatsApp, and your CRM in real time.'
      }
    ]
  },
  {
    id: 'boardroom-integration',
    slug: 'boardroom-integration',
    title: 'Boardroom AV & Video Conferencing Integration',
    description:
      'Turnkey executive boardroom AV design, acoustic calibration, Polycom Group 500 & Poly Studio X70 deployment, and Zoom / Microsoft Teams Rooms integration across Pakistan.',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3050/3050525.png',
    isActive: true,
    order: 8,
    category: 'Video Conferencing & Pro-AV',
    serviceType: 'Boardroom AV Integration',
    priceRange: 'PKR 350,000 - PKR 12,000,000',
    keywords:
      'Boardroom integration Pakistan, Video Conference in Pakistan, Polycom Group 500, Poly X70, Zoom Rooms Pakistan, Microsoft Teams Rooms Pakistan, conference room AV setup',
    detailedContent: `
      <h2>Turnkey Executive Boardroom & Video Conference Integration in Pakistan</h2>
      <p>AV Live Communications engineers and installs standards-based corporate boardrooms, training halls, and command centers across Lahore, Karachi, and Islamabad. We integrate flagship <strong>Video Conference in Pakistan</strong> codecs—including the <strong>Polycom RealPresence Group 500 (Polycom Group 500)</strong>, <strong>Poly Studio X70 (Poly X70)</strong>, Logitech Rally Bar, and Cisco Room Kit Plus—with architectural acoustics and one-touch room automation.</p>
      <ul>
        <li><strong>Multi-Camera & Optical PTZ Tracking:</strong> Precision speaker framing using Poly DirectorAI, EagleEye IV 12x optical zoom cameras, and Logitech RightSight 2.</li>
        <li><strong>Beamforming Ceiling Audio & DSP Calibration:</strong> Zero-echo room acoustics powered by Poly NoiseBlockAI, Acoustic Fence, and multi-zone ceiling microphone arrays.</li>
        <li><strong>Native Zoom Rooms & Microsoft Teams Rooms (MTR):</strong> Dedicated touch-panel controllers, wireless 4K content sharing, and H.323/SIP interoperability.</li>
        <li><strong>4K Commercial Displays & Fine-Pitch SMD Video Walls:</strong> Dual-display boardroom configurations and seamless LED video walls with concealed table connectivity boxes.</li>
      </ul>
    `,
    faqs: [
      {
        q: 'What hardware is recommended for a 16-to-24 seat executive boardroom in Pakistan?',
        a: 'For large 16-to-24 seat boardrooms, we recommend either the Poly Studio X70 (Poly X70) dual-4K AI video bar with expansion microphones or the Polycom RealPresence Group 500 paired with an EagleEye IV 12x PTZ camera and ceiling microphone array.'
      },
      {
        q: 'Do you provide on-site acoustic surveys and structured cabling in Lahore, Karachi, and Islamabad?',
        a: 'Yes. Our certified Pro-AV engineering teams conduct on-site room surveys, RT60 acoustic assessments, concealed HDMI/Cat6A floor-box cabling, and complete commissioning nationwide.'
      }
    ]
  },
  {
    id: 'voip-telephony',
    slug: 'voip-telephony',
    title: 'Enterprise VoIP Telephony & IP PBX Deployment',
    description:
      'Scalable SIP IP PBX systems, multi-branch VoIP trunking, call center queues, and PoE desk phone provisioning for 3CX, FreePBX, Grandstream UCM, and Cisco CUCM in Pakistan.',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3059/3059502.png',
    isActive: true,
    order: 9,
    category: 'Unified Communications',
    serviceType: 'Enterprise VoIP & IP PBX',
    priceRange: 'PKR 150,000 - PKR 8,500,000',
    keywords:
      'VoIP telephony Pakistan, IP PBX installation Lahore Karachi Islamabad, 3CX Pakistan, FreePBX Enterprise, Grandstream UCM6308, Cisco CUCM, SIP phones Pakistan',
    detailedContent: `
      <h2>Enterprise VoIP Telephony, IP PBX & Multi-Branch Unified Communications</h2>
      <p>Modernize your corporate voice infrastructure with encrypted SIP telephony, zero-touch IP phone provisioning, and hybrid cloud PBX architecture engineered by AV Live Communications.</p>
      <ul>
        <li><strong>IP PBX Appliances & Cloud Licensing:</strong> Turnkey deployment of <strong>Grandstream UCM6308</strong>, <strong>3CX PRO Enterprise</strong>, <strong>FreePBX Enterprise</strong>, and <strong>Cisco Unified Communications Manager (CUCM)</strong>.</li>
        <li><strong>Executive & Call Center SIP Endpoints:</strong> Mass auto-provisioning of Cisco 8800 series, Poly VVX, Yealink T54W, Grandstream Carrier-Grade, and Fanvil IP phones.</li>
        <li><strong>Multi-Site SIP Peering & PRI/FXO Gateways:</strong> Toll-free inter-branch calling between Lahore, Karachi, Islamabad, and international offices with failover PSTN trunks.</li>
        <li><strong>SIP Intercom & PA Paging Integration:</strong> Unified door access control and emergency voice paging via 2N IP Vario, Axis, and Bosch PAVIRO systems.</li>
      </ul>
    `,
    faqs: [
      {
        q: 'Can AV Live connect our Lahore, Karachi, and Islamabad offices onto a single unified PBX extension dial-plan?',
        a: 'Yes. We configure encrypted TLS/SRTP SIP trunks between branch offices so employees can dial 3- or 4-digit extensions nationwide with zero inter-branch call charges.'
      },
      {
        q: 'Do you support CRM integration and call recording for contact centers?',
        a: 'Yes, our 3CX, FreePBX, and Grandstream UCM deployments include automated call recording, live queue wallboards, SLA reporting, and native CRM screen-pop integration.'
      }
    ]
  }
];

export function mergeWithFallbackServices(firestoreServices: Service[]): EnrichedService[] {
  const bySlug = new Map<string, EnrichedService>();
  for (const fallback of FALLBACK_SERVICES_CATALOG) {
    bySlug.set(fallback.slug, fallback);
  }
  for (const svc of firestoreServices) {
    const slug = svc.slug || svc.id || '';
    if (!slug) continue;
    const existing = bySlug.get(slug);
    if (existing) {
      bySlug.set(slug, {
        ...existing,
        ...svc,
        description: svc.description || existing.description,
        detailedContent: svc.detailedContent || existing.detailedContent,
        imageUrl: svc.imageUrl || existing.imageUrl,
        iconUrl: svc.iconUrl || existing.iconUrl,
        faqs: existing.faqs
      });
    } else {
      bySlug.set(slug, svc);
    }
  }
  return Array.from(bySlug.values()).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

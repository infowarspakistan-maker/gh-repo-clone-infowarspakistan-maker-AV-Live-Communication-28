import { Service } from './firebase/firestore-helpers';

export interface EnrichedService extends Service {
  faqs?: { q: string; a: string }[];
  keywords?: string;
  localizedH1?: string;
  offeringsBreakdown?: { title: string; detail: string }[];
  caseStudies?: { hub: string; project: string; outcome: string }[];
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
    localizedH1: 'Corporate Event Management & Stage Production in Lahore, Karachi & Islamabad',
    keywords:
      'Corporate event management, Event management, SMD LED screen rental for corporate events, 3D hologram display stages Pakistan, Corporate hybrid event live streaming Lahore, Multi-camera event broadcasting Karachi, events, hybrid event, Hologram Display, Video Conference in Pakistan',
    offeringsBreakdown: [
      {
        title: 'Hybrid Event Broadcasting',
        detail: 'Two-way broadcast bridging connecting hotel ballrooms in Lahore, Karachi, and Islamabad with global Zoom Rooms, Microsoft Teams, and Poly Studio X70 endpoints.'
      },
      {
        title: '3D Hologram Display Stages',
        detail: 'Turnkey 3D hologram display stages Pakistan-wide using HoloGauze optical mesh, Pepper’s Ghost projection, and synchronized 3D LED holographic fan walls.'
      },
      {
        title: 'SMD LED Screen Rental & Multi-Camera Live Streaming',
        detail: 'Fine-pitch P2.5 SMD LED screen rental for corporate events paired with 4K SDI multi-camera event broadcasting and digital line-array PA sound.'
      }
    ],
    caseStudies: [
      {
        hub: 'Johar Town & Gulberg, Lahore',
        project: '500-Executive Annual Banking Summit & 3D Hologram Keynote',
        outcome: 'Deployed a 24ft P2.5 curved SMD LED stage, 3D hologram display stage reveal, and zero-downtime hybrid Zoom broadcast with 2 standby engineers.'
      },
      {
        hub: 'Clifton & DHA, Karachi',
        project: 'Multinational Pharmaceutical Launch & Multi-Camera Broadcast',
        outcome: 'Executed 4-camera SDI live switching, digital wireless gooseneck arrays, and simultaneous Karachi-to-Dubai executive telepresence.'
      },
      {
        hub: 'Blue Area, Islamabad',
        project: 'Diplomatic & Policy Forum Turnkey AV Staging',
        outcome: 'Delivered Bosch digital conference microphone delegation, fine-pitch SMD confidence walls, and encrypted hybrid event streaming.'
      }
    ],
    detailedContent: `
      <h2>Turnkey Corporate Event Management in Lahore, Karachi & Islamabad</h2>
      <p>AV Live Communications is Pakistan's premier engineering-led <strong>Corporate event management</strong> partner. Unlike traditional event planners who outsource technical gear, we own and operate an extensive inventory of <strong>SMD LED screen rental for corporate events</strong>, digital line-array audio systems, <strong>3D hologram display stages Pakistan</strong>, and enterprise <strong>Video conference</strong> codecs including the <strong>Polycom Group 500</strong> and <strong>Poly Studio X70 (Poly X70)</strong>.</p>
      <h3>What Our Corporate Event Management Covers:</h3>
      <ul>
        <li><strong>Executive Keynotes & Annual General Meetings (AGMs):</strong> Complete stage design, confidence monitors, motorized podiums, and redundant wireless gooseneck microphones.</li>
        <li><strong>Product Launches & 3D Hologram Display Stages Pakistan:</strong> High-impact <strong>Hologram Display</strong> stage projection, Pepper's Ghost illusions, and 20,000+ ANSI lumen laser projection mapping.</li>
        <li><strong>Corporate Hybrid Event Live Streaming Lahore & Multi-Camera Event Broadcasting Karachi:</strong> Seamless two-way integration between live hotel ballrooms (PC, Serena, Marriott, Expo Centre) and remote global executives via <strong>Polycom Group 500</strong> and <strong>Poly X70</strong> hardware.</li>
        <li><strong>Precision Acoustic & Lighting Engineering:</strong> DMX intelligent moving-head lighting rigs, digital mixing consoles, and acoustic room tuning for zero feedback.</li>
      </ul>
    `,
    faqs: [
      {
        q: 'What is included in your SMD LED screen rental for corporate events and hybrid staging?',
        a: 'Our turnkey corporate event packages include fine-pitch P2.5 indoor SMD LED video walls, Novastar 4K processors, stage trussing, line-array PA sound, multi-camera event broadcasting, and on-site standby AV engineers in Lahore, Karachi, and Islamabad.'
      },
      {
        q: 'Can you integrate a 3D hologram display stage or remote Video conference speaker into our corporate event?',
        a: 'Yes. We specialize in 3D hologram display stages in Pakistan for product reveals and holographic keynotes, as well as bridging remote speakers via Cisco, Poly X70, and Polycom Group 500 codecs into the live stage LED wall.'
      },
      {
        q: 'What is the cost of a 30-person executive boardroom AV setup or corporate townhall stage?',
        a: 'A turnkey 30-person executive boardroom AV setup ranges from PKR 1,450,000 to PKR 3,200,000 depending on dual-display 4K interactive flat panels, optical PTZ cameras (Poly Studio X72 / Cisco Room Kit Plus), and ceiling microphone arrays. Corporate event staging starts from PKR 150,000 for single-day AV rental.'
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
    localizedH1: 'Corporate Hybrid Event Live Streaming & Multi-Camera Broadcasting in Lahore & Karachi',
    keywords:
      'Corporate hybrid event live streaming Lahore, Multi-camera event broadcasting Karachi, SMD LED screen rental for corporate events, 3D hologram display stages Pakistan, hybrid event, Video Conference in Pakistan, Polycom Group 500, Poly X70',
    offeringsBreakdown: [
      {
        title: 'Corporate Hybrid Event Live Streaming Lahore',
        detail: 'Low-latency 1080p60/4K RTMP simulcasting to Zoom Webinars, Microsoft Teams Town Halls, YouTube, and LinkedIn Live with bonded fiber/cellular failover.'
      },
      {
        title: 'Multi-Camera Event Broadcasting Karachi',
        detail: '4K optical PTZ & SDI broadcast camera chains with live lower-thirds, picture-in-picture keynote splits, and dedicated broadcast switching engineers.'
      },
      {
        title: 'Two-Way Codec & Hologram Stage Bridging',
        detail: 'Direct SDI/XLR mix-minus audio integration with Polycom Group 500, Poly Studio X70, Cisco Room Kits, and 3D hologram display stages.'
      }
    ],
    caseStudies: [
      {
        hub: 'DHA & Johar Town, Lahore',
        project: 'Regional FinTech Townhall & Hybrid Investor Broadcast',
        outcome: 'Connected 350 in-room executives with 1,200 remote Zoom attendees using Poly Studio X70 codecs and zero-echo DSP mix-minus audio.'
      },
      {
        hub: 'Clifton, Karachi',
        project: 'AGM Multi-Camera Event Broadcasting for Listed Corporation',
        outcome: 'SECP-compliant multi-camera live broadcast with real-time shareholder Q&A, dual SMD LED walls, and redundant streaming encoders.'
      }
    ],
    detailedContent: `
      <h2>Enterprise Hybrid Event Engineering & Multi-Camera Broadcast</h2>
      <p>Modern corporate summits require flawless synchronization between in-person attendees and remote participants. AV Live engineers broadcast-grade <strong>Corporate hybrid event live streaming Lahore</strong> and <strong>Multi-camera event broadcasting Karachi</strong>, uniting live venue production with enterprise <strong>Video Conference in Pakistan</strong> infrastructure.</p>
      <h3>Key Technical Capabilities:</h3>
      <ul>
        <li><strong>Hardware Codec Bridging:</strong> Direct SDI/HDMI integration with <strong>Polycom RealPresence Group 500</strong>, <strong>Poly Studio X70 (Poly X70)</strong>, Cisco Room Kit, Zoom Rooms, and Microsoft Teams Rooms.</li>
        <li><strong>Multi-Camera 4K PTZ & Broadcast Switching:</strong> Optical PTZ cameras, live lower-thirds graphics, picture-in-picture presentation layouts, and multi-CDN simulcasting (YouTube, LinkedIn Live, Zoom, Teams).</li>
        <li><strong>DSP Mix-Minus Audio Routing:</strong> Dedicated digital signal processing so remote <strong>Video conference</strong> callers hear crystal-clear venue audio with zero acoustic echo or latency.</li>
        <li><strong>Interactive Audience Q&A:</strong> Wireless catch-mics, Delegate conference microphone arrays, and real-time remote participant projection on <strong>SMD LED screen rental for corporate events</strong>.</li>
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
    localizedH1: 'Enterprise Video Conferencing Solutions in Lahore, Karachi & Islamabad',
    keywords:
      'Polycom video conferencing distributors Lahore, Cisco Room Kit installation Karachi, Boardroom AV integration services Islamabad, Interactive flat panel displays for business Lahore, Enterprise VoIP PBX setup Pakistan, Video Conference in Pakistan, Polycom Group 500, Poly X70',
    offeringsBreakdown: [
      {
        title: 'Executive Boardroom Integration (14–30+ Pax)',
        detail: 'Turnkey Cisco Room Kit installation in Karachi, Polycom Group 500 & Poly Studio X72 deployments in Lahore, and Bosch ceiling/table microphone integration in Islamabad.'
      },
      {
        title: 'Huddle Room & Medium Conference Kits (4–12 Pax)',
        detail: 'All-in-one 4K AI video bars (Poly Studio X52, Logitech Rally Bar Mini, Yealink MeetingBar A30) with one-touch Zoom Rooms and Microsoft Teams Rooms controllers.'
      },
      {
        title: 'Interactive Flat Panel Displays for Business',
        detail: '4K commercial interactive flat panel displays (Horion, ViewSonic, BenQ) with wireless BYOD screen sharing, digital whiteboarding, and built-in 48MP conferencing arrays.'
      }
    ],
    caseStudies: [
      {
        hub: 'Johar Town & DHA, Lahore',
        project: '28-Seat Corporate Headquarters Boardroom Fit-Out',
        outcome: 'Installed Poly Studio X72 dual-4K AI camera bar, 86" Horion interactive flat panel display, and concealed table mic pods with 15-minute SLA cover.'
      },
      {
        hub: 'Clifton & I.I. Chundrigar Road, Karachi',
        project: 'Commercial Bank Multi-Floor Cisco Room Kit Installation',
        outcome: 'Commissioned 12 Cisco Room Kit Plus and Room Bar endpoints with Room Navigator touch panels and acoustic glass-wall treatment.'
      },
      {
        hub: 'Blue Area & F-6, Islamabad',
        project: 'Public Sector Command Center & 30-Person Council Room',
        outcome: 'Integrated Polycom RealPresence Group 500 (EagleEye IV 12x PTZ) with 18 Bosch PAVIRO/CCS1000D delegate microphones and dual SMD displays.'
      }
    ],
    detailedContent: `
      <h2>Turnkey Executive Boardroom & Video Conference Integration in Pakistan</h2>
      <p>As leading <strong>Polycom video conferencing distributors Lahore</strong>, <strong>Cisco Room Kit installation Karachi</strong> specialists, and <strong>Boardroom AV integration services Islamabad</strong> engineers, AV Live Communications designs and commissions standards-based corporate boardrooms, huddle spaces, and command centers nationwide. We integrate flagship <strong>Video Conference in Pakistan</strong> codecs—including the <strong>Polycom RealPresence Group 500</strong>, <strong>Poly Studio X70 / X72</strong>, Logitech Rally Bar, Yealink, and <strong>Interactive flat panel displays for business Lahore</strong> (Horion 4K Smart Boards)—with architectural acoustics and one-touch automation.</p>
      <ul>
        <li><strong>Boardroom Integration & Optical PTZ Tracking:</strong> Precision speaker framing using Poly DirectorAI, EagleEye IV 12x optical zoom cameras, Cisco Room Kit Plus, and Logitech RightSight 2.</li>
        <li><strong>Huddle Room Kits & All-in-One Video Bars:</strong> Rapid plug-and-play deployment of Poly Studio USB, Logitech Rally Bar Mini, and Yealink A20/A30 appliances.</li>
        <li><strong>Interactive Flat Panel Displays for Business:</strong> 65", 75", 86", and 98" 4K UHD Horion and commercial interactive flat panels with zero-bonding optical touch and wireless screen casting.</li>
        <li><strong>Beamforming Ceiling Audio & DSP Calibration:</strong> Zero-echo room acoustics powered by Poly NoiseBlockAI, Acoustic Fence, and multi-zone ceiling microphone arrays.</li>
      </ul>
    `,
    faqs: [
      {
        q: 'What is the cost of a 30-person executive boardroom AV setup in Pakistan?',
        a: 'A turnkey 30-person executive boardroom AV setup in Lahore, Karachi, or Islamabad typically ranges between PKR 1,450,000 and PKR 3,200,000. This includes an enterprise optical PTZ codec or AI bar (Polycom Group 500, Poly Studio X72, or Cisco Room Kit Plus), dual 75"–86" 4K Interactive Flat Panel displays (Horion), daisy-chained expansion or ceiling microphones, concealed floor-box cabling, and professional acoustic calibration.'
      },
      {
        q: 'Are you authorized Polycom video conferencing distributors in Lahore with Cisco Room Kit installation in Karachi?',
        a: 'Yes. AV Live Communications maintains ready stock at our Johar Town Lahore headquarters and deploys certified engineering teams for Poly, Cisco, Logitech, Yealink, Horion, and Grandstream installations across Lahore, Karachi (Clifton/DHA), and Islamabad (Blue Area).'
      },
      {
        q: 'What is your technical support SLA for corporate boardrooms?',
        a: 'Every AV Live boardroom installation is backed by our guaranteed 15-minute technical SLA response, zero-downtime replacement warranty, and on-site standby engineers for critical board meetings.'
      }
    ]
  },
  {
    id: 'voip-telephony',
    slug: 'voip-telephony',
    title: 'Enterprise VoIP Telephony & IP PBX Deployment',
    description:
      'Scalable Enterprise VoIP PBX setup Pakistan, multi-branch SIP trunking, call center queues, and PoE desk phone provisioning for 3CX, FreePBX, Grandstream UCM, and Cisco CUCM.',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3059/3059502.png',
    isActive: true,
    order: 9,
    category: 'Unified Communications',
    serviceType: 'Enterprise VoIP & IP PBX',
    priceRange: 'PKR 150,000 - PKR 8,500,000',
    localizedH1: 'Enterprise VoIP PBX Setup & SIP Telephony Solutions in Pakistan',
    keywords:
      'Enterprise VoIP PBX setup Pakistan, VoIP telephony Pakistan, IP PBX installation Lahore Karachi Islamabad, 3CX Pakistan, FreePBX Enterprise, Grandstream UCM6308, Cisco CUCM, SIP phones Pakistan',
    offeringsBreakdown: [
      {
        title: 'Enterprise VoIP PBX Setup Pakistan',
        detail: 'High-availability on-premise and cloud IP PBX deployments using Grandstream UCM6308, 3CX Enterprise, FreePBX, and Cisco CUCM.'
      },
      {
        title: 'Zero-Touch PoE IP Phone Provisioning',
        detail: 'Automated mass deployment of Cisco, Poly VVX/Edge, Yealink T4/T5, Grandstream, and Fanvil executive and call-center SIP desk phones.'
      },
      {
        title: 'Multi-Branch SIP Trunking & Intercom Paging',
        detail: 'Encrypted TLS/SRTP inter-branch voice peering across Lahore, Karachi, and Islamabad integrated with 2N and Bosch SIP PA paging.'
      }
    ],
    caseStudies: [
      {
        hub: 'Gulberg & Johar Town, Lahore',
        project: '450-Extension Multi-Branch Enterprise VoIP PBX Setup',
        outcome: 'Migrated legacy analog PABX to Grandstream UCM6308 + Yealink PoE IP phones, reducing inter-branch telecom costs by 68%.'
      },
      {
        hub: 'Clifton, Karachi',
        project: '120-Seat BPO Contact Center 3CX & Headset Deployment',
        outcome: 'Implemented 3CX PRO with live wallboards, CRM screen-pop, call recording, and Jabra/Poly noise-cancelling headsets.'
      }
    ],
    detailedContent: `
      <h2>Enterprise VoIP PBX Setup Pakistan & Multi-Branch Unified Communications</h2>
      <p>Modernize your corporate voice infrastructure with encrypted SIP telephony, zero-touch IP phone provisioning, and hybrid cloud PBX architecture engineered by AV Live Communications—Pakistan's trusted specialist for <strong>Enterprise VoIP PBX setup Pakistan</strong>.</p>
      <ul>
        <li><strong>IP PBX Appliances & Cloud Licensing:</strong> Turnkey deployment of <strong>Grandstream UCM6308</strong>, <strong>3CX PRO Enterprise</strong>, <strong>FreePBX Enterprise</strong>, and <strong>Cisco Unified Communications Manager (CUCM)</strong>.</li>
        <li><strong>Executive & Call Center SIP Endpoints:</strong> Mass auto-provisioning of Cisco 8800 series, Poly VVX, Yealink T54W, Grandstream Carrier-Grade, and Fanvil IP phones.</li>
        <li><strong>Multi-Site SIP Peering & PRI/FXO Gateways:</strong> Toll-free inter-branch calling between Lahore, Karachi, Islamabad, and international offices with failover PSTN trunks.</li>
        <li><strong>SIP Intercom & PA Paging Integration:</strong> Unified door access control and emergency voice paging via 2N IP Vario, Axis, and Bosch PAVIRO systems.</li>
      </ul>
    `,
    faqs: [
      {
        q: 'Can AV Live connect our Lahore, Karachi, and Islamabad offices onto a single Enterprise VoIP PBX setup in Pakistan?',
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

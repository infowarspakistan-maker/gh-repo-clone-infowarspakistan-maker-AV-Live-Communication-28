import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';

export function Solutions() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const solutionsSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://avlive.com.pk/solutions#collection",
        "name": "Enterprise Video Conferencing, Hybrid Event & 3D Hologram Solutions in Pakistan | AV Live",
        "url": "https://avlive.com.pk/solutions",
        "description": "Turnkey enterprise solutions for Video Conference in Pakistan (Polycom Group 500, Poly X70), Corporate event management, hybrid events, 3D Hologram Displays, and projection mapping.",
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Boardroom Video Conference in Pakistan (Polycom Group 500 & Poly X70)",
              "url": "https://avlive.com.pk/video-conferencing"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "3D Hologram Display Stages & Experiential Events",
              "url": "https://avlive.com.pk/3d-hologram"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Corporate Event Management & Hybrid Event Production",
              "url": "https://avlive.com.pk/services/hybrid-events"
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": "3D Architectural & Stage Projection Mapping",
              "url": "https://avlive.com.pk/projection-mapping"
            }
          ]
        }
      },
      {
        "@type": "FAQPage",
        "@id": "https://avlive.com.pk/solutions#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Which hardware codecs do you integrate for Video Conference in Pakistan?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "AV Live integrates flagship enterprise video conferencing systems across Pakistan including the Polycom RealPresence Group 500 (Polycom Group 500), Poly Studio X70 (Poly X70), Cisco Room Kits, and Logitech Rally Bars for Microsoft Teams Rooms and Zoom Rooms."
            }
          },
          {
            "@type": "Question",
            "name": "Do you provide turnkey Corporate event management, hybrid event streaming, and Hologram Display setups?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Our engineering teams design and execute end-to-end Corporate event management, multi-camera hybrid events, 3D Hologram Display stages, and 3D projection mapping in Lahore, Karachi, and Islamabad."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="py-4 lg:py-8 bg-[#F8F9FA] min-h-screen text-[#1A2B4C]">
      <SEO 
        title="Video Conferencing & Hybrid Event Solutions | AV Live" 
        description="Explore turnkey solutions for Video Conferencing in Pakistan (Poly, Cisco, Logitech), smart boardrooms, hybrid events & 3D Hologram Displays."
        keywords="Video Conferencing Solutions Pakistan, Polycom Group 500, Poly X70, Corporate Event Management, Hybrid Event Production, 3D Hologram Display, Zoom Rooms Pakistan, Microsoft Teams Rooms Pakistan"
        url="https://avlive.com.pk/solutions"
        schema={solutionsSchema}
      />
      <motion.div 
        className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Breadcrumbs items={[{ label: 'Solutions' }]} />
        <motion.h1 
          className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 uppercase tracking-tight"
          variants={itemVariants}
        >
          Video Conferencing, Hybrid Event &amp; Hologram Solutions Ecosystem in Pakistan
        </motion.h1>
        <motion.p 
          className="text-sm sm:text-base text-gray-600 mb-5 max-w-3xl font-medium"
          variants={itemVariants}
        >
          We integrate the world's leading brands—including <strong>Polycom Group 500</strong>, <strong>Poly X70</strong>, Cisco, and Bosch—to build seamless environments for <Link to="/video-conference-in-pakistan" className="text-[#00B4D8] font-bold hover:underline">Video Conference in Pakistan</Link>, <Link to="/3d-hologram" className="text-[#00B4D8] font-bold hover:underline">Hologram Display</Link> product launches, and large-scale <Link to="/event-management-in-pakistan" className="text-[#00B4D8] font-bold hover:underline">Event Management in Pakistan</Link>.
        </motion.p>

        {/* Answer-First Direct Engineering Verdict (50-70 Words) */}
        <div className="bg-white rounded-2xl border-l-4 border-[#00B4D8] border border-gray-200 p-4 sm:p-6 mb-6 shadow-xs">
          <span className="block text-[10px] font-black uppercase tracking-widest text-[#00B4D8] mb-1.5">
            Direct Engineering Verdict (TL;DR) — Enterprise AV &amp; Event Architecture
          </span>
          <p className="text-xs sm:text-sm text-[#1A2B4C] font-semibold leading-relaxed">
            <strong>AV Live Communications</strong> (established 2011) designs and deploys turnkey enterprise ecosystems across <strong>Lahore, Karachi, and Islamabad</strong>: AES-256 encrypted <Link to="/video-conference-in-pakistan" className="text-[#00B4D8] underline">Video Conference in Pakistan</Link> boardrooms (HP Poly Studio X72/X70, Polycom Group 500, Cisco Room Kit Plus), <Link to="/event-management-in-pakistan" className="text-[#00B4D8] underline">Event Management in Pakistan</Link> with in-house P2.5 SMD LED walls and 3D HoloGauze stages, and multi-branch SIP trunking PBXs backed by a 15-minute engineering SLA.
          </p>
        </div>

        <div className="space-y-8">
          <motion.div 
            className="bg-white rounded-[32px] border border-gray-200 p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center shadow-sm hover:border-[#00B4D8] transition-all hover:shadow-md"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <div className="flex-1">
              <span className="text-[#00B4D8] text-xs font-bold uppercase tracking-[0.2em] mb-4 block">Workspace & Boardrooms</span>
              <h2 className="text-3xl font-bold mb-4">Smart Collaboration & Video Conference in Pakistan</h2>
              <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                Equip your meeting spaces with state-of-the-art <strong>Video conference</strong> systems. We bundle 
                <strong> Polycom RealPresence Group 500</strong>, <strong>Poly Studio X70 (Poly X70)</strong>, Cisco, and Logitech hardware to create flawless communication hubs that bridge in-office and remote teams across Lahore, Karachi, and Islamabad.
              </p>
              <ul className="space-y-4 text-sm font-semibold mb-8">
                <li className="flex items-center"><span className="w-2 h-2 bg-[#00B4D8] rounded-full mr-4"></span> Polycom Group 500, Poly X70 & Cisco Webex Integration</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-[#00B4D8] rounded-full mr-4"></span> Native Zoom Rooms & Microsoft Teams Rooms</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-[#00B4D8] rounded-full mr-4"></span> Acoustic Echo Cancellation & Touch-Panel Control</li>
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link to="/video-conferencing" className="bg-[#1A2B4C] text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-[#00B4D8] transition-all tracking-wider uppercase text-center">
                  Explore Video Conferencing
                </Link>
                <Link to="/product/polycom-realpresence-group-500-pakistan" className="bg-white border-2 border-[#1A2B4C] text-[#1A2B4C] px-6 py-3 rounded-full text-sm font-bold hover:bg-[#1A2B4C] hover:text-white transition-all tracking-wider uppercase text-center">
                  View Polycom Group 500
                </Link>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 rounded-3xl aspect-video overflow-hidden border border-gray-200 relative">
              <img loading="lazy" src="https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&q=80" alt="Video Conference in Pakistan - Polycom Group 500 and Poly X70 Boardroom Integration" className="w-full h-full object-cover mix-blend-multiply" />
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-[32px] border border-gray-200 p-8 md:p-12 flex flex-col md:flex-row-reverse gap-12 items-center shadow-sm hover:border-[#00B4D8] transition-all hover:shadow-md"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <div className="flex-1">
              <span className="text-[#00B4D8] text-xs font-bold uppercase tracking-[0.2em] mb-4 block">Visuals & Auditoriums</span>
              <h2 className="text-3xl font-bold mb-4">Immersive Visuals, 3D Hologram Display & Projection Mapping</h2>
              <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                Command attention with our high-resolution SMD LED displays, <strong>3D Hologram Display</strong> stages, and Bosch PAVIRO public address systems. 
                Engineered for corporate auditoriums, product launches, and architectural projection mapping in Pakistan.
              </p>
              <ul className="space-y-4 text-sm font-semibold mb-8">
                <li className="flex items-center"><span className="w-2 h-2 bg-[#00B4D8] rounded-full mr-4"></span> 3D Hologram Display Stages & HoloGauze Meshes</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-[#00B4D8] rounded-full mr-4"></span> P1.8 to P4 Fine-Pitch SMD LED Video Walls</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-[#00B4D8] rounded-full mr-4"></span> Bosch PAVIRO Multi-Zone PA & Voice Alarm Audio</li>
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link to="/3d-hologram" className="bg-[#1A2B4C] text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-[#00B4D8] transition-all tracking-wider uppercase text-center">
                  3D Hologram Displays
                </Link>
                <Link to="/projection-mapping" className="bg-white border-2 border-[#1A2B4C] text-[#1A2B4C] px-8 py-3 rounded-full text-sm font-bold hover:bg-[#1A2B4C] hover:text-white transition-all tracking-wider uppercase text-center">
                  3D Projection Mapping
                </Link>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 rounded-3xl aspect-video overflow-hidden border border-gray-200 relative">
              <img loading="lazy" src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" alt="3D Hologram Display and SMD LED Wall Solutions in Pakistan" className="w-full h-full object-cover mix-blend-multiply" />
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-[32px] border border-gray-200 p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center shadow-sm hover:border-[#00B4D8] transition-all hover:shadow-md"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <div className="flex-1">
              <span className="text-[#00B4D8] text-xs font-bold uppercase tracking-[0.2em] mb-4 block">Live & Hybrid Events</span>
              <h2 className="text-3xl font-bold mb-4">Corporate Event Management & Hybrid Event Production</h2>
              <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                Deliver broadcast-quality corporate <strong>events</strong> across Lahore, Karachi, and Islamabad. We unite live stage trussing, concert line-array sound, and multi-camera SDI switching with bidirectional <strong>Video conference</strong> feeds.
              </p>
              <ul className="space-y-4 text-sm font-semibold mb-8">
                <li className="flex items-center"><span className="w-2 h-2 bg-[#00B4D8] rounded-full mr-4"></span> Turnkey Corporate Event Management & Stage Fabrication</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-[#00B4D8] rounded-full mr-4"></span> Hybrid Event Simulcasting (Zoom, Teams, YouTube Live)</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-[#00B4D8] rounded-full mr-4"></span> Interactive Room Designer & Instant Event Quote Estimator</li>
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link to="/services/corporate-events" className="bg-[#1A2B4C] text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-[#00B4D8] transition-all tracking-wider uppercase text-center">
                  Corporate Event Management
                </Link>
                <Link to="/services/hybrid-events" className="bg-white border-2 border-[#1A2B4C] text-[#1A2B4C] px-8 py-3 rounded-full text-sm font-bold hover:bg-[#1A2B4C] hover:text-white transition-all tracking-wider uppercase text-center">
                  Hybrid Event Solutions
                </Link>
                <Link to="/room-designer" className="bg-[#00B4D8] text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-[#1A2B4C] transition-all tracking-wider uppercase text-center">
                  3D Room Designer &amp; LED Calculator
                </Link>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 rounded-3xl aspect-video overflow-hidden border border-gray-200 relative">
              <img loading="lazy" src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80" alt="Corporate Event Management and Hybrid Events in Pakistan" className="w-full h-full object-cover mix-blend-multiply" />
            </div>
          </motion.div>
        </div>

        {/* Solutions by Industry (Vertical Hubs: Healthcare, Banking, Higher Education) */}
        <div className="mt-16 bg-white rounded-[32px] border border-gray-200 p-8 md:p-12 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <span className="text-[#00B4D8] text-xs font-bold uppercase tracking-[0.2em] block mb-2">Solutions by Industry (Vertical Hubs)</span>
              <h2 className="text-2xl md:text-3xl font-black text-[#1A2B4C]">
                Sector-Specific Pro-AV &amp; Unified Communications Blueprints
              </h2>
            </div>
            <Link to="/blog/banking-healthcare-university-av-solutions-pakistan" className="text-xs font-black uppercase tracking-wider text-[#00B4D8] hover:text-[#1A2B4C]">
              Read Complete Vertical Architecture Guide →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div id="healthcare" className="p-6 rounded-2xl bg-[#F8F9FA] border border-gray-200 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00B4D8] block">Vertical Hub 01</span>
              <h3 className="text-lg font-black text-[#1A2B4C]">Healthcare &amp; Telemedicine</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Mobile 4K telemedicine diagnostic carts, hygienic cleanroom SIP paging, and surgical theater broadcast links across Pakistani teaching hospitals.
              </p>
              <ul className="space-y-1.5 text-xs font-bold text-[#00B4D8] pt-2">
                <li><Link to="/product/poly-studio-usb-video-bar-pakistan" className="hover:underline">Mobile 4K Carts (Poly Studio USB Bar)</Link></li>
                <li><Link to="/product/2n-ip-vario-intercom-pakistan" className="hover:underline">Cleanroom Paging (2N IP Vario Intercom)</Link></li>
                <li><Link to="/product/axis-a8105-e-door-station-pakistan" className="hover:underline">Axis A8105-E SIP Door Station</Link></li>
              </ul>
            </div>

            <div id="banking" className="p-6 rounded-2xl bg-[#F8F9FA] border border-gray-200 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00B4D8] block">Vertical Hub 02</span>
              <h3 className="text-lg font-black text-[#1A2B4C]">Banking &amp; Finance Command Centers</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                AES-256 encrypted H.323/SIP executive boardrooms, 24/7 SMD command-center video walls, and multi-branch SIP trunking PBXs.
              </p>
              <ul className="space-y-1.5 text-xs font-bold text-[#00B4D8] pt-2">
                <li><Link to="/product/cisco-room-kit-plus-pakistan" className="hover:underline">Cisco Room Kit Plus &amp; Codec Pro</Link></li>
                <li><Link to="/product/polycom-realpresence-group-500-pakistan" className="hover:underline">Polycom RealPresence Group 500</Link></li>
                <li><Link to="/product/grandstream-ucm6308-pakistan" className="hover:underline">Grandstream UCM6308 &amp; Cisco CUCM</Link></li>
              </ul>
            </div>

            <div id="education" className="p-6 rounded-2xl bg-[#F8F9FA] border border-gray-200 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00B4D8] block">Vertical Hub 03</span>
              <h3 className="text-lg font-black text-[#1A2B4C]">Higher Education (HEC Smart Classrooms)</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                HEC-compliant hybrid lecture-capture classrooms, 4K interactive flat panels, laser auditorium projectors, and campus-wide public address.
              </p>
              <ul className="space-y-1.5 text-xs font-bold text-[#00B4D8] pt-2">
                <li><Link to="/product/horion-k6a-bundle-special-offer" className="hover:underline">Horion K6a Interactive Flat Panel</Link></li>
                <li><Link to="/product/poly-studio-x52-pakistan" className="hover:underline">Poly Studio X52 &amp; Auto-Tracking PTZ</Link></li>
                <li><Link to="/product/bosch-paviro-pva-4cr12-pakistan" className="hover:underline">Bosch PAVIRO Campus PA System</Link></li>
              </ul>
            </div>
          </div>

          {/* Semantic HTML Industry Solutions & Budget Matrix Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <caption className="bg-[#1A2B4C] text-white font-black text-left px-4 py-3 text-xs uppercase tracking-wider">
                2026 Pakistan Enterprise AV, Boardroom &amp; Hybrid Event Solutions Matrix
              </caption>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[#1A2B4C] font-black uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Solution Vertical</th>
                  <th className="py-3 px-4">Core Hardware &amp; AV Stack</th>
                  <th className="py-3 px-4">Room / Venue Scale</th>
                  <th className="py-3 px-4">Reference PKR Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 font-black text-[#1A2B4C]"><Link to="/video-conference-in-pakistan" className="hover:text-[#00B4D8]">Executive Boardroom AV</Link></td>
                  <td className="py-3 px-4 text-gray-600">Polycom Group 500 / Poly Studio X72 / Cisco Room Kit Plus + Dual 4K Displays</td>
                  <td className="py-3 px-4 text-gray-600">12–30 Seats</td>
                  <td className="py-3 px-4 font-bold text-[#00B4D8]">Rs. 1,450,000 – Rs. 2,850,000</td>
                </tr>
                <tr className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 font-black text-[#1A2B4C]"><Link to="/event-management-in-pakistan" className="hover:text-[#00B4D8]">Corporate &amp; Hybrid Events</Link></td>
                  <td className="py-3 px-4 text-gray-600">P2.5 SMD LED Video Wall + Line-Array PA + 4K SDI Broadcast Switcher</td>
                  <td className="py-3 px-4 text-gray-600">150–2,000+ Delegates</td>
                  <td className="py-3 px-4 font-bold text-[#00B4D8]">Rs. 350,000 – Rs. 2,500,000+</td>
                </tr>
                <tr className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 font-black text-[#1A2B4C]"><Link to="/3d-hologram" className="hover:text-[#00B4D8]">3D Hologram &amp; Projection Mapping</Link></td>
                  <td className="py-3 px-4 text-gray-600">20,000 ANSI Lumen Laser Projectors + HoloGauze Silver Mesh + 3D Content</td>
                  <td className="py-3 px-4 text-gray-600">Keynote Launches &amp; Galas</td>
                  <td className="py-3 px-4 font-bold text-[#00B4D8]">Rs. 480,000 – Rs. 1,850,000</td>
                </tr>
                <tr className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 font-black text-[#1A2B4C]"><Link to="/solutions#education" className="hover:text-[#00B4D8]">HEC Smart Classroom &amp; Telemedicine</Link></td>
                  <td className="py-3 px-4 text-gray-600">Horion K6a 4K IFP + Poly Studio X52 / USB Bar + Bosch PAVIRO Audio</td>
                  <td className="py-3 px-4 text-gray-600">30–120 Seats</td>
                  <td className="py-3 px-4 font-bold text-[#00B4D8]">Rs. 650,000 – Rs. 1,650,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* AEO FAQ Block */}
        <div className="mt-16 bg-white rounded-[32px] border border-gray-200 p-8 md:p-12 shadow-sm">
          <h2 className="text-2xl font-black mb-6">Frequently Asked Questions: Enterprise AV & Event Solutions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-gray-100">
              <h3 className="font-bold text-[#1A2B4C] mb-2">Which hardware codecs do you integrate for Video Conference in Pakistan?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                AV Live integrates flagship enterprise video conferencing systems across Pakistan including the <strong>Polycom RealPresence Group 500</strong>, <strong>Poly Studio X70 (Poly X70)</strong>, Cisco Room Kits, and Logitech Rally Bars for Microsoft Teams Rooms and Zoom Rooms.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-gray-100">
              <h3 className="font-bold text-[#1A2B4C] mb-2">Do you provide turnkey Corporate event management, hybrid event streaming, and Hologram Display setups?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Yes. Our engineering teams design and execute end-to-end <strong>Corporate event management</strong>, multi-camera <strong>hybrid event</strong> broadcasts, <strong>3D Hologram Display</strong> stages, and 3D projection mapping in Lahore, Karachi, and Islamabad.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


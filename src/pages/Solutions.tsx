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
    <div className="py-12 bg-[#F8F9FA] min-h-screen text-[#1A2B4C]">
      <SEO 
        title="Video Conference in Pakistan, Hybrid Event & 3D Hologram Solutions | Polycom Group 500 & Poly X70 | AV Live" 
        description="Explore turnkey solutions for Video Conference in Pakistan (Polycom Group 500, Poly X70), smart boardrooms, Corporate event management, hybrid event broadcasting, and 3D Hologram Displays."
        keywords="Video Conference in Pakistan, Video conference, Polycom Group 500, Poly X70, Event management, Corporate event management, hybrid event, Hologram Display, events, Zoom Rooms Pakistan, Microsoft Teams Rooms Pakistan"
        url="https://avlive.com.pk/solutions"
        schema={solutionsSchema}
      />
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Breadcrumbs items={[{ label: 'Solutions' }]} />
        <motion.h1 
          className="text-4xl font-bold mb-4 uppercase tracking-tighter"
          variants={itemVariants}
        >
          Video Conferencing, Hybrid Event & Hologram Solutions Ecosystem in Pakistan
        </motion.h1>
        <motion.p 
          className="text-lg text-gray-500 mb-16 max-w-3xl font-medium"
          variants={itemVariants}
        >
          We integrate the world's leading brands—including <strong>Polycom Group 500</strong>, <strong>Poly X70</strong>, Cisco, and Bosch—to build seamless environments for <strong>Video Conference in Pakistan</strong>, <strong>Hologram Display</strong> product launches, and large-scale <strong>Corporate event management</strong>.
        </motion.p>

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
              </div>
            </div>
            <div className="flex-1 bg-gray-100 rounded-3xl aspect-video overflow-hidden border border-gray-200 relative">
              <img loading="lazy" src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80" alt="Corporate Event Management and Hybrid Events in Pakistan" className="w-full h-full object-cover mix-blend-multiply" />
            </div>
          </motion.div>
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


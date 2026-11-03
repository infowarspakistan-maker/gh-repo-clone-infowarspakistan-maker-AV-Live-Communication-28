import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { PhoneCall, Hash, Globe, ServerCog } from 'lucide-react';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';

export function VoipService() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO 
        title="Enterprise VoIP & SIP PBX Integration Pakistan | AV Live" 
        description="Compare and deploy 3CX, FreePBX, Grandstream UCM & Cisco Unified Communications PBX systems with multi-branch SIP trunking in Pakistan."
        url="https://avlive.com.pk/voip-service-providers"
        schema={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Service',
              '@id': 'https://avlive.com.pk/voip-service-providers#service',
              name: 'Enterprise VoIP Service Providers & SIP PBX Integration in Pakistan',
              serviceType: 'IP-PBX & Multi-Branch SIP Trunking Integration',
              provider: { '@id': 'https://avlive.com.pk/#organization' },
              areaServed: ['Lahore', 'Karachi', 'Islamabad', 'Pakistan'],
              url: 'https://avlive.com.pk/voip-service-providers'
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://avlive.com.pk' },
                { '@type': 'ListItem', position: 2, name: 'VoIP Service Providers', item: 'https://avlive.com.pk/voip-service-providers' }
              ]
            }
          ]
        }}
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2.5">
        <Breadcrumbs items={[{ label: 'VoIP Service Providers' }]} />
      </div>
      <div className="bg-[#1A2B4C] text-white py-6 lg:py-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl font-black mb-2.5 tracking-tight"
          >
            Enterprise VoIP Service Providers &amp; SIP PBX Integration in Pakistan
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs sm:text-sm md:text-base text-white/90 max-w-3xl mx-auto leading-relaxed"
          >
            A VoIP phone system is only as reliable as its SIP carrier and PBX core. We integrate PTCL, Cybernet, Zong, and international SIP trunks with 3CX, FreePBX, Grandstream UCM, and Cisco CUCM across Pakistan.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-6 lg:mt-10 space-y-10 lg:space-y-14">
        {/* Answer-First Verdict & Semantic IP-PBX Comparison Table */}
        <div className="bg-white rounded-2xl lg:rounded-3xl border border-gray-200 p-5 sm:p-7 shadow-xs space-y-5">
          <div className="bg-[#1A2B4C]/5 border-l-4 border-[#00B4D8] rounded-xl p-4">
            <span className="block text-[10px] font-black uppercase tracking-widest text-[#00B4D8] mb-1">
              Direct Engineering Verdict (TL;DR) — Pakistan Enterprise VoIP &amp; SIP Trunking
            </span>
            <p className="text-xs sm:text-sm font-semibold text-[#1A2B4C] leading-relaxed">
              For multi-branch Pakistani enterprises and call centers, <strong>AV Live Communications</strong> deploys carrier-neutral SIP trunking (PTCL Smart Voice, Cybernet Fiber SIP, Zong IMS) paired with on-premise or cloud IP-PBX cores (<Link to="/product/3cx-pro-8-sc-pakistan" className="text-[#00B4D8] underline">3CX Pro 8 SC</Link>, <Link to="/product/freepbx-enterprise-pakistan" className="text-[#00B4D8] underline">FreePBX Enterprise</Link>, <Link to="/product/grandstream-ucm6308-pakistan" className="text-[#00B4D8] underline">Grandstream UCM6308</Link>, and <Link to="/product/cisco-cucm-license-pakistan" className="text-[#00B4D8] underline">Cisco CUCM</Link>) and zero-touch provisioned <Link to="/category/ip-phones" className="text-[#00B4D8] underline">SIP IP Phones</Link>.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <caption className="bg-[#1A2B4C] text-white font-black text-left px-4 py-3 text-xs uppercase tracking-wider">
                2026 Pakistan Enterprise IP-PBX &amp; SIP Trunking Platform Comparison
              </caption>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[#1A2B4C] font-black uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">IP-PBX Platform</th>
                  <th className="py-3 px-4">Concurrent Calls / Extensions</th>
                  <th className="py-3 px-4">Key Enterprise Features</th>
                  <th className="py-3 px-4">Reference PKR Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 font-black text-[#1A2B4C]"><Link to="/product/3cx-pro-8-sc-pakistan" className="hover:text-[#00B4D8]">3CX Phone System PRO (8 SC)</Link></td>
                  <td className="py-3 px-4 text-gray-600">8 Simultaneous Calls / Unlimited Users</td>
                  <td className="py-3 px-4 text-gray-600">CRM Integration, Call Queues, Call Recording, WhatsApp/WebRTC</td>
                  <td className="py-3 px-4 font-bold text-[#00B4D8]">Rs. 145,000</td>
                </tr>
                <tr className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 font-black text-[#1A2B4C]"><Link to="/product/freepbx-enterprise-pakistan" className="hover:text-[#00B4D8]">FreePBX Enterprise Appliance</Link></td>
                  <td className="py-3 px-4 text-gray-600">Up to 500 Extensions / 150 Calls</td>
                  <td className="py-3 px-4 text-gray-600">Zero Per-Seat Licensing, Asterisk SIP Core, IVR &amp; Call Center</td>
                  <td className="py-3 px-4 font-bold text-[#00B4D8]">Rs. 320,000</td>
                </tr>
                <tr className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 font-black text-[#1A2B4C]"><Link to="/product/grandstream-ucm6308-pakistan" className="hover:text-[#00B4D8]">Grandstream UCM6308 IP-PBX</Link></td>
                  <td className="py-3 px-4 text-gray-600">Up to 3,000 Users / 450 Concurrent Calls</td>
                  <td className="py-3 px-4 text-gray-600">8 FXO + 8 FXS Ports, Redundant Dual PSU, UCM RemoteConnect</td>
                  <td className="py-3 px-4 font-bold text-[#00B4D8]">Rs. 495,000</td>
                </tr>
                <tr className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 font-black text-[#1A2B4C]"><Link to="/product/cisco-cucm-license-pakistan" className="hover:text-[#00B4D8]">Cisco Unified CallManager (CUCM)</Link></td>
                  <td className="py-3 px-4 text-gray-600">Enterprise Multi-Cluster Scale</td>
                  <td className="py-3 px-4 text-gray-600">Bank-Grade SRTP Encryption, Cisco IP Phone &amp; Room Kit Native</td>
                  <td className="py-3 px-4 font-bold text-[#00B4D8]">Rs. 850,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-black text-[#1A2B4C] mb-12 text-center">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
               <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mx-auto mb-6"><ServerCog size={32} /></div>
               <h3 className="font-bold text-[#1A2B4C] text-lg mb-3">SIP Trunk Provisioning</h3>
               <p className="text-gray-500 text-sm">We connect your IP PBX to local and international SIP providers flawlessly.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
               <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mx-auto mb-6"><Hash size={32} /></div>
               <h3 className="font-bold text-[#1A2B4C] text-lg mb-3">Local DIDs</h3>
               <p className="text-gray-500 text-sm">Get Lahore, Karachi, and Islamabad virtual phone numbers instantly.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
               <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mx-auto mb-6"><Globe size={32} /></div>
               <h3 className="font-bold text-[#1A2B4C] text-lg mb-3">International Routing</h3>
               <p className="text-gray-500 text-sm">Low-cost termination to global destinations for your call center.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
               <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mx-auto mb-6"><PhoneCall size={32} /></div>
               <h3 className="font-bold text-[#1A2B4C] text-lg mb-3">Carrier Neutral</h3>
               <p className="text-gray-500 text-sm">We work with any provider you choose or recommend the best for your needs.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
           <div>
             <h2 className="text-3xl font-black text-[#1A2B4C] mb-6">Our Trusted Partners</h2>
             <ul className="space-y-6">
               <li className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                 <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-800 shrink-0">PTCL</div>
                 <div><h4 className="font-bold text-[#1A2B4C]">PTCL (Smart TV & Voice)</h4><p className="text-sm text-gray-500">Industry-standard analog/digital lines.</p></div>
               </li>
               <li className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                 <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center font-bold text-indigo-800 shrink-0">CNet</div>
                 <div><h4 className="font-bold text-[#1A2B4C]">Cybernet</h4><p className="text-sm text-gray-500">Enterprise fiber and robust SIP trunking.</p></div>
               </li>
               <li className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                 <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center font-bold text-green-800 shrink-0">Zong</div>
                 <div><h4 className="font-bold text-[#1A2B4C]">Zong 4G</h4><p className="text-sm text-gray-500">IMS-based VoIP for modern business.</p></div>
               </li>
               <li className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                 <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-800 shrink-0"><Globe size={20}/></div>
                 <div><h4 className="font-bold text-[#1A2B4C]">Global Carriers</h4><p className="text-sm text-gray-500">Twilio, Bandwidth, or Voxbone for international presence.</p></div>
               </li>
             </ul>
           </div>
           
           <div className="bg-[#1A2B4C] p-12 rounded-[2rem] text-white">
             <h3 className="text-2xl font-black mb-4">Fully Managed Service</h3>
             <p className="text-gray-300 leading-relaxed mb-8">
               We don't just sell you the equipment; we manage the entire setup, ensuring QoS (Quality of Service) prioritizes voice traffic over your network.
             </p>
             <Link to="/programs/quote" className="bg-[#00B4D8] text-white px-8 py-4 min-h-[48px] rounded-full font-bold hover:bg-white hover:text-[#1A2B4C] transition-colors w-full shadow-lg shadow-[#00B4D8]/30 flex items-center justify-center">
               Request a VoIP Service Quote
             </Link>
             <p className="text-center mt-6 text-sm text-gray-400">Or call 0321 425 6263</p>
           </div>
        </div>
      </div>
    </div>
  );
}

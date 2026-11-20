import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const OUT_DIR = path.resolve(process.cwd(), 'public/images/products');
fs.mkdirSync(OUT_DIR, { recursive: true });

interface ImageSpec {
  filenameBase: string;
  svg: string;
}

const IMAGE_SPECS: ImageSpec[] = [
  {
    filenameBase: 'poly-x70-studio',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B1325"/>
      <stop offset="50%" stop-color="#1A2B4C"/>
      <stop offset="100%" stop-color="#0F1E38"/>
    </linearGradient>
    <linearGradient id="barBody" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="50%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00B4D8"/>
      <stop offset="50%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#0077B6"/>
    </linearGradient>
    <radialGradient id="lensGlass" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="35%" stop-color="#0369A1"/>
      <stop offset="75%" stop-color="#082F49"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>

  <!-- Studio Backdrop -->
  <rect width="1200" height="900" fill="url(#bg)"/>
  <circle cx="600" cy="420" r="390" fill="#00B4D8" fill-opacity="0.08"/>
  <circle cx="600" cy="420" r="260" fill="#38BDF8" fill-opacity="0.06"/>

  <!-- Architectural Grid Lines -->
  <line x1="80" y1="140" x2="1120" y2="140" stroke="#00B4D8" stroke-opacity="0.2" stroke-width="1"/>
  <line x1="80" y1="740" x2="1120" y2="740" stroke="#00B4D8" stroke-opacity="0.25" stroke-width="2"/>

  <!-- Top Header Badge -->
  <rect x="80" y="62" width="350" height="44" rx="8" fill="#00B4D8" fill-opacity="0.15" stroke="#00B4D8" stroke-width="1.5"/>
  <text x="104" y="90" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" font-weight="bold">HP POLY STUDIO X70 / X72 SERIES</text>

  <rect x="880" y="62" width="240" height="44" rx="8" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
  <text x="905" y="90" fill="#E2E8F0" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">DUAL 4K 20MP AI OPTICS</text>

  <!-- Studio Pedestal Shadow -->
  <ellipse cx="600" cy="595" rx="460" ry="26" fill="#020617" fill-opacity="0.65"/>

  <!-- Mounting Stand -->
  <rect x="520" y="520" width="160" height="42" rx="6" fill="#1E293B" stroke="#475569" stroke-width="2"/>
  <rect x="440" y="555" width="320" height="22" rx="10" fill="#334155" stroke="#64748B" stroke-width="2"/>

  <!-- Main Poly Studio X70 / X72 Video Bar Chassis -->
  <rect x="130" y="340" width="940" height="185" rx="42" fill="url(#barBody)" stroke="#64748B" stroke-width="3"/>
  <rect x="148" y="356" width="904" height="153" rx="32" fill="#0F172A" stroke="#334155" stroke-width="2"/>

  <!-- Acoustic Fabric SpeakerGrille Left -->
  <rect x="165" y="368" width="265" height="129" rx="22" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
  <line x1="205" y1="380" x2="205" y2="485" stroke="#334155" stroke-width="2"/>
  <line x1="245" y1="380" x2="245" y2="485" stroke="#334155" stroke-width="2"/>
  <line x1="285" y1="380" x2="285" y2="485" stroke="#334155" stroke-width="2"/>
  <line x1="325" y1="380" x2="325" y2="485" stroke="#334155" stroke-width="2"/>
  <line x1="365" y1="380" x2="365" y2="485" stroke="#334155" stroke-width="2"/>
  <line x1="405" y1="380" x2="405" y2="485" stroke="#334155" stroke-width="2"/>

  <!-- Acoustic Fabric SpeakerGrille Right -->
  <rect x="770" y="368" width="265" height="129" rx="22" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
  <line x1="800" y1="380" x2="800" y2="485" stroke="#334155" stroke-width="2"/>
  <line x1="840" y1="380" x2="840" y2="485" stroke="#334155" stroke-width="2"/>
  <line x1="880" y1="380" x2="880" y2="485" stroke="#334155" stroke-width="2"/>
  <line x1="920" y1="380" x2="920" y2="485" stroke="#334155" stroke-width="2"/>
  <line x1="960" y1="380" x2="960" y2="485" stroke="#334155" stroke-width="2"/>
  <line x1="1000" y1="380" x2="1000" y2="485" stroke="#334155" stroke-width="2"/>

  <!-- Central Dual-4K Camera Housing -->
  <rect x="448" y="364" width="304" height="137" rx="28" fill="#090D16" stroke="#00B4D8" stroke-width="2.5"/>

  <!-- Left 120-deg Wide 4K Lens -->
  <circle cx="535" cy="432" r="46" fill="#1E293B" stroke="#94A3B8" stroke-width="3"/>
  <circle cx="535" cy="432" r="34" fill="url(#lensGlass)" stroke="#00B4D8" stroke-width="2"/>
  <circle cx="524" cy="420" r="8" fill="#E0F2FE" fill-opacity="0.75"/>

  <!-- Right 70-deg Telephoto 4K Lens -->
  <circle cx="665" cy="432" r="46" fill="#1E293B" stroke="#94A3B8" stroke-width="3"/>
  <circle cx="665" cy="432" r="34" fill="url(#lensGlass)" stroke="#00B4D8" stroke-width="2"/>
  <circle cx="654" cy="420" r="8" fill="#E0F2FE" fill-opacity="0.75"/>

  <!-- Status LED Bar -->
  <rect x="520" y="512" width="160" height="6" rx="3" fill="url(#cyanGlow)"/>

  <!-- Poly Branding Emblem -->
  <text x="562" y="330" fill="#F8FAFC" font-family="DejaVu Sans, Arial, sans-serif" font-size="26" font-weight="bold">POLY</text>

  <!-- Technical Spec Callouts -->
  <rect x="80" y="635" width="320" height="82" rx="12" fill="#0F172A" stroke="#00B4D8" stroke-width="1.5"/>
  <text x="104" y="668" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">DUAL 20MP 4K SENSORS</text>
  <text x="104" y="696" fill="#CBD5E1" font-family="DejaVu Sans, Arial, sans-serif" font-size="14">120° Wide + 70° Telephoto Lenses</text>

  <rect x="440" y="635" width="320" height="82" rx="12" fill="#0F172A" stroke="#00B4D8" stroke-width="1.5"/>
  <text x="464" y="668" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">POLY DIRECTORAI FRAMING</text>
  <text x="464" y="696" fill="#CBD5E1" font-family="DejaVu Sans, Arial, sans-serif" font-size="14">25ft Mic Array • NoiseBlockAI</text>

  <rect x="800" y="635" width="320" height="82" rx="12" fill="#0F172A" stroke="#00B4D8" stroke-width="1.5"/>
  <text x="824" y="668" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">LARGE BOARDROOMS (26+ PAX)</text>
  <text x="824" y="696" fill="#CBD5E1" font-family="DejaVu Sans, Arial, sans-serif" font-size="14">Native Zoom &amp; Microsoft Teams</text>

  <!-- Footer Attribution -->
  <text x="80" y="805" fill="#F8FAFC" font-family="DejaVu Sans, Arial, sans-serif" font-size="28" font-weight="bold">HP Poly Studio X70 / X72 Large Room 4K AI Video Bar</text>
  <text x="80" y="842" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" font-weight="bold">AV Live Communications Pakistan • Authorized Enterprise Partner • 1-Year Local Warranty</text>
</svg>`,
  },
  {
    filenameBase: 'poly-x70-boardroom',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <defs>
    <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="60%" stop-color="#1A2B4C"/>
      <stop offset="100%" stop-color="#091326"/>
    </linearGradient>
    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284C7"/>
      <stop offset="100%" stop-color="#1E3A8A"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="900" fill="url(#bg2)"/>

  <!-- Acoustic Wall Panels -->
  <rect x="70" y="70" width="1060" height="540" rx="16" fill="#1E293B" stroke="#334155" stroke-width="2"/>

  <!-- Header Tag -->
  <rect x="100" y="95" width="420" height="40" rx="8" fill="#00B4D8" fill-opacity="0.2" stroke="#00B4D8" stroke-width="1.5"/>
  <text x="120" y="121" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">EXECUTIVE BOARDROOM TELEPRESENCE SUITE</text>

  <!-- Dual 85-inch 4K Displays -->
  <rect x="120" y="165" width="450" height="260" rx="10" fill="url(#screenGrad)" stroke="#38BDF8" stroke-width="3"/>
  <rect x="140" y="185" width="200" height="110" rx="6" fill="#0F172A" fill-opacity="0.75"/>
  <rect x="355" y="185" width="195" height="110" rx="6" fill="#0F172A" fill-opacity="0.75"/>
  <rect x="140" y="305" width="410" height="100" rx="6" fill="#0F172A" fill-opacity="0.85"/>
  <text x="165" y="245" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">LAHORE HQ</text>
  <text x="380" y="245" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">KARACHI HUB</text>
  <text x="165" y="362" fill="#E2E8F0" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" font-weight="bold">DirectorAI Multi-Speaker Framing Active</text>

  <rect x="630" y="165" width="450" height="260" rx="10" fill="url(#screenGrad)" stroke="#38BDF8" stroke-width="3"/>
  <rect x="655" y="190" width="400" height="210" rx="6" fill="#0F172A" fill-opacity="0.88"/>
  <text x="685" y="240" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" font-weight="bold">4K 60FPS CONTENT SHARING</text>
  <rect x="685" y="265" width="340" height="16" rx="4" fill="#00B4D8" fill-opacity="0.5"/>
  <rect x="685" y="295" width="280" height="16" rx="4" fill="#38BDF8" fill-opacity="0.35"/>
  <rect x="685" y="325" width="310" height="16" rx="4" fill="#00B4D8" fill-opacity="0.4"/>

  <!-- Wall-Mounted Poly X70 / Group 500 Bar Centered Under Dual Screens -->
  <rect x="430" y="450" width="340" height="54" rx="18" fill="#090D16" stroke="#00B4D8" stroke-width="2.5"/>
  <circle cx="575" cy="477" r="14" fill="#0284C7" stroke="#E0F2FE" stroke-width="2"/>
  <circle cx="625" cy="477" r="14" fill="#0284C7" stroke="#E0F2FE" stroke-width="2"/>
  <rect x="560" y="508" width="80" height="4" rx="2" fill="#00B4D8"/>

  <!-- Executive Conference Table & TC10 Touch Controller -->
  <polygon points="180,680 1020,680 1120,760 80,760" fill="#1E293B" stroke="#00B4D8" stroke-width="2"/>
  <rect x="530" y="635" width="140" height="70" rx="10" fill="#0F172A" stroke="#38BDF8" stroke-width="2.5"/>
  <text x="552" y="675" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="15" font-weight="bold">POLY TC10</text>

  <!-- Expansion Table Microphones -->
  <circle cx="330" cy="705" r="24" fill="#0F172A" stroke="#00B4D8" stroke-width="2"/>
  <circle cx="870" cy="705" r="24" fill="#0F172A" stroke="#00B4D8" stroke-width="2"/>

  <!-- Footer Text -->
  <text x="80" y="818" fill="#F8FAFC" font-family="DejaVu Sans, Arial, sans-serif" font-size="27" font-weight="bold">Poly Studio X70 / X72 &amp; Polycom Group 500 Boardroom Architecture</text>
  <text x="80" y="852" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" font-weight="bold">Turnkey Dual-Display 4K Integration • Lahore, Karachi &amp; Islamabad • AV Live</text>
</svg>`,
  },
  {
    filenameBase: 'cisco-room-kit-studio',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <defs>
    <linearGradient id="ciscoBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0A1428"/>
      <stop offset="50%" stop-color="#1A2B4C"/>
      <stop offset="100%" stop-color="#0D1F3A"/>
    </linearGradient>
    <linearGradient id="silverChassis" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F1F5F9"/>
      <stop offset="50%" stop-color="#CBD5E1"/>
      <stop offset="100%" stop-color="#64748B"/>
    </linearGradient>
    <radialGradient id="ciscoLens" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="40%" stop-color="#0284C7"/>
      <stop offset="85%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="900" fill="url(#ciscoBg)"/>
  <circle cx="600" cy="400" r="380" fill="#00B4D8" fill-opacity="0.08"/>

  <!-- Header Badges -->
  <rect x="80" y="60" width="380" height="44" rx="8" fill="#00B4D8" fill-opacity="0.18" stroke="#00B4D8" stroke-width="1.5"/>
  <text x="104" y="88" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" font-weight="bold">CISCO WEBEX ROOM KIT SERIES</text>

  <rect x="840" y="60" width="280" height="44" rx="8" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
  <text x="866" y="88" fill="#E2E8F0" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">5K ULTRAHD QUAD CAMERA</text>

  <!-- Cisco Quad Camera Bar (Top Unit) -->
  <rect x="130" y="210" width="940" height="150" rx="50" fill="url(#silverChassis)" stroke="#94A3B8" stroke-width="3"/>
  <rect x="150" y="228" width="900" height="114" rx="38" fill="#1E293B" stroke="#475569" stroke-width="2"/>

  <!-- Quad 5K Camera Array in Center -->
  <rect x="415" y="240" width="370" height="90" rx="26" fill="#090D16" stroke="#00B4D8" stroke-width="2"/>
  <circle cx="465" cy="285" r="26" fill="url(#ciscoLens)" stroke="#38BDF8" stroke-width="2"/>
  <circle cx="555" cy="285" r="26" fill="url(#ciscoLens)" stroke="#38BDF8" stroke-width="2"/>
  <circle cx="645" cy="285" r="26" fill="url(#ciscoLens)" stroke="#38BDF8" stroke-width="2"/>
  <circle cx="735" cy="285" r="26" fill="url(#ciscoLens)" stroke="#38BDF8" stroke-width="2"/>

  <!-- Cisco Codec Plus / Pro Unit (Bottom Left) -->
  <rect x="150" y="430" width="490" height="95" rx="22" fill="url(#silverChassis)" stroke="#94A3B8" stroke-width="2.5"/>
  <rect x="175" y="454" width="440" height="48" rx="10" fill="#0F172A"/>
  <text x="205" y="485" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" font-weight="bold">CISCO CODEC PLUS • 4K60 ENGINE</text>

  <!-- Cisco Room Navigator Touch 10 Controller (Bottom Right) -->
  <rect x="700" y="400" width="340" height="185" rx="18" fill="#0F172A" stroke="#38BDF8" stroke-width="3"/>
  <rect x="720" y="420" width="300" height="145" rx="10" fill="#1E293B"/>
  <circle cx="780" cy="485" r="28" fill="#10B981"/>
  <circle cx="870" cy="485" r="28" fill="#00B4D8"/>
  <circle cx="960" cy="485" r="28" fill="#3B82F6"/>
  <text x="752" y="545" fill="#E2E8F0" font-family="DejaVu Sans, Arial, sans-serif" font-size="15" font-weight="bold">Cisco Room Navigator Touch Panel</text>

  <!-- Feature Cards -->
  <rect x="80" y="635" width="320" height="82" rx="12" fill="#0F172A" stroke="#00B4D8" stroke-width="1.5"/>
  <text x="104" y="668" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">5K QUAD CAMERA OPTICS</text>
  <text x="104" y="696" fill="#CBD5E1" font-family="DejaVu Sans, Arial, sans-serif" font-size="14">4 Embedded Digital Tracking Lenses</text>

  <rect x="440" y="635" width="320" height="82" rx="12" fill="#0F172A" stroke="#00B4D8" stroke-width="1.5"/>
  <text x="464" y="668" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">WEBEX, TEAMS &amp; H.323/SIP</text>
  <text x="464" y="696" fill="#CBD5E1" font-family="DejaVu Sans, Arial, sans-serif" font-size="14">Dual/Triple 4K UHD HDMI Outputs</text>

  <rect x="800" y="635" width="320" height="82" rx="12" fill="#0F172A" stroke="#00B4D8" stroke-width="1.5"/>
  <text x="824" y="668" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">ROOM NAVIGATOR CONTROL</text>
  <text x="824" y="696" fill="#CBD5E1" font-family="DejaVu Sans, Arial, sans-serif" font-size="14">One-Touch Join &amp; Room Booking</text>

  <text x="80" y="805" fill="#F8FAFC" font-family="DejaVu Sans, Arial, sans-serif" font-size="28" font-weight="bold">Cisco Room Kit, Room Kit Plus &amp; Room Bar Enterprise Systems</text>
  <text x="80" y="842" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" font-weight="bold">AV Live Communications Pakistan • Certified Cisco Collaboration Integrator</text>
</svg>`,
  },
  {
    filenameBase: 'cisco-room-kit-eq',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <defs>
    <linearGradient id="eqBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#091122"/>
      <stop offset="50%" stop-color="#162644"/>
      <stop offset="100%" stop-color="#0B182E"/>
    </linearGradient>
    <linearGradient id="carbonBody" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="50%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="900" fill="url(#eqBg)"/>

  <!-- Header -->
  <rect x="80" y="60" width="420" height="44" rx="8" fill="#00B4D8" fill-opacity="0.18" stroke="#00B4D8" stroke-width="1.5"/>
  <text x="104" y="88" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" font-weight="bold">CISCO ROOM KIT EQ &amp; ROOM KIT PRO</text>

  <rect x="820" y="60" width="300" height="44" rx="8" fill="#1E293B" stroke="#00B4D8" stroke-width="1.5"/>
  <text x="845" y="88" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">NVIDIA AI CODEC ENGINE</text>

  <!-- Triple 4K Boardroom Monitor Preview -->
  <rect x="95" y="140" width="315" height="185" rx="8" fill="#0F172A" stroke="#00B4D8" stroke-width="2"/>
  <text x="125" y="225" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" font-weight="bold">DISPLAY 1: ACTIVE SPEAKER</text>
  <text x="125" y="255" fill="#94A3B8" font-family="DejaVu Sans, Arial, sans-serif" font-size="14">4K60 Cinematic People Framing</text>

  <rect x="442" y="140" width="315" height="185" rx="8" fill="#0F172A" stroke="#00B4D8" stroke-width="2"/>
  <text x="472" y="225" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" font-weight="bold">DISPLAY 2: REMOTE GALLERY</text>
  <text x="472" y="255" fill="#94A3B8" font-family="DejaVu Sans, Arial, sans-serif" font-size="14">Microsoft Teams Front Row / Webex</text>

  <rect x="790" y="140" width="315" height="185" rx="8" fill="#0F172A" stroke="#00B4D8" stroke-width="2"/>
  <text x="820" y="225" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" font-weight="bold">DISPLAY 3: 4K60 CONTENT</text>
  <text x="820" y="255" fill="#94A3B8" font-family="DejaVu Sans, Arial, sans-serif" font-size="14">Triple HDMI + USB-C Passthrough</text>

  <!-- Carbon Black Cisco Quad Camera Bar -->
  <rect x="160" y="365" width="880" height="115" rx="42" fill="url(#carbonBody)" stroke="#38BDF8" stroke-width="2.5"/>
  <rect x="435" y="388" width="330" height="70" rx="20" fill="#020617" stroke="#00B4D8" stroke-width="2"/>
  <circle cx="485" cy="423" r="20" fill="#0284C7" stroke="#E0F2FE" stroke-width="2"/>
  <circle cx="562" cy="423" r="20" fill="#0284C7" stroke="#E0F2FE" stroke-width="2"/>
  <circle cx="638" cy="423" r="20" fill="#0284C7" stroke="#E0F2FE" stroke-width="2"/>
  <circle cx="715" cy="423" r="20" fill="#0284C7" stroke="#E0F2FE" stroke-width="2"/>

  <!-- Cisco Codec EQ / Codec Pro Rack Chassis -->
  <rect x="160" y="515" width="880" height="90" rx="16" fill="#0F172A" stroke="#64748B" stroke-width="2.5"/>
  <text x="195" y="568" fill="#F8FAFC" font-family="DejaVu Sans, Arial, sans-serif" font-size="20" font-weight="bold">CISCO CODEC EQ / PRO</text>
  <rect x="480" y="540" width="110" height="40" rx="6" fill="#1E293B" stroke="#00B4D8" stroke-width="1.5"/>
  <text x="498" y="566" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="14" font-weight="bold">3x 4K HDMI</text>
  <rect x="610" y="540" width="125" height="40" rx="6" fill="#1E293B" stroke="#00B4D8" stroke-width="1.5"/>
  <text x="625" y="566" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="14" font-weight="bold">3x PoE++ MIC</text>
  <rect x="755" y="540" width="135" height="40" rx="6" fill="#1E293B" stroke="#00B4D8" stroke-width="1.5"/>
  <text x="772" y="566" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="14" font-weight="bold">8x XLR / SDI</text>
  <circle cx="980" cy="560" r="14" fill="#10B981"/>

  <!-- Feature Cards -->
  <rect x="80" y="640" width="320" height="80" rx="12" fill="#0F172A" stroke="#00B4D8" stroke-width="1.5"/>
  <text x="104" y="672" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">FLAGSHIP BOARDROOM CODEC</text>
  <text x="104" y="700" fill="#CBD5E1" font-family="DejaVu Sans, Arial, sans-serif" font-size="14">16 to 30+ Seat Executive Suites</text>

  <rect x="440" y="640" width="320" height="80" rx="12" fill="#0F172A" stroke="#00B4D8" stroke-width="1.5"/>
  <text x="464" y="672" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">AI NOISE REMOVAL &amp; AEC</text>
  <text x="464" y="700" fill="#CBD5E1" font-family="DejaVu Sans, Arial, sans-serif" font-size="14">Cisco Table &amp; Ceiling Mic Pro</text>

  <rect x="800" y="640" width="320" height="80" rx="12" fill="#0F172A" stroke="#00B4D8" stroke-width="1.5"/>
  <text x="824" y="672" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">15-MINUTE ENGINEERING SLA</text>
  <text x="824" y="700" fill="#CBD5E1" font-family="DejaVu Sans, Arial, sans-serif" font-size="14">Lahore • Karachi • Islamabad</text>

  <text x="80" y="805" fill="#F8FAFC" font-family="DejaVu Sans, Arial, sans-serif" font-size="28" font-weight="bold">Cisco Room Kit EQ &amp; Room Kit Pro Flagship Integrator Bundles</text>
  <text x="80" y="842" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" font-weight="bold">AV Live Communications Pakistan • Official Warranty &amp; Acoustic Calibration</text>
</svg>`,
  },
  {
    filenameBase: '3d-hologram-stage',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <defs>
    <linearGradient id="holoBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#040814"/>
      <stop offset="50%" stop-color="#0D1F3D"/>
      <stop offset="100%" stop-color="#050B18"/>
    </linearGradient>
    <radialGradient id="holoGlow" cx="50%" cy="45%" r="45%">
      <stop offset="0%" stop-color="#00F5D4" stop-opacity="0.45"/>
      <stop offset="45%" stop-color="#00B4D8" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#040814" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="beamGrad" x1="50%" y1="100%" x2="50%" y2="0%">
      <stop offset="0%" stop-color="#00F5D4" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#00B4D8" stop-opacity="0.05"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="900" fill="url(#holoBg)"/>
  <circle cx="600" cy="410" r="420" fill="url(#holoGlow)"/>

  <!-- Header Badges -->
  <rect x="80" y="58" width="410" height="44" rx="8" fill="#00B4D8" fill-opacity="0.2" stroke="#00F5D4" stroke-width="1.5"/>
  <text x="104" y="86" fill="#00F5D4" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" font-weight="bold">3D HOLOGRAM DISPLAY STAGE PRODUCTION</text>

  <rect x="810" y="58" width="310" height="44" rx="8" fill="#0F172A" stroke="#00B4D8" stroke-width="1.5"/>
  <text x="835" y="86" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">HOLOGAUZE &amp; PEPPER'S GHOST</text>

  <!-- Overhead Laser Projector Truss Rig -->
  <rect x="180" y="130" width="840" height="22" rx="4" fill="#1E293B" stroke="#475569" stroke-width="2"/>
  <rect x="550" y="152" width="100" height="36" rx="6" fill="#0F172A" stroke="#00F5D4" stroke-width="2"/>
  <circle cx="600" cy="188" r="10" fill="#00F5D4"/>

  <!-- Volumetric Hologram Projection Cone -->
  <polygon points="600,192 270,600 930,600" fill="url(#beamGrad)"/>

  <!-- Floating 3D Volumetric Wireframe Sphere & Polyhedron -->
  <circle cx="600" cy="400" r="155" fill="none" stroke="#00F5D4" stroke-width="3"/>
  <ellipse cx="600" cy="400" rx="155" ry="62" fill="none" stroke="#38BDF8" stroke-width="2.5"/>
  <ellipse cx="600" cy="400" rx="68" ry="155" fill="none" stroke="#38BDF8" stroke-width="2.5"/>
  <polygon points="600,255 735,355 685,515 515,515 465,355" fill="#00B4D8" fill-opacity="0.18" stroke="#00F5D4" stroke-width="2.5"/>
  <circle cx="600" cy="400" r="24" fill="#00F5D4"/>

  <!-- Stage Deck & LED Emitter Strip -->
  <polygon points="160,600 1040,600 1130,665 70,665" fill="#0F172A" stroke="#00B4D8" stroke-width="2.5"/>
  <ellipse cx="600" cy="600" rx="310" ry="18" fill="#00F5D4" fill-opacity="0.45" stroke="#00F5D4" stroke-width="2"/>

  <!-- Technical Spec Callouts -->
  <rect x="80" y="685" width="320" height="76" rx="12" fill="#0F172A" stroke="#00F5D4" stroke-width="1.5"/>
  <text x="104" y="715" fill="#00F5D4" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">40,000-LUMEN 4K LASER RIG</text>
  <text x="104" y="742" fill="#CBD5E1" font-family="DejaVu Sans, Arial, sans-serif" font-size="14">Panasonic 3-Chip DLP &amp; HoloGauze</text>

  <rect x="440" y="685" width="320" height="76" rx="12" fill="#0F172A" stroke="#00F5D4" stroke-width="1.5"/>
  <text x="464" y="715" fill="#00F5D4" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">GLASSES-FREE 3D TELEPRESENCE</text>
  <text x="464" y="742" fill="#CBD5E1" font-family="DejaVu Sans, Arial, sans-serif" font-size="14">Live Holographic Keynotes &amp; Reveals</text>

  <rect x="800" y="685" width="320" height="76" rx="12" fill="#0F172A" stroke="#00F5D4" stroke-width="1.5"/>
  <text x="824" y="715" fill="#00F5D4" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">TURNKEY CORPORATE EVENTS</text>
  <text x="824" y="742" fill="#CBD5E1" font-family="DejaVu Sans, Arial, sans-serif" font-size="14">Lahore • Karachi • Islamabad</text>

  <text x="80" y="812" fill="#F8FAFC" font-family="DejaVu Sans, Arial, sans-serif" font-size="28" font-weight="bold">3D Hologram Display Stages &amp; Volumetric Projection Mapping</text>
  <text x="80" y="848" fill="#00F5D4" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" font-weight="bold">AV Live Communications Pakistan • In-House Holographic Stage Fleet</text>
</svg>`,
  },
  {
    filenameBase: '3d-hologram-display',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <defs>
    <linearGradient id="podBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#060D1F"/>
      <stop offset="50%" stop-color="#14284B"/>
      <stop offset="100%" stop-color="#071226"/>
    </linearGradient>
    <radialGradient id="fanGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.5"/>
      <stop offset="60%" stop-color="#00B4D8" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#060D1F" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="900" fill="url(#podBg)"/>

  <!-- Header -->
  <rect x="80" y="60" width="430" height="44" rx="8" fill="#00B4D8" fill-opacity="0.2" stroke="#00B4D8" stroke-width="1.5"/>
  <text x="104" y="88" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" font-weight="bold">3D HOLOGRAPHIC LED FAN MATRIX &amp; POD</text>

  <rect x="820" y="60" width="300" height="44" rx="8" fill="#0F172A" stroke="#38BDF8" stroke-width="1.5"/>
  <text x="845" y="88" fill="#E2E8F0" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">EXPO &amp; BRAND REVEAL DISPLAY</text>

  <!-- Left: 4-Fan Synchronized 3D Hologram LED Wall Matrix -->
  <rect x="100" y="150" width="470" height="460" rx="22" fill="#0F172A" stroke="#00B4D8" stroke-width="2.5"/>
  <circle cx="235" cy="285" r="105" fill="url(#fanGlow)" stroke="#38BDF8" stroke-width="2"/>
  <circle cx="435" cy="285" r="105" fill="url(#fanGlow)" stroke="#38BDF8" stroke-width="2"/>
  <circle cx="235" cy="475" r="105" fill="url(#fanGlow)" stroke="#38BDF8" stroke-width="2"/>
  <circle cx="435" cy="475" r="105" fill="url(#fanGlow)" stroke="#38BDF8" stroke-width="2"/>
  <polygon points="335,215 445,380 335,545 225,380" fill="#00F5D4" fill-opacity="0.22" stroke="#00F5D4" stroke-width="3"/>
  <circle cx="335" cy="380" r="36" fill="#00B4D8" stroke="#E0F2FE" stroke-width="3"/>
  <text x="145" y="590" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">Synchronized 4K 3D LED Hologram Rotor Wall</text>

  <!-- Right: 270-Degree 3D Hologram Pyramid Showcase Cabinet -->
  <rect x="630" y="150" width="470" height="460" rx="22" fill="#0F172A" stroke="#00B4D8" stroke-width="2.5"/>
  <polygon points="680,220 1050,220 940,480 790,480" fill="#00B4D8" fill-opacity="0.14" stroke="#38BDF8" stroke-width="2.5"/>
  <polygon points="865,275 935,355 865,435 795,355" fill="#00F5D4" fill-opacity="0.35" stroke="#00F5D4" stroke-width="3"/>
  <rect x="690" y="485" width="350" height="75" rx="10" fill="#1E293B" stroke="#475569" stroke-width="2"/>
  <text x="712" y="530" fill="#E2E8F0" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">270° Glass Hologram Showcase Pod</text>

  <!-- Bottom Spec Cards -->
  <rect x="80" y="645" width="320" height="78" rx="12" fill="#0F172A" stroke="#00B4D8" stroke-width="1.5"/>
  <text x="104" y="676" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">2500-NIT HIGH BRIGHTNESS</text>
  <text x="104" y="704" fill="#CBD5E1" font-family="DejaVu Sans, Arial, sans-serif" font-size="14">Daylight-Visible Expo &amp; Retail Pods</text>

  <rect x="440" y="645" width="320" height="78" rx="12" fill="#0F172A" stroke="#00B4D8" stroke-width="1.5"/>
  <text x="464" y="676" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">CUSTOM 3D MOTION GRAPHICS</text>
  <text x="464" y="704" fill="#CBD5E1" font-family="DejaVu Sans, Arial, sans-serif" font-size="14">Alpha-Channel Product &amp; Logo Renders</text>

  <rect x="800" y="645" width="320" height="78" rx="12" fill="#0F172A" stroke="#00B4D8" stroke-width="1.5"/>
  <text x="824" y="676" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold">RENTAL &amp; PERMANENT INSTALL</text>
  <text x="824" y="704" fill="#CBD5E1" font-family="DejaVu Sans, Arial, sans-serif" font-size="14">Expo Centre Lahore, Karachi &amp; ISB</text>

  <text x="80" y="810" fill="#F8FAFC" font-family="DejaVu Sans, Arial, sans-serif" font-size="28" font-weight="bold">3D Hologram Display Cabinets &amp; Synchronized LED Fan Walls</text>
  <text x="80" y="846" fill="#38BDF8" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" font-weight="bold">AV Live Communications Pakistan • Corporate Events &amp; Trade Show Pavilions</text>
</svg>`,
  },
];

const IMAGEMAGICK_DRAW_COMMANDS: Record<string, string[]> = {
  'poly-x70-studio': [
    '-size 1200x900 gradient:"#0B1325-#1A2B4C"',
    '-fill "#00B4D818" -draw "circle 600,420 600,60"',
    '-stroke "#00B4D844" -strokewidth 2 -draw "line 80,130 1120,130" -draw "line 80,745 1120,745"',
    '-fill "#0F172A" -stroke "#00B4D8" -strokewidth 2 -draw "roundrectangle 80,58 465,104 8,8"',
    '-stroke none -fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 18 -draw "text 102,88 \'HP POLY STUDIO X70 / X72 SERIES\'"',
    '-fill "#1E293B" -stroke "#475569" -strokewidth 2 -draw "roundrectangle 850,58 1120,104 8,8"',
    '-stroke none -fill "#E2E8F0" -font "DejaVu-Sans-Bold" -pointsize 16 -draw "text 874,88 \'DUAL 4K 20MP AI OPTICS\'"',
    '-fill "#020617AA" -stroke none -draw "ellipse 600,595 450,24 0,360"',
    '-fill "#1E293B" -stroke "#475569" -strokewidth 2 -draw "roundrectangle 520,518 680,560 6,6"',
    '-fill "#334155" -stroke "#64748B" -strokewidth 2 -draw "roundrectangle 440,554 760,578 10,10"',
    '-fill "#1E293B" -stroke "#64748B" -strokewidth 3 -draw "roundrectangle 130,335 1070,525 42,42"',
    '-fill "#0F172A" -stroke "#334155" -strokewidth 2 -draw "roundrectangle 148,352 1052,508 32,32"',
    '-fill "#1E293B" -stroke "#334155" -strokewidth 2 -draw "roundrectangle 168,366 430,494 20,20"',
    '-fill "#1E293B" -stroke "#334155" -strokewidth 2 -draw "roundrectangle 770,366 1032,494 20,20"',
    '-fill "#090D16" -stroke "#00B4D8" -strokewidth 3 -draw "roundrectangle 448,362 752,498 26,26"',
    '-fill "#1E293B" -stroke "#94A3B8" -strokewidth 3 -draw "circle 535,430 535,382"',
    '-fill "#0369A1" -stroke "#00B4D8" -strokewidth 2 -draw "circle 535,430 535,396"',
    '-fill "#E0F2FE" -stroke none -draw "circle 524,418 524,410"',
    '-fill "#1E293B" -stroke "#94A3B8" -strokewidth 3 -draw "circle 665,430 665,382"',
    '-fill "#0369A1" -stroke "#00B4D8" -strokewidth 2 -draw "circle 665,430 665,396"',
    '-fill "#E0F2FE" -stroke none -draw "circle 654,418 654,410"',
    '-fill "#00B4D8" -stroke none -draw "roundrectangle 520,512 680,519 3,3"',
    '-fill "#F8FAFC" -font "DejaVu-Sans-Bold" -pointsize 26 -draw "text 562,322 \'POLY\'"',
    '-fill "#0F172A" -stroke "#00B4D8" -strokewidth 2 -draw "roundrectangle 80,632 400,718 12,12"',
    '-stroke none -fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 16 -draw "text 104,666 \'DUAL 20MP 4K SENSORS\'"',
    '-fill "#CBD5E1" -font "DejaVu-Sans" -pointsize 14 -draw "text 104,696 \'120 Wide + 70 Telephoto Lenses\'"',
    '-fill "#0F172A" -stroke "#00B4D8" -strokewidth 2 -draw "roundrectangle 440,632 760,718 12,12"',
    '-stroke none -fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 16 -draw "text 464,666 \'POLY DIRECTORAI FRAMING\'"',
    '-fill "#CBD5E1" -font "DejaVu-Sans" -pointsize 14 -draw "text 464,696 \'25ft Mic Array + NoiseBlockAI\'"',
    '-fill "#0F172A" -stroke "#00B4D8" -strokewidth 2 -draw "roundrectangle 800,632 1120,718 12,12"',
    '-stroke none -fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 16 -draw "text 824,666 \'LARGE BOARDROOMS (26+ PAX)\'"',
    '-fill "#CBD5E1" -font "DejaVu-Sans" -pointsize 14 -draw "text 824,696 \'Native Zoom & Microsoft Teams\'"',
    '-fill "#F8FAFC" -font "DejaVu-Sans-Bold" -pointsize 28 -draw "text 80,802 \'HP Poly Studio X70 / X72 Large Room 4K AI Video Bar\'"',
    '-fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 18 -draw "text 80,842 \'AV Live Communications Pakistan  |  Authorized Enterprise Partner  |  1-Year Warranty\'"',
  ],
  'poly-x70-boardroom': [
    '-size 1200x900 gradient:"#0F172A-#1A2B4C"',
    '-fill "#1E293B" -stroke "#334155" -strokewidth 2 -draw "roundrectangle 70,70 1130,610 16,16"',
    '-fill "#0F172A" -stroke "#00B4D8" -strokewidth 2 -draw "roundrectangle 100,95 540,138 8,8"',
    '-stroke none -fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 16 -draw "text 120,122 \'EXECUTIVE BOARDROOM TELEPRESENCE SUITE\'"',
    '-fill "#0284C7" -stroke "#38BDF8" -strokewidth 3 -draw "roundrectangle 120,165 570,425 10,10"',
    '-fill "#0F172A" -stroke none -draw "roundrectangle 140,185 340,295 6,6" -draw "roundrectangle 355,185 550,295 6,6" -draw "roundrectangle 140,308 550,405 6,6"',
    '-fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 16 -draw "text 165,245 \'LAHORE HQ\'" -draw "text 380,245 \'KARACHI HUB\'"',
    '-fill "#E2E8F0" -font "DejaVu-Sans-Bold" -pointsize 17 -draw "text 160,362 \'DirectorAI Multi-Speaker Framing Active\'"',
    '-fill "#1E3A8A" -stroke "#38BDF8" -strokewidth 3 -draw "roundrectangle 630,165 1080,425 10,10"',
    '-fill "#0F172A" -stroke none -draw "roundrectangle 655,190 1055,400 6,6"',
    '-fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 18 -draw "text 685,240 \'4K 60FPS CONTENT SHARING\'"',
    '-fill "#00B4D8" -draw "roundrectangle 685,268 1020,284 4,4" -draw "roundrectangle 685,300 960,316 4,4" -draw "roundrectangle 685,332 995,348 4,4"',
    '-fill "#090D16" -stroke "#00B4D8" -strokewidth 3 -draw "roundrectangle 430,450 770,506 18,18"',
    '-fill "#0284C7" -stroke "#E0F2FE" -strokewidth 2 -draw "circle 575,478 575,464" -draw "circle 625,478 625,464"',
    '-fill "#1E293B" -stroke "#00B4D8" -strokewidth 2 -draw "polygon 180,680 1020,680 1120,760 80,760"',
    '-fill "#0F172A" -stroke "#38BDF8" -strokewidth 2 -draw "roundrectangle 530,635 670,705 10,10"',
    '-stroke none -fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 15 -draw "text 554,676 \'POLY TC10\'"',
    '-fill "#F8FAFC" -font "DejaVu-Sans-Bold" -pointsize 27 -draw "text 80,814 \'Poly Studio X70 / X72 & Polycom Group 500 Boardroom Architecture\'"',
    '-fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 18 -draw "text 80,852 \'Turnkey Dual-Display 4K Integration  |  Lahore, Karachi & Islamabad  |  AV Live\'"',
  ],
  'cisco-room-kit-studio': [
    '-size 1200x900 gradient:"#0A1428-#1A2B4C"',
    '-fill "#00B4D818" -draw "circle 600,400 600,60"',
    '-fill "#0F172A" -stroke "#00B4D8" -strokewidth 2 -draw "roundrectangle 80,60 470,104 8,8"',
    '-stroke none -fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 18 -draw "text 104,88 \'CISCO WEBEX ROOM KIT SERIES\'"',
    '-fill "#1E293B" -stroke "#475569" -strokewidth 2 -draw "roundrectangle 830,60 1120,104 8,8"',
    '-stroke none -fill "#E2E8F0" -font "DejaVu-Sans-Bold" -pointsize 16 -draw "text 855,88 \'5K ULTRAHD QUAD CAMERA\'"',
    '-fill "#CBD5E1" -stroke "#94A3B8" -strokewidth 3 -draw "roundrectangle 130,210 1070,360 50,50"',
    '-fill "#1E293B" -stroke "#475569" -strokewidth 2 -draw "roundrectangle 150,228 1050,342 38,38"',
    '-fill "#090D16" -stroke "#00B4D8" -strokewidth 2 -draw "roundrectangle 415,240 785,330 26,26"',
    '-fill "#0284C7" -stroke "#38BDF8" -strokewidth 2 -draw "circle 465,285 465,259" -draw "circle 555,285 555,259" -draw "circle 645,285 645,259" -draw "circle 735,285 735,259"',
    '-fill "#CBD5E1" -stroke "#94A3B8" -strokewidth 2 -draw "roundrectangle 150,430 640,525 22,22"',
    '-fill "#0F172A" -stroke none -draw "roundrectangle 175,454 615,502 10,10"',
    '-fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 18 -draw "text 200,485 \'CISCO CODEC PLUS  |  4K60 ENGINE\'"',
    '-fill "#0F172A" -stroke "#38BDF8" -strokewidth 3 -draw "roundrectangle 700,400 1040,585 18,18"',
    '-fill "#1E293B" -stroke none -draw "roundrectangle 720,420 1020,565 10,10"',
    '-fill "#10B981" -draw "circle 780,485 780,457"',
    '-fill "#00B4D8" -draw "circle 870,485 870,457"',
    '-fill "#3B82F6" -draw "circle 960,485 960,457"',
    '-fill "#E2E8F0" -font "DejaVu-Sans-Bold" -pointsize 15 -draw "text 745,548 \'Cisco Room Navigator Touch Panel\'"',
    '-fill "#0F172A" -stroke "#00B4D8" -strokewidth 2 -draw "roundrectangle 80,635 400,717 12,12"',
    '-stroke none -fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 16 -draw "text 104,668 \'5K QUAD CAMERA OPTICS\'"',
    '-fill "#CBD5E1" -font "DejaVu-Sans" -pointsize 14 -draw "text 104,696 \'4 Embedded Digital Tracking Lenses\'"',
    '-fill "#0F172A" -stroke "#00B4D8" -strokewidth 2 -draw "roundrectangle 440,635 760,717 12,12"',
    '-stroke none -fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 16 -draw "text 464,668 \'WEBEX, TEAMS & H.323/SIP\'"',
    '-fill "#CBD5E1" -font "DejaVu-Sans" -pointsize 14 -draw "text 464,696 \'Dual/Triple 4K UHD HDMI Outputs\'"',
    '-fill "#0F172A" -stroke "#00B4D8" -strokewidth 2 -draw "roundrectangle 800,635 1120,717 12,12"',
    '-stroke none -fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 16 -draw "text 824,668 \'ROOM NAVIGATOR CONTROL\'"',
    '-fill "#CBD5E1" -font "DejaVu-Sans" -pointsize 14 -draw "text 824,696 \'One-Touch Join & Room Booking\'"',
    '-fill "#F8FAFC" -font "DejaVu-Sans-Bold" -pointsize 28 -draw "text 80,805 \'Cisco Room Kit, Room Kit Plus & Room Bar Enterprise Systems\'"',
    '-fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 18 -draw "text 80,842 \'AV Live Communications Pakistan  |  Certified Cisco Collaboration Integrator\'"',
  ],
  'cisco-room-kit-eq': [
    '-size 1200x900 gradient:"#091122-#162644"',
    '-fill "#0F172A" -stroke "#00B4D8" -strokewidth 2 -draw "roundrectangle 80,60 510,104 8,8"',
    '-stroke none -fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 18 -draw "text 104,88 \'CISCO ROOM KIT EQ & ROOM KIT PRO\'"',
    '-fill "#1E293B" -stroke "#00B4D8" -strokewidth 2 -draw "roundrectangle 820,60 1120,104 8,8"',
    '-stroke none -fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 16 -draw "text 845,88 \'NVIDIA AI CODEC ENGINE\'"',
    '-fill "#0F172A" -stroke "#00B4D8" -strokewidth 2 -draw "roundrectangle 95,140 410,325 8,8" -draw "roundrectangle 442,140 757,325 8,8" -draw "roundrectangle 790,140 1105,325 8,8"',
    '-stroke none -fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 17 -draw "text 120,225 \'DISPLAY 1: ACTIVE SPEAKER\'" -draw "text 468,225 \'DISPLAY 2: REMOTE GALLERY\'" -draw "text 815,225 \'DISPLAY 3: 4K60 CONTENT\'"',
    '-fill "#94A3B8" -font "DejaVu-Sans" -pointsize 14 -draw "text 120,255 \'4K60 Cinematic People Framing\'" -draw "text 468,255 \'Microsoft Teams Front Row / Webex\'" -draw "text 815,255 \'Triple HDMI + USB-C Passthrough\'"',
    '-fill "#1E293B" -stroke "#38BDF8" -strokewidth 2 -draw "roundrectangle 160,365 1040,480 42,42"',
    '-fill "#020617" -stroke "#00B4D8" -strokewidth 2 -draw "roundrectangle 435,388 765,458 20,20"',
    '-fill "#0284C7" -stroke "#E0F2FE" -strokewidth 2 -draw "circle 485,423 485,403" -draw "circle 562,423 562,403" -draw "circle 638,423 638,403" -draw "circle 715,423 715,403"',
    '-fill "#0F172A" -stroke "#64748B" -strokewidth 2 -draw "roundrectangle 160,515 1040,605 16,16"',
    '-stroke none -fill "#F8FAFC" -font "DejaVu-Sans-Bold" -pointsize 20 -draw "text 195,568 \'CISCO CODEC EQ / PRO\'"',
    '-fill "#1E293B" -stroke "#00B4D8" -strokewidth 2 -draw "roundrectangle 480,540 605,580 6,6" -draw "roundrectangle 620,540 760,580 6,6" -draw "roundrectangle 775,540 915,580 6,6"',
    '-stroke none -fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 14 -draw "text 495,566 \'3x 4K HDMI\'" -draw "text 635,566 \'3x PoE++ MIC\'" -draw "text 792,566 \'8x XLR / SDI\'"',
    '-fill "#10B981" -draw "circle 980,560 980,546"',
    '-fill "#0F172A" -stroke "#00B4D8" -strokewidth 2 -draw "roundrectangle 80,640 400,720 12,12" -draw "roundrectangle 440,640 760,720 12,12" -draw "roundrectangle 800,640 1120,720 12,12"',
    '-stroke none -fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 16 -draw "text 104,672 \'FLAGSHIP BOARDROOM CODEC\'" -draw "text 464,672 \'AI NOISE REMOVAL & AEC\'" -draw "text 824,672 \'15-MINUTE ENGINEERING SLA\'"',
    '-fill "#CBD5E1" -font "DejaVu-Sans" -pointsize 14 -draw "text 104,700 \'16 to 30+ Seat Executive Suites\'" -draw "text 464,700 \'Cisco Table & Ceiling Mic Pro\'" -draw "text 824,700 \'Lahore  |  Karachi  |  Islamabad\'"',
    '-fill "#F8FAFC" -font "DejaVu-Sans-Bold" -pointsize 28 -draw "text 80,805 \'Cisco Room Kit EQ & Room Kit Pro Flagship Integrator Bundles\'"',
    '-fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 18 -draw "text 80,842 \'AV Live Communications Pakistan  |  Official Warranty & Acoustic Calibration\'"',
  ],
  '3d-hologram-stage': [
    '-size 1200x900 gradient:"#040814-#0D1F3D"',
    '-fill "#00F5D422" -draw "circle 600,400 600,120"',
    '-fill "#0F172A" -stroke "#00F5D4" -strokewidth 2 -draw "roundrectangle 80,58 510,102 8,8"',
    '-stroke none -fill "#00F5D4" -font "DejaVu-Sans-Bold" -pointsize 18 -draw "text 104,86 \'3D HOLOGRAM DISPLAY STAGE PRODUCTION\'"',
    '-fill "#0F172A" -stroke "#00B4D8" -strokewidth 2 -draw "roundrectangle 800,58 1120,102 8,8"',
    '-stroke none -fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 16 -draw "text 825,86 \'HOLOGAUZE & PEPPERS GHOST\'"',
    '-fill "#1E293B" -stroke "#475569" -strokewidth 2 -draw "roundrectangle 180,130 1020,152 4,4"',
    '-fill "#0F172A" -stroke "#00F5D4" -strokewidth 2 -draw "roundrectangle 550,152 650,188 6,6"',
    '-fill "#00B4D828" -stroke "#00F5D466" -strokewidth 1 -draw "polygon 600,192 270,600 930,600"',
    '-fill none -stroke "#00F5D4" -strokewidth 3 -draw "circle 600,400 600,245"',
    '-fill none -stroke "#38BDF8" -strokewidth 2 -draw "ellipse 600,400 155,62 0,360" -draw "ellipse 600,400 68,155 0,360"',
    '-fill "#00B4D833" -stroke "#00F5D4" -strokewidth 3 -draw "polygon 600,255 735,355 685,515 515,515 465,355"',
    '-fill "#00F5D4" -stroke none -draw "circle 600,400 600,376"',
    '-fill "#0F172A" -stroke "#00B4D8" -strokewidth 2 -draw "polygon 160,600 1040,600 1130,665 70,665"',
    '-fill "#00F5D466" -stroke "#00F5D4" -strokewidth 2 -draw "ellipse 600,600 310,18 0,360"',
    '-fill "#0F172A" -stroke "#00F5D4" -strokewidth 2 -draw "roundrectangle 80,685 400,761 12,12" -draw "roundrectangle 440,685 760,761 12,12" -draw "roundrectangle 800,685 1120,761 12,12"',
    '-stroke none -fill "#00F5D4" -font "DejaVu-Sans-Bold" -pointsize 16 -draw "text 104,715 \'40,000-LUMEN 4K LASER RIG\'" -draw "text 464,715 \'GLASSES-FREE 3D TELEPRESENCE\'" -draw "text 824,715 \'TURNKEY CORPORATE EVENTS\'"',
    '-fill "#CBD5E1" -font "DejaVu-Sans" -pointsize 14 -draw "text 104,742 \'Panasonic 3-Chip DLP & HoloGauze\'" -draw "text 464,742 \'Live Holographic Keynotes & Reveals\'" -draw "text 824,742 \'Lahore  |  Karachi  |  Islamabad\'"',
    '-fill "#F8FAFC" -font "DejaVu-Sans-Bold" -pointsize 28 -draw "text 80,812 \'3D Hologram Display Stages & Volumetric Projection Mapping\'"',
    '-fill "#00F5D4" -font "DejaVu-Sans-Bold" -pointsize 18 -draw "text 80,848 \'AV Live Communications Pakistan  |  In-House Holographic Stage Fleet\'"',
  ],
  '3d-hologram-display': [
    '-size 1200x900 gradient:"#060D1F-#14284B"',
    '-fill "#0F172A" -stroke "#00B4D8" -strokewidth 2 -draw "roundrectangle 80,60 525,104 8,8"',
    '-stroke none -fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 18 -draw "text 104,88 \'3D HOLOGRAPHIC LED FAN MATRIX & POD\'"',
    '-fill "#0F172A" -stroke "#38BDF8" -strokewidth 2 -draw "roundrectangle 810,60 1120,104 8,8"',
    '-stroke none -fill "#E2E8F0" -font "DejaVu-Sans-Bold" -pointsize 16 -draw "text 835,88 \'EXPO & BRAND REVEAL DISPLAY\'"',
    '-fill "#0F172A" -stroke "#00B4D8" -strokewidth 2 -draw "roundrectangle 100,150 570,610 22,22"',
    '-fill "#00B4D825" -stroke "#38BDF8" -strokewidth 2 -draw "circle 235,285 235,180" -draw "circle 435,285 435,180" -draw "circle 235,475 235,370" -draw "circle 435,475 435,370"',
    '-fill "#00F5D438" -stroke "#00F5D4" -strokewidth 3 -draw "polygon 335,215 445,380 335,545 225,380"',
    '-fill "#00B4D8" -stroke "#E0F2FE" -strokewidth 3 -draw "circle 335,380 335,344"',
    '-stroke none -fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 16 -draw "text 145,592 \'Synchronized 4K 3D LED Hologram Rotor Wall\'"',
    '-fill "#0F172A" -stroke "#00B4D8" -strokewidth 2 -draw "roundrectangle 630,150 1100,610 22,22"',
    '-fill "#00B4D822" -stroke "#38BDF8" -strokewidth 2 -draw "polygon 680,220 1050,220 940,480 790,480"',
    '-fill "#00F5D455" -stroke "#00F5D4" -strokewidth 3 -draw "polygon 865,275 935,355 865,435 795,355"',
    '-fill "#1E293B" -stroke "#475569" -strokewidth 2 -draw "roundrectangle 690,485 1040,560 10,10"',
    '-stroke none -fill "#E2E8F0" -font "DejaVu-Sans-Bold" -pointsize 16 -draw "text 712,530 \'270 Glass Hologram Showcase Pod\'"',
    '-fill "#0F172A" -stroke "#00B4D8" -strokewidth 2 -draw "roundrectangle 80,645 400,723 12,12" -draw "roundrectangle 440,645 760,723 12,12" -draw "roundrectangle 800,645 1120,723 12,12"',
    '-stroke none -fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 16 -draw "text 104,676 \'2500-NIT HIGH BRIGHTNESS\'" -draw "text 464,676 \'CUSTOM 3D MOTION GRAPHICS\'" -draw "text 824,676 \'RENTAL & PERMANENT INSTALL\'"',
    '-fill "#CBD5E1" -font "DejaVu-Sans" -pointsize 14 -draw "text 104,704 \'Daylight-Visible Expo & Retail Pods\'" -draw "text 464,704 \'Alpha-Channel Product & Logo Renders\'" -draw "text 824,704 \'Expo Centre Lahore, Karachi & ISB\'"',
    '-fill "#F8FAFC" -font "DejaVu-Sans-Bold" -pointsize 28 -draw "text 80,810 \'3D Hologram Display Cabinets & Synchronized LED Fan Walls\'"',
    '-fill "#38BDF8" -font "DejaVu-Sans-Bold" -pointsize 18 -draw "text 80,846 \'AV Live Communications Pakistan  |  Corporate Events & Trade Show Pavilions\'"',
  ],
};

for (const item of IMAGE_SPECS) {
  const svgPath = path.join(OUT_DIR, `${item.filenameBase}.svg`);
  const jpgPath = path.join(OUT_DIR, `${item.filenameBase}.jpg`);
  const webpPath = path.join(OUT_DIR, `${item.filenameBase}.webp`);

  fs.writeFileSync(svgPath, item.svg.trim(), 'utf8');
  const drawArgs = IMAGEMAGICK_DRAW_COMMANDS[item.filenameBase].join(' ');
  execSync(`convert ${drawArgs} -quality 92 "${jpgPath}"`);
  execSync(`convert "${jpgPath}" -quality 90 "${webpPath}"`);

  const jpgStat = fs.statSync(jpgPath);
  const webpStat = fs.statSync(webpPath);
  console.log(
    `[GENERATED] ${item.filenameBase}: .jpg (${(jpgStat.size / 1024).toFixed(1)} KB), .webp (${(webpStat.size / 1024).toFixed(1)} KB)`
  );
}


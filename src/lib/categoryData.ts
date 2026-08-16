import React from 'react';
import { Settings, Mic, Video, ShieldCheck, Speaker, Projector } from 'lucide-react';

export const PILLARS = {
  'unified-communications': 'Unified Communications',
  'security-surveillance': 'Security & Surveillance',
  'pro-audio': 'Pro Audio',
};

export const CATEGORY_DATA = {
  'ip-cameras': {
    title: 'IP Cameras',
    subtitle: 'Advanced surveillance and monitoring',
    description: 'Protect your premises with our comprehensive range of IP cameras. From indoor domes to thermal outdoor systems, we provide crystal-clear video security solutions for any environment.',
    icon: 'ShieldCheck',
    pillar: 'security-surveillance',
    subcategories: [
      { name: 'Indoor IP Cameras', url: '/shop?cat=indoor-ip-cameras' },
      { name: 'Outdoor IP Cameras', url: '/shop?cat=outdoor-ip-cameras' },
      { name: 'PTZ IP Cameras', url: '/shop?cat=ptz-ip-cameras' },
      { name: 'Panoramic IP Cameras', url: '/shop?cat=panoramic-ip-cameras' }
    ],
    brands: ['Axis', 'Canon', 'Digital Watchdog', 'Grandstream', 'Hanwha', 'Hikvision', 'Mobotix', 'Panasonic', 'Ubiquiti']
  },
  'video-conferencing': {
    title: 'Video Conferencing',
    subtitle: 'Seamless hybrid collaboration',
    description: 'Transform any meeting space into a powerful collaboration hub. We offer complete video conferencing systems for huddle rooms to executive boardrooms.',
    icon: 'Video',
    pillar: 'unified-communications',
    subcategories: [
      { name: 'Huddle Room Systems', url: '/shop?cat=huddle-room-video-conferencing' },
      { name: 'Small Room Systems', url: '/shop?cat=small-room-video-conferencing' },
      { name: 'Medium Room Systems', url: '/shop?cat=medium-room-video-conferencing' },
      { name: 'Large Room Systems', url: '/shop?cat=large-room-video-conferencing' }
    ],
    brands: ['AudioCodes', 'AVer', 'Cisco', 'ClearOne', 'Crestron', 'Dolby', 'Grandstream', 'Logitech', 'Poly']
  },
  'ip-phones': {
    title: 'IP Phones',
    subtitle: 'Crystal clear voice communication',
    description: 'Upgrade your business communication with enterprise-grade VoIP and IP phones. Designed for excellent audio quality, easy management, and seamless platform integration.',
    icon: 'Mic',
    pillar: 'unified-communications',
    subcategories: [
      { name: 'Executive IP Phones', url: '/shop?cat=executive-ip-phones' },
      { name: 'Standard IP Phones', url: '/shop?cat=standard-ip-phones' },
      { name: 'Cordless IP Phones', url: '/shop?cat=cordless-ip-phones' },
      { name: 'Receptionist Consoles', url: '/shop?cat=receptionist-consoles' }
    ],
    brands: ['Cisco', 'Grandstream', 'Poly', 'Yealink', 'Snom']
  },
  'headsets': {
    title: 'Headsets',
    subtitle: 'Professional audio for focus and communication',
    description: 'Find the perfect headset for your unified communications setup. Whether wired or wireless, active noise cancellation or lightweight design, we have it all.',
    icon: 'Speaker',
    pillar: 'unified-communications',
    subcategories: [
      { name: 'Wireless Headsets', url: '/shop?cat=wireless-headsets' },
      { name: 'Wired Headsets', url: '/shop?cat=wired-headsets' },
      { name: 'Bluetooth Headsets', url: '/shop?cat=bluetooth-headsets' },
      { name: 'DECT Headsets', url: '/shop?cat=dect-headsets' }
    ],
    brands: ['Jabra', 'Plantronics (Poly)', 'Sennheiser', 'Logitech', 'Cisco']
  },
  'intercom': {
    title: 'Intercom, Paging & Access',
    subtitle: 'Secure communication and entry control',
    description: 'Enhance your facility security and communication with advanced intercoms, public address systems, and secure entry control points.',
    icon: 'ShieldCheck',
    pillar: 'security-surveillance',
    subcategories: [
      { name: 'IP Intercoms & Entry Phones', url: '/shop?cat=ip-intercoms' },
      { name: 'Modular Intercom Systems', url: '/shop?cat=modular-intercom' },
      { name: 'IP Paging Speakers', url: '/shop?cat=ip-paging-speakers' },
      { name: 'Emergency Phones', url: '/shop?cat=emergency-phones' }
    ],
    brands: ['2N', 'Aiphone', 'Algo', 'Axis', 'CyberData']
  },
  'voip': {
    title: 'VoIP Phone Systems',
    subtitle: 'Enterprise-grade telephony platforms',
    description: 'Modernize your communications infrastructure with scalable, feature-rich VoIP PBX systems designed for businesses of all sizes.',
    icon: 'Settings',
    pillar: 'unified-communications',
    subcategories: [
      { name: '3CX Phone Systems', url: '/shop?cat=3cx-systems' },
      { name: 'FreePBX Phone Systems', url: '/shop?cat=freepbx-systems' },
      { name: 'Grandstream Phone Systems', url: '/shop?cat=grandstream-systems' },
      { name: 'Sangoma Phone Systems', url: '/shop?cat=sangoma-systems' }
    ],
    brands: ['3CX', 'FreePBX', 'Grandstream', 'Sangoma', 'Yealink']
  },
  'projectors': {
    title: 'Projectors',
    subtitle: 'Latest premium projectors for home and business',
    description: 'Explore our curated range of state-of-the-art projectors from leading global brands. From portable smart projectors and native 4K laser home theater displays to ultra-high brightness 3-Chip DLP systems for large corporate spaces.',
    icon: 'Projector',
    pillar: 'unified-communications',
    subcategories: [
      { name: 'Home Theater Projectors', url: '/shop?cat=home-theater-projectors' },
      { name: 'Commercial & Corporate Projectors', url: '/shop?cat=commercial-projectors' },
      { name: 'Smart Portable Projectors', url: '/shop?cat=portable-projectors' },
      { name: 'Large Venue Laser Projectors', url: '/shop?cat=large-venue-projectors' }
    ],
    brands: ['Epson', 'Sony', 'Panasonic', 'BenQ', 'Optoma', 'ViewSonic']
  }
};

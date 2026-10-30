import React, { useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle, Database, FileText, Sparkles, Filter, RefreshCw, HelpCircle, Layers, Image as ImageIcon, ShieldCheck, FileCheck, Trash2, X, ChevronDown, ChevronUp, ListChecks, Check, Info, FolderArchive, UploadCloud } from 'lucide-react';
import { db, auth } from '../../lib/firebase/client';
import { collection, getDocs, writeBatch, doc, getDoc, setDoc } from 'firebase/firestore';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToGeneralSettings, GeneralSettings } from '../../lib/firebase/firestore-helpers';
import { formatProductToGmcRow, generateGmcSheetMatrix, generateGmcTsv } from '../../lib/gmc-feed';
import { useEffect } from 'react';

interface SectionConfig {
  id: string;
  title: string;
  category: 'Sliders & Homepage' | 'Core Pages' | 'Catalogs & Content' | 'Transactions & CRM' | 'System & Settings';
  description: string;
  isSingleDoc?: boolean;
  isSubArray?: boolean;
  docPath?: string;
  arrayKey?: string;
  sampleData: Record<string, any>[];
}

export interface ImportReportItem {
  sectionId: string;
  sectionTitle: string;
  totalRowsProcessed: number;
  newAdded: number;
  existingUpdated: number;
  duplicatesSkipped: number;
  duplicateDetails: string[];
  status: 'success' | 'warning' | 'error';
  errorMessage?: string;
}

export function DataManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  useEffect(() => {
    return subscribeToGeneralSettings(setSettings);
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Master Import Audit Report Modal State
  const [importReports, setImportReports] = useState<ImportReportItem[] | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  // Helper function to flatten nested objects into dot/underscore notation for CSV export
  const flattenObj = (obj: any, prefix = ''): Record<string, any> => {
    return Object.keys(obj || {}).reduce((acc: any, k: string) => {
      const pre = prefix.length ? prefix + '.' : '';
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k]) && !(obj[k] instanceof Date) && typeof obj[k].toDate !== 'function') {
        Object.assign(acc, flattenObj(obj[k], pre + k));
      } else if (Array.isArray(obj[k])) {
        acc[pre + k] = JSON.stringify(obj[k]);
      } else if (obj[k] && typeof obj[k].toDate === 'function') {
        acc[pre + k] = obj[k].toDate().toISOString();
      } else {
        acc[pre + k] = obj[k] ?? '';
      }
      return acc;
    }, {});
  };

  // Helper function to unflatten dot-notation keys back into a nested JavaScript object
  const unflattenObj = (data: Record<string, any>): Record<string, any> => {
    const result: Record<string, any> = {};
    for (const key in data) {
      if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
      const value = data[key];
      const keys = key.split('.');
      let current = result;
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (i === keys.length - 1) {
          let parsedVal: any = value;
          if (value === 'true') parsedVal = true;
          else if (value === 'false') parsedVal = false;
          else if (!isNaN(Number(value)) && value !== '' && typeof value === 'string' && !value.includes('-')) {
            parsedVal = Number(value);
          } else if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
            try {
              parsedVal = JSON.parse(value);
            } catch (e) {
              parsedVal = value;
            }
          }
          current[k] = parsedVal;
        } else {
          current[k] = current[k] || {};
          current = current[k];
        }
      }
    }
    return result;
  };

  // Extract domain unique key for deduplication checks
  const getItemUniqueKey = (sectionId: string, item: Record<string, any>): string => {
    if (item.id) return String(item.id).trim();

    switch (sectionId) {
      case 'products':
        if (item.sku) return `SKU:${String(item.sku).trim().toUpperCase()}`;
        if (item.productName) return `NAME:${String(item.productName).trim().toLowerCase()}`;
        break;
      case 'services':
      case 'categories':
      case 'blog_posts':
        if (item.slug) return `SLUG:${String(item.slug).trim().toLowerCase()}`;
        if (item.title || item.name) return `TITLE:${String(item.title || item.name).trim().toLowerCase()}`;
        break;
      case 'hero_sliders':
        if (item.title) return `TITLE:${String(item.title).trim().toLowerCase()}`;
        break;
      case 'brands':
      case 'testimonials':
        if (item.name) return `NAME:${String(item.name).trim().toLowerCase()}`;
        break;
      case 'event_quotes':
        if (item.clientEmail) return `EMAIL:${String(item.clientEmail).trim().toLowerCase()}_${item.eventType || ''}`;
        break;
      case 'orders':
        if (item.orderNumber) return `ORD:${String(item.orderNumber).trim().toUpperCase()}`;
        if (item.customerEmail) return `EMAIL:${String(item.customerEmail).trim().toLowerCase()}_${item.total || ''}`;
        break;
      case 'rma_requests':
        if (item.orderNumber && item.sku) return `RMA:${String(item.orderNumber).trim().toUpperCase()}_${String(item.sku).trim().toUpperCase()}`;
        break;
    }

    // Fallback composite hash string
    const stringified = JSON.stringify(item);
    return `HASH:${stringified.length}_${stringified.slice(0, 30)}`;
  };

  const sections: SectionConfig[] = [
    {
      id: 'hero_sliders',
      title: 'Hero Sliders & Banner Carousel',
      category: 'Sliders & Homepage',
      description: 'Export or import homepage hero slider slides (titles, subtitles, images, CTA links, media type, overlay opacity, order).',
      isSubArray: true,
      docPath: 'homepage/main',
      arrayKey: 'heroSlides',
      sampleData: [
        {
          id: 'slide-1',
          title: '3D Hologram & Projection Mapping',
          subtitle: 'Revolutionary Visual Experiences in Pakistan',
          ctaText: 'Explore Solutions',
          ctaLink: '/3d-hologram',
          imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200',
          mediaType: 'image',
          isActive: true,
          order: 1,
          textAlignment: 'center',
          overlayOpacity: 30
        },
        {
          id: 'slide-2',
          title: 'Enterprise Video Conferencing',
          subtitle: 'Zoom & Microsoft Teams Boardroom Systems',
          ctaText: 'Book Free Demo',
          ctaLink: '/video-conferencing',
          imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200',
          mediaType: 'image',
          isActive: true,
          order: 2,
          textAlignment: 'left',
          overlayOpacity: 40
        }
      ]
    },
    {
      id: 'brands',
      title: 'Partner Brands & Logos',
      category: 'Sliders & Homepage',
      description: 'Export or import official brand partners and client logos on homepage carousel.',
      isSubArray: true,
      docPath: 'homepage/main',
      arrayKey: 'brands',
      sampleData: [
        {
          id: 'brand-1',
          name: 'Polycom / Poly',
          logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300',
          website: 'https://poly.com',
          order: 1
        },
        {
          id: 'brand-2',
          name: 'Cisco Webex',
          logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300',
          website: 'https://cisco.com',
          order: 2
        }
      ]
    },
    {
      id: 'testimonials',
      title: 'Customer Reviews & Testimonials',
      category: 'Sliders & Homepage',
      description: 'Export or import customer feedback, star ratings, and social proof testimonials.',
      isSubArray: true,
      docPath: 'homepage/main',
      arrayKey: 'testimonials',
      sampleData: [
        {
          id: 'testimonial-1',
          name: 'Tariq Mahmood',
          designation: 'IT Director, Engro Corp',
          text: 'AV Live transformed our executive boardroom into a seamless hybrid meeting facility in Lahore.',
          rating: 5,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200',
          order: 1
        }
      ]
    },
    {
      id: 'homepage',
      title: 'Homepage Main Settings & Promo Banner',
      category: 'Sliders & Homepage',
      description: 'Export or import global stats metrics, promo banner headlines, and homepage SEO tags.',
      isSingleDoc: true,
      docPath: 'homepage/main',
      sampleData: [
        {
          'stats.yearsExperience': 12,
          'stats.happyClients': 1200,
          'stats.projectsCompleted': 850,
          'promoBanner.headline': 'Transform Your Event Experience Today',
          'promoBanner.subheadline': 'Get 24-hour response SLA for Lahore, Karachi & Islamabad',
          'promoBanner.ctaText': 'Get Custom Quote',
          'promoBanner.ctaLink': '/contact',
          'promoBanner.backgroundImageUrl': 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200',
          'promoBanner.isActive': true,
          'seo.title': 'Event Management Company Pakistan & Video Conferencing | AV Live',
          'seo.description': '3D hologram, projection mapping, corporate events & conference room AV for Zoom & MS Teams.',
          'seo.keywords': 'Event management company Pakistan, Video Conferencing in Pakistan, 3D hologram'
        }
      ]
    },
    {
      id: 'about',
      title: 'About Us Page Content',
      category: 'Core Pages',
      description: 'Export or import About Us page text, mission statement, history, team description, and stats.',
      isSingleDoc: true,
      docPath: 'about/main',
      sampleData: [
        {
          heroHeading: 'Pakistan Premier AV & Holographic Specialists',
          heroSubheading: 'Pioneering immersive visual solutions and enterprise conferencing since 2012',
          heroImageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200',
          mission: 'To deliver world-class audio-visual technologies across Pakistan.',
          vision: 'Becoming South Asia leading provider of 3D holograms and smart workspaces.',
          history: 'Founded in Lahore, AV Live has expanded to Karachi and Islamabad.',
          teamDescription: 'Our team comprises certified AV engineers and event architects.',
          teamImages: JSON.stringify(['https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600']),
          values: JSON.stringify(['Excellence', 'Innovation', 'Reliability']),
          'stats.yearsExperience': 12,
          'stats.happyClients': 1200,
          'stats.projectsCompleted': 850,
          'stats.teamMembers': 45
        }
      ]
    },
    {
      id: 'contact',
      title: 'Contact Page Content & Location Info',
      category: 'Core Pages',
      description: 'Export or import Contact page details, business hours, addresses, phones, social links.',
      isSingleDoc: true,
      docPath: 'contact/main',
      sampleData: [
        {
          heroHeading: 'Contact AV Live Communications',
          heroSubheading: 'Offices in Lahore, Karachi, and Islamabad with 24/7 SLA Support',
          heroImageUrl: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=1200',
          address: 'Johar Town, Lahore, Punjab, Pakistan',
          phone: '+92 42 3233 4782',
          email: 'info@avlive.com.pk',
          mapEmbedUrl: 'https://maps.google.com/?q=Lahore',
          'businessHours.weekday': '9:00 AM - 6:00 PM',
          'businessHours.saturday': '10:00 AM - 4:00 PM',
          'businessHours.sunday': 'Closed',
          'socialLinks.facebook': 'https://facebook.com/avlivepk',
          'socialLinks.linkedin': 'https://linkedin.com/company/avlivepk',
          'socialLinks.youtube': 'https://youtube.com/avlivepk',
          'socialLinks.instagram': 'https://instagram.com/avlivepk',
          'socialLinks.twitter': 'https://twitter.com/avlivepk'
        }
      ]
    },
    {
      id: 'services_page',
      title: 'Services Page Banner & Settings',
      category: 'Core Pages',
      description: 'Export or import Services overview page headings, intro text, and primary call to action.',
      isSingleDoc: true,
      docPath: 'services_page/main',
      sampleData: [
        {
          heroHeading: 'Comprehensive AV Solutions & Event Production',
          heroSubheading: 'Tailored technology integrations for corporate, hybrid, and live entertainment',
          heroImageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200',
          introText: 'We design and deploy state-of-the-art visual equipment across Pakistan.',
          ctaText: 'Schedule Technical Survey',
          ctaLink: '/contact'
        }
      ]
    },
    {
      id: 'services',
      title: 'Service Catalog & Modules',
      category: 'Catalogs & Content',
      description: 'Export or import all individual service offerings (3D Hologram, Projection Mapping, Zoom Rooms, Sound Systems).',
      sampleData: [
        {
          id: '3d-hologram-service',
          title: '3D Hologram Display Systems',
          slug: '3d-hologram',
          description: '3D holographic projection and fan display systems for brand launches and expos.',
          iconUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=200',
          imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800',
          isActive: true,
          order: 1,
          category: 'Event Production',
          priceRange: 'PKR 150,000 - PKR 1,500,000',
          seoTags: '3D hologram events Pakistan, holographic projection Lahore',
          seoMetaDescription: 'Hire 3D hologram systems for product launches and corporate expos in Pakistan.'
        }
      ]
    },
    {
      id: 'products',
      title: 'Products Catalog',
      category: 'Catalogs & Content',
      description: 'Export or import the complete catalog of AV hardware, video conferencing bars, screens, and accessories.',
      sampleData: [
        {
          id: 'poly-studio-x50',
          productName: 'Poly Studio X50 Video Bar',
          sku: 'POLY-X50-PK',
          shortDescription: 'All-in-one video bar for medium-sized meeting rooms.',
          description: 'Radically simple video bar supporting Zoom Rooms and Microsoft Teams natively.',
          regularPrice: 750000,
          salePrice: 699000,
          stockQuantity: 15,
          lowStockThreshold: 3,
          images: JSON.stringify(['https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800']),
          categoryIds: JSON.stringify(['video-conferencing']),
          brand: 'Poly',
          isActive: true,
          isFeatured: true,
          seoTags: 'Poly Studio X50 Pakistan, Zoom Room bar Lahore',
          seoMetaDescription: 'Buy Poly Studio X50 video conferencing bar in Pakistan with local warranty.'
        }
      ]
    },
    {
      id: 'categories',
      title: 'Categories Catalog & SEO',
      category: 'Catalogs & Content',
      description: 'Export or import product category hierarchies, parent IDs, display order, and SEO tags.',
      sampleData: [
        {
          id: 'video-conferencing',
          name: 'Video Conferencing',
          slug: 'video-conferencing',
          description: 'Enterprise hardware for Zoom, Teams, and Webex meeting rooms.',
          imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=400',
          parentId: null,
          displayOrder: 1,
          isActive: true,
          isFeatured: true,
          seoTags: 'Video Conferencing in Pakistan, conference room equipment',
          seoMetaDescription: 'Explore video conferencing equipment and conference room setups in Pakistan.'
        }
      ]
    },
    {
      id: 'blog_posts',
      title: 'Blog Articles & News',
      category: 'Catalogs & Content',
      description: 'Export or import published blog posts, articles, case studies, and SEO metadata.',
      sampleData: [
        {
          id: 'post-1',
          title: 'How 3D Holograms are Transforming Corporate Product Launches in Pakistan',
          slug: '3d-hologram-corporate-launches-pakistan',
          content: '3D hologram displays provide immersive 360-degree floating visuals that capture consumer attention...',
          excerpt: 'Discover why top brands in Lahore and Karachi are choosing 3D holograms for high-impact launches.',
          coverImageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800',
          author: 'AV Live Tech Team',
          publishedDate: '2026-10-01',
          isPublished: true,
          tags: JSON.stringify(['3D Hologram', 'Event Tech', 'Pakistan'])
        }
      ]
    },
    {
      id: 'event_quotes',
      title: 'Event Quotes & Inquiries',
      category: 'Transactions & CRM',
      description: 'Export or import incoming event quotation requests, customer contacts, budgets, and status.',
      sampleData: [
        {
          id: 'quote-1001',
          clientName: 'Ali Khan',
          clientEmail: 'ali@example.com',
          clientPhone: '+92 300 1234567',
          eventType: 'Corporate Annual Gala',
          eventCity: 'Lahore',
          eventDate: '2026-11-15',
          budgetRange: 'PKR 1,000,000 - PKR 2,500,000',
          servicesRequired: JSON.stringify(['3D Hologram', 'SMD Screen', 'Stage Lighting']),
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: 'orders',
      title: 'Customer Orders History',
      category: 'Transactions & CRM',
      description: 'Export or import customer e-commerce orders, items purchased, totals, and shipping status.',
      sampleData: [
        {
          id: 'ord-5001',
          orderNumber: 'AVL-5001',
          customerName: 'Zubair Shah',
          customerEmail: 'zubair@company.pk',
          customerPhone: '+92 321 9876543',
          shippingAddress: 'Blue Area, Islamabad',
          total: 699000,
          paymentMethod: 'bank_transfer',
          paymentStatus: 'paid',
          orderStatus: 'shipped',
          trackingNumber: 'TCS-99887711',
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: 'rma_requests',
      title: 'RMA Warranty & Return Requests',
      category: 'Transactions & CRM',
      description: 'Export or import customer warranty return requests, issue descriptions, and approval status.',
      sampleData: [
        {
          id: 'rma-101',
          orderNumber: 'AVL-5001',
          customerName: 'Zubair Shah',
          customerEmail: 'zubair@company.pk',
          productName: 'Poly Studio X50 Video Bar',
          sku: 'POLY-X50-PK',
          reason: 'Firmware upgrade support',
          status: 'approved',
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: 'settings',
      title: 'Global Site Branding & Settings',
      category: 'System & Settings',
      description: 'Export or import site title, logo URL, favicon, contact email, tax rate, social links, global SEO.',
      isSingleDoc: true,
      docPath: 'settings/global',
      sampleData: [
        {
          siteName: 'AV Live Communications',
          tagline: 'Event Management & Video Conferencing Solutions in Pakistan',
          logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200',
          faviconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=64',
          contactEmail: 'info@avlive.com.pk',
          phone: '+92 42 3233 4782',
          address: 'Johar Town, Lahore, Pakistan',
          taxRate: 16,
          'socialLinks.facebook': 'https://facebook.com/avlivepk',
          'socialLinks.linkedin': 'https://linkedin.com/company/avlivepk',
          'socialLinks.youtube': 'https://youtube.com/avlivepk',
          'socialLinks.instagram': 'https://instagram.com/avlivepk',
          'socialLinks.twitter': 'https://twitter.com/avlivepk',
          'seo.title': 'Event Management Company Pakistan | Video Conferencing | AV Live',
          'seo.description': 'Pakistan premier event management company & video conferencing provider. 3D hologram, projection mapping, conference room AV in Lahore, Karachi, Islamabad.',
          'seo.keywords': 'Event Management Company Pakistan, Video Conferencing in Pakistan, 3D Hologram, Projection Mapping'
        }
      ]
    }
  ];

  // Primary Deduplication & Firestore Import Pipeline
  const processDatasetImport = async (section: SectionConfig, rawRows: any[]): Promise<ImportReportItem> => {
    const details: string[] = [];
    let newAdded = 0;
    let existingUpdated = 0;
    let duplicatesSkipped = 0;

    if (!rawRows || rawRows.length === 0) {
      return {
        sectionId: section.id,
        sectionTitle: section.title,
        totalRowsProcessed: 0,
        newAdded: 0,
        existingUpdated: 0,
        duplicatesSkipped: 0,
        duplicateDetails: ['Empty data rows provided.'],
        status: 'warning'
      };
    }

    try {
      // Step 1: Internal Deduplication within the incoming import file itself
      const unflattenedRows = rawRows.map(row => unflattenObj(row));
      const uniqueIncomingRows: any[] = [];
      const seenIncomingKeys = new Set<string>();

      for (const item of unflattenedRows) {
        const uniqueKey = getItemUniqueKey(section.id, item);
        if (seenIncomingKeys.has(uniqueKey)) {
          duplicatesSkipped++;
          details.push(`[CSV Internal Duplicate] Dropped duplicate row matching key: "${uniqueKey}"`);
        } else {
          seenIncomingKeys.add(uniqueKey);
          uniqueIncomingRows.push(item);
        }
      }

      // Step 2: Compare against existing Firestore Data
      if (section.isSubArray) {
        // Document with array property (e.g., heroSlides, brands, testimonials)
        const docRef = doc(db, section.docPath!);
        const docSnap = await getDoc(docRef);
        const currentData = docSnap.exists() ? docSnap.data() : {};
        const existingArray: any[] = currentData[section.arrayKey!] || [];

        // Build key index of existing items in array
        const existingMap = new Map<string, any>();
        existingArray.forEach(ex => {
          const key = getItemUniqueKey(section.id, ex);
          existingMap.set(key, ex);
        });

        const updatedArray: any[] = [...existingArray];

        for (const item of uniqueIncomingRows) {
          const key = getItemUniqueKey(section.id, item);
          if (existingMap.has(key)) {
            const existingItem = existingMap.get(key);
            // Check if exact duplicate
            if (JSON.stringify(existingItem) === JSON.stringify({ ...existingItem, ...item })) {
              duplicatesSkipped++;
              details.push(`[Duplicate Skipped] Item matching "${key}" already exists with identical values.`);
            } else {
              // Update existing item in array
              const index = updatedArray.findIndex(ex => getItemUniqueKey(section.id, ex) === key);
              if (index !== -1) {
                updatedArray[index] = { ...updatedArray[index], ...item };
                existingUpdated++;
                details.push(`[Existing Updated] Updated entry matching "${key}"`);
              }
            }
          } else {
            // New entry
            updatedArray.push(item);
            newAdded++;
            details.push(`[New Added] Added new entry matching "${key}"`);
          }
        }

        await setDoc(docRef, {
          ...currentData,
          [section.arrayKey!]: updatedArray
        }, { merge: true });

      } else if (section.isSingleDoc) {
        // Single Configuration Document (e.g. homepage, about, contact, settings)
        const docRef = doc(db, section.docPath!);
        const docSnap = await getDoc(docRef);
        const existingData = docSnap.exists() ? docSnap.data() : {};
        const incomingDoc = uniqueIncomingRows[0] || {};

        let hasChanges = false;
        for (const k in incomingDoc) {
          if (JSON.stringify(incomingDoc[k]) !== JSON.stringify(existingData[k])) {
            hasChanges = true;
            break;
          }
        }

        if (hasChanges || !docSnap.exists()) {
          await setDoc(docRef, incomingDoc, { merge: true });
          if (docSnap.exists()) {
            existingUpdated++;
            details.push(`[Existing Updated] Updated configuration fields for ${section.title}`);
          } else {
            newAdded++;
            details.push(`[New Added] Created new configuration document for ${section.title}`);
          }
        } else {
          duplicatesSkipped++;
          details.push(`[Duplicate Skipped] ${section.title} configuration matches database. No changes written.`);
        }

      } else {
        // Firestore Collection (e.g. products, services, categories, blog_posts, orders, quotes, rma)
        const snapshot = await getDocs(collection(db, section.id));
        const existingDocsMap = new Map<string, { id: string; data: any }>();

        snapshot.docs.forEach(d => {
          const docData = d.data();
          existingDocsMap.set(d.id, { id: d.id, data: docData });
          const domainKey = getItemUniqueKey(section.id, { id: d.id, ...docData });
          existingDocsMap.set(domainKey, { id: d.id, data: docData });
        });

        const batch = writeBatch(db);
        let batchOpCount = 0;

        for (const item of uniqueIncomingRows) {
          const key = getItemUniqueKey(section.id, item);
          const matched = existingDocsMap.get(item.id) || existingDocsMap.get(key);

          const docId = item.id || matched?.id || key.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
          const cleanItem = { ...item };
          delete cleanItem.id;

          if (matched) {
            // Check if identical
            const isIdentical = Object.keys(cleanItem).every(field => {
              return JSON.stringify(cleanItem[field]) === JSON.stringify(matched.data[field]);
            });

            if (isIdentical) {
              duplicatesSkipped++;
              details.push(`[Duplicate Skipped] Collection document matching "${key}" is identical to database record.`);
            } else {
              const docRef = doc(db, section.id, docId);
              batch.set(docRef, cleanItem, { merge: true });
              existingUpdated++;
              details.push(`[Existing Updated] Updated collection document "${docId}" (${key})`);
              batchOpCount++;
            }
          } else {
            const docRef = doc(db, section.id, docId);
            batch.set(docRef, cleanItem, { merge: true });
            newAdded++;
            details.push(`[New Added] Created new collection document "${docId}" (${key})`);
            batchOpCount++;
          }

          if (batchOpCount >= 400) {
            await batch.commit();
            batchOpCount = 0;
          }
        }

        if (batchOpCount > 0) {
          await batch.commit();
        }
      }

      return {
        sectionId: section.id,
        sectionTitle: section.title,
        totalRowsProcessed: rawRows.length,
        newAdded,
        existingUpdated,
        duplicatesSkipped,
        duplicateDetails: details,
        status: 'success'
      };

    } catch (err: any) {
      console.error(`Error processing dataset ${section.id}:`, err);
      return {
        sectionId: section.id,
        sectionTitle: section.title,
        totalRowsProcessed: rawRows.length,
        newAdded: 0,
        existingUpdated: 0,
        duplicatesSkipped: 0,
        duplicateDetails: [`Error: ${err.message}`],
        status: 'error',
        errorMessage: err.message
      };
    }
  };

  // Helper to extract sheet ID from URL
  const extractSheetId = (input: string): string => {
    if (input.includes('/d/')) {
      const parts = input.split('/d/');
      if (parts.length > 1) {
        return parts[1].split('/')[0];
      }
    }
    return input; // Assume it's already an ID
  };

  // Helper to format product for Google Merchant Center (40-Column Template)
  const formatProductForGMC = (product: any): Record<string, any> => {
    return formatProductToGmcRow(product);
  };

  // Sync products to Google Sheets in 40-Column GMC format
  const handleGMCSync = async (sheetId: string) => {
    try {
      setLoading('merchant_sync');
      
      // Get fresh token
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Authentication required');

      const snapshot = await getDocs(collection(db, 'products'));
      const products = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      const values = generateGmcSheetMatrix(products);
      
      const syncResponse = await fetch('/api/sync-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          spreadsheetId: sheetId,
          range: 'Sheet1!A1',
          values,
          accessToken: (user as any)?.accessToken || token
        })
      });
      
      if (!syncResponse.ok) {
        const errData = await syncResponse.json();
        throw new Error(errData.error || 'Failed to sync');
      }
      setMessage({ text: `Successfully synced ${products.length} products (40-column GMC format) to Google Sheets!`, type: 'success' });
    } catch (err: any) {
      console.error('Error syncing to sheets:', err);
      setMessage({ text: err.message || 'Error syncing products', type: 'error' });
    } finally {
      setLoading(null);
    }
  };

  // Single CSV Import Handler
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>, section: SectionConfig) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(`import_${section.id}`);
      setMessage(null);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const rawRows = results.data as any[];
          const report = await processDatasetImport(section, rawRows);
          setImportReports([report]);
          setShowReportModal(true);
          setMessage({
            text: `Import Completed! Added: ${report.newAdded}, Updated: ${report.existingUpdated}, Duplicates Removed/Skipped: ${report.duplicatesSkipped}`,
            type: report.status === 'error' ? 'error' : 'success'
          });
          setLoading(null);
          event.target.value = '';
        },
        error: (error) => {
          setMessage({ text: `CSV Parse Error: ${error.message}`, type: 'error' });
          setLoading(null);
        }
      });
    } catch (error: any) {
      console.error(`Error starting import for ${section.id}:`, error);
      setMessage({ text: error.message || 'Error starting import', type: 'error' });
      setLoading(null);
    }
  };

  // Single CSV Export Handler
  const handleExport = async (section: SectionConfig) => {
    try {
      setLoading(section.id);
      setMessage(null);

      let exportRows: any[] = [];

      if (section.isSubArray) {
        const docRef = doc(db, section.docPath!);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const docData = docSnap.data();
          const items = docData[section.arrayKey!] || [];
          exportRows = items.map((item: any, idx: number) => flattenObj({ id: item.id || `item-${idx + 1}`, ...item }));
        }
      } else if (section.isSingleDoc) {
        const docRef = doc(db, section.docPath!);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          exportRows = [flattenObj(docSnap.data())];
        }
      } else {
        const snapshot = await getDocs(collection(db, section.id));
        exportRows = snapshot.docs.map(d => flattenObj({ id: d.id, ...d.data() }));
      }

      if (exportRows.length === 0) {
        setMessage({ text: `No data stored in ${section.title}. Exporting sample template.`, type: 'error' });
        exportRows = section.sampleData;
      }

      const csv = Papa.unparse(exportRows);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${section.id}_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage({ text: `Exported ${exportRows.length} item(s) from ${section.title}`, type: 'success' });
    } catch (error: any) {
      console.error(`Error exporting ${section.id}:`, error);
      setMessage({ text: error.message || 'Error exporting data', type: 'error' });
    } finally {
      setLoading(null);
    }
  };
  // Export Products as 40-Column TSV (Google Merchant Center Format)
  const handleExportGMC = async () => {
    try {
      setLoading('gmc_export');
      const snapshot = await getDocs(collection(db, 'products'));
      const products = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      const tsvContent = generateGmcTsv(products);
      const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `GMC_Products_Export_${new Date().toISOString().split('T')[0]}.tsv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setMessage({ text: `Exported ${products.length} products in 40-column Google Merchant Center TSV format!`, type: 'success' });
    } catch (err: any) {
      console.error('Export error:', err);
      setMessage({ text: 'Error exporting TSV', type: 'error' });
    } finally {
      setLoading(null);
    }
  };

  // Master Export All Datasets as a single ZIP archive!
  const handleMasterExportAll = async () => {
    try {
      setLoading('master_export');
      setMessage({ text: 'Generating master dataset ZIP backup...', type: 'success' });

      const zip = new JSZip();

      for (const section of sections) {
        let exportRows: any[] = [];

        if (section.isSubArray) {
          const docRef = doc(db, section.docPath!);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const items = docSnap.data()[section.arrayKey!] || [];
            exportRows = items.map((item: any, idx: number) => flattenObj({ id: item.id || `item-${idx + 1}`, ...item }));
          }
        } else if (section.isSingleDoc) {
          const docRef = doc(db, section.docPath!);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            exportRows = [flattenObj(docSnap.data())];
          }
        } else {
          const snapshot = await getDocs(collection(db, section.id));
          exportRows = snapshot.docs.map(d => flattenObj({ id: d.id, ...d.data() }));
        }

        if (exportRows.length === 0) {
          exportRows = section.sampleData;
        }

        const csv = Papa.unparse(exportRows);
        zip.file(`${section.id}.csv`, csv);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AVLive_Master_Datasets_${new Date().toISOString().split('T')[0]}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage({ text: 'Master dataset ZIP successfully generated and downloaded!', type: 'success' });
    } catch (err: any) {
      console.error('Error in master export:', err);
      setMessage({ text: err.message || 'Error running master export', type: 'error' });
    } finally {
      setLoading(null);
    }
  };

  // Master Import All Datasets (Supports Zip, Multi-CSV, or Master JSON!)
  const handleMasterImportAll = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setLoading('master_import');
      setMessage({ text: 'Processing Master Dataset Import with Deduplication...', type: 'success' });

      const reports: ImportReportItem[] = [];

      // Check if user uploaded a ZIP archive
      if (files.length === 1 && files[0].name.endsWith('.zip')) {
        const zip = await JSZip.loadAsync(files[0]);
        for (const section of sections) {
          // Find zip file matching section ID or title
          const zipFile = zip.file(`${section.id}.csv`) || 
                          zip.file(`${section.id}_export.csv`) || 
                          Object.keys(zip.files).map(k => zip.files[k]).find(f => f.name.toLowerCase().includes(section.id.toLowerCase()));

          if (zipFile) {
            const csvText = await zipFile.async('text');
            const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
            const report = await processDatasetImport(section, parsed.data as any[]);
            reports.push(report);
          }
        }
      } else {
        // Multi-CSV selection or JSON backup
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileNameLower = file.name.toLowerCase();

          // Match file to section
          const matchedSection = sections.find(s => 
            fileNameLower.includes(s.id.toLowerCase()) || 
            fileNameLower.includes(s.title.toLowerCase().replace(/[^a-z0-9]/g, ''))
          );

          if (matchedSection) {
            const fileText = await file.text();
            if (file.name.endsWith('.json')) {
              try {
                const jsonContent = JSON.parse(fileText);
                const rawRows = Array.isArray(jsonContent) ? jsonContent : [jsonContent];
                const report = await processDatasetImport(matchedSection, rawRows);
                reports.push(report);
              } catch (e) {
                console.error('JSON parse error:', e);
              }
            } else {
              const parsed = Papa.parse(fileText, { header: true, skipEmptyLines: true });
              const report = await processDatasetImport(matchedSection, parsed.data as any[]);
              reports.push(report);
            }
          }
        }
      }

      if (reports.length === 0) {
        setMessage({ text: 'No matching datasets found in uploaded file(s). Ensure CSV filenames include dataset IDs (e.g. products.csv, hero_sliders.csv).', type: 'error' });
      } else {
        setImportReports(reports);
        setShowReportModal(true);

        const totalAdded = reports.reduce((acc, r) => acc + r.newAdded, 0);
        const totalUpdated = reports.reduce((acc, r) => acc + r.existingUpdated, 0);
        const totalSkipped = reports.reduce((acc, r) => acc + r.duplicatesSkipped, 0);

        setMessage({
          text: `Master Import Completed across ${reports.length} dataset(s)! Total Added: ${totalAdded}, Updated: ${totalUpdated}, Duplicates Removed/Skipped: ${totalSkipped}`,
          type: 'success'
        });
      }

      event.target.value = '';
    } catch (err: any) {
      console.error('Master import error:', err);
      setMessage({ text: err.message || 'Error running master import', type: 'error' });
    } finally {
      setLoading(null);
    }
  };

  const handleDownloadSample = (section: SectionConfig) => {
    const csv = Papa.unparse(section.sampleData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SAMPLE_TEMPLATE_${section.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categoriesList = ['ALL', 'Sliders & Homepage', 'Core Pages', 'Catalogs & Content', 'Transactions & CRM', 'System & Settings'];

  const filteredSections = sections.filter(sec => {
    const matchesCategory = selectedCategory === 'ALL' || sec.category === selectedCategory;
    const matchesSearch = sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sec.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate overall summary metrics
  const totalDatasetsProcessed = importReports ? importReports.length : 0;
  const masterTotalAdded = importReports ? importReports.reduce((acc, r) => acc + r.newAdded, 0) : 0;
  const masterTotalUpdated = importReports ? importReports.reduce((acc, r) => acc + r.existingUpdated, 0) : 0;
  const masterTotalSkipped = importReports ? importReports.reduce((acc, r) => acc + r.duplicatesSkipped, 0) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 text-[#00B4D8] font-black uppercase text-xs tracking-[0.3em] mb-2">
            <Database size={16} /> Data Migration Hub & Deduplication Gateway
          </div>
          <h1 className="text-4xl font-black text-[#1A2B4C] tracking-tight">Data Management & CSV Gateway</h1>
          <p className="text-gray-500 mt-1 text-sm max-w-2xl">
            Export and import all application content, hero sliders, page text, product catalogs, order records, and site settings with automatic duplicate removal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Master Export ZIP */}
          <button
            onClick={handleExportGMC}
            disabled={loading !== null}
            className="bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
          >
            {loading === 'gmc_export' ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <FileText size={18} />
            )}
            Export GMC TSV
          </button>
          <button
            onClick={handleMasterExportAll}
            disabled={loading !== null}
            className="bg-[#1A2B4C] text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#00B4D8] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#1A2B4C]/10 disabled:opacity-50"
          >
            {loading === 'master_export' ? (
              <RefreshCw size={18} className="animate-spin text-[#00B4D8]" />
            ) : (
              <FolderArchive size={18} className="text-[#00B4D8]" />
            )}
            Export All (Master ZIP)
          </button>

          {/* Master Import ZIP / Multi-CSV */}
          <div className="relative">
            <input
              type="file"
              multiple
              accept=".csv,.zip,.json"
              onChange={handleMasterImportAll}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
              disabled={loading !== null}
            />
            <button
              disabled={loading !== null}
              className="bg-[#00B4D8] text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#1A2B4C] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#00B4D8]/20 disabled:opacity-50"
            >
              {loading === 'master_import' ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <UploadCloud size={18} />
              )}
              Import All Datasets
            </button>
          </div>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div className={`p-5 rounded-2xl flex items-center justify-between gap-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <div className="flex items-center gap-3">
            {message.type === 'success' ? <CheckCircle size={22} className="text-emerald-600 shrink-0" /> : <AlertCircle size={22} className="text-red-600 shrink-0" />}
            <p className="font-bold text-sm leading-relaxed">{message.text}</p>
          </div>
          {importReports && importReports.length > 0 && (
            <button
              onClick={() => setShowReportModal(true)}
              className="bg-white border border-emerald-300 text-emerald-900 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-100 transition-colors shrink-0 flex items-center gap-2"
            >
              <ListChecks size={14} /> View Audit Summary
            </button>
          )}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-[#1A2B4C] text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:text-[#1A2B4C] hover:bg-gray-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80 shrink-0">
          <input
            type="text"
            placeholder="Search dataset or field..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2.5 pl-10 text-xs font-bold text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
          />
          <Filter size={16} className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Datasets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Google Merchant Center Feed Sync */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#00B4D8]/20 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#F26522] bg-orange-50 px-3 py-1 rounded-full">
                40-Column GMC Feed
              </span>
              <a
                href="/feed/google-merchant.tsv"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00B4D8] hover:text-[#1A2B4C] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors"
                title="Live scheduled fetch URL for Google Merchant Center"
              >
                <FileText size={12} /> Live TSV Feed
              </a>
            </div>
            <h2 className="text-xl font-black text-[#1A2B4C] tracking-tight mb-2 group-hover:text-[#F26522] transition-colors">
              Google Merchant 40-Col Feed
            </h2>
            <p className="text-gray-500 text-xs leading-relaxed mb-4 font-medium">
              Export all existing products with verified GTIN/UPC codes, MPNs, availability, and 3-part product_detail subattributes, or sync directly to Google Sheets.
            </p>
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 mb-4 text-[10px] font-mono text-gray-600 break-all">
              URL: https://avlive.com.pk/feed/google-merchant.tsv
            </div>
          </div>
          <div className="space-y-3 pt-4 border-t border-gray-50">
            <button
              onClick={handleExportGMC}
              disabled={loading !== null}
              className="w-full bg-emerald-600 text-white px-4 py-3 rounded-xl font-black text-xs hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading === 'gmc_export' ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <>
                  <Download size={16} />
                  Download 40-Column TSV
                </>
              )}
            </button>
            <button
              onClick={() => {
                const sheetInput = prompt('Enter the Google Sheet ID (or URL):', settings?.googleMerchantSheetUrl || '');
                if (sheetInput) {
                  handleGMCSync(extractSheetId(sheetInput));
                }
              }}
              disabled={loading !== null}
              className="w-full bg-[#F26522] text-white px-4 py-3 rounded-xl font-black text-xs hover:bg-[#1A2B4C] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading === 'merchant_sync' ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <>
                  <FileCheck size={16} />
                  Sync 40-Col Feed to Sheets
                </>
              )}
            </button>
          </div>
        </div>
        {filteredSections.map(section => (
          <div key={section.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#00B4D8]/20 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#00B4D8] bg-blue-50 px-3 py-1 rounded-full">
                  {section.category}
                </span>
                <button
                  onClick={() => handleDownloadSample(section)}
                  className="text-gray-300 hover:text-[#1A2B4C] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors"
                  title="Download pre-formatted sample CSV template"
                >
                  <FileText size={12} /> Sample CSV
                </button>
              </div>

              <h2 className="text-xl font-black text-[#1A2B4C] tracking-tight mb-2 group-hover:text-[#00B4D8] transition-colors">
                {section.title}
              </h2>
              <p className="text-gray-500 text-xs leading-relaxed mb-6 font-medium">
                {section.description}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-50">
              {section.id === 'products' && (
                <button
                  onClick={() => {
                    const sheetInput = prompt('Enter the Google Sheet ID (or URL) [Leave empty to use configured setting]:');
                    if (sheetInput) {
                      handleGMCSync(extractSheetId(sheetInput));
                    } else if (settings?.googleMerchantSheetUrl) {
                      handleGMCSync(extractSheetId(settings.googleMerchantSheetUrl));
                    } else {
                      setMessage({ text: 'Please provide a sheet URL or configure it in Settings.', type: 'error' });
                    }
                  }}
                  disabled={loading !== null}
                  className="w-full bg-[#22C55E] text-white px-4 py-3 rounded-xl font-black text-xs hover:bg-[#16A34A] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading === 'merchant_sync' ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <>
                      <FileCheck size={16} />
                      Sync to Google Merchant
                    </>
                  )}
                </button>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => handleExport(section)}
                  disabled={loading !== null}
                  className="flex-1 bg-gray-50 border border-gray-200 text-[#1A2B4C] px-4 py-3 rounded-xl font-black text-xs hover:bg-[#1A2B4C] hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading === section.id ? (
                    <RefreshCw size={16} className="animate-spin text-[#00B4D8]" />
                  ) : (
                    <>
                      <Download size={16} />
                      Export CSV
                    </>
                  )}
                </button>

                <div className="flex-1 relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleImport(e, section)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                    disabled={loading !== null}
                  />
                  <button
                    disabled={loading !== null}
                    className="w-full bg-[#1A2B4C] text-white px-4 py-3 rounded-xl font-black text-xs hover:bg-[#00B4D8] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading === `import_${section.id}` ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Upload size={16} />
                        Import CSV
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Master Import Summary Audit Modal */}
      {showReportModal && importReports && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-gray-100">
            {/* Modal Header */}
            <div className="bg-[#1A2B4C] text-white p-6 md:p-8 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#00B4D8] rounded-2xl flex items-center justify-center text-white">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-white">Import Audit & Deduplication Report</h3>
                  <p className="text-xs text-gray-300 mt-0.5">Summary of records processed, created, updated, and duplicates filtered out.</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-100 shrink-0">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Datasets Processed</div>
                <div className="text-2xl font-black text-[#1A2B4C] mt-1">{totalDatasetsProcessed}</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                <div className="text-[10px] font-black uppercase text-emerald-600 tracking-wider flex items-center gap-1">
                  <CheckCircle size={12} /> New Records Added
                </div>
                <div className="text-2xl font-black text-emerald-600 mt-1">{masterTotalAdded}</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                <div className="text-[10px] font-black uppercase text-blue-600 tracking-wider flex items-center gap-1">
                  <RefreshCw size={12} /> Existing Updated
                </div>
                <div className="text-2xl font-black text-blue-600 mt-1">{masterTotalUpdated}</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
                <div className="text-[10px] font-black uppercase text-amber-600 tracking-wider flex items-center gap-1">
                  <ShieldCheck size={12} /> Duplicates Removed
                </div>
                <div className="text-2xl font-black text-amber-600 mt-1">{masterTotalSkipped}</div>
              </div>
            </div>

            {/* Detailed Per-Dataset Table */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="text-xs font-black uppercase tracking-wider text-[#1A2B4C] flex items-center justify-between">
                <span>Detailed Breakdown Per Dataset</span>
                <span className="text-gray-400 font-bold text-[11px]">Click row to view duplicate logs</span>
              </div>

              <div className="space-y-3">
                {importReports.map((rpt, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:border-[#00B4D8] transition-colors">
                    <button
                      onClick={() => setExpandedReportId(expandedReportId === rpt.sectionId ? null : rpt.sectionId)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${rpt.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[#1A2B4C]">{rpt.sectionTitle}</div>
                          <div className="text-[11px] text-gray-400 font-medium">Dataset ID: {rpt.sectionId} • Processed: {rpt.totalRowsProcessed} rows</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">+{rpt.newAdded} New</span>
                          <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">~{rpt.existingUpdated} Updated</span>
                          <span className="text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">🛡️ {rpt.duplicatesSkipped} Duplicates Removed</span>
                        </div>
                        {expandedReportId === rpt.sectionId ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                      </div>
                    </button>

                    {expandedReportId === rpt.sectionId && (
                      <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs space-y-2">
                        <div className="font-black text-[10px] uppercase text-gray-400 tracking-wider">Audit Log Details</div>
                        {rpt.duplicateDetails.length === 0 ? (
                          <div className="text-gray-400 italic">No duplicate entries or log notes.</div>
                        ) : (
                          <div className="max-h-40 overflow-y-auto space-y-1 font-mono text-[11px] bg-white p-3 rounded-xl border border-gray-200">
                            {rpt.duplicateDetails.map((det, dIdx) => (
                              <div key={dIdx} className={det.includes('Duplicate') ? 'text-amber-700 font-semibold' : det.includes('New') ? 'text-emerald-700 font-semibold' : 'text-blue-700'}>
                                • {det}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
              <div className="text-xs text-gray-500 font-bold flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-600" /> All valid records have been synced to Firestore safely.
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="bg-[#1A2B4C] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-[#00B4D8] transition-all"
              >
                Close & Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guide & Help Section */}
      <div className="bg-[#1A2B4C] text-white p-8 md:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-2xl relative z-10">
          <div className="flex items-center gap-2 text-[#00B4D8] text-xs font-black uppercase tracking-widest">
            <HelpCircle size={18} /> Best Practices & Formatting Guide
          </div>
          <h3 className="text-2xl font-black tracking-tight text-white">How Master Import & Automatic Deduplication Works</h3>
          <ul className="text-xs text-gray-300 space-y-2 list-disc list-inside leading-relaxed">
            <li><strong>Master Export / Import:</strong> Click "Export All" to download a zipped archive of all 15 datasets, or click "Import All" to select multiple CSVs, a master ZIP, or JSON backup file.</li>
            <li><strong>Automatic Deduplication:</strong> All imports check SKUs, slugs, titles, order numbers, emails, and document IDs against current database records to automatically filter out duplicates and log the audit report.</li>
            <li><strong>Sub-Array & Single Doc Processing:</strong> Sliders, partner brands, testimonials, and page settings are merged safely without duplicate rows or array pollution.</li>
            <li><strong>Sample CSV Templates:</strong> Click "Sample CSV" on any card to download a pre-formatted template with exact column headers.</li>
          </ul>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-[#00B4D8] text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white hover:text-[#1A2B4C] transition-all shadow-lg"
          >
            Back To Top
          </button>
        </div>
      </div>
    </div>
  );
}


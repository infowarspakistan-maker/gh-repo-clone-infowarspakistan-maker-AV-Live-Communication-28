import { GoogleGenAI } from '@google/genai';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';
import { updateSheetData } from './server-utils/sheets';
import {
  generateGmcTsv,
  generateGmcSheetMatrix,
  getCanonicalProductSlug,
  resolveCanonicalProductSlugByIdentifier,
  PRODUCT_GMC_METADATA,
} from './src/lib/gmc-feed';
import { FALLBACK_SERVICES_CATALOG } from './src/lib/services-catalog';

// Initialize Firebase Admin
// We try to load from a local file if it exists, otherwise we rely on environment/defaults
const serviceAccountPath = path.join(process.cwd(), 'firebase-admin.json');
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
let databaseId: string | undefined = undefined;

if (fs.existsSync(configPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    databaseId = config.firestoreDatabaseId;
  } catch (e) {
    console.error('Error reading firebase-applet-config.json:', e);
  }
}

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  initializeApp({
    credential: cert(serviceAccount)
  });
} else if (getApps().length === 0) {
  // Try to initialize with just project ID (picks up ambient credentials in Google Cloud)
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    initializeApp({
      projectId: config.projectId
    });
  } catch (e) {
    console.warn('Firebase Admin could not be initialized with config file. Trying default...');
    try {
      initializeApp();
    } catch (e2) {
      console.error('Firebase Admin initialization failed:', e2);
    }
  }
}

const auth = getAuth();
const db = databaseId ? getFirestore(getApps()[0], databaseId) : getFirestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to verify admin role
  async function verifyAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await auth.verifyIdToken(token);
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      const role = userDoc.data()?.role;
      if (role === 'admin' || decodedToken.email === 'infowarspakistan@gmail.com') {
        (req as any).user = decodedToken;
        next();
      } else {
        res.status(403).json({ error: 'Forbidden: Admin access required' });
      }
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  }

  // Staff Management API
  app.get('/api/admin/users', verifyAdmin, async (req, res) => {
    try {
      const usersSnapshot = await db.collection('users')
        .where('role', 'in', ['admin', 'editor', 'support'])
        .get();

      const staff = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));

      res.json(staff);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admin/users', verifyAdmin, async (req, res) => {
    try {
      const { email, password, displayName, role } = req.body;
      const userRecord = await auth.createUser({
        email,
        password,
        displayName,
      });

      const userData = {
        uid: userRecord.uid,
        email,
        displayName,
        role,
        isActive: true,
        createdAt: FieldValue.serverTimestamp()
      };

      await db.collection('users').doc(userRecord.uid).set(userData);
      res.json(userData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/users', verifyAdmin, async (req, res) => {
    try {
      const { uid, ...updates } = req.body;
      if (updates.displayName) {
        await auth.updateUser(uid, { displayName: updates.displayName });
      }
      await db.collection('users').doc(uid).update({
        ...updates,
        updatedAt: FieldValue.serverTimestamp()
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/admin/users', verifyAdmin, async (req, res) => {
    try {
      const { uid } = req.body;
      await auth.deleteUser(uid);
      await db.collection('users').doc(uid).delete();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Customer Management API
  app.get('/api/admin/customers', verifyAdmin, async (req, res) => {
    try {
      const { uid } = req.query;
      
      if (uid) {
        const ordersSnapshot = await db.collection('orders')
          .where('customerId', '==', uid)
          .get();
        
        const ordersData = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        return res.json(ordersData);
      }

      const usersSnapshot = await db.collection('users').get();

      const customers: any[] = [];
      const processDocs = async (snapshot: any) => {
        for (const doc of snapshot.docs) {
          const userData = doc.data();
          if (userData.role === 'admin') continue;
          
          const ordersSnap = await db.collection('orders')
            .where('customerId', '==', doc.id)
            .get();
          
          const totalSpent = ordersSnap.docs.reduce((sum, o) => sum + (o.data().total || 0), 0);
          
          customers.push({
            uid: doc.id,
            ...userData,
            orders: ordersSnap.size,
            totalSpent
          });
        }
      };

      await processDocs(usersSnapshot);

      const uniqueCustomers = Array.from(new Map(customers.map(c => [c.uid, c])).values());
      res.json(uniqueCustomers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/customers', verifyAdmin, async (req, res) => {
    try {
      const { uid, isBlocked } = req.body;
      await db.collection('users').doc(uid).update({
        isBlocked,
        updatedAt: FieldValue.serverTimestamp()
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Mock Data Store (In-memory for simulation, since Firebase was declined)
  let orders: any[] = [
    { id: 'ORD-001', customerName: 'Ahmed Raza', date: 'Jul 10, 2026', total: 2499.00, status: 'Processing' },
    { id: 'ORD-002', customerName: 'Sara Khan', date: 'Jul 09, 2026', total: 849.50, status: 'Shipped' }
  ];

  let products: any[] = [
    { id: 1, name: 'Polycom Studio USB Bar', brand: 'Polycom', category: 'Video Conferencing', price: 999.00, image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&q=80', stock: 12 },
    { id: 2, name: 'Cisco Webex Room Kit Plus', brand: 'Cisco', category: 'Video Conferencing', price: 4999.00, image: 'https://images.unsplash.com/photo-1585282263861-f55e341878f8?w=800&q=80', stock: 5 },
    { id: 3, name: 'Indoor SMD Display Panel P2.5', brand: 'Generic Pro', category: 'LED Displays', price: 650.00, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80', stock: 8 },
    { id: 4, name: 'Bosch PA Amplifier (500W)', brand: 'Bosch', category: 'Audio Systems', price: 1450.00, image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80', stock: 15 }
  ];

  let siteSettings = {
    siteName: "AV Live Communications",
    contactEmail: "info@avlive.com.pk",
    phone: "0321 425 6263",
    address: "Johar Town Block N, Lahore",
    taxRate: 0.18
  };

  // API Routes
  
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const baseUrl = 'https://avlive.com.pk';
      const today = new Date().toISOString().split('T')[0];
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      // Optimized Static, Program, Brand & Focus Keyword routes
      const staticRoutes = [
        '',
        '/shop',
        '/brands',
        '/solutions',
        '/services',
        '/events-services',
        '/event-quote',
        '/esports',
        '/room-designer',
        '/contact',
        '/about',
        '/faqs',
        '/blog',
        '/compare',
        '/guides',
        '/reviews',
        '/returns',
        '/shipping',
        '/payment',
        '/rma',
        '/privacy-policy',
        '/terms-of-service',
        '/programs/quote',
        '/programs/blind-drop-shipping',
        '/programs/government-education-pricing',
        '/programs/fulfillment-services',
        '/programs/promotions',
        '/programs/provisioning-services',
        '/programs/reseller-program',
        '/voip-service-providers',
        '/3d-hologram',
        '/projection-mapping',
        '/video-conferencing',
        '/conference-room-solutions',
        '/zoom-rooms',
        '/microsoft-teams-rooms',
        '/lahore',
        '/karachi',
        '/islamabad',
        '/services/corporate-events',
        '/services/hybrid-events',
        '/services/expo-organizing',
        '/services/esports-events',
        '/services/ai-development',
        '/services/ai-agents-workers',
        '/services/ai-automation',
        '/services/boardroom-integration',
        '/services/voip-telephony',
        '/brands/poly',
        '/brands/cisco',
        '/brands/logitech',
        '/brands/yealink',
        '/brands/jabra',
        '/brands/bosch',
        '/brands/hikvision',
        '/brands/dahua',
        '/brands/axis',
        '/brands/grandstream',
        '/brands/fanvil',
        '/brands/2n',
        '/brands/epson',
        '/brands/benq',
        '/brands/optoma',
        '/brands/panasonic',
        '/brands/sony',
        '/brands/viewsonic',
        '/brands/uniview',
        '/brands/itc',
        '/brands/3cx',
        '/brands/freepbx',
        '/brands/sangoma'
      ];

      const seenUrls = new Set<string>();
      const appendUrl = (locPath: string, priority: string) => {
        const fullLoc = `${baseUrl}${locPath}`;
        if (seenUrls.has(fullLoc)) return;
        seenUrls.add(fullLoc);
        xml += '  <url>\n';
        xml += `    <loc>${fullLoc}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += `    <priority>${priority}</priority>\n`;
        xml += '  </url>\n';
      };

      for (const route of staticRoutes) {
        appendUrl(route, route === '' ? '1.0' : route.startsWith('/brands/') || route.startsWith('/programs/') ? '0.7' : '0.9');
      }

      // Dynamic Products (only active, with GMC catalog fallback if Firestore Admin is unavailable)
      let addedProductCount = 0;
      try {
        const productsSnap = await db.collection('products').where('isActive', '==', true).get();
        productsSnap.forEach(doc => {
          const data = doc.data();
          const slug = getCanonicalProductSlug(data, doc.id);
          appendUrl(`/product/${slug}`, slug === 'polycom-realpresence-group-500-pakistan' ? '0.9' : '0.8');
          addedProductCount++;
        });
      } catch (e) {
        console.warn('Firestore Admin products read fallback for sitemap:', e);
      }

      for (const rawKey of Object.keys(PRODUCT_GMC_METADATA)) {
        const canonicalSlug = getCanonicalProductSlug({ slug: rawKey }, rawKey);
        appendUrl(`/product/${canonicalSlug}`, canonicalSlug === 'polycom-realpresence-group-500-pakistan' ? '0.9' : '0.8');
      }

      // Dynamic Categories (only active product categories, excluding navigation pages)
      const excludedCategorySlugs = new Set([
        'about', 'compare', 'faqs', 'guides', 'payment', 'returns', 'reviews', 'rma',
        'shipping', 'blog', 'contact', 'privacy-policy', 'terms-of-service',
        'blind-drop-shipping', 'fulfillment-services', 'government-education-pricing',
        'promotions', 'provisioning-services', 'quote', 'reseller-program',
        'ai-agents-workers', 'ai-automation', 'ai-development', 'corporate-events',
        'esports-events', 'expo-organizing', 'hybrid-events', 'voip-service-providers'
      ]);
      const canonicalCategorySlugs = [
        'video-conferencing',
        'touch-panels',
        'large-room',
        'speakerphones',
        'boardroom-codecs',
        'ptz-cameras',
        'ip-phones',
        'headsets',
        'ip-cameras',
        'intercom-paging-access',
        'voip-phone-systems',
        'projectors'
      ];
      for (const slug of canonicalCategorySlugs) {
        appendUrl(`/category/${slug}`, '0.8');
      }

      try {
        const categoriesSnap = await db.collection('categories').where('isActive', '==', true).get();
        categoriesSnap.forEach(doc => {
          const data = doc.data();
          const slug = data.slug || doc.id;
          if ((data.type && data.type !== 'product') || excludedCategorySlugs.has(slug)) {
            return;
          }
          appendUrl(`/category/${slug}`, '0.8');
        });
      } catch (e) {
        console.warn('Firestore Admin categories read fallback for sitemap:', e);
      }

      xml += '</urlset>';

      res.header('Content-Type', 'application/xml; charset=utf-8');
      res.send(xml);
    } catch (error) {
      console.error('Sitemap generation error:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // Live Google Merchant Center 40-Column TSV Feed Endpoint
  app.get(['/feed/google-merchant.tsv', '/api/gmc-feed.tsv'], async (req, res) => {
    try {
      let productList: Record<string, any>[] = [];
      try {
        const productsSnap = await db.collection('products').get();
        productList = productsSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter((p: any) => p.isActive !== false);
      } catch (dbErr) {
        console.warn('Firestore Admin read fallback for GMC feed:', dbErr);
      }

      if (productList.length > 0) {
        const tsv = generateGmcTsv(productList);
        res.setHeader('Content-Type', 'text/tab-separated-values; charset=utf-8');
        res.setHeader('Content-Disposition', 'inline; filename="google_merchant_feed.tsv"');
        return res.send(tsv);
      }

      const staticFeedPath = path.join(process.cwd(), 'public', 'google_merchant_feed.tsv');
      if (fs.existsSync(staticFeedPath)) {
        res.setHeader('Content-Type', 'text/tab-separated-values; charset=utf-8');
        res.setHeader('Content-Disposition', 'inline; filename="google_merchant_feed.tsv"');
        return res.send(fs.readFileSync(staticFeedPath, 'utf8'));
      }

      res.status(404).send('Feed not found');
    } catch (error) {
      console.error('Error generating GMC TSV feed:', error);
      res.status(500).send('Error generating GMC TSV feed');
    }
  });
  // --- n8n Workflow Automation Helper ---
  async function triggerN8NWorkflows(event: string, payload: any) {
    try {
      const workflowsSnapshot = await db.collection('n8n_workflows')
        .where('isActive', '==', true)
        .get();

      if (workflowsSnapshot.empty) {
        return;
      }

      const promises = workflowsSnapshot.docs.map(async (doc) => {
        const workflow = doc.data();
        const events: string[] = workflow.events || [];

        // Check if workflow is configured for this event type or 'all'
        if (!events.includes('all') && !events.includes(event)) {
          return;
        }

        const workflowId = doc.id;
        const workflowName = workflow.name || 'Unnamed Workflow';
        const webhookUrl = workflow.webhookUrl;
        const secretHeader = workflow.secretHeader || '';

        const start = Date.now();
        let responseStatus = 0;
        let responseBody = '';
        let status: 'success' | 'failure' = 'success';

        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          if (secretHeader) {
            headers['X-Webhook-Secret'] = secretHeader;
          }

          // Use native global fetch (available in Node 18+)
          const res = await fetch(webhookUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              event,
              timestamp: new Date().toISOString(),
              payload,
            }),
          });

          responseStatus = res.status;
          responseBody = await res.text();
          if (!res.ok) {
            status = 'failure';
          }
        } catch (err: any) {
          status = 'failure';
          responseStatus = 500;
          responseBody = err.message || 'Network/Fetch Error';
        }

        // Log the execution to Firestore
        await db.collection('n8n_logs').add({
          workflowId,
          workflowName,
          webhookUrl,
          event,
          timestamp: new Date().toISOString(),
          payload: JSON.stringify(payload),
          responseStatus,
          responseBody: responseBody.slice(0, 1000), // Truncate long bodies
          status,
          durationMs: Date.now() - start
        });
      });

      // Execute in parallel without holding up the response or crashing
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error triggering n8n workflows:', error);
    }
  }

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'AV Live API is running' });
  });

  app.get('/api/settings', (req, res) => {
    res.json(siteSettings);
  });

  app.post('/api/settings', (req, res) => {
    siteSettings = { ...siteSettings, ...req.body };
    res.json({ success: true, settings: siteSettings });
  });

  // --- n8n Workflow Administration API ---
  
  // Apply verifyAdmin to all workflow routes for security
  // (Note: we don't apply it globally to /api/admin/workflows because we want specific methods protected)

  // Get all workflows
  app.get('/api/admin/workflows', verifyAdmin, async (req, res) => {
    try {
      const snapshot = await db.collection('n8n_workflows').orderBy('createdAt', 'desc').get();
      const workflows = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(workflows);
    } catch (error: any) {
      console.error('Error getting workflows:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch workflows' });
    }
  });

  // Create a new workflow
  app.post('/api/admin/workflows', verifyAdmin, async (req, res) => {
    try {
      const { name, webhookUrl, events, isActive, secretHeader } = req.body;
      if (!name || !webhookUrl) {
        return res.status(400).json({ error: 'Name and Webhook URL are required' });
      }

      const newWorkflow = {
        name,
        webhookUrl,
        events: events || ['all'],
        isActive: isActive !== false,
        secretHeader: secretHeader || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await db.collection('n8n_workflows').add(newWorkflow);
      res.json({ success: true, id: docRef.id, workflow: { id: docRef.id, ...newWorkflow } });
    } catch (error: any) {
      console.error('Error creating workflow:', error);
      res.status(500).json({ error: error.message || 'Failed to create workflow' });
    }
  });

  // Update an existing workflow
  app.put('/api/admin/workflows/:id', verifyAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, webhookUrl, events, isActive, secretHeader } = req.body;
      
      const updateData: any = {
        updatedAt: new Date().toISOString()
      };
      if (name !== undefined) updateData.name = name;
      if (webhookUrl !== undefined) updateData.webhookUrl = webhookUrl;
      if (events !== undefined) updateData.events = events;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (secretHeader !== undefined) updateData.secretHeader = secretHeader;

      await db.collection('n8n_workflows').doc(id).update(updateData);
      res.json({ success: true, message: 'Workflow updated successfully' });
    } catch (error: any) {
      console.error('Error updating workflow:', error);
      res.status(500).json({ error: error.message || 'Failed to update workflow' });
    }
  });

  // Delete a workflow
  app.delete('/api/admin/workflows/:id', verifyAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await db.collection('n8n_workflows').doc(id).delete();
      res.json({ success: true, message: 'Workflow deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting workflow:', error);
      res.status(500).json({ error: error.message || 'Failed to delete workflow' });
    }
  });

  // Get all n8n execution logs
  app.get('/api/admin/workflows/logs', verifyAdmin, async (req, res) => {
    try {
      const snapshot = await db.collection('n8n_logs').orderBy('timestamp', 'desc').limit(50).get();
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(logs);
    } catch (error: any) {
      console.error('Error getting workflow logs:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch logs' });
    }
  });

  // Test trigger a specific workflow
  app.post('/api/admin/workflows/:id/test', verifyAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await db.collection('n8n_workflows').doc(id).get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'Workflow not found' });
      }

      const workflow = doc.data()!;
      const webhookUrl = workflow.webhookUrl;
      const secretHeader = workflow.secretHeader || '';

      const testPayload = {
        testId: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
        message: 'This is a test event triggered from the AV Live Admin Panel',
        triggeredBy: 'Superadmin',
        sampleData: {
          organization: 'AV Live Communication',
          website: 'https://avlive.com.pk',
          environment: 'production-integration'
        }
      };

      const start = Date.now();
      let responseStatus = 0;
      let responseBody = '';
      let status: 'success' | 'failure' = 'success';

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (secretHeader) {
          headers['X-Webhook-Secret'] = secretHeader;
        }

        const fetchRes = await fetch(webhookUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            event: 'test_connection',
            timestamp: new Date().toISOString(),
            payload: testPayload,
          }),
        });

        responseStatus = fetchRes.status;
        responseBody = await fetchRes.text();
        if (!fetchRes.ok) {
          status = 'failure';
        }
      } catch (err: any) {
        status = 'failure';
        responseStatus = 500;
        responseBody = err.message || 'Connection Error';
      }

      const logData = {
        workflowId: id,
        workflowName: workflow.name || 'Unnamed Workflow',
        webhookUrl,
        event: 'test_connection',
        timestamp: new Date().toISOString(),
        payload: JSON.stringify(testPayload),
        responseStatus,
        responseBody: responseBody.slice(0, 1000),
        status,
        durationMs: Date.now() - start
      };

      await db.collection('n8n_logs').add(logData);

      res.json({ success: status === 'success', log: logData });
    } catch (error: any) {
      console.error('Error testing workflow:', error);
      res.status(500).json({ error: error.message || 'Failed to run test' });
    }
  });

  // Secure Checkout & Order Processing
  app.post('/api/checkout', (req, res) => {
    const { total, taxAmount, customerType, ntn, items } = req.body;
    
    // Server-side NTN Validation Logic
    let isExempt = false;
    if (customerType === 'business' && ntn && ntn.length >= 7) {
      isExempt = true;
    }

    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: req.body.firstName ? `${req.body.firstName} ${req.body.lastName}` : 'Guest Customer',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      total: total,
      status: 'Pending',
      items: items || [],
      ntnVerified: isExempt
    };

    orders.unshift(newOrder);
    
    // Trigger active n8n workflows with the new order data
    triggerN8NWorkflows('new_order', newOrder);
    
    res.json({ 
      success: true, 
      quotationId: `QT-B2B-${Math.floor(Math.random() * 10000)}`,
      orderId: newOrder.id,
      taxExemptApplied: isExempt
    });
  });

  app.get('/api/orders', (req, res) => {
    res.json(orders);
  });

  app.patch('/api/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (order) {
      order.status = req.body.status;
      res.json({ success: true, order });
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  });

  // Sheet Syncing Endpoint
  app.post('/api/sync-sheets', verifyAdmin, async (req, res) => {
    try {
      let { spreadsheetId, range, values, accessToken } = req.body;
      if (!values || !Array.isArray(values) || values.length === 0) {
        const productsSnap = await db.collection('products').get();
        const productList = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        values = generateGmcSheetMatrix(productList);
      }
      await updateSheetData(spreadsheetId, range || 'Sheet1!A1', values, accessToken);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Product Management API
  app.get('/api/products', (req, res) => {
    res.json(products);
  });

  app.post('/api/products', (req, res) => {
    const newProduct = {
      id: products.length + 1,
      ...req.body,
      stock: req.body.stock || 0
    };
    products.push(newProduct);
    res.json({ success: true, product: newProduct });
  });

  app.delete('/api/products/:id', (req, res) => {
    products = products.filter(p => p.id !== parseInt(req.params.id));
    res.json({ success: true });
  });

  // Form endpoints for new services
  
  app.post('/api/event-quote', async (req, res) => {
    try {
      const body = req.body;
      
      const required = ['fullName', 'email', 'phone', 'eventType', 'eventSubType'];
      for (const field of required) {
        if (!body[field]) {
          return res.status(400).json({ error: `Missing required field: ${field}` });
        }
      }

      const docRef = await db.collection('event_quotes').add({
        ...body,
        status: 'new',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      // Trigger active n8n workflows with the event quote request
      triggerN8NWorkflows('new_quote', { id: docRef.id, ...body, status: 'new' });

      res.json({
        success: true,
        id: docRef.id,
        message: 'Quote request submitted successfully!'
      });
    } catch (error: any) {
      console.error('Error submitting quote:', error);
      res.status(500).json({ error: error.message || 'Failed to submit quote request' });
    }
  });

  app.post('/api/event-queries', (req, res) => {
    console.log('Received Event Query:', req.body);
    // Trigger n8n automation for contact submissions
    triggerN8NWorkflows('contact_submission', { ...req.body, type: 'event_consultation' });
    res.json({ success: true, message: 'Event consultation request received successfully.' });
  });

  app.post('/api/ai-queries', (req, res) => {
    console.log('Received AI Query:', req.body);
    // Trigger n8n automation for contact submissions
    triggerN8NWorkflows('contact_submission', { ...req.body, type: 'ai_strategy' });
    res.json({ success: true, message: 'AI strategy request received successfully.' });
  });

  
  // AI Image Generation Endpoint
  app.post('/api/generate-image', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }
      
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [
            {
              text: prompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9"
          }
        }
      });
      
      let base64EncodeString = null;
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            base64EncodeString = part.inlineData.data;
            break;
          }
        }
      }
      
      if (base64EncodeString) {
        const imageUrl = `data:image/png;base64,${base64EncodeString}`;
        res.json({ imageUrl });
      } else {
        res.status(500).json({ error: 'No image generated' });
      }
      
    } catch (error: any) {
      console.error('Image generation error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate image' });
    }
  });

  // Server-side SEO Canonical, Metadata & Structured Data injector for Googlebot first-wave HTML crawls
  function injectRouteSeoIntoHtml(html: string, reqPath: string): string {
    const cleanPath = reqPath === '/' ? '' : reqPath.replace(/\/+$/, '');
    const canonicalUrl = `https://avlive.com.pk${cleanPath}`;

    const routeMeta: Record<string, { title: string; description: string; noindex?: boolean; schema?: Record<string, any> }> = {
      '/shop': {
        title: 'Enterprise AV Shop | Video Conference in Pakistan, Polycom Group 500 & Poly X70 | AV Live',
        description: 'Buy genuine Video Conference in Pakistan hardware: Polycom Group 500, Poly Studio X70, Logitech Rally Bar, Yealink, and Corporate Event Management equipment.'
      },
      '/brands': {
        title: 'Authorized Enterprise AV & Video Conferencing Brands in Pakistan | Poly, Cisco, Logitech | AV Live',
        description: 'Browse official enterprise hardware by authorized brand partner in Pakistan: HP Poly, Cisco, Logitech, Yealink, Jabra, Bosch, Hikvision, Dahua, Axis, Epson, and Panasonic.'
      },
      '/video-conferencing': {
        title: 'Video Conferencing in Pakistan | Polycom Group 500, Poly X70, Zoom & Teams | AV Live',
        description: 'Enterprise video conferencing in Pakistan. Official integration of Polycom Group 500, Poly X70, Logitech Rally, Zoom Rooms & Microsoft Teams Rooms across Lahore, Karachi & Islamabad.'
      },
      '/conference-room-solutions': {
        title: 'Conference Room Solutions in Pakistan | Boardroom AV, Poly X70 & Cisco Room Kit | AV Live',
        description: 'Turnkey conference room solutions in Pakistan. Acoustic treatment, 4K PTZ cameras, beamforming ceiling microphones, and touch control panels for modern boardrooms.'
      },
      '/zoom-rooms': {
        title: 'Zoom Rooms Hardware & Integration in Pakistan | Poly, Logitech & Yealink | AV Live',
        description: 'Certified Zoom Rooms hardware deployment in Pakistan. One-touch wireless sharing, multi-camera speaker tracking, and pro-AV installation in Lahore, Karachi & Islamabad.'
      },
      '/microsoft-teams-rooms': {
        title: 'Microsoft Teams Rooms (MTR) Solutions in Pakistan | Certified AV Integrator | AV Live',
        description: 'Deploy Microsoft Teams Rooms (MTR) in Pakistan with certified HP Poly, Logitech Rally, Cisco, and Yealink video bars. Complete boardroom design and SLA support.'
      },
      '/3d-hologram': {
        title: '3D Hologram Events Pakistan | Holographic Stage Displays & HoloGauze | AV Live',
        description: 'Book high-impact 3D hologram displays in Pakistan for corporate product launches, keynote telepresence, and hybrid events in Lahore, Karachi & Islamabad.'
      },
      '/projection-mapping': {
        title: '3D Projection Mapping Pakistan | Architectural & Stage Mapping | AV Live',
        description: 'Immersive 3D projection mapping in Pakistan for corporate galas, building facades, and hybrid events using 20,000+ ANSI lumen laser projectors.'
      },
      '/lahore': {
        title: 'AV Live Lahore | Video Conferencing, Corporate Events & 3D Hologram in Lahore',
        description: 'AV Live Communications head office in Johar Town, Lahore. Enterprise video conferencing hardware, SMD LED walls, 3D hologram stages, and corporate event production.'
      },
      '/karachi': {
        title: 'Video Conferencing & Corporate Event Production in Karachi | AV Live Pakistan',
        description: 'Enterprise AV integration, Poly & Logitech video conferencing systems, expo fabrication, and hybrid corporate event management across Karachi.'
      },
      '/islamabad': {
        title: 'Government & Enterprise Video Conferencing & Event AV in Islamabad | AV Live',
        description: 'Secure boardroom video conferencing, Bosch digital conference microphones, and diplomatic/corporate event production in Islamabad and Rawalpindi.'
      },
      '/events-services': {
        title: 'Event Production, AV Equipment Rental & Corporate Event Management | Hybrid Events & Hologram Display | AV Live Pakistan',
        description: 'Book turnkey Corporate event management, SMD LED screen rental, 3D Hologram Display stages, line-array PA systems, and hybrid event Video Conference in Pakistan across Lahore, Karachi & Islamabad.'
      },
      '/event-quote': {
        title: 'Request an Event Production & AV Rental Quote | AV Live Communications Pakistan',
        description: 'Get an instant custom quotation for corporate events, hybrid townhalls, 3D hologram stages, SMD LED walls, and conference room AV in Pakistan.'
      },
      '/esports': {
        title: 'Esports Tournament Production & Broadcast AV in Pakistan | AV Live',
        description: 'End-to-end Esports arena staging, low-latency broadcast switching, custom stage lighting, and live streaming production in Pakistan.'
      },
      '/room-designer': {
        title: 'Interactive 3D Conference Room Designer | Boardroom AV Planner | AV Live',
        description: 'Configure your meeting room dimensions, seating capacity, and camera/microphone coverage with the AV Live interactive conference room planner.'
      },
      '/services': {
        title: 'Corporate Event Management, Hybrid Events & Video Conferencing Services | AV Live Pakistan',
        description: 'Full-scale Corporate Event Management, Hybrid Event Production, 3D Hologram Displays, Video Conferencing Boardroom Integration (Polycom Group 500, Poly X70), and AI Automation in Lahore, Karachi, and Islamabad.'
      },
      '/solutions': {
        title: 'Video Conference in Pakistan, Hybrid Event & 3D Hologram Solutions | Polycom Group 500 & Poly X70 | AV Live',
        description: 'Explore turnkey solutions for Video Conference in Pakistan (Polycom Group 500, Poly X70), smart boardrooms, Corporate event management, hybrid event broadcasting, and 3D Hologram Displays.'
      },
      '/about': {
        title: 'About AV Live Communications | Enterprise Pro-AV & Event Engineering in Pakistan',
        description: 'Learn how AV Live Communications delivers enterprise video conferencing, unified communications, 3D hologram production, and corporate event engineering across Pakistan.'
      },
      '/contact': {
        title: 'Contact AV Live Communications | Lahore Head Office & Nationwide AV Support',
        description: 'Contact our Pro-AV engineers in Johar Town, Lahore at 0321-4256263 or info@avlive.com.pk for hardware procurement, boardroom integration, and event production.'
      },
      '/blog': {
        title: 'Enterprise AV, Video Conferencing & Hybrid Event Insights Blog | AV Live Pakistan',
        description: 'Technical guides, boardroom design blueprints, and industry insights on video conferencing, VoIP telephony, and live event technology in Pakistan.'
      },
      '/guides': {
        title: "Enterprise AV & VoIP Buyer's Guides | Video Conferencing & IP Telephony | AV Live",
        description: 'In-depth hardware comparison and procurement guides for video conferencing bars, SIP IP phones, PoE security cameras, and commercial laser projectors in Pakistan.'
      },
      '/reviews': {
        title: 'Verified Enterprise Client Reviews & Case Studies | AV Live Communications Pakistan',
        description: 'Read verified reviews from corporate IT directors, universities, and government agencies across Pakistan who trust AV Live for video conferencing and event production.'
      },
      '/compare': {
        title: 'Compare Video Conferencing & VoIP Hardware Side-by-Side | AV Live Pakistan',
        description: 'Compare technical specifications, camera optics, microphone pickup range, and PKR pricing across Poly, Cisco, Logitech, and Yealink hardware.'
      },
      '/faqs': {
        title: 'Frequently Asked Questions (FAQs) | Video Conference & Event Management | AV Live',
        description: 'Answers to common questions about Video Conference in Pakistan, Polycom Group 500, Poly X70, Corporate Event Management, 3D Hologram displays, and nationwide delivery.'
      },
      '/returns': {
        title: 'Return Policy & 30-Day Hardware Replacement Guarantee | AV Live Pakistan',
        description: 'Transparent 30-day hardware return and DOA replacement policy for enterprise video conferencing, VoIP phones, and AV equipment purchased from AV Live Communications.'
      },
      '/shipping': {
        title: 'Insured Nationwide B2B Shipping & Delivery Policy | AV Live Pakistan',
        description: 'Same-day dispatch in Lahore and insured express courier delivery across Karachi, Islamabad, Faisalabad, Multan, and all of Pakistan for enterprise AV hardware.'
      },
      '/payment': {
        title: 'Corporate Payment Methods, Bank Transfer & Official GST/NTN Invoicing | AV Live',
        description: 'Flexible B2B payment options including corporate cross-cheque, IBFT bank transfer, purchase order (PO) financing, and FBR-compliant GST tax invoicing.'
      },
      '/rma': {
        title: 'Warranty Claim & RMA Hardware Support Portal | AV Live Communications',
        description: 'Submit an official Return Merchandise Authorization (RMA) request for warranty repair or replacement of Poly, Cisco, Logitech, and Yealink hardware in Pakistan.'
      },
      '/voip-service-providers': {
        title: 'Enterprise VoIP Service Providers & SIP PBX Integration in Pakistan | AV Live',
        description: 'Compare and deploy 3CX, FreePBX, Grandstream UCM, and Cisco Unified Communications PBX systems with multi-branch SIP trunking in Pakistan.'
      },
      '/programs/quote': {
        title: 'Request an Official B2B Hardware & Project Quotation | AV Live Communications',
        description: 'Request volume corporate pricing, tender BOQ estimates, and tax-compliant quotations for enterprise AV and video conferencing hardware in Pakistan.'
      },
      '/programs/blind-drop-shipping': {
        title: 'Blind Drop Shipping for IT Resellers & System Integrators | AV Live Pakistan',
        description: 'Ship enterprise AV and VoIP hardware directly to your clients across Pakistan in neutral, unbranded packaging with your company packing slip.'
      },
      '/programs/government-education-pricing': {
        title: 'Government, HEC University & Public Sector AV Pricing Program | AV Live Pakistan',
        description: 'Special tender pricing, PPRA-compliant documentation, and tax-exempt procurement for government ministries, defense, and HEC universities in Pakistan.'
      },
      '/programs/fulfillment-services': {
        title: 'Enterprise Staging, Warehousing & 3PL AV Fulfillment Services | AV Live',
        description: 'Multi-branch hardware staging, asset tagging, and scheduled rollout fulfillment for banks and nationwide enterprises in Pakistan.'
      },
      '/programs/promotions': {
        title: 'Current Enterprise Hardware Promotions, Bundles & Rebates | AV Live Pakistan',
        description: 'Exclusive bundle discounts and trade-in rebates on Poly Studio video bars, Logitech Rally kits, and Yealink IP phones in Pakistan.'
      },
      '/programs/provisioning-services': {
        title: 'Zero-Touch VoIP & Video Endpoint Pre-Provisioning Services | AV Live Pakistan',
        description: 'Factory firmware updates, SIP account pre-configuration, and plug-and-play provisioning before hardware leaves our Lahore warehouse.'
      },
      '/programs/reseller-program': {
        title: 'Authorized B2B Partner & IT Reseller Program | AV Live Communications Pakistan',
        description: 'Join the AV Live reseller network for wholesale distributor margins, deal registration protection, and pre-sales engineering support in Pakistan.'
      },
      '/privacy-policy': {
        title: 'Privacy Policy & Corporate Data Protection | AV Live Communications',
        description: 'How AV Live Communications collects, protects, and processes corporate client and procurement data in Pakistan.'
      },
      '/terms-of-service': {
        title: 'Terms of Service & B2B Procurement Agreement | AV Live Communications',
        description: 'Standard commercial terms, hardware warranty conditions, and SLA terms for AV Live Communications Pakistan.'
      },
      '/setup-wizard': {
        title: 'Database Setup Wizard | AV Live',
        description: 'Internal setup utility.',
        noindex: true
      },
      '/cart': {
        title: 'Project Staging Cart | AV Live Communications',
        description: 'Review your enterprise AV and video conferencing hardware staging cart.',
        noindex: true
      },
      '/checkout': {
        title: 'Secure Checkout | AV Live Communications',
        description: 'Complete your enterprise AV hardware procurement order.',
        noindex: true
      },
      '/admin': {
        title: 'Admin Portal | AV Live',
        description: 'Restricted administrative portal.',
        noindex: true
      }
    };

    let matched = routeMeta[cleanPath];
    if (!matched && cleanPath.startsWith('/admin/')) {
      matched = routeMeta['/admin'];
    }

    // Dynamic Brand Route SSR Metadata Injection (/brands/:brandSlug)
    if (!matched && cleanPath.startsWith('/brands/')) {
      const brandSlug = cleanPath.replace('/brands/', '');
      const brandNames: Record<string, string> = {
        poly: 'HP Poly (Polycom)',
        cisco: 'Cisco',
        logitech: 'Logitech',
        yealink: 'Yealink',
        jabra: 'Jabra',
        bosch: 'Bosch',
        hikvision: 'Hikvision',
        dahua: 'Dahua',
        axis: 'Axis Communications',
        grandstream: 'Grandstream',
        fanvil: 'Fanvil',
        '2n': '2N Telekomunikace',
        epson: 'Epson',
        benq: 'BenQ',
        optoma: 'Optoma',
        panasonic: 'Panasonic',
        sony: 'Sony',
        viewsonic: 'ViewSonic',
        uniview: 'Uniview',
        itc: 'ITC Audio',
        '3cx': '3CX',
        sangoma: 'Sangoma'
      };
      const readableBrand = brandNames[brandSlug.toLowerCase()] || (brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1));
      matched = {
        title: `${readableBrand} Official Hardware Distributor in Pakistan | Video Conferencing & AV | AV Live`,
        description: `Shop genuine ${readableBrand} video conferencing systems, IP phones, projectors, and enterprise AV hardware in Pakistan with official warranty from AV Live Communications.`
      };
    }

    // Dynamic Product Route SSR Metadata & Schema Injection (/product/:slug)
    if (!matched && cleanPath.startsWith('/product/')) {
      const rawIdentifier = cleanPath.replace('/product/', '');
      const resolvedSlug = resolveCanonicalProductSlugByIdentifier(rawIdentifier) || rawIdentifier;
      const gmcMeta = PRODUCT_GMC_METADATA[resolvedSlug];
      if (gmcMeta) {
        const readableName = resolvedSlug
          .replace(/-pakistan$/, '')
          .split('-')
          .map(w => w.toUpperCase() === 'IP' || w.toUpperCase() === 'PTZ' || w.toUpperCase() === 'USB' || w.toUpperCase() === '4K' ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        const title = `${readableName} (${gmcMeta.mpn}) | ${gmcMeta.brand} Video Conference in Pakistan | AV Live`;
        const description = gmcMeta.defaultDescription || `${gmcMeta.highlight}. Official ${gmcMeta.brand} MPN ${gmcMeta.mpn} with 1-year Pakistan warranty and nationwide deployment.`;
        matched = {
          title,
          description,
          schema: {
            '@context': 'https://schema.org',
            '@type': 'Product',
            '@id': `${canonicalUrl}#product`,
            name: readableName,
            sku: gmcMeta.mpn,
            mpn: gmcMeta.mpn,
            gtin12: gmcMeta.gtin,
            gtin: gmcMeta.gtin,
            description,
            brand: { '@type': 'Brand', name: gmcMeta.brand },
            offers: {
              '@type': 'Offer',
              url: canonicalUrl,
              priceCurrency: 'PKR',
              price: '50000.00',
              itemCondition: 'https://schema.org/NewCondition',
              availability: 'https://schema.org/InStock',
              seller: { '@type': 'Organization', name: 'AV Live Communications', url: 'https://avlive.com.pk' }
            }
          }
        };
      }
    }

    // Dynamic Service Detail Route SSR Metadata & Schema Injection (/services/:serviceSlug)
    if (!matched && cleanPath.startsWith('/services/')) {
      const serviceSlug = cleanPath.replace('/services/', '');
      const svc = FALLBACK_SERVICES_CATALOG.find(s => s.slug === serviceSlug);
      if (svc) {
        matched = {
          title: `${svc.title} | AV Live Communications Pakistan`,
          description: svc.description,
          schema: {
            '@context': 'https://schema.org',
            '@type': 'Service',
            '@id': `${canonicalUrl}#service`,
            name: svc.title,
            description: svc.description,
            url: canonicalUrl,
            provider: { '@id': 'https://avlive.com.pk/#organization' },
            areaServed: ['Lahore', 'Karachi', 'Islamabad', 'Pakistan']
          }
        };
      }
    }

    // Dynamic Category Route SSR Metadata Injection (/category/:categorySlug)
    if (!matched && cleanPath.startsWith('/category/')) {
      const catSlug = cleanPath.replace('/category/', '');
      const readableCat = catSlug
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      matched = {
        title: `${readableCat} | Video Conference in Pakistan | Polycom Group 500 & Poly X70 | AV Live`,
        description: `Explore genuine ${readableCat} in Pakistan including Polycom Group 500, Poly X70, and enterprise Video conference & Corporate event management hardware.`
      };
    }

    let updated = html
      .replace(
        /<link(?:\s+data-rh="true")?\s+rel="canonical"\s+href="https:\/\/avlive\.com\.pk"\s*\/>/,
        `<link data-rh="true" rel="canonical" href="${canonicalUrl}" />`
      )
      .replace(
        /<meta(?:\s+data-rh="true")?\s+property="og:url"\s+content="https:\/\/avlive\.com\.pk"\s*\/>/,
        `<meta data-rh="true" property="og:url" content="${canonicalUrl}" />`
      );

    if (matched) {
      updated = updated
        .replace(/<title(?:\s+data-rh="true")?>[\s\S]*?<\/title>/, `<title data-rh="true">${matched.title}</title>`)
        .replace(
          /<meta(?:\s+data-rh="true")?\s+name="description"\s+content="[^"]*"\s*\/>/,
          `<meta data-rh="true" name="description" content="${matched.description}" />`
        )
        .replace(
          /<meta(?:\s+data-rh="true")?\s+property="og:title"\s+content="[^"]*"\s*\/>/,
          `<meta data-rh="true" property="og:title" content="${matched.title}" />`
        )
        .replace(
          /<meta(?:\s+data-rh="true")?\s+property="og:description"\s+content="[^"]*"\s*\/>/,
          `<meta data-rh="true" property="og:description" content="${matched.description}" />`
        );
      if (matched.noindex) {
        updated = updated.replace(
          /<meta(?:\s+data-rh="true")?\s+name="robots"\s+content="[^"]*"\s*\/>/,
          '<meta data-rh="true" name="robots" content="noindex, nofollow" />'
        );
      }
      if (matched.schema) {
        const schemaTag = `<script type="application/ld+json" id="ssr-route-schema">${JSON.stringify(matched.schema)}</script>\n  </head>`;
        updated = updated.replace('</head>', schemaTag);
      }
    }

    return updated;
  }

  // Legacy, Query-Param Brand, Non-Product Category & Raw Firestore ID / MPN 301 Redirects
  const legacyDirectRedirects: Record<string, string> = {
    '/tools/room-designer': '/room-designer',
    '/voip-service': '/voip-service-providers',
    '/products/compare': '/compare',
    '/quote': '/programs/quote',
    '/blind-drop-shipping': '/programs/blind-drop-shipping',
    '/gov-ed-pricing': '/programs/government-education-pricing',
    '/government-education-pricing': '/programs/government-education-pricing',
    '/fulfillment-services': '/programs/fulfillment-services',
    '/promotions': '/programs/promotions',
    '/provisioning': '/programs/provisioning-services',
    '/provisioning-services': '/programs/provisioning-services',
    '/reseller': '/programs/reseller-program',
    '/reseller-program': '/programs/reseller-program',
    '/buyers-guides': '/guides',
    '/category/about': '/about',
    '/category/compare': '/compare',
    '/category/faqs': '/faqs',
    '/category/guides': '/guides',
    '/category/payment': '/payment',
    '/category/returns': '/returns',
    '/category/reviews': '/reviews',
    '/category/rma': '/rma',
    '/category/shipping': '/shipping',
    '/category/blog': '/blog',
    '/category/contact': '/contact',
    '/category/privacy-policy': '/privacy-policy',
    '/category/terms-of-service': '/terms-of-service',
    '/category/blind-drop-shipping': '/programs/blind-drop-shipping',
    '/category/fulfillment-services': '/programs/fulfillment-services',
    '/category/government-education-pricing': '/programs/government-education-pricing',
    '/category/promotions': '/programs/promotions',
    '/category/provisioning-services': '/programs/provisioning-services',
    '/category/quote': '/programs/quote',
    '/category/reseller-program': '/programs/reseller-program',
    '/category/voip-service-providers': '/voip-service-providers',
    '/category/corporate-events': '/services/corporate-events',
    '/category/hybrid-events': '/services/hybrid-events',
    '/category/expo-organizing': '/services/expo-organizing',
    '/category/esports-events': '/services/esports-events',
    '/category/ai-development': '/services/ai-development',
    '/category/ai-agents-workers': '/services/ai-agents-workers',
    '/category/ai-automation': '/services/ai-automation',
  };

  for (const [fromPath, toPath] of Object.entries(legacyDirectRedirects)) {
    app.get(fromPath, (req, res) => res.redirect(301, toPath));
  }

  // Redirect /shop?brand=logitech -> /brands/logitech for clean indexable brand landing URLs
  app.get('/shop', (req, res, next) => {
    const brandParam = typeof req.query.brand === 'string' ? req.query.brand.trim() : '';
    const otherKeys = Object.keys(req.query).filter(k => k !== 'brand');
    if (brandParam && !brandParam.includes(',') && otherKeys.length === 0) {
      const slug = brandParam.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const normalizedBrandSlug = slug === 'polycom' || slug === 'hp-poly' ? 'poly' : slug;
      return res.redirect(301, `/brands/${normalizedBrandSlug}`);
    }
    next();
  });

  // Redirect /category/:slug?sub=:sub -> /category/:sub so query-parameterized subcategories resolve to clean canonical paths
  app.get('/category/:categorySlug', (req, res, next) => {
    const subParam = typeof req.query.sub === 'string' ? req.query.sub.trim().toLowerCase() : '';
    if (subParam) {
      const cleanSub = subParam.replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
      return res.redirect(301, `/category/${cleanSub || req.params.categorySlug}`);
    }
    next();
  });

  // Redirect legacy /products/:slug -> /category/:slug or /product/:canonicalSlug
  app.get('/products/:legacySlug', (req, res) => {
    const slug = req.params.legacySlug;
    if (slug === 'compare') {
      return res.redirect(301, '/compare');
    }
    const resolvedProductSlug = resolveCanonicalProductSlugByIdentifier(slug);
    if (resolvedProductSlug) {
      return res.redirect(301, `/product/${resolvedProductSlug}`);
    }
    return res.redirect(301, `/category/${slug.toLowerCase()}`);
  });

  // Redirect raw Firestore IDs, MPNs (e.g., /product/9137161U), or legacy slugs to canonical product SEO slugs
  app.get('/product/:idOrSlug', (req, res, next) => {
    const requested = req.params.idOrSlug;
    const canonicalSlug = resolveCanonicalProductSlugByIdentifier(requested);
    if (canonicalSlug && canonicalSlug !== requested) {
      return res.redirect(301, `/product/${canonicalSlug}`);
    }
    next();
  });

  // Set X-Robots-Tag: noindex, nofollow on private/transactional routes
  app.use(['/admin', '/cart', '/checkout', '/setup-wizard'], (req, res, next) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    next();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      maxAge: '1y',
      immutable: true,
    }));
    app.use(express.static(distPath, {
      index: false,
      maxAge: '1h',
    }));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        const rawHtml = fs.readFileSync(indexPath, 'utf8');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        res.send(injectRouteSeoIntoHtml(rawHtml, req.path));
      } else {
        res.status(404).send('Application build not found');
      }
    });
  }

  // Global error handler for 5xx prevention
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('--- 5xx SERVER ERROR ---');
    console.error('URL:', req.originalUrl);
    console.error('Method:', req.method);
    console.error('Stack:', err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

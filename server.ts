import { GoogleGenAI } from '@google/genai';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp as initializeClientApp, getApps as getClientApps } from 'firebase/app';
import { getFirestore as getClientFirestore, collection as clientCollection, getDocs as clientGetDocs } from 'firebase/firestore';
import fs from 'fs';
import { updateSheetData } from './server-utils/sheets';
import {
  generateGmcTsv,
  generateGmcSheetMatrix,
  getCanonicalProductSlug,
  resolveCanonicalProductSlugByIdentifier,
  PRODUCT_GMC_METADATA,
  buildFallbackProductFromGmcMeta,
  resolveProductPricing,
} from './src/lib/gmc-feed';
import { FALLBACK_SERVICES_CATALOG } from './src/lib/services-catalog';
import {
  buildDynamicSitemapXml,
  buildLlmsFullTxt,
  FALLBACK_BLOG_CATALOG,
  resolveCanonicalBlogSlug,
} from './src/lib/sitemap-generator';

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

// Initialize Firebase Web Client SDK as reliable fallback for public collections when Admin IAM lacks datastore.viewer
let clientDb: ReturnType<typeof getClientFirestore> | null = null;
try {
  if (fs.existsSync(configPath)) {
    const clientConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const clientApp = getClientApps().length > 0 ? getClientApps()[0] : initializeClientApp(clientConfig, 'server-public-client');
    clientDb = clientConfig.firestoreDatabaseId
      ? getClientFirestore(clientApp, clientConfig.firestoreDatabaseId)
      : getClientFirestore(clientApp);
  }
} catch (clientInitErr) {
  console.warn('Firebase Web Client SDK fallback init warning:', clientInitErr);
}

async function fetchCollectionWithClientFallback(colName: string): Promise<Array<Record<string, any>>> {
  if (clientDb) {
    try {
      const snap = await clientGetDocs(clientCollection(clientDb, colName));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (clientErr) {
      // Fall back to Admin SDK if client fails
    }
  }
  try {
    const adminSnap = await db.collection(colName).get();
    return adminSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

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
  
  // Automated Server-Side Sitemap Generator & Disk Synchronizer
  let cachedSitemapXml: string | null = null;
  let lastSitemapGeneratedAt = 0;
  const SITEMAP_CACHE_TTL_MS = 60 * 1000; // 60 seconds dynamic refresh window

  async function generateAndSyncServerSitemap(forceRefresh = false): Promise<string> {
    const now = Date.now();
    if (!forceRefresh && cachedSitemapXml && now - lastSitemapGeneratedAt < SITEMAP_CACHE_TTL_MS) {
      return cachedSitemapXml;
    }

    const activeProducts: Array<Record<string, any>> = [];
    const activeCategories: Array<Record<string, any>> = [];
    const activeServices: Array<Record<string, any>> = [];
    const activeBlogPosts: Array<Record<string, any>> = [];

    const [productsRes, categoriesRes, servicesRes, blogsRes] = await Promise.allSettled([
      fetchCollectionWithClientFallback('products'),
      fetchCollectionWithClientFallback('categories'),
      fetchCollectionWithClientFallback('services'),
      fetchCollectionWithClientFallback('blog_posts')
    ]);

    if (productsRes.status === 'fulfilled') {
      productsRes.value.forEach(data => {
        if (data.isActive !== false) {
          activeProducts.push(data);
        }
      });
    }

    if (categoriesRes.status === 'fulfilled') {
      categoriesRes.value.forEach(data => {
        if (data.isActive !== false) {
          activeCategories.push(data);
        }
      });
    }

    if (servicesRes.status === 'fulfilled') {
      servicesRes.value.forEach(data => {
        if (data.isActive !== false) {
          activeServices.push(data);
        }
      });
    }

    if (blogsRes.status === 'fulfilled') {
      blogsRes.value.forEach(data => {
        if (data.isPublished !== false && data.isActive !== false) {
          activeBlogPosts.push(data);
        }
      });
    }

    const { xml } = buildDynamicSitemapXml({
      products: activeProducts,
      categories: activeCategories,
      services: activeServices,
      blogPosts: activeBlogPosts
    });

    cachedSitemapXml = xml;
    lastSitemapGeneratedAt = now;

    // Keep public/sitemap.xml, public/llms-full.txt, and dist copies synchronized so static middleware never serves stale files
    try {
      const publicSitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
      fs.writeFileSync(publicSitemapPath, xml, 'utf8');
      const llmsFullTxt = buildLlmsFullTxt();
      fs.writeFileSync(path.join(process.cwd(), 'public', 'llms-full.txt'), llmsFullTxt, 'utf8');
      const distSitemapPath = path.join(process.cwd(), 'dist', 'sitemap.xml');
      if (fs.existsSync(path.dirname(distSitemapPath))) {
        fs.writeFileSync(distSitemapPath, xml, 'utf8');
        fs.writeFileSync(path.join(process.cwd(), 'dist', 'llms-full.txt'), llmsFullTxt, 'utf8');
      }
    } catch (syncErr) {
      console.warn('Could not sync generated sitemap.xml / llms-full.txt to disk:', syncErr);
    }

    return xml;
  }

  // Warm up and synchronize sitemap on server startup
  generateAndSyncServerSitemap(true).catch(err =>
    console.warn('Initial server sitemap warmup warning:', err)
  );

  app.get('/sitemap.xml', async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === '1' || req.query.refresh === 'true';
      const xml = await generateAndSyncServerSitemap(forceRefresh);
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400');
      res.send(xml);
    } catch (error) {
      console.error('Sitemap generation error:', error);
      const fallbackXml = buildDynamicSitemapXml().xml;
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.send(fallbackXml);
    }
  });

  app.get('/llms-full.txt', (req, res) => {
    try {
      const content = buildLlmsFullTxt();
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(content);
    } catch (error) {
      console.error('llms-full.txt generation error:', error);
      res.status(500).send('Error generating llms-full.txt');
    }
  });

  app.get('/llms.txt', (req, res) => {
    const llmsPath = path.join(process.cwd(), 'public', 'llms.txt');
    if (fs.existsSync(llmsPath)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.send(fs.readFileSync(llmsPath, 'utf8'));
    }
    res.redirect(302, '/llms-full.txt');
  });

  // Live Google Merchant Center 40-Column TSV Feed Endpoint
  app.get(['/feed/google-merchant.tsv', '/api/gmc-feed.tsv'], async (req, res) => {
    try {
      let productList: Record<string, any>[] = [];
      try {
        const docs = await fetchCollectionWithClientFallback('products');
        productList = docs.filter((p: any) => p.isActive !== false);
      } catch (dbErr) {
        console.warn('Firestore read fallback for GMC feed:', dbErr);
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

    const escapeHtmlText = (str: string): string =>
      String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const escapeHtmlAttr = (str: string): string =>
      escapeHtmlText(str).replace(/"/g, '&quot;');

    const clampSeoTitle = (rawTitle: string, maxLen = 65): string => {
      const normalized = String(rawTitle || 'Video Conference | Event Management | AV Live')
        .replace(/^e-Sports\b/i, 'Esports')
        .replace(/\s+/g, ' ')
        .trim();
      const capitalized = normalized.replace(/^[a-z]/, c => c.toUpperCase());
      const withBrand = capitalized.includes('AV Live') ? capitalized : `${capitalized} | AV Live`;
      if (withBrand.length <= maxLen) return withBrand;

      const core = capitalized.replace(/\s*\|\s*AV Live(?:\s+[^\s|]+)*$/i, '').trim();
      const suffix = ' | AV Live';
      const budget = maxLen - suffix.length;
      if (core.length <= budget) return `${core}${suffix}`;

      const segments = core.split(/\s+[|—–-]\s+/);
      if (segments.length > 1 && segments[0].length <= budget && segments[0].length >= 18) {
        return `${segments[0].trim()}${suffix}`;
      }

      const sliced = core.slice(0, budget);
      const lastSpace = sliced.lastIndexOf(' ');
      const cleanCore = (lastSpace > 20 ? sliced.slice(0, lastSpace) : sliced).replace(/[,:;|\-–—\s]+$/, '');
      return `${cleanCore}${suffix}`;
    };

    const clampSeoDescription = (rawDesc: string, maxLen = 158): string => {
      const clean = String(rawDesc || '')
        .replace(/\s+/g, ' ')
        .trim();
      if (clean.length <= maxLen) return clean;
      const sliced = clean.slice(0, maxLen - 1);
      const lastSpace = sliced.lastIndexOf(' ');
      const trimmed = (lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced).replace(/[,:;|\-–—.\s]+$/, '');
      return `${trimmed}.`;
    };

    const routeMeta: Record<string, { title: string; description: string; keywords?: string; noindex?: boolean; schema?: Record<string, any> }> = {
      '': {
        title: 'Video Conference | Event Management | AV Live',
        description: "AV Live is Pakistan's premier Video Conference & Event Management company. Shop Poly, Logitech & Cisco AV or book 3D hologram & corporate events."
      },
      '/': {
        title: 'Video Conference | Event Management | AV Live',
        description: "AV Live is Pakistan's premier Video Conference & Event Management company. Shop Poly, Logitech & Cisco AV or book 3D hologram & corporate events."
      },
      '/sitemap': {
        title: 'HTML Sitemap & Enterprise AV Directory | AV Live',
        description: 'Browse the complete directory of 155 verified pages on AV Live Pakistan: Video Conferencing, Event Management, 53 Products, 25 Brands & Guides.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': 'https://avlive.com.pk/sitemap#collection',
          name: 'AV Live Communications Complete HTML Sitemap & Enterprise Hardware Directory',
          url: 'https://avlive.com.pk/sitemap',
          description: 'Complete crawlable directory of all 155 verified pages on avlive.com.pk including Polycom Group 500, Poly Studio X70, Cisco, Logitech, Yealink, Corporate Event Management, and 3D Hologram Displays.'
        }
      },
      '/shop': {
        title: 'Enterprise AV Shop | Poly, Logitech & Cisco | AV Live',
        description: 'Buy genuine video conferencing hardware in Pakistan: Polycom Group 500, Poly Studio X70, Logitech Rally Bar, Cisco Room Kits & Yealink IP phones.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': 'https://avlive.com.pk/shop#collection',
          name: 'Enterprise AV & Video Conferencing Hardware Store in Pakistan',
          url: 'https://avlive.com.pk/shop',
          description: 'Official enterprise hardware store for Poly, Logitech, Cisco, Yealink, Jabra, and Bosch in Pakistan.'
        }
      },
      '/brands': {
        title: 'Authorized Enterprise AV Brands in Pakistan | AV Live',
        description: 'Browse official enterprise hardware by authorized brand in Pakistan: HP Poly, Cisco, Logitech, Yealink, Jabra, Bosch, Hikvision, Dahua & Epson.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': 'https://avlive.com.pk/brands#collection',
          name: 'Authorized Enterprise AV & Video Conferencing Brands in Pakistan',
          url: 'https://avlive.com.pk/brands',
          description: 'Authorized distributor catalog for 25 OEM pro-AV and unified communications brands in Pakistan.'
        }
      },
      '/video-conferencing': {
        title: 'Video Conferencing in Pakistan | Poly & Logitech | AV Live',
        description: 'Enterprise video conferencing in Pakistan. Official integration of Polycom Group 500, Poly X70, Logitech Rally, Zoom & Teams Rooms nationwide.'
      },
      '/video-conferencing-solutions': {
        title: 'Video Conferencing Solutions in Pakistan | AV Live',
        description: 'Authorized Polycom, Cisco & Logitech boardroom video conferencing integration in Lahore, Karachi & Islamabad. 15-Min SLA: 0321 425 6263.',
        schema: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Service',
              '@id': 'https://avlive.com.pk/video-conferencing-solutions#service',
              name: 'Enterprise Video Conferencing Solutions in Lahore, Karachi & Islamabad',
              serviceType: 'Boardroom AV Integration, Huddle Room Kits & Interactive Flat Panels',
              description: 'Turnkey enterprise video conferencing solutions deploying Cisco, HP Poly (Polycom), Yealink, Logitech, Horion, and Grandstream across Lahore, Karachi, and Islamabad with a 15-minute technical SLA.',
              provider: { '@id': 'https://avlive.com.pk/#organization' },
              areaServed: ['Lahore', 'Karachi', 'Islamabad', 'Pakistan']
            },
            {
              '@type': 'FAQPage',
              '@id': 'https://avlive.com.pk/video-conferencing-solutions#faq',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What is the cost of a 30-person executive boardroom AV setup in Pakistan?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'In Pakistan, a turnkey 16-to-30 person executive boardroom AV setup costs between Rs. 1,450,000 and Rs. 3,200,000+ depending on whether you select Polycom RealPresence Group 500, HP Poly Studio X72, or Cisco Room Kit Plus, paired with dual 75"-85" 4K displays or a Horion Interactive Flat Panel, expansion or ceiling microphone arrays, and concealed table connectivity.'
                  }
                }
              ]
            }
          ]
        }
      },
      '/corporate-event-management': {
        title: 'Corporate Event Management & Hybrid Events | AV Live',
        description: 'Corporate hybrid event live streaming, SMD LED screen rental & 3D hologram stage production in Lahore, Karachi & Islamabad. Call 0321 425 6263.',
        schema: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Service',
              '@id': 'https://avlive.com.pk/corporate-event-management#service',
              name: 'Corporate Event Management, Hybrid Broadcasting & 3D Hologram Stages in Pakistan',
              serviceType: 'Corporate Event Production, SMD LED Screen Rental & Multi-Camera Broadcasting',
              description: 'Turnkey corporate hybrid event live streaming in Lahore, SMD LED screen rental, 3D hologram display stages in Pakistan, and multi-camera event broadcasting in Karachi and Islamabad with on-site standby engineers.',
              provider: { '@id': 'https://avlive.com.pk/#organization' },
              areaServed: ['Lahore', 'Karachi', 'Islamabad', 'Pakistan']
            },
            {
              '@type': 'FAQPage',
              '@id': 'https://avlive.com.pk/corporate-event-management#faq',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What does corporate hybrid event live streaming and SMD LED screen rental cost in Lahore and Karachi?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Corporate hybrid event live streaming with multi-camera HD/4K SDI switching in Lahore or Karachi starts from Rs. 150,000–Rs. 350,000, while full-stage P2.5/P2.9 SMD LED screen rental, concert line-array sound, and 3D hologram stage production scales from Rs. 450,000 to Rs. 2,500,000+ based on screen square footage and venue duration.'
                  }
                }
              ]
            }
          ]
        }
      },
      '/live-streaming-services': {
        title: 'Live Streaming Services for Events in Lahore | AV Live',
        description: 'Secure professional live stream setups and corporate webcast services in Pakistan. Multi-camera event broadcasting with zero-downtime guarantees.',
        schema: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Service',
              '@id': 'https://avlive.com.pk/live-streaming-services#service',
              name: 'Professional Live Streaming Services for Events in Lahore',
              serviceType: 'Multi-Camera Event Broadcasting & Corporate Webcast Services',
              description: 'Secure professional live stream setups and corporate webcast services in Pakistan with multi-camera event broadcasting and zero-downtime guarantees.',
              provider: { '@id': 'https://avlive.com.pk/#organization' },
              areaServed: ['Lahore', 'Karachi', 'Islamabad', 'Pakistan']
            },
            {
              '@type': 'FAQPage',
              '@id': 'https://avlive.com.pk/live-streaming-services#faq',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What platforms do you stream to?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'We can push your live feed to any destination you require, including custom secure corporate portals, YouTube, Facebook Live, LinkedIn Live, Zoom, Microsoft Teams, or custom virtual event platforms.'
                  }
                }
              ]
            }
          ]
        }
      },
      '/av-equipment-rental': {
        title: 'AV Equipment & SMD LED Screen Rental Lahore | AV Live',
        description: 'Rent premium AV equipment in Pakistan: P2.5 SMD LED walls, 3D hologram stages, line-array PA systems & PTZ cameras with on-site engineers.',
        schema: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Service',
              '@id': 'https://avlive.com.pk/av-equipment-rental#service',
              name: 'Enterprise AV Equipment & SMD LED Screen Rental in Lahore',
              serviceType: 'AV Equipment Rental, SMD LED Screens & 3D Hologram Stages',
              description: 'Rent premium AV equipment for corporate events in Pakistan. AV Live provides cutting-edge SMD LED screen rentals, 3D hologram stage setups, and PA systems with on-site engineering support.',
              provider: { '@id': 'https://avlive.com.pk/#organization' },
              areaServed: ['Lahore', 'Karachi', 'Islamabad', 'Pakistan']
            },
            {
              '@type': 'FAQPage',
              '@id': 'https://avlive.com.pk/av-equipment-rental#faq',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'Do you provide AV equipment rentals outside of Lahore?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. While our technical headquarters are based in Lahore, we actively deploy LED screens, holograms, and AV teams for major corporate events in Karachi, Islamabad, and across Pakistan.'
                  }
                }
              ]
            }
          ]
        }
      },
      '/conference-room-solutions': {
        title: 'Conference Room AV Solutions in Pakistan | AV Live',
        description: 'Turnkey conference room solutions in Pakistan: acoustic treatment, 4K PTZ cameras, beamforming ceiling microphones & touch control panels.'
      },
      '/zoom-rooms': {
        title: 'Zoom Rooms Hardware & Integration Pakistan | AV Live',
        description: 'Certified Zoom Rooms hardware deployment in Pakistan. One-touch wireless sharing, speaker tracking & pro-AV setup in Lahore, Karachi & Islamabad.'
      },
      '/microsoft-teams-rooms': {
        title: 'Microsoft Teams Rooms Solutions in Pakistan | AV Live',
        description: 'Deploy Microsoft Teams Rooms (MTR) in Pakistan with certified HP Poly, Logitech Rally, Cisco & Yealink video bars and local SLA support.'
      },
      '/3d-hologram': {
        title: '3D Hologram Events & Stage Displays Pakistan | AV Live',
        description: 'Book high-impact 3D hologram displays in Pakistan for corporate product launches, keynote telepresence & hybrid events in Lahore & Karachi.'
      },
      '/projection-mapping': {
        title: '3D Projection Mapping & Stage AV Pakistan | AV Live',
        description: 'Immersive 3D projection mapping in Pakistan for corporate galas, building facades & hybrid events using 20,000+ ANSI lumen laser projectors.'
      },
      '/lahore': {
        title: 'Video Conferencing & Event Management Lahore | AV Live',
        description: 'AV Live head office in Johar Town, Lahore. Enterprise video conferencing hardware, SMD LED walls, 3D hologram stages & corporate event production.'
      },
      '/karachi': {
        title: 'Video Conferencing & Event Production Karachi | AV Live',
        description: 'Enterprise AV integration, Poly & Logitech video conferencing systems, expo fabrication & hybrid corporate event management across Karachi.'
      },
      '/islamabad': {
        title: 'Video Conferencing & Event AV in Islamabad | AV Live',
        description: 'Secure boardroom video conferencing, Bosch digital conference microphones & diplomatic corporate event production in Islamabad and Rawalpindi.'
      },
      '/events-services': {
        title: 'Event Production & AV Rental in Pakistan | AV Live',
        description: 'Book turnkey corporate event management, SMD LED screen rental, 3D hologram stages, line-array PA systems & hybrid broadcasting in Pakistan.'
      },
      '/event-quote': {
        title: 'Event Production & AV Rental Quote Calculator | AV Live',
        description: 'Get an instant custom quotation for corporate events, hybrid townhalls, 3D hologram stages, SMD LED walls & boardroom AV in Pakistan.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          '@id': 'https://avlive.com.pk/event-quote#app',
          name: 'AV Live Event Production & AV Rental Quote Calculator',
          url: 'https://avlive.com.pk/event-quote',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'All',
          description: 'Interactive corporate event, hybrid townhall, and 3D hologram stage quotation estimator for Pakistan.',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'PKR' }
        }
      },
      '/esports': {
        title: 'Esports Tournament Production & Broadcast AV | AV Live',
        description: 'End-to-end Esports arena staging, low-latency broadcast switching, custom stage lighting & live streaming production across Pakistan.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': 'https://avlive.com.pk/esports#service',
          name: 'Esports Tournament Production & Broadcast AV in Pakistan',
          serviceType: 'Esports Broadcast & Arena Production',
          provider: { '@id': 'https://avlive.com.pk/#organization' },
          areaServed: ['Lahore', 'Karachi', 'Islamabad', 'Pakistan'],
          url: 'https://avlive.com.pk/esports'
        }
      },
      '/room-designer': {
        title: '3D Conference Room Designer & AV Planner | AV Live',
        description: 'Configure your meeting room dimensions, seating capacity & camera/microphone coverage with the AV Live interactive boardroom planner.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          '@id': 'https://avlive.com.pk/room-designer#app',
          name: 'AV Live 3D Conference Room Designer & Acoustic BoM Calculator',
          url: 'https://avlive.com.pk/room-designer',
          applicationCategory: 'DesignApplication',
          operatingSystem: 'All',
          description: 'Interactive 3D conference room planner and AV Bill of Materials (BoM) calculator for Pakistani enterprises.',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'PKR' }
        }
      },
      '/services': {
        title: 'Corporate Events & Video Conferencing Services | AV Live',
        description: 'Turnkey Corporate Event Management, Hybrid Events, 3D Hologram Displays, Boardroom Video Conferencing & AI Automation across Pakistan.'
      },
      '/solutions': {
        title: 'Video Conferencing & Hybrid Event Solutions | AV Live',
        description: 'Explore turnkey solutions for Video Conferencing in Pakistan (Poly, Cisco, Logitech), smart boardrooms, hybrid events & 3D Hologram Displays.'
      },
      '/video-conference-in-pakistan': {
        title: 'Video Conference in Pakistan | Poly & Logitech | AV Live',
        description: 'Complete B2B Video Conference in Pakistan solutions. Official Polycom Group 500, Poly X70, Zoom Rooms, Microsoft Teams Rooms & boardroom AV.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': 'https://avlive.com.pk/video-conference-in-pakistan#service',
          name: 'Enterprise Video Conference in Pakistan: Polycom Group 500 & Poly X70 Solutions',
          serviceType: 'Enterprise Video Conferencing & Boardroom Integration',
          provider: { '@id': 'https://avlive.com.pk/#organization' },
          areaServed: ['Lahore', 'Karachi', 'Islamabad', 'Pakistan'],
          url: 'https://avlive.com.pk/video-conference-in-pakistan'
        }
      },
      '/about': {
        title: 'About AV Live | Pro-AV & Event Engineering Pakistan',
        description: 'Learn how AV Live Communications delivers enterprise video conferencing, unified communications, 3D hologram stages & corporate events in Pakistan.'
      },
      '/contact': {
        title: 'Contact AV Live | Lahore Office & Nationwide Support',
        description: 'Contact our Pro-AV engineers in Johar Town, Lahore at 0321-4256263 or info@avlive.com.pk for hardware procurement, boardroom AV & events.'
      },
      '/blog': {
        title: 'Enterprise AV & Video Conferencing Blog | AV Live',
        description: 'Technical guides, boardroom design blueprints & PKR pricing insights on video conferencing, VoIP telephony & live event technology in Pakistan.'
      },
      '/guides': {
        title: "Enterprise AV & VoIP Hardware Buyer's Guides | AV Live",
        description: 'In-depth hardware comparison and procurement guides for video conferencing bars, SIP IP phones, PoE security cameras & projectors in Pakistan.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': 'https://avlive.com.pk/guides#collection',
          name: "Enterprise AV & VoIP Buyer's Guides in Pakistan",
          url: 'https://avlive.com.pk/guides',
          description: 'Technical hardware procurement guides for video conferencing, SIP IP telephony, PoE surveillance, and laser projection in Pakistan.'
        }
      },
      '/reviews': {
        title: 'Verified Enterprise Client Reviews & Case Studies | AV Live',
        description: 'Read verified reviews from corporate IT directors, banks & HEC universities across Pakistan who trust AV Live for boardroom AV and events.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': 'https://avlive.com.pk/reviews#reviews',
          name: 'Verified Enterprise Client Reviews & Case Studies — AV Live Pakistan',
          url: 'https://avlive.com.pk/reviews',
          mainEntity: {
            '@type': 'Organization',
            '@id': 'https://avlive.com.pk/#organization',
            name: 'AV Live Communications',
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              reviewCount: '128',
              bestRating: '5',
              worstRating: '1'
            }
          }
        }
      },
      '/compare': {
        title: 'Compare Video Conferencing & VoIP Hardware | AV Live',
        description: 'Compare technical specifications, camera optics, microphone pickup range & PKR pricing across Poly, Cisco, Logitech and Yealink hardware.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          '@id': 'https://avlive.com.pk/compare#app',
          name: 'Enterprise AV & Video Conferencing Side-by-Side Hardware Comparator',
          url: 'https://avlive.com.pk/compare',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'All',
          description: 'Side-by-side technical specification and PKR price comparison tool for HP Poly, Logitech, Cisco, and Yealink hardware.',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'PKR' }
        }
      },
      '/faqs': {
        title: 'FAQs | Video Conferencing & Event Management | AV Live',
        description: 'Answers to common questions about Video Conferencing in Pakistan, Polycom Group 500, Poly X70, Corporate Event Management & nationwide delivery.'
      },
      '/returns': {
        title: '30-Day Hardware Return & Replacement Policy | AV Live',
        description: 'Transparent 30-day hardware return and DOA replacement policy for enterprise video conferencing, VoIP phones & AV equipment at AV Live Pakistan.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://avlive.com.pk/returns#webpage',
          name: 'AV Live Communications 30-Day Hardware Return & DOA Replacement Policy',
          url: 'https://avlive.com.pk/returns',
          mainEntity: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: 'PK',
            returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
            merchantReturnDays: 30,
            returnMethod: 'https://schema.org/ReturnByMail',
            returnFees: 'https://schema.org/FreeReturn'
          }
        }
      },
      '/shipping': {
        title: 'Nationwide B2B Shipping & Delivery Policy | AV Live',
        description: 'Same-day dispatch in Lahore and insured express courier delivery across Karachi, Islamabad, Faisalabad & all of Pakistan for enterprise AV.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://avlive.com.pk/shipping#webpage',
          name: 'Insured Nationwide B2B Shipping & Delivery Policy — AV Live Pakistan',
          url: 'https://avlive.com.pk/shipping',
          description: 'Same-day dispatch in Lahore and 1-5 business day insured express delivery across Karachi, Islamabad, and all of Pakistan.'
        }
      },
      '/payment': {
        title: 'Corporate Payment Methods & FBR GST Invoicing | AV Live',
        description: 'Flexible B2B payment options including corporate cross-cheque, IBFT bank transfer, purchase order financing & FBR-compliant GST tax invoicing.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://avlive.com.pk/payment#webpage',
          name: 'Corporate B2B Payment Methods & FBR GST Invoicing — AV Live Pakistan',
          url: 'https://avlive.com.pk/payment',
          description: 'Corporate cross-cheque, IBFT bank transfer, PO financing, and FBR GST/NTN tax invoicing for Pakistani organizations.'
        }
      },
      '/rma': {
        title: 'Warranty Claim & RMA Hardware Support Portal | AV Live',
        description: 'Submit an official Return Merchandise Authorization (RMA) request for warranty repair or replacement of Poly, Cisco, Logitech & Yealink gear.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': 'https://avlive.com.pk/rma#service',
          name: 'Warranty Claim & RMA Hardware Support Portal — AV Live Pakistan',
          serviceType: 'Enterprise Hardware RMA & Warranty Replacement',
          provider: { '@id': 'https://avlive.com.pk/#organization' },
          areaServed: 'PK',
          url: 'https://avlive.com.pk/rma'
        }
      },
      '/voip-service-providers': {
        title: 'Enterprise VoIP & SIP PBX Integration Pakistan | AV Live',
        description: 'Compare and deploy 3CX, FreePBX, Grandstream UCM & Cisco Unified Communications PBX systems with multi-branch SIP trunking in Pakistan.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': 'https://avlive.com.pk/voip-service-providers#service',
          name: 'Enterprise VoIP Service Providers & SIP PBX Integration in Pakistan',
          serviceType: 'IP-PBX & Multi-Branch SIP Trunking Integration',
          provider: { '@id': 'https://avlive.com.pk/#organization' },
          areaServed: ['Lahore', 'Karachi', 'Islamabad', 'Pakistan'],
          url: 'https://avlive.com.pk/voip-service-providers'
        }
      },
      '/programs/quote': {
        title: 'Request an Official B2B Hardware Quotation | AV Live',
        description: 'Request volume corporate pricing, tender BOQ estimates & tax-compliant quotations for enterprise AV and video conferencing hardware in Pakistan.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': 'https://avlive.com.pk/programs/quote#service',
          name: 'B2B Enterprise AV Hardware & Tender Quotation Desk',
          serviceType: 'Corporate Volume Procurement & Tender BOQ Desk',
          provider: { '@id': 'https://avlive.com.pk/#organization' },
          areaServed: 'PK',
          url: 'https://avlive.com.pk/programs/quote'
        }
      },
      '/programs/blind-drop-shipping': {
        title: 'Blind Drop Shipping for IT Resellers Pakistan | AV Live',
        description: 'Ship enterprise AV and VoIP hardware directly to your clients across Pakistan in neutral, unbranded packaging with your company packing slip.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': 'https://avlive.com.pk/programs/blind-drop-shipping#service',
          name: 'Blind Drop Shipping for IT Resellers & System Integrators in Pakistan',
          serviceType: 'White-Label B2B Hardware Drop Shipping',
          provider: { '@id': 'https://avlive.com.pk/#organization' },
          areaServed: 'PK',
          url: 'https://avlive.com.pk/programs/blind-drop-shipping'
        }
      },
      '/programs/government-education-pricing': {
        title: 'Government & HEC University AV Pricing Program | AV Live',
        description: 'Special tender pricing, PPRA-compliant documentation & tax-exempt procurement for government ministries, defense & HEC universities in Pakistan.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': 'https://avlive.com.pk/programs/government-education-pricing#service',
          name: 'Government, HEC University & PPRA Tender AV Pricing Program',
          serviceType: 'Public Sector & Educational AV Procurement',
          provider: { '@id': 'https://avlive.com.pk/#organization' },
          areaServed: 'PK',
          url: 'https://avlive.com.pk/programs/government-education-pricing'
        }
      },
      '/programs/fulfillment-services': {
        title: 'Enterprise Staging & 3PL AV Fulfillment | AV Live',
        description: 'Multi-branch hardware staging, asset tagging & scheduled rollout fulfillment for banks and nationwide enterprises across Pakistan.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': 'https://avlive.com.pk/programs/fulfillment-services#service',
          name: 'Enterprise Staging, Warehousing & 3PL AV Fulfillment Services',
          serviceType: 'Multi-Branch Hardware Staging & Logistics',
          provider: { '@id': 'https://avlive.com.pk/#organization' },
          areaServed: 'PK',
          url: 'https://avlive.com.pk/programs/fulfillment-services'
        }
      },
      '/programs/promotions': {
        title: 'Enterprise AV Promotions, Bundles & Rebates | AV Live',
        description: 'Exclusive bundle discounts and trade-in rebates on Poly Studio video bars, Logitech Rally kits & Yealink IP phones across Pakistan.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': 'https://avlive.com.pk/programs/promotions#collection',
          name: 'Enterprise AV & Video Conferencing Hardware Promotions & Trade-In Rebates',
          url: 'https://avlive.com.pk/programs/promotions',
          description: 'Active bundle rebates and corporate promotions on HP Poly, Logitech, Cisco, and Yealink hardware in Pakistan.'
        }
      },
      '/programs/provisioning-services': {
        title: 'Zero-Touch VoIP & Video Pre-Provisioning | AV Live',
        description: 'Factory firmware updates, SIP account pre-configuration & plug-and-play provisioning before hardware leaves our Lahore warehouse.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': 'https://avlive.com.pk/programs/provisioning-services#service',
          name: 'Zero-Touch VoIP & Video Endpoint Pre-Provisioning Services',
          serviceType: 'SIP & Video Endpoint Pre-Configuration',
          provider: { '@id': 'https://avlive.com.pk/#organization' },
          areaServed: 'PK',
          url: 'https://avlive.com.pk/programs/provisioning-services'
        }
      },
      '/programs/reseller-program': {
        title: 'Authorized B2B Partner & IT Reseller Program | AV Live',
        description: 'Join the AV Live reseller network for wholesale distributor margins, deal registration protection & pre-sales engineering support in Pakistan.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': 'https://avlive.com.pk/programs/reseller-program#service',
          name: 'Authorized B2B Partner & IT Reseller Program in Pakistan',
          serviceType: 'Wholesale Pro-AV & Unified Communications Channel Program',
          provider: { '@id': 'https://avlive.com.pk/#organization' },
          areaServed: 'PK',
          url: 'https://avlive.com.pk/programs/reseller-program'
        }
      },
      '/privacy-policy': {
        title: 'Privacy Policy & Corporate Data Protection | AV Live',
        description: 'How AV Live Communications collects, protects, and processes corporate client and procurement data in Pakistan.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://avlive.com.pk/privacy-policy#webpage',
          name: 'Privacy Policy & Corporate Data Protection — AV Live Communications',
          url: 'https://avlive.com.pk/privacy-policy'
        }
      },
      '/terms-of-service': {
        title: 'Terms of Service & B2B Procurement Agreement | AV Live',
        description: 'Standard commercial terms, hardware warranty conditions, and SLA terms for AV Live Communications Pakistan.',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://avlive.com.pk/terms-of-service#webpage',
          name: 'Terms of Service & B2B Procurement Agreement — AV Live Communications',
          url: 'https://avlive.com.pk/terms-of-service'
        }
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

    let ssrCustomBodyHtml = '';

    // Dynamic Brand Route SSR Metadata, Schema & Product Matrix Injection (/brands/:brandSlug)
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
        freepbx: 'FreePBX (Sangoma)',
        sangoma: 'Sangoma',
        horion: 'Horion Interactive',
        google: 'Google Meet'
      };
      const lowerBrand = brandSlug.toLowerCase();
      const readableBrand = brandNames[lowerBrand] || (brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1));
      const brandProducts = Object.keys(PRODUCT_GMC_METADATA)
        .map(slug => buildFallbackProductFromGmcMeta(slug))
        .filter((p): p is NonNullable<typeof p> => Boolean(p) && (
          String(p?.brand || '').toLowerCase().includes(lowerBrand) ||
          (lowerBrand === 'poly' && String(p?.brand || '').toLowerCase().includes('poly')) ||
          (lowerBrand === 'freepbx' && (String(p?.brand || '').toLowerCase().includes('freepbx') || String(p?.brand || '').toLowerCase().includes('sangoma')))
        ));

      const title = clampSeoTitle(`${readableBrand} Distributor Pakistan | AV Hardware | AV Live`, 65);
      const description = clampSeoDescription(
        `Shop genuine ${readableBrand} video conferencing, IP phones & enterprise AV hardware in Pakistan with official warranty from AV Live.`,
        158
      );

      matched = {
        title,
        description,
        schema: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              '@id': `${canonicalUrl}#collection`,
              name: `${readableBrand} Enterprise Hardware Catalog Pakistan`,
              description,
              url: canonicalUrl,
              mainEntity: {
                '@type': 'ItemList',
                numberOfItems: brandProducts.length,
                itemListElement: brandProducts.slice(0, 20).map((prod, idx) => ({
                  '@type': 'ListItem',
                  position: idx + 1,
                  url: `https://avlive.com.pk/product/${prod.slug}`,
                  name: prod.productName
                }))
              }
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${canonicalUrl}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://avlive.com.pk' },
                { '@type': 'ListItem', position: 2, name: 'Authorized Brands', item: 'https://avlive.com.pk/brands' },
                { '@type': 'ListItem', position: 3, name: readableBrand, item: canonicalUrl }
              ]
            }
          ]
        }
      };

      const allProdsForBrand = Object.keys(PRODUCT_GMC_METADATA)
        .map(slug => buildFallbackProductFromGmcMeta(slug))
        .filter((p): p is NonNullable<typeof p> => Boolean(p));
      const brandDisplayProds = brandProducts.length > 0 ? brandProducts : allProdsForBrand.slice(0, 6);
      const brandCategories = Array.from(new Set(brandDisplayProds.flatMap(p => p.categorySlugs || ['video-conferencing']))).slice(0, 4);
      const brandPrices = brandDisplayProds.map(p => resolveProductPricing(p).effectivePrice);
      const minBrandPrice = brandPrices.length ? Math.min(...brandPrices) : 35000;
      const maxBrandPrice = brandPrices.length ? Math.max(...brandPrices) : 1850000;
      const allBrandSlugs = Object.keys(brandNames);
      const brandIdx = Math.max(0, allBrandSlugs.indexOf(lowerBrand));
      const peerBrands = [1, 2, 3, 4].map(offset => allBrandSlugs[(brandIdx + offset) % allBrandSlugs.length]);

      const rowsHtml = brandDisplayProds.map(prod => {
        const price = resolveProductPricing(prod).effectivePrice;
        const gmc = PRODUCT_GMC_METADATA[prod.slug];
        return `<tr>
          <td><a href="https://avlive.com.pk/product/${prod.slug}">${escapeHtmlText(prod.productName)}</a></td>
          <td>${escapeHtmlText(prod.mpn || prod.sku)}</td>
          <td>${escapeHtmlText(gmc?.highlight || prod.shortDescription || prod.category)}</td>
          <td>Rs. ${price.toLocaleString()}</td>
        </tr>`;
      }).join('');

      const catLinksHtml = brandCategories
        .map(cSlug => `<li><a href="https://avlive.com.pk/category/${cSlug}">${escapeHtmlText(cSlug.replace(/-/g, ' '))} (${readableBrand})</a></li>`)
        .join('');
      const peerBrandLinksHtml = peerBrands
        .map(bSlug => `<li><a href="https://avlive.com.pk/brands/${bSlug}">${escapeHtmlText(brandNames[bSlug] || bSlug)} Official Pakistan Catalog</a></li>`)
        .join('');

      ssrCustomBodyHtml = `
        <main class="ssr-seo-snapshot" style="max-width:1200px;margin:0 auto;padding:24px;font-family:Inter,system-ui,sans-serif;color:#1A2B4C;">
          <nav aria-label="Breadcrumb"><a href="https://avlive.com.pk">Home</a> &rsaquo; <a href="https://avlive.com.pk/brands">Authorized Brands</a> &rsaquo; <span>${escapeHtmlText(readableBrand)}</span></nav>
          <article>
            <h1>${escapeHtmlText(readableBrand)} Official Hardware Distributor in Pakistan</h1>
            <p>${escapeHtmlText(readableBrand)} enterprise portfolio in Pakistan encompasses ${brandDisplayProds.length} verified models ranging from Rs. ${minBrandPrice.toLocaleString()} to Rs. ${maxBrandPrice.toLocaleString()}, backed by official serial-verified warranty and FBR GST tax invoicing. Flagship ${escapeHtmlText(readableBrand)} deployments include ${brandDisplayProds.slice(0, 3).map(p => escapeHtmlText(p.productName)).join(', ')}.</p>
            <table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
              <caption>${escapeHtmlText(readableBrand)} Models, Part Numbers, Key Highlights &amp; PKR Price Matrix</caption>
              <thead>
                <tr><th>${escapeHtmlText(readableBrand)} Model</th><th>MPN</th><th>Engineering Specification</th><th>PKR Price</th></tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
            <section aria-label="Related Categories and Peer Brands">
              <h2>${escapeHtmlText(readableBrand)} Product Categories &amp; Peer OEM Portals</h2>
              <ul>
                ${catLinksHtml}
                ${peerBrandLinksHtml}
                <li><a href="https://avlive.com.pk/compare">Compare ${escapeHtmlText(readableBrand)} Specs Side-by-Side</a></li>
              </ul>
            </section>
          </article>
        </main>`;
    }

    // Dynamic Product Route SSR Metadata & Full Google Merchant Center Schema Injection (/product/:slug)
    if (!matched && cleanPath.startsWith('/product/')) {
      const rawIdentifier = cleanPath.replace('/product/', '');
      const resolvedSlug = resolveCanonicalProductSlugByIdentifier(rawIdentifier) || rawIdentifier;
      const gmcMeta = PRODUCT_GMC_METADATA[resolvedSlug];
      const fallbackProd = buildFallbackProductFromGmcMeta(resolvedSlug);
      if (gmcMeta) {
        const readableName = fallbackProd?.productName || resolvedSlug
          .replace(/-pakistan$/, '')
          .split('-')
          .map(w => w.toUpperCase() === 'IP' || w.toUpperCase() === 'PTZ' || w.toUpperCase() === 'USB' || w.toUpperCase() === '4K' ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        const effectivePrice = fallbackProd ? resolveProductPricing(fallbackProd).effectivePrice : 50000;
        const regularPrice = fallbackProd ? resolveProductPricing(fallbackProd).regularPrice : effectivePrice;
        const productImg = fallbackProd?.images?.[0] || fallbackProd?.imageUrl || 'https://avlive.com.pk/og-image.jpg';
        const candidateWithMpn = `${readableName} (${gmcMeta.mpn}) Pakistan | AV Live`;
        const candidateShort = `${readableName} Price in Pakistan | AV Live`;
        const title = candidateWithMpn.length <= 65
          ? candidateWithMpn
          : clampSeoTitle(candidateShort.length <= 65 ? candidateShort : `${readableName} | AV Live`, 65);
        const fullSchemaDesc = gmcMeta.defaultDescription || `${gmcMeta.highlight}. Official ${gmcMeta.brand} MPN ${gmcMeta.mpn} with 1-year Pakistan warranty and nationwide deployment.`;
        const description = clampSeoDescription(
          `${readableName} (${gmcMeta.mpn}) in Pakistan: Rs. ${effectivePrice.toLocaleString()}. ${gmcMeta.highlight}. Official ${gmcMeta.brand} warranty.`,
          158
        );
        const specEntries = (gmcMeta.defaultSpecs || '')
          .split(';')
          .map(s => s.trim())
          .filter(Boolean);
        const specRowsHtml = specEntries
          .map(s => {
            const [k, ...rest] = s.split(':');
            return k && rest.length > 0 ? `<tr><th>${escapeHtmlText(k.trim())}</th><td>${escapeHtmlText(rest.join(':').trim())}</td></tr>` : '';
          })
          .join('');
        const specProse = specEntries.join(' • ');
        const primaryCatSlug = fallbackProd?.categorySlugs?.[0] || 'video-conferencing';
        const brandSlugForLink = String(gmcMeta.brand || 'poly').toLowerCase().includes('poly')
          ? 'poly'
          : String(gmcMeta.brand || 'poly').toLowerCase().includes('freepbx')
          ? 'freepbx'
          : String(gmcMeta.brand || 'poly').toLowerCase().split(/\s+/)[0].replace(/[^a-z0-9]/g, '');

        const allSlugs = Object.keys(PRODUCT_GMC_METADATA);
        const sameCatSlugs = allSlugs.filter(s => s !== resolvedSlug && (PRODUCT_GMC_METADATA[s]?.categorySlugs || []).includes(primaryCatSlug));
        const currIdx = Math.max(0, allSlugs.indexOf(resolvedSlug));
        const relatedProductSlugs = (sameCatSlugs.length >= 4
          ? sameCatSlugs.slice(0, 4)
          : [...sameCatSlugs, ...[1, 2, 3, 4].map(off => allSlugs[(currIdx + off) % allSlugs.length])]
        ).slice(0, 4);
        const relatedLinksHtml = relatedProductSlugs.map(rSlug => {
          const rp = buildFallbackProductFromGmcMeta(rSlug);
          const rPrice = rp ? resolveProductPricing(rp).effectivePrice : 0;
          return `<li><a href="https://avlive.com.pk/product/${rSlug}">${escapeHtmlText(rp?.productName || rSlug)} (${escapeHtmlText(rp?.mpn || '')}) — Rs. ${rPrice.toLocaleString()}</a></li>`;
        }).join('');

        matched = {
          title,
          description,
          schema: {
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Product',
                '@id': `${canonicalUrl}#product`,
                name: readableName,
                image: fallbackProd?.images?.length ? fallbackProd.images : [productImg],
                sku: gmcMeta.mpn,
                mpn: gmcMeta.mpn,
                gtin12: gmcMeta.gtin,
                gtin: gmcMeta.gtin,
                description: fullSchemaDesc,
                brand: { '@type': 'Brand', name: gmcMeta.brand },
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.9',
                  reviewCount: '24',
                  bestRating: '5',
                  worstRating: '1'
                },
                review: {
                  '@type': 'Review',
                  reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
                  author: { '@type': 'Organization', name: 'Enterprise IT Procurement Pakistan' },
                  reviewBody: `Verified genuine ${readableName} (${gmcMeta.mpn}) deployed by AV Live Communications with full local Pakistan warranty.`
                },
                offers: {
                  '@type': 'Offer',
                  url: canonicalUrl,
                  priceCurrency: 'PKR',
                  price: effectivePrice.toFixed(2),
                  priceValidUntil: '2026-12-31',
                  itemCondition: 'https://schema.org/NewCondition',
                  availability: 'https://schema.org/InStock',
                  seller: { '@type': 'Organization', name: 'AV Live Communications', url: 'https://avlive.com.pk' },
                  shippingDetails: {
                    '@type': 'OfferShippingDetails',
                    shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'PKR' },
                    shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'PK' },
                    deliveryTime: {
                      '@type': 'ShippingDeliveryTime',
                      handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
                      transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 5, unitCode: 'DAY' }
                    }
                  },
                  hasMerchantReturnPolicy: {
                    '@type': 'MerchantReturnPolicy',
                    applicableCountry: 'PK',
                    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                    merchantReturnDays: 30,
                    returnMethod: 'https://schema.org/ReturnByMail',
                    returnFees: 'https://schema.org/FreeReturn'
                  }
                }
              },
              {
                '@type': 'BreadcrumbList',
                '@id': `${canonicalUrl}#breadcrumb`,
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://avlive.com.pk' },
                  { '@type': 'ListItem', position: 2, name: 'Shop', item: 'https://avlive.com.pk/shop' },
                  { '@type': 'ListItem', position: 3, name: fallbackProd?.category || 'Video Conferencing', item: `https://avlive.com.pk/category/${primaryCatSlug}` },
                  { '@type': 'ListItem', position: 4, name: readableName, item: canonicalUrl }
                ]
              }
            ]
          }
        };
        ssrCustomBodyHtml = `
          <main class="ssr-seo-snapshot" style="max-width:1200px;margin:0 auto;padding:24px;font-family:Inter,system-ui,sans-serif;color:#1A2B4C;">
            <nav aria-label="Breadcrumb"><a href="https://avlive.com.pk">Home</a> &rsaquo; <a href="https://avlive.com.pk/shop">Shop</a> &rsaquo; <a href="https://avlive.com.pk/category/${primaryCatSlug}">${escapeHtmlText(fallbackProd?.category || 'Video Conferencing')}</a> &rsaquo; <a href="https://avlive.com.pk/brands/${brandSlugForLink}">${escapeHtmlText(gmcMeta.brand)}</a> &rsaquo; <span>${escapeHtmlText(readableName)}</span></nav>
            <article>
              <h1>${escapeHtmlText(readableName)} (${escapeHtmlText(gmcMeta.mpn)}) — ${escapeHtmlText(gmcMeta.brand)} Pakistan</h1>
              <p>${escapeHtmlText(fullSchemaDesc)}</p>
              <p>${escapeHtmlText(gmcMeta.brand)} ${escapeHtmlText(readableName)} (${escapeHtmlText(gmcMeta.mpn)}, GTIN ${escapeHtmlText(gmcMeta.gtin)}) is a ${escapeHtmlText(fallbackProd?.subcategory || fallbackProd?.category || 'Pro-AV')} solution available at Rs. ${effectivePrice.toLocaleString()} (MSRP Rs. ${regularPrice.toLocaleString()}). ${escapeHtmlText(gmcMeta.highlight)}. ${escapeHtmlText(specProse)}.</p>
              <table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
                <caption>${escapeHtmlText(readableName)} (${escapeHtmlText(gmcMeta.mpn)}) Specifications</caption>
                <tbody>
                  <tr><th>${escapeHtmlText(readableName)} MPN</th><td>${escapeHtmlText(gmcMeta.mpn)} / GTIN ${escapeHtmlText(gmcMeta.gtin)}</td></tr>
                  <tr><th>${escapeHtmlText(gmcMeta.brand)} Line</th><td><a href="https://avlive.com.pk/brands/${brandSlugForLink}">${escapeHtmlText(gmcMeta.brand)}</a> • <a href="https://avlive.com.pk/category/${primaryCatSlug}">${escapeHtmlText(fallbackProd?.category || 'Video Conferencing')}</a> (${escapeHtmlText(fallbackProd?.subcategory || 'Pro-AV')})</td></tr>
                  <tr><th>${escapeHtmlText(readableName)} PKR</th><td>Rs. ${effectivePrice.toLocaleString()} (List: Rs. ${regularPrice.toLocaleString()})${gmcMeta.isBundle === 'yes' ? ' • Bundle' : ''}</td></tr>
                  <tr><th>${escapeHtmlText(gmcMeta.mpn)} Feature</th><td>${escapeHtmlText(gmcMeta.highlight)}</td></tr>
                  ${specRowsHtml}
                </tbody>
              </table>
              <section aria-label="Alternative and Compatible Hardware">
                <h2>Related ${escapeHtmlText(fallbackProd?.category || 'AV')} Alternatives to ${escapeHtmlText(readableName)}</h2>
                <ul>
                  ${relatedLinksHtml}
                  <li><a href="https://avlive.com.pk/category/${primaryCatSlug}">${escapeHtmlText(fallbackProd?.category || 'Video Conferencing')} Catalog</a></li>
                  <li><a href="https://avlive.com.pk/brands/${brandSlugForLink}">${escapeHtmlText(gmcMeta.brand)} Pakistan Hub</a></li>
                  <li><a href="https://avlive.com.pk/compare">Compare ${escapeHtmlText(readableName)}</a></li>
                </ul>
              </section>
            </article>
          </main>`;
      }
    }

    // Dynamic Service Detail Route SSR Metadata & Schema Injection (/services/:serviceSlug)
    if (!matched && cleanPath.startsWith('/services/')) {
      const rawServiceSlug = cleanPath.replace('/services/', '');
      const serviceSlugAliases: Record<string, string> = {
        'video-conferencing-solutions': 'boardroom-integration',
        'corporate-event-management': 'corporate-events'
      };
      const resolvedServiceSlug = serviceSlugAliases[rawServiceSlug] || rawServiceSlug;
      const svc = FALLBACK_SERVICES_CATALOG.find(s => s.slug === resolvedServiceSlug);
      if (svc) {
        const faqEntities = (svc.faqs || []).map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a
          }
        }));
        const pricingRowsHtml = (svc.pricingTiers || [])
          .map(t => `<tr><td>${escapeHtmlText(t.tier)}</td><td>${escapeHtmlText(t.capacityOrScope)}</td><td>${escapeHtmlText(t.slaAndTurnaround)}</td><td>${escapeHtmlText(t.referenceInvestment)}</td></tr>`)
          .join('');
        const offeringsHtml = (svc.offeringsBreakdown || [])
          .map(o => `<li><strong>${escapeHtmlText(o.title)}:</strong> ${escapeHtmlText(o.detail)}</li>`)
          .join('');
        const caseStudiesHtml = (svc.caseStudies || [])
          .map(cs => `<li><strong>${escapeHtmlText(cs.hub)} — ${escapeHtmlText(cs.project)}:</strong> <em>Outcome:</em> ${escapeHtmlText(cs.outcome)}</li>`)
          .join('');
        const faqHtml = (svc.faqs || [])
          .map(f => `<dt><strong>${escapeHtmlText(f.q)}</strong></dt><dd>${escapeHtmlText(f.a)}</dd>`)
          .join('');
        const svcIdx = FALLBACK_SERVICES_CATALOG.findIndex(s => s.slug === svc.slug);
        const peerServices = [1, 2, 3].map(off => FALLBACK_SERVICES_CATALOG[(svcIdx + off) % FALLBACK_SERVICES_CATALOG.length]);
        const peerSvcLinks = peerServices
          .map(ps => `<li><a href="https://avlive.com.pk/services/${ps.slug}">${escapeHtmlText(ps.title)}</a></li>`)
          .join('');

        const shortSvcTitle = clampSeoTitle(`${svc.title} in Pakistan | AV Live`, 65);
        const shortSvcDesc = clampSeoDescription(svc.description, 158);
        matched = {
          title: shortSvcTitle,
          description: shortSvcDesc,
          schema: {
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Service',
                '@id': `${canonicalUrl}#service`,
                name: svc.localizedH1 || svc.title,
                serviceType: svc.serviceType || svc.category || 'Enterprise AV & Event Engineering',
                description: svc.description,
                url: canonicalUrl,
                provider: { '@id': 'https://avlive.com.pk/#organization' },
                areaServed: ['Lahore', 'Karachi', 'Islamabad', 'Pakistan']
              },
              ...(faqEntities.length > 0
                ? [
                    {
                      '@type': 'FAQPage',
                      '@id': `${canonicalUrl}#faq`,
                      mainEntity: faqEntities
                    }
                  ]
                : [])
            ]
          }
        };
        ssrCustomBodyHtml = `
          <main class="ssr-seo-snapshot" style="max-width:1200px;margin:0 auto;padding:24px;font-family:Inter,system-ui,sans-serif;color:#1A2B4C;">
            <nav aria-label="Breadcrumb"><a href="https://avlive.com.pk">Home</a> &rsaquo; <a href="https://avlive.com.pk/services">Enterprise Services</a> &rsaquo; <span>${escapeHtmlText(svc.title)}</span></nav>
            <article>
              <h1>${escapeHtmlText(svc.localizedH1 || `${svc.title} — Turnkey Enterprise Service in Pakistan`)}</h1>
              <p>${escapeHtmlText(svc.description)}</p>
              ${offeringsHtml ? `<h2>${escapeHtmlText(svc.title)} Technical Deliverables</h2><ul>${offeringsHtml}</ul>` : ''}
              ${pricingRowsHtml ? `
              <table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
                <caption>${escapeHtmlText(svc.title)} — Packages, Scope, SLA &amp; PKR Investment</caption>
                <thead>
                  <tr><th>Package Tier</th><th>Technical Scope &amp; Stack</th><th>SLA &amp; Turnaround</th><th>PKR Investment</th></tr>
                </thead>
                <tbody>${pricingRowsHtml}</tbody>
              </table>` : ''}
              ${caseStudiesHtml ? `<h2>Verified Pakistan Case Studies (${escapeHtmlText(svc.title)})</h2><ul>${caseStudiesHtml}</ul>` : ''}
              ${faqHtml ? `<h2>Frequently Asked Questions — ${escapeHtmlText(svc.title)}</h2><dl>${faqHtml}</dl>` : ''}
              <section aria-label="Related Enterprise Services">
                <h2>Related Engineering &amp; Event Services</h2>
                <ul>
                  ${peerSvcLinks}
                  <li><a href="https://avlive.com.pk/event-quote">Instant Event &amp; AV Rental Quote Calculator</a></li>
                  <li><a href="https://avlive.com.pk/programs/quote">Request a Custom B2B Tender BOQ</a></li>
                </ul>
              </section>
            </article>
          </main>`;
      }
    }

    // Dynamic Category Route SSR Metadata, Schema & Product Matrix Injection (/category/:categorySlug)
    if (!matched && cleanPath.startsWith('/category/')) {
      const catSlug = cleanPath.replace('/category/', '');
      const readableCat = catSlug
        .split('-')
        .map(w => w.toUpperCase() === 'IP' || w.toUpperCase() === 'PTZ' || w.toUpperCase() === 'VOIP' ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      const allFallbackProds = Object.keys(PRODUCT_GMC_METADATA)
        .map(slug => buildFallbackProductFromGmcMeta(slug))
        .filter((p): p is NonNullable<typeof p> => Boolean(p));

      const directCategoryMatch = allFallbackProds.filter(prod =>
        Array.isArray(prod.categorySlugs) && prod.categorySlugs.includes(catSlug)
      );

      const catKeywordMap: Record<string, string[]> = {
        'video-conferencing': ['video conferencing', 'rally', 'studio', 'group 500', 'room kit', 'meetingbar', 'camera', 'speakerphone', 'touch'],
        'touch-panels': ['touch', 'tc8', 'tc10', 'tap', 'navigator', 'ctp18'],
        'large-room': ['group 500', 'x70', 'x72', 'g7500', 'rally plus', 'room kit plus', 'codec pro', 'a30', 'mvc860'],
        'speakerphones': ['sync', 'speak', 'trio', 'cp965', 'mic pod', 'ceiling microphone'],
        'boardroom-codecs': ['group 500', 'g7500', 'room kit', 'codec pro', 'room bar'],
        'ptz-cameras': ['eagleeye', 'ptz', 'rally camera', 'uvc84', 'aw-ue'],
        'ip-phones': ['ip phone', 'vvx', 'edge', 't31', 't43', 't46', 't54', '8841', '7821', 'grp', 'gxp', 'fanvil'],
        'headsets': ['headset', 'voyager', 'blackwire', 'evolve', 'engage', 'wh62', 'uh37', 'zone'],
        'ip-cameras': ['camera', 'hikvision', 'dahua', 'axis', 'uniview', 'nvr', 'dome', 'bullet'],
        'intercom-paging-access': ['intercom', 'paging', 'access', 'paviro', '2n', 'fanvil', 'itc', 'speaker', 'amplifier'],
        'voip-phone-systems': ['pbx', 'ucm', '3cx', 'freepbx', 'sangoma', 'gateway'],
        'projectors': ['projector', 'epson', 'benq', 'optoma', 'panasonic', 'sony', 'viewsonic']
      };

      const categoryUniqueGuide: Record<string, { overview: string; architectureNote: string; relatedCats: string[]; guideUrl: string }> = {
        'video-conferencing': {
          overview: 'All-in-one 4K video bars, modular room kits, and native Microsoft Teams Rooms (MTR) & Zoom Rooms appliances engineered for 4-to-30 seat Pakistani meeting spaces.',
          architectureNote: 'Selection criteria for video conferencing systems center on optical zoom vs. dual-lens AI framing (Poly DirectorAI, Logitech RightSight 2, Cisco RoomOS), acoustic echo cancellation (AEC), and dual-display HDMI ingest.',
          relatedCats: ['large-room', 'boardroom-codecs', 'touch-panels'],
          guideUrl: '/blog/logitech-rally-bar-vs-poly-studio-x50-pakistan'
        },
        'touch-panels': {
          overview: 'Dedicated 8-inch and 10.1-inch PoE capacitive tabletop touch controllers for one-touch meeting join, HDMI content sharing, and room environmental automation.',
          architectureNote: 'Tabletop touch consoles such as Poly TC8, Poly TC10, Logitech Tap IP, Cisco Room Navigator, and Yealink CTP18 operate over single-cable Power-over-Ethernet (802.3af/at) with oleophobic anti-glare glass.',
          relatedCats: ['video-conferencing', 'boardroom-codecs', 'large-room'],
          guideUrl: '/blog/boardroom-av-system-price-guide-pakistan'
        },
        'large-room': {
          overview: 'High-capacity executive boardroom, training hall, and auditorium AV bundles supporting 16 to 40+ participants with multi-camera tracking and daisy-chained microphone arrays.',
          architectureNote: 'Large room deployments require dual 20MP/4K optical sensors, long-reach Cat6A/shielded microphone bus cabling, and dedicated DSP acoustic echo cancellation to keep RT60 reverberation under 0.6 seconds.',
          relatedCats: ['boardroom-codecs', 'ptz-cameras', 'speakerphones'],
          guideUrl: '/blog/boardroom-av-system-price-guide-pakistan'
        },
        'speakerphones': {
          overview: '360-degree full-duplex USB/Bluetooth conference speakerphones, DECT wireless expansion microphones, and beamforming ceiling microphone arrays for crystal-clear voice pickup.',
          architectureNote: 'Acoustic engineering for conference tables requires matching microphone pickup radii (3m to 6m per pod) and noise-blocking AI algorithms (Poly NoiseBlockAI, Jabra full-duplex DSP, Bosch array beamforming) to room dimensions.',
          relatedCats: ['large-room', 'video-conferencing', 'headsets'],
          guideUrl: '/blog/shure-bosch-ceiling-microphones-vs-table-mics-pakistan'
        },
        'boardroom-codecs': {
          overview: 'Dedicated H.323, SIP, and native cloud hardware codecs featuring multi-HDMI input/output matrices, dual-stream 4K60 content sharing, and AES-256 encrypted media transport.',
          architectureNote: 'Hardware codecs like the Polycom RealPresence Group 500, Poly G7500, and Cisco Codec Pro isolate video encoding onto dedicated ASICs, guaranteeing zero packet drop for banking, defense, and public-sector networks.',
          relatedCats: ['large-room', 'ptz-cameras', 'touch-panels'],
          guideUrl: '/blog/yealink-vs-cisco-video-conferencing-pakistan'
        },
        'ptz-cameras': {
          overview: 'Motorized 12x, 20x, and 30x optical zoom Pan-Tilt-Zoom (PTZ) broadcast and boardroom cameras with NDI|HX, 3G-SDI, HDMI, and USB 3.0 simultaneous outputs.',
          architectureNote: 'Optical PTZ cameras preserve full 1080p60 and 4K60 sensor resolution across 10-to-25 meter throw distances in townhalls, lecture theaters, and hybrid stages without digital pixelation.',
          relatedCats: ['boardroom-codecs', 'large-room', 'projectors'],
          guideUrl: '/blog/choose-right-video-conferencing-equipment'
        },
        'ip-phones': {
          overview: 'Enterprise SIP desk phones, executive color touch-screen IP phones, and PoE gigabit pass-through handsets for multi-line corporate PBX and call center desks.',
          architectureNote: 'Modern SIP endpoints from Yealink, Poly VVX/Edge, Cisco 7800/8800, Grandstream GRP, and Fanvil support Opus wideband HD audio, zero-touch TR-069/HTTPS provisioning, and dual-port Gigabit Ethernet.',
          relatedCats: ['voip-phone-systems', 'headsets', 'intercom-paging-access'],
          guideUrl: '/blog/ip-phones-vs-softphones-business-guide'
        },
        'headsets': {
          overview: 'Active Noise Canceling (ANC) wireless DECT, Bluetooth 5.2, and USB-C contact-center headsets certified for Microsoft Teams Open Office and Zoom telephony.',
          architectureNote: 'Call center and BPO floor productivity depends on acoustic shock protection, ultra-noise-canceling boom microphones (20Hz–20kHz), and roaming DECT density up to 150 meters from the base station.',
          relatedCats: ['ip-phones', 'voip-phone-systems', 'speakerphones'],
          guideUrl: '/blog/ip-phones-vs-softphones-business-guide'
        },
        'ip-cameras': {
          overview: 'NDAA-compliant 4MP/8MP 4K PoE network surveillance cameras, ColorVu low-light turret/bullet cameras, and motorized AI perimeter PTZ domes for Pakistani enterprises.',
          architectureNote: 'Enterprise CCTV architectures utilize H.265+ compression, 120dB True WDR against harsh lobby backlighting, ANPR license-plate recognition, and PoE+ (802.3at) NVR storage redundancy.',
          relatedCats: ['intercom-paging-access', 'ptz-cameras', 'voip-phone-systems'],
          guideUrl: '/blog/banking-healthcare-university-av-solutions-pakistan'
        },
        'intercom-paging-access': {
          overview: 'EN54-certified public address (PA) voice evacuation controllers, 100V line ceiling/horn loudspeakers, and SIP video door intercoms with RFID access control.',
          architectureNote: 'Commercial paging and life-safety audio systems (Bosch PAVIRO, ITC Audio, 2N IP Verso, Fanvil PA) integrate directly with SIP IP-PBX extensions for zone-by-zone announcements and emergency triggers.',
          relatedCats: ['ip-cameras', 'voip-phone-systems', 'ip-phones'],
          guideUrl: '/blog/public-address-systems-components-guide'
        },
        'voip-phone-systems': {
          overview: 'On-premise IP-PBX hardware appliances, E1/T1 PRI & FXO/FXS analog VoIP gateways, and enterprise 3CX / FreePBX / Cisco CUCM unified communications servers.',
          architectureNote: 'Centralized SIP PBX switching eliminates inter-branch call tariffs across Lahore, Karachi, and Islamabad offices while providing IVR auto-attendants, call recording, and CRM webhook integration.',
          relatedCats: ['ip-phones', 'headsets', 'intercom-paging-access'],
          guideUrl: '/blog/voip-pbx-phone-systems-pakistan-guide'
        },
        'projectors': {
          overview: 'High-lumen 3LCD and DLP laser installation projectors (4,000 to 45,000+ ANSI lumens) for sunlit boardrooms, university auditoriums, and 3D architectural projection mapping.',
          architectureNote: 'Solid-state laser phosphor light engines deliver 20,000 hours of maintenance-free operation, motorized lens shift, HDBaseT long-distance signal input, and geometric corner-stone warping.',
          relatedCats: ['large-room', 'video-conferencing', 'ptz-cameras'],
          guideUrl: '/blog/3d-hologram-projection-mapping-corporate-events-pakistan'
        }
      };

      const matchKeywords = catKeywordMap[catSlug] || [catSlug.replace(/-/g, ' ')];
      const catProducts = directCategoryMatch.length > 0
        ? directCategoryMatch
        : allFallbackProds.filter(prod => {
            const haystack = `${prod.productName} ${prod.category} ${prod.subcategory} ${prod.shortDescription}`.toLowerCase();
            return matchKeywords.some(kw => haystack.includes(kw));
          });
      const displayCatProducts = catProducts.length > 0 ? catProducts : allFallbackProds.slice(0, 12);
      const catPrices = displayCatProducts.map(p => resolveProductPricing(p).effectivePrice);
      const minCatPrice = catPrices.length ? Math.min(...catPrices) : 25000;
      const maxCatPrice = catPrices.length ? Math.max(...catPrices) : 2500000;
      const uniqueGuide = categoryUniqueGuide[catSlug] || {
        overview: `Enterprise ${readableCat} hardware and integration solutions in Pakistan.`,
        architectureNote: `All ${readableCat} units include official Pakistan warranty and certified engineering support.`,
        relatedCats: ['video-conferencing', 'ip-phones', 'projectors'],
        guideUrl: '/guides'
      };
      const catBrands = Array.from(new Set(displayCatProducts.map(p => p.brand))).slice(0, 6);

      const title = clampSeoTitle(`${readableCat} in Pakistan | Enterprise AV | AV Live`, 65);
      const description = clampSeoDescription(
        `Explore genuine ${readableCat} in Pakistan: Poly, Cisco, Logitech & Yealink hardware with PKR pricing and official local warranty.`,
        158
      );

      matched = {
        title,
        description,
        schema: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              '@id': `${canonicalUrl}#collection`,
              name: `${readableCat} Hardware Catalog in Pakistan`,
              description,
              url: canonicalUrl,
              mainEntity: {
                '@type': 'ItemList',
                numberOfItems: displayCatProducts.length,
                itemListElement: displayCatProducts.slice(0, 20).map((prod, idx) => ({
                  '@type': 'ListItem',
                  position: idx + 1,
                  url: `https://avlive.com.pk/product/${prod.slug}`,
                  name: prod.productName
                }))
              }
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${canonicalUrl}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://avlive.com.pk' },
                { '@type': 'ListItem', position: 2, name: 'Shop', item: 'https://avlive.com.pk/shop' },
                { '@type': 'ListItem', position: 3, name: readableCat, item: canonicalUrl }
              ]
            }
          ]
        }
      };

      const catRowsHtml = displayCatProducts.map(prod => {
        const price = resolveProductPricing(prod).effectivePrice;
        const gmc = PRODUCT_GMC_METADATA[prod.slug];
        return `<tr>
          <td><a href="https://avlive.com.pk/product/${prod.slug}">${escapeHtmlText(prod.productName)}</a></td>
          <td>${escapeHtmlText(prod.brand)}</td>
          <td>${escapeHtmlText(prod.mpn || prod.sku)}</td>
          <td>${escapeHtmlText(gmc?.highlight || prod.shortDescription || readableCat)}</td>
          <td>Rs. ${price.toLocaleString()}</td>
        </tr>`;
      }).join('');

      const relatedCatLinksHtml = uniqueGuide.relatedCats
        .map(rc => `<li><a href="https://avlive.com.pk/category/${rc}">Explore ${escapeHtmlText(rc.replace(/-/g, ' '))} in Pakistan</a></li>`)
        .join('');

      ssrCustomBodyHtml = `
        <main class="ssr-seo-snapshot" style="max-width:1200px;margin:0 auto;padding:24px;font-family:Inter,system-ui,sans-serif;color:#1A2B4C;">
          <nav aria-label="Breadcrumb"><a href="https://avlive.com.pk">Home</a> &rsaquo; <a href="https://avlive.com.pk/shop">Shop</a> &rsaquo; <span>${escapeHtmlText(readableCat)}</span></nav>
          <article>
            <h1>${escapeHtmlText(readableCat)} Hardware &amp; Integration in Pakistan</h1>
            <p>${escapeHtmlText(uniqueGuide.overview)} Verified PKR pricing across ${displayCatProducts.length} in-stock ${escapeHtmlText(readableCat)} models spans from Rs. ${minCatPrice.toLocaleString()} to Rs. ${maxCatPrice.toLocaleString()} across authorized brands (${escapeHtmlText(catBrands.join(', '))}).</p>
            <p><strong>Technical Procurement Standard:</strong> ${escapeHtmlText(uniqueGuide.architectureNote)}</p>
            <table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
              <caption>${escapeHtmlText(readableCat)} Models, MPNs, Key Specs &amp; Reference Prices in Pakistan (PKR)</caption>
              <thead>
                <tr><th>${escapeHtmlText(readableCat)} Model</th><th>OEM Brand</th><th>MPN / SKU</th><th>Key Technical Highlight</th><th>PKR Price</th></tr>
              </thead>
              <tbody>${catRowsHtml}</tbody>
            </table>
            <section aria-label="Related Categories and Guides">
              <h2>Related ${escapeHtmlText(readableCat)} Resources &amp; Adjacent Categories</h2>
              <ul>
                ${relatedCatLinksHtml}
                <li><a href="https://avlive.com.pk${uniqueGuide.guideUrl}">${escapeHtmlText(readableCat)} Engineering &amp; Buyer's Guide</a></li>
                <li><a href="https://avlive.com.pk/compare">Compare ${escapeHtmlText(readableCat)} Models Side-by-Side</a></li>
              </ul>
            </section>
          </article>
        </main>`;
    }

    // Dynamic Blog Post Route SSR Metadata & Schema Injection (/blog/:postSlug)
    if (!matched && cleanPath.startsWith('/blog/')) {
      const postSlug = cleanPath.replace('/blog/', '');
      const canonicalBlogSlug = resolveCanonicalBlogSlug(postSlug) || postSlug;
      const blogPost = FALLBACK_BLOG_CATALOG.find(
        p => p.slug === canonicalBlogSlug || p.slug === postSlug || String(p.id) === postSlug
      );
      if (blogPost) {
        const graphItems: any[] = [
          {
            '@type': 'BlogPosting',
            '@id': `${canonicalUrl}#article`,
            headline: blogPost.title,
            description: blogPost.answerFirstSummary || blogPost.excerpt,
            image: blogPost.image,
            datePublished: blogPost.publishedIso,
            dateModified: blogPost.publishedIso,
            author: {
              '@type': 'Organization',
              name: 'AV Live Communications',
              url: 'https://avlive.com.pk'
            },
            publisher: {
              '@id': 'https://avlive.com.pk/#organization'
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': canonicalUrl
            }
          }
        ];
        if (blogPost.faqs && blogPost.faqs.length > 0) {
          graphItems.push({
            '@type': 'FAQPage',
            '@id': `${canonicalUrl}#faq`,
            mainEntity: blogPost.faqs.map(f => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: f.a
              }
            }))
          });
        }
        matched = {
          title: clampSeoTitle(`${blogPost.title} | AV Live`, 65),
          description: clampSeoDescription(blogPost.answerFirstSummary || blogPost.excerpt, 158),
          schema: {
            '@context': 'https://schema.org',
            '@graph': graphItems
          }
        };

        const tableHtml = blogPost.comparisonTable
          ? `<table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
              <caption>${escapeHtmlText(blogPost.comparisonTable.caption)}</caption>
              <thead><tr>${blogPost.comparisonTable.headers.map(h => `<th>${escapeHtmlText(h)}</th>`).join('')}</tr></thead>
              <tbody>${blogPost.comparisonTable.rows.map(r => `<tr>${r.map(c => `<td>${escapeHtmlText(c)}</td>`).join('')}</tr>`).join('')}</tbody>
            </table>`
          : '';
        const paragraphsHtml = blogPost.content.map(p => `<p>${escapeHtmlText(p)}</p>`).join('');
        const blogIdx = FALLBACK_BLOG_CATALOG.findIndex(b => b.slug === blogPost.slug);
        const relatedBlogs = [1, 2, 3].map(off => FALLBACK_BLOG_CATALOG[(blogIdx + off) % FALLBACK_BLOG_CATALOG.length]);
        const relatedBlogLinks = relatedBlogs
          .map(rb => `<li><a href="https://avlive.com.pk/blog/${rb.slug}">${escapeHtmlText(rb.title)}</a></li>`)
          .join('');
        ssrCustomBodyHtml = `
          <main class="ssr-seo-snapshot" style="max-width:1200px;margin:0 auto;padding:24px;font-family:Inter,system-ui,sans-serif;color:#1A2B4C;">
            <nav aria-label="Breadcrumb"><a href="https://avlive.com.pk">Home</a> &rsaquo; <a href="https://avlive.com.pk/blog">Engineering Blog</a> &rsaquo; <span>${escapeHtmlText(blogPost.title)}</span></nav>
            <article>
              <h1>${escapeHtmlText(blogPost.title)}</h1>
              <p><strong>Direct Answer (TL;DR):</strong> ${escapeHtmlText(blogPost.answerFirstSummary || blogPost.excerpt)}</p>
              ${tableHtml}
              ${paragraphsHtml}
              <section aria-label="Related Engineering Guides">
                <h2>Related Pakistan Pro-AV &amp; UC Guides</h2>
                <ul>
                  ${relatedBlogLinks}
                  <li><a href="https://avlive.com.pk/guides">All Enterprise AV Buyer's Guides</a></li>
                  <li><a href="https://avlive.com.pk/shop">Browse Verified Hardware Catalog</a></li>
                </ul>
              </section>
            </article>
          </main>`;
      }
    }

    // Route-Specific Static Page SSR Content Engine (eliminates 85%-100% boilerplate duplicate content across static routes)
    if (!ssrCustomBodyHtml && matched && cleanPath !== '' && cleanPath !== '/') {
      const staticPageCustomContent: Record<string, { lead: string; detail: string; tableCaption: string; headers: string[]; rows: string[][]; links: { href: string; label: string }[] }> = {
        '/events-services': {
          lead: 'AV Live Communications operates Pakistan’s largest dry-hire and turnkey corporate event rental inventory, supplying P2.5/P2.9 indoor and P3.91 outdoor SMD LED video walls, 3D HoloGauze holographic stage meshes, concert line-array PA rigs, and Blackmagic 4K SDI multi-camera live switching desks.',
          detail: 'Every event rental deployment includes pre-rig CAD visualization, redundant power distribution, and on-site broadcast engineers across PC Bhurban, Expo Centre Lahore, Expo Centre Karachi, and Serena Islamabad.',
          tableCaption: '2026 Pakistan Event Production & AV Equipment Rental Rate Card (PKR Reference)',
          headers: ['Rental Equipment / Stage Package', 'Technical Specification', 'Recommended Venue Size', 'Reference Rental Rate (PKR)'],
          rows: [
            ['P2.5 High-Refresh SMD LED Main Stage Wall', '3840Hz broadcast refresh, Novastar 4K processor, seamless die-cast cabinets', '100–1,000+ Delegates', 'Rs. 180,000 – Rs. 650,000 / Day'],
            ['3D Hologram Stage & Pepper’s Ghost / HoloGauze Rig', '20,000 ANSI lumen laser projection + silver holographic mesh + 3D motion render', 'Keynote Product Launches', 'Rs. 480,000 – Rs. 1,650,000 / Event'],
            ['Multi-Camera 4K SDI Hybrid Webcast Flypack', '3x Sony/Panasonic PTZ/ENG cameras, ATEM 4K switcher, Zoom/Teams/YouTube bridge', 'Townhalls & AGMs', 'Rs. 150,000 – Rs. 350,000 / Day'],
            ['Line-Array Concert Audio & Digital Mixing Console', 'Dual line-array hangs, subwoofers, Shure ULX-D wireless mics, Midas/Allen & Heath mixer', 'Galas & Concerts (500–3,000 pax)', 'Rs. 220,000 – Rs. 780,000 / Event']
          ],
          links: [
            { href: '/event-quote', label: 'Instant Event & LED Rental Quote Calculator' },
            { href: '/av-equipment-rental', label: 'SMD LED Screen & PA System Rental Lahore' },
            { href: '/live-streaming-services', label: 'Multi-Camera Live Streaming & Webcast Services' },
            { href: '/3d-hologram', label: '3D Hologram Stage Displays Pakistan' },
            { href: '/projection-mapping', label: '3D Architectural Projection Mapping' }
          ]
        },
        '/services': {
          lead: 'AV Live Communications delivers 9 core enterprise engineering and production disciplines across Pakistan, combining permanent Pro-AV boardroom integration, unified SIP/VoIP telephony, turnkey corporate event management, and autonomous AI workflow automation.',
          detail: 'Backed by a 15-minute technical SLA response guarantee and certified engineers in Johar Town (Lahore), Clifton (Karachi), and Blue Area (Islamabad), we serve commercial banks, federal ministries, HEC universities, and multinational enterprises.',
          tableCaption: 'AV Live 9-Pillar Enterprise Service Portfolio & SLA Matrix',
          headers: ['Service Pillar', 'Core Engineering Scope', 'Authorized Ecosystem', 'Response SLA'],
          rows: FALLBACK_SERVICES_CATALOG.map(s => [
            s.title,
            s.serviceType || s.category,
            'Cisco, HP Poly, Logitech, Yealink, Bosch',
            '15-Min Proposal & On-Site Standby SLA'
          ]),
          links: FALLBACK_SERVICES_CATALOG.map(s => ({ href: `/services/${s.slug}`, label: s.title }))
        },
        '/shop': {
          lead: 'The AV Live Enterprise Hardware Store stocks 53 serial-verified Pro-AV, Video Conferencing, SIP IP Telephony, Commercial Laser Projection, and NDAA Surveillance SKUs in Pakistan with immediate warehouse dispatch.',
          detail: 'All hardware includes official 1-year to 3-year local Pakistan warranty, PTA/PPRA tender compliance documentation, and FBR GST tax invoicing.',
          tableCaption: 'Enterprise Hardware Store — Category & Price Tier Overview',
          headers: ['Hardware Department', 'Flagship Models in Stock', 'PKR Price Range', 'Department Link'],
          rows: [
            ['Video Conferencing Bars & Kits', 'Poly Studio X52, Poly X72, Logitech Rally Bar, Cisco Room Bar', 'Rs. 85,000 – Rs. 2,850,000', '/category/video-conferencing'],
            ['Executive Boardroom Codecs', 'Polycom RealPresence Group 500, Poly G7500, Cisco Room Kit Plus', 'Rs. 545,000 – Rs. 2,850,000', '/category/boardroom-codecs'],
            ['SIP IP Phones & VoIP PBX', 'Yealink T31P/T46U/T54W, Poly VVX 450, Grandstream UCM6302', 'Rs. 21,500 – Rs. 295,000', '/category/ip-phones'],
            ['4K Laser Projectors & Displays', 'Panasonic PT-RQ45K, Epson EB-L730U, Sony BRAVIA 7, BenQ LU960', 'Rs. 185,000 – Rs. 3,950,000', '/category/projectors']
          ],
          links: [
            { href: '/category/video-conferencing', label: 'Shop Video Conferencing Systems' },
            { href: '/category/boardroom-codecs', label: 'Shop Boardroom Codecs' },
            { href: '/category/ip-phones', label: 'Shop Enterprise IP Phones' },
            { href: '/category/projectors', label: 'Shop Commercial Projectors' },
            { href: '/brands', label: 'Browse All 25 Authorized Brands' },
            { href: '/compare', label: 'Side-by-Side Hardware Comparator' }
          ]
        },
        '/brands': {
          lead: 'AV Live Communications is an authorized distribution and integration partner for 25 global Pro-AV, Unified Communications, Optical Projection, and IP Security manufacturers in Pakistan.',
          detail: 'Procuring through an authorized channel guarantees factory-sealed hardware, genuine firmware entitlement, local RMA swap coverage, and certified field installation.',
          tableCaption: 'Authorized OEM Brands & Flagship Product Lines in Pakistan',
          headers: ['OEM Brand', 'Primary Technology Domain', 'Flagship Pakistan Series', 'Brand Portal'],
          rows: [
            ['HP Poly (Polycom)', 'Boardroom Codecs, Studio Video Bars, VVX/Edge IP Phones, Voyager Headsets', 'RealPresence Group 500, Studio X52/X72, G7500', '/brands/poly'],
            ['Logitech', 'Rally Bar Series, MeetUp, Sight AI Camera, Tap IP Controllers', 'Rally Bar, Rally Bar Mini, Rally Plus', '/brands/logitech'],
            ['Cisco', 'Webex Room Kits, Codec Pro, Room Bar, 7800/8800 IP Phones, CUCM', 'Room Bar, Room Kit Plus, Codec Pro', '/brands/cisco'],
            ['Yealink', 'MeetingBar A20/A30, MVC Teams Rooms, T3/T4/T5 SIP Phones', 'MeetingBar A30, MVC860, SIP-T46U', '/brands/yealink'],
            ['Bosch & ITC Audio', 'Digital Congress Microphones, EN54 PAVIRO Public Address & Line Arrays', 'CCS 1000 D, PAVIRO Controller, VA-6200MA', '/brands/bosch'],
            ['Panasonic, Epson & Sony', '20,000–45,000 Lumen 3-Chip DLP & 3LCD Laser Projectors', 'PT-RQ45K, PT-VMZ82, EB-L730U', '/brands/panasonic']
          ],
          links: [
            { href: '/brands/poly', label: 'HP Poly (Polycom) Pakistan' },
            { href: '/brands/logitech', label: 'Logitech Video Conferencing Pakistan' },
            { href: '/brands/cisco', label: 'Cisco Collaboration Pakistan' },
            { href: '/brands/yealink', label: 'Yealink Pakistan' },
            { href: '/brands/jabra', label: 'Jabra Audio & Video Pakistan' },
            { href: '/brands/bosch', label: 'Bosch Conference & Public Address' }
          ]
        },
        '/video-conferencing': {
          lead: 'Deploy studio-grade 4K video conferencing systems across huddle rooms, executive boardrooms, and training halls in Lahore, Karachi, and Islamabad with certified HP Poly, Logitech, Cisco, and Yealink hardware.',
          detail: 'Our acoustics and network engineers handle end-to-end room geometry modeling, PoE cable routing, dual-display mounting, and Zoom/Teams cloud tenant provisioning.',
          tableCaption: 'Pakistan Video Conferencing Room Sizing & Hardware Architecture',
          headers: ['Room Classification', 'Seating Capacity', 'Recommended Hardware Stack', 'Reference Budget (PKR)'],
          rows: [
            ['Focus & Huddle Room', '2–6 Seats', 'Poly Studio R30 / Logitech MeetUp 2 / Yealink UVC40', 'Rs. 195,000 – Rs. 450,000'],
            ['Mid-Sized Conference Room', '8–14 Seats', 'Poly Studio X52 / Logitech Rally Bar / Cisco Room Bar', 'Rs. 680,000 – Rs. 1,350,000'],
            ['Executive Boardroom', '16–28 Seats', 'Polycom Group 500 / Poly Studio X72 / Logitech Rally Plus', 'Rs. 1,450,000 – Rs. 2,850,000']
          ],
          links: [
            { href: '/category/video-conferencing', label: 'Browse All Video Conferencing Hardware' },
            { href: '/product/polycom-realpresence-group-500-pakistan', label: 'Polycom RealPresence Group 500' },
            { href: '/product/poly-studio-x72-pakistan', label: 'HP Poly Studio X72 Large Room Bar' },
            { href: '/product/logitech-rally-bar-pakistan', label: 'Logitech Rally Bar 4K' },
            { href: '/room-designer', label: 'Interactive 3D Conference Room Planner' }
          ]
        },
        '/video-conferencing-solutions': {
          lead: 'Turnkey enterprise video conferencing solutions engineered for zero-downtime executive communication in Lahore, Karachi, and Islamabad with a guaranteed 15-minute technical SLA response.',
          detail: 'We integrate H.323/SIP hardware codecs, AI speaker-tracking optical PTZ cameras, ceiling beamforming microphone arrays, and 4K interactive flat panels.',
          tableCaption: 'Turnkey Boardroom Integration Packages & SLA Commitments',
          headers: ['Solution Tier', 'Hardware & Acoustic Deliverables', 'Primary Cities', 'Turnkey PKR Estimate'],
          rows: [
            ['Huddle & Medium MTR/Zoom Kit', 'All-in-one 4K video bar, PoE touch panel, single 65"–75" 4K commercial display', 'Lahore, Karachi, Islamabad', 'Rs. 550,000 – Rs. 1,250,000'],
            ['Executive Boardroom Suite', 'Dual-camera 4K codec, 2–4 table/ceiling mic pods, dual 75"–85" displays, table connectivity box', 'Nationwide On-Site Deployment', 'Rs. 1,450,000 – Rs. 3,200,000'],
            ['Townhall & Auditorium Broadcast', 'Dual 20x PTZ cameras, DSP matrix mixer, wireless gooseneck mics, laser projection', 'Custom CAD & Acoustic Survey', 'Rs. 2,800,000 – Rs. 6,500,000+']
          ],
          links: [
            { href: '/services/boardroom-integration', label: 'Boardroom AV Integration Service Details' },
            { href: '/conference-room-solutions', label: 'Acoustic & Conference Room Solutions' },
            { href: '/zoom-rooms', label: 'Certified Zoom Rooms Integration' },
            { href: '/microsoft-teams-rooms', label: 'Microsoft Teams Rooms (MTR) Pakistan' },
            { href: '/blog/boardroom-av-system-price-guide-pakistan', label: '2026 Boardroom BoM & Price Guide' }
          ]
        },
        '/corporate-event-management': {
          lead: 'End-to-end corporate event management, AGM townhall broadcasting, P2.5 SMD LED stage fabrication, and 3D hologram product launches across Lahore, Karachi, and Islamabad.',
          detail: 'Our event engineering crew manages stage trussing, DMX intelligent lighting, line-array sound reinforcement, and redundant multi-camera live streaming with on-site standby engineers.',
          tableCaption: 'Corporate Event Production Tiers & Technical Scope in Pakistan',
          headers: ['Event Format', 'Visual & Stage Production', 'Audio & Hybrid Broadcast', 'Reference Budget (PKR)'],
          rows: [
            ['Executive Townhall & AGM', '12x8 ft P2.5 SMD LED backdrop, confidence monitors, branded podium', '4x wireless mics, 2-camera HD SDI Zoom/Teams bridge', 'Rs. 250,000 – Rs. 550,000'],
            ['Corporate Product Launch & Gala', 'Curved P2.5 LED wall + 3D HoloGauze stage, 24x DMX moving heads', 'Concert line-array PA, 4-camera 4K switching + live stream', 'Rs. 850,000 – Rs. 2,500,000'],
            ['International Expo & Convention', 'Custom 3D fabricated pavilion, interactive touch kiosks, LED fascia', 'Multi-zone wireless audio, lead-capture AI agents', 'Rs. 1,200,000 – Rs. 4,500,000+']
          ],
          links: [
            { href: '/services/corporate-events', label: 'Corporate Event Management Service Blueprint' },
            { href: '/events-services', label: 'AV Rental Rate Card & Configurator' },
            { href: '/live-streaming-services', label: 'Corporate Webcast & Live Streaming' },
            { href: '/av-equipment-rental', label: 'SMD LED Screen & Audio Rental' },
            { href: '/event-quote', label: 'Calculate Your Event Production Quote' }
          ]
        }
      };

      const customStatic = staticPageCustomContent[cleanPath];
      if (customStatic) {
        const rowsHtml = customStatic.rows
          .map(r => `<tr>${r.map(c => `<td>${escapeHtmlText(c)}</td>`).join('')}</tr>`)
          .join('');
        const linksHtml = customStatic.links
          .map(l => `<li><a href="https://avlive.com.pk${l.href}">${escapeHtmlText(l.label)}</a></li>`)
          .join('');
        ssrCustomBodyHtml = `
          <main class="ssr-seo-snapshot" style="max-width:1200px;margin:0 auto;padding:24px;font-family:Inter,system-ui,sans-serif;color:#1A2B4C;">
            <nav aria-label="Breadcrumb"><a href="https://avlive.com.pk">Home</a> &rsaquo; <span>${escapeHtmlText(matched.title.replace(/\s*\|\s*AV Live.*$/i, ''))}</span></nav>
            <article>
              <h1>${escapeHtmlText(matched.title.replace(/\s*\|\s*AV Live.*$/i, ''))}</h1>
              <p>${escapeHtmlText(customStatic.lead)}</p>
              <p>${escapeHtmlText(customStatic.detail)}</p>
              <table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
                <caption>${escapeHtmlText(customStatic.tableCaption)}</caption>
                <thead><tr>${customStatic.headers.map(h => `<th>${escapeHtmlText(h)}</th>`).join('')}</tr></thead>
                <tbody>${rowsHtml}</tbody>
              </table>
              <section aria-label="Contextual Navigation">
                <h2>Explore Related Solutions</h2>
                <ul>${linksHtml}</ul>
              </section>
            </article>
          </main>`;
      } else {
        // Unique deterministic SSR synthesis for all remaining static routes (/lahore, /karachi, /islamabad, /zoom-rooms, /programs/*, /returns, etc.)
        const allProductKeys = Object.keys(PRODUCT_GMC_METADATA);
        const pathHash = cleanPath.split('').reduce((acc, ch, idx) => acc + ch.charCodeAt(0) * (idx + 1), 0);
        const pickedProds = [0, 1, 2, 3].map(i => {
          const slug = allProductKeys[(pathHash + i * 7) % allProductKeys.length];
          return buildFallbackProductFromGmcMeta(slug);
        }).filter((p): p is NonNullable<typeof p> => Boolean(p));
        const pickedSvc = FALLBACK_SERVICES_CATALOG[pathHash % FALLBACK_SERVICES_CATALOG.length];
        const pickedBlog = FALLBACK_BLOG_CATALOG[pathHash % FALLBACK_BLOG_CATALOG.length];
        const cleanHeading = matched.title.replace(/\s*\|\s*AV Live.*$/i, '');

        const prodLinksHtml = pickedProds.map(p => {
          const pr = resolveProductPricing(p).effectivePrice;
          return `<li><a href="https://avlive.com.pk/product/${p.slug}">${escapeHtmlText(p.productName)} (${escapeHtmlText(p.mpn || p.sku)}) — Rs. ${pr.toLocaleString()}</a></li>`;
        }).join('');

        ssrCustomBodyHtml = `
          <main class="ssr-seo-snapshot" style="max-width:1200px;margin:0 auto;padding:24px;font-family:Inter,system-ui,sans-serif;color:#1A2B4C;">
            <nav aria-label="Breadcrumb"><a href="https://avlive.com.pk">Home</a> &rsaquo; <span>${escapeHtmlText(cleanHeading)}</span></nav>
            <article>
              <h1>${escapeHtmlText(cleanHeading)}</h1>
              <p><strong>Executive Overview (${escapeHtmlText(cleanPath)}):</strong> ${escapeHtmlText(matched.description)}</p>
              <p>AV Live Communications provides engineering consultation, PPRA/FBR tax-compliant invoicing, and 15-minute SLA technical support for <em>${escapeHtmlText(cleanHeading)}</em> across Lahore (Johar Town HQ), Karachi, and Islamabad. Featured hardware for this program includes ${pickedProds.map(p => escapeHtmlText(p.productName)).join(', ')}.</p>
              <table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
                <caption>${escapeHtmlText(cleanHeading)} — Reference Hardware &amp; Service Matrix</caption>
                <thead><tr><th>Recommended Model / Service</th><th>MPN / Classification</th><th>Reference Price / SLA</th></tr></thead>
                <tbody>
                  ${pickedProds.map(p => `<tr><td><a href="https://avlive.com.pk/product/${p.slug}">${escapeHtmlText(p.productName)}</a></td><td>${escapeHtmlText(p.mpn || p.sku)} (${escapeHtmlText(p.brand)})</td><td>Rs. ${resolveProductPricing(p).effectivePrice.toLocaleString()}</td></tr>`).join('')}
                  <tr><td><a href="https://avlive.com.pk/services/${pickedSvc.slug}">${escapeHtmlText(pickedSvc.title)}</a></td><td>${escapeHtmlText(pickedSvc.serviceType || pickedSvc.category)}</td><td>15-Min Technical SLA</td></tr>
                </tbody>
              </table>
              <section aria-label="Related Enterprise Links">
                <h2>Related Hardware &amp; Engineering Guides for ${escapeHtmlText(cleanHeading)}</h2>
                <ul>
                  ${prodLinksHtml}
                  <li><a href="https://avlive.com.pk/services/${pickedSvc.slug}">${escapeHtmlText(pickedSvc.title)}</a></li>
                  <li><a href="https://avlive.com.pk/blog/${pickedBlog.slug}">${escapeHtmlText(pickedBlog.title)}</a></li>
                </ul>
              </section>
            </article>
          </main>`;
      }
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
      const clampedTitle = clampSeoTitle(matched.title, 65);
      const clampedDesc = clampSeoDescription(matched.description, 158);
      const safeTitleText = escapeHtmlText(clampedTitle);
      const safeTitleAttr = escapeHtmlAttr(clampedTitle);
      const safeDescAttr = escapeHtmlAttr(clampedDesc);

      updated = updated
        .replace(/<title(?:\s+data-rh="true")?>[\s\S]*?<\/title>/, `<title data-rh="true">${safeTitleText}</title>`)
        .replace(
          /<meta(?:\s+data-rh="true")?\s+name="description"\s+content="[^"]*"\s*\/>/,
          `<meta data-rh="true" name="description" content="${safeDescAttr}" />`
        )
        .replace(
          /<meta(?:\s+data-rh="true")?\s+property="og:title"\s+content="[^"]*"\s*\/>/,
          `<meta data-rh="true" property="og:title" content="${safeTitleAttr}" />`
        )
        .replace(
          /<meta(?:\s+data-rh="true")?\s+property="og:description"\s+content="[^"]*"\s*\/>/,
          `<meta data-rh="true" property="og:description" content="${safeDescAttr}" />`
        )
        .replace(
          /<meta(?:\s+data-rh="true")?\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
          `<meta data-rh="true" name="twitter:title" content="${safeTitleAttr}" />`
        )
        .replace(
          /<meta(?:\s+data-rh="true")?\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
          `<meta data-rh="true" name="twitter:description" content="${safeDescAttr}" />`
        );
      if (matched.noindex) {
        updated = updated.replace(
          /<meta(?:\s+data-rh="true")?\s+name="robots"\s+content="[^"]*"\s*\/>/,
          '<meta data-rh="true" name="robots" content="noindex, nofollow" />'
        );
      }

      // Scope the massive homepage JSON-LD @graph strictly to "/" and replace on subpages with clean route-specific schema
      if (cleanPath !== '' && cleanPath !== '/') {
        if (matched.noindex) {
          updated = updated.replace(/<script id="ssr-home-schema" type="application\/ld\+json">[\s\S]*?<\/script>/, '');
        } else {
          const compactOrgNode = {
            '@type': 'Organization',
            '@id': 'https://avlive.com.pk/#organization',
            name: 'AV Live Communications',
            url: 'https://avlive.com.pk',
            logo: 'https://avlive.com.pk/logo.png',
            telephone: '+92-321-4256263'
          };
          const rawRouteSchema = matched.schema || {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': `${canonicalUrl}#webpage`,
            name: clampedTitle,
            description: clampedDesc,
            url: canonicalUrl,
            isPartOf: { '@id': 'https://avlive.com.pk/#website' },
            publisher: { '@id': 'https://avlive.com.pk/#organization' }
          };
          const routeGraphItems = Array.isArray(rawRouteSchema['@graph'])
            ? rawRouteSchema['@graph']
            : [Object.fromEntries(Object.entries(rawRouteSchema).filter(([k]) => k !== '@context'))];
          const hasOrgInRoute = routeGraphItems.some(
            (node: any) => node?.['@id'] === 'https://avlive.com.pk/#organization'
          );
          const scopedSchema = {
            '@context': 'https://schema.org',
            '@graph': hasOrgInRoute ? routeGraphItems : [compactOrgNode, ...routeGraphItems]
          };
          const scopedScriptTag = `<script id="ssr-route-schema" type="application/ld+json">${JSON.stringify(scopedSchema)}</script>`;
          if (/<script id="ssr-home-schema" type="application\/ld\+json">[\s\S]*?<\/script>/.test(updated)) {
            updated = updated.replace(
              /<script id="ssr-home-schema" type="application\/ld\+json">[\s\S]*?<\/script>/,
              scopedScriptTag
            );
          } else {
            updated = updated.replace('</head>', `${scopedScriptTag}\n  </head>`);
          }
        }
      }
    }

    if (ssrCustomBodyHtml) {
      updated = updated.replace(
        /<div id="root">[\s\S]*?<\/div><!--ssr-root-end-->|<div id="root"><\/div>/,
        `<div id="root">${ssrCustomBodyHtml}</div><!--ssr-root-end-->`
      );
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
    '/corporate-event-management-pakistan': '/corporate-event-management',
    '/brands/polycom': '/brands/poly',
    '/brands/hp-poly': '/brands/poly',
    '/gmc-products.xml': '/feed/google-merchant.tsv',
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

  // Redirect numeric blog IDs (/blog/1 .. /blog/11) and legacy Firestore blog slugs to their canonical SEO blog slugs
  app.get('/blog/:idOrSlug', (req, res, next) => {
    const requested = req.params.idOrSlug;
    const canonicalBlogSlug = resolveCanonicalBlogSlug(requested);
    if (canonicalBlogSlug && canonicalBlogSlug !== requested) {
      return res.redirect(301, `/blog/${canonicalBlogSlug}`);
    }
    next();
  });

  // Set X-Robots-Tag: noindex, nofollow on private/transactional routes
  app.use(['/admin', '/cart', '/checkout', '/setup-wizard'], (req, res, next) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    next();
  });

  // Vite middleware for development; compiled dist/server.cjs or NODE_ENV=production always serves static dist/
  const isProductionServer =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.argv[1] && process.argv[1].endsWith('server.cjs'));

  if (!isProductionServer) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(async (req, res, next) => {
      if (
        req.method === 'GET' &&
        !req.path.startsWith('/api/') &&
        !req.path.startsWith('/src/') &&
        !req.path.startsWith('/@') &&
        !req.path.startsWith('/node_modules/') &&
        !path.extname(req.path)
      ) {
        try {
          const indexPath = path.join(process.cwd(), 'index.html');
          const rawHtml = fs.readFileSync(indexPath, 'utf8');
          const seoHtml = injectRouteSeoIntoHtml(rawHtml, req.path);
          const transformed = await vite.transformIndexHtml(req.originalUrl, seoHtml);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.status(200).send(transformed);
        } catch (e) {
          return next(e);
        }
      }
      next();
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

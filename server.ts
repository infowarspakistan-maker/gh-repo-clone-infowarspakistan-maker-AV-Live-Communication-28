import { GoogleGenAI } from '@google/genai';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';

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
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      // Static routes
      const staticRoutes = [
        '',
        '/shop',
        '/solutions',
        '/services',
        '/contact',
        '/about',
        '/blog'
      ];

      for (const route of staticRoutes) {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}${route}</loc>\n`;
        xml += '    <changefreq>daily</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
      }

      // Dynamic Products
      try {
        const productsSnap = await db.collection('products').get();
        productsSnap.forEach(doc => {
          xml += '  <url>\n';
          xml += `    <loc>${baseUrl}/product/${doc.id}</loc>\n`;
          xml += '    <changefreq>weekly</changefreq>\n';
          xml += '    <priority>0.9</priority>\n';
          xml += '  </url>\n';
        });
      } catch (e) {
        console.error('Error fetching products for sitemap:', e);
      }

      // Dynamic Categories
      try {
        const categoriesSnap = await db.collection('categories').get();
        categoriesSnap.forEach(doc => {
          const data = doc.data();
          xml += '  <url>\n';
          xml += `    <loc>${baseUrl}/category/${data.slug || doc.id}</loc>\n`;
          xml += '    <changefreq>weekly</changefreq>\n';
          xml += '    <priority>0.8</priority>\n';
          xml += '  </url>\n';
        });
      } catch (e) {
        console.error('Error fetching categories for sitemap:', e);
      }

      xml += '</urlset>';

      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      console.error('Sitemap generation error:', error);
      res.status(500).send('Error generating sitemap');
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

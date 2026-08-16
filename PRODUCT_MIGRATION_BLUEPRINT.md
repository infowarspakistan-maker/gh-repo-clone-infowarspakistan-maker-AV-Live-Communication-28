# AV Live Classified Systems: Product & Category Migration Blueprint

This blueprint outlines the exact technical specification, data schemas, and tooling required to export and import products and categories from the **AV Live** platform to any other web property or Firebase target (such as `62ef3166-4331-4aa3-87cf-d7384f54afd6`).

---

## I. Data Schema Specifications

To maintain database integrity during migration, the target system must strictly adhere to the following Firestore entity schemas.

### 1. Category Schema (`/categories` collection)

Categories are stored hierarchically. A child category references its parent via the `parentId` field.

```typescript
export interface Category {
  id?: string;               // Firestore Document ID (must be preserved during migration)
  name: string;             // Display name (e.g., "Meeting Room Systems")
  slug: string;             // URL slug (e.g., "meeting-room-systems")
  description: string;      // Category overview description
  imageUrl?: string;        // Visual banner or illustration URL
  parentId: string | null;  // Parent category ID (null if top-level/root category)
  displayOrder: number;     // Order of appearance in menu trees (asc)
  isActive: boolean;        // Active status toggle
  isFeatured?: boolean;     // Home-page featured listing toggle
  seoTags?: string;         // Meta keywords
  seoMetaDescription?: string; // Search result snippet text
  imageAltText?: string;    // Accessibility text for the banner
  createdAt?: any;          // Firestore Timestamp
  updatedAt?: any;          // Firestore Timestamp
}
```

### 2. Product Schema (`/products` collection)

Products map to one or more categories via their `categoryIds` and `categorySlugs` arrays.

```typescript
export interface Product {
  id?: string;               // Firestore Document ID (must be preserved during migration)
  slug?: string;            // URL slug (e.g., "cisco-room-kit-plus-pakistan")
  productName: string;      // Display name of the hardware
  sku: string;              // Unique stock-keeping unit (e.g., "CS-KIT-PLUS-K9")
  shortDescription: string; // Brief descriptive highlight
  description: string;      // Long HTML or markdown-formatted details (can contain embedded base64 assets)
  regularPrice: number;     // Manufacturer suggested retail price (MSRP)
  salePrice: number;        // Active offer transaction price
  stockQuantity: number;     // Available local warehouse stock
  lowStockThreshold: number;// Inventory warning trigger level
  images: string[];         // Image array of galleries
  categoryIds: string[];    // Array of associated Category document IDs (critical for filters)
  categorySlugs: string[];  // Array of associated Category URL slugs
  brand: string;            // Manufacturer brand name (e.g., "Cisco")
  variations: any[];        // Product variant packages
  isActive: boolean;        // Active catalog visibility status
  isFeatured?: boolean;     // Featured highlight status
  specifications?: string;  // Detailed specs layout (HTML/Markdown)
  seoTags?: string;         // Search keywords
  seoMetaDescription?: string; // SEO search snippet
  imageAltText?: string;    // Image title hover text
  createdAt?: any;          // Firestore Timestamp
  updatedAt?: any;          // Firestore Timestamp
}
```

---

## II. Out-of-the-Box CSV Export & Import

For simple migrations without code, use the integrated **Data Management** panel inside the Admin portal.

1. Navigate to the **Admin Dashboard** and select **Data Management**.
2. locate the **Categories Data** and **Products Data** modules.
3. Click **Export** on both to download standard-compliant CSV files.
4. On the destination platform, go to the same **Data Management** panel.
5. Upload the CSV files using the corresponding **Import** input fields.
6. The import engine automatically parses strings, handles arrays/nested JSON structures, and executes optimized batch writes of up to 490 documents per transaction.

---

## III. Programmatic Migration Engine (`migrate.js`)

For automated, full-fidelity replication (including matching timestamps and original ID mappings) between two Firebase projects, execute the following script.

### 1. Prerequisites

Install the official Firebase Admin SDK on your migration workstation:

```bash
npm install firebase-admin
```

### 2. Migration Script

Create a file named `migrate.js` and configure the service account keys for both your **Source** and **Destination** projects:

```javascript
const admin = require('firebase-admin');

// 1. Initialize Source App
const sourceCreds = require('./source-service-account.json');
const sourceApp = admin.initializeApp({
  credential: admin.credential.cert(sourceCreds)
}, 'source');

// 2. Initialize Destination App
const destCreds = require('./destination-service-account.json');
const destApp = admin.initializeApp({
  credential: admin.credential.cert(destCreds)
}, 'destination');

const sourceDb = sourceApp.firestore();
const destDb = destApp.firestore();

/**
 * Migrates a collection from source db to destination db
 * maintaining exact document IDs, data types, and timestamps.
 */
async function migrateCollection(collectionName) {
  console.log(`\n🚀 Starting migration for: ${collectionName}...`);
  
  const snapshot = await sourceDb.collection(collectionName).get();
  if (snapshot.empty) {
    console.log(`ℹ️ Collection ${collectionName} is empty. Skipping.`);
    return;
  }

  console.log(`📦 Found ${snapshot.size} documents in ${collectionName}.`);

  const docs = [];
  snapshot.forEach(doc => {
    docs.push({ id: doc.id, data: doc.data() });
  });

  // Write in batches of 400 to safely bypass Firestore's 500 limit
  const BATCH_SIZE = 400;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const chunk = docs.slice(i, i + BATCH_SIZE);
    const batch = destDb.batch();

    chunk.forEach(item => {
      const docRef = destDb.collection(collectionName).doc(item.id);
      batch.set(docRef, item.data, { merge: true });
    });

    await batch.commit();
    console.log(`✅ Progress: Migrated ${i + chunk.length}/${docs.length} documents.`);
  }

  console.log(`🎉 Successfully migrated entire '${collectionName}' collection!`);
}

async function run() {
  try {
    // We migrate categories FIRST so product references are valid
    await migrateCollection('categories');
    await migrateCollection('products');
    
    console.log('\n🌟 Complete database migration finished successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

run();
```

---

## IV. Verification & Sanity Checks

Once your migration completes, verify the following properties on your target platform to ensure maximum catalog presentation and search engine compliance:

1. **Hierarchy Check**: Verify that nested child categories have a non-null `parentId` matching the exact ID of their parent category in the destination database.
2. **Product Mapping Check**: Open any product and ensure that `categoryIds` array elements correctly match the imported Category document IDs.
3. **SEO Readiness**: Check that URL slugs are consistent, allowing path parameters (e.g., `/product/:slug` and `/category/:slug`) to load correct content without rendering empty-state alerts.

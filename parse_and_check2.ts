import { db } from './src/lib/firebase/client';
import { collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

async function run() {
  const content = fs.readFileSync('product_data.txt', 'utf8');
  const blocks = content.split(/\n\d+\.\s/);
  
  const updates: string[] = [];
  
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const skuMatch = block.match(/SKU:\s*(.+)/);
    
    if (skuMatch) {
      const sku = skuMatch[1].trim();
      updates.push(sku);
    }
  }

  console.log(`Parsed SKUs: ${updates.length}`);
  
  const productsRef = collection(db, 'products');
  const allDocs = await getDocs(productsRef);
  const existingSkus = new Set();
  allDocs.forEach(d => existingSkus.add(d.data().sku));
  
  console.log(`Existing SKUs in DB: ${existingSkus.size}`);
  
  for (const sku of updates) {
    if (!existingSkus.has(sku)) {
      console.log(`Missing SKU: ${sku}`);
    }
  }
  process.exit(0);
}

run().catch(console.error);

import { db } from './src/lib/firebase/client';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import * as fs from 'fs';

async function run() {
  const content = fs.readFileSync('product_data.txt', 'utf8');
  
  // Use regex to parse out individual product blocks
  const blocks = content.split(/\n\d+\.\s/);
  // blocks[0] contains "PROJECTORS", so we skip it.
  
  const updates: any[] = [];
  
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    
    // We need to parse:
    // SKU: <SKU>
    // URL: /<slug>
    // Inventory Status: <qty> Units
    // Market Value: Rs. <price>
    // Short Description\n\n<desc>
    // Meta Description\n\n<desc>
    // Keywords\n\n<tags>
    
    const skuMatch = block.match(/SKU:\s*(.+)/);
    const urlMatch = block.match(/URL:\s*\/(.+)/);
    const invMatch = block.match(/Inventory Status:\s*([\d,]+)\s*Units/);
    const priceMatch = block.match(/Market Value:\s*Rs\.\s*([\d,]+)/);
    const shortDescMatch = block.match(/Short Description\n\n([\s\S]+?)\n\nMeta Description/);
    const metaDescMatch = block.match(/Meta Description\n\n([\s\S]+?)\n\nLength/);
    const keywordsMatch = block.match(/Keywords\n\n([\s\S]+?)(?=\n\n[A-Z]|\n*$)/);
    
    if (skuMatch) {
      const sku = skuMatch[1].trim();
      const updateObj: any = {};
      
      if (urlMatch) updateObj.slug = urlMatch[1].trim();
      if (invMatch) updateObj.stockQuantity = parseInt(invMatch[1].replace(/,/g, ''), 10);
      if (priceMatch) updateObj.regularPrice = parseInt(priceMatch[1].replace(/,/g, ''), 10);
      if (shortDescMatch) updateObj.shortDescription = shortDescMatch[1].trim();
      if (metaDescMatch) updateObj.seoMetaDescription = metaDescMatch[1].trim();
      if (keywordsMatch) updateObj.seoTags = keywordsMatch[1].trim().replace(/\n/g, ' | ');
      
      updates.push({ sku, data: updateObj });
    }
  }

  console.log(`Parsed ${updates.length} products to update`);
  
  const productsRef = collection(db, 'products');
  let count = 0;
  
  for (const update of updates) {
    const q = query(productsRef, where("sku", "==", update.sku));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log(`Product not found: ${update.sku}`);
    } else {
      snapshot.forEach(async (d) => {
        await updateDoc(doc(db, 'products', d.id), update.data);
        count++;
      });
    }
  }
  
  // Also we want to update the seed file with these values, to make sure re-seeding uses these.
  // We can write a node script to do that.
  
  console.log(`Updated ${count} products in Firestore`);
  process.exit(0);
}

run().catch(console.error);

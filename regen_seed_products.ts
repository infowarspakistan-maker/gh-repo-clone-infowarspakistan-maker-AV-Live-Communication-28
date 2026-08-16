import { db } from './src/lib/firebase/client';
import { collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

async function run() {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  const products: any[] = [];
  snapshot.forEach(doc => {
    products.push({ id: doc.id, ...doc.data() });
  });

  // Sort by id for deterministic output
  products.sort((a, b) => a.id.localeCompare(b.id));

  let tsContent = fs.readFileSync('src/lib/firebase/seed.ts', 'utf8');

  // We need to replace the entire array inside `const initialProducts: any[] = [`
  const arrayStartStr = 'const initialProducts: any[] = [';
  const startIndex = tsContent.indexOf(arrayStartStr);
  if (startIndex === -1) throw new Error("Could not find initialProducts");
  
  // Find the closing bracket for this array. Since there are other things, we can search for the next `];`
  const endIndex = tsContent.indexOf('];', startIndex);
  if (endIndex === -1) throw new Error("Could not find end of initialProducts");

  let newArrayStr = 'const initialProducts: any[] = [\n';
  
  for (const p of products) {
    newArrayStr += `    {\n`;
    newArrayStr += `      id: '${p.id}',\n`;
    newArrayStr += `      title: '${p.title.replace(/'/g, "\\'")}',\n`;
    newArrayStr += `      name: '${p.name.replace(/'/g, "\\'")}',\n`;
    if (p.slug) newArrayStr += `      slug: '${p.slug}',\n`;
    newArrayStr += `      sku: '${p.sku}',\n`;
    newArrayStr += `      brand: '${p.brand.replace(/'/g, "\\'")}',\n`;
    if (p.regularPrice !== undefined) newArrayStr += `      regularPrice: ${p.regularPrice},\n`;
    if (p.stockQuantity !== undefined) newArrayStr += `      stockQuantity: ${p.stockQuantity},\n`;
    newArrayStr += `      categorySlugs: ${JSON.stringify(p.categorySlugs).replace(/"/g, "'")},\n`;
    newArrayStr += `      images: ${JSON.stringify(p.images).replace(/"/g, "'")},\n`;
    
    if (p.shortDescription) {
        newArrayStr += `      shortDescription: '${p.shortDescription.replace(/'/g, "\\'")}',\n`;
    }
    if (p.description) {
        newArrayStr += `      description: '${p.description.replace(/'/g, "\\'")}',\n`;
    }
    if (p.specifications) {
        newArrayStr += `      specifications: '${p.specifications.replace(/'/g, "\\'")}',\n`;
    }
    if (p.seoMetaDescription) {
        newArrayStr += `      seoMetaDescription: '${p.seoMetaDescription.replace(/'/g, "\\'")}',\n`;
    }
    if (p.seoTags) {
        newArrayStr += `      seoTags: '${p.seoTags.replace(/'/g, "\\'")}',\n`;
    }
    
    // We can't serialize serverTimestamp(), so we just put it back
    newArrayStr += `      createdAt: serverTimestamp(),\n`;
    newArrayStr += `      updatedAt: serverTimestamp(),\n`;
    newArrayStr += `    },\n`;
  }
  
  const finalStr = tsContent.substring(0, startIndex) + newArrayStr + tsContent.substring(endIndex);
  
  fs.writeFileSync('src/lib/firebase/seed.ts', finalStr);
  console.log('Re-generated initialProducts in seed.ts');
  process.exit(0);
}

run().catch(console.error);

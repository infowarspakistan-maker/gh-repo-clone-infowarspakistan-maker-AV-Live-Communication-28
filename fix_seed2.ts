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

  products.sort((a, b) => a.id.localeCompare(b.id));

  let tsContent = fs.readFileSync('src/lib/firebase/seed.ts', 'utf8');

  const arrayStartStr = 'const initialProducts: any[] = [';
  const startIndex = tsContent.indexOf(arrayStartStr);
  if (startIndex === -1) throw new Error("Could not find initialProducts");
  
  // Find the closing of initialProducts. It should be the end of the array.
  // It is immediately followed by: export async function seedDatabase()
  const endMarker = 'export async function seedDatabase()';
  const endMarkerIndex = tsContent.indexOf(endMarker);
  if (endMarkerIndex === -1) throw new Error("Could not find end marker");

  // The array ends a few lines before that marker.
  const arrayCode = tsContent.substring(startIndex, endMarkerIndex);
  const lastBracketIndex = arrayCode.lastIndexOf('];');
  if (lastBracketIndex === -1) throw new Error("Could not find ];");

  const endIndex = startIndex + lastBracketIndex + 2;

  let newArrayStr = 'const initialProducts: any[] = [\n';
  
  for (const p of products) {
    newArrayStr += `    {\n`;
    newArrayStr += `      id: '${p.id}',\n`;
    if (p.productName) newArrayStr += `      productName: '${p.productName.replace(/'/g, "\\'")}',\n`;
    if (p.title) newArrayStr += `      title: '${p.title.replace(/'/g, "\\'")}',\n`;
    if (p.name) newArrayStr += `      name: '${p.name.replace(/'/g, "\\'")}',\n`;
    if (p.slug) newArrayStr += `      slug: '${p.slug}',\n`;
    newArrayStr += `      sku: '${p.sku}',\n`;
    if (p.brand) newArrayStr += `      brand: '${p.brand.replace(/'/g, "\\'")}',\n`;
    if (p.regularPrice !== undefined) newArrayStr += `      regularPrice: ${p.regularPrice},\n`;
    if (p.salePrice !== undefined) newArrayStr += `      salePrice: ${p.salePrice},\n`;
    if (p.stockQuantity !== undefined) newArrayStr += `      stockQuantity: ${p.stockQuantity},\n`;
    if (p.categorySlugs) newArrayStr += `      categorySlugs: ${JSON.stringify(p.categorySlugs).replace(/"/g, "'")},\n`;
    if (p.images) newArrayStr += `      images: ${JSON.stringify(p.images).replace(/"/g, "'")},\n`;
    if (p.status) newArrayStr += `      status: '${p.status}',\n`;
    
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
    
    newArrayStr += `      createdAt: serverTimestamp(),\n`;
    newArrayStr += `      updatedAt: serverTimestamp(),\n`;
    newArrayStr += `    },\n`;
  }
  newArrayStr += '  ];';
  
  const finalStr = tsContent.substring(0, startIndex) + newArrayStr + tsContent.substring(endIndex);
  
  fs.writeFileSync('src/lib/firebase/seed.ts', finalStr);
  console.log('Re-generated initialProducts in seed.ts');
  process.exit(0);
}

run().catch(console.error);

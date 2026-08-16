import * as fs from 'fs';

let content = fs.readFileSync('src/lib/firebase/seed.ts', 'utf8');

// Find all occurrences of something like: `shortDescription: '...',`
// that have trailing garbage before the next property or comma.
// Actually, it's easier to just match from `sku: '...'` to the end of the object `}` and re-generate the fields, or replace the broken ones.

const prodDataStr = fs.readFileSync('product_data.txt', 'utf8');
const blocks = prodDataStr.split(/\n\d+\.\s/);
const updates: any[] = [];
for (let i = 1; i < blocks.length; i++) {
  const block = blocks[i];
  const skuMatch = block.match(/SKU:\s*(.+)/);
  if (skuMatch) {
    updates.push(skuMatch[1].trim());
  }
}

for (const sku of updates) {
  const skuRegex = new RegExp(`sku:\\s*'${sku}'[\\s\\S]*?\\}`);
  const match = content.match(skuRegex);
  if (match) {
    let block = match[0];
    
    // Fix shortDescription
    block = block.replace(/shortDescription:\s*'([^']*)'(.*?),(\s*\w+:)/g, (match, p1, p2, p3) => {
        // p2 is the garbage left over. We drop it.
        return `shortDescription: '${p1}',${p3}`;
    });
    
    // Fix seoMetaDescription
    block = block.replace(/seoMetaDescription:\s*'([^']*)'(.*?),(\s*\w+:)/g, (match, p1, p2, p3) => {
        return `seoMetaDescription: '${p1}',${p3}`;
    });
    
    // Fix seoTags
    block = block.replace(/seoTags:\s*'([^']*)'(.*?)(\})/g, (match, p1, p2, p3) => {
        return `seoTags: '${p1}'${p3}`;
    });

    content = content.replace(match[0], block);
  }
}

fs.writeFileSync('src/lib/firebase/seed.ts', content);
console.log('Fixed garbage');

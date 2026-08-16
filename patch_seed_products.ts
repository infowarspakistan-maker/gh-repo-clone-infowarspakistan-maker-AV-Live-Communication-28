import * as fs from 'fs';

async function run() {
  let content = fs.readFileSync('src/lib/firebase/seed.ts', 'utf8');
  const prodDataStr = fs.readFileSync('product_data.txt', 'utf8');
  const blocks = prodDataStr.split(/\n\d+\.\s/);
  
  const updates: any[] = [];
  
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    
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
  
  for (const update of updates) {
    const skuRegex = new RegExp(`sku:\\s*'${update.sku}'[\\s\\S]*?\\}`);
    
    const match = content.match(skuRegex);
    if (match) {
        let block = match[0];
        
        // update slug
        if (update.data.slug) {
            block = block.replace(/slug:\s*'[^']*'/, `slug: '${update.data.slug}'`);
        }
        
        // stockQuantity
        if (update.data.stockQuantity !== undefined) {
             if (block.includes('stockQuantity:')) {
                 block = block.replace(/stockQuantity:\s*\d+/, `stockQuantity: ${update.data.stockQuantity}`);
             } else {
                 block = block.replace(/,(\s*)\}$/, `, stockQuantity: ${update.data.stockQuantity}$1}`);
             }
        }

        // regularPrice
        if (update.data.regularPrice !== undefined) {
             if (block.includes('regularPrice:')) {
                 block = block.replace(/regularPrice:\s*\d+/, `regularPrice: ${update.data.regularPrice}`);
             } else {
                 block = block.replace(/,(\s*)\}$/, `, regularPrice: ${update.data.regularPrice}$1}`);
             }
        }
        
        // Short desc
        if (update.data.shortDescription) {
             const val = update.data.shortDescription.replace(/'/g, "\\'");
             if (block.includes('shortDescription:')) {
                 block = block.replace(/shortDescription:\s*'[^']*'/, `shortDescription: '${val}'`);
             } else {
                 block = block.replace(/,(\s*)\}$/, `, shortDescription: '${val}'$1}`);
             }
        }

        // seoMetaDescription
        if (update.data.seoMetaDescription) {
             const val = update.data.seoMetaDescription.replace(/'/g, "\\'");
             if (block.includes('seoMetaDescription:')) {
                 block = block.replace(/seoMetaDescription:\s*'[^']*'/, `seoMetaDescription: '${val}'`);
             } else {
                 block = block.replace(/,(\s*)\}$/, `, seoMetaDescription: '${val}'$1}`);
             }
        }

        // seoTags
        if (update.data.seoTags) {
             const val = update.data.seoTags.replace(/'/g, "\\'");
             if (block.includes('seoTags:')) {
                 block = block.replace(/seoTags:\s*'[^']*'/, `seoTags: '${val}'`);
             } else {
                 block = block.replace(/,(\s*)\}$/, `, seoTags: '${val}'$1}`);
             }
        }

        content = content.replace(match[0], block);
    }
  }

  fs.writeFileSync('src/lib/firebase/seed.ts', content);
  console.log('seed.ts updated!');
}

run().catch(console.error);

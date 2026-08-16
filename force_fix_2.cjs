const fs = require('fs');
let shop = fs.readFileSync('src/pages/Shop.tsx', 'utf8');

shop = shop.replace("EyeArrowRight", "Eye,\nArrowRight");
fs.writeFileSync('src/pages/Shop.tsx', shop);

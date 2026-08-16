const fs = require('fs');
let shop = fs.readFileSync('src/pages/Shop.tsx', 'utf8');

// There is some invisible character or it's on a new line!
shop = shop.replace(/Eye\s*ArrowRight/g, "Eye, ArrowRight");
fs.writeFileSync('src/pages/Shop.tsx', shop);

const fs = require('fs');
let shop = fs.readFileSync('src/pages/Shop.tsx', 'utf8');

const regex = /EyeArrowRight,/;
console.log("Matches:", shop.match(regex));

shop = shop.replace("EyeArrowRight,", "Eye,\nArrowRight,");
fs.writeFileSync('src/pages/Shop.tsx', shop);

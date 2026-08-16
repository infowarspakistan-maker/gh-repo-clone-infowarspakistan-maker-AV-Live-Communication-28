export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand: string;
}

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const cart = localStorage.getItem('avlive_cart');
  return cart ? JSON.parse(cart) : [];
}

export function addToCart(product: any, quantity: number = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  
  // Robust price fallback resolution to ensure a numeric, valid price
  let resolvedPrice = 0;
  if (typeof product.price === 'number' && product.price > 0) {
    resolvedPrice = product.price;
  } else if (typeof product.salePrice === 'number' && product.salePrice > 0) {
    resolvedPrice = product.salePrice;
  } else if (typeof product.regularPrice === 'number' && product.regularPrice > 0) {
    resolvedPrice = product.regularPrice;
  } else if (product.price) {
    const parsed = parseFloat(product.price);
    if (!isNaN(parsed)) resolvedPrice = parsed;
  } else if (product.regularPrice) {
    const parsed = parseFloat(product.regularPrice);
    if (!isNaN(parsed)) resolvedPrice = parsed;
  }

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name || product.productName || 'Equipment Item',
      price: resolvedPrice,
      quantity: quantity,
      image: product.image || (product.images && product.images[0]) || 'https://placehold.co/600x600?text=No+Image',
      brand: product.brand || 'AV Live'
    });
  }
  
  localStorage.setItem('avlive_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
}

export function removeFromCart(id: string | number) {
  const cart = getCart().filter(item => item.id !== id);
  localStorage.setItem('avlive_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
}

export function updateQuantity(id: string | number, quantity: number) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.quantity = Math.max(1, quantity);
    localStorage.setItem('avlive_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
  }
}

export function clearCart() {
  localStorage.removeItem('avlive_cart');
  window.dispatchEvent(new Event('cart-updated'));
}

export function getCartTotal() {
  return getCart().reduce((acc, item) => acc + (item.price * item.quantity), 0);
}

export function getCartCount() {
  return getCart().reduce((acc, item) => acc + item.quantity, 0);
}

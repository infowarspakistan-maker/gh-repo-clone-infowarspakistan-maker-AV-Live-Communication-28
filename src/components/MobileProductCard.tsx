import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, Check } from 'lucide-react';
import { Product } from '../lib/firebase/firestore-helpers';
import { getCanonicalProductSlug, getProductHref, resolveProductPricing } from '../lib/gmc-feed';
import { optimizeGalleryImageUrl } from '../lib/image-optimize';
import { buildProductImageSeo } from '../lib/image-seo';
import { BlurProductImage } from './BlurProductImage';
import { addToCart } from '../lib/cart';
import { useCurrency } from '../contexts/CurrencyContext';

export interface MobileProductCardProps {
  product: Product;
  eager?: boolean;
  priority?: boolean;
  subtitle?: string;
}

export const MobileProductCard: React.FC<MobileProductCardProps> = ({
  product,
  eager = false,
  priority = false,
  subtitle,
}) => {
  const [justAdded, setJustAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { formatPrice } = useCurrency();

  const canonicalSlug = getCanonicalProductSlug(product, product.id);
  const productHref = getProductHref(product, product.id);
  const { effectivePrice, regularPrice, hasSale } = resolveProductPricing(product);

  const rawImages = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
      ? [product.images]
      : product.image
        ? [product.image]
        : [];

  const imageUrl = optimizeGalleryImageUrl(
    rawImages[0] || '/images/products/poly-x70-studio.webp',
    360,
    75
  );

  const brandName = product.brand || 'AV Live';
  const imgSeo = buildProductImageSeo(product, imageUrl, 0);
  const stockLabel =
    subtitle ||
    ((product.stockQuantity ?? 10) > 0 ? 'In Stock' : 'Built to Order');

  const handleQuickAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id || canonicalSlug,
      name: product.productName,
      price: effectivePrice,
      image: imageUrl,
      brand: brandName,
    } as any);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  const handleToggleFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
  };

  return (
    <article className="bg-white rounded-xl p-2.5 border border-gray-100 shadow-[0_2px_8px_rgba(11,19,43,0.04)] hover:border-[#00B4D8]/40 transition-all flex flex-col justify-between relative group">
      <div className="relative">
        <Link
          to={productHref}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B4D8] rounded-lg"
        >
          <div className="relative aspect-[4/3] rounded-lg bg-[#F8F9FA] overflow-hidden mb-2 flex items-center justify-center p-2">
            <BlurProductImage
              loading={eager ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding="async"
              width={240}
              height={180}
              src={imageUrl}
              seed={canonicalSlug}
              title={imgSeo.title}
              alt={imgSeo.alt}
              className="relative z-10 w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <h3 className="text-xs sm:text-sm font-black text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors line-clamp-2 min-h-[2.25rem] leading-snug">
            {product.productName}
          </h3>

          <p className="text-xs text-gray-500 font-semibold mt-1 truncate">
            {brandName} <span aria-hidden="true">·</span> {stockLabel}
          </p>
        </Link>

        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? `Remove ${product.productName} from saved items` : `Save ${product.productName}`}
          aria-pressed={isFavorite}
          className="absolute top-1 right-1 -m-1.5 p-1.5 w-10 h-10 flex items-center justify-center z-10 cursor-pointer"
        >
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center shadow-xs transition-colors ${
              isFavorite
                ? 'bg-rose-500 text-white'
                : 'bg-white/95 text-rose-500 hover:bg-rose-50'
            }`}
          >
            <Heart size={12} fill="currentColor" />
          </span>
        </button>
      </div>

      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100 gap-1.5">
        <div className="min-w-0">
          <span className="block text-xs sm:text-sm font-black text-[#1A2B4C] truncate">
            {formatPrice(effectivePrice)}
          </span>
          {hasSale && regularPrice > effectivePrice && (
            <span className="block text-xs text-gray-400 line-through font-bold truncate">
              {formatPrice(regularPrice)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleQuickAdd}
          aria-label={`Add ${product.productName} to cart`}
          className="-m-1.5 p-1.5 w-10 h-10 flex items-center justify-center shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B4D8] rounded-full"
        >
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition-all active:scale-95 ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-[#1A2B4C] hover:bg-[#00B4D8] text-white'
            }`}
          >
            {justAdded ? (
              <Check size={13} strokeWidth={2.75} />
            ) : (
              <Plus size={13} strokeWidth={2.5} />
            )}
          </span>
        </button>
      </div>
    </article>
  );
};

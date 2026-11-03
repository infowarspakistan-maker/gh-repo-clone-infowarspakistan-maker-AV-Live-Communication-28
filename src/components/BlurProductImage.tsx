import React, { useState, useEffect, useRef } from 'react';
import { getProductBlurDataUri, getProductBlurHash } from '../lib/image-optimize';

export interface BlurProductImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  seed?: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  decoding?: 'sync' | 'async' | 'auto';
  className?: string;
  placeholderClassName?: string;
}

/**
 * CLS-Zero Product Listing Image with synchronous low-resolution base64 data-URI
 * placeholder (BlurHash LQIP) and locked intrinsic dimensions.
 */
export const BlurProductImage: React.FC<BlurProductImageProps> = ({
  src,
  alt,
  width,
  height,
  seed,
  loading = 'lazy',
  fetchPriority = 'auto',
  decoding = 'async',
  className = 'w-full h-full object-contain',
  placeholderClassName = 'absolute inset-0 w-full h-full object-cover',
}) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const lookupSeed = seed || src;
  const blurDataUri = getProductBlurDataUri(lookupSeed, 32, 24);
  const blurHash = getProductBlurHash(lookupSeed);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  return (
    <>
      <img
        src={blurDataUri}
        alt=""
        aria-hidden="true"
        data-blurhash={blurHash}
        width={width}
        height={height}
        decoding="sync"
        className={`${placeholderClassName} pointer-events-none select-none blur-md scale-105 transition-opacity duration-300 ${
          loaded ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding={decoding}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`${className} transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </>
  );
};

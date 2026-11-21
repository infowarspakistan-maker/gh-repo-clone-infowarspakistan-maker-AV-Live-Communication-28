import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, X, Tag, Check } from 'lucide-react';
import {
  GOOGLE_PRODUCT_TAXONOMY,
  GoogleTaxonomyCategory,
  searchGoogleTaxonomy,
} from '../../lib/google-taxonomy';

interface GoogleCategoryAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  id?: string;
  placeholder?: string;
}

export function GoogleCategoryAutocomplete({
  value,
  onChange,
  required = false,
  id = 'google_product_category',
  placeholder = 'Search Google taxonomy by name or ID (e.g., 283 or Video Conferencing)...',
}: GoogleCategoryAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const results = useMemo(() => searchGoogleTaxonomy(query, 20), [query]);

  const matchedTaxonomy = useMemo(
    () =>
      GOOGLE_PRODUCT_TAXONOMY.find(
        (c) => c.path.toLowerCase() === value.trim().toLowerCase() || String(c.id) === value.trim()
      ),
    [value]
  );

  const handleSelect = (category: GoogleTaxonomyCategory) => {
    onChange(category.path);
    setQuery(category.path);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % Math.max(results.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1));
    } else if (e.key === 'Enter' && results[highlightedIndex]) {
      e.preventDefault();
      handleSelect(results[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search
          size={15}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          id={id}
          name="google_product_category"
          type="text"
          required={required}
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          onFocus={() => {
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onChange={(e) => {
            const nextVal = e.target.value;
            setQuery(nextVal);
            onChange(nextVal);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-20 py-3.5 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-semibold text-[#1A2B4C] transition-all text-sm"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                onChange('');
                setIsOpen(true);
              }}
              aria-label="Clear Google category"
              className="p-1 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle Google taxonomy dropdown"
            className="p-1 text-gray-400 hover:text-[#1A2B4C] rounded-lg transition-colors"
          >
            <ChevronDown size={15} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {matchedTaxonomy && (
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-emerald-700 font-semibold">
          <Check size={13} className="shrink-0" />
          <span>Official Google Taxonomy ID: {matchedTaxonomy.id}</span>
        </div>
      )}

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 mt-1.5 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-2xl shadow-xl z-50 divide-y divide-gray-50"
        >
          {results.length === 0 ? (
            <div className="px-4 py-4 text-xs text-gray-500 font-medium">
              No taxonomy match for &ldquo;{query}&rdquo;. You can still enter a custom Google Taxonomy ID or path.
            </div>
          ) : (
            results.map((cat, idx) => {
              const isSelected = cat.path === value;
              const isHighlighted = idx === highlightedIndex;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(cat);
                  }}
                  className={`w-full text-left px-4 py-3 flex items-start justify-between gap-3 transition-colors ${
                    isHighlighted ? 'bg-[#00B4D8]/10' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#1A2B4C] leading-snug break-words">
                      {cat.path}
                    </div>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[#1A2B4C] text-[10px] font-mono font-bold">
                    <Tag size={10} className="text-[#00B4D8]" />
                    ID: {cat.id}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

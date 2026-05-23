'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Item, getAllItems } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailSheet } from '@/components/ProductDetailSheet';
import { SkeletonGrid } from '@/components/SkeletonGrid';
import { Toast } from '@/components/Toast';

export default function SearchPage() {
  const { merchants } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);

  // States
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sheet & Toast States
  const [activeProduct, setActiveProduct] = useState<Item | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Fetch all items on mount
  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true);
      setError(null);
      const res = await getAllItems();
      if (res.data) {
        setItems(res.data);
      } else if (res.error) {
        setError(res.error);
      }
      setIsLoading(false);
    };
    fetchCatalog();
  }, []);

  const handleShowToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
  };

  const getMerchantName = (merchantId: string) => {
    const merchant = merchants.find((m) => m.id === merchantId);
    return merchant ? merchant.name : 'Luxury Tailor';
  };

  // Client-side search filtering
  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true; // browse all if search is empty

    const nameMatch = item.name.toLowerCase().includes(q);
    const descMatch = (item.description || '').toLowerCase().includes(q);
    const brandMatch = getMerchantName(item.merchant_id).toLowerCase().includes(q);

    return nameMatch || descMatch || brandMatch;
  });

  return (
    <div className="flex-1 bg-[#111111] min-h-screen flex flex-col px-6 py-6 space-y-6 animate-fade-in pb-28">
      {/* Page Header */}
      <div className="space-y-1">
        <span className="text-[10px] font-extrabold tracking-[0.25em] text-[#C9B99A] uppercase">AI Tailoring Search</span>
        <h1 className="text-xl font-bold tracking-tight text-[#FAF0E6] uppercase">Bespoke Catalog</h1>
      </div>

      {/* Styled Search input box */}
      <div className="w-full relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by designer, custom garment name, details..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0A0A0A] border border-[#1F1C1A] rounded-2xl pl-12 pr-10 py-4 text-[#FAF0E6] placeholder-[#C9B99A]/45 focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-all text-sm font-semibold tracking-wide"
        />
        {/* Search magnifying icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9B99A]/40">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
          </svg>
        </div>
        {/* Clear query button */}
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C9B99A] hover:text-[#FAF0E6]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results Section */}
      <div className="flex-1 space-y-4">
        {isLoading ? (
          <SkeletonGrid />
        ) : error ? (
          <div className="p-6 rounded-2xl border border-red-500/25 bg-red-500/5 text-center text-xs font-semibold text-red-400">
            {error}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold tracking-wider text-[#C9B99A]/60 uppercase">
              {searchQuery ? 'SEARCH RESULTS' : 'AGGREGATED CATALOG SHOWCASE'} ({filteredItems.length})
            </span>
            <div className="grid grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  merchantName={getMerchantName(item.merchant_id)}
                  onTap={setActiveProduct}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center border border-[#1F1C1A] rounded-2xl bg-[#0A0A0A] space-y-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-[#C9B99A]/30 mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#FAF0E6]">No tailored matching results</p>
              <p className="text-[10px] text-[#C9B99A]/75 font-semibold">Tweak spelling or try looking for a different garment term.</p>
            </div>
          </div>
        )}
      </div>

      {/* Product detail drawer */}
      {activeProduct && (
        <ProductDetailSheet
          item={activeProduct}
          merchantName={getMerchantName(activeProduct.merchant_id)}
          onClose={() => setActiveProduct(null)}
          onShowToast={handleShowToast}
        />
      )}

      {/* Micro system notifications */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}

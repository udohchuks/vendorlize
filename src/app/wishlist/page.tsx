'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Item, inferCategory } from '@/lib/api';
import { CategoryPills } from '@/components/CategoryPills';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailSheet } from '@/components/ProductDetailSheet';
import { Toast } from '@/components/Toast';

export default function WishlistPage() {
  const { wishlist, merchants } = useApp();

  // States
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProduct, setActiveProduct] = useState<Item | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const handleShowToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
  };

  const getMerchantName = (merchantId: string) => {
    const merchant = merchants.find((m) => m.id === merchantId);
    return merchant ? merchant.name : 'Luxury Tailor';
  };

  // Compute dynamic categories based *only* on wishlisted items
  const getDynamicCategories = () => {
    const categoriesSet = new Set<string>();
    categoriesSet.add('All');
    
    wishlist.forEach((item) => {
      const cat = inferCategory(item.name, item.description);
      categoriesSet.add(cat);
    });

    return Array.from(categoriesSet);
  };

  const dynamicCategories = getDynamicCategories();

  // Filter wishlist by category
  const filteredWishlist = wishlist.filter((item) => {
    if (selectedCategory === 'All') return true;
    const cat = inferCategory(item.name, item.description);
    return cat === selectedCategory;
  });

  return (
    <div className="flex-1 bg-[#111111] min-h-screen flex flex-col px-6 py-6 space-y-6 animate-fade-in pb-28">
      {/* Page Header */}
      <div className="space-y-1">
        <span className="text-[10px] font-extrabold tracking-[0.25em] text-[#C9B99A] uppercase">Tailored Fitting Room</span>
        <h1 className="text-xl font-bold tracking-tight text-[#FAF0E6] uppercase">Your Wishlist</h1>
      </div>

      {wishlist.length > 0 ? (
        <div className="flex-1 space-y-6 flex flex-col">
          {/* Category Filter Pills (Dynamic) */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold tracking-wider text-[#C9B99A]/55 uppercase">FILTER WISHLIST</span>
            <CategoryPills
              categories={dynamicCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          {/* Product list */}
          <div className="flex-1 space-y-3">
            <span className="text-[10px] font-extrabold tracking-wider text-[#C9B99A]/60 uppercase">
              WISHLISTED ITEMS ({filteredWishlist.length})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredWishlist.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  merchantName={getMerchantName(item.merchant_id)}
                  onTap={setActiveProduct}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Styled Empty State */
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-5">
          <div className="w-20 h-20 rounded-full border border-[#1F1C1A] bg-[#0A0A0A] flex items-center justify-center text-[#C9B99A]/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.2"
              stroke="currentColor"
              className="w-10 h-10"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </div>
          
          <div className="space-y-1.5 max-w-[280px]">
            <h3 className="text-sm font-bold text-[#FAF0E6]">Your wishlist is currently empty</h3>
            <p className="text-[11px] text-[#C9B99A]/75 leading-relaxed font-semibold">
              Browse the aggregated showcase and tap the heart icon on any custom garment to pin it here.
            </p>
          </div>

          <Link
            href="/"
            className="px-6 py-3.5 bg-gradient-to-r from-[#D4A853] to-[#C9B99A] text-[#0A0A0A] font-black text-xs rounded-xl tracking-wider uppercase hover:shadow-[0_0_15px_rgba(212,168,83,0.3)] transition-all duration-300"
          >
            Explore Showcase
          </Link>
        </div>
      )}

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

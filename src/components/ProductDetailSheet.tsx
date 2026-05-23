'use client';

import React, { useState, useEffect } from 'react';
import { Item, getImageUrl, formatPrice, buildWhatsAppLink } from '@/lib/api';
import { useApp } from '@/context/AppContext';

interface ProductDetailSheetProps {
  item: Item | null;
  merchantName: string;
  onClose: () => void;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Chest measurements bounds for recommending sizes
function getRecommendedSize(chest: number): string {
  if (chest < 36) return 'XS';
  if (chest >= 36 && chest < 38) return 'S';
  if (chest >= 38 && chest < 41) return 'M';
  if (chest >= 41 && chest < 44) return 'L';
  if (chest >= 44 && chest < 48) return 'XL';
  return 'XXL';
}

export const ProductDetailSheet: React.FC<ProductDetailSheetProps> = ({
  item,
  merchantName,
  onClose,
  onShowToast,
}) => {
  const { userProfile, addToCart, toggleWishlist, isWishlisted, merchants } = useApp();
  const [selectedSize, setSelectedSize] = useState<string>('M');

  // Compute recommended size when sheet opens and profile exists
  useEffect(() => {
    if (item && userProfile?.measurements?.chest) {
      const recSize = getRecommendedSize(userProfile.measurements.chest);
      setSelectedSize(recSize);
    } else {
      setSelectedSize('M');
    }
  }, [item, userProfile]);

  if (!item) return null;

  const imageUrl = item.image_urls && item.image_urls.length > 0
    ? getImageUrl(item.image_urls[0])
    : '';

  const isFav = isWishlisted(item.id);

  // Find merchant whatsapp number
  const itemMerchant = merchants.find((m) => m.id === item.merchant_id);
  const whatsappNum = itemMerchant?.whatsapp_number || '233599835025';

  const handleAddToCart = () => {
    if (!item.in_stock) return;
    addToCart(item, merchantName, selectedSize);
    onShowToast(`Added ${item.name} (${selectedSize}) to cart!`, 'success');
    onClose();
  };

  const handleDirectWhatsApp = () => {
    const textMessage = `Hello! I would like to order the custom-tailored "${item.name}" (Size: ${selectedSize}, Price: ${formatPrice(item.price_minor, item.currency)}) from your Clothify showcase, powered by Phasion Sense. My measurements are:\n- Chest: ${userProfile?.measurements?.chest || '--'}"\n- Waist: ${userProfile?.measurements?.waist || '--'}"\n- Hips: ${userProfile?.measurements?.hips || '--'}"\n- Height: ${userProfile?.measurements?.height || '--'}"\n- Inseam: ${userProfile?.measurements?.inseam || '--'}"\n\nPlease let me know the availability and payment details. Thank you!`;
    
    const waLink = buildWhatsAppLink(whatsappNum, textMessage);
    window.open(waLink, '_blank');
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end animate-fade-in bg-black/60 backdrop-blur-sm">
      {/* Backdrop tap zone */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Detail Bottom Drawer */}
      <div className="w-full bg-[#111111] border-t border-[#1F1C1A] rounded-t-[32px] max-h-[92vh] flex flex-col animate-slide-up shadow-[0_-8px_32px_rgba(0,0,0,0.6)]">
        
        {/* Pull Drawer Drag Indicator */}
        <div className="w-full py-3.5 flex justify-center cursor-pointer" onClick={onClose}>
          <span className="w-12 h-1 bg-[#1F1C1A] rounded-full hover:bg-[#D4A853]/40 transition-colors" />
        </div>

        {/* Scrollable Product Details */}
        <div className="flex-1 overflow-y-auto px-6 pb-28 pt-2 space-y-6 no-scrollbar">
          
          {/* Main Hero Product Image */}
          <div className="aspect-[4/3] w-full rounded-2xl bg-[#181615] overflow-hidden relative border border-[#1F1C1A]">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#C9B99A]/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1"
                  stroke="currentColor"
                  className="w-20 h-20"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <span className="text-xs uppercase font-extrabold tracking-widest mt-3">Product Image Unavailable</span>
              </div>
            )}

            {!item.in_stock && (
              <div className="absolute top-4 left-4 bg-[#0A0A0A]/90 backdrop-blur-md text-[#C9B99A] text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-lg border border-[#1F1C1A] uppercase">
                Out of Stock
              </div>
            )}
          </div>

          {/* Product Info Block */}
          <div className="space-y-2">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#C9B99A] uppercase">
                  {merchantName || 'LUXURY TAILOR'}
                </span>
                <h2 className="text-xl font-extrabold tracking-tight text-[#FAF0E6] uppercase leading-tight">
                  {item.name}
                </h2>
              </div>
              <span className="text-lg font-black tracking-wider text-[#D4A853] whitespace-nowrap pt-1">
                {formatPrice(item.price_minor, item.currency)}
              </span>
            </div>
            
            {item.description && (
              <p className="text-xs text-[#C9B99A]/80 leading-relaxed font-medium pt-2 border-t border-[#1F1C1A]">
                {item.description}
              </p>
            )}
          </div>

          {/* Sizing Recommendations panel */}
          {userProfile ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#D4A853]/5 to-[#C9B99A]/5 border border-[#D4A853]/25 flex items-start gap-3.5 shadow-inner">
              <div className="p-2.5 rounded-xl bg-[#D4A853]/10 text-[#D4A853] flex items-center justify-center mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21m0 0-.813-5.096L3.104 21M9 21h1.5M9 21H7.5m5.313-5.096L15 21m0 0 .813-5.096L20.896 21M15 21h1.5M15 21h-1.5M9 13.5h6m-6-3h6m-6-3h6m-3-3V18" />
                </svg>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold tracking-wider text-[#D4A853] uppercase">AI FIT FINDER RECOMENDATION</span>
                <p className="text-xs font-semibold text-[#FAF0E6] leading-relaxed">
                  Clothify suggests size <span className="text-[#D4A853] font-black underline">{getRecommendedSize(userProfile.measurements.chest)}</span> based on your <span className="text-[#C9B99A] capitalize">{userProfile.bodyType}</span> silhouette ({userProfile.measurements.chest}" Chest).
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#181615] border border-[#1F1C1A] flex items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <span className="text-[9px] font-extrabold tracking-wider text-[#C9B99A] uppercase">PERFECT FIT INSURED</span>
                <p className="text-[11px] text-[#C9B99A]/70 font-medium">
                  Create a physical silhouette profile to unlock custom tailored size recommendations.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  window.location.href = '/onboarding';
                }}
                className="flex-shrink-0 bg-transparent hover:bg-[#FAF0E6]/5 border border-[#C9B99A]/40 text-[#FAF0E6] font-bold text-[10px] tracking-wider px-3.5 py-2.5 rounded-xl uppercase transition-all duration-300"
              >
                Setup AI Fit
              </button>
            </div>
          )}

          {/* Size Selector pills */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C9B99A]">Select Fitting Size</span>
            <div className="grid grid-cols-6 gap-2">
              {SIZES.map((size) => {
                const isSelected = selectedSize === size;
                const isRecommended = userProfile && getRecommendedSize(userProfile.measurements.chest) === size;
                
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 rounded-xl text-xs font-bold tracking-wider relative flex items-center justify-center transition-all duration-300 border ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#FAF0E6] to-[#D4A853] text-[#0A0A0A] border-[#D4A853] shadow-[0_4px_12px_rgba(212,168,83,0.3)] font-black scale-105'
                        : 'bg-[#0A0A0A] border-[#1F1C1A] text-[#C9B99A] hover:border-[#FAF0E6]/20'
                    }`}
                  >
                    {size}
                    {isRecommended && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#D4A853] rounded-full border border-[#111111]" title="AI Recommended" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Absolute Footer Buttons */}
        <div className="absolute bottom-0 left-0 right-0 z-40 bg-[#111111]/95 backdrop-blur-md border-t border-[#1F1C1A] px-6 py-4 flex gap-3 shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
          {/* Wishlist toggle */}
          <button
            onClick={() => {
              toggleWishlist(item);
              onShowToast(isFav ? `Removed ${item.name} from Wishlist` : `Saved ${item.name} to Wishlist!`, 'success');
            }}
            className={`p-3.5 rounded-xl border flex items-center justify-center transition-all duration-300 ${
              isFav
                ? 'border-[#D4A853]/50 bg-[#D4A853]/10 text-[#D4A853]'
                : 'border-[#1F1C1A] bg-[#0A0A0A] text-[#C9B99A] hover:text-[#FAF0E6]'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isFav ? '#D4A853' : 'none'}
              stroke="currentColor"
              strokeWidth="2.2"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </button>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAddToCart}
            disabled={!item.in_stock}
            className={`flex-1 py-3.5 rounded-xl font-bold tracking-wider text-xs uppercase transition-all duration-300 border ${
              !item.in_stock
                ? 'bg-[#1F1C1A] border-transparent text-[#C9B99A]/40 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#D4A853] to-[#C9B99A] hover:from-[#C29642] hover:to-[#B5A586] text-[#0A0A0A] border-transparent font-black shadow-[0_4px_16px_rgba(212,168,83,0.2)] hover:shadow-[0_4px_24px_rgba(212,168,83,0.35)] hover:scale-[1.01]'
            }`}
          >
            {item.in_stock ? `Add to Cart • Size ${selectedSize}` : 'Sold Out'}
          </button>

          {/* Buy directly on WhatsApp (Green Call to Action) */}
          <button
            onClick={handleDirectWhatsApp}
            className="p-3.5 bg-[#25D366] hover:bg-[#20BA56] text-[#FAF0E6] rounded-xl flex items-center justify-center transition-all duration-300 shadow-[0_4px_12px_rgba(37,211,102,0.25)]"
            title="Buy Directly via WhatsApp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-[#FAF0E6]">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.787-1.451L0 24zm6.59-4.846c1.66.986 3.298 1.488 4.966 1.493 5.485.002 9.948-4.46 9.95-9.95.002-2.66-1.033-5.161-2.91-7.04C16.78 1.776 14.28 1.74 11.62 1.74c-5.488 0-9.954 4.464-9.957 9.954-.001 1.832.493 3.626 1.429 5.219l-.934 3.41 3.498-.918z" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};

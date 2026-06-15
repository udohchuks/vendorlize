'use client';

import React, { useState, useRef } from 'react';
import { Item, getImageUrl, formatPrice } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

interface TikTokProductFeedProps {
  items: Item[];
  getMerchantName: (merchantId: string) => string;
  onShowToast: (message: string, type: 'success' | 'error') => void;
  onExploreCampaign?: () => void;
}

export const TikTokProductFeed: React.FC<TikTokProductFeedProps> = ({
  items,
  getMerchantName,
  onShowToast,
}) => {
  const router = useRouter();
  const { toggleWishlist, isWishlisted, addToCart, merchants } = useApp();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [showSizePicker, setShowSizePicker] = useState<string | null>(null); // item ID
  const [heartAnim, setHeartAnim] = useState<string | null>(null); // item ID for double tap or like click animation

  const handleLike = (e: React.MouseEvent, item: Item) => {
    e.stopPropagation();
    toggleWishlist(item);
    const wishlisted = isWishlisted(item.id);
    if (!wishlisted) {
      setHeartAnim(item.id);
      setTimeout(() => setHeartAnim(null), 1000);
      onShowToast(`Pinned ${item.name} to Wishlist!`, 'success');
    } else {
      onShowToast(`Removed ${item.name} from Wishlist.`, 'success');
    }
  };

  const handleAddToCartClick = (e: React.MouseEvent, item: Item) => {
    e.stopPropagation();
    setShowSizePicker(item.id);
  };

  const selectSizeAndAdd = (item: Item, size: string) => {
    const merchantName = getMerchantName(item.merchant_id);
    addToCart(item, merchantName, size);
    setShowSizePicker(null);
    onShowToast(`Added "${item.name}" (Size: ${size}) to Basket!`, 'success');
  };

  const handleTryOn = (e: React.MouseEvent, item: Item) => {
    e.stopPropagation();
    // Add to wishlist first so it is available in the studio, then route to studio
    const wishlisted = isWishlisted(item.id);
    if (!wishlisted) {
      toggleWishlist(item);
    }
    // Navigate to studio with search param
    router.push(`/studio?itemId=${item.id}`);
  };

  const handleShare = (e: React.MouseEvent, item: Item) => {
    e.stopPropagation();
    const merchantName = getMerchantName(item.merchant_id);
    const text = `Hey! Look at this gorgeous custom "${item.name}" by designer "${merchantName}" I found on Clothify! It fits bespoke to my silhouette. ${window.location.origin}`;
    
    // Find merchant whatsapp to fallback or default
    const merchantInfo = merchants.find((m) => m.id === item.merchant_id);
    const whatsappNum = merchantInfo?.whatsapp_number || '233599835025';
    
    const cleanPhone = whatsappNum.replace(/[^0-9+]/g, '');
    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    
    window.open(url, '_blank');
    onShowToast('WhatsApp Share dispatched!', 'success');
  };

  const getMerchantLogo = (merchantId: string) => {
    const merchant = merchants.find((m) => m.id === merchantId);
    return merchant?.logo_url ? getImageUrl(merchant.logo_url) : '/logo.jpg';
  };

  return (
    <div className="w-full h-[calc(100vh-200px)] snap-container-y rounded-3xl border border-[#1F1C1A] bg-[#0A0A0A] relative">
      {items.map((item) => {
        const wishlisted = isWishlisted(item.id);
        const imageUrl = item.image_urls && item.image_urls.length > 0
          ? getImageUrl(item.image_urls[0])
          : '';
        const merchantName = getMerchantName(item.merchant_id);
        const handleName = merchantName.toLowerCase().replace(/[^a-z0-9]/g, '');

        return (
          <div
            key={item.id}
            className="w-full h-full snap-item-y relative flex flex-col justify-end bg-[#0A0A0A]"
          >
            {/* Background Model Image */}
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-[#181615] via-[#111111] to-[#0A0A0A] flex items-center justify-center text-[#C9B99A]/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="w-16 h-16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
            )}

            {/* Dark Bottom & Side Vignette Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/30 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-black/50 to-transparent pointer-events-none" />

            {/* Floating Double Tap Heart Animation */}
            {heartAnim === item.id && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-[ping_0.8s_ease-out_infinite]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="#D4A853"
                  className="w-24 h-24 text-[#D4A853] drop-shadow-[0_0_15px_rgba(212,168,83,0.6)]"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
            )}

            {/* Right Action Stack */}
            <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-20">
              {/* Merchant Profile Avatar */}
              <div className="flex flex-col items-center gap-1 group">
                <div className="w-11 h-11 rounded-full border-2 border-[#D4A853] p-[1.5px] bg-[#0A0A0A] overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
                  <img
                    src={getMerchantLogo(item.merchant_id)}
                    alt={merchantName}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="w-4 h-4 bg-[#D4A853] text-[#0A0A0A] rounded-full flex items-center justify-center text-[10px] font-black -mt-3.5 border border-[#111111] z-10">
                  +
                </div>
              </div>

              {/* Heart Button */}
              <button
                onClick={(e) => handleLike(e, item)}
                className="flex flex-col items-center gap-1 text-[#C9B99A] hover:text-[#D4A853] transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-[#111111]/70 backdrop-blur-md border border-[#1F1C1A] flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={wishlisted ? '#D4A853' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`w-5 h-5 ${wishlisted ? 'text-[#D4A853]' : ''}`}
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
                <span className="text-[9px] font-extrabold tracking-wider text-[#C9B99A] uppercase">
                  {wishlisted ? 'Liked' : 'Like'}
                </span>
              </button>

              {/* Cart Button */}
              <button
                onClick={(e) => handleAddToCartClick(e, item)}
                className="flex flex-col items-center gap-1 text-[#C9B99A] hover:text-[#D4A853] transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-[#111111]/70 backdrop-blur-md border border-[#1F1C1A] flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>
                <span className="text-[9px] font-extrabold tracking-wider text-[#C9B99A] uppercase">Add</span>
              </button>

              {/* Try On Studio Button */}
              <button
                onClick={(e) => handleTryOn(e, item)}
                className="flex flex-col items-center gap-1 text-[#C9B99A] hover:text-[#D4A853] transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-[#111111]/70 backdrop-blur-md border border-[#1F1C1A] flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <path d="M20.38 3.46L16 7.84M20.38 3.46a2 2 0 0 1 0 2.83l-14 14a2 2 0 0 1-2.83-2.83l14-14a2 2 0 0 1 2.83 0z" />
                    <path d="M19 16c-.5 0-1 .5-1 1s-.5 1-1 1 1 .5 1 1 .5 1 1 1 1-.5 1-1-.5-1-1-1z" />
                  </svg>
                </div>
                <span className="text-[9px] font-extrabold tracking-wider text-[#C9B99A] uppercase">Fit</span>
              </button>

              {/* Share Button */}
              <button
                onClick={(e) => handleShare(e, item)}
                className="flex flex-col items-center gap-1 text-[#C9B99A] hover:text-[#D4A853] transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-[#111111]/70 backdrop-blur-md border border-[#1F1C1A] flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 text-[#C9B99A]"
                  >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.787-1.451L0 24zm6.59-4.846c1.66.986 3.298 1.488 4.966 1.493 5.485.002 9.948-4.46 9.95-9.95.002-2.66-1.033-5.161-2.91-7.04C16.78 1.776 14.28 1.74 11.62 1.74c-5.488 0-9.954 4.464-9.957 9.954-.001 1.832.493 3.626 1.429 5.219l-.934 3.41 3.498-.918z" />
                  </svg>
                </div>
                <span className="text-[9px] font-extrabold tracking-wider text-[#C9B99A] uppercase">Share</span>
              </button>
            </div>

            {/* Bottom Left Information Overlays */}
            <div className="absolute left-6 bottom-6 right-24 space-y-3.5 z-20 pointer-events-auto">
              <div className="space-y-1">
                {/* Designer Username Badge */}
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-[#FAF0E6] tracking-wide hover:underline cursor-pointer">
                    @{handleName}
                  </span>
                  {/* Verified Icon */}
                  <span className="bg-[#D4A853] text-[#0A0A0A] rounded-full p-0.5 flex items-center justify-center text-[7px] font-black w-3.5 h-3.5">
                    ✓
                  </span>
                </div>

                {/* Product Name */}
                <h3 className="text-base font-extrabold text-[#FAF0E6] uppercase tracking-wide drop-shadow-md">
                  {item.name}
                </h3>

                {/* Product Description */}
                {item.description && (
                  <p className="text-[11px] text-[#C9B99A]/85 font-semibold leading-relaxed line-clamp-2 drop-shadow-sm max-w-[90%]">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Pricing & Try On row */}
              <div className="flex items-center gap-3.5">
                {/* Price tag */}
                <div className="bg-[#D4A853]/15 border border-[#D4A853]/35 rounded-xl px-3.5 py-1.5 backdrop-blur-md">
                  <span className="text-xs font-black tracking-wider text-[#D4A853]">
                    {formatPrice(item.price_minor, item.currency)}
                  </span>
                </div>

                {/* Try On Pill */}
                <button
                  onClick={(e) => handleTryOn(e, item)}
                  className="bg-gradient-to-r from-[#D4A853] to-[#C9B99A] hover:from-[#C29642] hover:to-[#B5A586] text-[#0A0A0A] font-black text-[10px] tracking-wider px-4 py-2.5 rounded-full uppercase shadow-md flex items-center gap-1.5 hover:shadow-[0_0_12px_rgba(212,168,83,0.35)] transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="w-3.5 h-3.5 text-[#0A0A0A]"
                  >
                    <path d="M20.38 3.46L16 7.84M20.38 3.46a2 2 0 0 1 0 2.83l-14 14a2 2 0 0 1-2.83-2.83l14-14a2 2 0 0 1 2.83 0z" />
                  </svg>
                  Try On Fit
                </button>
              </div>
            </div>

            {/* Inline Size Selector Popup */}
            {showSizePicker === item.id && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-30 flex items-center justify-center p-6 animate-fade-in">
                <div className="w-full max-w-[280px] bg-[#111111] border border-[#1F1C1A] rounded-2xl p-5 space-y-4 shadow-2xl animate-slide-up">
                  <div className="text-center space-y-1">
                    <span className="text-[8px] font-black tracking-wider text-[#D4A853] uppercase">BAG ADDITION</span>
                    <h4 className="text-xs font-bold text-[#FAF0E6] uppercase truncate">{item.name}</h4>
                    <p className="text-[10px] text-[#C9B99A]/75 font-semibold">Select your fitting room size:</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                      <button
                        key={size}
                        onClick={() => selectSizeAndAdd(item, size)}
                        className="py-3 bg-[#0A0A0A] border border-[#1F1C1A] hover:border-[#D4A853] text-[#C9B99A] hover:text-[#D4A853] font-bold text-xs rounded-xl transition-all"
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowSizePicker(null)}
                    className="w-full py-2.5 bg-[#0A0A0A] border border-[#1F1C1A] text-[10px] text-[#C9B99A]/50 hover:text-red-500 font-bold uppercase rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

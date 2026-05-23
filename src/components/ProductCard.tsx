'use client';

import React from 'react';
import { Item, getImageUrl, formatPrice } from '@/lib/api';
import { useApp } from '@/context/AppContext';

interface ProductCardProps {
  item: Item;
  merchantName: string;
  onTap: (item: Item) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  merchantName,
  onTap,
}) => {
  const { toggleWishlist, isWishlisted } = useApp();
  const wishlisted = isWishlisted(item.id);

  const imageUrl = item.image_urls && item.image_urls.length > 0
    ? getImageUrl(item.image_urls[0])
    : '';

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the detail sheet
    toggleWishlist(item);
  };

  return (
    <div
      onClick={() => onTap(item)}
      className="flex flex-col bg-[#111111] border border-[#1F1C1A] rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:border-[#D4A853]/40 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] animate-fade-in relative"
    >
      {/* Product Image Section */}
      <div className="aspect-[3/4] w-full bg-[#181615] relative overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[#C9B99A]/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.2"
              stroke="currentColor"
              className="w-12 h-12"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <span className="text-[10px] uppercase font-bold tracking-wider mt-2">No Image</span>
          </div>
        )}

        {/* Stock status overlay badge */}
        {!item.in_stock && (
          <div className="absolute top-3 left-3 bg-[#0A0A0A]/85 backdrop-blur-md text-[#C9B99A] text-[9px] font-black tracking-widest px-2.5 py-1 rounded-md border border-[#1F1C1A] uppercase shadow-sm">
            Out of stock
          </div>
        )}

        {/* Wishlist button overlay */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-[#111111]/80 backdrop-blur-md border border-[#1F1C1A] text-[#C9B99A] hover:text-[#D4A853] hover:border-[#D4A853]/40 transition-all duration-300 shadow-sm flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={wishlisted ? '#D4A853' : 'none'}
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-4 h-4 transition-all duration-300 ${
              wishlisted ? 'text-[#D4A853] scale-110 drop-shadow-[0_0_4px_rgba(212,168,83,0.4)]' : ''
            }`}
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
      </div>

      {/* Product Information Section */}
      <div className="p-4 flex flex-col gap-1 flex-1 justify-between">
        <div>
          <span className="text-[9px] font-bold tracking-[0.2em] text-[#C9B99A] uppercase line-clamp-1">
            {merchantName || 'LUXURY TAILOR'}
          </span>
          <h4 className="text-xs font-bold text-[#FAF0E6] tracking-wide line-clamp-1 mt-0.5 group-hover:text-[#D4A853] transition-colors duration-300 leading-snug">
            {item.name}
          </h4>
        </div>
        
        <span className="text-xs font-black tracking-wider text-[#D4A853] mt-2.5">
          {formatPrice(item.price_minor, item.currency)}
        </span>
      </div>
    </div>
  );
};

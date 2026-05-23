'use client';

import React from 'react';
import { CartItem, useApp } from '@/context/AppContext';
import { formatPrice, getImageUrl } from '@/lib/api';

interface CartItemRowProps {
  item: CartItem;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({ item, onShowToast }) => {
  const { updateQty, removeFromCart } = useApp();

  const imageUrl = getImageUrl(item.image);

  const handleRemove = () => {
    removeFromCart(item.itemId, item.size);
    onShowToast(`Removed ${item.name} from cart`, 'success');
  };

  return (
    <div className="w-full flex items-center gap-4 py-4 border-b border-[#1F1C1A] animate-fade-in group">
      {/* Item Image */}
      <div className="w-16 h-20 rounded-xl bg-[#181615] overflow-hidden border border-[#1F1C1A] flex-shrink-0 flex items-center justify-center relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="w-8 h-8 text-[#C9B99A]/30">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        )}
      </div>

      {/* Item Info Details */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold tracking-wider text-[#C9B99A] uppercase">
              {item.brand}
            </span>
            <h4 className="text-xs font-bold text-[#FAF0E6] truncate group-hover:text-[#D4A853] transition-colors leading-snug">
              {item.name}
            </h4>
          </div>
          
          <button
            onClick={handleRemove}
            className="text-[#C9B99A]/40 hover:text-red-500 p-1.5 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
            title="Remove item"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>

        {/* Fitting Size Tag and Price */}
        <div className="flex justify-between items-center pt-1.5">
          <div className="flex items-center gap-3">
            {/* Size Badge */}
            <span className="px-2 py-0.5 rounded bg-[#0A0A0A] border border-[#1F1C1A] text-[#D4A853] text-[9px] font-black tracking-widest uppercase">
              Size: {item.size}
            </span>

            {/* Price */}
            <span className="text-[11px] font-black text-[#D4A853] tracking-wider">
              {formatPrice(item.priceMinor, item.currency)}
            </span>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center bg-[#0A0A0A] border border-[#1F1C1A] rounded-xl px-1 py-0.5">
            <button
              onClick={() => updateQty(item.itemId, item.size, -1)}
              className="w-6 h-6 rounded-lg text-xs font-bold text-[#C9B99A] hover:text-[#FAF0E6] hover:bg-white/5 transition-colors flex items-center justify-center"
            >
              −
            </button>
            <span className="w-6 text-center text-xs font-bold text-[#D4A853]">
              {item.qty}
            </span>
            <button
              onClick={() => updateQty(item.itemId, item.size, 1)}
              className="w-6 h-6 rounded-lg text-xs font-bold text-[#C9B99A] hover:text-[#FAF0E6] hover:bg-white/5 transition-colors flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

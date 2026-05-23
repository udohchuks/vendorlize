'use client';

import React, { useState, useEffect } from 'react';
import { Campaign, CampaignDetail, Item, getCampaignById, getImageUrl } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';

interface CampaignDetailSheetProps {
  campaign: Campaign | null;
  merchantName: string;
  onClose: () => void;
  onProductTap: (item: Item) => void;
}

export const CampaignDetailSheet: React.FC<CampaignDetailSheetProps> = ({
  campaign,
  merchantName,
  onClose,
  onProductTap,
}) => {
  const [detail, setDetail] = useState<CampaignDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaign) return;
    
    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      
      const res = await getCampaignById(campaign.id);
      if (res.data) {
        setDetail(res.data);
      } else {
        setError(res.error || 'Failed to retrieve collection details.');
      }
      setIsLoading(false);
    };

    fetchDetail();
  }, [campaign]);

  if (!campaign) return null;

  const bannerUrl = campaign.image_urls && campaign.image_urls.length > 0
    ? getImageUrl(campaign.image_urls[0])
    : '';

  // Map campaign featured items to standard Item interface
  const mappedItems: Item[] = detail
    ? detail.featured_items.map((fi) => ({
        id: fi.id,
        merchant_id: detail.merchant?.id || campaign.merchant_id || '',
        name: fi.name,
        description: '',
        price_minor: fi.price_minor,
        currency: fi.currency || 'GHS',
        image_urls: fi.image_url ? [fi.image_url] : [],
        in_stock: fi.in_stock !== undefined ? fi.in_stock : true,
      }))
    : [];

  return (
    <div className="absolute inset-0 z-45 flex flex-col justify-end animate-fade-in bg-black/60 backdrop-blur-sm">
      {/* Backdrop click to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Campaign Widescreen Bottom Sheet Drawer */}
      <div className="w-full bg-[#111111] border-t border-[#1F1C1A] rounded-t-[32px] max-h-[92vh] flex flex-col animate-slide-up shadow-[0_-8px_32px_rgba(0,0,0,0.6)]">
        
        {/* Drag handle */}
        <div className="w-full py-3.5 flex justify-center cursor-pointer" onClick={onClose}>
          <span className="w-12 h-1 bg-[#1F1C1A] rounded-full hover:bg-[#D4A853]/40 transition-colors" />
        </div>

        {/* Scrollable sheet body */}
        <div className="flex-1 overflow-y-auto px-6 pb-12 pt-1 space-y-6 no-scrollbar">
          
          {/* Header Promotion Banner */}
          <div className="w-full aspect-[21/9] rounded-2xl bg-[#181615] overflow-hidden relative border border-[#1F1C1A]">
            {bannerUrl ? (
              <img
                src={bannerUrl}
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-[#0A0A0A] to-[#1A1817] flex items-center justify-center text-[#D4A853]/25">
                <span className="text-[10px] uppercase font-extrabold tracking-wider">Promotion Active</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />
            
            {/* Title overlay inside banner */}
            <div className="absolute bottom-4 left-4 right-4 text-left">
              <span className="text-[8px] font-black tracking-widest text-[#D4A853] uppercase">{merchantName}</span>
              <h2 className="text-sm font-extrabold text-[#FAF0E6] uppercase truncate mt-0.5">{campaign.title}</h2>
            </div>
          </div>

          {/* Copy description */}
          {campaign.copy_text && (
            <div className="space-y-1.5 text-left">
              <span className="text-[9px] font-extrabold tracking-wider text-[#C9B99A]/50 uppercase">COLLECTION OVERVIEW</span>
              <p className="text-xs text-[#C9B99A]/85 leading-relaxed font-semibold">
                {campaign.copy_text}
              </p>
            </div>
          )}

          {/* Campaign Featured items grid */}
          <div className="space-y-3.5 text-left">
            <div className="flex justify-between items-center border-b border-[#1F1C1A] pb-2">
              <span className="text-[10px] font-extrabold tracking-wider text-[#C9B99A] uppercase">
                FEATURED APPAREL ({mappedItems.length})
              </span>
              {isLoading && (
                <div className="w-3.5 h-3.5 border-2 border-[#D4A853] border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="aspect-[3/4] w-full rounded-2xl bg-[#181615] animate-shimmer" />
                ))}
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-center text-[10px] text-red-400 font-semibold">
                {error}
              </div>
            ) : mappedItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mappedItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    merchantName={merchantName}
                    onTap={onProductTap}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-[10px] text-[#C9B99A]/50 font-semibold py-4">
                No items currently featured in this collection.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { Campaign, getImageUrl } from '@/lib/api';

interface CampaignCardProps {
  campaign: Campaign;
  merchantName: string;
  onExplore: (campaign: Campaign) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  merchantName,
  onExplore,
}) => {
  const imageUrl = campaign.image_urls && campaign.image_urls.length > 0
    ? getImageUrl(campaign.image_urls[0])
    : '';

  return (
    <div className="w-full flex-shrink-0 rounded-2xl overflow-hidden relative aspect-[16/9] border border-[#1F1C1A] bg-[#181615] group animate-fade-in shadow-lg">
      {/* Background Image / Gradient Fallback */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={campaign.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-tr from-[#0A0A0A] via-[#1A1817] to-[#2E2825] flex items-center justify-center relative">
          {/* Subtle Decorative Pattern */}
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#D4A853_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1"
            stroke="currentColor"
            className="w-16 h-16 text-[#D4A853]/25"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
          </svg>
        </div>
      )}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent" />

      {/* Campaign Details Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-end gap-1.5">
        <span className="text-[9px] font-bold tracking-[0.25em] text-[#D4A853] uppercase">
          {merchantName || 'LUXURY TAILOR'}
        </span>
        
        <h3 className="text-base font-extrabold tracking-tight text-[#FAF0E6] line-clamp-1 leading-snug">
          {campaign.title}
        </h3>
        
        {campaign.copy_text && (
          <p className="text-xs text-[#C9B99A]/80 line-clamp-2 leading-relaxed max-w-[90%] font-medium">
            {campaign.copy_text}
          </p>
        )}
        
        <button
          onClick={() => onExplore(campaign)}
          className="mt-2 self-start bg-[#D4A853] hover:bg-[#C29642] text-[#0A0A0A] text-[10px] font-extrabold tracking-wider px-4 py-2 rounded-lg transition-all duration-300 uppercase hover:shadow-[0_0_12px_rgba(212,168,83,0.4)]"
        >
          View Collection
        </button>
      </div>
    </div>
  );
};

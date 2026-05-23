'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Merchant,
  Item,
  createCampaign,
  getItems,
  getImageUrl,
  formatPrice
} from '@/lib/api';

// Premium preset banners to make campaign creation easy and beautiful
const PRESET_BANNERS = [
  {
    name: 'Traditional Splendor',
    url: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=1000&auto=format&fit=crop&q=80',
  },
  {
    name: 'Ankara Elegance',
    url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80',
  },
  {
    name: 'Bespoke Suits',
    url: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=1000&auto=format&fit=crop&q=80',
  },
  {
    name: 'Casual Vibe',
    url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=1000&auto=format&fit=crop&q=80',
  },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const { merchants } = useApp();
  
  // Form States
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [copyText, setCopyText] = useState<string>('');
  const [bannerUrl, setBannerUrl] = useState<string>(PRESET_BANNERS[0].url);
  const [customBannerUrl, setCustomBannerUrl] = useState<string>('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  
  // Data States
  const [merchantItems, setMerchantItems] = useState<Item[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Fetch items when selected merchant changes
  useEffect(() => {
    if (!selectedMerchantId) {
      setMerchantItems([]);
      setSelectedItemIds([]);
      return;
    }

    const fetchItems = async () => {
      setIsLoadingItems(true);
      setError(null);
      setSelectedItemIds([]);
      
      const res = await getItems(selectedMerchantId);
      if (res.data) {
        setMerchantItems(res.data);
      } else {
        setError(res.error || 'Failed to retrieve products for the selected merchant.');
      }
      setIsLoadingItems(false);
    };

    fetchItems();
  }, [selectedMerchantId]);

  // Set initial merchant if available
  useEffect(() => {
    if (merchants && merchants.length > 0 && !selectedMerchantId) {
      setSelectedMerchantId(merchants[0].id);
    }
  }, [merchants, selectedMerchantId]);

  const handleItemToggle = (itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerchantId) {
      setError('Please select a merchant.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a campaign title.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const finalBanner = customBannerUrl.trim() || bannerUrl;

    const res = await createCampaign({
      merchant_id: selectedMerchantId,
      title: title.trim(),
      copy_text: copyText.trim() || null,
      image_urls: [finalBanner],
      featured_item_ids: selectedItemIds.length > 0 ? selectedItemIds : null,
      team_slug: process.env.NEXT_PUBLIC_TEAM_SLUG || 'phasion-sense',
    });

    setIsSubmitting(false);

    if (res.data) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } else {
      setError(res.error || 'Failed to create marketing campaign.');
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-8 px-4 md:px-6 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-2 text-left">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FAF0E6] via-[#D4A853] to-[#C9B99A] uppercase">
          Create Collection Campaign
        </h1>
        <p className="text-xs text-[#C9B99A]/80 font-medium max-w-2xl leading-relaxed">
          Design a seasonal campaign or promo collection. Add eye-catching banners, promotional copy, and feature matching products for virtual try-on simulation on the storefront.
        </p>
      </div>

      {success ? (
        <div className="p-8 rounded-2xl border border-[#D4A853]/35 bg-[#D4A853]/5 text-center space-y-4 animate-scale-up">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#D4A853] to-[#C9B99A] rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(212,168,83,0.3)]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="#0A0A0A" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#FAF0E6] uppercase tracking-wider">Campaign Published!</h2>
          <p className="text-xs text-[#C9B99A] font-semibold max-w-md mx-auto">
            Your collection campaign has been successfully registered. You are being redirected to the homepage storefront to view your banner active in the promo carousel...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* Left Block: Form details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-[#111111] border border-[#1F1C1A] space-y-5 shadow-lg">
              
              {/* Select Merchant */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold tracking-widest text-[#C9B99A] uppercase">
                  Select Designer / Merchant
                </label>
                <select
                  value={selectedMerchantId}
                  onChange={(e) => setSelectedMerchantId(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#1F1C1A] focus:border-[#D4A853]/55 text-xs text-[#FAF0E6] font-bold rounded-xl px-4 py-3.5 transition-all outline-none"
                  required
                >
                  <option value="" disabled>Select Merchant</option>
                  {merchants.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campaign Title */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold tracking-widest text-[#C9B99A] uppercase">
                  Campaign Title / Headline
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Summer Kaftan Collection"
                  className="w-full bg-[#0A0A0A] border border-[#1F1C1A] focus:border-[#D4A853]/55 text-xs text-[#FAF0E6] font-semibold rounded-xl px-4 py-3.5 placeholder:text-[#C9B99A]/30 transition-all outline-none"
                  required
                />
              </div>

              {/* Marketing Copy */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold tracking-widest text-[#C9B99A] uppercase">
                  Marketing Copy / Description
                </label>
                <textarea
                  value={copyText}
                  onChange={(e) => setCopyText(e.target.value)}
                  placeholder="Tell clients what makes this collection special. Describe the tailoring, premium fabrics, or current seasonal promotions..."
                  className="w-full bg-[#0A0A0A] border border-[#1F1C1A] focus:border-[#D4A853]/55 text-xs text-[#FAF0E6] font-semibold rounded-xl px-4 py-3.5 placeholder:text-[#C9B99A]/30 h-28 resize-none transition-all outline-none"
                />
              </div>

            </div>

            {/* Campaign Banner artwork selection */}
            <div className="p-6 rounded-2xl bg-[#111111] border border-[#1F1C1A] space-y-5 shadow-lg">
              <span className="text-[10px] font-extrabold tracking-widest text-[#C9B99A] uppercase block">
                Choose Campaign Banner
              </span>
              
              {/* Preset grids */}
              <div className="grid grid-cols-2 gap-3.5">
                {PRESET_BANNERS.map((preset) => {
                  const isSelected = bannerUrl === preset.url && !customBannerUrl.trim();
                  return (
                    <div
                      key={preset.name}
                      onClick={() => {
                        setBannerUrl(preset.url);
                        setCustomBannerUrl('');
                      }}
                      className={`relative aspect-[16/9] rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                        isSelected ? 'border-[#D4A853] scale-[1.02] shadow-[0_0_12px_rgba(212,168,83,0.3)]' : 'border-[#1F1C1A] hover:border-[#C9B99A]/30'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40" />
                      <span className="absolute bottom-2 left-2 text-[9px] font-bold text-[#FAF0E6] drop-shadow-sm uppercase">
                        {preset.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Custom URL Input */}
              <div className="space-y-2 pt-3 border-t border-[#1F1C1A]">
                <label className="text-[9px] font-extrabold tracking-widest text-[#C9B99A]/60 uppercase">
                  Or Paste Custom Banner Image URL
                </label>
                <input
                  type="url"
                  value={customBannerUrl}
                  onChange={(e) => setCustomBannerUrl(e.target.value)}
                  placeholder="e.g., https://my-cdn.com/banner.jpg"
                  className="w-full bg-[#0A0A0A] border border-[#1F1C1A] focus:border-[#D4A853]/55 text-xs text-[#FAF0E6] font-semibold rounded-xl px-4 py-3.5 placeholder:text-[#C9B99A]/30 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Right Block: Product selection */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-[#111111] border border-[#1F1C1A] space-y-4 shadow-lg flex flex-col max-h-[640px]">
              <div className="space-y-1 pb-3 border-b border-[#1F1C1A]">
                <span className="text-[10px] font-extrabold tracking-widest text-[#C9B99A] uppercase block">
                  Feature Apparel ({selectedItemIds.length})
                </span>
                <p className="text-[9px] text-[#C9B99A]/50 font-semibold uppercase">
                  Select which items from this designer to feature
                </p>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-2.5">
                {isLoadingItems ? (
                  <div className="space-y-3 py-6 text-center">
                    <div className="w-6 h-6 border-2 border-[#D4A853] border-t-transparent rounded-full animate-spin mx-auto" />
                    <span className="text-[10px] text-[#C9B99A]/50 font-bold uppercase">Loading designer products...</span>
                  </div>
                ) : error && merchantItems.length === 0 ? (
                  <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-center text-[10px] text-red-400 font-semibold">
                    {error}
                  </div>
                ) : merchantItems.length > 0 ? (
                  merchantItems.map((item) => {
                    const isChecked = selectedItemIds.includes(item.id);
                    const thumbUrl = item.image_urls && item.image_urls.length > 0 ? getImageUrl(item.image_urls[0]) : '';
                    
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemToggle(item.id)}
                        className={`flex items-center gap-3.5 p-2.5 rounded-xl border cursor-pointer transition-all duration-300 ${
                          isChecked
                            ? 'bg-[#D4A853]/5 border-[#D4A853]/40'
                            : 'bg-[#0A0A0A] border-[#1F1C1A] hover:border-[#C9B99A]/20'
                        }`}
                      >
                        {/* Custom checkbox */}
                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                          isChecked ? 'bg-[#D4A853] border-[#D4A853]' : 'border-[#1F1C1A] bg-[#111111]'
                        }`}>
                          {isChecked && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#0A0A0A" className="w-3.5 h-3.5">
                              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>

                        {/* Thumbnail */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#181615] border border-[#1F1C1A] flex-shrink-0">
                          {thumbUrl ? (
                            <img src={thumbUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] text-[#C9B99A]/30">Null</div>
                          )}
                        </div>

                        {/* Info details */}
                        <div className="flex-1 truncate space-y-0.5">
                          <h4 className="text-[11px] font-bold text-[#FAF0E6] truncate uppercase">{item.name}</h4>
                          <span className="text-[9px] font-extrabold text-[#D4A853] block">
                            {formatPrice(item.price_minor, item.currency)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-[10px] text-[#C9B99A]/50 font-bold py-6 uppercase">
                    Select a merchant to view their catalog.
                  </p>
                )}
              </div>

              {/* Form Action submit button */}
              <div className="pt-3 border-t border-[#1F1C1A] space-y-3.5">
                {error && (
                  <div className="p-3 rounded-lg border border-red-500/25 bg-red-500/5 text-[10px] font-semibold text-red-400">
                    {error}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedMerchantId || !title.trim()}
                  className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 border flex items-center justify-center gap-2 ${
                    isSubmitting || !selectedMerchantId || !title.trim()
                      ? 'bg-[#1F1C1A] border-transparent text-[#C9B99A]/30 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#D4A853] to-[#C9B99A] hover:from-[#C29642] hover:to-[#B5A586] text-[#0A0A0A] border-transparent font-black shadow-[0_4px_16px_rgba(212,168,83,0.2)] hover:shadow-[0_4px_24px_rgba(212,168,83,0.4)] hover:scale-[1.01]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
                      Publishing Collection...
                    </>
                  ) : (
                    'Publish Collection Campaign'
                  )}
                </button>
              </div>

            </div>
          </div>

        </form>
      )}

    </div>
  );
}

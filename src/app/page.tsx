'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Item,
  Campaign,
  Merchant,
  getAllItems,
  getAllCampaigns,
  inferCategory,
  getImageUrl,
} from '@/lib/api';
import { CategoryPills } from '@/components/CategoryPills';
import { ProductCard } from '@/components/ProductCard';
import { CampaignCard } from '@/components/CampaignCard';
import { CampaignDetailSheet } from '@/components/CampaignDetailSheet';
import { ProductDetailSheet } from '@/components/ProductDetailSheet';
import { SkeletonGrid } from '@/components/SkeletonGrid';
import { Toast } from '@/components/Toast';
import { TikTokProductFeed } from '@/components/TikTokProductFeed';

const CATEGORIES = ['All', 'Traditional', 'Suits', 'Dresses', 'Shirts', 'Trousers', 'Casual'];

export default function HomePage() {
  const router = useRouter();
  const { userProfile, merchants } = useApp();

  const [activeTab, setActiveTab] = useState<'explore' | 'for_you'>('explore');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Data States
  const [items, setItems] = useState<Item[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sheet & Toast States
  const [activeProduct, setActiveProduct] = useState<Item | null>(null);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // On mount: Check onboarding redirection
  useEffect(() => {
    // Check local storage directly if context has not loaded yet
    const storedProfile = localStorage.getItem('phashionsense_profile');
    if (!storedProfile && !userProfile) {
      router.push('/onboarding');
    }
  }, [userProfile, router]);

  // Fetch items & campaigns
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      const [itemsRes, campaignsRes] = await Promise.all([
        getAllItems(),
        getAllCampaigns(),
      ]);

      if (itemsRes.data) {
        setItems(itemsRes.data);
      } else if (itemsRes.error) {
        setError(itemsRes.error);
      }

      if (campaignsRes.data) {
        setCampaigns(campaignsRes.data);
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleShowToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
  };

  // Maps merchant ID to merchant name
  const getMerchantName = (merchantId: string) => {
    const merchant = merchants.find((m) => m.id === merchantId);
    return merchant ? merchant.name : 'Luxury Tailor';
  };

  // --- Filtering Logic for EXPLORE Tab ---
  const filteredExploreItems = items.filter((item) => {
    if (selectedCategory === 'All') return true;
    const inferred = inferCategory(item.name, item.description);
    return inferred === selectedCategory;
  });

  // --- Personalization Logic for FOR YOU Tab ---
  const getPersonalizedItems = () => {
    if (!userProfile) return [];

    const isMale = userProfile.gender === 'male';
    
    return items.filter((item) => {
      const nameLower = item.name.toLowerCase();
      const descLower = (item.description || '').toLowerCase();
      
      // Simple keyword matching for gender relevance
      if (isMale) {
        // Exclude clear female garments
        if (nameLower.includes('dress') || nameLower.includes('gown') || nameLower.includes('skirt') || nameLower.includes('female') || nameLower.includes('lady') || nameLower.includes('blouse')) {
          return false;
        }
        return true;
      } else {
        // Prioritize female items or general unisex
        if (nameLower.includes('suit') || nameLower.includes('menswear') || nameLower.includes('gentleman') || nameLower.includes('men\'s')) {
          return false;
        }
        return true;
      }
    });
  };

  const personalizedItems = getPersonalizedItems();

  if (!userProfile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#111111] min-h-screen">
        <div className="animate-shimmer w-12 h-12 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#111111] min-h-screen flex flex-col animate-fade-in">
      
      {/* Dynamic Sub-header Navigation Tabs */}
      <div className="px-6 py-2 border-b border-[#1F1C1A] bg-[#111111] flex items-center justify-start gap-6 sticky top-[73px] z-30">
        <button
          onClick={() => setActiveTab('explore')}
          className={`pb-3 text-sm font-bold tracking-widest uppercase transition-all duration-300 relative ${
            activeTab === 'explore' ? 'text-[#D4A853]' : 'text-[#C9B99A]/50 hover:text-[#C9B99A]'
          }`}
        >
          Explore
          {activeTab === 'explore' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4A853] to-[#C9B99A] rounded-full" />
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('for_you')}
          className={`pb-3 text-sm font-bold tracking-widest uppercase transition-all duration-300 relative ${
            activeTab === 'for_you' ? 'text-[#D4A853]' : 'text-[#C9B99A]/50 hover:text-[#C9B99A]'
          }`}
        >
          For You
          {activeTab === 'for_you' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4A853] to-[#C9B99A] rounded-full" />
          )}
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 px-6 py-5 space-y-6">
        {isLoading ? (
          <div className="space-y-6">
            <div className="aspect-[16/9] w-full rounded-2xl animate-shimmer" />
            <div className="h-10 w-full rounded-full bg-[#1F1C1A] animate-shimmer" />
            <SkeletonGrid />
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl border border-red-500/25 bg-red-500/5 text-center space-y-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-10 h-10 text-red-500 mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <p className="text-sm font-semibold text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#D4A853] text-[#0A0A0A] font-bold text-xs rounded-xl uppercase hover:bg-[#C29642] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : activeTab === 'explore' ? (
          // --- EXPLORE TAB VIEW (TIKTOK STYLE) ---
          <div className="space-y-4 animate-fade-in flex-1 flex flex-col h-full">
            {/* Category Pills */}
            <div className="space-y-1">
              <span className="text-[9px] font-extrabold tracking-wider text-[#C9B99A]/60 uppercase">Tailored Swipe Feed</span>
              <CategoryPills
                categories={CATEGORIES}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>

            {filteredExploreItems.length > 0 ? (
              <div className="w-full max-w-[420px] mx-auto animate-fade-in">
                <TikTokProductFeed
                  items={filteredExploreItems}
                  getMerchantName={getMerchantName}
                  onShowToast={handleShowToast}
                />
              </div>
            ) : (
              <div className="p-12 text-center border border-[#1F1C1A] rounded-2xl bg-[#0A0A0A] flex-1 flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 text-[#C9B99A]/40 mx-auto mb-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
                </svg>
                <p className="text-xs font-semibold text-[#C9B99A]">No items available in this category.</p>
              </div>
            )}
          </div>
        ) : (
          // --- FOR YOU TAB VIEW ---
          <div className="space-y-6 animate-fade-in">
            {/* Custom AI Silhouette banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#181615] to-[#111111] border border-[#1F1C1A] flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold tracking-wider text-[#D4A853] uppercase">PHASHION STUDIO MATCH</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-ping" />
                </div>
                <h3 className="text-sm font-bold text-[#FAF0E6] capitalize">Tailored for {userProfile.name}</h3>
                <p className="text-[11px] text-[#C9B99A]/75 leading-relaxed font-semibold">
                  Feed automatically fitted to your <span className="text-[#D4A853] capitalize">{userProfile.bodyType}</span> shape. Active measurements are locked.
                </p>
              </div>
              
              {/* Custom Model Avatar Badge */}
              <div className="w-12 h-16 rounded-xl border border-[#1F1C1A] bg-[#0A0A0A] overflow-hidden flex-shrink-0 relative group">
                <img
                  src={
                    getImageUrl(
                      userProfile.gender === 'male'
                        ? '/images/phasion-sense/ps3.jpg'
                        : '/images/phasion-sense/ps1.jpg'
                    )
                  }
                  alt={userProfile.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-[#D4A853]/10" />
              </div>
            </div>

            {/* Designer Campaigns & Active Collections Carousel */}
            {campaigns.length > 0 && (
              <div className="space-y-3.5 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold tracking-[0.25em] text-[#C9B99A] uppercase">Active Collections</span>
                  <span className="text-[9px] text-[#D4A853] font-bold tracking-wider uppercase">Promotions</span>
                </div>
                
                <div className="w-full overflow-x-auto no-scrollbar flex gap-4 pb-2 px-0.5">
                  {campaigns.map((camp) => (
                    <div key={camp.id} className="w-[300px] flex-shrink-0">
                      <CampaignCard
                        campaign={camp}
                        merchantName={getMerchantName(camp.merchant_id || camp.team_slug || '')}
                        onExplore={setActiveCampaign}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personalized Product Grid */}
            <div className="space-y-3 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold tracking-[0.25em] text-[#C9B99A] uppercase">PICKED FOR YOUR SILHOUETTE</span>
                <span className="text-[10px] text-[#D4A853] font-bold tracking-wider uppercase">AI MATCH ACTIVE</span>
              </div>

              {personalizedItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {personalizedItems.map((item) => (
                    <div key={item.id} className="relative group">
                      <ProductCard
                        item={item}
                        merchantName={getMerchantName(item.merchant_id)}
                        onTap={setActiveProduct}
                      />
                      
                      {/* Premium Personalization Badge */}
                      <span className="absolute bottom-2 left-2 z-10 bg-[#D4A853] text-[#0A0A0A] text-[7px] font-black tracking-widest px-1.5 py-0.5 rounded uppercase">
                        AI Fit Match
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center border border-[#1F1C1A] rounded-2xl bg-[#0A0A0A]">
                  <p className="text-xs font-semibold text-[#C9B99A]">Generating fitting catalog recommendations...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Global Product Drawer Sheet */}
      {activeProduct && (
        <ProductDetailSheet
          item={activeProduct}
          merchantName={getMerchantName(activeProduct.merchant_id)}
          onClose={() => setActiveProduct(null)}
          onShowToast={handleShowToast}
        />
      )}

      {/* Floating Collection detail Drawer Sheet */}
      {activeCampaign && (
        <CampaignDetailSheet
          campaign={activeCampaign}
          merchantName={getMerchantName(activeCampaign.merchant_id || activeCampaign.team_slug || '')}
          onClose={() => setActiveCampaign(null)}
          onProductTap={setActiveProduct}
        />
      )}

      {/* Floating System-Wide Micro Toast Messages */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />

    </div>
  );
}

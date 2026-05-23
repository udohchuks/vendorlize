'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { getImageUrl } from '@/lib/api';
import { Toast } from '@/components/Toast';

// Silhouette outlines mapping
const MaleSilhouette = ({ bodyType }: { bodyType: string }) => (
  <svg viewBox="0 0 100 200" className="w-24 h-48 stroke-[#C9B99A]/50 fill-none stroke-[2.2]">
    <circle cx="50" cy="25" r="12" />
    <path d="M50 37v55M32 50h36M32 50c0 15 2 30 0 42h36c-2-12 0-27 0-42M40 92v88M60 92v88" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FemaleSilhouette = ({ bodyType }: { bodyType: string }) => (
  <svg viewBox="0 0 100 200" className="w-24 h-48 stroke-[#C9B99A]/50 fill-none stroke-[2.2]">
    <circle cx="50" cy="25" r="12" />
    <path d="M50 37v53M34 48h32c-2 12-6 20-6 26c0 6 4 14 6 22H34c2-8 6-16 6-22c0-6-4-14-6-26z M40 96v84M60 96v84" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function StudioPage() {
  const { userProfile, wishlist, merchants } = useApp();

  // States
  const [viewMode, setViewMode] = useState<'full' | 'upper'>('full');
  const [selectedGarmentIndex, setSelectedGarmentIndex] = useState<number>(0);
  const [isFitting, setIsFitting] = useState<boolean>(false);
  const [fitResult, setFitResult] = useState<string | null>(null); // Url of tried on garment
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

  const handleTryOn = () => {
    if (wishlist.length === 0) return;
    setIsFitting(true);
    setFitResult(null);

    // Simulate luxury AI fitting process for 2.2 seconds
    setTimeout(() => {
      const garment = wishlist[selectedGarmentIndex];
      const imgUrl = garment.image_urls && garment.image_urls.length > 0
        ? getImageUrl(garment.image_urls[0])
        : '';
      
      setFitResult(imgUrl);
      setIsFitting(false);
      handleShowToast('Bespoke Try-on Render Completed!', 'success');
    }, 2200);
  };

  const handleResetFit = () => {
    setFitResult(null);
  };

  // --- RENDERS FOR MISSING STATES ---

  // 1. Missing profile
  if (!userProfile) {
    return (
      <div className="flex-1 bg-[#111111] min-h-screen flex flex-col justify-center px-6 py-6 text-center space-y-6 animate-fade-in pb-28">
        <div className="w-20 h-20 rounded-full border border-[#1F1C1A] bg-[#0A0A0A] flex items-center justify-center text-[#D4A853] mx-auto shadow-[0_0_15px_rgba(212,168,83,0.1)]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0 1 10.089 20.5a11.382 11.382 0 0 1-4.919-1.263v-.109m10.089.109a10.494 10.494 0 0 1-5.18 1.472 10.494 10.494 0 0 1-5.18-1.472M4.908 19.128A9.38 9.38 0 0 1 2.25 18.75a9.337 9.337 0 0 1-4.121-.952 4.125 4.125 0 0 1 7.533-2.493M4.908 19.128v-.003c0-1.113.285-2.16.786-3.07M4.908 19.128v.109A11.386 11.386 0 0 0 9.911 20.5c1.78 0 3.468-.41 4.978-1.14M9.911 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm9.75 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </div>

        <div className="space-y-2 max-w-[300px] mx-auto">
          <h2 className="text-lg font-bold text-[#FAF0E6] uppercase">AI Silhouette Profile Required</h2>
          <p className="text-xs text-[#C9B99A]/85 leading-relaxed font-semibold">
            To unlock the Clothify virtual try-on studio, we require a digital outline of your physical coordinates. Setup your profile now.
          </p>
        </div>

        <Link
          href="/onboarding"
          className="w-full max-w-[280px] mx-auto py-4 bg-gradient-to-r from-[#D4A853] to-[#C9B99A] text-[#0A0A0A] font-black text-xs rounded-xl tracking-wider uppercase hover:shadow-[0_0_15px_rgba(212,168,83,0.3)] transition-all duration-300 flex items-center justify-center"
        >
          Setup Sizing Profile
        </Link>
      </div>
    );
  }

  // 2. Missing wishlist items
  if (wishlist.length === 0) {
    return (
      <div className="flex-1 bg-[#111111] min-h-screen flex flex-col justify-center px-6 py-6 text-center space-y-6 animate-fade-in pb-28">
        <div className="w-20 h-20 rounded-full border border-[#1F1C1A] bg-[#0A0A0A] flex items-center justify-center text-[#D4A853] mx-auto shadow-[0_0_15px_rgba(212,168,83,0.1)]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        </div>

        <div className="space-y-2 max-w-[300px] mx-auto">
          <h2 className="text-lg font-bold text-[#FAF0E6] uppercase">No fitting garments saved</h2>
          <p className="text-xs text-[#C9B99A]/85 leading-relaxed font-semibold">
            The studio needs apparel coordinates to draft fits. Go to the showcase, select products, and pin them to your wishlist to try them on virtually.
          </p>
        </div>

        <Link
          href="/"
          className="w-full max-w-[280px] mx-auto py-4 bg-gradient-to-r from-[#D4A853] to-[#C9B99A] text-[#0A0A0A] font-black text-xs rounded-xl tracking-wider uppercase hover:shadow-[0_0_15px_rgba(212,168,83,0.3)] transition-all duration-300 flex items-center justify-center"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  const activeGarment = wishlist[selectedGarmentIndex];

  return (
    <div className="flex-1 bg-[#111111] min-h-screen flex flex-col px-6 py-6 space-y-6 animate-fade-in pb-28">
      
      {/* Studio Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold tracking-[0.25em] text-[#C9B99A] uppercase">Tailoring Simulation</span>
          <h1 className="text-xl font-bold tracking-tight text-[#FAF0E6] uppercase">Clothify Studio</h1>
        </div>

        {/* View Toggle */}
        <div className="bg-[#0A0A0A] border border-[#1F1C1A] rounded-xl p-1 flex">
          <button
            onClick={() => setViewMode('full')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-300 ${
              viewMode === 'full' ? 'bg-[#D4A853] text-[#0A0A0A]' : 'text-[#C9B99A]'
            }`}
          >
            Full Body
          </button>
          <button
            onClick={() => setViewMode('upper')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-300 ${
              viewMode === 'upper' ? 'bg-[#D4A853] text-[#0A0A0A]' : 'text-[#C9B99A]'
            }`}
          >
            Upper
          </button>
        </div>
      </div>

      {/* Main Simulation Viewport Container */}
      <div className="w-full flex-1 aspect-[3/4] bg-[#0A0A0A] border border-[#1F1C1A] rounded-3xl relative overflow-hidden flex items-center justify-center shadow-inner">
        {/* Subtle Luxury grid background */}
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#FAF0E6_1px,transparent_1px)] [background-size:20px_20px]" />
        
        {isFitting ? (
          // Simulation Processing loader screen
          <div className="flex flex-col items-center justify-center space-y-5 px-6 text-center z-10 animate-pulse">
            <div className="w-16 h-16 rounded-full border-2 border-[#D4A853] border-t-transparent animate-spin" />
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold tracking-widest text-[#D4A853] uppercase">AI Bespoke Sizing Slicing</span>
              <p className="text-xs text-[#C9B99A]/80 font-medium">Aligning shoulder points and waist contours...</p>
            </div>
          </div>
        ) : fitResult ? (
          // Try On Completed Render View
          <div className="w-full h-full relative flex items-center justify-center animate-fade-in p-6">
            
            {/* Split screen: silhouette behind, actual product overlay floating with opacity */}
            <div className="absolute opacity-20 pointer-events-none">
              {userProfile.gender === 'male' ? (
                <MaleSilhouette bodyType={userProfile.bodyType} />
              ) : (
                <FemaleSilhouette bodyType={userProfile.bodyType} />
              )}
            </div>

            {/* Simulated garment overlay */}
            <div className="w-full max-w-[220px] aspect-[3/4] rounded-2xl overflow-hidden border border-[#D4A853]/45 shadow-[0_0_32px_rgba(212,168,83,0.18)] bg-[#181615]">
              <img
                src={fitResult}
                alt="AI Fitted Result"
                className="w-full h-full object-cover animate-fade-in"
              />
            </div>

            {/* Glowing fit markers overlay */}
            <div className="absolute top-[28%] left-[45%] w-3 h-3 rounded-full bg-[#25D366] shadow-[0_0_8px_#25D366] animate-ping" />
            <div className="absolute top-[50%] left-[38%] w-3 h-3 rounded-full bg-[#25D366] shadow-[0_0_8px_#25D366] animate-ping" />
            
            <div className="absolute bottom-4 left-4 right-4 bg-[#111111]/90 backdrop-blur-md border border-[#1F1C1A] rounded-2xl p-3 flex justify-between items-center shadow-lg">
              <div className="space-y-0.5">
                <span className="text-[8px] font-black text-[#D4A853] uppercase tracking-widest">FIT VERDICT</span>
                <h4 className="text-[10px] font-bold text-[#FAF0E6] truncate uppercase">{activeGarment.name}</h4>
              </div>
              <span className="bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30 text-[8px] font-black tracking-widest px-2.5 py-1 rounded-md uppercase">
                Bespoke Fit Perfect
              </span>
            </div>
          </div>
        ) : (
          // Simulation Standby State View
          <div className="flex flex-col items-center justify-center space-y-6 p-6 text-center z-10">
            {/* User SVG Silhouette */}
            <div className="p-4 bg-[#111111] border border-[#1F1C1A] rounded-2xl shadow-lg relative group">
              {userProfile.gender === 'male' ? (
                <MaleSilhouette bodyType={userProfile.bodyType} />
              ) : (
                <FemaleSilhouette bodyType={userProfile.bodyType} />
              )}
              {/* Scanning visual bar overlay */}
              <div className="absolute left-0 right-0 top-0 h-0.5 bg-[#D4A853] shadow-[0_0_8px_#D4A853] animate-[bounce_3s_infinite_linear]" />
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold tracking-wider text-[#C9B99A]/50 uppercase">STUDIO STANDBY</span>
              <h3 className="text-xs font-bold text-[#FAF0E6] uppercase">AI Sizing Simulator</h3>
              <p className="text-[10px] text-[#C9B99A]/75 max-w-[220px] leading-relaxed font-semibold">
                Select a customized garment below to virtually render over your silhouette model.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic bottom action row (if fit result is loaded) */}
      {fitResult ? (
        <div className="grid grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => handleShowToast('Custom Look saved to your studio locker!', 'success')}
            className="py-3.5 border border-[#1F1C1A] bg-[#0A0A0A] hover:border-[#FAF0E6]/25 rounded-2xl text-[10px] font-bold text-[#FAF0E6] tracking-wider uppercase transition-colors"
          >
            Save Look
          </button>
          <button
            onClick={() => handleShowToast('Simulation Render link copied to clipboard!', 'success')}
            className="py-3.5 border border-[#1F1C1A] bg-[#0A0A0A] hover:border-[#FAF0E6]/25 rounded-2xl text-[10px] font-bold text-[#FAF0E6] tracking-wider uppercase transition-colors"
          >
            Share Fit
          </button>
          <button
            onClick={handleResetFit}
            className="py-3.5 bg-gradient-to-r from-[#D4A853] to-[#C9B99A] text-[#0A0A0A] font-black rounded-2xl text-[10px] tracking-wider uppercase hover:shadow-[0_0_15px_rgba(212,168,83,0.25)] transition-all"
          >
            Try Another
          </button>
        </div>
      ) : (
        // Garment Selector and Primary Try On CTA (Standby)
        <div className="space-y-5 pt-2">
          {/* Wishlist apparel swiper list */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold tracking-[0.25em] text-[#C9B99A] uppercase">Select Apparel coordinate</span>
            
            <div className="w-full overflow-x-auto no-scrollbar flex gap-4 pb-2 px-1">
              {wishlist.map((item, idx) => {
                const isSelected = selectedGarmentIndex === idx;
                const img = item.image_urls && item.image_urls.length > 0 ? getImageUrl(item.image_urls[0]) : '';
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedGarmentIndex(idx)}
                    className={`w-16 h-20 rounded-xl bg-[#181615] overflow-hidden border flex-shrink-0 flex items-center justify-center transition-all duration-300 relative ${
                      isSelected
                        ? 'border-[#D4A853] ring-1 ring-[#D4A853] scale-105 shadow-[0_0_12px_rgba(212,168,83,0.25)]'
                        : 'border-[#1F1C1A] opacity-60 hover:opacity-100'
                    }`}
                  >
                    {img ? (
                      <img src={img} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="w-6 h-6 text-[#C9B99A]/40">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sizing Simulation primary trigger */}
          <button
            onClick={handleTryOn}
            className="w-full py-4 bg-gradient-to-r from-[#D4A853] to-[#C9B99A] hover:from-[#C29642] hover:to-[#B5A586] text-[#0A0A0A] font-black text-xs rounded-2xl tracking-wider uppercase shadow-[0_4px_16px_rgba(212,168,83,0.2)] hover:shadow-[0_4px_24px_rgba(212,168,83,0.35)] transition-all duration-300"
          >
            Render Sizing Fit • "{activeGarment.name}"
          </button>
        </div>
      )}

      {/* Floating system messages */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}

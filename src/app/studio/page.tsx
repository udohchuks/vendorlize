'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { getImageUrl, buildWhatsAppLink, formatPrice } from '@/lib/api';
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

const MEASUREMENT_DEFAULTS: Record<'male' | 'female', Record<string, { chest: number; waist: number; hips: number; height: number; inseam: number }>> = {
  male: {
    Slim: { chest: 36, waist: 29, hips: 36, height: 69, inseam: 30 },
    Average: { chest: 40, waist: 34, hips: 40, height: 70, inseam: 30 },
    Athletic: { chest: 42, waist: 32, hips: 41, height: 71, inseam: 32 },
    'Plus Size': { chest: 46, waist: 40, hips: 46, height: 70, inseam: 29 },
  },
  female: {
    Slim: { chest: 32, waist: 24, hips: 34, height: 63, inseam: 28 },
    Average: { chest: 35, waist: 28, hips: 38, height: 64, inseam: 29 },
    Hourglass: { chest: 37, waist: 26, hips: 38, height: 65, inseam: 30 },
    'Plus Size': { chest: 42, waist: 35, hips: 44, height: 65, inseam: 29 },
  },
};

const MODEL_AVATARS: Record<'male' | 'female', Record<string, string>> = {
  male: {
    Slim: '/images/phasion-sense/ps3.jpg',
    Average: '/images/phasion-sense/ps4.jpg',
    Athletic: '/images/phasion-sense/ps7.jpeg',
    'Plus Size': '/images/phasion-sense/ps10.jpeg',
  },
  female: {
    Slim: '/images/phasion-sense/ps1.jpg',
    Average: '/images/phasion-sense/ps2.jpg',
    Hourglass: '/images/phasion-sense/ps5.jpg',
    'Plus Size': '/images/phasion-sense/ps12.jpeg',
  },
};

export default function StudioPage() {
  const { userProfile, wishlist, merchants, saveProfile } = useApp();

  // States
  const [viewMode, setViewMode] = useState<'full' | 'upper'>('full');
  const [selectedGarmentIndex, setSelectedGarmentIndex] = useState<number>(0);
  const [isFitting, setIsFitting] = useState<boolean>(false);
  const [fitResult, setFitResult] = useState<string | null>(null); // Url of tried on garment
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  


  // Drag / Scale states for overlay fitting
  const [overlayPos, setOverlayPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [overlayScale, setOverlayScale] = useState<number>(0.95);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleShowToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
  };

  const getMerchantName = (merchantId: string) => {
    const merchant = merchants.find((m) => m.id === merchantId);
    return merchant ? merchant.name : 'Luxury Tailor';
  };



  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - overlayPos.x, y: e.clientY - overlayPos.y };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setOverlayPos({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleTryOn = async () => {
    if (wishlist.length === 0) return;
    
    setIsFitting(true);
    setFitResult(null);

    const garment = wishlist[selectedGarmentIndex];
    const garmentImageUrl = garment.image_urls && garment.image_urls.length > 0
      ? getImageUrl(garment.image_urls[0])
      : '';

    const gender = userProfile?.gender || 'male';
    const bodyType = userProfile?.bodyType || 'Average';
    const avatarPhotoUrl = getImageUrl(MODEL_AVATARS[gender]?.[bodyType] || MODEL_AVATARS[gender]?.['Average']);

    const personImageUrl = avatarPhotoUrl;

    try {
      const res = await fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personImageUrl, garmentImageUrl }),
      });

      if (!res.ok) {
        throw new Error(`Try-on server returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.output) {
        setFitResult(data.output);
        handleShowToast('AI Virtual Try-on Completed!', 'success');
      } else {
        throw new Error('No output image URL returned from AI.');
      }
    } catch (err: any) {
      console.warn('AI Try-on failed. Falling back to local overlay mode...', err);
      handleShowToast('AI Server busy. Initialized local interactive draping overlay!', 'success');
      
      // Fallback: Use local overlay mode
      setFitResult(garmentImageUrl);
      setOverlayPos({ x: 0, y: 0 });
      setOverlayScale(0.95);
    } finally {
      setIsFitting(false);
    }
  };

  const handleResetFit = () => {
    setFitResult(null);
    setOverlayPos({ x: 0, y: 0 });
    setOverlayScale(0.95);
  };

  const handleShareFit = () => {
    if (!activeGarment) return;

    const merchantId = activeGarment.merchant_id;
    const merchant = merchants.find((m) => m.id === merchantId);
    const whatsappNum = merchant?.whatsapp_number || '233599835025';

    let text = "Hello " + (merchant ? merchant.name : "Designer") + "!\n\n";
    text += "I simulated a custom fit for your garment *\"" + activeGarment.name + "\"* on Clothify (powered by Phasion Sense) and would like to place an order/inquiry.\n\n";

    if (userProfile) {
      text += "*My Tailoring Blueprint (AI-Fitted)*:\n";
      text += "- Silhouette: *" + userProfile.bodyType + "*\n";
      text += "- Chest: *" + userProfile.measurements.chest + " inches*\n";
      text += "- Waist: *" + userProfile.measurements.waist + " inches*\n";
      text += "- Hips: *" + userProfile.measurements.hips + " inches*\n";
      text += "- Height: *" + userProfile.measurements.height + " inches*\n";
      text += "- Inseam: *" + userProfile.measurements.inseam + " inches*\n\n";
    }

    if (fitResult && fitResult !== activeGarment.image_urls?.[0] && fitResult !== getImageUrl(activeGarment.image_urls?.[0] || '')) {
      text += "*AI Simulation Render Fit Link*:\n" + fitResult + "\n\n";
    }

    text += "Please confirm receipt of my customized sizing coordinates. Thank you!";

    const waLink = buildWhatsAppLink(whatsappNum, text);
    window.open(waLink, '_blank');
    handleShowToast('WhatsApp order dispatch launched!', 'success');
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

      {/* Grid Container for Desktop Split Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Viewport, Scale Controls, completed details */}
        <div className="md:col-span-7 flex flex-col space-y-5">
          
          {/* Main Simulation Viewport Container */}
          <div className="w-full aspect-[3/4] bg-[#0A0A0A] border border-[#1F1C1A] rounded-3xl relative overflow-hidden flex items-center justify-center shadow-inner">
            {/* Subtle grid background */}
            <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#FAF0E6_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
            
            {isFitting ? (
              // Simulation Processing loader screen
              <div className="flex flex-col items-center justify-center space-y-5 px-6 text-center z-10 animate-pulse pointer-events-none">
                <div className="w-16 h-16 rounded-full border-2 border-[#D4A853] border-t-transparent animate-spin" />
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold tracking-widest text-[#D4A853] uppercase">AI Bespoke Sizing Slicing</span>
                  <p className="text-xs text-[#C9B99A]/80 font-medium">Aligning shoulder points and waist contours...</p>
                </div>
              </div>
            ) : (
              // Viewport Content
              <div className="w-full h-full relative flex items-center justify-center animate-fade-in overflow-hidden">
                {/* Render Result (AI Synthesized Image) if Try-on succeeded */}
                {fitResult && fitResult !== activeGarment.image_urls?.[0] && fitResult !== getImageUrl(activeGarment.image_urls?.[0] || '') ? (
                  <img
                    src={fitResult}
                    alt="AI Tailored Fit Result"
                    className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                  />
                ) : (
                  /* STANDBY OR FALLBACK OVERLAY VIEW */
                  <>
                    {/* AI Fitted Avatar photo mapping */}
                    <div className="absolute inset-0 w-full h-full">
                      <img
                        src={getImageUrl(MODEL_AVATARS[userProfile.gender || 'male'][userProfile.bodyType || 'Average'] || MODEL_AVATARS['male']['Average'])}
                        alt="AI Fitted Avatar Model"
                        className="w-full h-full object-cover animate-fade-in"
                      />
                      
                      {/* Wireframe Outline visualizer overlay */}
                      {!fitResult && (
                        <div className="absolute inset-0 bg-[#D4A853]/5 flex items-center justify-center pointer-events-none">
                          <div className="p-4 bg-[#0A0A0A]/40 backdrop-blur-[1px] border border-[#D4A853]/20 rounded-2xl shadow-lg scale-90">
                            {userProfile.gender === 'male' ? (
                              <MaleSilhouette bodyType={userProfile.bodyType} />
                            ) : (
                              <FemaleSilhouette bodyType={userProfile.bodyType} />
                            )}
                          </div>
                          <div className="absolute left-0 right-0 top-0 h-0.5 bg-[#D4A853] shadow-[0_0_10px_#D4A853] animate-[bounce_3s_infinite_linear]" />
                        </div>
                      )}
                    </div>

                    {/* Draggable/Scalable Fallback Garment Overlay with mix-blend-mode to blend onto the avatar */}
                    {fitResult && (fitResult === activeGarment.image_urls?.[0] || fitResult === getImageUrl(activeGarment.image_urls?.[0] || '')) && (
                      <div
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        style={{
                          transform: `translate(${overlayPos.x}px, ${overlayPos.y}px) scale(${overlayScale})`,
                          cursor: isDragging ? 'grabbing' : 'grab',
                          touchAction: 'none',
                        }}
                        className="w-full max-w-[210px] aspect-[3/4] rounded-2xl overflow-hidden border border-[#D4A853]/60 shadow-[0_0_32px_rgba(212,168,83,0.3)] bg-transparent absolute z-20 select-none animate-fade-in"
                      >
                        <img
                          src={fitResult}
                          alt="Fallback Draping Garment"
                          style={{ mixBlendMode: 'multiply' }}
                          className="w-full h-full object-cover pointer-events-none select-none"
                        />
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#D4A853] animate-ping" />
                      </div>
                    )}
                  </>
                )}

                {/* Standby Description overlay */}
                {!fitResult && (
                  <div className="absolute bottom-4 left-4 right-4 bg-[#111111]/90 backdrop-blur-md border border-[#1F1C1A] rounded-2xl p-3 text-center shadow-lg pointer-events-none">
                    <span className="text-[8px] font-extrabold tracking-wider text-[#C9B99A]/50 uppercase">STUDIO STANDBY</span>
                    <p className="text-[10px] text-[#C9B99A]/75 font-semibold mt-0.5">Select a customized garment on the right to render.</p>
                  </div>
                )}

                {/* Completed Verdict Overlay */}
                {fitResult && (
                  <div className="absolute bottom-4 left-4 right-4 bg-[#111111]/95 backdrop-blur-md border border-[#1F1C1A] rounded-2xl p-3.5 flex justify-between items-center shadow-lg z-30 pointer-events-none">
                    <div className="space-y-0.5 text-left">
                      <span className="text-[8px] font-black text-[#D4A853] uppercase tracking-widest">FIT VERDICT</span>
                      <h4 className="text-[10px] font-bold text-[#FAF0E6] truncate uppercase max-w-[140px]">{activeGarment.name}</h4>
                    </div>
                    <span className="bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30 text-[8px] font-black tracking-widest px-2.5 py-1 rounded-md uppercase">
                      {fitResult === activeGarment.image_urls?.[0] || fitResult === getImageUrl(activeGarment.image_urls?.[0] || '')
                        ? 'Interactive Overlay'
                        : 'Bespoke Fit Perfect'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive Draping Overlay Scale Slider (Visible only in fallback overlay mode) */}
          {fitResult && (fitResult === activeGarment.image_urls?.[0] || fitResult === getImageUrl(activeGarment.image_urls?.[0] || '')) && (
            <div className="bg-[#0A0A0A] border border-[#1F1C1A] rounded-2xl p-4 space-y-3 shadow-md animate-fade-in">
              <div className="flex justify-between items-center text-[10px] font-extrabold tracking-wider text-[#C9B99A] uppercase">
                <span>Garment Draping Scale</span>
                <span className="text-[#D4A853] font-black">{Math.round(overlayScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1.6"
                step="0.01"
                value={overlayScale}
                onChange={(e) => setOverlayScale(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#1F1C1A] rounded-lg appearance-none cursor-pointer accent-[#D4A853]"
              />
              <div className="flex justify-between items-center pt-1">
                <span className="text-[9px] text-[#C9B99A]/50 font-bold uppercase">← Drag garment inside viewport to align →</span>
              </div>
            </div>
          )}

          {/* Verdict action row (Save / Share / Try Another) */}
          {fitResult && (
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleShowToast('Custom Look saved to your studio locker!', 'success')}
                className="py-3.5 border border-[#1F1C1A] bg-[#0A0A0A] hover:border-[#FAF0E6]/25 rounded-2xl text-[10px] font-bold text-[#FAF0E6] tracking-wider uppercase transition-colors"
              >
                Save Look
              </button>
              <button
                onClick={handleShareFit}
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
          )}
        </div>

        {/* Right Column: Profile details, coordinates list, try-on CTA */}
        <div className="md:col-span-5 flex flex-col space-y-6">
          
          {/* Active Avatar Shape information widget */}
          <div className="bg-[#0A0A0A] border border-[#1F1C1A] rounded-2xl p-5 space-y-4 text-left shadow-lg animate-fade-in">
            <span className="text-[10px] font-extrabold tracking-wider text-[#C9B99A] uppercase block border-b border-[#1F1C1A] pb-2">
              Active Digital Silhouette
            </span>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[8px] font-extrabold text-[#D4A853] uppercase tracking-wider block">FITTING PROFILE</span>
                <h3 className="text-sm font-extrabold text-[#FAF0E6] capitalize">{userProfile.name}</h3>
              </div>
              <Link
                href="/onboarding"
                className="text-[9px] font-black text-[#D4A853] uppercase tracking-wider hover:underline"
              >
                Re-measure Profile
              </Link>
            </div>

            <div className="p-3 bg-[#111111] border border-[#1F1C1A] rounded-xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[8px] font-extrabold text-[#C9B99A]/50 uppercase tracking-widest block">AI TARGET MODEL</span>
                <span className="text-xs font-black text-[#FAF0E6] capitalize">{userProfile.gender} ({userProfile.bodyType})</span>
              </div>
              <div className="w-9 h-12 rounded-lg border border-[#1F1C1A] bg-[#0A0A0A] overflow-hidden flex-shrink-0 relative">
                <img
                  src={getImageUrl(MODEL_AVATARS[userProfile.gender || 'male'][userProfile.bodyType || 'Average'] || MODEL_AVATARS['male']['Average'])}
                  alt="Fit Model Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Displaying Current Active Measurements */}
            <div className="grid grid-cols-2 gap-3.5 pt-2 text-[10px] font-extrabold tracking-wider text-[#C9B99A]/85 uppercase">
              <div className="p-3 bg-[#111111]/45 border border-[#1F1C1A]/60 rounded-xl space-y-0.5">
                <span className="text-[7px] text-[#C9B99A]/40 block">Chest/Bust</span>
                <span className="text-[#FAF0E6] text-xs font-black">{userProfile.measurements.chest} in</span>
              </div>
              <div className="p-3 bg-[#111111]/45 border border-[#1F1C1A]/60 rounded-xl space-y-0.5">
                <span className="text-[7px] text-[#C9B99A]/40 block">Waist</span>
                <span className="text-[#FAF0E6] text-xs font-black">{userProfile.measurements.waist} in</span>
              </div>
              <div className="p-3 bg-[#111111]/45 border border-[#1F1C1A]/60 rounded-xl space-y-0.5">
                <span className="text-[7px] text-[#C9B99A]/40 block">Hips</span>
                <span className="text-[#FAF0E6] text-xs font-black">{userProfile.measurements.hips} in</span>
              </div>
              <div className="p-3 bg-[#111111]/45 border border-[#1F1C1A]/60 rounded-xl space-y-0.5">
                <span className="text-[7px] text-[#C9B99A]/40 block">Height</span>
                <span className="text-[#FAF0E6] text-xs font-black">{userProfile.measurements.height} in</span>
              </div>
            </div>
          </div>

          {/* Wishlist apparel swiper select list (Only if standby/rendering try-on) */}
          {!fitResult && (
            <div className="space-y-2.5 text-left">
              <span className="text-[10px] font-extrabold tracking-[0.25em] text-[#C9B99A] uppercase">Select Apparel coordinate</span>
              
              <div className="w-full overflow-x-auto no-scrollbar flex gap-4 pb-2 px-1">
                {wishlist.map((item, idx) => {
                  const isSelected = selectedGarmentIndex === idx;
                  const img = item.image_urls && item.image_urls.length > 0 ? getImageUrl(item.image_urls[0]) : '';
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedGarmentIndex(idx);
                        setFitResult(null);
                      }}
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
          )}

          {/* Sizing Simulation primary trigger CTA */}
          {!fitResult && (
            <button
              onClick={handleTryOn}
              className="w-full py-4 bg-gradient-to-r from-[#D4A853] to-[#C9B99A] hover:from-[#C29642] hover:to-[#B5A586] text-[#0A0A0A] font-black text-xs rounded-2xl tracking-wider uppercase shadow-[0_4px_16px_rgba(212,168,83,0.2)] hover:shadow-[0_4px_24px_rgba(212,168,83,0.35)] transition-all duration-300"
            >
              {`Render Sizing Fit • "${activeGarment.name}"`}
            </button>
          )}
        </div>
      </div>

      {/* Floating system messages */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}

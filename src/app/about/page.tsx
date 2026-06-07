'use client';

import React from 'react';

export default function AboutPage() {
  return (
    <div className="flex-1 bg-[#111111] min-h-screen flex flex-col px-6 py-8 space-y-8 animate-fade-in pb-28">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#1F1C1A] bg-gradient-to-br from-[#181615] to-[#0A0A0A] p-8 md:p-12 flex flex-col justify-center space-y-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A853]/5 rounded-full filter blur-3xl pointer-events-none" />
        <span className="text-[10px] font-extrabold tracking-[0.3em] text-[#D4A853] uppercase">Our Legacy</span>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#FAF0E6] uppercase leading-none">
          Mind Your Wears
        </h1>
        <p className="text-sm md:text-base text-[#C9B99A]/80 max-w-xl font-medium leading-relaxed">
          Phashion Sense is a digital atelier dedicated to the craft of custom bespoke tailoring and luxury personalized fit. We believe that your garments should be an authentic extension of your unique physical signature.
        </p>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mantra Card */}
        <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#1F1C1A] space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[9px] font-extrabold tracking-wider text-[#D4A853] uppercase">Mantra</span>
            <h3 className="text-lg font-bold text-[#FAF0E6] uppercase">Bespoke Fitting</h3>
            <p className="text-xs text-[#C9B99A]/80 leading-relaxed font-semibold">
              "Mind your wears" is more than a slogan; it is our philosophy. It means valuing fit, quality, local heritage, and digital precision in every fiber you choose.
            </p>
          </div>
          <div className="text-[#D4A853] text-[20px] font-black italic mt-4 opacity-30 text-right">
            "Mind your wears"
          </div>
        </div>

        {/* Delivery Card */}
        <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#1F1C1A] space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[9px] font-extrabold tracking-wider text-[#D4A853] uppercase">Logistics</span>
            <h3 className="text-lg font-bold text-[#FAF0E6] uppercase">Nationwide Delivery</h3>
            <p className="text-xs text-[#C9B99A]/80 leading-relaxed font-semibold">
              We leverage elite delivery networks to ensure that no matter where you are across the country, your tailored suits, custom traditional wear, and dresses arrive directly at your doorstep in pristine condition.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 text-[#D4A853] font-bold text-[10px] tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#D4A853] animate-pulse" />
            Active Across All Regions
          </div>
        </div>
      </div>

      {/* Atelier Contact Details */}
      <div className="bg-[#0A0A0A] border border-[#1F1C1A] rounded-2xl p-6 md:p-8 space-y-6">
        <h3 className="text-base font-extrabold text-[#FAF0E6] uppercase tracking-wider">Atelier Details</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#1F1C1A]">
          {/* Location */}
          <div className="space-y-1.5 pt-4 sm:pt-0 sm:pl-0 text-left">
            <span className="block text-[9px] font-extrabold tracking-wider text-[#C9B99A]/50 uppercase">Physical Location</span>
            <h4 className="text-sm font-bold text-[#FAF0E6] uppercase">Kwashieman, Accra</h4>
            <span className="text-[10px] text-[#C9B99A]/75 font-semibold">Ghana, West Africa</span>
          </div>

          {/* Contact */}
          <div className="space-y-1.5 pt-4 sm:pt-0 sm:pl-6 text-left">
            <span className="block text-[9px] font-extrabold tracking-wider text-[#C9B99A]/50 uppercase">Telephone Support</span>
            <a 
              href="tel:+233558067511" 
              className="block text-sm font-bold text-[#D4A853] hover:underline"
            >
              +233 55 806 7511
            </a>
            <span className="text-[10px] text-[#C9B99A]/75 font-semibold">Open Mon - Sat, 8AM - 6PM</span>
          </div>

          {/* Socials */}
          <div className="space-y-1.5 pt-4 sm:pt-0 sm:pl-6 text-left">
            <span className="block text-[9px] font-extrabold tracking-wider text-[#C9B99A]/50 uppercase">Social Media</span>
            <a 
              href="https://www.tiktok.com/@phasion_sense_gh" 
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm font-bold text-[#FAF0E6] hover:text-[#D4A853] transition-colors"
            >
              @phasion_sense_gh
            </a>
            <span className="text-[10px] text-[#C9B99A]/75 font-semibold">Follow us on TikTok</span>
          </div>
        </div>
      </div>
    </div>
  );
}

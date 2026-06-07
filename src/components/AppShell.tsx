'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { getImageUrl } from '@/lib/api';

// Gorgeous custom inline SVG icons to ensure absolute zero-dependency reliability
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-6 h-6 transition-all duration-300 ${
      active ? 'text-[#D4A853] scale-110 drop-shadow-[0_0_8px_rgba(212,168,83,0.5)]' : 'text-[#C9B99A] hover:text-[#FAF0E6]'
    }`}
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const SearchIcon = ({ active }: { active: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-6 h-6 transition-all duration-300 ${
      active ? 'text-[#D4A853] scale-110 drop-shadow-[0_0_8px_rgba(212,168,83,0.5)]' : 'text-[#C9B99A] hover:text-[#FAF0E6]'
    }`}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const StudioIcon = ({ active }: { active: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-6 h-6 transition-all duration-300 ${
      active ? 'text-[#D4A853] scale-110 drop-shadow-[0_0_8px_rgba(212,168,83,0.5)]' : 'text-[#C9B99A] hover:text-[#FAF0E6]'
    }`}
  >
    <path d="M20.38 3.46L16 7.84M20.38 3.46a2 2 0 0 1 0 2.83l-14 14a2 2 0 0 1-2.83-2.83l14-14a2 2 0 0 1 2.83 0z" />
    <path d="m14 5 4 4" />
    <path d="m4.3 20 .7-7 7 7-7.7.3z" />
    <path d="M19 16c-.5 0-1 .5-1 1s-.5 1-1 1 1 .5 1 1 .5 1 1 1 1-.5 1-1-.5-1-1-1zm-9-9c-.5 0-1 .5-1 1s-.5 1-1 1 1 .5 1 1 .5 1 1 1 1-.5 1-1-.5-1-1-1z" />
  </svg>
);

const WishlistIcon = ({ active }: { active: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={active ? '#D4A853' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-6 h-6 transition-all duration-300 ${
      active ? 'text-[#D4A853] scale-110 drop-shadow-[0_0_8px_rgba(212,168,83,0.5)]' : 'text-[#C9B99A] hover:text-[#FAF0E6]'
    }`}
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const CartIcon = ({ active }: { active: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-6 h-6 transition-all duration-300 ${
      active ? 'text-[#D4A853] scale-110 drop-shadow-[0_0_8px_rgba(212,168,83,0.5)]' : 'text-[#C9B99A] hover:text-[#FAF0E6]'
    }`}
  >
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const CampaignIcon = ({ active }: { active: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-6 h-6 transition-all duration-300 ${
      active ? 'text-[#D4A853] scale-110 drop-shadow-[0_0_8px_rgba(212,168,83,0.5)]' : 'text-[#C9B99A] hover:text-[#FAF0E6]'
    }`}
  >
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { cartCount, userProfile } = useApp();

  const isOnboarding = pathname === '/onboarding';

  const avatarUrl = userProfile
    ? userProfile.gender === 'male'
      ? '/images/phasion-sense/ps3.jpg'
      : '/images/phasion-sense/ps1.jpg'
    : null;

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-[#FAF0E6] flex flex-col md:flex-row">
      {/* Desktop Sidebar: Visible only on md and above */}
      {!isOnboarding && (
        <aside className="hidden md:flex md:w-[280px] md:flex-shrink-0 md:flex-col md:bg-[#111111] md:border-r md:border-[#1F1C1A] md:p-6 md:sticky md:top-0 md:h-screen md:justify-between z-45">
          <div className="space-y-8">
            {/* Elegant Header with Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-full overflow-hidden border border-[#D4A853]/45 flex-shrink-0 bg-white p-0.5 shadow-md">
                <img
                  src="/logo.jpg"
                  alt="Phashion Sense Logo"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#FAF0E6] via-[#D4A853] to-[#C9B99A] group-hover:opacity-90 transition-opacity duration-300 uppercase leading-none">
                  PHASHION SENSE
                </span>
                <span className="text-[7px] font-bold tracking-[0.2em] text-[#C9B99A] uppercase mt-1 leading-none">
                  BESPOKE STUDIO
                </span>
              </div>
            </Link>

            {/* Navigation links stack */}
            <nav className="flex flex-col gap-2.5">
              <Link
                href="/"
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                  pathname === '/'
                    ? 'bg-[#D4A853]/10 text-[#D4A853] border border-[#D4A853]/20 shadow-[0_0_12px_rgba(212,168,83,0.06)]'
                    : 'text-[#C9B99A] hover:bg-white/5 hover:text-[#FAF0E6] border border-transparent'
                }`}
              >
                <HomeIcon active={pathname === '/'} />
                <span>Home</span>
              </Link>

              <Link
                href="/search"
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                  pathname === '/search'
                    ? 'bg-[#D4A853]/10 text-[#D4A853] border border-[#D4A853]/20 shadow-[0_0_12px_rgba(212,168,83,0.06)]'
                    : 'text-[#C9B99A] hover:bg-white/5 hover:text-[#FAF0E6] border border-transparent'
                }`}
              >
                <SearchIcon active={pathname === '/search'} />
                <span>Search</span>
              </Link>

              <Link
                href="/studio"
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                  pathname === '/studio'
                    ? 'bg-[#D4A853]/10 text-[#D4A853] border border-[#D4A853]/20 shadow-[0_0_12px_rgba(212,168,83,0.06)]'
                    : 'text-[#C9B99A] hover:bg-white/5 hover:text-[#FAF0E6] border border-transparent'
                }`}
              >
                <StudioIcon active={pathname === '/studio'} />
                <span>Studio</span>
              </Link>

              <Link
                href="/wishlist"
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                  pathname === '/wishlist'
                    ? 'bg-[#D4A853]/10 text-[#D4A853] border border-[#D4A853]/20 shadow-[0_0_12px_rgba(212,168,83,0.06)]'
                    : 'text-[#C9B99A] hover:bg-white/5 hover:text-[#FAF0E6] border border-transparent'
                }`}
              >
                <WishlistIcon active={pathname === '/wishlist'} />
                <span>Wishlist</span>
              </Link>

              <Link
                href="/cart"
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 relative ${
                  pathname === '/cart'
                    ? 'bg-[#D4A853]/10 text-[#D4A853] border border-[#D4A853]/20 shadow-[0_0_12px_rgba(212,168,83,0.06)]'
                    : 'text-[#C9B99A] hover:bg-white/5 hover:text-[#FAF0E6] border border-transparent'
                }`}
              >
                <CartIcon active={pathname === '/cart'} />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#D4A853] to-[#C9B99A] text-[#0A0A0A] text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(212,168,83,0.4)]">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link
                href="/about"
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                  pathname === '/about'
                    ? 'bg-[#D4A853]/10 text-[#D4A853] border border-[#D4A853]/20 shadow-[0_0_12px_rgba(212,168,83,0.06)]'
                    : 'text-[#C9B99A] hover:bg-white/5 hover:text-[#FAF0E6] border border-transparent'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={`w-6 h-6 ${pathname === '/about' ? 'text-[#D4A853]' : 'text-[#C9B99A]'}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                </svg>
                <span>About</span>
              </Link>

              <Link
                href="/admin"
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                  pathname === '/admin'
                    ? 'bg-[#D4A853]/10 text-[#D4A853] border border-[#D4A853]/20 shadow-[0_0_12px_rgba(212,168,83,0.06)]'
                    : 'text-[#C9B99A] hover:bg-white/5 hover:text-[#FAF0E6] border border-transparent'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={`w-6 h-6 ${pathname === '/admin' ? 'text-[#D4A853]' : 'text-[#C9B99A]'}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
                <span>Admin Panel</span>
              </Link>
            </nav>
          </div>

          {/* User Profile Visualizer */}
          {userProfile ? (
            <div className="bg-[#0A0A0A] border border-[#1F1C1A] rounded-2xl p-4 space-y-3.5 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-[#D4A853]/45 flex-shrink-0">
                  <img
                    src={avatarUrl ? getImageUrl(avatarUrl) : '/logo.jpg'}
                    alt={userProfile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-0.5 truncate">
                  <h4 className="text-[11px] font-bold text-[#FAF0E6] truncate">{userProfile.name}</h4>
                  <span className="text-[8px] font-extrabold text-[#D4A853] uppercase tracking-wider capitalize">{userProfile.bodyType} Shape</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-3 border-t border-[#1F1C1A] text-[9px] font-bold uppercase tracking-wider text-[#C9B99A]/80">
                <div className="space-y-0.5">
                  <span className="block text-[7px] text-[#C9B99A]/45">Chest</span>
                  <span className="text-[#FAF0E6]">{userProfile.measurements.chest}"</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[7px] text-[#C9B99A]/45">Waist</span>
                  <span className="text-[#FAF0E6]">{userProfile.measurements.waist}"</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[7px] text-[#C9B99A]/45">Hips</span>
                  <span className="text-[#FAF0E6]">{userProfile.measurements.hips}"</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[7px] text-[#C9B99A]/45">Height</span>
                  <span className="text-[#FAF0E6]">{userProfile.measurements.height}"</span>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/onboarding"
              className="w-full py-3.5 bg-gradient-to-r from-[#D4A853] to-[#C9B99A] text-[#0A0A0A] font-black text-[9px] tracking-wider text-center uppercase rounded-xl hover:shadow-[0_0_12px_rgba(212,168,83,0.25)] transition-all"
            >
              Setup Fit Profile
            </Link>
          )}
        </aside>
      )}

      {/* Main Workspace Frame */}
      <div className={`w-full min-h-screen bg-[#111111] relative flex flex-col ${
        isOnboarding
          ? 'max-w-[430px] mx-auto border-x border-[#1F1C1A] shadow-2xl'
          : 'md:max-w-none md:mx-0 md:border-none md:shadow-none md:flex-1 md:h-screen md:overflow-y-auto'
      }`}>
        
        {/* Elegant Top Header (Sticky) - Hidden on desktop and onboarding */}
        {!isOnboarding && (
          <header className="sticky top-0 z-40 bg-[#111111]/90 backdrop-blur-md border-b border-[#1F1C1A] px-6 py-4 flex items-center justify-between md:hidden">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#D4A853]/45 flex-shrink-0 bg-white p-0.5 shadow-md">
                <img
                  src="/logo.jpg"
                  alt="Phashion Sense Logo"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#FAF0E6] via-[#D4A853] to-[#C9B99A] group-hover:opacity-90 transition-opacity duration-300 uppercase leading-none">
                  PHASHION SENSE
                </span>
                <span className="text-[7px] font-bold tracking-[0.2em] text-[#C9B99A] uppercase mt-0.5 leading-none">
                  BESPOKE STUDIO
                </span>
              </div>
            </Link>
            
            <div className="flex items-center gap-3">
              <Link href="/campaigns/new" className="p-1.5 rounded-full hover:bg-white/5 transition-colors duration-200" title="Create Collection Campaign">
                <CampaignIcon active={pathname === '/campaigns/new'} />
              </Link>
              
              <Link href="/cart" className="relative p-1.5 rounded-full hover:bg-white/5 transition-colors duration-200">
                <CartIcon active={pathname === '/cart'} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#D4A853] to-[#C9B99A] text-[#0A0A0A] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-[#111111] shadow-[0_0_8px_rgba(212,168,83,0.4)] animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              {avatarUrl && (
                <Link href="/studio" className="w-8 h-8 rounded-full overflow-hidden border border-[#1F1C1A] hover:border-[#D4A853]/60 transition-all duration-300 flex-shrink-0">
                  <img
                    src={getImageUrl(avatarUrl)}
                    alt={userProfile?.name || 'User Profile'}
                    className="w-full h-full object-cover"
                  />
                </Link>
              )}
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 flex flex-col ${isOnboarding ? '' : 'pb-24 md:pb-8 md:px-8 md:py-6'}`}>
          {children}
        </main>

        {/* Bottom Navigation Dock - Hidden on desktop and onboarding */}
        {!isOnboarding && (
          <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#111111]/95 backdrop-blur-lg border-t border-[#1F1C1A] px-6 py-4 flex items-center justify-between shadow-[0_-8px_24px_rgba(0,0,0,0.4)] md:hidden">
            <Link href="/" className="flex flex-col items-center justify-center gap-1 group">
              <HomeIcon active={pathname === '/'} />
              <span className={`text-[10px] font-medium tracking-wider transition-colors duration-300 ${pathname === '/' ? 'text-[#D4A853]' : 'text-[#C9B99A]'}`}>
                Home
              </span>
            </Link>

            <Link href="/search" className="flex flex-col items-center justify-center gap-1 group">
              <SearchIcon active={pathname === '/search'} />
              <span className={`text-[10px] font-medium tracking-wider transition-colors duration-300 ${pathname === '/search' ? 'text-[#D4A853]' : 'text-[#C9B99A]'}`}>
                Search
              </span>
            </Link>

            <Link href="/studio" className="flex flex-col items-center justify-center gap-1 group relative">
              <div className="absolute -top-7 bg-gradient-to-b from-[#FAF0E6] to-[#D4A853] p-[1.5px] rounded-full shadow-[0_4px_12px_rgba(212,168,83,0.3)] group-hover:scale-105 transition-transform duration-300">
                <div className="bg-[#111111] rounded-full p-2.5 flex items-center justify-center">
                  <StudioIcon active={pathname === '/studio'} />
                </div>
              </div>
              <span className={`text-[10px] font-medium tracking-wider transition-colors duration-300 mt-6 ${pathname === '/studio' ? 'text-[#D4A853]' : 'text-[#C9B99A]'}`}>
                Studio
              </span>
            </Link>

            <Link href="/wishlist" className="flex flex-col items-center justify-center gap-1 group">
              <WishlistIcon active={pathname === '/wishlist'} />
              <span className={`text-[10px] font-medium tracking-wider transition-colors duration-300 ${pathname === '/wishlist' ? 'text-[#D4A853]' : 'text-[#C9B99A]'}`}>
                Wishlist
              </span>
            </Link>

            <Link href="/cart" className="flex flex-col items-center justify-center gap-1 group relative">
              <CartIcon active={pathname === '/cart'} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-2 bg-[#D4A853] text-[#0A0A0A] text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#111111]">
                  {cartCount}
                </span>
              )}
              <span className={`text-[10px] font-medium tracking-wider transition-colors duration-300 ${pathname === '/cart' ? 'text-[#D4A853]' : 'text-[#C9B99A]'}`}>
                Cart
              </span>
            </Link>
          </nav>
        )}
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';

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

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { cartCount, userProfile } = useApp();

  const isOnboarding = pathname === '/onboarding';

  const avatarUrl = userProfile
    ? userProfile.gender === 'male'
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    : null;

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-[#FAF0E6] flex flex-col">
      {/* Mobile-sized Device Container Centered */}
      <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#111111] shadow-2xl relative flex flex-col border-x border-[#1F1C1A] overflow-hidden">
        
        {/* Elegant Top Header (Sticky) - Hidden on Onboarding */}
        {!isOnboarding && (
          <header className="sticky top-0 z-40 bg-[#111111]/90 backdrop-blur-md border-b border-[#1F1C1A] px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex flex-col group">
              <span className="text-xl font-bold tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-[#FAF0E6] via-[#D4A853] to-[#C9B99A] group-hover:opacity-90 transition-opacity duration-300 uppercase">
                Clothify
              </span>
              <span className="text-[9px] font-medium tracking-[0.3em] text-[#C9B99A] uppercase">
                powered by phasion sense
              </span>
            </Link>
            
            <div className="flex items-center gap-3">
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
                    src={avatarUrl}
                    alt={userProfile?.name || 'User Profile'}
                    className="w-full h-full object-cover"
                  />
                </Link>
              )}
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col pb-24 overflow-x-hidden">
          {children}
        </main>

        {/* Bottom Navigation Dock - Hidden on Onboarding */}
        {!isOnboarding && (
          <nav className="absolute bottom-0 left-0 right-0 z-40 bg-[#111111]/95 backdrop-blur-lg border-t border-[#1F1C1A] px-6 py-4 flex items-center justify-between shadow-[0_-8px_24px_rgba(0,0,0,0.4)]">
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

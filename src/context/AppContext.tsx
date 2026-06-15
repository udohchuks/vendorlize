'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Item, Merchant, getMerchants } from '@/lib/api';

export interface CartItem {
  itemId: string;
  merchantId: string;
  name: string;
  brand: string; // Merchant name
  priceMinor: number;
  currency: string;
  image: string;
  size: string;
  qty: number;
}

export interface UserMeasurements {
  chest: number;
  waist: number;
  hips: number;
  height: number;
  inseam: number;
}

export interface UserProfile {
  name: string;
  gender: 'male' | 'female';
  bodyType: string;
  measurements: UserMeasurements;
}

interface AppContextType {
  cart: CartItem[];
  wishlist: Item[];
  userProfile: UserProfile | null;
  merchants: Merchant[];
  isLoadingMerchants: boolean;
  addToCart: (item: Item, merchantName: string, size: string) => void;
  removeFromCart: (itemId: string, size: string) => void;
  updateQty: (itemId: string, size: string, delta: number) => void;
  clearCart: () => void;
  toggleWishlist: (item: Item) => void;
  isWishlisted: (itemId: string) => boolean;
  saveProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Item[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoadingMerchants, setIsLoadingMerchants] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('clothify_cart');
      const storedWishlist = localStorage.getItem('clothify_wishlist');
      const storedProfile = localStorage.getItem('clothify_profile');

      const brokenIds = ['ps-12', 'ps-15'];
      const isIdBroken = (id: string) => {
        return id.startsWith('as-') || id.startsWith('km-') || id.startsWith('rt-') || brokenIds.includes(id);
      };

      if (storedCart) {
        const parsed = JSON.parse(storedCart) as CartItem[];
        const filtered = parsed.filter(item => !isIdBroken(item.itemId));
        setCart(filtered);
      }
      if (storedWishlist) {
        const parsed = JSON.parse(storedWishlist) as Item[];
        const filtered = parsed.filter(item => !isIdBroken(item.id));
        setWishlist(filtered);
      }
      if (storedProfile) setUserProfile(JSON.parse(storedProfile));
    } catch (e) {
      console.error('Failed to load localStorage data', e);
    }
    setIsInitialized(true);

    // Fetch merchants to cache
    const fetchMerchants = async () => {
      setIsLoadingMerchants(true);
      const res = await getMerchants();
      if (res.data) {
        setMerchants(res.data);
      }
      setIsLoadingMerchants(false);
    };
    fetchMerchants();
  }, []);

  // Save to localStorage on state changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('clothify_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('clothify_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (userProfile) {
        localStorage.setItem('clothify_profile', JSON.stringify(userProfile));
      } else {
        localStorage.removeItem('clothify_profile');
      }
    } catch (e) {
      console.error('Failed to save profile to localStorage', e);
    }
  }, [userProfile, isInitialized]);

  // Cart Actions
  const addToCart = (item: Item, merchantName: string, size: string) => {
    setCart((prev) => {
      // Find if item with same ID and same size already exists
      const existingIndex = prev.findIndex(
        (i) => i.itemId === item.id && i.size === size
      );

      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex].qty += 1;
        return newCart;
      }

      // Prepend the base URL to relative image urls if needed
      const imgUrl = item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : '';

      const newItem: CartItem = {
        itemId: item.id,
        merchantId: item.merchant_id,
        name: item.name,
        brand: merchantName,
        priceMinor: item.price_minor,
        currency: item.currency,
        image: imgUrl,
        size,
        qty: 1,
      };

      return [...prev, newItem];
    });
  };

  const removeFromCart = (itemId: string, size: string) => {
    setCart((prev) => prev.filter((i) => !(i.itemId === itemId && i.size === size)));
  };

  const updateQty = (itemId: string, size: string, delta: number) => {
    setCart((prev) => {
      const index = prev.findIndex((i) => i.itemId === itemId && i.size === size);
      if (index === -1) return prev;

      const newCart = [...prev];
      const newQty = newCart[index].qty + delta;

      if (newQty <= 0) {
        return prev.filter((i) => !(i.itemId === itemId && i.size === size));
      }

      newCart[index].qty = newQty;
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist Actions
  const toggleWishlist = (item: Item) => {
    setWishlist((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const isWishlisted = (itemId: string) => {
    return wishlist.some((i) => i.id === itemId);
  };

  // Profile Actions
  const saveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const clearProfile = () => {
    setUserProfile(null);
  };

  // Derived Values
  const cartCount = cart.reduce((total, item) => total + item.qty, 0);
  const cartTotal = cart.reduce((total, item) => total + item.priceMinor * item.qty, 0);
  const wishlistCount = wishlist.length;

  return (
    <AppContext.Provider
      value={{
        cart,
        wishlist,
        userProfile,
        merchants,
        isLoadingMerchants,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        toggleWishlist,
        isWishlisted,
        saveProfile,
        clearProfile,
        cartCount,
        cartTotal,
        wishlistCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppContextProvider');
  }
  return context;
};

// Centralized API layer for Clothify (powered by Phasion Sense)
// Base URL: https://api-hackathon.codedematrixtech.com

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-hackathon.codedematrixtech.com';
const TEAM_SLUG = process.env.NEXT_PUBLIC_TEAM_SLUG || 'phasion-sense';

export interface Merchant {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  whatsapp_number: string | null;
  brand_colors?: string[] | null;
}

export interface Item {
  id: string;
  merchant_id: string;
  name: string;
  description: string | null;
  price_minor: number;
  currency: string;
  image_urls: string[] | null;
  in_stock: boolean;
}

export interface Campaign {
  id: string;
  title: string;
  copy_text: string | null;
  image_urls: string[] | null;
  team_slug: string | null;
  created_at: number;
  featured_items?: Item[];
  merchant_id?: string | null;
}

export interface BasketItemInput {
  item_id: string;
  qty: number;
  item_note?: string | null; // Used for size e.g. "Size: M"
}

export interface BasketCreateRequest {
  merchant_id: string;
  items: BasketItemInput[];
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_note?: string | null;
  team_slug?: string | null;
}

export interface Basket {
  id: string;
  merchant: {
    id: string;
    name: string;
    whatsapp_number: string | null;
  } | null;
  items: Array<{
    item_id: string;
    name: string;
    price_minor: number;
    currency: string;
    image_url: string | null;
    in_stock: boolean;
    qty: number;
    item_note: string | null;
  }>;
  total_minor: number;
  currency: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_note: string | null;
  team_slug: string | null;
  created_at: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Helper wrapper for fetches to avoid repeating try/catch blocks
async function safeFetch<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    const json = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: json.message || json.error || `Request failed with status ${response.status}`,
      };
    }

    return { data: json as T, error: null };
  } catch (err: any) {
    return {
      data: null,
      error: err.message || 'An unexpected network error occurred.',
    };
  }
}

// ── MERCHANTS API ──

export async function getMerchants(): Promise<ApiResponse<Merchant[]>> {
  return safeFetch<Merchant[]>(`${BASE_URL}/merchants`);
}

export async function getMerchantDetail(slug: string): Promise<ApiResponse<Merchant>> {
  return safeFetch<Merchant>(`${BASE_URL}/merchants/${slug}`);
}

// ── ITEMS API ──

export async function getItems(merchantSlug: string): Promise<ApiResponse<Item[]>> {
  return safeFetch<Item[]>(`${BASE_URL}/merchants/${merchantSlug}/items`);
}

/**
 * Aggregates all items from standard merchants configured in env.
 * Defaults to: rashida-tailors, amina-stitches, kofi-menswear
 */
export async function getAllItems(): Promise<ApiResponse<Item[]>> {
  const merchantsStr = process.env.NEXT_PUBLIC_MERCHANTS || 'rashida-tailors,amina-stitches,kofi-menswear';
  const merchants = merchantsStr.split(',').map((s) => s.trim());

  try {
    const results = await Promise.all(
      merchants.map((slug) => getItems(slug))
    );

    const allItems: Item[] = [];
    let firstError: string | null = null;

    results.forEach((res) => {
      if (res.data) {
        allItems.push(...res.data);
      } else if (res.error && !firstError) {
        firstError = res.error;
      }
    });

    if (allItems.length === 0 && firstError) {
      return { data: null, error: firstError };
    }

    return { data: allItems, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch merged catalog.' };
  }
}

export async function getItemById(itemId: string): Promise<ApiResponse<Item>> {
  return safeFetch<Item>(`${BASE_URL}/items/${itemId}`);
}

// ── CAMPAIGNS API ──

export async function getCampaigns(merchantSlug: string, teamSlug?: string): Promise<ApiResponse<Campaign[]>> {
  const url = new URL(`${BASE_URL}/merchants/${merchantSlug}/campaigns`);
  if (teamSlug) {
    url.searchParams.append('team_slug', teamSlug);
  }
  return safeFetch<Campaign[]>(url.toString());
}

/**
 * Aggregates campaigns from configured merchants, filtered by our team slug.
 */
export async function getAllCampaigns(): Promise<ApiResponse<Campaign[]>> {
  const merchantsStr = process.env.NEXT_PUBLIC_MERCHANTS || 'rashida-tailors,amina-stitches,kofi-menswear';
  const merchants = merchantsStr.split(',').map((s) => s.trim());

  try {
    const results = await Promise.all(
      merchants.map((slug) => getCampaigns(slug, TEAM_SLUG))
    );

    const allCampaigns: Campaign[] = [];
    results.forEach((res) => {
      if (res.data) {
        allCampaigns.push(...res.data);
      }
    });

    // If no team specific campaigns found, try fetching campaigns without team filter to show content
    if (allCampaigns.length === 0) {
      const genericResults = await Promise.all(
        merchants.map((slug) => getCampaigns(slug))
      );
      genericResults.forEach((res) => {
        if (res.data) {
          allCampaigns.push(...res.data);
        }
      });
    }

    // Sort by created_at descending if available
    allCampaigns.sort((a, b) => b.created_at - a.created_at);

    return { data: allCampaigns, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch campaigns.' };
  }
}

export interface CampaignDetail {
  id: string;
  merchant: {
    id: string;
    name: string;
    whatsapp_number: string | null;
  } | null;
  title: string;
  copy_text: string | null;
  image_urls: string[] | null;
  featured_items: Item[];
  team_slug: string | null;
  created_at: number;
}

export async function getCampaignById(campaignId: string): Promise<ApiResponse<CampaignDetail>> {
  return safeFetch<CampaignDetail>(`${BASE_URL}/campaigns/${campaignId}`);
}

// ── BASKETS API ──

export async function createBasket(basketData: BasketCreateRequest): Promise<ApiResponse<{ id: string }>> {
  return safeFetch<{ id: string }>(`${BASE_URL}/baskets`, {
    method: 'POST',
    body: JSON.stringify({
      ...basketData,
      team_slug: basketData.team_slug || TEAM_SLUG,
    }),
  });
}

export async function getBasket(basketId: string): Promise<ApiResponse<Basket>> {
  return safeFetch<Basket>(`${BASE_URL}/baskets/${basketId}`);
}

// ── TEAMS API ──

export interface TeamCreateRequest {
  slug: string;
  name: string;
  merchant_id: string;
  contact?: string | null;
}

export interface Team {
  slug: string;
  name: string;
  merchant_id: string | null;
  created_at: number;
}

export async function registerTeam(data: TeamCreateRequest): Promise<ApiResponse<{ slug: string }>> {
  return safeFetch<{ slug: string }>(`${BASE_URL}/teams`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getTeam(slug: string): Promise<ApiResponse<Team>> {
  return safeFetch<Team>(`${BASE_URL}/teams/${slug}`);
}

// ── HELPER UTILITIES ──

/**
 * Formats a minor-unit price (e.g. 15000 pesewas) into major currency string
 */
export function formatPrice(priceMinor: number, currency: string = 'GHS'): string {
  const major = priceMinor / 100;
  return `${currency} ${major.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Returns fully qualified image URL by prepending BASE_URL to relative paths
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  // Pre-configured premium model/clothing Unsplash images for Phasion Sense catalog items (ps1 to ps15)
  const psSenseMap: Record<string, string> = {
    'ps1': 'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=600&auto=format&fit=crop&q=80', // Shirt 1 (Model in patterned shirt)
    'ps2': 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop&q=80', // Shirt 2 (Model in casual shirt)
    'ps3': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80', // Shirt 3 (Model in white shirt)
    'ps4': 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80', // Shirt 4 (Model in black shirt)
    'ps5': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80', // Shirt 5 (Model in linen shirt)
    'ps6': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80', // Shirt 6 (Model in summer shirt)
    'ps7': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80', // Shirt 7 (Model in classic shirt)
    'ps8': 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600&auto=format&fit=crop&q=80', // Shirt 8 (Model in oversize shirt)
    'ps9': 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80', // Shirt 9 (Model in blue shirt)
    'ps10': 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&auto=format&fit=crop&q=80', // Shirt 10 (Model in formal shirt)
    'ps11': 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&auto=format&fit=crop&q=80', // Shirt 11 (Model in vintage shirt)
    'ps12': 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop&q=80', // Two Piece 1 (Model in two piece)
    'ps13': 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=600&auto=format&fit=crop&q=80', // Two Piece 2 (Model in two piece suit)
    'ps14': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80', // Two Piece 3 (Model in design two piece)
    'ps15': 'https://images.unsplash.com/photo-1598808503746-f34c53b20ef3?w=600&auto=format&fit=crop&q=80', // Two Piece 4 (Model in matching set)
  };

  // Extract ID or filename from path
  const lowerPath = path.toLowerCase();
  
  // Check if it's one of the Phasion Sense items
  for (const [key, url] of Object.entries(psSenseMap)) {
    if (lowerPath.includes(key)) {
      return url;
    }
  }

  // Fallback keyword-based premium mapping for other merchants
  if (lowerPath.includes('dress') || lowerPath.includes('gown') || lowerPath.includes('amina-stitches')) {
    return 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerPath.includes('suit') || lowerPath.includes('blazer') || lowerPath.includes('kofi-menswear')) {
    return 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerPath.includes('shirt') || lowerPath.includes('t-shirt') || lowerPath.includes('top')) {
    return 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerPath.includes('trouser') || lowerPath.includes('pant') || lowerPath.includes('short') || lowerPath.includes('denim')) {
    return 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerPath.includes('agbada') || lowerPath.includes('kaftan') || lowerPath.includes('traditional') || lowerPath.includes('rashida-tailors')) {
    return 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerPath.includes('sandals') || lowerPath.includes('slippers') || lowerPath.includes('shoes')) {
    return 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerPath.includes('cap') || lowerPath.includes('fila') || lowerPath.includes('tie') || lowerPath.includes('pocket')) {
    return 'https://images.unsplash.com/photo-1614179924047-e1cb4e815f67?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerPath.includes('logo') || lowerPath.includes('brand')) {
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
}

/**
 * Builds standard wa.me WhatsApp deep link
 */
export function buildWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Infers category based on item name and description keywords
 */
export function inferCategory(name: string, description: string | null): string {
  const text = `${name} ${description || ''}`.toLowerCase();
  
  if (text.includes('agbada') || text.includes('kaftan') || text.includes('traditional') || text.includes('kente') || text.includes('dashiki') || text.includes('boubou') || text.includes('native')) {
    return 'Traditional';
  }
  if (text.includes('suit') || text.includes('blazer') || text.includes('tuxedo') || text.includes('formal') || text.includes('corporate')) {
    return 'Suits';
  }
  if (text.includes('dress') || text.includes('gown') || text.includes('skirt')) {
    return 'Dresses';
  }
  if (text.includes('shirt') || text.includes('t-shirt') || text.includes('polo') || text.includes('top') || text.includes('blouse')) {
    return 'Shirts';
  }
  if (text.includes('trouser') || text.includes('pant') || text.includes('jean') || text.includes('short') || text.includes('jogger')) {
    return 'Trousers';
  }
  
  return 'Casual';
}

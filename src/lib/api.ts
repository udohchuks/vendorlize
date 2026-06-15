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

/**
 * Helper to check if an item has working images or is known to be broken.
 */
export function isItemValid(item: any): boolean {
  if (!item || !item.id) return false;
  
  // Known broken IDs
  const brokenIds = ['ps-12', 'ps-15'];
  if (brokenIds.includes(item.id)) return false;

  // amina-stitches (as-), kofi-menswear (km-), and rashida-tailors (rt-) items are all broken (404 images)
  if (item.id.startsWith('as-') || item.id.startsWith('km-') || item.id.startsWith('rt-')) return false;

  // Check image urls if present
  if (item.image_urls !== undefined) {
    if (!item.image_urls || item.image_urls.length === 0) return false;
  } else if (item.image_url !== undefined) {
    if (!item.image_url) return false;
  }

  return true;
}

export async function getItems(merchantSlug: string): Promise<ApiResponse<Item[]>> {
  const res = await safeFetch<Item[]>(`${BASE_URL}/merchants/${merchantSlug}/items`);
  if (res.data) {
    const validItems = res.data.filter(isItemValid);
    const forced = validItems.map(item => ({
      ...item,
      in_stock: true, // Force in_stock to be true for storefront presentation
    }));
    return { data: forced, error: null };
  }
  return res;
}

/**
 * Aggregates all items from standard merchants configured in env.
 * Defaults to: rashida-tailors, amina-stitches, kofi-menswear
 */
export async function getAllItems(): Promise<ApiResponse<Item[]>> {
  const merchantsStr = process.env.NEXT_PUBLIC_MERCHANTS || 'phasion-sense,amina-stitches,kofi-menswear';
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
  const res = await safeFetch<Item>(`${BASE_URL}/items/${itemId}`);
  if (res.data) {
    if (!isItemValid(res.data)) {
      return { data: null, error: 'Item is not available (broken or missing assets)' };
    }
    return {
      data: {
        ...res.data,
        in_stock: true, // Force in_stock to be true
      },
      error: null,
    };
  }
  return res;
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
  const merchantsStr = process.env.NEXT_PUBLIC_MERCHANTS || 'phasion-sense,amina-stitches,kofi-menswear';
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

export interface CampaignFeaturedItem {
  id: string;
  name: string;
  price_minor: number;
  currency?: string | null;
  image_url?: string | null;
  in_stock?: boolean;
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
  featured_items: CampaignFeaturedItem[];
  team_slug: string | null;
  created_at: number;
}

export async function getCampaignById(campaignId: string): Promise<ApiResponse<CampaignDetail>> {
  const res = await safeFetch<CampaignDetail>(`${BASE_URL}/campaigns/${campaignId}`);
  if (res.data) {
    const validFeaturedItems = res.data.featured_items.filter(isItemValid);
    const forced = {
      ...res.data,
      featured_items: validFeaturedItems.map((fi) => ({
        ...fi,
        in_stock: true, // Force in_stock to be true for featured items as well
      })),
    };
    return { data: forced, error: null };
  }
  return res;
}

export interface CampaignCreateRequest {
  merchant_id: string;
  title: string;
  copy_text?: string | null;
  image_urls?: string[] | null;
  featured_item_ids?: string[] | null;
  team_slug?: string | null;
}

export async function createCampaign(data: CampaignCreateRequest): Promise<ApiResponse<{ id: string }>> {
  return safeFetch<{ id: string }>(`${BASE_URL}/campaigns`, {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      team_slug: data.team_slug || TEAM_SLUG,
    }),
  });
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

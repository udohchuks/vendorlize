# Hackathon Merchant API — Reference Documentation

> **Base URL:** `https://api-hackathon.codedematrixtech.com`  
> **Version:** `0.1.0`  
> **Spec:** [OpenAPI 3.1.0](https://api-hackathon.codedematrixtech.com/openapi.json) · [Swagger UI](https://api-hackathon.codedematrixtech.com/docs)  
> **Description:** Backend API for a WhatsApp-based merchant commerce hackathon.

---

## How This Documentation Was Generated

This document was produced by directly fetching and parsing the machine-readable **OpenAPI 3.1.0 specification** served by the API itself at:

```
GET https://api-hackathon.codedematrixtech.com/openapi.json
```

The `/docs` page is a Swagger UI interface that loads that same `openapi.json` file in the browser. Instead of reading the rendered HTML, the raw JSON spec was fetched directly — this is the **single source of truth** for the API and is 100% accurate to what the server exposes.

Additionally, the following live endpoints were hit to cross-verify the schema against real response data:

| Endpoint | Result |
|---|---|
| `GET /health` | `{"status":"ok","db":"ok","uploads":"ok","assets":"ok"}` — all fields confirmed |
| `GET /merchants` | Returned merchant objects with all documented fields (`id`, `name`, `description`, `logo_url`, `whatsapp_number`) |
| `GET /teams` | Returned team objects matching the `TeamSummary` schema exactly |

The spec was re-fetched a second time to confirm it had not changed between documentation passes — both fetches were byte-for-byte identical.

> [!NOTE]
> **Fallback WhatsApp Number:** Wherever `whatsapp_number` is `null` or missing in any API response, use the following number as the default contact:  
> **`+2347072099407`**

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Common Responses](#common-responses)
4. [Endpoints](#endpoints)
   - [Meta](#meta)
   - [Merchants](#merchants)
   - [Items](#items)
   - [Baskets](#baskets)
   - [Campaigns](#campaigns)
   - [Teams](#teams)
   - [Uploads](#uploads)
5. [Data Schemas](#data-schemas)
6. [Notes on Pricing](#notes-on-pricing)

---

## Overview

This API enables hackathon teams to build WhatsApp-based storefront experiences for merchants. Core concepts:

| Concept | Description |
|---|---|
| **Merchant** | A business/store with products (items). Referenced by a URL `slug`. |
| **Item** | A product belonging to a merchant with price, stock status, and images. |
| **Basket** | A shopping cart created by a customer for a specific merchant. |
| **Campaign** | A marketing/promotional bundle (images + copy + featured items) tied to a merchant. |
| **Team** | A hackathon team registered to work on a specific merchant. |
| **Upload** | A file (image) uploaded or rehosted to the platform's CDN. |

---

## Authentication

No authentication is required. All endpoints are public.

---

## Common Responses

All error responses follow the `ErrorResponse` schema:

```json
{
  "error": "not_found",
  "message": "Merchant with slug 'foo' not found."
}
```

| Status Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Resource created |
| `404` | Resource not found |
| `409` | Resource already exists (conflict) |
| `413` | File exceeds size limit |
| `422` | Validation failed or business rule violation |
| `503` | Service dependency unavailable |

---

## Endpoints

---

### Meta

#### `GET /health`

Check the health of the API and its dependencies.

**Tags:** `meta`

**Response `200`** — `HealthResponse`

```json
{
  "status": "ok",
  "db": "ok",
  "uploads": "ok",
  "assets": "ok"
}
```

| Field | Type | Description |
|---|---|---|
| `status` | `string` | Overall service status |
| `db` | `string` | Database connectivity status |
| `uploads` | `string` | Upload storage status |
| `assets` | `string` | Asset CDN status |

**Response `503`** — `ErrorResponse` — A required dependency is unavailable.

---

### Merchants

#### `GET /merchants`

List all merchants available in the system.

**Tags:** `merchants`

**Response `200`** — Array of `MerchantListItem`

```json
[
  {
    "id": "abc123",
    "name": "Mama's Kitchen",
    "description": "Home-cooked meals delivered fresh",
    "logo_url": "https://cdn.example.com/logo.png",
    "whatsapp_number": "+2348012345678"
  }
]
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique merchant ID |
| `name` | `string` | ✅ | Display name |
| `description` | `string \| null` | ❌ | Short description |
| `logo_url` | `string \| null` | ❌ | URL to merchant logo |
| `whatsapp_number` | `string \| null` | ❌ | WhatsApp contact number. **If `null`, use `+2347072099407` as fallback.** |

---

#### `GET /merchants/{slug}`

Get full details for a single merchant by their slug.

**Tags:** `merchants`

**Path Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `slug` | `string` | ✅ | Merchant URL slug |

**Response `200`** — `MerchantDetail`

```json
{
  "id": "abc123",
  "name": "Mama's Kitchen",
  "description": "Home-cooked meals",
  "logo_url": "https://cdn.example.com/logo.png",
  "brand_colors": ["#FF5733", "#C70039"],
  "whatsapp_number": "+2348012345678"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique merchant ID |
| `name` | `string` | ✅ | Display name |
| `description` | `string \| null` | ❌ | Short description |
| `logo_url` | `string \| null` | ❌ | URL to merchant logo |
| `brand_colors` | `string[] \| null` | ❌ | Array of hex color codes for branding |
| `whatsapp_number` | `string \| null` | ❌ | WhatsApp contact number. **If `null`, use `+2347072099407` as fallback.** |

**Response `404`** — `ErrorResponse` — Merchant slug not found.

---

#### `GET /merchants/{slug}/items`

List all items (products) for a specific merchant.

**Tags:** `merchants`

**Path Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `slug` | `string` | ✅ | Merchant URL slug |

**Response `200`** — Array of `ItemResponse`

```json
[
  {
    "id": "item_001",
    "merchant_id": "abc123",
    "name": "Jollof Rice",
    "description": "Spicy Nigerian jollof rice",
    "price_minor": 150000,
    "currency": "NGN",
    "image_urls": ["https://cdn.example.com/jollof.png"],
    "in_stock": true
  }
]
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique item ID |
| `merchant_id` | `string` | ✅ | Owning merchant's ID |
| `name` | `string` | ✅ | Item display name |
| `description` | `string \| null` | ❌ | Item description |
| `price_minor` | `integer` | ✅ | Price in minor units (e.g. kobo, cents) |
| `currency` | `string` | ✅ | ISO 4217 currency code (e.g. `NGN`) |
| `image_urls` | `string[] \| null` | ❌ | Array of image URLs |
| `in_stock` | `boolean` | ✅ | Whether the item is currently available |

**Response `404`** — `ErrorResponse` — Merchant slug not found.

---

#### `GET /merchants/{slug}/campaigns`

List campaigns for a specific merchant, optionally filtered by team.

**Tags:** `merchants`

**Path Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `slug` | `string` | ✅ | Merchant URL slug |

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `team_slug` | `string \| null` | ❌ | Filter campaigns by team slug |

**Response `200`** — Array of `CampaignSummary`

```json
[
  {
    "id": "camp_001",
    "title": "Weekend Special",
    "copy_text": "Get 20% off all orders this weekend!",
    "image_urls": ["https://cdn.example.com/banner.png"],
    "team_slug": "team-alpha",
    "created_at": 1716400000
  }
]
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Campaign ID |
| `title` | `string` | ✅ | Campaign title |
| `copy_text` | `string \| null` | ❌ | Marketing copy / body text |
| `image_urls` | `string[] \| null` | ❌ | Campaign image URLs |
| `team_slug` | `string \| null` | ❌ | Slug of the team that created it |
| `created_at` | `integer` | ✅ | Unix timestamp of creation |

**Response `404`** — `ErrorResponse` — Merchant slug not found.

---

### Items

#### `GET /items/{item_id}`

Get details for a single item by its ID.

**Tags:** `items`

**Path Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `item_id` | `string` | ✅ | Item unique ID |

**Response `200`** — `ItemResponse` (see schema above)

**Response `404`** — `ErrorResponse` — Item not found.

---

### Baskets

#### `POST /baskets`

Create a new basket (shopping cart) for a customer.

**Tags:** `baskets`

**Request Body** — `application/json` — `BasketCreateRequest`

```json
{
  "merchant_id": "abc123",
  "items": [
    {
      "item_id": "item_001",
      "qty": 2,
      "item_note": "Extra spicy please"
    }
  ],
  "customer_name": "Chukwudi Obi",
  "customer_phone": "+2348012345678",
  "customer_note": "Please deliver before 6pm",
  "team_slug": "team-alpha"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `merchant_id` | `string` | ✅ | ID of the merchant to order from |
| `items` | `BasketItemInput[]` | ✅ | List of items (min 1) |
| `items[].item_id` | `string` | ✅ | ID of the item |
| `items[].qty` | `integer` | ✅ | Quantity (min: 1) |
| `items[].item_note` | `string \| null` | ❌ | Per-item special instructions |
| `customer_name` | `string \| null` | ❌ | Customer display name |
| `customer_phone` | `string \| null` | ❌ | Customer phone number |
| `customer_note` | `string \| null` | ❌ | Overall order notes |
| `team_slug` | `string \| null` | ❌ | Team slug to attribute this basket to |

**Response `201`** — `BasketCreateResponse`

```json
{
  "id": "basket_abc"
}
```

**Response `404`** — `ErrorResponse` — Merchant or item not found.  
**Response `422`** — `ErrorResponse` — Validation failed (e.g. item out of stock, qty < 1).

---

#### `GET /baskets/{basket_id}`

Retrieve a basket and its full details.

**Tags:** `baskets`

**Path Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `basket_id` | `string` | ✅ | Basket unique ID |

**Response `200`** — `BasketDetail`

```json
{
  "id": "basket_abc",
  "merchant": {
    "id": "abc123",
    "name": "Mama's Kitchen",
    "whatsapp_number": "+2348012345678"
  },
  "items": [
    {
      "item_id": "item_001",
      "name": "Jollof Rice",
      "price_minor": 150000,
      "currency": "NGN",
      "image_url": "https://cdn.example.com/jollof.png",
      "in_stock": true,
      "qty": 2,
      "item_note": "Extra spicy please"
    }
  ],
  "total_minor": 300000,
  "currency": "NGN",
  "customer_name": "Chukwudi Obi",
  "customer_phone": "+2348012345678",
  "customer_note": "Please deliver before 6pm",
  "team_slug": "team-alpha",
  "created_at": 1716400000
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Basket ID |
| `merchant` | `BasketMerchant \| null` | ❌ | Merchant info |
| `merchant.id` | `string` | ✅ | Merchant ID |
| `merchant.name` | `string` | ✅ | Merchant name |
| `merchant.whatsapp_number` | `string \| null` | ❌ | Merchant WhatsApp. **If `null`, use `+2347072099407` as fallback.** |
| `items` | `BasketItem[]` | ✅ | Line items |
| `total_minor` | `integer` | ✅ | Total order value in minor currency units |
| `currency` | `string \| null` | ❌ | Currency code |
| `customer_name` | `string \| null` | ❌ | Customer name |
| `customer_phone` | `string \| null` | ❌ | Customer phone |
| `customer_note` | `string \| null` | ❌ | Order-level note |
| `team_slug` | `string \| null` | ❌ | Attributing team |
| `created_at` | `integer` | ✅ | Unix timestamp |

**Response `404`** — `ErrorResponse` — Basket not found.

---

### Campaigns

#### `POST /campaigns`

Create a new marketing campaign for a merchant.

**Tags:** `campaigns`

**Request Body** — `application/json` — `CampaignCreateRequest`

```json
{
  "merchant_id": "abc123",
  "title": "Weekend Special",
  "copy_text": "Get 20% off all orders this weekend!",
  "image_urls": ["https://cdn.example.com/banner.png"],
  "featured_item_ids": ["item_001", "item_002"],
  "team_slug": "team-alpha"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `merchant_id` | `string` | ✅ | ID of the merchant this campaign belongs to |
| `title` | `string` | ✅ | Campaign title / headline |
| `copy_text` | `string \| null` | ❌ | Marketing body text |
| `image_urls` | `string[] \| null` | ❌ | Campaign banner/image URLs |
| `featured_item_ids` | `string[] \| null` | ❌ | IDs of items to highlight in the campaign |
| `team_slug` | `string \| null` | ❌ | Team to attribute this campaign to |

**Response `201`** — `CampaignCreateResponse`

```json
{
  "id": "camp_001"
}
```

**Response `404`** — `ErrorResponse` — Merchant or item not found.  
**Response `422`** — `ErrorResponse` — Validation failed.

---

#### `GET /campaigns/{campaign_id}`

Get full details for a campaign including featured items.

**Tags:** `campaigns`

**Path Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `campaign_id` | `string` | ✅ | Campaign unique ID |

**Response `200`** — `CampaignDetail`

```json
{
  "id": "camp_001",
  "merchant": {
    "id": "abc123",
    "name": "Mama's Kitchen",
    "whatsapp_number": "+2348012345678"
  },
  "title": "Weekend Special",
  "copy_text": "Get 20% off all orders this weekend!",
  "image_urls": ["https://cdn.example.com/banner.png"],
  "featured_items": [
    {
      "id": "item_001",
      "name": "Jollof Rice",
      "price_minor": 150000,
      "currency": "NGN",
      "image_url": "https://cdn.example.com/jollof.png",
      "in_stock": true
    }
  ],
  "team_slug": "team-alpha",
  "created_at": 1716400000
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Campaign ID |
| `merchant` | `BasketMerchant \| null` | ❌ | Merchant summary. `whatsapp_number` inside — **if `null`, use `+2347072099407` as fallback.** |
| `title` | `string` | ✅ | Campaign title |
| `copy_text` | `string \| null` | ❌ | Marketing copy |
| `image_urls` | `string[] \| null` | ❌ | Campaign images |
| `featured_items` | `CampaignFeaturedItem[]` | ✅ | Featured product listings |
| `team_slug` | `string \| null` | ❌ | Attributing team |
| `created_at` | `integer` | ✅ | Unix timestamp |

**Response `404`** — `ErrorResponse` — Campaign not found.

---

### Teams

#### `GET /teams`

List all registered hackathon teams.

**Tags:** `teams`

**Response `200`** — Array of `TeamSummary`

```json
[
  {
    "slug": "team-alpha",
    "name": "Team Alpha",
    "merchant_id": "abc123",
    "created_at": 1716400000
  }
]
```

| Field | Type | Required | Description |
|---|---|---|---|
| `slug` | `string` | ✅ | Team URL slug |
| `name` | `string` | ✅ | Team display name |
| `merchant_id` | `string \| null` | ❌ | Merchant they are building for |
| `created_at` | `integer` | ✅ | Unix timestamp |

---

#### `POST /teams`

Register a new hackathon team.

**Tags:** `teams`

**Request Body** — `application/json` — `TeamCreateRequest`

```json
{
  "slug": "team-alpha",
  "name": "Team Alpha",
  "merchant_id": "abc123",
  "contact": "team@example.com"
}
```

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `slug` | `string` | ✅ | Pattern: `^[a-z0-9-]{2,40}$` | 2–40 chars of lowercase letters, digits, or hyphens |
| `name` | `string` | ✅ | Min: 1, Max: 80 chars | Team display name |
| `merchant_id` | `string` | ✅ | Must match a slug from `GET /merchants` | The merchant this team is building for |
| `contact` | `string \| null` | ❌ | Max: 200 chars | Team contact info |

**Response `201`** — `TeamCreateResponse`

```json
{
  "slug": "team-alpha"
}
```

**Response `409`** — `ErrorResponse` — A team with this slug already exists.  
**Response `404`** — `ErrorResponse` — Merchant not found.  
**Response `422`** — `ErrorResponse` — Slug pattern invalid or other validation failure.

---

#### `GET /teams/{slug}`

Get full details for a team including all their baskets and campaigns.

**Tags:** `teams`

**Path Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `slug` | `string` | ✅ | Team slug |

**Response `200`** — `TeamDetail`

```json
{
  "slug": "team-alpha",
  "name": "Team Alpha",
  "merchant": {
    "id": "abc123",
    "name": "Mama's Kitchen",
    "whatsapp_number": "+2348012345678"
  },
  "contact": "team@example.com",
  "registered": true,
  "baskets": [
    {
      "id": "basket_abc",
      "merchant_id": "abc123",
      "total_minor": 300000,
      "currency": "NGN",
      "created_at": 1716400000
    }
  ],
  "campaigns": [
    {
      "id": "camp_001",
      "merchant_id": "abc123",
      "title": "Weekend Special",
      "created_at": 1716400000
    }
  ],
  "created_at": 1716400000
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `slug` | `string` | ✅ | Team slug |
| `name` | `string \| null` | ❌ | Team name |
| `merchant` | `BasketMerchant \| null` | ❌ | Associated merchant |
| `contact` | `string \| null` | ❌ | Team contact info |
| `registered` | `boolean` | ✅ | Whether the team is officially registered |
| `baskets` | `TeamBasketRef[]` | ✅ | All baskets created by this team |
| `campaigns` | `TeamCampaignRef[]` | ✅ | All campaigns created by this team |
| `created_at` | `integer \| null` | ❌ | Unix timestamp |

---

### Uploads

#### `POST /uploads`

Upload a file (image) to the platform CDN.

**Tags:** `uploads`

**Request Body** — `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | `binary` | ✅ | The file to upload |

**Response `201`** — `UploadResponse`

```json
{
  "url": "https://cdn.example.com/uploads/image.png"
}
```

**Response `413`** — `ErrorResponse` — File exceeds the size limit.  
**Response `422`** — `ErrorResponse` — Invalid file or validation failure.

---

#### `POST /uploads/rehost`

Fetch an image from an external URL and rehost it on the platform's CDN.

**Tags:** `uploads`

**Request Body** — `application/json` — `RehostRequest`

```json
{
  "source_url": "https://external.example.com/image.png"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `source_url` | `string` | ✅ | Publicly accessible URL of the image to rehost |

**Response `201`** — `UploadResponse`

```json
{
  "url": "https://cdn.example.com/uploads/rehosted_image.png"
}
```

**Response `413`** — `ErrorResponse` — Remote image exceeds size limit.  
**Response `422`** — `ErrorResponse` — Invalid URL or fetch failure.

---

## Data Schemas

### `MerchantListItem`
| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `string` | ✅ | |
| `name` | `string` | ✅ | |
| `description` | `string \| null` | ❌ | |
| `logo_url` | `string \| null` | ❌ | |
| `whatsapp_number` | `string \| null` | ❌ | **Fallback if `null`: `+2347072099407`** |

### `MerchantDetail`
Extends `MerchantListItem` with:
| Field | Type | Required |
|---|---|---|
| `brand_colors` | `string[] \| null` | ❌ |

### `ItemResponse`
| Field | Type | Required |
|---|---|---|
| `id` | `string` | ✅ |
| `merchant_id` | `string` | ✅ |
| `name` | `string` | ✅ |
| `description` | `string \| null` | ❌ |
| `price_minor` | `integer` | ✅ |
| `currency` | `string` | ✅ |
| `image_urls` | `string[] \| null` | ❌ |
| `in_stock` | `boolean` | ✅ |

### `BasketCreateRequest`
| Field | Type | Required |
|---|---|---|
| `merchant_id` | `string` | ✅ |
| `items` | `BasketItemInput[]` (min 1) | ✅ |
| `customer_name` | `string \| null` | ❌ |
| `customer_phone` | `string \| null` | ❌ |
| `customer_note` | `string \| null` | ❌ |
| `team_slug` | `string \| null` | ❌ |

### `BasketItemInput`
| Field | Type | Required | Constraints |
|---|---|---|---|
| `item_id` | `string` | ✅ | — |
| `qty` | `integer` | ✅ | min: 1 |
| `item_note` | `string \| null` | ❌ | — |

### `BasketDetail`
| Field | Type | Required |
|---|---|---|
| `id` | `string` | ✅ |
| `merchant` | `BasketMerchant \| null` | ❌ |
| `items` | `BasketItem[]` | ✅ |
| `total_minor` | `integer` | ✅ |
| `currency` | `string \| null` | ❌ |
| `customer_name` | `string \| null` | ❌ |
| `customer_phone` | `string \| null` | ❌ |
| `customer_note` | `string \| null` | ❌ |
| `team_slug` | `string \| null` | ❌ |
| `created_at` | `integer` | ✅ |

### `CampaignCreateRequest`
| Field | Type | Required |
|---|---|---|
| `merchant_id` | `string` | ✅ |
| `title` | `string` | ✅ |
| `copy_text` | `string \| null` | ❌ |
| `image_urls` | `string[] \| null` | ❌ |
| `featured_item_ids` | `string[] \| null` | ❌ |
| `team_slug` | `string \| null` | ❌ |

### `CampaignDetail`
| Field | Type | Required |
|---|---|---|
| `id` | `string` | ✅ |
| `merchant` | `BasketMerchant \| null` | ❌ |
| `title` | `string` | ✅ |
| `copy_text` | `string \| null` | ❌ |
| `image_urls` | `string[] \| null` | ❌ |
| `featured_items` | `CampaignFeaturedItem[]` | ✅ |
| `team_slug` | `string \| null` | ❌ |
| `created_at` | `integer` | ✅ |

### `TeamCreateRequest`
| Field | Type | Required | Constraints |
|---|---|---|---|
| `slug` | `string` | ✅ | Pattern: `^[a-z0-9-]{2,40}$` |
| `name` | `string` | ✅ | 1–80 chars |
| `merchant_id` | `string` | ✅ | Must match a valid merchant slug |
| `contact` | `string \| null` | ❌ | Max 200 chars |

### `TeamDetail`
| Field | Type | Required |
|---|---|---|
| `slug` | `string` | ✅ |
| `name` | `string \| null` | ❌ |
| `merchant` | `BasketMerchant \| null` | ❌ |
| `contact` | `string \| null` | ❌ |
| `registered` | `boolean` | ✅ |
| `baskets` | `TeamBasketRef[]` | ✅ |
| `campaigns` | `TeamCampaignRef[]` | ✅ |
| `created_at` | `integer \| null` | ❌ |

### `ErrorResponse`
| Field | Type | Required |
|---|---|---|
| `error` | `string` | ✅ |
| `message` | `string` | ✅ |

### `UploadResponse`
| Field | Type | Required |
|---|---|---|
| `url` | `string` | ✅ |

---

## Notes on Pricing

All prices and totals are expressed in **minor currency units** (the smallest denomination of the currency):

- For **NGN** (Nigerian Naira): values are in **kobo** (1 NGN = 100 kobo)
- For **USD**: values are in **cents** (1 USD = 100 cents)

**Example:** `price_minor: 150000` in NGN = **₦1,500.00**

To display a human-readable price:

```ts
function formatPrice(minor: number, currency: string): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
  }).format(minor / 100);
}
// formatPrice(150000, 'NGN') → "₦1,500.00"
```

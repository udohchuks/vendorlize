'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp, CartItem } from '@/context/AppContext';
import { formatPrice, createBasket, buildWhatsAppLink } from '@/lib/api';
import { CartItemRow } from '@/components/CartItemRow';
import { Toast } from '@/components/Toast';

export default function CartPage() {
  const { cart, userProfile, clearCart, merchants } = useApp();

  // States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [checkoutSteps, setCheckoutSteps] = useState<Array<{ merchantId: string; merchantName: string; basketId: string; whatsappUrl: string; completed: boolean }>>([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);

  const handleShowToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
  };

  const getMerchantName = (merchantId: string) => {
    const merchant = merchants.find((m) => m.id === merchantId);
    return merchant ? merchant.name : 'Tailor';
  };

  // Group cart items by merchant
  const groupedCart: Record<string, CartItem[]> = cart.reduce((groups, item) => {
    const key = item.merchantId;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {} as Record<string, CartItem[]>);

  const merchantIds = Object.keys(groupedCart);

  // WhatsApp checkout flow builder
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    setCheckoutSteps([]);

    const steps = [];

    try {
      // Loop through each merchant's items and create a basket
      for (const mId of merchantIds) {
        const merchantName = getMerchantName(mId);
        const mItems = groupedCart[mId];
        
        // Find merchant detail to fetch WhatsApp number
        const merchantInfo = merchants.find((m) => m.id === mId);
        const whatsappNum = merchantInfo?.whatsapp_number || '233599835025';

        // Prepare measurements note to attach to the basket
        const measurementsNote = userProfile
          ? `Fitting profile: Gender: ${userProfile.gender}, Shape: ${userProfile.bodyType}, Measurements: Chest: ${userProfile.measurements.chest}", Waist: ${userProfile.measurements.waist}", Hips: ${userProfile.measurements.hips}", Height: ${userProfile.measurements.height}", Inseam: ${userProfile.measurements.inseam}"`
          : 'No fitting profile attached.';

        // API Request Body
        const basketRequest = {
          merchant_id: mId,
          items: mItems.map((item) => ({
            item_id: item.itemId,
            qty: item.qty,
            item_note: `Size: ${item.size}`, // size goes here
          })),
          customer_name: userProfile?.name || 'Customer',
          customer_phone: '',
          customer_note: measurementsNote,
        };

        // Call API
        const response = await createBasket(basketRequest);

        if (!response.data || response.error) {
          throw new Error(response.error || `Failed to create basket for ${merchantName}`);
        }

        const basketId = response.data.id;

        // Build detailed custom order summary text for WhatsApp
        let textMessage = `Hello ${merchantName}! I am placing a new custom-tailored order via Clothify (powered by Phasion Sense).\n\n`;
        textMessage += `Basket ID: *${basketId}*\n`;
        textMessage += `Customer Name: *${userProfile?.name || 'Customer'}*\n\n`;
        textMessage += `*Items Ordered*:\n`;
        
        mItems.forEach((item) => {
          textMessage += `- ${item.name} (Size: *${item.size}*) x${item.qty} - ${formatPrice(item.priceMinor, item.currency)}\n`;
        });

        if (userProfile) {
          textMessage += `\n*Tailored Profile Measurements (AI-Fitted)*:\n`;
          textMessage += `- Silhouette: *${userProfile.bodyType}*\n`;
          textMessage += `- Chest/Bust: *${userProfile.measurements.chest} inches*\n`;
          textMessage += `- Waist: *${userProfile.measurements.waist} inches*\n`;
          textMessage += `- Hips: *${userProfile.measurements.hips} inches*\n`;
          textMessage += `- Height: *${userProfile.measurements.height} inches*\n`;
          textMessage += `- Inseam: *${userProfile.measurements.inseam} inches*\n`;
        }

        textMessage += `\nPlease confirm custom order receipt and discuss payments. Thank you!`;

        const whatsappUrl = buildWhatsAppLink(whatsappNum, textMessage);

        steps.push({
          merchantId: mId,
          merchantName,
          basketId,
          whatsappUrl,
          completed: false,
        });
      }

      setCheckoutSteps(steps);

      if (steps.length === 1) {
        // If single merchant, directly open link
        window.open(steps[0].whatsappUrl, '_blank');
        handleShowToast('WhatsApp Order Dispatch Launched!', 'success');
        clearCart();
      } else {
        // If multiple merchants, open custom split modal
        setShowCheckoutModal(true);
      }

    } catch (err: any) {
      handleShowToast(err.message || 'Basket registration failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteStep = (index: number, url: string) => {
    window.open(url, '_blank');
    const newSteps = [...checkoutSteps];
    newSteps[index].completed = true;
    setCheckoutSteps(newSteps);

    const allDone = newSteps.every((s) => s.completed);
    if (allDone) {
      handleShowToast('All merchant orders sent successfully!', 'success');
      setShowCheckoutModal(false);
      clearCart();
    }
  };

  // Compute total cart value (aggregates pesewas)
  const cartSubtotal = cart.reduce((sum, item) => sum + item.priceMinor * item.qty, 0);
  const cartCurrency = cart.length > 0 ? cart[0].currency : 'GHS';

  return (
    <div className="flex-1 bg-[#111111] min-h-screen flex flex-col px-6 py-6 space-y-6 animate-fade-in pb-28">
      {/* Page Header */}
      <div className="space-y-1">
        <span className="text-[10px] font-extrabold tracking-[0.25em] text-[#C9B99A] uppercase">AI Shopping Cart</span>
        <h1 className="text-xl font-bold tracking-tight text-[#FAF0E6] uppercase">Your Basket</h1>
      </div>

      {cart.length > 0 ? (
        <div className="flex-1 flex flex-col justify-between space-y-6">
          {/* Scrollable list of items */}
          <div className="flex-1 overflow-y-auto max-h-[50vh] pr-1 no-scrollbar divide-y divide-[#1F1C1A]">
            {cart.map((item) => (
              <CartItemRow
                key={`${item.itemId}-${item.size}`}
                item={item}
                onShowToast={handleShowToast}
              />
            ))}
          </div>

          {/* Checkout Totals Summary Card */}
          <div className="bg-[#0A0A0A] border border-[#1F1C1A] rounded-2xl p-5 space-y-4">
            <span className="text-[9px] font-extrabold tracking-wider text-[#C9B99A] uppercase">ORDER SUMMARY</span>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-[#C9B99A]">
                <span>Fitting Subtotal</span>
                <span className="font-bold text-[#FAF0E6]">
                  {formatPrice(cartSubtotal, cartCurrency)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#C9B99A]">
                <span>Custom Sizing Fitting</span>
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#D4A853] to-[#C9B99A] uppercase text-[9px] font-bold">
                  Included (AI Fit)
                </span>
              </div>
              <div className="flex justify-between items-center text-[#C9B99A]">
                <span>Tailored Assembly & Shipping</span>
                <span className="font-semibold text-[#FAF0E6]">Flexible</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1F1C1A] flex justify-between items-center">
              <span className="text-sm font-bold text-[#FAF0E6]">Grand Total</span>
              <span className="text-base font-black text-[#D4A853] tracking-wider">
                {formatPrice(cartSubtotal, cartCurrency)}
              </span>
            </div>

            {/* AI Fit verification warning */}
            {!userProfile && (
              <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-center">
                <p className="text-[10px] text-red-400 font-semibold leading-relaxed">
                  ⚠️ Sizing is set to default 'M'. Set up your AI Fit profile to ensure bespoke accuracy.
                </p>
              </div>
            )}

            {/* Primary Checkout CTA */}
            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className={`w-full py-4 bg-gradient-to-r from-[#D4A853] to-[#C9B99A] hover:from-[#C29642] hover:to-[#B5A586] text-[#0A0A0A] font-black text-xs rounded-xl tracking-wider uppercase shadow-[0_4px_16px_rgba(212,168,83,0.2)] hover:shadow-[0_4px_24px_rgba(212,168,83,0.35)] transition-all duration-300 flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
                  Generating Basket...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.787-1.451L0 24zm6.59-4.846c1.66.986 3.298 1.488 4.966 1.493 5.485.002 9.948-4.46 9.95-9.95.002-2.66-1.033-5.161-2.91-7.04C16.78 1.776 14.28 1.74 11.62 1.74c-5.488 0-9.954 4.464-9.957 9.954-.001 1.832.493 3.626 1.429 5.219l-.934 3.41 3.498-.918z" />
                  </svg>
                  Checkout via WhatsApp
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-5 animate-fade-in">
          <div className="w-20 h-20 rounded-full border border-[#1F1C1A] bg-[#0A0A0A] flex items-center justify-center text-[#C9B99A]/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
          
          <div className="space-y-1.5 max-w-[280px]">
            <h3 className="text-sm font-bold text-[#FAF0E6]">Your basket is empty</h3>
            <p className="text-[11px] text-[#C9B99A]/75 leading-relaxed font-semibold">
              Fill your fitting room cart with tailored apparel from custom modern tailors.
            </p>
          </div>

          <Link
            href="/"
            className="px-6 py-3.5 bg-gradient-to-r from-[#D4A853] to-[#C9B99A] text-[#0A0A0A] font-black text-xs rounded-xl tracking-wider uppercase hover:shadow-[0_0_15px_rgba(212,168,83,0.3)] transition-all duration-300"
          >
            Explore Showcase
          </Link>
        </div>
      )}

      {/* Multi-Merchant Split Checkout Modal */}
      {showCheckoutModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-[380px] bg-[#111111] border border-[#1F1C1A] rounded-3xl p-6 space-y-6 shadow-2xl animate-slide-up">
            <div className="space-y-1.5">
              <span className="text-[9px] font-extrabold tracking-wider text-[#D4A853] uppercase">SPLIT CHECKOUT REQUIRED</span>
              <h3 className="text-base font-extrabold text-[#FAF0E6] uppercase">Multi-Designer Order</h3>
              <p className="text-[11px] text-[#C9B99A]/75 leading-relaxed font-semibold">
                Your basket contains custom wear from separate designers. Please send the pre-compiled tailored summaries to each designer sequentially:
              </p>
            </div>

            <div className="space-y-3">
              {checkoutSteps.map((step, index) => (
                <div
                  key={step.merchantId}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300 ${
                    step.completed
                      ? 'border-[#25D366]/30 bg-[#25D366]/5 opacity-60'
                      : 'border-[#1F1C1A] bg-[#0A0A0A]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-extrabold tracking-wider text-[#C9B99A] uppercase">DESIGNER</span>
                    <h4 className="text-xs font-bold text-[#FAF0E6]">{step.merchantName}</h4>
                  </div>
                  
                  {step.completed ? (
                    <div className="text-[#25D366] flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      Dispatched
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCompleteStep(index, step.whatsappUrl)}
                      className="bg-[#25D366] hover:bg-[#20BA56] text-[#FAF0E6] font-bold text-[9px] tracking-wider px-3.5 py-2 rounded-lg uppercase flex items-center gap-1.5 transition-all shadow-[0_4px_8px_rgba(37,211,102,0.15)]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-3 h-3 text-[#FAF0E6]">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.787-1.451L0 24zm6.59-4.846c1.66.986 3.298 1.488 4.966 1.493 5.485.002 9.948-4.46 9.95-9.95.002-2.66-1.033-5.161-2.91-7.04C16.78 1.776 14.28 1.74 11.62 1.74c-5.488 0-9.954 4.464-9.957 9.954-.001 1.832.493 3.626 1.429 5.219l-.934 3.41 3.498-.918z" />
                      </svg>
                      Dispatch Order
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowCheckoutModal(false)}
              className="w-full py-3 bg-[#0A0A0A] border border-[#1F1C1A] hover:border-red-500/30 text-[#C9B99A] hover:text-red-500 font-bold text-xs rounded-xl uppercase transition-colors"
            >
              Cancel Checkout
            </button>
          </div>
        </div>
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

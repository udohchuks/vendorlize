'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { formatPrice, getAllItems, getAllCampaigns, Item, Campaign } from '@/lib/api';

export default function AdminDashboardPage() {
  const { merchants } = useApp();
  const [items, setItems] = useState<Item[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCampaigns, setActiveCampaigns] = useState<string[]>([]);

  // Simulation metrics
  const [simulatedOrders] = useState([
    { id: 'ORD-8932', customer: 'Kofi Mensah', item: 'Classic Kaftan', size: 'L', status: 'Pending Fitting', date: '2 mins ago', amount: 45000 },
    { id: 'ORD-8931', customer: 'Ama Serwaa', item: 'Bespoke Evening Gown', size: 'M', status: 'In Production', date: '1 hour ago', amount: 120000 },
    { id: 'ORD-8930', customer: 'Yaw Boateng', item: 'Signature Slim Suit', size: 'XL', status: 'Shipped', date: '4 hours ago', amount: 85000 },
    { id: 'ORD-8929', customer: 'Esi Osei', item: 'Kente Summer Dress', size: 'S', status: 'Delivered', date: 'Yesterday', amount: 65000 }
  ]);

  useEffect(() => {
    async function loadAdminData() {
      setIsLoading(true);
      const [itemsRes, campaignsRes] = await Promise.all([
        getAllItems(),
        getAllCampaigns()
      ]);
      if (itemsRes.data) setItems(itemsRes.data);
      if (campaignsRes.data) {
        setCampaigns(campaignsRes.data);
        setActiveCampaigns(campaignsRes.data.map(c => c.id));
      }
      setIsLoading(false);
    }
    loadAdminData();
  }, []);

  const toggleCampaign = (id: string) => {
    if (activeCampaigns.includes(id)) {
      setActiveCampaigns(prev => prev.filter(cId => cId !== id));
    } else {
      setActiveCampaigns(prev => [...prev, id]);
    }
  };

  return (
    <div className="flex-1 bg-[#111111] min-h-screen flex flex-col px-6 py-8 space-y-8 animate-fade-in pb-28 text-left">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1F1C1A] pb-5">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold tracking-[0.25em] text-[#D4A853] uppercase">Atelier Control Panel</span>
          <h1 className="text-2xl font-black tracking-tight text-[#FAF0E6] uppercase">
            Admin Dashboard
          </h1>
        </div>
        <div className="flex gap-2">
          <span className="bg-[#25D366]/10 text-[#25D366] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-[#25D366]/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-ping" />
            Live Cloud Sync
          </span>
        </div>
      </div>

      {/* KPI Stats overview row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales */}
        <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-[#1F1C1A] space-y-1 hover:border-[#D4A853]/30 transition-all duration-300">
          <span className="text-[8px] font-extrabold tracking-wider text-[#C9B99A]/50 uppercase">Total Sales Value</span>
          <h2 className="text-lg md:text-xl font-black text-[#D4A853]">GHS 31,500.00</h2>
          <span className="block text-[8px] text-[#25D366] font-bold uppercase tracking-wider">+14% vs Last Month</span>
        </div>

        {/* Live Catalog */}
        <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-[#1F1C1A] space-y-1 hover:border-[#D4A853]/30 transition-all duration-300">
          <span className="text-[8px] font-extrabold tracking-wider text-[#C9B99A]/50 uppercase">Live Catalog items</span>
          <h2 className="text-lg md:text-xl font-black text-[#FAF0E6]">
            {isLoading ? '--' : items.length} Garments
          </h2>
          <span className="block text-[8px] text-[#D4A853] font-bold uppercase tracking-wider">Sync with API active</span>
        </div>

        {/* Active Promos */}
        <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-[#1F1C1A] space-y-1 hover:border-[#D4A853]/30 transition-all duration-300">
          <span className="text-[8px] font-extrabold tracking-wider text-[#C9B99A]/50 uppercase">Active Campaigns</span>
          <h2 className="text-lg md:text-xl font-black text-[#FAF0E6]">
            {activeCampaigns.length} Active
          </h2>
          <span className="block text-[8px] text-[#C9B99A] font-bold uppercase tracking-wider">Total of {campaigns.length} campaigns</span>
        </div>

        {/* Pending Orders */}
        <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-[#1F1C1A] space-y-1 hover:border-[#D4A853]/30 transition-all duration-300">
          <span className="text-[8px] font-extrabold tracking-wider text-[#C9B99A]/50 uppercase">Bespoke Orders</span>
          <h2 className="text-lg md:text-xl font-black text-[#D4A853]">4 In-Queue</h2>
          <span className="block text-[8px] text-[#C9B99A] font-bold uppercase tracking-wider">Requires measurement check</span>
        </div>
      </div>

      {/* Orders and Campaigns Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent custom Orders table */}
        <div className="lg:col-span-8 bg-[#0A0A0A] border border-[#1F1C1A] rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#1F1C1A]">
            <span className="text-[10px] font-extrabold tracking-wider text-[#C9B99A] uppercase">Active Tailoring Orders</span>
            <span className="text-[9px] text-[#D4A853] font-bold uppercase tracking-wider cursor-pointer hover:underline">View All</span>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs text-[#FAF0E6]/90 border-collapse">
              <thead>
                <tr className="border-b border-[#1F1C1A] text-[9px] font-extrabold tracking-wider text-[#C9B99A]/60 uppercase">
                  <th className="pb-3 pr-2">ID</th>
                  <th className="pb-3 px-2">Customer</th>
                  <th className="pb-3 px-2">Garment</th>
                  <th className="pb-3 px-2 text-center">Size</th>
                  <th className="pb-3 px-2 text-right">Amount</th>
                  <th className="pb-3 pl-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1C1A]/40 font-medium">
                {simulatedOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 pr-2 font-bold text-[#D4A853]">{ord.id}</td>
                    <td className="py-3.5 px-2">{ord.customer}</td>
                    <td className="py-3.5 px-2 text-[#C9B99A] font-semibold">{ord.item}</td>
                    <td className="py-3.5 px-2 text-center font-bold text-[#FAF0E6]">{ord.size}</td>
                    <td className="py-3.5 px-2 text-right font-bold text-[#FAF0E6]">{formatPrice(ord.amount, 'GHS')}</td>
                    <td className="py-3.5 pl-2 text-right">
                      <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        ord.status === 'Delivered' ? 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20' :
                        ord.status === 'Shipped' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        ord.status === 'In Production' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        'bg-[#D4A853]/10 text-[#D4A853] border border-[#D4A853]/20 animate-pulse'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Promotions and campaigns control toggle panel */}
        <div className="lg:col-span-4 bg-[#0A0A0A] border border-[#1F1C1A] rounded-2xl p-6 space-y-4">
          <div className="pb-2 border-b border-[#1F1C1A]">
            <span className="text-[10px] font-extrabold tracking-wider text-[#C9B99A] uppercase">Active Collections Toggle</span>
          </div>

          <div className="space-y-3.5">
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-12 rounded-xl bg-[#1F1C1A] animate-shimmer" />
                <div className="h-12 rounded-xl bg-[#1F1C1A] animate-shimmer" />
              </div>
            ) : campaigns.length > 0 ? (
              campaigns.map((camp) => {
                const isActive = activeCampaigns.includes(camp.id);
                return (
                  <div key={camp.id} className="p-3.5 rounded-xl border border-[#1F1C1A] bg-[#111111]/40 flex items-center justify-between gap-4">
                    <div className="space-y-0.5 max-w-[70%]">
                      <h4 className="text-xs font-bold text-[#FAF0E6] truncate uppercase">{camp.title}</h4>
                      <span className="block text-[8px] font-extrabold tracking-wider text-[#C9B99A]/50 uppercase">Active Collection Promo</span>
                    </div>
                    
                    <button
                      onClick={() => toggleCampaign(camp.id)}
                      className={`relative w-9 h-5 rounded-full transition-colors duration-300 focus:outline-none ${
                        isActive ? 'bg-[#D4A853]' : 'bg-[#1F1C1A]'
                      }`}
                    >
                      <span className={`absolute top-0.5 left-0.5 bg-[#0A0A0A] w-4 h-4 rounded-full transition-transform duration-300 ${
                        isActive ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[#C9B99A]/50">No campaigns found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

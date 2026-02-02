'use client';

import React, { useState } from 'react';
import { usePlayer } from '../../providers/PlayerProvider';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';

export default function ProfileDeposit() {
  const { player } = usePlayer();
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState('deposit');

  if (!player) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-[#71717A]">
        Please login to manage funds.
      </div>
    );
  }

  const handleAction = (e) => {
    e.preventDefault();
    alert(`${activeTab === 'deposit' ? 'Deposit' : 'Withdrawal'} of $${amount} simulated!`);
    setAmount('');
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white px-4 sm:px-6 lg:px-8 py-6 lg:py-8 w-full">
         <div className="max-w-4xl mx-auto pt-20 md:pt-6">
        <h1 className="text-3xl font-bold mb-8">Wallet & Funds</h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Balance Card - Left */}
          <div className="md:col-span-12 lg:col-span-4 space-y-4">
             <div className="bg-gradient-to-br from-[#FF5D2E] to-[#FF8C5D] rounded-2xl p-6 text-white shadow-lg shadow-[#FF5D2E]/20">
                <div className="text-white/80 text-sm font-bold uppercase tracking-wider mb-2">Total Balance</div>
                <div className="text-4xl font-mono font-bold mb-6">${player.balance?.toFixed(2) || '0.00'}</div>
                
                <div className="flex justify-between items-center text-sm bg-black/10 rounded-lg p-3">
                   <div className="flex items-center gap-2">
                     <Wallet size={16} />
                     <span>Tokens</span>
                   </div>
                   <span className="font-mono font-bold">{player.tokens?.toLocaleString() || 0}</span>
                </div>
             </div>
          </div>

          {/* Action Area - Right */}
          <div className="md:col-span-12 lg:col-span-8">
            <div className="bg-[#121215] border border-[#27272A] rounded-2xl overflow-hidden">
               {/* Tabs */}
               <div className="flex border-b border-[#27272A]">
                 <button 
                    onClick={() => setActiveTab('deposit')}
                    className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'deposit' ? 'bg-[#FF5D2E]/10 text-[#FF5D2E]' : 'text-[#71717A] hover:text-white'}`}
                 >
                    <ArrowDownLeft size={16} /> Deposit
                 </button>
                 <div className="w-px bg-[#27272A]"></div>
                 <button 
                    onClick={() => setActiveTab('withdraw')}
                    className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'withdraw' ? 'bg-[#FF5D2E]/10 text-[#FF5D2E]' : 'text-[#71717A] hover:text-white'}`}
                 >
                    <ArrowUpRight size={16} /> Withdraw
                 </button>
               </div>

               {/* Form */}
               <div className="p-6 md:p-8">
                  <form onSubmit={handleAction} className="space-y-6">
                     <div>
                        <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">Amount (USD)</label>
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A] font-bold">$</span>
                           <input 
                              type="number"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="0.00"
                              min="1"
                              step="0.01"
                              className="w-full bg-[#18181B] border border-[#27272A] rounded-xl pl-8 pr-4 py-4 text-xl font-mono font-bold focus:outline-none focus:border-[#FF5D2E]"
                              required
                           />
                        </div>
                     </div>

                     <div className="p-4 bg-[#18181B] rounded-xl border border-[#27272A] flex items-center gap-3">
                        <CreditCard className="text-[#A1A1AA]" />
                        <div className="flex-1">
                           <div className="text-sm font-bold text-white">Payment Method</div>
                           <div className="text-xs text-[#71717A]">Credit Card / Crypto</div>
                        </div>
                        <button type="button" className="text-xs font-bold text-[#FF5D2E] hover:underline">Change</button>
                     </div>

                     <button 
                        type="submit"
                        className="w-full py-4 bg-[#FF5D2E] hover:bg-[#FF8C5D] text-black font-bold rounded-xl transition-colors text-lg"
                     >
                        {activeTab === 'deposit' ? 'Add Funds' : 'Withdraw Funds'}
                     </button>
                  </form>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

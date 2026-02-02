'use client';

import React from 'react';
import { usePlayer } from '../../providers/PlayerProvider';
import { Wallet, History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function ProfileWallet() {
  const { player } = usePlayer();

  if (!player) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-[#71717A]">
        Please login to view your wallet.
      </div>
    );
  }

  // Dummy transaction data for UI
  const transactions = [
    { id: 1, type: 'deposit', amount: 50.00, date: '2025-12-28', status: 'Completed' },
    { id: 2, type: 'game_reward', amount: 5.00, date: '2025-12-27', status: 'Completed' },
    { id: 3, type: 'game_fee', amount: -1.00, date: '2025-12-27', status: 'Completed' },
    { id: 4, type: 'withdraw', amount: -20.00, date: '2025-12-20', status: 'Pending' },
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-white px-4 sm:px-6 lg:px-8 py-6 lg:py-8 w-full">
         <div className="max-w-4xl mx-auto pt-20 md:pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#FF5D2E]">
                <Wallet size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-bold">My Wallet</h1>
                <p className="text-[#A1A1AA] text-sm font-mono break-all">{player.walletAddress || 'No connected wallet'}</p>
            </div>
        </div>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-6">
                <div className="text-sm text-[#71717A] font-bold uppercase tracking-wider mb-2">Fiat Balance</div>
                <div className="text-3xl font-mono font-bold text-white">${player.balance?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-6">
                <div className="text-sm text-[#71717A] font-bold uppercase tracking-wider mb-2">Token Balance</div>
                <div className="text-3xl font-mono font-bold text-[#FF5D2E]">{player.tokens?.toLocaleString() || 0}</div>
            </div>
        </div>

        {/* Transaction History */}
        <div className="bg-[#121215] border border-[#27272A] rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-[#27272A] flex items-center gap-2">
                <History size={16} className="text-[#FF5D2E]" />
                <h2 className="font-bold">Transaction History</h2>
            </div>
            
            <div className="divide-y divide-[#18181B]">
                {transactions.map(tx => (
                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-[#18181B] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                tx.type === 'deposit' || tx.type === 'game_reward' 
                                ? 'bg-[#10B981]/10 text-[#10B981]' 
                                : 'bg-[#EF4444]/10 text-[#EF4444]'
                            }`}>
                                {(tx.type === 'deposit' || tx.type === 'game_reward') ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                            </div>
                            <div>
                                <div className="font-bold text-sm capitalize">{tx.type.replace('_', ' ')}</div>
                                <div className="text-xs text-[#71717A]">{new Date(tx.date).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`font-mono font-bold ${tx.amount > 0 ? 'text-[#10B981]' : 'text-white'}`}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                            </div>
                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                                tx.status === 'Completed' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                            }`}>
                                {tx.status}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 text-center border-t border-[#27272A]">
                <button className="text-xs font-bold text-[#A1A1AA] hover:text-white transition-colors">View All Transactions</button>
            </div>
        </div>
      </div>
    </div>
  );
}

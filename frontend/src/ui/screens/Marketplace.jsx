import React, { useState } from 'react';
import { ShoppingBag, Lock, Check, Zap, Crown, TrendingUp, Search, Filter } from 'lucide-react';
import { usePlayer } from '../../state/PlayerContext';

export const MarketplaceScreen = () => {
  const { player } = usePlayer();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'skins', name: 'Skins' },
    { id: 'powerups', name: 'Power-Ups' },
    { id: 'premium', name: 'Premium' },
  ];

  const items = [
    {
      id: 1,
      name: 'Golden Snake Skin',
      description: 'A luxurious golden finish for your reptile companion. Shines in dark environments.',
      price: 500,
      currency: 'stch',
      rarity: 'Common',
      category: 'skins',
      image: '🐍',
      owned: false,
    },
    {
      id: 2,
      name: 'Speed Boost',
      description: 'Temporarily increases movement speed by 50% for 5 minutes.',
      price: 100,
      currency: 'stch',
      rarity: 'Consumable',
      category: 'powerups',
      image: '⚡',
      owned: false,
    },
    {
      id: 3,
      name: 'Premium Pass',
      description: 'Unlocks exclusive content, daily rewards, and special events for 30 days.',
      price: 10,
      currency: 'USDC',
      rarity: 'Legendary',
      category: 'premium',
      image: '👑',
      owned: true,
    },
    {
      id: 4,
      name: 'Neon Trail',
      description: 'Leave a glowing neon trail behind your avatar.',
      price: 250,
      currency: 'stch',
      rarity: 'Rare',
      category: 'skins',
      image: '💫',
      owned: false,
    },
    {
      id: 5,
      name: 'Shield Generator',
      description: 'Grants invulnerability for 10 seconds at the start of a match.',
      price: 150,
      currency: 'stch',
      rarity: 'Epic',
      category: 'powerups',
      image: '🛡️',
      owned: false,
    },
    {
      id: 6,
      name: 'Cyberpunk Avatar',
      description: 'A futuristic avatar frame and profile customization.',
      price: 5,
      currency: 'USDC',
      rarity: 'Rare',
      category: 'premium',
      image: '🤖',
      owned: false,
    },
  ];

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category === selectedCategory);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Legendary': return '#FFCE31'; // Gold
      case 'Epic': return '#A855F7'; // Purple
      case 'Rare': return '#3B82F6'; // Blue
      default: return '#71717A'; // Gray
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-8 overflow-y-auto font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <div>
          <div className="flex items-center gap-2 text-[#FF5D2E] text-sm font-bold mb-2">
            <ShoppingBag size={16} /> / Store
          </div>
          <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
          <p className="text-[#A1A1AA]">Upgrade your experience with exclusive items.</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-[#121215] border border-[#27272A] px-4 py-2 rounded-xl">
            <Search size={18} className="text-[#71717A]" />
            <input
              type="text"
              placeholder="Search items..."
              className="bg-transparent border-none outline-none text-sm w-48 placeholder-[#52525B]"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] font-bold text-[#A1A1AA] uppercase">Balance</div>
              <div className="text-xl font-bold font-mono">{(player?.balance || 5000).toLocaleString()} <span className="text-[#FF5D2E] text-sm">STCH</span></div>
            </div>
            <div className="text-right border-l border-[#27272A] pl-4">
              <div className="text-[10px] font-bold text-[#A1A1AA] uppercase">Wallet</div>
              <div className="text-xl font-bold font-mono">{(player?.stch || 10).toFixed(2)} <span className="text-white text-sm">USDC</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto flex gap-4 mb-10 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedCategory === cat.id
                ? 'bg-white text-black border-white'
                : 'bg-[#121215] text-[#71717A] border-[#27272A] hover:border-[#52525B]'
              }`}
          >
            {selectedCategory === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredItems.map(item => (
          <div key={item.id} className="group bg-[#121215] border border-[#27272A] rounded-2xl p-6 relative hover:border-[#3F3F46] transition-all">
            {/* Rarity Badge */}
            <div className="absolute top-6 right-6 px-2 py-1 rounded bg-[#18181B] border border-[#27272A] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: getRarityColor(item.rarity) }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getRarityColor(item.rarity) }}></div>
              {item.rarity}
            </div>

            {/* Image Placeholder */}
            <div className="w-full h-40 bg-[#18181B] rounded-xl mb-6 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500">
              {item.image}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">{item.name}</h3>
              <p className="text-[#71717A] text-xs leading-relaxed h-10 line-clamp-2">{item.description}</p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-[#27272A]">
              <div className="font-mono font-bold text-lg">
                {item.price} <span className={`text-xs ${item.currency === 'USDC' ? 'text-white' : 'text-[#FF5D2E]'}`}>{item.currency}</span>
              </div>

              {item.owned ? (
                <button disabled className="px-6 py-2 bg-[#27272A] text-[#71717A] font-bold text-xs rounded-lg flex items-center gap-2 cursor-default">
                  <Check size={14} /> Owned
                </button>
              ) : (
                <button className="px-6 py-2 bg-white text-black font-bold text-xs rounded-lg hover:bg-[#E4E4E7] transition-colors">
                  Purchase
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

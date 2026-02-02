'use client';
import React from 'react';
import { SKILLS } from '../../../lib/constants';

const SkillSelectorModal = ({ slotIndex, selectedSkills, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/95 z-[99999] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-2 border-cyan-500 rounded-2xl p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
        <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Select Skill {slotIndex + 1}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {SKILLS.map(skill => {
            const isSelected = selectedSkills.includes(skill.id);
            const isInThisSlot = selectedSkills[slotIndex] === skill.id;
            return (
              <div
                key={skill.id}
                onClick={() => {
                  if (isSelected && !isInThisSlot) return;
                  onSelect(skill.id);
                }}
                className={`transition-all bg-gray-900/80 border-2 rounded-xl p-5 text-center cursor-pointer ${isSelected && !isInThisSlot ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} ${isInThisSlot ? 'border-cyan-500 ring-4 ring-cyan-500/50' : 'border-gray-700'}`}
              >
                <div className="text-6xl mb-3">{skill.icon}</div>
                <div className="font-bold text-lg text-cyan-400">{skill.name}</div>
                <div className="text-xs text-gray-400 mt-1">{skill.desc}</div>
              </div>
            );
          })}
        </div>
        <button onClick={onClose} className="mt-8 w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition">
          Close
        </button>
      </div>
    </div>
  );
};

export default SkillSelectorModal;

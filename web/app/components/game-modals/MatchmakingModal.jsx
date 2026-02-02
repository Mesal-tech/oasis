'use client';
import React, { useState } from 'react';

const MatchmakingModal = ({ onConfirm, onCancel }) => {
  const [view, setView] = useState('main'); // 'main', 'create', 'join'
  const [roomCode, setRoomCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCode(code);
    setView('create');
  };

  const handleQuickMatch = () => {
    onConfirm({ joinType: 'quickmatch', roomCode: null });
  };

  const handleCreateRoom = () => {
    onConfirm({ joinType: 'private', roomCode: generatedCode });
  };

  const handleJoinRoom = () => {
    if (roomCode.length === 6) {
      onConfirm({ joinType: 'private', roomCode: roomCode.toUpperCase() });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[9999]">
      <div className="bg-[#171717] border-2 border-[#333333] rounded-[25px] p-10 max-w-[500px] w-[90%]">
        {view === 'main' && (
          <>
            <h2 className="text-white mb-8 text-3xl text-center">PvP Matchmaking</h2>
            <div className="flex flex-col gap-4 mb-8">
              <button onClick={handleQuickMatch} className="w-full p-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl text-lg hover:from-cyan-400 hover:to-blue-500 transition">
                Quick Match
              </button>
              <button onClick={generateCode} className="w-full p-5 bg-[#282828] border-2 border-[#444] text-white font-bold rounded-xl text-lg hover:bg-[#333] transition">
                Create Private Room
              </button>
              <button onClick={() => setView('join')} className="w-full p-5 bg-[#282828] border-2 border-[#444] text-white font-bold rounded-xl text-lg hover:bg-[#333] transition">
                Join Private Room
              </button>
            </div>
            <button onClick={onCancel} className="w-full py-3 bg-transparent text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-800 transition">Back</button>
          </>
        )}

        {view === 'create' && (
          <>
            <h2 className="text-white mb-4 text-2xl text-center">Private Room Created</h2>
            <p className="text-gray-400 text-center mb-6">Share this code with your friend:</p>
            <div className="bg-[#282828] border-2 border-cyan-500 rounded-xl p-6 text-center mb-8">
              <span className="text-4xl font-mono font-bold text-cyan-400 tracking-widest">{generatedCode}</span>
            </div>
            <button onClick={handleCreateRoom} className="w-full p-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl text-lg hover:from-cyan-400 hover:to-blue-500 transition mb-4">
              Start Waiting
            </button>
            <button onClick={() => setView('main')} className="w-full py-3 bg-transparent text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-800 transition">Back</button>
          </>
        )}

        {view === 'join' && (
          <>
            <h2 className="text-white mb-4 text-2xl text-center">Join Private Room</h2>
            <p className="text-gray-400 text-center mb-6">Enter the 6-character room code:</p>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ABCD23"
              className="w-full p-4 bg-[#282828] border-2 border-gray-600 rounded-xl text-center text-2xl font-mono font-bold text-white tracking-widest mb-8 focus:border-cyan-500 outline-none"
              maxLength={6}
            />
            <button onClick={handleJoinRoom} disabled={roomCode.length !== 6} className={`w-full p-4 font-bold rounded-xl text-lg transition mb-4 ${roomCode.length === 6 ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}>
              Join Room
            </button>
            <button onClick={() => setView('main')} className="w-full py-3 bg-transparent text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-800 transition">Back</button>
          </>
        )}
      </div>
    </div>
  );
};

export default MatchmakingModal;

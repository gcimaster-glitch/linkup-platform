'use client';

import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';

export default function CampaignBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const { showToast } = useToast();

  if (!isVisible) return null;

  const handleClick = () => {
    showToast('キャンペーンページへ移動します');
  };

  return (
    <div 
        className="fixed bottom-6 right-6 z-40 animate-bounce cursor-pointer" 
        onClick={handleClick}
    >
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl shadow-lg flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <div>
                <p className="font-bold text-sm">新規登録キャンペーン</p>
                <p className="text-xs text-indigo-100">500ptプレゼント中！</p>
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); setIsVisible(false); }} 
                className="text-white/70 hover:text-white"
            >
                <span className="material-icons-outlined">close</span>
            </button>
        </div>
    </div>
  );
}

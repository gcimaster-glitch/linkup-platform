'use client';

import React from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login } = useStore();
  const { showToast } = useToast();

  if (!isAuthModalOpen) return null;

  const handleLogin = () => {
    login();
    showToast('ログインしました');
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeAuthModal();
    }
  };

  return (
    <div className="modal-container active" onClick={handleBackgroundClick}>
      <div className="modal-content w-full max-w-4xl mx-4 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Side: Brand/Image */}
          <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-900 p-8 text-white hidden md:flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome</h2>
              <p className="text-blue-100 text-sm">新しい体験があなたを待っています。</p>
            </div>
            <div className="space-y-2 text-sm">
              <p>✅ 安心安全な決済</p>
              <p>✅ 厳選されたイベント</p>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="md:w-1/2 p-8 bg-white relative">
            <button 
              onClick={closeAuthModal} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <span className="material-icons-outlined">close</span>
            </button>
            
            <h2 className="text-xl font-bold mb-6 text-gray-900">ログイン / 登録</h2>
            
            <div className="space-y-3 mb-6">
              <button className="w-full py-2.5 border rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-50 text-sm text-gray-700 transition">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4" alt="Google" />
                Google
              </button>
              <button className="w-full py-2.5 bg-[#06C755] text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 text-sm transition">
                LINE
              </button>
              <button className="w-full py-2.5 bg-[#FF0033] text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 text-sm transition">
                Yahoo!
              </button>
            </div>

            <button 
              onClick={handleLogin} 
              className="text-blue-600 font-bold text-sm hover:underline w-full text-center"
            >
              メールアドレスでログイン (デモ)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

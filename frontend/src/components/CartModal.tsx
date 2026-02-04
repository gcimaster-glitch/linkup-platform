'use client';

import React from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { useRouter } from 'next/navigation';

export default function CartModal() {
  const { cart, updateCartQty, purchaseTicket, clearCart } = useStore();
  const { showToast } = useToast();
  const router = useRouter();

  if (!cart) return null;

  const handlePurchase = () => {
    purchaseTicket();
    showToast('購入が完了しました！');
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      clearCart();
    }
  };

  return (
    <div className="modal-container active" onClick={handleBackgroundClick}>
      <div className="modal-content w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">購入手続き</h3>
            <button onClick={clearCart} className="text-gray-400 hover:text-gray-600"><span className="material-icons-outlined">close</span></button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">チケット</p>
            <p className="font-bold text-gray-800">{cart.name}</p>
            <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-3 bg-white border rounded px-2">
                    <button onClick={() => updateCartQty(-1)} className="p-1 hover:text-blue-600"><span className="material-icons-outlined">remove</span></button>
                    <span className="font-bold w-6 text-center">{cart.count}</span>
                    <button onClick={() => updateCartQty(1)} className="p-1 hover:text-blue-600"><span className="material-icons-outlined">add</span></button>
                </div>
                <p className="text-xl font-bold text-blue-600">¥{(cart.price * cart.count).toLocaleString()}</p>
            </div>
        </div>
        
        <button onClick={handlePurchase} className="btn-primary w-full shadow-lg">
            購入を確定する
        </button>
      </div>
    </div>
  );
}

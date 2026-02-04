'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user, tickets, logout } = useStore();
  const { showToast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('tickets');
  const [qrTicketId, setQrTicketId] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    // A small delay or check might be needed if loading, but user is null initially.
    // However, since Store initializes from localStorage, we might get a flash.
    // For now, simple check.
    const t = setTimeout(() => {
        if (!user) {
            router.push('/');
        }
    }, 500);
    return () => clearTimeout(t);
  }, [user, router]);

  const handleLogout = () => {
    logout();
    showToast('ログアウトしました');
    router.push('/');
  };

  const showQR = (id: string) => {
    setQrTicketId(id);
  };

  const closeQR = () => {
    setQrTicketId(null);
  };

  if (!user) return <div className="p-20 text-center">Redirecting...</div>;

  return (
    <>
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8">マイページ</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="space-y-1">
                    <button 
                        onClick={() => setActiveTab('tickets')} 
                        className={`w-full text-left px-4 py-3 rounded-lg font-bold border-l-4 transition ${activeTab === 'tickets' ? 'bg-blue-50 text-blue-700 border-blue-600' : 'hover:bg-gray-50 text-gray-600 border-transparent'}`}
                    >
                        マイチケット
                    </button>
                    <button 
                        onClick={() => setActiveTab('profile')} 
                        className={`w-full text-left px-4 py-3 rounded-lg font-bold border-l-4 transition ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700 border-blue-600' : 'hover:bg-gray-50 text-gray-600 border-transparent'}`}
                    >
                        プロフィール編集
                    </button>
                    <button 
                        onClick={() => setActiveTab('verify')} 
                        className={`w-full text-left px-4 py-3 rounded-lg font-bold border-l-4 transition ${activeTab === 'verify' ? 'bg-blue-50 text-blue-700 border-blue-600' : 'hover:bg-gray-50 text-gray-600 border-transparent'}`}
                    >
                        本人確認・認証
                    </button>
                    <button 
                        onClick={handleLogout} 
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 mt-4 font-bold"
                    >
                        ログアウト
                    </button>
                </div>

                {/* Content */}
                <div className="md:col-span-3">
                    
                    {activeTab === 'tickets' && (
                        <div className="space-y-4">
                            {tickets.length === 0 ? (
                                <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                                    チケットがありません
                                </div>
                            ) : (
                                tickets.map(t => (
                                    <div key={t.id} className="card p-6 flex flex-col md:flex-row gap-6 items-center">
                                        <div 
                                            className="bg-gray-900 p-2 rounded cursor-pointer hover:opacity-80 transition" 
                                            onClick={() => showQR(t.id)}
                                        >
                                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${t.id}`} className="w-20 h-20" alt="QR" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg">{t.title}</h3>
                                            <p className="text-sm text-gray-500">{t.count}枚 ・ ¥{t.total.toLocaleString()}</p>
                                            <p className="text-xs text-green-600 mt-1 font-bold">有効 (Valid)</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="card p-8">
                            <h2 className="text-xl font-bold mb-6">プロフィール編集</h2>
                            <div className="space-y-4 max-w-lg">
                                <div>
                                    <label className="block text-sm font-bold mb-1">表示名</label>
                                    <input type="text" className="input-field" defaultValue={user.display_name} />
                                </div>
                                <button className="btn-primary" onClick={() => showToast('保存しました')}>保存する</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'verify' && (
                        <div className="space-y-4">
                            <div className="card p-6 flex justify-between items-center">
                                <span className="flex items-center gap-2">
                                    <span className="material-icons-outlined text-green-600">check_circle</span> メール認証
                                </span>
                                <span className="text-green-600 font-bold text-sm">完了</span>
                            </div>
                            <div className="card p-6 flex justify-between items-center">
                                <span className="flex items-center gap-2">
                                    <span className="material-icons-outlined text-gray-500">badge</span> 本人確認(eKYC)
                                </span>
                                <button className="text-blue-600 font-bold text-sm hover:underline">提出する</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* QR Modal */}
        {qrTicketId && (
            <div className="modal-container active" onClick={(e) => { if(e.target === e.currentTarget) closeQR(); }}>
                <div className="modal-content p-8 text-center bg-gray-900 text-white rounded-xl">
                    <h3 className="text-xl font-bold mb-4">入場用QR</h3>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrTicketId}`} className="w-48 h-48 mx-auto border-4 border-white rounded-lg mb-4" alt="QR Large" />
                    <p className="text-xs text-gray-400">受付で提示してください</p>
                </div>
            </div>
        )}
    </>
  );
}

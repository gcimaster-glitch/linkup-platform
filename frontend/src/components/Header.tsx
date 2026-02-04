'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '../context/StoreContext';

export default function Header() {
  const { user, logout, openAuthModal, setSearchQuery } = useStore();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
                <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                    <span className="material-icons-outlined text-xl">confirmation_number</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900">LinkUp</span>
            </Link>
            
            <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
                <span className="material-icons-outlined absolute left-3 top-2.5 text-gray-400">search</span>
                <input 
                    type="text" 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-blue-600 transition outline-none" 
                    placeholder="イベント、キーワードで検索" 
                />
            </div>
            
            <div id="nav-actions" className="flex items-center gap-4">
                {user ? (
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition">マイページ</Link>
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 cursor-default" title={user.display_name}>
                            {user.display_name[0]}
                        </div>
                        <button 
                            onClick={logout} 
                            className="p-2 text-gray-400 hover:text-red-500 transition rounded-full hover:bg-red-50" 
                            title="ログアウト"
                        >
                            <span className="material-icons-outlined">logout</span>
                        </button>
                    </div>
                ) : (
                    <button onClick={openAuthModal} className="btn-primary text-sm px-4 py-2">
                        ログイン
                    </button>
                )}
            </div>
        </div>
    </nav>
  );
}

'use client';

import React from 'react';

export default function CategoryCards() {
  return (
    <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-30 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 flex items-center gap-6 cursor-pointer hover:shadow-xl transition border border-gray-100">
            <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center text-4xl">💼</div>
            <div>
                <h3 className="font-bold text-lg text-gray-900">ビジネス特集</h3>
                <p className="text-sm text-gray-500">キャリアアップに繋がるイベント</p>
            </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex items-center gap-6 cursor-pointer hover:shadow-xl transition border border-gray-100">
            <div className="w-20 h-20 bg-pink-100 rounded-lg flex items-center justify-center text-4xl">🎨</div>
            <div>
                <h3 className="font-bold text-lg text-gray-900">アート＆デザイン</h3>
                <p className="text-sm text-gray-500">クリエイティビティを刺激する</p>
            </div>
        </div>
    </div>
  );
}

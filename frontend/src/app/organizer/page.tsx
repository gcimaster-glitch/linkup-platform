'use client';

import React from 'react';
import Link from 'next/link';

export default function OrganizerLP() {
  return (
    <div className="bg-white py-16 text-center px-4">
        <h1 className="text-4xl font-bold mb-4">主催者として活躍しよう</h1>
        <p className="text-gray-500 mb-12">数分でイベントページを作成し、チケットを販売できます。</p>
        
        <div className="flex justify-center gap-8 max-w-4xl mx-auto mb-12 mt-8 items-center">
            <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl">📝</div>
                <p className="font-bold">簡易登録</p>
            </div>
            <div className="text-gray-300">→</div>
            <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl">📱</div>
                <p className="font-bold">電話認証</p>
            </div>
            <div className="text-gray-300">→</div>
            <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl">🆔</div>
                <p className="font-bold">本人確認</p>
            </div>
        </div>
        
        <Link href="/organizer/dashboard" className="btn-primary text-lg px-8 py-4 inline-flex">
            デモ：管理画面へ進む
        </Link>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="font-bold text-lg mb-4 text-gray-800">LinkUp</h3>
                    <p className="text-sm text-gray-500">日本最大級のイベントプラットフォーム。</p>
                </div>
                <div>
                    <h4 className="font-bold mb-4 text-gray-800">サービス</h4>
                    <ul className="text-sm space-y-2 text-gray-600">
                        <li><Link href="/" className="hover:text-blue-600">イベントを探す</Link></li>
                        <li><Link href="/organizer" className="hover:text-blue-600">主催者になる</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-4 text-gray-800">規約・サポート</h4>
                    <ul className="text-sm space-y-2 text-gray-600">
                        <li><Link href="#" className="hover:text-blue-600">利用規約</Link></li>
                        <li><Link href="#" className="hover:text-blue-600">プライバシーポリシー</Link></li>
                        <li><Link href="#" className="hover:text-blue-600">特商法に基づく表記</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-4 text-gray-800">管理者</h4>
                    <button className="text-sm flex items-center gap-1 hover:text-blue-600 text-gray-600">
                        <span className="material-icons-outlined !text-sm">admin_panel_settings</span> 管理者ログイン
                    </button>
                </div>
            </div>
            <div className="border-t border-gray-100 mt-8 pt-8 text-center text-xs text-gray-400">
                &copy; 2026 LinkUp Inc.
            </div>
        </div>
    </footer>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
  const router = useRouter();

  const scrollToEvents = () => {
    const el = document.getElementById('events');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-gray-900 text-white relative h-[450px] overflow-hidden flex items-center justify-center text-center px-4">
        {/* Background Image */}
        <img 
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80" 
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            alt="Hero Background"
        />
        
        <div className="relative z-10 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                感動を、予約しよう。
            </h1>
            <div className="flex gap-4 justify-center">
                <button onClick={scrollToEvents} className="btn-primary">
                    イベントを探す
                </button>
                <Link href="/organizer" className="px-8 py-3 border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition block">
                    主催者登録
                </Link>
            </div>
        </div>
    </div>
  );
}

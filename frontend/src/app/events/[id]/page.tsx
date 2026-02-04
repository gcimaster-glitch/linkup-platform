'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { useToast } from '../../../context/ToastContext';
import { useParams } from 'next/navigation';

export default function EventDetail() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { events, initCart, openAuthModal, user } = useStore();
  const { showToast } = useToast();
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    if (id && events.length > 0) {
      const found = events.find(e => e.event_id === id);
      setEvent(found || null);
    }
  }, [id, events]);

  if (!event) {
    return <div className="p-20 text-center">Loading or Not Found...</div>;
  }

  const handleTicketSelect = (t: any) => {
    if (!user) {
      openAuthModal();
      return;
    }
    initCart(t.id, t.name, t.price, event.title, event.event_id);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    const btn = e.currentTarget;
    const icon = btn.querySelector('span');
    if (icon) icon.classList.toggle('text-pink-500');
    showToast('お気に入りを変更しました');
  };

  return (
    <>
      <div className="w-full h-[350px] relative overflow-hidden bg-gray-900">
          <img src={event.cover_image_url} className="w-full h-full object-cover opacity-80" alt={event.title} />
          <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/90 to-transparent">
              <div className="max-w-6xl mx-auto">
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mb-3 inline-block uppercase">
                      {event.category}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 shadow-sm">
                      {event.title}
                  </h1>
                  <p className="text-gray-200 flex items-center gap-2">
                      <span className="material-icons-outlined text-sm">place</span> {event.venue_name}
                  </p>
              </div>
          </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-10">
              {/* Action Buttons */}
              <div className="flex gap-4 border-b border-gray-200 pb-6">
                  <button onClick={() => showToast('カレンダーに追加')} className="flex-1 py-2.5 bg-white border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 flex justify-center items-center gap-2 transition">
                      <span className="material-icons-outlined text-blue-600">calendar_today</span> カレンダー
                  </button>
                  <button onClick={toggleFavorite} className="flex-1 py-2.5 bg-white border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 flex justify-center items-center gap-2 transition">
                      <span className="material-icons-outlined">favorite_border</span> お気に入り
                  </button>
                  <button onClick={() => showToast('リマインダーを設定しました')} className="flex-1 py-2.5 bg-white border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 flex justify-center items-center gap-2 transition">
                      <span className="material-icons-outlined text-yellow-500">notifications</span> リマインド
                  </button>
              </div>

              {/* Description (Rich Text) */}
              <div className="prose max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: event.description }}></div>
              
              {/* Organizer Info */}
              <div className="card p-6 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 text-xl">Org</div>
                  <div className="flex-1">
                      <div className="flex items-center gap-2">
                          <p className="font-bold text-lg">{event.organizer_name}</p>
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">公式</span>
                      </div>
                      <p className="text-sm text-gray-500">評価: ⭐ {event.organizer_rating}</p>
                  </div>
                  <button className="btn-secondary text-sm">フォロー</button>
              </div>
          </div>

          <div className="lg:col-span-4">
              <div className="sticky top-24 card p-6 shadow-xl border-t-4 border-blue-600">
                  <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                      <span className="material-icons-outlined text-blue-600">confirmation_number</span> チケット選択
                  </h3>
                  <div className="space-y-3">
                      {event.tickets.map((t: any) => (
                        <div 
                            key={t.id} 
                            onClick={() => handleTicketSelect(t)}
                            className="p-4 border border-gray-200 rounded-lg hover:border-blue-600 bg-blue-50/50 cursor-pointer mb-2 transition-colors"
                        >
                            <div className="flex justify-between font-bold mb-1">
                                <span>{t.name}</span>
                                <span>¥{t.price.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-gray-500">{t.desc}</p>
                        </div>
                      ))}
                  </div>
                  <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
                      <span className="material-icons-outlined text-sm">lock</span> Stripeによる安全な決済
                  </p>
              </div>
          </div>
      </div>
    </>
  );
}

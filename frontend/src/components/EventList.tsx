'use client';

import React from 'react';
import { useStore } from '../context/StoreContext';
import Link from 'next/link';

export default function EventList() {
  const { events, searchQuery } = useStore();

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.venue_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="events" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <span className="w-1 h-8 bg-blue-600 rounded-full"></span> 注目のイベント
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map(e => (
                <Link href={`/events/${e.event_id}`} key={e.event_id} className="card overflow-hidden cursor-pointer hover:shadow-md transition block">
                    <div className="h-48 relative">
                        <img src={e.cover_image_url} className="w-full h-full object-cover" alt={e.title} />
                        <span className="absolute top-2 right-2 bg-white/90 text-xs font-bold px-2 py-1 rounded shadow-sm text-gray-800">
                            {e.category}
                        </span>
                    </div>
                    <div className="p-4">
                        <p className="text-xs font-bold text-blue-600 mb-1">
                            {new Date(e.start_datetime).toLocaleDateString()}
                        </p>
                        <h3 className="font-bold mb-2 line-clamp-2 text-gray-900">{e.title}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span className="material-icons-outlined text-xs">place</span> {e.venue_name}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
        
        {filteredEvents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
                該当するイベントが見つかりませんでした。
            </div>
        )}
    </div>
  );
}

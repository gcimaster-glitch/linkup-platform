'use client';

import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { useToast } from '../../../context/ToastContext';
import { MASTER_EVENTS } from '../../../data/events';

export default function OrganizerDashboard() {
  const { events, addEvent } = useStore();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleCreate = () => {
    if (!newTitle) return;
    
    // Create new event based on a template
    const template = MASTER_EVENTS[0];
    const newEvent = { 
        ...template, 
        event_id: 'evt-' + Date.now(), 
        title: newTitle, 
        start_datetime: new Date().toISOString() 
    };
    
    addEvent(newEvent);
    setIsModalOpen(false);
    setNewTitle('');
    showToast('イベントを公開しました');
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r hidden md:block">
            <div className="p-6 border-b">
                <span className="font-bold text-lg text-blue-600">Organizer</span>
            </div>
            <nav className="p-4 space-y-1">
                <a href="#" className="block px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg">イベント管理</a>
                <a href="#" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">売上分析</a>
            </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">イベント管理</h1>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                    <span className="material-icons-outlined">add</span> イベントを作成
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card p-6">
                    <p className="text-sm text-gray-500">総売上</p>
                    <p className="text-2xl font-bold">¥1,240,000</p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500">チケット販売</p>
                    <p className="text-2xl font-bold">342枚</p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500">PV</p>
                    <p className="text-2xl font-bold">12,405</p>
                </div>
            </div>

            <div className="space-y-6">
                {events.map(e => (
                    <div key={e.event_id} className="flex items-center justify-between border-b pb-4 bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                                <img src={e.cover_image_url} className="w-full h-full object-cover" alt={e.title} />
                            </div>
                            <div>
                                <p className="font-bold">{e.title}</p>
                                <p className="text-sm text-gray-500">{new Date(e.start_datetime).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold">公開中</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Create Modal */}
        {isModalOpen && (
            <div className="modal-container active" onClick={(e) => { if(e.target === e.currentTarget) setIsModalOpen(false); }}>
                <div className="modal-content p-6 w-full max-w-md mx-4">
                    <h3 className="text-xl font-bold mb-6">イベント作成</h3>
                    <input 
                        type="text" 
                        className="input-field mb-4" 
                        placeholder="イベント名"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                    />
                    <button className="btn-primary w-full" onClick={handleCreate}>
                        公開
                    </button>
                </div>
            </div>
        )}
    </div>
  );
}

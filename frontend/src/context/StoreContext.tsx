'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { MASTER_EVENTS, EventData } from '../data/events';

interface User {
  display_name: string;
}

interface TicketItem {
  id: string;
  title: string;
  count: number;
  total: number;
  status: string;
  eventId: string;
}

interface CartItem {
  ticketId: string;
  name: string;
  price: number;
  count: number;
  eventTitle: string;
  eventId: string;
}

interface StoreContextType {
  user: User | null;
  events: EventData[];
  tickets: TicketItem[];
  cart: CartItem | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: () => void;
  logout: () => void;
  initCart: (tid: string, name: string, price: number, eventTitle: string, eventId: string) => void;
  updateCartQty: (delta: number) => void;
  purchaseTicket: () => void;
  addEvent: (event: EventData) => void;
  clearCart: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<EventData[]>(MASTER_EVENTS);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [cart, setCart] = useState<CartItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      const savedTickets = localStorage.getItem('tickets');
      const savedEvents = localStorage.getItem('events');

      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedTickets) setTickets(JSON.parse(savedTickets));
      if (savedEvents && JSON.parse(savedEvents).length > 0) {
        setEvents(JSON.parse(savedEvents));
      } else {
        setEvents(MASTER_EVENTS);
      }
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage on change (only after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('user', user ? JSON.stringify(user) : '');
  }, [user, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('tickets', JSON.stringify(tickets));
  }, [tickets, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('events', JSON.stringify(events));
  }, [events, isInitialized]);

  const login = () => {
    setUser({ display_name: 'Demo User' });
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const initCart = (tid: string, name: string, price: number, eventTitle: string, eventId: string) => {
    setCart({ ticketId: tid, name, price, count: 1, eventTitle, eventId });
  };

  const updateCartQty = (delta: number) => {
    if (!cart) return;
    const newCount = Math.max(1, cart.count + delta);
    setCart({ ...cart, count: newCount });
  };

  const clearCart = () => {
    setCart(null);
  };

  const purchaseTicket = () => {
    if (!cart) return;
    const newTicket: TicketItem = {
      id: 'TKT-' + Date.now(),
      title: cart.eventTitle,
      count: cart.count,
      total: cart.price * cart.count,
      status: 'valid',
      eventId: cart.eventId
    };
    setTickets([newTicket, ...tickets]);
    setCart(null);
  };

  const addEvent = (event: EventData) => {
    setEvents([event, ...events]);
  };

  return (
    <StoreContext.Provider value={{
      user, events, tickets, cart, searchQuery, setSearchQuery,
      isAuthModalOpen, openAuthModal, closeAuthModal,
      login, logout, initCart, updateCartQty, purchaseTicket, addEvent, clearCart
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

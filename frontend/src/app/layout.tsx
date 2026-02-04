import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '../context/StoreContext';
import { ToastProvider } from '../context/ToastContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import CartModal from '../components/CartModal';

export const metadata: Metadata = {
  title: 'LinkUp - 日本最大級のイベントプラットフォーム',
  description: '感動を、予約しよう。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
      </head>
      <body className="flex flex-col min-h-screen">
        <StoreProvider>
          <ToastProvider>
            <Header />
            <main className="flex-grow pb-20">
              {children}
            </main>
            <Footer />
            <AuthModal />
            <CartModal />
          </ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}

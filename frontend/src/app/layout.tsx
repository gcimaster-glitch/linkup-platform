import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LinkUp - 人と機会を繋げる | イベントチケット予約プラットフォーム',
  description: '次世代のイベントチケット予約プラットフォーム。簡単にイベントを作成・管理・宣伝。QR入場管理システムで瞬時にチェックイン。',
  manifest: '/manifest.json',
  themeColor: '#4F46E5',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  keywords: 'イベント,チケット,予約,QRコード,入場管理,LinkUp,リンクアップ',
  openGraph: {
    title: 'LinkUp - 人と機会を繋げる',
    description: '次世代のイベントチケット予約プラットフォーム',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LinkUp - 人と機会を繋げる',
    description: '次世代のイベントチケット予約プラットフォーム',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LinkUp',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased bg-white">
        {children}
      </body>
    </html>
  );
}

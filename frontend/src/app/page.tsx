export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🔗</div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  LinkUp
                </h1>
                <p className="text-xs text-gray-500">人と機会を繋げる</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                ログイン
              </a>
              <a
                href="/register"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-full hover:shadow-lg transition-all font-medium"
              >
                無料で始める
              </a>
            </div>
          </div>
        </nav>
      </header>

      {/* ヒーローセクション */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 font-semibold text-sm">
            🎉 新しい出会いと体験を
          </div>
          <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            人と機会を繋げる
          </h2>
          <p className="text-2xl mb-8 text-gray-600 max-w-3xl mx-auto">
            <span className="font-bold text-indigo-600">LinkUp</span>は、イベントを通じて人と人を繋ぐ、
            次世代のチケット予約プラットフォームです
          </p>
          <div className="flex justify-center gap-4 mb-12">
            <a
              href="/events"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
            >
              イベントを探す 🔍
            </a>
            <a
              href="/organizer/register"
              className="bg-white text-indigo-600 px-10 py-4 rounded-full font-bold text-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-all"
            >
              主催者として登録
            </a>
          </div>

          {/* 統計 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-lg">
              <div className="text-4xl font-bold text-indigo-600 mb-2">10K+</div>
              <div className="text-gray-600">開催イベント</div>
            </div>
            <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-lg">
              <div className="text-4xl font-bold text-purple-600 mb-2">50K+</div>
              <div className="text-gray-600">アクティブユーザー</div>
            </div>
            <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-lg">
              <div className="text-4xl font-bold text-pink-600 mb-2">98%</div>
              <div className="text-gray-600">満足度</div>
            </div>
          </div>
        </div>
      </section>

      {/* 注目イベント */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-4xl font-bold text-gray-900">🔥 注目のイベント</h3>
          <a href="/events" className="text-indigo-600 hover:text-indigo-700 font-semibold">
            すべて見る →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="h-48 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 relative">
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold text-indigo-600">
                  受付中
                </div>
              </div>
              <div className="p-6">
                <div className="text-sm text-indigo-600 font-semibold mb-2">📅 2026年2月15日 14:00〜</div>
                <h4 className="text-xl font-bold mb-2">Web3カンファレンス 2026</h4>
                <p className="text-gray-600 mb-4">次世代のWeb技術とブロックチェーンの未来を語り合う...</p>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-600 font-bold text-lg">¥3,000〜</span>
                  <a
                    href={`/events/${i}`}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    詳細を見る →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 機能紹介 */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-center mb-4 text-white">✨ LinkUpの特徴</h3>
          <p className="text-center text-indigo-100 mb-12 text-lg">人と機会を繋げる、革新的な機能</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition">
              <div className="text-6xl mb-4">🎫</div>
              <h4 className="text-2xl font-bold mb-3 text-white">QR入場管理</h4>
              <p className="text-indigo-100">
                スマホでQRコードをスキャンするだけ。瞬時にチェックイン完了。二重入場も自動防止。
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition">
              <div className="text-6xl mb-4">💳</div>
              <h4 className="text-2xl font-bold mb-3 text-white">安全な決済</h4>
              <p className="text-indigo-100">
                Stripe統合で安心・安全。クレカ、コンビニ、銀行振込に対応。
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition">
              <div className="text-6xl mb-4">🤖</div>
              <h4 className="text-2xl font-bold mb-3 text-white">AIコンシェルジュ</h4>
              <p className="text-indigo-100">
                Gemini AIがあなたにぴったりのイベントを提案。質問にも即座に回答。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 主催者向け */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block mb-4 px-4 py-2 bg-purple-100 rounded-full text-purple-700 font-semibold text-sm">
              主催者向け
            </div>
            <h3 className="text-4xl font-bold mb-6">3分でイベント作成</h3>
            <p className="text-gray-600 text-lg mb-6">
              直感的なUIで、誰でも簡単にイベントページを作成。チケット設定、決済、受付管理まで、すべてワンストップ。
            </p>
            <ul className="space-y-4">
              {[
                'リアルタイム申込管理',
                'QRコード自動生成',
                '詳細なアクセス解析',
                'フォロワー自動通知',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="text-green-500 text-2xl">✓</span>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </li>
              ))}
            </ul>
            <a
              href="/organizer/register"
              className="inline-block mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transition-all"
            >
              主催者登録（無料）
            </a>
          </div>
          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8 h-96 flex items-center justify-center">
            <div className="text-8xl">📊</div>
          </div>
        </div>
      </section>

      {/* 料金 */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-center mb-4">💰 シンプルな料金体系</h3>
          <p className="text-center text-gray-600 mb-12 text-lg">売れた分だけお支払い。初期費用・月額費用なし。</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h4 className="text-2xl font-bold mb-2">無料イベント</h4>
              <div className="text-4xl font-bold text-indigo-600 mb-4">¥0</div>
              <p className="text-gray-600">完全無料で利用可能</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-2xl shadow-2xl text-center transform scale-105">
              <div className="text-5xl mb-4">🎫</div>
              <h4 className="text-2xl font-bold mb-2 text-white">有料イベント</h4>
              <div className="text-4xl font-bold text-white mb-4">4.5% + ¥89</div>
              <p className="text-indigo-100">チケット1枚あたり</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="text-5xl mb-4">🔄</div>
              <h4 className="text-2xl font-bold mb-2">サブスク</h4>
              <div className="text-4xl font-bold text-purple-600 mb-4">8%</div>
              <p className="text-gray-600">月額売上の</p>
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="text-3xl">🔗</div>
                <div>
                  <h5 className="font-bold text-lg">LinkUp</h5>
                  <p className="text-sm text-gray-400">人と機会を繋げる</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                次世代のイベントチケット予約プラットフォーム
              </p>
            </div>
            <div>
              <h6 className="font-semibold mb-4">サービス</h6>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/events">イベント一覧</a></li>
                <li><a href="/organizer">主催者向け</a></li>
                <li><a href="/pricing">料金プラン</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">サポート</h6>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/help">ヘルプセンター</a></li>
                <li><a href="/contact">お問い合わせ</a></li>
                <li><a href="/terms">利用規約</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">フォロー</h6>
              <div className="flex gap-4 text-2xl">
                <a href="#" className="hover:text-indigo-400">📘</a>
                <a href="#" className="hover:text-indigo-400">🐦</a>
                <a href="#" className="hover:text-indigo-400">📷</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            © 2026 LinkUp - 人と機会を繋げる. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

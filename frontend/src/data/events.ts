export interface Ticket {
  id: string;
  name: string;
  price: number;
  desc: string;
}

export interface Review {
  user: string;
  rating: number;
  comment: string;
}

export interface EventData {
  event_id: string;
  title: string;
  category: string;
  start_datetime: string;
  end_datetime: string;
  venue_name: string;
  venue_address: string;
  cover_image_url: string;
  organizer_name: string;
  organizer_rating: string;
  price: number;
  description: string;
  tickets: Ticket[];
  reviews: Review[];
}

const IMGS: Record<string, string> = {
  tech: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
  business: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80',
  art: 'https://images.unsplash.com/photo-1518998053901-5348d3969105?w=1200&q=80',
  music: 'https://images.unsplash.com/photo-1501281668745-13bc6a60fa36?w=1200&q=80',
  social: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&q=80'
};

export const MASTER_EVENTS: EventData[] = Array.from({ length: 30 }, (_, i) => {
  const cat = ['tech', 'business', 'art', 'music', 'social'][i % 5];
  const date = new Date();
  date.setDate(date.getDate() + i + 1); // Future dates
  
  return {
      event_id: `evt-${i}`,
      title: `${cat.toUpperCase()} Summit Vol.${i+1}: Future of Innovation`,
      category: cat,
      start_datetime: date.toISOString(),
      end_datetime: new Date(date.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      venue_name: i % 3 === 0 ? 'オンライン' : (i % 2 === 0 ? '東京国際フォーラム' : '渋谷ストリームホール'),
      venue_address: i % 3 === 0 ? 'Zoom' : '東京都渋谷区...',
      cover_image_url: IMGS[cat],
      organizer_name: 'LinkUp Official',
      organizer_rating: (4 + Math.random()).toFixed(1),
      price: i % 3 === 0 ? 0 : (i + 1) * 1000,
      description: `
          <p class="lead">業界のトップランナーが集結する、${cat}愛好家のための特別イベント。</p>
          <h3>🔥 イベントの魅力</h3>
          <ul>
              <li>最新トレンドを網羅したセッション</li>
              <li>参加者同士のネットワーキング</li>
              <li>豪華ゲストによるトークショー</li>
          </ul>
          <h3>⏰ タイムテーブル</h3>
          <div class="timetable">
              <p><span class="time">13:00</span> 開場・受付</p>
              <p><span class="time">13:30</span> キーノートスピーチ</p>
              <p><span class="time">15:00</span> パネルディスカッション</p>
              <p><span class="time">17:00</span> 懇親会</p>
          </div>
          <h3>⚠️ 注意事項</h3>
          <p>チケットのQRコードを受付でご提示ください。</p>
      `,
      tickets: [
          { id: `tkt-${i}-1`, name: '一般参加', price: i % 3 === 0 ? 0 : (i + 1) * 1000, desc: '全セッション参加可能' },
          { id: `tkt-${i}-2`, name: 'VIPチケット', price: (i + 1) * 1000 + 5000, desc: '最前列確約 + 懇親会' }
      ],
      reviews: [
          { user: 'User A', rating: 5, comment: '最高でした！' },
          { user: 'User B', rating: 4, comment: '勉強になりました。' }
      ]
  };
});

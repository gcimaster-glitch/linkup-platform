
// Helper functions for UI interactions

// --- UTILS & TOASTS ---
function showToast(msg, iconName) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    const msgEl = document.getElementById('toast-message');
    const iconEl = document.getElementById('toast-icon');
    
    if (msgEl) msgEl.innerText = msg;
    if (iconEl && iconName) iconEl.innerText = iconName;
    
    toast.classList.remove('translate-x-full');
    setTimeout(() => {
        toast.classList.add('translate-x-full');
    }, 3000);
}

function closeModal() {
    const container = document.getElementById('modal-container');
    if (container) container.classList.add('hidden');
}

// --- SLIDESHOW LOGIC ---
let currentSlide = 0;
const HERO_SLIDES = [
    { img: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", title: "SUMMER SONIC 2026", sub: "今年も熱い夏がやってくる。先行チケット発売中！", tag: "FESTIVAL", cta: "チケットを探す" },
    { img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", title: "AI Developers Summit", sub: "生成AIの最前線を体感せよ。", tag: "CONFERENCE", cta: "セッション一覧" },
    { img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", title: "Startup Weekend Tokyo", sub: "54時間で起業体験。", tag: "BUSINESS", cta: "参加登録" },
    { img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", title: "Gourmet Fes 2026", sub: "全国の美食が集結。", tag: "FOOD", cta: "クーポンGET" },
    { img: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", title: "Design Week", sub: "クリエイティビティの祭典。", tag: "ART", cta: "ギャラリーを見る" }
];

function changeSlide(index) {
    if (!document.getElementById('hero-img')) return;
    
    currentSlide = index;
    if (currentSlide >= HERO_SLIDES.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = HERO_SLIDES.length - 1;
    
    updateSlide(HERO_SLIDES[currentSlide], currentSlide);
}

function updateSlide(slide, index) {
    const heroImg = document.getElementById('hero-img');
    const heroTitle = document.getElementById('hero-title');
    const heroSub = document.getElementById('hero-sub');
    const heroTag = document.getElementById('hero-tag');
    
    if(heroImg) {
        heroImg.style.opacity = '0';
        setTimeout(() => {
            heroImg.src = slide.img;
            heroImg.onload = () => { heroImg.style.opacity = '0.6'; };
        }, 200);
    }
    
    if(heroTitle) {
        heroTitle.classList.remove('animate-fade-in-up');
        void heroTitle.offsetWidth; 
        heroTitle.innerText = slide.title;
        heroTitle.classList.add('animate-fade-in-up');
    }
    
    if(heroSub) heroSub.innerText = slide.sub;
    if(heroTag) heroTag.innerText = slide.tag;
    
    const dotContainer = document.querySelector('.absolute.bottom-8.right-8.flex.space-x-3');
    if (dotContainer) {
        Array.from(dotContainer.children).forEach((dot, i) => {
            if (i === index) {
                dot.classList.remove('bg-white/40');
                dot.classList.add('bg-white', 'scale-125');
            } else {
                dot.classList.add('bg-white/40');
                dot.classList.remove('bg-white', 'scale-125');
            }
        });
    }
}

// Auto slide
setInterval(() => {
    changeSlide(currentSlide + 1);
}, 6000);

// --- OTHER HELPERS ---

function toggleMapView() {
    const mapOverlay = document.getElementById('full-map-view');
    if (mapOverlay) {
        if (mapOverlay.classList.contains('hidden')) {
            mapOverlay.classList.remove('hidden');
            if (typeof initMap === 'function') initMap(); 
        } else {
            mapOverlay.classList.add('hidden');
        }
    }
}

function toggleDatePanel() {
    const panel = document.getElementById('date-panel');
    if (panel) {
        panel.classList.toggle('hidden');
    }
}

// Ensure initMap exists
window.initMap = function() {
    if (window.mapInitialized) return;
    const mapContainer = document.getElementById('large-real-map');
    if (!mapContainer) return;
    
    const map = L.map('large-real-map').setView([35.6895, 139.6917], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    if (store.events) {
        store.events.forEach(evt => {
            const lat = 35.6895 + (Math.random() - 0.5) * 0.05;
            const lng = 139.6917 + (Math.random() - 0.5) * 0.05;
            
            L.marker([lat, lng]).addTo(map)
                .bindPopup(`
                    <div class="p-2">
                        <img src="${evt.cover_image_url}" class="w-full h-24 object-cover rounded mb-2">
                        <h3 class="font-bold text-sm">${evt.title}</h3>
                        <p class="text-xs text-slate-500">${new Date(evt.start_datetime).toLocaleDateString()}</p>
                        <button class="mt-2 w-full bg-primary text-white text-xs py-1 rounded" onclick="router('detail', {id: '${evt.event_id}'})">詳細を見る</button>
                    </div>
                `);
        });
    }
    
    window.mapInitialized = true;
};

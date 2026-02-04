/**
 * LinkUp Dashboard System - Unified Logic
 * Handles Organizer, User, and Admin views with modern UI
 */

const Dashboard = {
    
    // --- UTILS ---
    formatCurrency: (amount) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount),
    
    // --- MAIN RENDERER ---
    render: (container, role, initialTab = 'dashboard') => {
        const user = store.user;
        if (!user) { openAuthModal(); return; }

        if (role === 'organizer') Dashboard.Organizer.init(container, initialTab);
        else if (role === 'admin') Dashboard.Admin.init(container, initialTab);
        else Dashboard.User.init(container, initialTab);
    },

    // ==========================================
    // 1. ORGANIZER COCKPIT
    // ==========================================
    Organizer: {
        init: (container, tab) => {
            const menu = [
                { id: 'dashboard', icon: 'speed', label: 'Overview' },
                { id: 'events', icon: 'event_note', label: 'Events' },
                { id: 'orders', icon: 'confirmation_number', label: 'Orders' },
                { id: 'finance', icon: 'account_balance_wallet', label: 'Finance' },
                { id: 'marketing', icon: 'campaign', label: 'Marketing' },
                { id: 'settings', icon: 'settings', label: 'Settings' }
            ];

            container.innerHTML = `
                <div class="flex h-[calc(100vh-64px)] bg-slate-50">
                    <!-- Sidebar -->
                    <aside class="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
                        <div class="p-6">
                            <div class="flex items-center gap-3 mb-6">
                                <img src="${store.organizerProfile.img}" class="w-10 h-10 rounded-full bg-slate-100 border">
                                <div>
                                    <h3 class="font-bold text-slate-800 text-sm truncate w-32">${store.organizerProfile.name}</h3>
                                    <p class="text-xs text-slate-500">Organizer Pro</p>
                                </div>
                            </div>
                            <nav class="space-y-1">
                                ${menu.map(m => `
                                    <button onclick="Dashboard.Organizer.switchTab('${m.id}')" id="nav-${m.id}"
                                        class="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${tab === m.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}">
                                        <span class="material-icons-outlined mr-3">${m.icon}</span> ${m.label}
                                    </button>
                                `).join('')}
                            </nav>
                        </div>
                        <div class="mt-auto p-6 border-t border-slate-100">
                            <button onclick="router('home')" class="flex items-center text-slate-400 hover:text-slate-600 text-sm font-bold">
                                <span class="material-icons-outlined mr-2">arrow_back</span> Back to Site
                            </button>
                        </div>
                    </aside>

                    <!-- Main Area -->
                    <main class="flex-1 overflow-y-auto p-4 md:p-8" id="org-main">
                        <!-- Mobile Menu Toggle -->
                        <div class="lg:hidden mb-6 flex justify-between items-center">
                            <div class="flex items-center gap-2">
                                <img src="${store.organizerProfile.img}" class="w-8 h-8 rounded-full">
                                <span class="font-bold text-slate-800">Organizer Menu</span>
                            </div>
                            <button class="p-2 bg-white rounded-lg shadow-sm border border-slate-200" onclick="alert('Mobile menu coming soon')">
                                <span class="material-icons-outlined text-slate-600">menu</span>
                            </button>
                        </div>
                        <div id="org-view-content"></div>
                    </main>
                </div>
            `;
            Dashboard.Organizer.switchTab(tab);
        },

        switchTab: (tabId) => {
            // Update Active State
            document.querySelectorAll('[id^="nav-"]').forEach(el => 
                el.className = "w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            );
            const active = document.getElementById(`nav-${tabId}`);
            if(active) active.className = "w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all bg-slate-900 text-white shadow-lg shadow-slate-900/20";

            const content = document.getElementById('org-view-content');
            
            if (tabId === 'dashboard') {
                // Mock KPIs
                const sales = 1250000;
                const visitors = 4530;
                
                content.innerHTML = `
                    <div class="mb-8">
                        <h1 class="text-2xl font-bold text-slate-800">Overview</h1>
                        <p class="text-slate-500">Here is what's happening with your events today.</p>
                    </div>

                    <!-- KPI Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                            <div class="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition"></div>
                            <p class="text-slate-500 text-xs font-bold uppercase mb-2">Total Revenue</p>
                            <h3 class="text-3xl font-black text-slate-800 tracking-tight">${Dashboard.formatCurrency(sales)}</h3>
                            <span class="inline-flex items-center mt-3 px-2 py-1 rounded-md bg-green-50 text-green-600 text-xs font-bold">
                                <span class="material-icons-outlined text-xs mr-1">trending_up</span> +12.5%
                            </span>
                        </div>
                        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <p class="text-slate-500 text-xs font-bold uppercase mb-2">Active Events</p>
                            <h3 class="text-3xl font-black text-slate-800 tracking-tight">8 <span class="text-lg text-slate-400 font-medium">events</span></h3>
                        </div>
                        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <p class="text-slate-500 text-xs font-bold uppercase mb-2">Page Views</p>
                            <h3 class="text-3xl font-black text-slate-800 tracking-tight">${visitors.toLocaleString()}</h3>
                        </div>
                    </div>

                    <!-- Chart Placeholder -->
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 h-80 flex items-center justify-center bg-slate-50/50">
                        <p class="text-slate-400 font-bold">Analytics Chart Area (Chart.js)</p>
                    </div>
                `;
            } 
            else if (tabId === 'events') {
                const myEvents = store.events.filter(e => e.organizer_name === store.organizerProfile.name);
                content.innerHTML = `
                    <div class="flex justify-between items-center mb-8">
                        <h1 class="text-2xl font-bold text-slate-800">My Events</h1>
                        <button onclick="openCreateEventModal()" class="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition transform hover:-translate-y-0.5">
                            <span class="material-icons-outlined text-sm mr-2">add</span> Create Event
                        </button>
                    </div>

                    <div class="grid grid-cols-1 gap-4">
                        ${myEvents.length === 0 ? '<div class="text-center py-20 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">No events found. Create your first one!</div>' : 
                        myEvents.map(e => `
                            <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center hover:shadow-md transition">
                                <img src="${e.cover_image_url}" class="w-full md:w-32 h-20 object-cover rounded-lg">
                                <div class="flex-1 w-full">
                                    <div class="flex justify-between items-start">
                                        <h3 class="font-bold text-slate-800 text-lg">${e.title}</h3>
                                        <span class="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">Published</span>
                                    </div>
                                    <p class="text-sm text-slate-500 mt-1 flex items-center">
                                        <span class="material-icons-outlined text-sm mr-1">event</span> ${new Date(e.start_datetime).toLocaleDateString()}
                                        <span class="mx-2">•</span>
                                        <span class="material-icons-outlined text-sm mr-1">place</span> ${e.venue_name}
                                    </p>
                                </div>
                                <div class="flex gap-2 w-full md:w-auto">
                                    <button class="flex-1 md:flex-none px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">Stats</button>
                                    <button onclick="openCreateEventModal('${e.event_id}')" class="flex-1 md:flex-none px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800">Edit</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            else if (tabId === 'marketing') {
                const campaigns = store.campaigns;
                content.innerHTML = `
                    <div class="flex justify-between items-center mb-8">
                        <div>
                            <h1 class="text-2xl font-bold text-slate-800">Marketing</h1>
                            <p class="text-slate-500 text-sm">Manage coupons and campaigns</p>
                        </div>
                        <button onclick="Dashboard.Organizer.createCampaign()" class="px-5 py-2.5 bg-slate-900 text-white rounded-full font-bold shadow-lg">New Campaign</button>
                    </div>
                    
                    <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        <table class="w-full text-left">
                            <thead class="bg-slate-50 text-xs text-slate-500 uppercase">
                                <tr>
                                    <th class="p-4">Code</th>
                                    <th class="p-4">Discount</th>
                                    <th class="p-4">Usage</th>
                                    <th class="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm text-slate-700 divide-y divide-slate-100">
                                ${campaigns.length === 0 ? '<tr><td colspan="4" class="p-8 text-center text-slate-400">No active campaigns</td></tr>' :
                                campaigns.map(c => `
                                    <tr>
                                        <td class="p-4 font-mono font-bold">${c.promo_code}</td>
                                        <td class="p-4">${c.discount_type === 'percentage' ? c.discount_value + '%' : '¥' + c.discount_value} OFF</td>
                                        <td class="p-4">${c.current_uses} / ${c.max_uses || '∞'}</td>
                                        <td class="p-4"><span class="text-green-600 font-bold">Active</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
            else {
                content.innerHTML = `<div class="p-12 text-center text-slate-400">Module [${tabId}] is under construction.</div>`;
            }
        },

        createCampaign: () => {
            const code = prompt("Enter Promo Code (e.g. SUMMER2026):");
            if(code) {
                const newC = {
                    promo_code: code,
                    discount_type: 'percentage',
                    discount_value: 10,
                    status: 'active',
                    current_uses: 0,
                    max_uses: 100,
                    start_datetime: new Date().toISOString(),
                    end_datetime: new Date(Date.now() + 86400000*30).toISOString()
                };
                const list = store.campaigns;
                list.push(newC);
                store.campaigns = list;
                showToast('Campaign created!', 'campaign');
                Dashboard.Organizer.switchTab('marketing');
            }
        }
    },

    // ==========================================
    // 2. USER DIGITAL WALLET
    // ==========================================
    User: {
        init: (container, tab) => {
            const tabs = [
                { id: 'tickets', label: 'Wallet' },
                { id: 'following', label: 'Following' },
                { id: 'notifications', label: 'Inbox' },
                { id: 'profile', label: 'Profile' }
            ];

            container.innerHTML = `
                <div class="min-h-screen bg-white pb-24">
                    <!-- Modern Header -->
                    <div class="px-6 pt-8 pb-4 bg-white sticky top-16 z-20">
                        <div class="flex justify-between items-center mb-6">
                            <h1 class="text-3xl font-black text-slate-900 tracking-tight">My Page</h1>
                            <div class="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                <img src="${store.user.icon}" class="w-full h-full object-cover">
                            </div>
                        </div>
                        <!-- Tab Pills -->
                        <div class="flex p-1 bg-slate-100 rounded-full overflow-x-auto no-scrollbar">
                            ${tabs.map(t => `
                                <button onclick="Dashboard.User.switchTab('${t.id}')" id="utab-${t.id}"
                                    class="flex-1 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}">
                                    ${t.label}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div id="user-view-content" class="px-6 mt-4"></div>
                </div>
            `;
            Dashboard.User.switchTab(tab);
        },

        switchTab: (tabId) => {
            // Update Active State
            document.querySelectorAll('[id^="utab-"]').forEach(el => el.className = "flex-1 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap text-slate-500");
            document.getElementById(`utab-${tabId}`).className = "flex-1 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap bg-white text-slate-900 shadow-sm";

            const content = document.getElementById('user-view-content');
            
            if (tabId === 'tickets') {
                const tickets = store.tickets;
                if (tickets.length === 0) {
                    content.innerHTML = `
                        <div class="flex flex-col items-center justify-center py-20">
                            <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <span class="material-icons-outlined text-4xl text-slate-300">confirmation_number</span>
                            </div>
                            <h3 class="text-xl font-bold text-slate-800 mb-2">No Tickets Yet</h3>
                            <p class="text-slate-500 text-center mb-8 px-8">Your ticket wallet is empty. Find your next experience.</p>
                            <button onclick="router('home')" class="px-8 py-4 bg-slate-900 text-white rounded-full font-bold shadow-xl shadow-slate-900/20 transform hover:-translate-y-1 transition">
                                Explore Events
                            </button>
                        </div>
                    `;
                } else {
                    content.innerHTML = `
                        <div class="space-y-6">
                            ${tickets.map(t => `
                                <div class="group relative w-full aspect-[4/2] md:aspect-[3/1] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20 transform transition hover:-translate-y-1 cursor-pointer" onclick="showQR('${t.qrCode}')">
                                    <!-- Background Image -->
                                    <img src="${store.events.find(e => e.event_id === t.eventId)?.cover_image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'}" 
                                        class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-700">
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                                    
                                    <!-- Ticket Content -->
                                    <div class="absolute inset-0 p-6 flex flex-col justify-between text-white">
                                        <div class="flex justify-between items-start">
                                            <span class="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-[10px] font-bold tracking-widest border border-white/10 uppercase">
                                                Confirmed
                                            </span>
                                            <span class="material-icons-outlined opacity-50">qr_code_2</span>
                                        </div>
                                        
                                        <div>
                                            <h3 class="text-2xl md:text-3xl font-black leading-tight mb-1 text-shadow">${t.title}</h3>
                                            <div class="flex items-center text-sm font-medium opacity-90">
                                                <span class="material-icons-outlined text-sm mr-1">event</span>
                                                ${new Date(t.purchaseDate).toLocaleDateString()}
                                                <span class="mx-2">•</span>
                                                ${t.ticketName} <span class="bg-white/20 px-1.5 py-0.5 rounded ml-2 text-xs">x${t.count}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Shine Effect -->
                                    <div class="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000"></div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }
            } else if (tabId === 'profile') {
                const u = store.user;
                content.innerHTML = `
                    <div class="bg-slate-50 p-6 rounded-3xl mb-6">
                        <div class="flex items-center gap-4 mb-6">
                            <img src="${u.icon}" class="w-16 h-16 rounded-full border-2 border-white shadow-md">
                            <div>
                                <h3 class="font-bold text-lg text-slate-800">${u.name}</h3>
                                <p class="text-slate-500 text-sm">${u.email}</p>
                            </div>
                        </div>
                        <div class="space-y-3">
                            <div class="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-100">
                                <span class="text-sm font-bold text-slate-600">Account Status</span>
                                <span class="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">${u.kycStatus || 'Unverified'}</span>
                            </div>
                            <button onclick="logout()" class="w-full py-3 text-red-500 font-bold bg-white rounded-xl border border-red-100 hover:bg-red-50">
                                Sign Out
                            </button>
                        </div>
                    </div>
                `;
            } else {
                content.innerHTML = `<div class="py-12 text-center text-slate-400">Section coming soon...</div>`;
            }
        }
    },

    // ==========================================
    // 3. ADMIN CONTROL
    // ==========================================
    Admin: {
        init: (container, tab) => {
            // Simplified Admin view reusing Organizer layout structure but different content
            container.innerHTML = `
                <div class="p-8 bg-slate-900 min-h-screen text-white">
                    <h1 class="text-3xl font-bold mb-8 text-red-400 flex items-center"><span class="material-icons-outlined mr-3">security</span> Admin Console</h1>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                            <h3 class="font-bold mb-4 text-xl">System Management</h3>
                            <div class="space-y-4">
                                <div class="flex justify-between items-center p-4 bg-slate-700/50 rounded-xl">
                                    <span>Database Reset</span>
                                    <button onclick="if(confirm('Reset all data?')) { resetDatabase(); }" class="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">Reset DB</button>
                                </div>
                                <div class="flex justify-between items-center p-4 bg-slate-700/50 rounded-xl">
                                    <span>Platform Fee</span>
                                    <input type="number" value="5" class="w-16 bg-slate-900 border border-slate-600 rounded p-1 text-center text-white">
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                            <h3 class="font-bold mb-4 text-xl">Pending Approvals</h3>
                            ${store.user.kycStatus === 'pending' ? `
                                <div class="p-4 bg-slate-700/50 rounded-xl flex justify-between items-center">
                                    <div>
                                        <p class="font-bold">User KYC Request</p>
                                        <p class="text-xs text-slate-400">ID: u-demo-001</p>
                                    </div>
                                    <button onclick="Dashboard.Admin.approveKYC()" class="px-3 py-1 bg-green-600 rounded text-sm font-bold">Approve</button>
                                </div>
                            ` : '<p class="text-slate-500">No pending requests.</p>'}
                        </div>
                    </div>
                    
                    <div class="mt-8">
                        <button onclick="router('home')" class="text-slate-400 hover:text-white flex items-center font-bold">
                            <span class="material-icons-outlined mr-2">arrow_back</span> Exit Admin Mode
                        </button>
                    </div>
                </div>
            `;
        },
        
        approveKYC: () => {
            const u = store.user;
            u.kycStatus = 'verified';
            store.user = u;
            alert('User Approved');
            renderAdmin(document.getElementById('app'));
        }
    }
};

// Global Exposure for Router
window.renderDashboard = (c, t) => Dashboard.render(c, 'user', t);
window.renderOrganizer = (c, t) => Dashboard.render(c, 'organizer', t);
window.renderAdmin = (c, t) => Dashboard.render(c, 'admin', t);

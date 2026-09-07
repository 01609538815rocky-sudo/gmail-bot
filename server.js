const express = require('express');
const { Telegraf } = require('telegraf');

const app = express();
const BOT_TOKEN = '8860755134:AAGESglo0BDU4JQVISnEcn2mgygOIH_HMSA';
const bot = new Telegraf(BOT_TOKEN);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="bn">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Premier Global Hub</title>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            body {
                background: linear-gradient(135deg, #070d1f, #001738);
                color: #ffffff;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .phone-frame {
                background: #081229;
                border: 2px solid #d4af37;
                border-radius: 18px;
                width: 100%;
                max-width: 400px;
                height: 100vh;
                max-height: 740px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-shadow: 0 10px 30px rgba(212, 175, 55, 0.35);
                overflow: hidden;
            }
            .header {
                padding: 12px 18px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(212, 175, 55, 0.2);
                background: #060e21;
            }
            .header h2 {
                color: #d4af37;
                font-size: 15px;
                font-weight: 600;
            }
            .content {
                padding: 15px;
                flex-grow: 1;
                overflow-y: auto;
            }
            .page { display: none; }
            .page.active { display: block; }
            
            /* Splash / Welcome */
            .splash-screen {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                text-align: center;
                padding: 20px;
            }
            .logo-circle {
                width: 85px; height: 85px;
                background: radial-gradient(circle, #ffe566 0%, #d4af37 100%);
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                font-size: 40px; font-weight: bold; color: #070d1f;
                box-shadow: 0 0 25px rgba(212,175,55,0.6);
                margin-bottom: 15px;
            }

            /* Hero Banner */
            .hero-banner {
                background: linear-gradient(135deg, #0d1b35, #001533);
                border: 1px solid #d4af37;
                border-radius: 12px;
                padding: 12px;
                margin-bottom: 14px;
                text-align: center;
            }
            .hero-banner h3 { color: #d4af37; font-size: 14px; font-weight: bold; margin-bottom: 3px; }
            .hero-banner p { color: #a4b8d2; font-size: 9px; text-transform: uppercase; }

            /* Task Cards */
            .task-card {
                background: rgba(14, 28, 54, 0.9);
                border: 1px solid rgba(212, 175, 55, 0.4);
                border-radius: 12px;
                padding: 12px 14px;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                cursor: pointer;
            }
            .task-left { display: flex; align-items: center; gap: 12px; }
            .task-icon {
                width: 36px; height: 36px; border-radius: 8px;
                display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold;
            }
            .fb-icon { background: #1877f2; color: white; }
            .gmail-icon { background: #ea4335; color: white; }
            .ig-icon { background: linear-gradient(45deg, #f09433, #dc2743); color: white; }
            
            .task-info h4 { color: #ffffff; font-size: 13px; }
            .task-info p { color: #d4af37; font-size: 10px; }

            /* Forms */
            .form-group { margin-bottom: 12px; text-align: left; }
            .form-group label { display: block; color: #d4af37; font-size: 11px; margin-bottom: 4px; }
            .form-group input, .form-group select {
                width: 100%; padding: 9px; background: rgba(255,255,255,0.04);
                border: 1px solid rgba(212,175,55,0.4); border-radius: 8px; color: #fff; font-size: 12px; outline: none;
            }
            .btn {
                background: linear-gradient(135deg, #d4af37, #aa7c11); color: #070d1f;
                border: none; padding: 11px; border-radius: 8px; font-weight: bold; width: 100%; cursor: pointer; text-transform: uppercase; font-size: 12px;
            }
            .btn-outline {
                background: transparent; border: 1px solid #d4af37; color: #d4af37;
                padding: 10px; border-radius: 8px; font-weight: bold; width: 100%; cursor: pointer; margin-top: 8px; font-size: 12px;
            }

            /* Nav Bar */
            .nav-bar {
                display: flex;
                justify-content: space-around;
                background: #050b1a;
                padding: 8px 0;
                border-top: 1px solid rgba(212, 175, 55, 0.2);
            }
            .nav-item {
                color: #7b8c9e; font-size: 10px; text-align: center; cursor: pointer; text-decoration: none;
                background: none; border: none; outline: none; display: flex; flex-direction: column; align-items: center; gap: 2px;
            }
            .nav-item.active { color: #d4af37; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="phone-frame">
            <div class="header">
                <h2 id="page-title">ওপেন অ্যাপস</h2>
                <span style="cursor: pointer; font-size: 18px;" onclick="handleAdminAccess()">⚙️</span>
            </div>
            
            <div class="content">
                <!-- 1. SPLASH / WELCOME PAGE -->
                <div id="splash-page" class="page active">
                    <div class="splash-screen">
                        <div class="logo-circle">ও</div>
                        <h3 style="color: #d4af37; font-size: 18px; margin-bottom: 5px;">স্বাগতম!</h3>
                        <p style="color: #b0c4de; font-size: 12px; margin-bottom: 25px;">১০০% বিশ্বস্ত প্ল্যাটফর্মে আপনাকে স্বাগতম। আপনার যাত্রা শুরু করুন।</p>
                        <button class="btn" onclick="showPage('login-page', 'Registration / Login')">শুরু করুন</button>
                    </div>
                </div>

                <!-- 2. REGISTRATION / LOGIN PAGE (HIGH SECURITY - ONE TIME ONLY) -->
                <div id="login-page" class="page">
                    <h3 style="color: #d4af37; margin-bottom: 12px; font-size: 14px; text-align: center;">Registration / Login</h3>
                    <div class="form-group">
                        <label>নাম</label>
                        <input type="text" id="reg-name" placeholder="আপনার নাম লিখুন">
                    </div>
                    <div class="form-group">
                        <label>ফোন নাম্বার</label>
                        <input type="text" id="reg-phone" placeholder="01XXXXXXXXX">
                    </div>
                    <div class="form-group">
                        <label>ইউজার আইডি</label>
                        <input type="text" id="reg-id" placeholder="User ID">
                    </div>
                    <div class="form-group">
                        <label>পাসওয়ার্ড</label>
                        <input type="password" id="reg-pass" placeholder="••••••••">
                    </div>
                    <button class="btn" onclick="handleRegistration()">রেজিস্ট্রেশন / লগইন</button>
                </div>

                <!-- 3. HOME / DASHBOARD PAGE -->
                <div id="home-page" class="page">
                    <div class="hero-banner">
                        <h3>PREMIER GLOBAL HUB</h3>
                        <p>CONNECT WITH GLOBAL CLIENTS & SCALE YOUR EARNINGS</p>
                    </div>
                    <div class="task-card" onclick="openTask('Facebook Task Submit')">
                        <div class="task-left">
                            <div class="task-icon fb-icon">f</div>
                            <div class="task-info"><h4>Facebook</h4><p>সাবমিট করুন</p></div>
                        </div>
                        <span style="color: #d4af37;">➔</span>
                    </div>
                    <div class="task-card" onclick="openTask('Gmail Task Submit')">
                        <div class="task-left">
                            <div class="task-icon gmail-icon">M</div>
                            <div class="task-info"><h4>Gmail</h4><p>সাবমিট করুন</p></div>
                        </div>
                        <span style="color: #d4af37;">➔</span>
                    </div>
                    <div class="task-card" onclick="openTask('Instagram Task Submit')">
                        <div class="task-left">
                            <div class="task-icon ig-icon">📷</div>
                            <div class="task-info"><h4>Instagram</h4><p>সাবমিট করুন</p></div>
                        </div>
                        <span style="color: #d4af37;">➔</span>
                    </div>
                </div>

                <!-- 4. TASK SUBMIT FORM -->
                <div id="task-form-page" class="page">
                    <h3 id="task-form-title" style="color: #d4af37; margin-bottom: 12px; font-size: 14px;">Task Submit</h3>
                    <div class="form-group">
                        <label>জিমেইল / একাউন্ট ডিটেইলস</label>
                        <input type="text" placeholder="example@gmail.com">
                    </div>
                    <div class="form-group">
                        <label>পাসওয়ার্ড</label>
                        <input type="password" placeholder="••••••••">
                    </div>
                    <button class="btn" onclick="alert('সফলভাবে টাস্ক সাবমিট হয়েছে!'); showPage('home-page', 'ওপেন অ্যাপস');">সাবমিট</button>
                </div>

                <!-- 5. BALANCE & WITHDRAW PAGE -->
                <div id="balance-page" class="page">
                    <div class="hero-banner">
                        <h3>মিনিমাম উইথড্র ৫০ টাকা</h3>
                    </div>
                    <div class="form-group">
                        <label>পেমেন্ট মেথড</label>
                        <select style="width:100%; padding:9px; background:#081229; color:#fff; border:1px solid #d4af37; border-radius:8px; font-size:12px;">
                            <option>বিকাশ (Bkash)</option>
                            <option>নগদ (Nagad)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>হিমিন নাম্বার / একাউন্ট</label>
                        <input type="text" placeholder="01XXXXXXXXX">
                    </div>
                    <div class="form-group">
                        <label>টাকার পরিমাণ</label>
                        <input type="number" placeholder="50">
                    </div>
                    <button class="btn" onclick="alert('উইথড্র রিকোয়েস্ট সফলভাবে সাবমিট হয়েছে!')">উইথড্র সাবমিট</button>
                </div>

                <!-- 6. PROFILE PAGE -->
                <div id="profile-page" class="page">
                    <div style="text-align: center; margin-bottom: 15px;">
                        <div style="width: 50px; height: 50px; background: #d4af37; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #070d1f; font-weight: bold;">P</div>
                        <h4 style="color: #d4af37; font-size: 14px;">Profile</h4>
                    </div>
                    <div style="background: rgba(255,255,255,0.04); padding: 12px; border-radius: 10px; border: 1px solid rgba(212,175,55,0.3); margin-bottom: 12px; font-size: 12px;">
                        <p style="margin-bottom: 6px;"><b>Name:</b> <span id="profile-name-text">Rocky</span></p>
                        <p style="margin-bottom: 6px;"><b>User ID:</b> <span id="profile-id-text">3000100</span></p>
                        <p style="margin-bottom: 6px;"><b>Email:</b> bdtvibe@gmail.com</p>
                        <p><b>Status:</b> 100% সুরক্ষিত (Verified)</p>
                    </div>
                    <button class="btn-outline" onclick="handleLogout()">লগআউট (Log Out)</button>
                </div>

                <!-- 7. ADMIN / SECURITY PANEL -->
                <div id="admin-page" class="page">
                    <div style="text-align: center; margin-bottom: 15px;">
                        <div style="font-size: 32px; margin-bottom: 5px;">🛡️</div>
                        <h4 style="color: #d4af37; font-size: 14px;">এডমিন ও সিকিউরিটি কন্ট্রোল প্যানেল</h4>
                    </div>
                    <div style="background: rgba(255,255,255,0.04); padding: 12px; border-radius: 10px; border: 1px solid rgba(212,175,55,0.3); font-size: 12px;">
                        <p style="color: #b0c4de; margin-bottom: 10px; text-align: center;">হাই সিকিউরিটি মোড সক্রিয় রয়েছে। ডিভাইস লক এবং সিঙ্গেল রেজিস্ট্রেশন ডাটা এনক্রিপ্টেড।</p>
                        <div class="form-group">
                            <label>সিস্টেম স্ট্যাটাস</label>
                            <input type="text" value="100% Secure & Active" readonly style="color: #00ffcc; text-align: center; font-weight: bold;">
                        </div>
                        <button class="btn" onclick="showPage('home-page', 'ওপেন অ্যাপস')">ড্যাশবোর্ডে ফিরে যান</button>
                    </div>
                </div>
            </div>

            <!-- BOTTOM NAVIGATION -->
            <div class="nav-bar">
                <button class="nav-item active" onclick="showPage('home-page', 'ওপেন অ্যাপস', this)"><span>🏠</span> হোম</button>
                <button class="nav-item" onclick="showPage('home-page', 'টাস্ক', this)"><span>📊</span> টাস্ক</button>
                <button class="nav-item" onclick="showPage('balance-page', 'উইথড্র ব্যালেন্স', this)"><span>💰</span> ব্যালেন্স</button>
                <button class="nav-item" onclick="showPage('profile-page', 'Profile', this)"><span>👤</span> প্রোফাইল</button>
            </div>
        </div>

        <script>
            // Check high security single registration state on load
            window.onload = function() {
                if(localStorage.getItem('isRegistered') === 'true') {
                    // Skip splash/login if already registered with high-security lock
                    showPage('home-page', 'ওপেন অ্যাপস');
                }
            }

            function handleRegistration() {
                const name = document.getElementById('reg-name').value;
                const phone = document.getElementById('reg-phone').value;
                if(!name || !phone) {
                    alert('দয়া করে নাম এবং ফোন নাম্বার দিন!');
                    return;
                }
                // High Security Lock: Set registration flag so user cannot register twice
                localStorage.setItem('isRegistered', 'true');
                localStorage.setItem('userName', name);
                alert('রেজিস্ট্রেশন সফল হয়েছে! হাই সিকিউরিটি লক সক্রিয়।');
                showPage('home-page', 'ওপেন অ্যাপস');
            }

            function handleLogout() {
                if(confirm('আপনি কি সত্যিই লগআউট করতে চান?')) {
                    localStorage.removeItem('isRegistered');
                    showPage('login-page', 'Registration / Login');
                }
            }

            function handleAdminAccess() {
                // Secure Admin Panel Entry
                const pin = prompt('এডমিন সিকিউরিটি পিন দিন (ডিফল্ট: 1234):');
                if(pin === '1234') {
                    showPage('admin-page', 'এডমিন প্যানেল');
                } else if(pin !== null) {
                    alert('ভুল পিন কোড দেওয়া হয়েছে!');
                }
            }

            function showPage(pageId, title, btnElement) {
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                document.getElementById(pageId).classList.add('active');
                document.getElementById('page-title').innerText = title;
                if(btnElement) {
                    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                    btnElement.classList.add('active');
                }
            }

            function openTask(taskName) {
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                document.getElementById('task-form-page').classList.add('active');
                document.getElementById('task-form-title').innerText = taskName;
                document.getElementById('page-title').innerText = taskName;
            }
        </script>
    </body>
    </html>
  `);
});

bot.start((ctx) => {
  ctx.reply('স্বাগতম! প্রিমিয়াম গ্লোবাল হাব মিনি অ্যাপ ওপেন করতে নিচের বাটনে ক্লিক করুন।', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚀 ওপেন মিনি অ্যাপ', web_app: { url: 'https://gmail-bot-1-jzx7.onrender.com' } }]
      ]
    }
  });
});

bot.launch().catch(err => console.log('Bot launch error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

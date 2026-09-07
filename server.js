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
                max-height: 700px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-shadow: 0 10px 30px rgba(212, 175, 55, 0.25);
                overflow: hidden;
            }
            .header {
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(212, 175, 55, 0.2);
                background: #060e21;
            }
            .header h2 {
                color: #d4af37;
                font-size: 16px;
                font-weight: 600;
            }
            .content {
                padding: 16px;
                flex-grow: 1;
                overflow-y: auto;
            }
            .page { display: none; }
            .page.active { display: block; }
            
            .hero-banner {
                background: linear-gradient(135deg, #0d1b35, #001533);
                border: 1px solid #d4af37;
                border-radius: 12px;
                padding: 15px;
                margin-bottom: 16px;
                text-align: center;
            }
            .hero-banner h3 {
                color: #d4af37;
                font-size: 15px;
                font-weight: bold;
                margin-bottom: 4px;
            }
            .hero-banner p {
                color: #a4b8d2;
                font-size: 10px;
                text-transform: uppercase;
            }
            .task-card {
                background: rgba(14, 28, 54, 0.9);
                border: 1px solid rgba(212, 175, 55, 0.4);
                border-radius: 12px;
                padding: 14px 16px;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                cursor: pointer;
            }
            .task-left {
                display: flex;
                align-items: center;
                gap: 14px;
            }
            .task-icon {
                width: 36px;
                height: 36px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                font-weight: bold;
            }
            .fb-icon { background: #1877f2; color: white; }
            .gmail-icon { background: #ea4335; color: white; }
            .ig-icon { background: linear-gradient(45deg, #f09433, #dc2743); color: white; }
            
            .task-info h4 { color: #ffffff; font-size: 14px; }
            .task-info p { color: #d4af37; font-size: 11px; }

            /* Form Styles */
            .form-group { margin-bottom: 15px; text-align: left; }
            .form-group label { display: block; color: #d4af37; font-size: 12px; margin-bottom: 5px; }
            .form-group input, .form-group select {
                width: 100%; padding: 10px; background: rgba(255,255,255,0.05);
                border: 1px solid rgba(212,175,55,0.4); border-radius: 8px; color: #fff; font-size: 13px; outline: none;
            }
            .btn {
                background: linear-gradient(135deg, #d4af37, #aa7c11); color: #070d1f;
                border: none; padding: 12px; border-radius: 8px; font-weight: bold; width: 100%; cursor: pointer; text-transform: uppercase;
            }

            .nav-bar {
                display: flex;
                justify-content: space-around;
                background: #050b1a;
                padding: 10px 0;
                border-top: 1px solid rgba(212, 175, 55, 0.2);
            }
            .nav-item {
                color: #7b8c9e; font-size: 11px; text-align: center; cursor: pointer; text-decoration: none;
                background: none; border: none; outline: none; display: flex; flex-direction: column; align-items: center; gap: 3px;
            }
            .nav-item.active { color: #d4af37; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="phone-frame">
            <div class="header">
                <h2 id="page-title">ওপেন অ্যাপস</h2>
                <span>⚙️</span>
            </div>
            
            <div class="content">
                <!-- HOME PAGE -->
                <div id="home-page" class="page active">
                    <div class="hero-banner">
                        <h3>PREMIER GLOBAL HUB</h3>
                        <p>CONNECT WITH GLOBAL CLIENTS & SCALE YOUR EARNINGS</p>
                    </div>
                    <div class="task-card" onclick="openPage('task-page', 'Facebook Submit')">
                        <div class="task-left">
                            <div class="task-icon fb-icon">f</div>
                            <div class="task-info"><h4>Facebook</h4><p>সাবমিট করুন</p></div>
                        </div>
                        <span style="color: #d4af37;">➔</span>
                    </div>
                    <div class="task-card" onclick="openPage('task-page', 'Gmail Submit')">
                        <div class="task-left">
                            <div class="task-icon gmail-icon">M</div>
                            <div class="task-info"><h4>Gmail</h4><p>সাবমিট করুন</p></div>
                        </div>
                        <span style="color: #d4af37;">➔</span>
                    </div>
                    <div class="task-card" onclick="openPage('task-page', 'Instagram Submit')">
                        <div class="task-left">
                            <div class="task-icon ig-icon">📷</div>
                            <div class="task-info"><h4>Instagram</h4><p>সাবমিট করুন</p></div>
                        </div>
                        <span style="color: #d4af37;">➔</span>
                    </div>
                </div>

                <!-- TASK SUBMIT PAGE -->
                <div id="task-page" class="page">
                    <h3 id="task-heading" style="color: #d4af37; margin-bottom: 15px; font-size: 15px;">Gmail Submit</h3>
                    <div class="form-group">
                        <label>জিমেইল একাউন্ট</label>
                        <input type="text" placeholder="example@gmail.com">
                    </div>
                    <div class="form-group">
                        <label>পাসওয়ার্ড</label>
                        <input type="password" placeholder="••••••••">
                    </div>
                    <button class="btn" onclick="alert('সফলভাবে সাবমিট হয়েছে!')">সাবমিট করুন</button>
                </div>

                <!-- BALANCE / WITHDRAW PAGE -->
                <div id="balance-page" class="page">
                    <div class="hero-banner">
                        <h3>মিনিমাম উইথড্র ৫০ টাকা</h3>
                    </div>
                    <div class="form-group">
                        <label>পেমেন্ট মেথড</label>
                        <select style="width:100%; padding:10px; background:#081229; color:#fff; border:1px solid #d4af37; border-radius:8px;">
                            <option>বিকাশ</option>
                            <option>নগদ</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>একাউন্ট নাম্বার</label>
                        <input type="text" placeholder="01XXXXXXXXX">
                    </div>
                    <div class="form-group">
                        <label>টাকার পরিমাণ</label>
                        <input type="number" placeholder="50">
                    </div>
                    <button class="btn" onclick="alert('উইথড্র রিকোয়েস্ট সফল হয়েছে!')">উইথড্র রিকোয়েস্ট পাঠান</button>
                </div>

                <!-- PROFILE PAGE -->
                <div id="profile-page" class="page">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="width: 60px; height: 60px; background: #d4af37; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #070d1f; font-weight: bold;">P</div>
                        <h4 style="color: #d4af37;">User Profile</h4>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; border: 1px solid rgba(212,175,55,0.3);">
                        <p style="margin-bottom: 8px; font-size: 13px;"><b>Name:</b> Rocky</p>
                        <p style="margin-bottom: 8px; font-size: 13px;"><b>Balance:</b> 0.00 BDT</p>
                        <p style="font-size: 13px;"><b>Status:</b> Active 100%</p>
                    </div>
                </div>
            </div>

            <div class="nav-bar">
                <button class="nav-item active" onclick="switchTab('home-page', this, 'ওপেন অ্যাপস')"><span>🏠</span> হোম</button>
                <button class="nav-item" onclick="switchTab('task-page', this, 'টাস্ক সাবমিট')"><span>📊</span> টাস্ক</button>
                <button class="nav-item" onclick="switchTab('balance-page', this, 'ব্যালেন্স ও উইথড্র')"><span>💰</span> ব্যালেন্স</button>
                <button class="nav-item" onclick="switchTab('profile-page', this, 'প্রোফাইল')"><span>👤</span> প্রোফাইল</button>
            </div>
        </div>

        <script>
            function switchTab(pageId, element, title) {
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                document.getElementById(pageId).classList.add('active');
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                element.classList.add('active');
                document.getElementById('page-title').innerText = title;
            }
            function openPage(pageId, taskName) {
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                document.getElementById(pageId).classList.add('active');
                document.getElementById('task-heading').innerText = taskName;
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

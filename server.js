const express = require('express');
const { Telegraf } = require('telegraf');

const app = express();
const BOT_TOKEN = '8860755134:AAGESglo0BDU4JQVISnEcn2mgygOIH_HMSA';
const bot = new Telegraf(BOT_TOKEN);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// প্রিমিয়াম মাল্টি-পেজ ব্লু-গোল্ড মিনি অ্যাপ ইন্টারফেস
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
                background: linear-gradient(135deg, #0a1128, #001f54);
                color: #ffffff;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 10px;
            }
            .phone-frame {
                background: #0a192f;
                border: 3px solid #d4af37;
                border-radius: 24px;
                width: 100%;
                max-width: 380px;
                min-height: 620px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);
                overflow: hidden;
            }
            .header {
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(212, 175, 55, 0.2);
            }
            .header h2 {
                color: #d4af37;
                font-size: 18px;
                text-transform: uppercase;
            }
            .content {
                padding: 20px;
                flex-grow: 1;
                overflow-y: auto;
            }
            .banner {
                background: linear-gradient(135deg, #102a45, #001f54);
                border: 1px solid #d4af37;
                border-radius: 12px;
                padding: 15px;
                margin-bottom: 20px;
                text-align: center;
            }
            .banner h3 {
                color: #d4af37;
                font-size: 16px;
                margin-bottom: 5px;
            }
            .banner p {
                color: #b0c4de;
                font-size: 12px;
            }
            .task-card {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(212, 175, 55, 0.4);
                border-radius: 12px;
                padding: 15px;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                cursor: pointer;
                transition: 0.3s;
            }
            .task-card:hover {
                border-color: #d4af37;
                background: rgba(212, 175, 55, 0.1);
            }
            .task-info h4 {
                color: #d4af37;
                font-size: 15px;
            }
            .task-info p {
                color: #b0c4de;
                font-size: 12px;
            }
            .nav-bar {
                display: flex;
                justify-content: space-around;
                background: #060d1f;
                padding: 12px 0;
                border-top: 1px solid rgba(212, 175, 55, 0.2);
            }
            .nav-item {
                color: #b0c4de;
                font-size: 11px;
                text-align: center;
                cursor: pointer;
                text-decoration: none;
            }
            .nav-item.active {
                color: #d4af37;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="phone-frame">
            <div class="header">
                <h2>ওপেন অ্যাপস</h2>
                <span>⚙️</span>
            </div>
            
            <div class="content">
                <div class="banner">
                    <h3>PREMIER GLOBAL HUB</h3>
                    <p>CONNECT WITH GLOBAL CLIENTS & SCALE YOUR EARNINGS</p>
                </div>

                <div class="task-card" onclick="alert('Facebook Task Selected')">
                    <div class="task-info">
                        <h4>Facebook</h4>
                        <p>সাবমিট করুন</p>
                    </div>
                    <span>📘</span>
                </div>

                <div class="task-card" onclick="alert('Gmail Task Selected')">
                    <div class="task-info">
                        <h4>Gmail</h4>
                        <p>সাবমিট করুন</p>
                    </div>
                    <span>📧</span>
                </div>

                <div class="task-card" onclick="alert('Instagram Task Selected')">
                    <div class="task-info">
                        <h4>Instagram</h4>
                        <p>সাবমিট করুন</p>
                    </div>
                    <span>📸</span>
                </div>
            </div>

            <div class="nav-bar">
                <a href="#" class="nav-item active">🏠 হোম</a>
                <a href="#" class="nav-item">📊 টাস্ক</a>
                <a href="#" class="nav-item">💰 ব্যালেন্স</a>
                <a href="#" class="nav-item">👤 প্রোফাইল</a>
            </div>
        </div>
    </body>
    </html>
  `);
});

bot.start((ctx) => {
  ctx.reply('স্বাগতম! প্রিমিয়াম গ্লোবাল হাব মিনি অ্যাপে প্রবেশ করতে নিচের বাটনে ক্লিক করুন।', {
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

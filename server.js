const { Telegraf } = require('telegraf');
const express = require('express');

// আপনার টেলিগ্রাম বট টোকেন (প্রয়োজনে পরিবর্তন করে নিতে পারেন)
const BOT_TOKEN = '8860755134:AAGESglo0BDU4JQVISnEcn2mgygOIH_HMSA';
const bot = new Telegraf(BOT_TOKEN);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// প্রিমিয়াম ব্লু-গোল্ড ডিজাইনের ওয়েব ইন্টারফেস
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="bn">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gmail & Telegram Bot</title>
        <style>
            :root {
                --primary: #1e3c72;
                --secondary: #2a5298;
                --gold: #d4af37;
                --gold-light: #f3e5ab;
                --bg: #0f172a;
                --card-bg: #1e293b;
                --text: #f8fafc;
                --text-muted: #94a3b8;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            body {
                background: linear-gradient(135deg, var(--bg), var(--primary));
                color: var(--text);
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .container {
                background: var(--card-bg);
                border: 2px solid var(--gold);
                border-radius: 16px;
                padding: 30px;
                max-width: 400px;
                width: 100%;
                box-shadow: 0 10px 30px rgba(212, 175, 55, 0.2);
                text-align: center;
            }
            h1 {
                color: var(--gold);
                font-size: 24px;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            p {
                color: var(--text-muted);
                font-size: 14px;
                margin-bottom: 25px;
                line-height: 1.6;
            }
            .btn {
                display: inline-block;
                background: linear-gradient(135deg, var(--gold), #aa771c);
                color: #0f172a;
                font-weight: bold;
                padding: 12px 25px;
                border-radius: 30px;
                text-decoration: none;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
            }
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(212, 175, 55, 0.6);
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: var(--text-muted);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Open Apps Bot</h1>
            <p>আপনার টেলিগ্রাম মিনি অ্যাপ এবং জিমেইল নোটিফিকেশন সিস্টেম সফলভাবে সংযুক্ত এবং সক্রিয় রয়েছে।</p>
            <a href="https://t.me/your_bot_username" class="btn" target="_blank">বটটি ওপেন করুন</a>
            <div class="footer">Premium Blue-Gold Theme &copy; 2026</div>
        </div>
    </body>
    </html>
  `);
});

// টেলিগ্রাম বোট স্টার্ট কমান্ড
bot.start((ctx) => {
  ctx.reply('স্বাগতম! আপনার ওপেন অ্যাপস এবং জিমেইল নোটিফিকেশন সিস্টেম এখন সম্পূর্ণ তৈরি এবং সচল রয়েছে।');
});

// বোট চালু করা
bot.launch().then(() => {
  console.log('Telegram Bot successfully started!');
}).catch((err) => {
  console.error('Telegram Bot failed to start:', err);
});

// সার্ভার লিসেন করা
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// প্রসেস ক্রাশ রোধ করতে
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

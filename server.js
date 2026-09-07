const express = require('express');
const { Telegraf } = require('telegraf');

const app = express();

// আপনার সঠিক টেলিগ্রাম বট টোকেন এখানে দেওয়া হলো
const BOT_TOKEN = '8860755134:AAGESglo0BDU4JQVISnEcn2mgygOIH_HMSA';
const bot = new Telegraf(BOT_TOKEN);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// মিনি অ্যাপের প্রিমিয়াম ব্লু-গোল্ড থিম ডিজাইন (HTML/CSS)
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="bn">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gmail Sell & Task</title>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            body {
                background: linear-gradient(135deg, #0a1128, #001f54);
                color: #ffffff;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            .container {
                background: rgba(10, 25, 47, 0.85);
                border: 2px solid #d4af37;
                border-radius: 16px;
                padding: 30px;
                width: 100%;
                max-width: 400px;
                box-shadow: 0 8px 32px rgba(212, 175, 55, 0.2);
                text-align: center;
            }
            h1 {
                color: #d4af37;
                font-size: 24px;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            p {
                color: #b0c4de;
                font-size: 14px;
                line-height: 1.6;
                margin-bottom: 25px;
            }
            .form-group {
                margin-bottom: 20px;
                text-align: left;
            }
            label {
                display: block;
                color: #d4af37;
                font-size: 13px;
                margin-bottom: 8px;
            }
            input {
                width: 100%;
                padding: 12px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(212, 175, 55, 0.4);
                border-radius: 8px;
                color: #fff;
                font-size: 14px;
                outline: none;
                transition: border-color 0.3s;
            }
            input:focus {
                border-color: #d4af37;
            }
            .btn {
                background: linear-gradient(135deg, #d4af37, #aa7c11);
                color: #0a1128;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 15px;
                font-weight: bold;
                width: 100%;
                cursor: pointer;
                transition: opacity 0.3s;
                text-transform: uppercase;
            }
            .btn:hover {
                opacity: 0.9;
            }
            .footer {
                margin-top: 20px;
                font-size: 11px;
                color: #6c757d;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Gmail Sell & Task</h1>
            <p>আপনার জিমেইল বা টাস্ক সাবমিট করতে নিচের ফর্মটি পূরণ করুন।</p>
            
            <div class="form-group">
                <label for="email">জিমেইল একাউন্ট:</label>
                <input type="email" id="email" placeholder="example@gmail.com">
            </div>
            
            <div class="form-group">
                <label for="password">পাসওয়ার্ড:</label>
                <input type="password" id="password" placeholder="••••••••">
            </div>

            <button class="btn" onclick="submitTask()">টাস্ক সাবমিট করুন</button>
            
            <div class="footer">Premium Blue-Gold Theme © 2026</div>
        </div>

        <script>
            function submitTask() {
                const email = document.getElementById('email',).value;
                const password = document.getElementById('password').value;
                if(!email || !password) {
                    alert('দয়া করে সব ফিল্ড পূরণ করুন!');
                    return;
                }
                alert('সফলভাবে সাবমিট হয়েছে!');
            }
        </script>
    </body>
    </html>
  `);
});

// টেলিগ্রাম বট স্টার্ট কমান্ড এবং মিনি অ্যাপ লিংক সেটআপ
bot.start((ctx) => {
  ctx.reply('স্বাগতম! নিচের মিনি অ্যাপ ওপেন করে আপনার টাস্ক বা জিমেইল সাবমিট করুন।', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚀 ওপেন মিনি অ্যাপ', web_app: { url: 'https://gmail-bot-1-jzx7.onrender.com' } }]
      ]
    }
  });
});

// বট চালু করা (এরর হ্যান্ডলিং সহ যাতে ক্র্যাশ না করে)
bot.launch().catch(err => console.log('Bot launch error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

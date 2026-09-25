const express = require('express');
const { Telegraf } = require('telegraf');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN_HERE';
const bot = new Telegraf(BOT_TOKEN);

let tasksQueue = [];
let withdrawQueue = [];
let taskRates = { "Gmail": 5, "Facebook": 4, "Data Entry": 10, "JobPost": 8 };

bot.start((ctx) => ctx.reply('💎 BD Freelance Hub Bot Active'));

// ইউজার অ্যাপের সাবমিশন এন্ডপয়েন্ট
app.post('/api/submit', (req, res) => {
    const data = req.body;
    if (!data.uid || !data.action) return res.status(400).json({ status: 'error', message: 'Invalid data' });
    
    if (data.action === 'withdraw') {
        withdrawQueue.push({ id: Date.now(), ...data, status: 'Pending' });
    } else if (data.action === 'task_submission') {
        tasksQueue.push({ id: Date.now(), ...data, status: 'Pending' });
    }
    res.json({ status: 'success', message: 'Submitted successfully' });
});

// রেট দেখার এন্ডপয়েন্ট
app.get('/api/rates', (req, res) => {
    res.json(taskRates);
});

// পাসওয়ার্ড চেক করার এন্ডপয়েন্ট
app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === '102050') {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'ভুল পাসওয়ার্ড!' });
    }
});

// সমস্ত ডাটা এক্সেস করার এন্ডপয়েন্ট
app.get('/admin/data', (req, res) => {
    res.json({ tasks: tasksQueue, withdraws: withdrawQueue, rates: taskRates });
});

// টাস্ক বা উইথড্র স্ট্যাটাস আপডেট
app.post('/admin/update-task', (req, res) => {
    let t = tasksQueue.find(x => x.id === req.body.id);
    if(t) t.status = req.body.status;
    res.json({ success: true });
});

app.post('/admin/update-withdraw', (req, res) => {
    let w = withdrawQueue.find(x => x.id === req.body.id);
    if(w) w.status = req.body.status;
    res.json({ success: true });
});

// কাজের রেট আপডেট করার এন্ডপয়েন্ট
app.post('/admin/update-rate', (req, res) => {
    const { taskType, newRate } = req.body;
    if (taskRates[taskType] !== undefined) {
        taskRates[taskType] = parseFloat(newRate);
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// মূল অ্যাডমিন প্যানেল ও মিনি অ্যাপ ইন্টারফেস
app.get('/admin', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BD Freelance Hub - Admin Panel</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <style>
        body { background: #0f172a; color: #f8fafc; font-family: sans-serif; margin: 0; padding: 0; }
        .login-box { max-width: 320px; margin: 100px auto; background: #1e293b; padding: 25px; border-radius: 12px; border: 1px solid #334155; text-align: center; }
        .login-box h3 { color: #f59e0b; margin-top: 0; }
        input[type="password"] { width: 85%; padding: 12px; margin: 15px 0; background: #0f172a; border: 1px solid #334155; color: white; border-radius: 8px; font-size: 16px; text-align: center; outline: none; -webkit-text-security: disc; }
        .login-btn { background: #f59e0b; color: #0f172a; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 92%; }
        
        .header { background: #1e293b; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; position: sticky; top: 0; z-index: 10; }
        .title { font-size: 16px; font-weight: bold; color: #f59e0b; display: flex; align-items: center; gap: 8px; }
        .menu-btn { background: none; border: none; color: #fff; font-size: 22px; cursor: pointer; }
        
        .dropdown { display: none; position: absolute; right: 15px; top: 55px; background: #1e293b; border: 1px solid #334155; border-radius: 8px; box-shadow: 0 8px 20px rgba(0,0,0,0.5); z-index: 20; min-width: 160px; }
        .dropdown a { display: block; padding: 12px 16px; color: #f8fafc; text-decoration: none; font-size: 13px; border-bottom: 1px solid #334155; }
        .dropdown a:hover { background: #334155; }
        
        .container { padding: 15px; }
        .card { background: #1e293b; padding: 15px; border-radius: 10px; margin-bottom: 15px; border: 1px solid #334155; }
        h3 { color: #f59e0b; font-size: 14px; margin-top: 0; }
        .item-box { background: #0f172a; padding: 10px; margin-bottom: 8px; border-radius: 6px; border: 1px solid #334155; font-size: 12px; }
        button.action-btn { border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; color: #fff; margin-right: 4px; }
    </style>
</head>
<body>
    <div id="login-screen" class="login-box">
        <h3>🔐 অ্যাডমিন পাসওয়ার্ড দিন</h3>
        <input type="password" id="admin-pass" placeholder="••••••••">
        <br>
        <button class="login-btn" onclick="checkPassword()">লগইন করুন</button>
    </div>

    <div id="admin-panel" style="display:none;">
        <div class="header">
            <div class="title">🛡️ BD Freelance Hub Admin</div>
            <button class="menu-btn" onclick="toggleMenu()">⋮</button>
            <div id="dropdown-menu" class="dropdown">
                <a href="#" onclick="location.reload()">🔄 রিফ্রেশ করুন</a>
                <a href="#" onclick="alert('BD Freelance Hub Admin Panel v1.0')">⚙️ এডমিন প্যানেল অপশন</a>
                <a href="#" onclick="logout()" style="color: #ef4444;">🚪 লগআউট</a>
            </div>
        </div>

        <div class="container">
            <div class="card">
                <h3>⚙️ কাজের রেট ম্যানেজমেন্ট</h3>
                <div id="rates-container"></div>
                <div style="margin-top: 10px; display: flex; gap: 8px;">
                    <select id="rate-type" style="background:#0f172a; color:#fff; padding:6px; border:1px solid #334155; border-radius:4px;">
                        <option value="Gmail">Gmail</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Data Entry">Data Entry</option>
                        <option value="JobPost">JobPost</option>
                    </select>
                    <input type="number" id="rate-val" placeholder="নতুন রেট" style="background:#0f172a; color:#fff; padding:6px; width:70px; border:1px solid #334155; border-radius:4px;">
                    <button onclick="updateRate()" style="background:#10b981; color:#fff; border:none; padding:6px 10px; border-radius:4px; cursor:pointer;">পরিবর্তন</button>
                </div>
            </div>

            <div class="card">
                <h3>📋 টাস্ক রিকোয়েস্টসমূহ</h3>
                <div id="tasks-container"></div>
            </div>

            <div class="card">
                <h3>💰 উইথড্র রিকোয়েস্টসমূহ</h3>
                <div id="withdraw-container"></div>
            </div>
        </div>
    </div>

    <script>
        const tg = window.Telegram.WebApp;
        tg.expand();

        if(localStorage.getItem('admin_logged')) {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('admin-panel').style.display = 'block';
            loadData();
        }

        function checkPassword() {
            let password = document.getElementById('admin-pass').value;
            fetch('/admin/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({password})
            }).then(res => res.json()).then(data => {
                if(data.success) {
                    localStorage.setItem('admin_logged', 'true');
                    document.getElementById('login-screen').style.display = 'none';
                    document.getElementById('admin-panel').style.display = 'block';
                    loadData();
                } else {
                    alert(data.message);
                    document.getElementById('admin-pass').value = '';
                }
            });
        }

        function logout() {
            localStorage.removeItem('admin_logged');
            location.reload();
        }

        function loadData() {
            fetch('/admin/data')
            .then(res => res.json())
            .then(data => {
                let tHtml = data.tasks.map(t => \`
                    <div class="item-box">
                        <div id="t-\${t.id}"><b>টাইপ:</b> \${t.type} | <b>UID:</b> \${t.uid} | <b>নাম:</b> \${t.name}</div>
                        <div style="margin-top:6px;">
                            <button class="action-btn" style="background:#3b82f6;" onclick="navigator.clipboard.writeText(document.getElementById('t-\${t.id}').innerText); alert('কপি হয়েছে!');">📋 কপি</button>
                            <button class="action-btn" style="background:#10b981;" onclick="up('task', \${t.id}, 'Approved')">Approve</button>
                            <button class="action-btn" style="background:#ef4444;" onclick="up('task', \${t.id}, 'Rejected')">Reject</button>
                            <span>স্ট্যাটাস: <b>\${t.status}</b></span>
                        </div>
                    </div>\`).join('') || '<p style="color:#94a3b8; font-size:12px;">কোনো টাস্ক রিকোয়েস্ট নেই।</p>';
                
                let wHtml = data.withdraws.map(w => \`
                    <div class="item-box">
                        <div id="w-\${w.id}"><b>মেথড:</b> \${w.method} | <b>৳\${w.amount}</b> | <b>নম্বর:</b> \${w.phone} | <b>UID:</b> \${w.uid}</div>
                        <div style="margin-top:6px;">
                            <button class="action-btn" style="background:#3b82f6;" onclick="navigator.clipboard.writeText(document.getElementById('w-\${w.id}').innerText); alert('কপি হয়েছে!');">📋 কপি</button>
                            <button class="action-btn" style="background:#10b981;" onclick="up('withdraw', \${w.id}, 'Approved')">Approve</button>
                            <button class="action-btn" style="background:#ef4444;" onclick="up('withdraw', \${w.id}, 'Rejected')">Reject</button>
                            <span>স্ট্যাটাস: <b>\${w.status}</b></span>
                        </div>
                    </div>\`).join('') || '<p style="color:#94a3b8; font-size:12px;">কোনো উইথড্র রিকোয়েস্ট নেই।</p>';

                let ratesHtml = Object.keys(data.rates).map(k => \`<div style="display:flex; justify-content:space-between; padding:4px 0; font-size:13px;"><span>\${k}:</span><b>৳\${data.rates[k]}</b></div>\`).join('');

                document.getElementById('tasks-container').innerHTML = tHtml;
                document.getElementById('withdraw-container').innerHTML = wHtml;
                document.getElementById('rates-container').innerHTML = ratesHtml;
            });
        }

        function toggleMenu() {
            let menu = document.getElementById('dropdown-menu');
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        }

        window.onclick = function(event) {
            if (!event.target.matches('.menu-btn')) {
                let menu = document.getElementById('dropdown-menu');
                if (menu && menu.style.display === 'block') {
                    menu.style.display = 'none';
                }
            }
        }

        function up(type, id, status){
            fetch('/admin/update-'+type, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({id, status})
            }).then(() => loadData());
        }

        function updateRate() {
            let taskType = document.getElementById('rate-type').value;
            let newRate = document.getElementById('rate-val').value;
            if(!newRate) { alert('সঠিক রেট লিখুন!'); return; }
            fetch('/admin/update-rate', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ taskType, newRate })
            }).then(res => res.json()).then(data => {
                if(data.success) {
                    alert('রেট সফলভাবে আপডেট হয়েছে!');
                    document.getElementById('rate-val').value = '';
                    loadData();
                }
            });
        }
    </script>
</body>
</html>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

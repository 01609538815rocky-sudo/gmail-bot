const express = require('express');
const { Telegraf } = require('telegraf');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// আপনার টেলিগ্রাম বটের টোকেন এখানে বসান
const BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN_HERE';
const bot = new Telegraf(BOT_TOKEN);

// ডাটাবেস বা মেমোরি স্টোরেজ
let tasksQueue = [];
let withdrawQueue = [];

// কাজের রেট ম্যানেজমেন্ট
let taskRates = {
    "Gmail": 5,
    "Facebook": 4,
    "Data Entry": 10,
    "JobPost": 8
};

// টেলিগ্রাম বট স্টার্ট কমান্ড
bot.start((ctx) => {
    ctx.reply('💎 BD Freelance Hub অ্যাডমিন বট সক্রিয় আছে।');
});

// মিনি অ্যাপ থেকে ডাটা রিসিভ করার সিকিউরড এন্ডপয়েন্ট
app.post('/api/submit', (req, res) => {
    const data = req.body;
    
    if (!data.uid || !data.action) {
        return res.status(400).json({ status: 'error', message: 'Invalid data' });
    }

    if (data.action === 'withdraw') {
        withdrawQueue.push({ id: Date.now(), ...data, status: 'Pending' });
    } else if (data.action === 'task_submission') {
        tasksQueue.push({ id: Date.now(), ...data, status: 'Pending' });
    }

    res.json({ status: 'success', message: 'Data received successfully!' });
});

// মিনি অ্যাপের জন্য বর্তমান রেট প্রোভাইড করার API
app.get('/api/rates', (req, res) => {
    res.json(taskRates);
});

// অ্যাডমিন প্যানেল ড্যাশবোর্ড পেজ (HTML)
app.get('/admin', (req, res) => {
    let tasksHtml = tasksQueue.map(t => `
        <div style="background:#1e293b; padding:15px; margin-bottom:10px; border-radius:8px; border:1px solid #334155;">
            <p><b>কাজের ধরন:</b> ${t.type} | <b>UID:</b> ${t.uid} | <b>নাম:</b> ${t.name}</p>
            <p><b>স্ট্যাটাস:</b> <span style="color:${t.status==='Approved'?'#10b981':t.status==='Rejected'?'#ef4444':'#f59e0b'}">${t.status}</span></p>
            ${t.status === 'Pending' ? `
                <button onclick="updateTask(${t.id}, 'Approved')" style="background:#10b981; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Approve</button>
                <button onclick="updateTask(${t.id}, 'Rejected')" style="background:#ef4444; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; margin-left:10px;">Reject</button>
            ` : ''}
        </div>
    `).join('') || '<p>কোনো নতুন টাস্ক জমা হয়নি।</p>';

    let withdrawHtml = withdrawQueue.map(w => `
        <div style="background:#1e293b; padding:15px; margin-bottom:10px; border-radius:8px; border:1px solid #334155;">
            <p><b>মেথড:</b> ${w.method} | <b>এমাউন্ট:</b> ৳${w.amount} | <b>নম্বর:</b> ${w.phone}</p>
            <p><b>UID:</b> ${w.uid} | <b>নাম:</b> ${w.name}</p>
            <p><b>স্ট্যাটাস:</b> <span style="color:${w.status==='Approved'?'#10b981':w.status==='Rejected'?'#ef4444':'#f59e0b'}">${w.status}</span></p>
            ${w.status === 'Pending' ? `
                <button onclick="updateWithdraw(${w.id}, 'Approved')" style="background:#10b981; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Approve</button>
                <button onclick="updateWithdraw(${w.id}, 'Rejected')" style="background:#ef4444; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; margin-left:10px;">Reject</button>
            ` : ''}
        </div>
    `).join('') || '<p>কোনো উইথড্র রিকোয়েস্ট নেই।</p>';

    let ratesHtml = Object.keys(taskRates).map(key => `
        <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #334155;">
            <span>${key}:</span>
            <b>৳ ${taskRates[key]}</b>
        </div>
    `).join('');

    res.send(`
        <!DOCTYPE html>
        <html lang="bn">
        <head>
            <meta charset="UTF-8">
            <title>BD Freelance Hub - Admin Dashboard</title>
            <style>
                body { background: #0f172a; color: #f8fafc; font-family: sans-serif; padding: 20px; }
                h1, h2 { color: #f59e0b; }
                .section { background: #1e293b; padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #334155; }
            </style>
        </head>
        <body>
            <h1>🛡️ BD Freelance Hub Secure Admin Panel</h1>
            
            <div class="section">
                <h2>⚙️ কাজের রেট ম্যানেজমেন্ট</h2>
                ${ratesHtml}
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <select id="task-select" style="padding: 8px; background: #0f172a; color: white; border: 1px solid #334155; border-radius: 5px;">
                        <option value="Gmail">জিমেইল সেল</option>
                        <option value="Facebook">ফেসবুক জব</option>
                        <option value="Data Entry">ডাটা এন্ট্রি</option>
                        <option value="JobPost">জব পোস্ট</option>
                    </select>
                    <input type="number" id="new-rate-input" placeholder="নতুন রেট" style="padding: 8px; background: #0f172a; color: white; border: 1px solid #334155; border-radius: 5px;">
                    <button onclick="updateTaskRate()" style="background:#f59e0b; color:#0f172a; border:none; padding:8px 15px; border-radius:5px; font-weight:bold; cursor:pointer;">রেট আপডেট করুন</button>
                </div>
            </div>

            <div class="section">
                <h2>📋 টাস্ক রিকোয়েস্টসমূহ</h2>
                ${tasksHtml}
            </div>

            <div class="section">
                <h2>💰 উইথড্র রিকোয়েস্টসমূহ</h2>
                ${withdrawHtml}
            </div>

            <script>
                function updateTask(id, status) {
                    fetch('/admin/update-task', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id, status })
                    }).then(() => location.reload());
                }
                function updateWithdraw(id, status) {
                    fetch('/admin/update-withdraw', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id, status })
                    }).then(() => location.reload());
                }
                function updateTaskRate() {
                    let taskType = document.getElementById('task-select').value;
                    let newRate = document.getElementById('new-rate-input').value;
                    if(!newRate) { alert('সঠিক রেট লিখুন!'); return; }
                    fetch('/admin/update-rate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ taskType, newRate })
                    }).then(res => res.json()).then(data => { alert(data.message); location.reload(); });
                }
            </script>
        </body>
        </html>
    `);
});

// টাস্ক স্টータস আপডেট এন্ডপয়েন্ট
app.post('/admin/update-task', (req, res) => {
    const { id, status } = req.body;
    let task = tasksQueue.find(t => t.id === id);
    if (task) task.status = status;
    res.json({ success: true });
});

// উইথড্র স্ট্যাটাস আপডেট এন্ডপয়েন্ট
app.post('/admin/update-withdraw', (req, res) => {
    const { id, status } = req.body;
    let withdraw = withdrawQueue.find(w => w.id === id);
    if (withdraw) withdraw.status = status;
    res.json({ success: true });
});

// কাজের রেট আপডেট এন্ডপয়েন্ট
app.post('/admin/update-rate', (req, res) => {
    const { taskType, newRate } = req.body;
    if (taskRates[taskType] !== undefined) {
        taskRates[taskType] = parseFloat(newRate);
        res.json({ success: true, message: 'রেট সফলভাবে আপডেট করা হয়েছে!' });
    } else {
        res.status(400).json({ success: false, message: 'ক্যাটাগরি পাওয়া যায়নি' });
    }
});

// সার্ভার পোর্ট পোর্ট চালু করা
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Admin Panel server running on port ${PORT}`);
});

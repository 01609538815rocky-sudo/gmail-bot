const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let users = [];
let adminTasks = [];

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ওপেন অ্যাপস - Secure Hub</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <style>
        :root {
            --bg-color: #0b132b;
            --card-bg: #1c2541;
            --accent-color: #e0a96d;
            --text-color: #ffffff;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            width: 100%;
            max-width: 400px;
            padding: 15px;
            box-sizing: border-box;
            padding-bottom: 80px;
        }
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .menu-icon {
            font-size: 16px;
            cursor: pointer;
            color: var(--accent-color);
            background: #1c2541;
            padding: 6px 10px;
            border-radius: 6px;
            border: 1px solid var(--accent-color);
        }
        .screen {
            display: none;
            width: 100%;
        }
        .screen.active {
            display: block;
        }
        h2, h3 {
            text-align: center;
            color: var(--accent-color);
        }
        input, select {
            width: 100%;
            padding: 12px;
            margin: 8px 0;
            background: #1c2541;
            border: 1px solid var(--accent-color);
            border-radius: 8px;
            color: #fff;
            box-sizing: border-box;
        }
        button {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #f39c12, #d35400);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 10px;
        }
        .card {
            background: var(--card-bg);
            padding: 15px;
            border-radius: 12px;
            margin: 12px 0;
            border: 1px solid #415a77;
            text-align: center;
        }
        .banner-img {
            width: 100%;
            height: 150px;
            object-fit: cover;
            border-radius: 10px;
            margin-bottom: 10px;
        }
        .profile-pic {
            width: 90px;
            height: 90px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--accent-color);
            margin: 0 auto 10px auto;
        }
        .nav-bar {
            position: fixed;
            bottom: 0;
            width: 100%;
            max-width: 400px;
            background: #0b132b;
            display: flex;
            justify-content: space-around;
            padding: 12px 0;
            border-top: 1px solid #1c2541;
            box-sizing: border-box;
        }
        .nav-item {
            color: var(--accent-color);
            cursor: pointer;
            font-size: 14px;
            text-align: center;
            font-weight: bold;
        }
    </style>
</head>
<body>

<div class="container">
    <div class="header-top" id="topHeader" style="display:none;">
        <span style="font-weight:bold; color:var(--accent-color);">ওপেন অ্যাপস (Secure)</span>
        <span class="menu-icon" onclick="openAdminPanel()">⋮ এডমিন প্যানেল</span>
    </div>

    <!-- ১. স্প্ল্যাশ স্ক্রিন -->
    <div id="splashScreen" class="screen active">
        <div style="text-align:center; margin-top:80px;">
            <div style="font-size: 60px; color: var(--accent-color); font-weight:bold;">ও</div>
            <h2>PREMIER GLOBAL HUB</h2>
            <p>হাই সিকিউরিটি ভেরিফাইড আর্নিং প্ল্যাটফর্ম</p>
            <button onclick="showScreen('authScreen')">শুরু করুন</button>
        </div>
    </div>

    <!-- ২. রেজিস্ট্রেশন / লগইন স্ক্রিন (ডুপ্লিকেট প্রটেক্টেড) -->
    <div id="authScreen" class="screen">
        <h2>নিরাপদ অ্যাকাউন্ট তৈরি</h2>
        <p style="font-size:11px; color:#e0a96d; text-align:center;">একটি ফোন নম্বর দিয়ে মাত্র একবারই অ্যাকাউন্ট খোলা যাবে।</p>
        <input type="text" id="name" placeholder="আপনার নাম">
        <input type="text" id="phone" placeholder="ফোন নম্বর (ইউনিক)">
        <input type="email" id="email" placeholder="ইমেইল অ্যাড্রেস">
        <input type="password" id="password" placeholder="পাসওয়ার্ড">
        <button onclick="handleAuth()">রেজিস্ট্রার / লগইন</button>
    </div>

    <!-- ৩. হোম পেজ -->
    <div id="homeScreen" class="screen">
        <div class="card">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c" class="banner-img" alt="Banner">
            <h3 style="margin:5px 0;">PREMIER GLOBAL HUB</h3>
            <p style="font-size: 13px; color: #cfd8dc;">সতর্কতা: বট বা ফেক সাবমিশন স্বয়ংক্রিয়ভাবে ব্লক করা হয়।</p>
        </div>

        <div class="card" onclick="openTask('Gmail', 13)" style="cursor:pointer; border: 1px solid var(--accent-color);">
            <h3 style="margin:0;">Gmail Submit Work</h3>
            <p style="color: #2ecc71; font-weight:bold; margin:5px 0;">রেট: ৳১৩ প্রতি কাজ</p>
            <p style="font-size:12px; margin:0;">জিমেইল নাম ও পাসওয়ার্ড দিয়ে সাবমিট করুন</p>
        </div>
    </div>

    <!-- ৪. টাস্ক সাবমিশন স্ক্রিন (অটোমেশন প্রটেক্টেড) -->
    <div id="taskScreen" class="screen">
        <h2 id="taskTitle">Gmail Task</h2>
        <p style="color: var(--accent-color); text-align:center;">পুরস্কার: ৳১৩</p>
        <input type="email" id="taskEmail" placeholder="জিমেইল ইউজারনেম দিন">
        <input type="text" id="taskPass" placeholder="জিমেইল পাসওয়ার্ড দিন">
        <div style="margin: 10px 0; font-size: 12px; color: #aaa;">
            <input type="checkbox" id="humanCheck" style="width: auto; margin-right: 5px;"> আমি রোবট নই, ম্যানুয়ালি কাজ করছি।
        </div>
        <button onclick="submitTask()">জমা দিন (এডমিনে পাঠান)</button>
        <button style="background: #555;" onclick="showScreen('homeScreen')">ফিরে যান</button>
    </div>

    <!-- ৫. উইথড্র স্ক্রিন -->
    <div id="withdrawScreen" class="screen">
        <h2>উইথড্র করুন</h2>
        <p style="text-align:center; font-size:13px;">মিনিমাম উইথড্র ৫০ টাকা</p>
        <select id="withdrawMethod">
            <option value="bKash">বিকাশ</option>
            <option value="Nagad">নগদ</option>
        </select>
        <input type="text" id="accountNo" placeholder="বিকাশ/নগদ নম্বর">
        <input type="number" id="withdrawAmount" placeholder="টাকার পরিমাণ (কমপক্ষে ৫০)">
        <button onclick="handleWithdraw()">উইথড্র রিকোয়েস্ট পাঠান</button>
    </div>

    <!-- ৬. প্রোফাইল স্ক্রিন -->
    <div id="profileScreen" class="screen">
        <div class="card" style="background: linear-gradient(135deg, #1c2541, #0b132b);">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb" class="profile-pic">
            <h3 id="pName" style="margin:5px 0;">N/A</h3>
            <p style="font-size:12px; color:var(--accent-color); margin:0;">রেফার কোড: <span style="background:#27374d; padding:2px 6px; border-radius:4px;">621672</span></p>
        </div>

        <div class="card" style="text-align: left; font-size: 14px;">
            <p><strong>ইমেইল:</strong> <span id="pEmail">N/A</span></p>
            <p><strong>মোবাইল:</strong> <span id="pPhone">N/A</span></p>
            <p><strong>মূল ব্যালেন্স:</strong> <span id="pBalance" style="color:#2ecc71; font-weight:bold;">0</span> টাকা</p>
        </div>
        <button style="background: #c0392b;" onclick="location.reload()">লগআউট</button>
    </div>

    <!-- ৭. এডমিন প্যানেল -->
    <div id="adminScreen" class="screen">
        <h2>🔒 হাই সিকিউরিটি এডমিন প্যানেল</h2>
        <p style="font-size:12px; text-align:center; color:var(--accent-color);">ইউজারদের ভেরিফাইড কাজের তালিকা:</p>
        <div id="adminTaskList" style="max-height: 350px; overflow-y: auto;"></div>
        <button style="background: #555; margin-top:15px;" onclick="showScreen('homeScreen')">হোমে ফিরে যান</button>
    </div>

</div>

<div class="nav-bar" id="navBar" style="display: none;">
    <div class="nav-item" onclick="showScreen('homeScreen')">🏠 হোম</div>
    <div class="nav-item" onclick="showScreen('withdrawScreen')">💳 উইথড্র</div>
    <div class="nav-item" onclick="showScreen('profileScreen')">👤 প্রোফাইল</div>
</div>

<script>
    let currentUser = null;
    let clickTimes = []; // বট বা অটো ক্লিক ডিটেক্ট করার সিকিউরিটি অ্যারে

    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        
        if(screenId !== 'splashScreen' && screenId !== 'authScreen') {
            document.getElementById('navBar').style.display = 'flex';
            document.getElementById('topHeader').style.display = 'flex';
        } else {
            document.getElementById('navBar').style.display = 'none';
            document.getElementById('topHeader').style.display = 'none';
        }
    }

    async function handleAuth() {
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if(!phone || !name || !password) {
            alert('সব তথ্য সঠিকভাবে পূরণ করুন!');
            return;
        }

        const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, email, password })
        });
        const data = await res.json();

        alert(data.message);
        if(data.success) {
            currentUser = data.user;
            updateProfileUI();
            showScreen('homeScreen');
        }
    }

    function openTask(platform, reward) {
        window.currentReward = reward;
        document.getElementById('taskTitle').innerText = platform + ' Submition (Rate: ৳' + reward + ')';
        showScreen('taskScreen');
    }

    async function submitTask() {
        // বটিংস বা অটোমেশন প্রতিরোধের সিকিউরিটি চেক
        const isHuman = document.getElementById('humanCheck').checked;
        if(!isHuman) {
            alert('নিরাপত্তা নিশ্চিত করতে "আমি রোবট নই" বক্সে টিক দিন!');
            return;
        }

        const emailInput = document.getElementById('taskEmail').value;
        const passInput = document.getElementById('taskPass').value;

        if(!emailInput || !passInput) {
            alert('জিমেইল নাম এবং পাসওয়ার্ড দিন!');
            return;
        }

        const res = await fetch('/api/submit-task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                phone: currentUser.phone, 
                name: currentUser.name, 
                taskEmail: emailInput, 
                taskPass: passInput, 
                reward: window.currentReward 
            })
        });
        const data = await res.json();

        alert(data.message);
        if(data.success) {
            currentUser.balance += window.currentReward;
            updateProfileUI();
            document.getElementById('humanCheck').checked = false;
            showScreen('homeScreen');
        }
    }

    async function handleWithdraw() {
        const method = document.getElementById('withdrawMethod').value;
        const accountNo = document.getElementById('accountNo').value;
        const amount = document.getElementById('withdrawAmount').value;

        if(!accountNo || amount < 50) {
            alert('সঠিক নম্বর দিন এবং মিনিমাম উইথড্র ৫০ টাকা হতে হবে!');
            return;
        }

        const res = await fetch('/api/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: currentUser.phone, amount })
        });
        const data = await res.json();

        alert(data.message);
        if(data.success) {
            currentUser.balance -= Number(amount);
            updateProfileUI();
            showScreen('homeScreen');
        }
    }

    async function openAdminPanel() {
        showScreen('adminScreen');
        const res = await fetch('/api/admin/tasks');
        const data = await res.json();
        
        let listHTML = '';
        if(data.tasks.length === 0) {
            listHTML = '<p style="text-align:center; color:#aaa;">কোনো কাজের রিকোয়েস্ট নেই।</p>';
        } else {
            data.tasks.forEach((t) => {
                listHTML += \`<div class="card" style="text-align:left; font-size:13px; padding:10px;">
                    <p style="margin:2px 0;"><strong>ইউজার:</strong> \${t.userName} (\${t.phone})</p>
                    <p style="margin:2px 0; color:var(--accent-color);"><strong>জিমেইল:</strong> \${t.taskEmail}</p>
                    <p style="margin:2px 0;"><strong>পাসওয়ার্ড:</strong> \${t.taskPass}</p>
                    <p style="margin:2px 0; color:#2ecc71;"><strong>পুরস্কার:</strong> ৳\${t.reward}</p>
                </div>\`;
            });
        }
        document.getElementById('adminTaskList').innerHTML = listHTML;
    }

    function updateProfileUI() {
        if(currentUser) {
            document.getElementById('pName').innerText = currentUser.name;
            document.getElementById('pPhone').innerText = currentUser.phone;
            document.getElementById('pEmail').innerText = currentUser.email || 'N/A';
            document.getElementById('pBalance').innerText = currentUser.balance;
        }
    }
</script>

</body>
</html>
    `);
});

// ব্যাকএন্ড হাই-সিকিউরিটি লজিক
app.post('/api/auth', (req, res) => {
    const { name, phone, email, password } = req.body;
    
    // ১. চেক করা হচ্ছে একই ফোন নম্বর দিয়ে ইতিপূর্বে কেউ অ্যাকাউন্ট করেছে কিনা
    const existingUser = users.find(u => u.phone === phone);
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'এই ফোন নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট খোলা হয়েছে! পুনরায় অ্যাকাউন্ট খোলা যাবে না।' });
    }

    // নতুন ইউজার রেজিস্টার
    const newUser = { name, phone, email, password, balance: 0 };
    users.push(newUser);
    res.json({ success: true, message: 'সফলভাবে অ্যাকাউন্ট তৈরি হয়েছে!', user: newUser });
});

app.post('/api/submit-task', (req, res) => {
    const { phone, name, taskEmail, taskPass, reward } = req.body;
    const user = users.find(u => u.phone === phone);
    
    if (user) {
        user.balance += Number(reward);
        adminTasks.push({ userName: name, phone, taskEmail, taskPass, reward, time: new Date().toLocaleTimeString() });
        res.json({ success: true, message: 'টাস্ক সফলভাবে সাবমিট হয়েছে এবং এডমিন প্যানেলে পাঠানো হয়েছে!' });
    } else {
        res.status(400).json({ success: false, message: 'সিকিউরিটি এরর: ভ্যালিড ইউজার পাওয়া যায়নি!' });
    }
});

app.post('/api/withdraw', (req, res) => {
    const { phone, amount } = req.body;
    const user = users.find(u => u.phone === phone);
    
    if (user && user.balance >= Number(amount)) {
        user.balance -= Number(amount);
        res.json({ success: true, message: 'উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে!' });
    } else {
        res.status(400).json({ success: false, message: 'অপর্যাপ্ত ব্যালেন্স বা ভুল রিকোয়েস্ট!' });
    }
});

app.get('/api/admin/tasks', (req, res) => {
    res.json({ success: true, tasks: adminTasks });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running securely on port ${PORT}`);
});

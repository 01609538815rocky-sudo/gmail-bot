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
    <title>BD Freelancing Academy</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <style>
        :root {
            --bg-color: #fcfcfc;
            --card-bg: #ffffff;
            --accent-color: #ff7b00;
            --text-color: #333333;
            --header-bg: #ff8c00;
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
            padding: 12px;
            box-sizing: border-box;
            padding-bottom: 85px;
        }
        .header-top {
            background-color: var(--header-bg);
            color: white;
            padding: 12px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
            border-radius: 0 0 15px 15px;
            margin-bottom: 15px;
            box-shadow: 0 4px 10px rgba(255, 140, 0, 0.3);
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
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            color: #333;
            box-sizing: border-box;
        }
        button {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #ff8c00, #ff5500);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 10px;
            box-shadow: 0 4px 10px rgba(255, 123, 0, 0.3);
        }
        .card {
            background: var(--card-bg);
            padding: 15px;
            border-radius: 12px;
            margin: 12px 0;
            border: 1px solid #eee;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            text-align: center;
        }
        .task-card {
            display: flex;
            align-items: center;
            background: #ffffff;
            padding: 12px 15px;
            border-radius: 12px;
            margin: 12px 0;
            border: 1px solid #eee;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            cursor: pointer;
            text-align: left;
        }
        .task-logo {
            width: 45px;
            height: 45px;
            object-fit: contain;
            margin-right: 15px;
            flex-shrink: 0;
        }
        .banner-img {
            width: 100%;
            height: 140px;
            object-fit: cover;
            border-radius: 10px;
            margin-bottom: 8px;
        }
        .nav-bar {
            position: fixed;
            bottom: 0;
            width: 100%;
            max-width: 400px;
            background: #ffffff;
            display: flex;
            justify-content: space-around;
            padding: 10px 0;
            border-top: 1px solid #eee;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
            box-sizing: border-box;
        }
        .nav-item {
            color: #777;
            cursor: pointer;
            font-size: 12px;
            text-align: center;
            font-weight: bold;
        }
        .nav-item.active-nav {
            color: var(--accent-color);
        }
    </style>
</head>
<body>

<div class="container">
    <div class="header-top" id="topHeader" style="display:none;">
        <span>BD FREELANCING ACADEMY</span>
        <span onclick="openAdminPanel()" style="cursor:pointer; font-size:13px; background:rgba(0,0,0,0.2); padding:4px 8px; border-radius:4px;">⋮ এডমিন</span>
    </div>

    <!-- ১. স্প্ল্যাশ স্ক্রিন -->
    <div id="splashScreen" class="screen active">
        <div style="text-align:center; margin-top:80px;">
            <div style="font-size: 60px; color: var(--accent-color); font-weight:bold;">💼</div>
            <h2>BD FREELANCING ACADEMY</h2>
            <p>অরিজিনাল টাস্ক ও আর্নিং প্ল্যাটফর্ম</p>
            <button onclick="showScreen('authScreen')">শুরু করুন</button>
        </div>
    </div>

    <!-- ২. রেজিস্ট্রেশন স্ক্রিন -->
    <div id="authScreen" class="screen">
        <h2>অ্যাকাউন্ট তৈরি</h2>
        <p style="font-size:11px; color:#666; text-align:center;">একটি ফোন নম্বর দিয়ে একবারই অ্যাকাউন্ট খোলা যাবে।</p>
        <input type="text" id="name" placeholder="আপনার নাম">
        <input type="text" id="phone" placeholder="ফোন নম্বর (ইউনিক)">
        <input type="email" id="email" placeholder="ইমেইল অ্যাড্রেস">
        <input type="password" id="password" placeholder="পাসওয়ার্ড">
        <button onclick="handleAuth()">রেজিস্ট্রার / লগইন</button>
    </div>

    <!-- ৩. হোম পেজ (অরিজিনাল লোগোযুক্ত টাস্ক লিস্ট) -->
    <div id="homeScreen" class="screen">
        <div class="card">
            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe" class="banner-img" alt="Banner">
            <h3 style="margin:5px 0; color:var(--accent-color);">PREMIER GLOBAL HUB</h3>
            <p style="font-size: 12px; color: #666;">সোশ্যাল মিডিয়া টাস্ক সম্পন্ন করে প্রতিদিন আয় করুন।</p>
        </div>

        <!-- জিমেইল টাস্ক -->
        <div class="task-card" onclick="openTask('Gmail Submit', 13)">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" class="task-logo" alt="Gmail">
            <div>
                <h4 style="margin:0; font-size:15px; color:#333;">Gmail Submit Work</h4>
                <p style="color: #27ae60; font-weight:bold; margin:3px 0; font-size:13px;">রেট: ৳১৩ প্রতি কাজ</p>
                <p style="font-size:11px; color:#777; margin:0;">জিমেইল নাম ও পাসওয়ার্ড দিয়ে সাবমিট করুন</p>
            </div>
        </div>

        <!-- ফেসবুক টাস্ক -->
        <div class="task-card" onclick="openTask('Facebook Task', 10)">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" class="task-logo" alt="Facebook">
            <div>
                <h4 style="margin:0; font-size:15px; color:#333;">Facebook Follow / Post</h4>
                <p style="color: #27ae60; font-weight:bold; margin:3px 0; font-size:13px;">রেট: ৳১০ প্রতি কাজ</p>
                <p style="font-size:11px; color:#777; margin:0;">প্রুফ লিংক ও ডিটেইলস দিয়ে সাবমিট করুন</p>
            </div>
        </div>

        <!-- ইনস্টাগ্রাম টাস্ক -->
        <div class="task-card" onclick="openTask('Instagram Task', 10)">
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" class="task-logo" alt="Instagram">
            <div>
                <h4 style="margin:0; font-size:15px; color:#333;">Instagram Follow Work</h4>
                <p style="color: #27ae60; font-weight:bold; margin:3px 0; font-size:13px;">রেট: ৳১০ প্রতি কাজ</p>
                <p style="font-size:11px; color:#777; margin:0;">ইনস্টাগ্রাম প্রোফাইল লিংক দিয়ে সাবমিট করুন</p>
            </div>
        </div>
    </div>

    <!-- ৪. টাস্ক সাবমিশন স্ক্রিন -->
    <div id="taskScreen" class="screen">
        <h2 id="taskTitle">Task Submission</h2>
        <input type="text" id="taskInput1" placeholder="প্রুফ লিংক বা ইউজারনেম">
        <input type="text" id="taskInput2" placeholder="পাসওয়ার্ড বা অতিরিক্ত ডিটেইলস">
        <div style="margin: 10px 0; font-size: 12px; color: #555;">
            <input type="checkbox" id="humanCheck" style="width: auto; margin-right: 5px;"> আমি রোবট নই, ম্যানুয়ালি কাজ করছি।
        </div>
        <button onclick="submitTask()">জমা দিন (কনফার্মেশন)</button>
        <button style="background: #7f8c8d;" onclick="showScreen('homeScreen')">ফিরে যান</button>
    </div>

    <!-- ৫. ব্যালেন্স / ওয়ালেট অপশন -->
    <div id="balanceScreen" class="screen">
        <h2>💰 ব্যালেন্স ও হিস্ট্রি</h2>
        <div class="card" style="background: linear-gradient(135deg, #ff8c00, #ff5500); color:white;">
            <p style="margin:0; font-size:14px;">ইনকাম ব্যালেন্স</p>
            <h1 id="bTotalBalance" style="margin:5px 0; font-size:28px;">৳0</h1>
        </div>
        <div class="card" style="text-align:left; font-size:13px;">
            <p>🔄 <strong>কনফার্মেশন কাজ:</strong> <span id="bPendingCount" style="color:#d35400; font-weight:bold;">0 টি</span></p>
            <p>✅ <strong>অ্যাপ্রুভ কাজ:</strong> <span id="bApprovedCount" style="color:#27ae60; font-weight:bold;">0 টি</span></p>
            <p>⏳ <strong>রিভিউ কাজ:</strong> <span id="bReviewCount" style="color:#2980b9; font-weight:bold;">0 টি</span></p>
            <p>❌ <strong>রিজেক্ট কাজ:</strong> <span id="bRejectCount" style="color:#c0392b; font-weight:bold;">0 টি</span></p>
        </div>
        <button onclick="showScreen('withdrawScreen')">উইথড্র পেজে যান</button>
    </div>

    <!-- ৬. উইথড্র স্ক্রিন -->
    <div id="withdrawScreen" class="screen">
        <h2>উইথড্র করুন</h2>
        <p style="text-align:center; font-size:12px; color:#666;">মিনিমাম উইথড্র ৫০ টাকা</p>
        <select id="withdrawMethod">
            <option value="bKash">বিকাশ</option>
            <option value="Nagad">নগদ</option>
        </select>
        <input type="text" id="accountNo" placeholder="বিকাশ/নগদ নম্বর">
        <input type="number" id="withdrawAmount" placeholder="টাকার পরিমাণ (কমপক্ষে ৫০)">
        <button onclick="handleWithdraw()">উইথড্র রিকোয়েস্ট পাঠান</button>
    </div>

    <!-- ৭. প্রোফাইল স্ক্রিন -->
    <div id="profileScreen" class="screen">
        <div class="card" style="background: #fff;">
            <div style="width:70px; height:70px; background:#ff8c00; color:white; font-size:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 10px auto;" id="avatarLetter">U</div>
            <h3 id="pName" style="margin:5px 0;">N/A</h3>
            <p style="font-size:11px; color:#ff8c00;">রেফার কোড: <b>621672</b></p>
        </div>
        <div class="card" style="text-align: left; font-size: 13px;">
            <p><strong>ইমেইল:</strong> <span id="pEmail">N/A</span></p>
            <p><strong>মোবাইল:</strong> <span id="pPhone">N/A</span></p>
            <p><strong>ব্যালেন্স:</strong> <span id="pBalance" style="color:#27ae60; font-weight:bold;">0</span> টাকা</p>
        </div>
        <button style="background: #c0392b;" onclick="location.reload()">লগআউট</button>
    </div>

    <!-- ৮. এডমিন প্যানেল -->
    <div id="adminScreen" class="screen">
        <h2>🔒 এডমিন প্যানেল</h2>
        <p style="font-size:11px; text-align:center; color:#666;">ইউজারদের সাবমিট করা কাজের তালিকা:</p>
        <div id="adminTaskList" style="max-height: 320px; overflow-y: auto;"></div>
        <button style="background: #7f8c8d; margin-top:10px;" onclick="showScreen('homeScreen')">হোমে ফিরে যান</button>
    </div>

</div>

<!-- ফুটার নেভবার -->
<div class="nav-bar" id="navBar" style="display: none;">
    <div class="nav-item active-nav" onclick="switchNav(this, 'homeScreen')">🏠 হোম</div>
    <div class="nav-item" onclick="switchNav(this, 'balanceScreen')">💳 ওয়ালেট</div>
    <div class="nav-item" onclick="switchNav(this, 'withdrawScreen')">💸 উইথড্র</div>
    <div class="nav-item" onclick="switchNav(this, 'profileScreen')">👤 প্রোফাইল</div>
</div>

<script>
    let currentUser = null;

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

    function switchNav(element, screenId) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active-nav'));
        element.classList.add('active-nav');
        showScreen(screenId);
        if(screenId === 'balanceScreen') updateBalanceUI();
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
        window.currentTaskName = platform;
        window.currentReward = reward;
        document.getElementById('taskTitle').innerText = platform + ' (রেট: ৳' + reward + ')';
        if(platform.includes('Gmail')) {
            document.getElementById('taskInput1').placeholder = 'জিমেইল নাম বা ইউজারনেম';
            document.getElementById('taskInput2').placeholder = 'জিমেইল পাসওয়ার্ড';
        } else {
            document.getElementById('taskInput1').placeholder = 'প্রুফ লিংক (Profile/Post Link)';
            document.getElementById('taskInput2').placeholder = 'স্ক্রিনশট বা কাজের বিবরণী';
        }
        showScreen('taskScreen');
    }

    async function submitTask() {
        const isHuman = document.getElementById('humanCheck').checked;
        if(!isHuman) {
            alert('নিরাপত্তা নিশ্চিত করতে "আমি রোবট নই" বক্সে টিক দিন!');
            return;
        }

        const input1 = document.getElementById('taskInput1').value;
        const input2 = document.getElementById('taskInput2').value;

        if(!input1 || !input2) {
            alert('সব ফিল্ড পূরণ করুন!');
            return;
        }

        const res = await fetch('/api/submit-task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                phone: currentUser.phone, 
                name: currentUser.name, 
                taskName: window.currentTaskName,
                input1, 
                input2, 
                reward: window.currentReward 
            })
        });
        const data = await res.json();

        alert(data.message);
        if(data.success) {
            currentUser.balance += window.currentReward;
            currentUser.reviewCount = (currentUser.reviewCount || 0) + 1;
            updateProfileUI();
            document.getElementById('humanCheck').checked = false;
            document.getElementById('taskInput1').value = '';
            document.getElementById('taskInput2').value = '';
            showScreen('homeScreen');
        }
    }

    async function handleWithdraw() {
        const amount = document.getElementById('withdrawAmount').value;
        const accountNo = document.getElementById('accountNo').value;

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
            listHTML = '<p style="text-align:center; color:#888;">কোনো কাজের রিকোয়েস্ট নেই।</p>';
        } else {
            data.tasks.forEach((t) => {
                listHTML += \`<div class="card" style="text-align:left; font-size:12px; padding:10px;">
                    <p style="margin:2px 0;"><strong>টাস্ক:</strong> \${t.taskName} (৳\${t.reward})</p>
                    <p style="margin:2px 0;"><strong>ইউজার:</strong> \${t.userName} (\${t.phone})</p>
                    <p style="margin:2px 0; color:#ff8c00;"><strong>তথ্য ১:</strong> \${t.input1}</p>
                    <p style="margin:2px 0;"><strong>তথ্য ২:</strong> \${t.input2}</p>
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
            document.getElementById('avatarLetter').innerText = currentUser.name.charAt(0).toUpperCase();
        }
    }

    function updateBalanceUI() {
        if(currentUser) {
            document.getElementById('bTotalBalance').innerText = '৳' + currentUser.balance;
            document.getElementById('bPendingCount').innerText = (currentUser.pendingCount || 0) + ' টি';
            document.getElementById('bApprovedCount').innerText = (currentUser.approvedCount || 0) + ' টি';
            document.getElementById('bReviewCount').innerText = (currentUser.reviewCount || 0) + ' টি';
            document.getElementById('bRejectCount').innerText = (currentUser.rejectCount || 0) + ' টি';
        }
    }
</script>

</body>
</html>
    `);
});

// ব্যাকএন্ড লজিক
app.post('/api/auth', (req, res) => {
    const { name, phone, email, password } = req.body;
    const existing = users.find(u => u.phone === phone);
    if (existing) {
        return res.status(400).json({ success: false, message: 'এই ফোন নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে!' });
    }
    const newUser = { name, phone, email, password, balance: 0, pendingCount: 0, approvedCount: 0, reviewCount: 0, rejectCount: 0 };
    users.push(newUser);
    res.json({ success: true, message: 'সফলভাবে অ্যাকাউন্ট তৈরি হয়েছে!', user: newUser });
});

app.post('/api/submit-task', (req, res) => {
    const { phone, name, taskName, input1, input2, reward } = req.body;
    const user = users.find(u => u.phone === phone);
    if (user) {
        user.balance += Number(reward);
        user.reviewCount = (user.reviewCount || 0) + 1;
        adminTasks.push({ userName: name, phone, taskName, input1, input2, reward });
        res.json({ success: true, message: 'টাস্ক সফলভাবে সাবমিট হয়েছে এবং রিভিউতে পাঠানো হয়েছে!' });
    } else {
        res.status(400).json({ success: false, message: 'ইউজার পাওয়া যায়নি!' });
    }
});

app.post('/api/withdraw', (req, res) => {
    const { phone, amount } = req.body;
    const user = users.find(u => u.phone === phone);
    if (user && user.balance >= Number(amount)) {
        user.balance -= Number(amount);
        res.json({ success: true, message: 'উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে!' });
    } else {
        res.status(400).json({ success: false, message: 'অপর্যাপ্ত ব্যালেন্স!' });
    }
});

app.get('/api/admin/tasks', (req, res) => {
    res.json({ success: true, tasks: adminTasks });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

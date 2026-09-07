const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ডেমো ডাটাবেস
let users = [];

// মূল পেজ (Frontend HTML সরাসরি সার্ভ হবে)
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ওপেন অ্যাপস - Telegram Mini App</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <style>
        :root {
            --bg-color: #0d1b2a;
            --card-bg: #1b263b;
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
            padding: 20px;
            box-sizing: border-box;
            padding-bottom: 70px;
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
            margin: 10px 0;
            background: #27374d;
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
        button:active {
            transform: scale(0.98);
        }
        .card {
            background: var(--card-bg);
            padding: 15px;
            border-radius: 10px;
            margin: 10px 0;
            border: 1px solid #415a77;
            text-align: center;
            cursor: pointer;
        }
        .nav-bar {
            position: fixed;
            bottom: 0;
            width: 100%;
            max-width: 400px;
            background: #111e2f;
            display: flex;
            justify-content: space-around;
            padding: 12px 0;
            border-top: 1px solid #27374d;
            box-sizing: border-box;
        }
        .nav-item {
            color: var(--accent-color);
            cursor: pointer;
            font-size: 15px;
            text-align: center;
            font-weight: bold;
        }
        .logo-container {
            text-align: center;
            margin-top: 50px;
        }
        .logo {
            font-size: 60px;
            color: var(--accent-color);
            font-weight: bold;
        }
    </style>
</head>
<body>

<div class="container">

    <!-- ১. স্প্ল্যাশ স্ক্রিন -->
    <div id="splashScreen" class="screen active">
        <div class="logo-container">
            <div class="logo">ও</div>
            <h2>ওপেন অ্যাপস</h2>
            <p>স্বাগতম! টেলিগ্রাম মিনি অ্যাপে আপনাকে স্বাগতম।</p>
            <button onclick="showScreen('authScreen')">শুরু করুন</button>
        </div>
    </div>

    <!-- ২. রেজিস্ট্রেশন / লগইন স্ক্রিন -->
    <div id="authScreen" class="screen">
        <h2>রেজিস্ট্রেশন / লগইন</h2>
        <input type="text" id="name" placeholder="আপনার নাম">
        <input type="text" id="phone" placeholder="ফোন নম্বর">
        <input type="email" id="email" placeholder="ইমেইল">
        <input type="password" id="password" placeholder="পাসওয়ার্ড">
        <button onclick="handleAuth()">লগইন / রেজিস্টার</button>
    </div>

    <!-- ৩. হোম পেজ (Main Hub) -->
    <div id="homeScreen" class="screen">
        <h2>PREMIER GLOBAL HUB</h2>
        <div class="card" style="cursor: default;">
            <p>Connect with global clients & scale your earnings</p>
        </div>
        <div class="card" onclick="openTask('Facebook')">
            <h3>Facebook</h3>
            <p>সাবমিট করুন সম্পন্ন</p>
        </div>
        <div class="card" onclick="openTask('Gmail')">
            <h3>Gmail Submit</h3>
            <p>সাবমিট করুন অপশন</p>
        </div>
        <div class="card" onclick="openTask('Instagram')">
            <h3>Instagram</h3>
            <p>সাবমিট করুন সম্পন্ন</p>
        </div>
    </div>

    <!-- ৪. টাস্ক সাবমিশন স্ক্রিন -->
    <div id="taskScreen" class="screen">
        <h2 id="taskTitle">Task Submission</h2>
        <input type="text" placeholder="প্রুফ লিংক দিন">
        <input type="text" placeholder="স্ক্রিনশট বা ডিটেইলস">
        <button onclick="submitTask()">সাবমিট করুন</button>
        <button style="background: #555;" onclick="showScreen('homeScreen')">ফিরে যান</button>
    </div>

    <!-- ৫. উইথড্র স্ক্রিন -->
    <div id="withdrawScreen" class="screen">
        <h2>উইথড্র করুন</h2>
        <p>মিনিমাম উইথড্র ৫০ টাকা</p>
        <select id="withdrawMethod">
            <option value="bKash">বিকাশ</option>
            <option value="Nagad">নগদ</option>
        </select>
        <input type="text" id="accountNo" placeholder="একাউন্ট নম্বর">
        <input type="number" id="withdrawAmount" placeholder="টাকার পরিমাণ">
        <button onclick="handleWithdraw()">উইথড্র রিকোয়েস্ট পাঠান</button>
    </div>

    <!-- ৬. প্রোফাইল স্ক্রিন -->
    <div id="profileScreen" class="screen">
        <h2>প্রোফাইল</h2>
        <div class="card" style="cursor: default; text-align: left;">
            <p><strong>নাম:</strong> <span id="pName">N/A</span></p>
            <p><strong>ফোন:</strong> <span id="pPhone">N/A</span></p>
            <p><strong>ইমেইল:</strong> <span id="pEmail">N/A</span></p>
            <p><strong>ব্যালেন্স:</strong> <span id="pBalance">50</span> টাকা</p>
        </div>
        <button style="background: #c0392b;" onclick="showScreen('authScreen')">লগআউট</button>
    </div>

</div>

<!-- ৭. ফুটার নেভিগেশন বার -->
<div class="nav-bar" id="navBar" style="display: none;">
    <div class="nav-item" onclick="showScreen('homeScreen')">🏠 হোম</div>
    <div class="nav-item" onclick="showScreen('withdrawScreen')">💳 উইথড্র</div>
    <div class="nav-item" onclick="showScreen('profileScreen')">👤 প্রোফাইল</div>
</div>

<script>
    let currentUser = null;

    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        
        if(screenId !== 'splashScreen' && screenId !== 'authScreen') {
            document.getElementById('navBar').style.display = 'flex';
        } else {
            document.getElementById('navBar').style.display = 'none';
        }
    }

    async function handleAuth() {
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if(!phone || !name) {
            alert('দয়া করে নাম এবং ফোন নম্বর দিন!');
            return;
        }

        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, email, password })
        });
        const data = await response.json();

        if(data.success) {
            currentUser = data.user;
            updateProfileUI();
            showScreen('homeScreen');
        } else {
            alert('ত্রুটি হয়েছে!');
        }
    }

    function openTask(platform) {
        document.getElementById('taskTitle').innerText = platform + ' Task Submit';
        showScreen('taskScreen');
    }

    function submitTask() {
        alert('আপনার কাজটি সফলভাবে জমা দেওয়া হয়েছে!');
        if(currentUser) currentUser.balance += 10; // টাস্ক সম্পন্ন করলে ১০ টাকা যোগ হবে
        updateProfileUI();
        showScreen('homeScreen');
    }

    async function handleWithdraw() {
        const method = document.getElementById('withdrawMethod').value;
        const accountNo = document.getElementById('accountNo').value;
        const amount = document.getElementById('withdrawAmount').value;

        if(!accountNo || !amount) {
            alert('সব তথ্য সঠিকভাবে পূরণ করুন!');
            return;
        }

        const response = await fetch('/api/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: currentUser.phone, method, accountNo, amount })
        });
        const data = await response.json();

        alert(data.message);
        if(data.success) {
            currentUser.balance -= Number(amount);
            updateProfileUI();
            showScreen('homeScreen');
        }
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

// ব্যাকএন্ড API রাউটসমূহ
app.post('/api/auth', (req, res) => {
    const { name, phone, email, password } = req.body;
    let user = users.find(u => u.phone === phone);
    
    if (!user) {
        user = { name, phone, email, password, balance: 20 }; // স্টার্টিং বোনাস ২০ টাকা
        users.push(user);
    }
    res.json({ success: true, message: 'Success', user });
});

app.post('/api/withdraw', (req, res) => {
    const { phone, amount } = req.body;
    const user = users.find(u => u.phone === phone);
    
    if (user && user.balance >= Number(amount)) {
        user.balance -= Number(amount);
        res.json({ success: true, message: 'উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে!' });
    } else {
        res.status(400).json({ success: false, message: 'অপর্যাপ্ত ব্যালেন্স বা ভুল তথ্য!' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

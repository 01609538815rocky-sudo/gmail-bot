const http = require('http');
const url = require('url');

let users = [];
let adminTasks = [];
let adminWithdraws = [];
let taskRates = {
    gmail: 13,
    facebook: 10,
    instagram: 10
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (pathname === '/api/register' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                let existingUser = users.find(u => u.phone === data.phone);
                
                if (existingUser) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'এই ফোন নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে!' }));
                    return;
                }

                const newUser = { 
                    name: data.name, 
                    phone: data.phone, 
                    email: data.email, 
                    password: data.password, 
                    balance: 0, 
                    pendingCount: 0, 
                    approvedCount: 0,
                    referCode: Math.floor(100000 + Math.random() * 900000).toString(),
                    profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                };
                users.push(newUser);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'সফলভাবে রেজিস্ট্রেশন সম্পন্ন হয়েছে!', user: newUser }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'ইনভ্যালিড ডাটা ফরম্যাট!' }));
            }
        });
        return;
    }

    if (pathname === '/api/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                let user = users.find(u => u.phone === data.phone && u.password === data.password);
                
                if (user) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'সফলভাবে লগইন হয়েছে!', user }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'ভুল ফোন নম্বর অথবা পাসওয়ার্ড!' }));
                }
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'ইনভ্যালিড ডাটা ফরম্যাট!' }));
            }
        });
        return;
    }

    if (pathname === '/api/submit-task' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const user = users.find(u => u.phone === data.phone);
                if (user) {
                    const newTask = {
                        id: Date.now().toString(),
                        phone: data.phone,
                        userName: data.name,
                        taskType: data.taskType,
                        submitterName: data.submitterName,
                        gmailAddress: data.gmailAddress,
                        gmailPass: data.gmailPass,
                        reward: Number(data.reward),
                        status: 'pending'
                    };
                    adminTasks.push(newTask);
                    user.pendingCount = (user.pendingCount || 0) + 1;
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'টাস্ক সফলভাবে জমা হয়েছে!', user }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'ইউজার পাওয়া যায়নি!' }));
                }
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'ইনভ্যালিড ডাটা ফরম্যাট!' }));
            }
        });
        return;
    }

    if (pathname === '/api/withdraw' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const user = users.find(u => u.phone === data.phone);
                if (user && user.balance >= Number(data.amount)) {
                    user.balance -= Number(data.amount);
                    
                    const newWithdraw = {
                        id: Date.now().toString(),
                        phone: data.phone,
                        name: user.name,
                        method: data.method,
                        accountNo: data.accountNo,
                        amount: Number(data.amount),
                        status: 'pending'
                    };
                    adminWithdraws.push(newWithdraw);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে!', user }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'অপর্যাপ্ত ব্যালেন্স বা ভুল পরিমাণ!' }));
                }
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'ইনভ্যালিড ডাটা ফরম্যাট!' }));
            }
        });
        return;
    }

    if (pathname === '/api/update-profile' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const user = users.find(u => u.phone === data.phone);
                if(user) {
                    user.name = data.name;
                    user.email = data.email;
                    if(data.profilePic) user.profilePic = data.profilePic;
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'প্রোফাইল সফলভাবে আপডেট হয়েছে!', user }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'ইউজার পাওয়া যায়নি!' }));
                }
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'ইনভ্যালিড ডাটা ফরম্যাট!' }));
            }
        });
        return;
    }

    if (pathname === '/api/admin/data' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, tasks: adminTasks, withdraws: adminWithdraws, rates: taskRates }));
        return;
    }

    if (pathname === '/api/admin/rates' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                taskRates.gmail = Number(data.gmail);
                taskRates.facebook = Number(data.facebook);
                taskRates.instagram = Number(data.instagram);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'রেট আপডেট করা হয়েছে!', rates: taskRates }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'ইনভ্যালিড ডাটা ফরম্যাট!' }));
            }
        });
        return;
    }

    if (pathname === '/api/admin/review' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const task = adminTasks.find(t => t.id === data.taskId);
                if(task) {
                    const user = users.find(u => u.phone === task.phone);
                    if(data.action === 'approve') {
                        task.status = 'approved';
                        if(user) {
                            user.balance += task.reward;
                            user.approvedCount = (user.approvedCount || 0) + 1;
                            user.pendingCount = Math.max(0, (user.pendingCount || 1) - 1);
                        }
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Approve করা হয়েছে।' }));
                    } else if(data.action === 'reject') {
                        task.status = 'rejected';
                        if(user) {
                            user.pendingCount = Math.max(0, (user.pendingCount || 1) - 1);
                        }
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Reject করা হয়েছে।' }));
                    }
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'টাস্ক পাওয়া যায়নি!' }));
                }
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'ইনভ্যালিড ডাটা ফরম্যাট!' }));
            }
        });
        return;
    }

    if (pathname === '/api/admin/review-withdraw' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const wd = adminWithdraws.find(w => w.id === data.withdrawId);
                if(wd) {
                    wd.status = data.action === 'approve' ? 'approved' : 'rejected';
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'উইথড্র স্ট্যাটাস আপডেট হয়েছে।' }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'রিকোয়েস্ট পাওয়া যায়নি!' }));
                }
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'ইনভ্যালিড ডাটা ফরম্যাট!' }));
            }
        });
        return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>BD Freelancing Academy</title>
    <style>
        :root {
            --bg-color: #fff9f0;
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
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
        }
        .container {
            width: 100%;
            max-width: 400px;
            padding: 12px;
            box-sizing: border-box;
            padding-bottom: 90px;
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
            border-radius: 12px;
            color: #333;
            box-sizing: border-box;
            font-size: 14px;
        }
        button {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #ff8c00, #ff5500);
            border: none;
            border-radius: 12px;
            color: white;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 10px;
            box-shadow: 0 4px 10px rgba(255, 123, 0, 0.3);
            -webkit-appearance: none;
            touch-action: manipulation;
        }
        .card {
            background: var(--card-bg);
            padding: 15px;
            border-radius: 15px;
            margin: 12px 0;
            border: 1px solid #eee;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            text-align: center;
        }
        .banner-box {
            width: 100%;
            height: 160px;
            background: url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80") center/cover no-repeat;
            border-radius: 15px;
            margin-bottom: 15px;
            position: relative;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .banner-overlay {
            position: absolute;
            bottom: 0;
            width: 100%;
            background: rgba(0, 0, 0, 0.6);
            color: white;
            padding: 10px;
            box-sizing: border-box;
            border-bottom-left-radius: 15px;
            border-bottom-right-radius: 15px;
            text-align: center;
        }
        .task-card {
            display: flex;
            align-items: center;
            background: #ffffff;
            padding: 14px 15px;
            border-radius: 15px;
            margin: 12px 0;
            border: 1px solid #eee;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            cursor: pointer;
            text-align: left;
            touch-action: manipulation;
        }
        .task-logo {
            width: 45px;
            height: 45px;
            object-fit: contain;
            margin-right: 15px;
            flex-shrink: 0;
        }
        .profile-header-card {
            background: linear-gradient(135deg, #ff8c00, #ff5500);
            color: white;
            padding: 20px 15px;
            border-radius: 18px;
            text-align: center;
            margin-bottom: 15px;
            box-shadow: 0 6px 20px rgba(255, 140, 0, 0.3);
        }
        .profile-img-container {
            position: relative;
            width: 90px;
            height: 90px;
            margin: 0 auto 10px auto;
        }
        .profile-img {
            width: 90px;
            height: 90px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #fff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
        .camera-badge {
            position: absolute;
            bottom: 0;
            right: 0;
            background: #ff5500;
            color: white;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            border: 2px solid white;
            cursor: pointer;
        }
        .input-group-box {
            text-align: left;
            margin-bottom: 12px;
        }
        .input-group-box label {
            font-size: 12px;
            font-weight: bold;
            color: #555;
            margin-left: 5px;
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
            box-shadow: -2px -5px 15px rgba(0,0,0,0.05);
            box-sizing: border-box;
            z-index: 99;
        }
        .nav-item {
            color: #777;
            cursor: pointer;
            font-size: 11px;
            text-align: center;
            font-weight: bold;
            touch-action: manipulation;
        }
        .nav-item.active-nav {
            color: var(--accent-color);
        }
        .modal-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            padding: 15px;
            box-sizing: border-box;
        }
        .modal-box {
            background: #fff;
            width: 100%;
            max-width: 350px;
            border-radius: 20px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            max-height: 90vh;
            overflow-y: auto;
        }
        .switch-text {
            text-align: center;
            margin-top: 15px;
            font-size: 13px;
            color: #666;
            cursor: pointer;
            touch-action: manipulation;
        }
        .switch-text span {
            color: var(--accent-color);
            font-weight: bold;
        }
    </style>
</head>
<body>

<div id="noticeModal" class="modal-overlay">
    <div class="modal-box">
        <div style="width:60px; height:60px; background:linear-gradient(135deg, #0088cc, #00aced); border-radius:50%; margin:0 auto 10px auto; display:flex; justify-content:center; align-items:center; color:white; font-size:30px;">✈️</div>
        <h3 style="margin:10px 0; color:#333;">অফিসিয়াল নোটিশ 🕹️</h3>
        <p style="font-size: 13px; color: #555; line-height: 1.5; text-align: left;">
            🌻 আপনি কি আমাদের প্রতিষ্ঠান থেকে ইনকাম করতে চান? কাজ করতে আমাদের অফিসিয়াল টেলিগ্রাম চ্যানেলে জয়েন করুন।
        </p>
        <button type="button" ontouchend="window.location.href='https://t.me/';" onclick="window.location.href='https://t.me/';" style="background: linear-gradient(135deg, #0088cc, #00aced); margin-top:10px;">📲 জয়েন করুন 📱</button>
        <button type="button" ontouchend="document.getElementById('noticeModal').style.display='none';" onclick="document.getElementById('noticeModal').style.display='none';" style="background: #f1f2f6; color: #333; margin-top:8px; border:1px solid #ddd;">Ok SIR 🥰</button>
    </div>
</div>

<div id="receiptModal" class="modal-overlay" style="display:none;">
    <div class="modal-box" style="text-align: left; padding: 15px;">
        <div style="text-align: center; margin-bottom: 10px;">
            <div style="width: 40px; height: 40px; background: #e1f5fe; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #0288d1; font-size: 20px;">✓</div>
            <p style="font-size: 11px; color: #777; margin: 2px 0;">📍 BD FREELANCING ACADEMY</p>
            <h4 style="margin: 0; color: #222; font-size: 16px;">উইথড্র রিকোয়েস্ট নেওয়া হয়েছে</h4>
        </div>
        <div style="background: #f8f9fa; padding: 10px; border-radius: 10px; text-align: center; margin-bottom: 10px;">
            <span style="font-size: 11px; color: #666;">REQUESTED AMOUNT</span>
            <h2 id="receiptAmount" style="margin: 2px 0; color: #ff8c00;">৳ 0.00</h2>
            <span style="font-size: 10px; background: #fff3e0; color: #d35400; padding: 2px 6px; border-radius: 4px;">⏳ Pending Review</span>
        </div>
        <button type="button" ontouchend="document.getElementById('receiptModal').style.display='none'; showScreen('homeScreen');" onclick="document.getElementById('receiptModal').style.display='none'; showScreen('homeScreen');" style="margin-top: 0; background: #2196f3;">✔ ঠিক আছে</button>
    </div>
</div>

<div class="container">
    <div class="header-top" id="topHeader" style="display:none;">
        <span>BD FREELANCING ACADEMY</span>
        <span ontouchend="checkAdminPassword()" onclick="checkAdminPassword()" style="cursor:pointer; font-size:13px; background:rgba(0,0,0,0.2); padding:4px 8px; border-radius:4px;">⋮ এডমিন</span>
    </div>

    <div id="splashScreen" class="screen active">
        <div style="text-align:center; margin-top:80px;">
            <div style="font-size: 60px; color: var(--accent-color); font-weight:bold;">💼</div>
            <h2>BD FREELANCING ACADEMY</h2>
            <p>প্রিমিয়ার গ্লোবাল আর্নিং প্ল্যাটফর্ম</p>
            <button type="button" ontouchend="checkFirstTimeUser(); event.preventDefault();" onclick="checkFirstTimeUser()">শুরু করুন</button>
        </div>
    </div>

    <div id="registerScreen" class="screen">
        <h2>অ্যাকাউন্ট তৈরি (রেজিস্ট্রেশন)</h2>
        <p style="font-size:11px; color:#e74c3c; text-align:center; font-weight:bold;">⚠️ একবারই মাত্র রেজিস্ট্রেশন করা যাবে।</p>
        <input type="text" id="regName" placeholder="আপনার নাম">
        <input type="text" id="regPhone" placeholder="ফোন নম্বর (ইউনিক)">
        <input type="email" id="regEmail" placeholder="ইমেইল অ্যাড্রেস">
        <input type="password" id="regPassword" placeholder="পাসওয়ার্ড">
        <button type="button" ontouchend="handleRegister(); event.preventDefault();" onclick="handleRegister()">রেজিস্ট্রার করুন</button>
        <div class="switch-text" ontouchend="showLoginScreen()" onclick="showLoginScreen()">আগে থেকেই অ্যাকাউন্ট আছে? <span>লগইন করুন</span></div>
    </div>

    <div id="loginScreen" class="screen">
        <h2>লগইন করুন</h2>
        <p style="font-size:11px; color:#555; text-align:center;">আপনার নিবন্ধিত ফোন নম্বর ও পাসওয়ার্ড দিয়ে প্রবেশ করুন।</p>
        <input type="text" id="loginPhone" placeholder="ফোন নম্বর">
        <input type="password" id="loginPassword" placeholder="পাসওয়ার্ড">
        <button type="button" ontouchend="handleLogin(); event.preventDefault();" onclick="handleLogin()">লগইন করুন</button>
        <div class="switch-text" ontouchend="showRegisterScreen()" onclick="showRegisterScreen()">নতুন অ্যাকাউন্ট খুলতে চান? <span>রেজিস্ট্রেশন করুন</span></div>
    </div>

    <div id="homeScreen" class="screen">
        <div class="banner-box">
            <div class="banner-overlay">
                <h4 style="margin:0; font-size:14px; color:#ffcc00;">GLOBAL PREMIER EARNING HUB</h4>
                <p style="margin:2px 0 0 0; font-size:11px;">Complete tasks globally & earn secure daily payouts!</p>
            </div>
        </div>

        <button type="button" ontouchend="showScreen('balanceScreen'); updateBalanceUI(); event.preventDefault();" onclick="showScreen('balanceScreen'); updateBalanceUI();" style="background: linear-gradient(135deg, #0088cc, #00aced); margin-bottom: 12px; font-size: 14px;">📊 কাজের হিস্টরি ও ওয়ালেট দেখুন</button>

        <div class="task-card" ontouchend="openTask('Gmail', 13)" onclick="openTask('Gmail', 13)">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" class="task-logo" alt="Gmail">
            <div>
                <h4 style="margin:0; font-size:15px;">Gmail Submit Work</h4>
                <p style="color: #27ae60; font-weight:bold; margin:3px 0; font-size:13px;">রেট: ৳<span id="homeGmailRate">13</span> প্রতি কাজ</p>
            </div>
        </div>
        <div class="task-card" ontouchend="openTask('Facebook', 10)" onclick="openTask('Facebook', 10)">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" class="task-logo" alt="Facebook">
            <div>
                <h4 style="margin:0; font-size:15px;">Facebook Follow / Post</h4>
                <p style="color: #27ae60; font-weight:bold; margin:3px 0; font-size:13px;">রেট: ৳<span id="homeFbRate">10</span> প্রতি কাজ</p>
            </div>
        </div>
        <div class="task-card" ontouchend="openTask('Instagram', 10)" onclick="openTask('Instagram', 10)">
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" class="task-logo" alt="Instagram">
            <div>
                <h4 style="margin:0; font-size:15px;">Instagram Follow Work</h4>
                <p style="color: #27ae60; font-weight:bold; margin:3px 0; font-size:13px;">রেট: ৳<span id="homeInstaRate">10</span> প্রতি কাজ</p>
            </div>
        </div>
    </div>

    <div id="taskScreen" class="screen">
        <h2 id="taskTitle">Task Submission</h2>
        <p style="font-size:12px; color:#555; text-align:center;">তথ্য সাজানো: প্রথমে নাম, পরে জিমেইল, তারপরে পাসওয়ার্ড</p>
        <input type="text" id="taskInputName" placeholder="আপনার নাম (যে কাজ করছে)">
        <input type="email" id="taskInputGmail" placeholder="জিমেইল অ্যাড্রেস">
        <input type="text" id="taskInputPass" placeholder="জিমেইলের পাসওয়ার্ড">
        <div style="margin: 10px 0; font-size: 12px; color: #555;">
            <input type="checkbox" id="humanCheck" style="width: auto; margin-right: 5px;"> আমি রোবট নই, ম্যানুয়ালি কাজ করছি।
        </div>
        <button type="button" ontouchend="submitTask(); event.preventDefault();" onclick="submitTask()">জমা দিন (পেন্ডিং এ পাঠান)</button>
        <button type="button" style="background: #7f8c8d;" ontouchend="showScreen('homeScreen'); event.preventDefault();" onclick="showScreen('homeScreen')">ফিরে যান</button>
    </div>

    <div id="balanceScreen" class="screen">
        <h2>💰 ব্যালেন্স ও কাজের হিস্ট্রি</h2>
        <div class="card" style="background: linear-gradient(135deg, #ff8c00, #ff5500); color:white;">
            <p style="margin:0; font-size:14px;">ইনকাম ব্যালেন্স</p>
            <h1 id="bTotalBalance" style="margin:5px 0; font-size:28px;">৳0</h1>
        </div>
        <div class="card" style="text-align:left; font-size:13px;">
            <p>🔄 <strong>পেন্ডিং টাস্ক:</strong> <span id="bPendingCount" style="color:#d35400;">0 টি</span></p>
            <p>✅ <strong>অ্যাপ্রুভড টাস্ক:</strong> <span id="bApprovedCount" style="color:#27ae60;">0 টি</span></p>
        </div>
        <button type="button" ontouchend="showScreen('withdrawScreen'); event.preventDefault();" onclick="showScreen('withdrawScreen')">উইথড্র পেজে যান</button>
        <button type="button" style="background: #7f8c8d; margin-top:8px;" ontouchend="showScreen('homeScreen'); event.preventDefault();" onclick="showScreen('homeScreen')">হোমে ফিরে যান</button>
    </div>

    <div id="withdrawScreen" class="screen">
        <h2>উইথড্র করুন</h2>
        <p style="text-align:center; font-size:12px; color:#e74c3c; font-weight:bold;">⚠️ মিনিমাম উইথড্র ৫০ টাকা হতে হবে!</p>
        <select id="withdrawMethod">
            <option value="বিকাশ">বিকাশ</option>
            <option value="নগদ">নগদ</option>
        </select>
        <input type="text" id="accountNo" placeholder="বিকাশ/নগদ নম্বর">
        <input type="number" id="withdrawAmount" placeholder="টাকার পরিমাণ (কমপক্ষে ৫০ টাকা)">
        <button type="button" ontouchend="handleWithdraw(); event.preventDefault();" onclick="handleWithdraw()">উইথড্র রিকোয়েস্ট পাঠান</button>
        <button type="button" style="background: #7f8c8d; margin-top:8px;" ontouchend="showScreen('homeScreen'); event.preventDefault();" onclick="showScreen('homeScreen')">ফিরে যান</button>
    </div>

    <div id="profileScreen" class="screen">
        <div class="profile-header-card">
            <div class="profile-img-container">
                <img id="profileDisplayImg" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" class="profile-img" alt="Profile">
                <div class="camera-badge" ontouchend="document.getElementById('picUploadInput').click()" onclick="document.getElementById('picUploadInput').click()">📷</div>
            </div>
            <input type="file" id="picUploadInput" style="display:none;" accept="image/*" onchange="handleImageUpload(event)">
            <h3 style="margin:5px 0 2px 0; color:white;" id="profileHeaderName">User Name</h3>
            <p style="font-size:11px; margin:0; opacity:0.9;">আপনার account info এবং Gmail address এক জায়গা থেকে সুন্দরভাবে update করুন।</p>
        </div>

        <div class="card" style="padding: 12px; background: #fff5eb; border: 1px solid #ffd8b1; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; font-weight: bold; color: #555;">রেফার কোড:</span>
            <span id="profileReferCode" style="background: #ff7b00; color: white; padding: 6px 15px; border-radius: 8px; font-weight: bold; font-size: 14px; letter-spacing: 1px;">000000</span>
        </div>

        <div class="card" style="text-align: left; padding: 15px;">
            <div class="input-group-box">
                <label>আপনার নাম</label>
                <input type="text" id="pNameInput" placeholder="আপনার নাম">
            </div>
            <div class="input-group-box">
                <label>জিমেইল অ্যাড্রেস</label>
                <input type="email" id="pEmailInput" placeholder="জিমেইল অ্যাড্রেস">
            </div>
            <div class="input-group-box">
                <label>মোবাইল নম্বর (স্থায়ী)</label>
                <input type="text" id="pPhoneInput" disabled style="background: #f1f2f6; color: #777;" placeholder="মোবাইল নম্বর">
            </div>
            <button type="button" ontouchend="updateUserProfile(); event.preventDefault();" onclick="updateUserProfile()">প্রোফাইল আপডেট করুন</button>
        </div>

        <button type="button" style="background: #c0392b; margin-top: 10px;" ontouchend="logout(); event.preventDefault();" onclick="logout()">লগআউট করুন</button>
    </div>

    <div id="adminScreen" class="screen">
        <h2>🔒 এডমিন প্যানেল</h2>
        <div class="card" style="text-align:left; background:#fff3e0;">
            <h4>টাস্ক রেট পরিবর্তন:</h4>
            Gmail Rate (৳): <input type="number" id="adminGmailRate">
            Facebook Rate (৳): <input type="number" id="adminFbRate">
            Instagram Rate (৳): <input type="number" id="adminInstaRate">
            <button type="button" ontouchend="updateTaskRates(); event.preventDefault();" onclick="updateTaskRates()">রেট আপডেট করুন</button>
        </div>
        <h3 style="color:#d35400; margin-top:15px;">টাস্ক সাবমিশন লিস্ট</h3>
        <div id="adminTaskList"></div>
        <h3 style="color:#0088cc; margin-top:20px;">উইথড্র রিকোয়েস্ট লিস্ট</h3>
        <div id="adminWithdrawList"></div>
        <button type="button" style="background: #7f8c8d; margin-top:15px;" ontouchend="showScreen('homeScreen'); event.preventDefault();" onclick="showScreen('homeScreen')">হোমে ফিরে যান</button>
    </div>
</div>

<div class="nav-bar" id="navBar" style="display: none;">
    <div class="nav-item active-nav" ontouchend="switchNav('homeScreen', this); event.preventDefault();" onclick="switchNav('homeScreen', this)">🏠<br>হোম</div>
    <div class="nav-item" ontouchend="switchNav('balanceScreen', this); updateBalanceUI(); event.preventDefault();" onclick="switchNav('balanceScreen', this); updateBalanceUI();">💳<br>ওয়ালেট</div>
    <div class="nav-item" ontouchend="switchNav('withdrawScreen', this); event.preventDefault();" onclick="switchNav('withdrawScreen', this)">💸<br>উইথড্র</div>
    <div class="nav-item" ontouchend="switchNav('profileScreen', this); loadProfileData(); event.preventDefault();" onclick="switchNav('profileScreen', this); loadProfileData();">👤<br>প্রোফাইল</div>
</div>

<script>
    let currentUser = null;
    let taskRates = { gmail: 13, facebook: 10, instagram: 10 };

    let savedUser = localStorage.getItem('currentUser');
    if(savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
        } catch(e) {
            localStorage.removeItem('currentUser');
        }
    }

    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const targetScreen = document.getElementById(screenId);
        if(targetScreen) targetScreen.classList.add('active');
        
        if(screenId !== 'splashScreen' && screenId !== 'registerScreen' && screenId !== 'loginScreen') {
            document.getElementById('navBar').style.display = 'flex';
            document.getElementById('topHeader').style.display = 'flex';
        } else {
            document.getElementById('navBar').style.display = 'none';
            document.getElementById('topHeader').style.display = 'none';
        }
    }

    function switchNav(screenId, element) {
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active-nav'));
        element.classList.add('active-nav');
        showScreen(screenId);
    }

    function checkFirstTimeUser() {
        let isRegisteredBefore = localStorage.getItem('isRegisteredBefore');
        if(isRegisteredBefore) {
            showScreen('loginScreen');
        } else {
            showScreen('registerScreen');
        }
    }

    function showLoginScreen() { showScreen('loginScreen'); }
    function showRegisterScreen() { showScreen('registerScreen'); }

    async function handleRegister() {
        const name = document.getElementById('regName').value;
        const phone = document.getElementById('regPhone').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        if(!phone || !name || !password) { alert('সব তথ্য পূরণ করুন!'); return; }

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, email, password })
            });
            const data = await res.json();
            alert(data.message);
            if(data.success) {
                currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                localStorage.setItem('isRegisteredBefore', 'true');
                showScreen('homeScreen');
            }
        } catch(e) {
            alert('সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করুন।');
        }
    }

    async function handleLogin() {
        const phone = document.getElementById('loginPhone').value;
        const password = document.getElementById('loginPassword').value;

        if(!phone || !password) { alert('ফোন নম্বর এবং পাসওয়ার্ড দিন!'); return; }

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password })
            });
            const data = await res.json();
            if(data.success) {
                currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                localStorage.setItem('isRegisteredBefore', 'true');
                alert(data.message);
                showScreen('homeScreen');
            } else {
                alert(data.message);
            }
        } catch(e) {
            alert('সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করুন।');
        }
    }

    function logout() {
        localStorage.removeItem('currentUser');
        location.reload();
    }

    function openTask(platform, reward) {
        window.currentTaskType = platform;
        window.currentReward = reward;
        document.getElementById('taskTitle').innerText = platform + ' Task (রেট: ৳' + reward + ')';
        document.getElementById('taskInputName').value = currentUser ? currentUser.name : '';
        showScreen('taskScreen');
    }

    async function submitTask() {
        if(!document.getElementById('humanCheck').checked) { alert('রোবট নন টিক দিন!'); return; }
        const submitterName = document.getElementById('taskInputName').value;
        const gmailAddress = document.getElementById('taskInputGmail').value;
        const gmailPass = document.getElementById('taskInputPass').value;
        if(!submitterName || !gmailAddress || !gmailPass) { alert('নাম, জিমেইল এবং পাসওয়ার্ড দিন!'); return; }

        try {
            const res = await fetch('/api/submit-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: currentUser.phone, name: currentUser.name, taskType: window.currentTaskType, submitterName, gmailAddress, gmailPass, reward: window.currentReward })
            });
            const data = await res.json();
            alert(data.message);
            if(data.success) { 
                currentUser = data.user; 
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                showScreen('homeScreen'); 
            }
        } catch(e) {
            alert('সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করুন।');
        }
    }

    async function handleWithdraw() {
        const amount = Number(document.getElementById('withdrawAmount').value);
        const method = document.getElementById('withdrawMethod').value;
        const accountNo = document.getElementById('accountNo').value;
        if(amount < 50) { alert('মিনিমাম ৫০ টাকা হতে হবে!'); return; }
        if(!accountNo) { alert('অ্যাকাউন্ট নম্বর দিন!'); return; }

        try {
            const res = await fetch('/api/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: currentUser.phone, amount, method, accountNo })
            });
            const data = await res.json();
            if(data.success) {
                currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                document.getElementById('receiptAmount').innerText = '৳ ' + amount + '.00';
                document.getElementById('receiptModal').style.display = 'flex';
            } else { alert(data.message); }
        } catch(e) {
            alert('সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করুন।');
        }
    }

    function checkAdminPassword() {
        if(prompt("এডমিন পাসওয়ার্ড:") === "102050") openAdminPanel();
        else alert("ভুল পাসওয়ার্ড!");
    }

    async function openAdminPanel() {
        showScreen('adminScreen');
        try {
            const res = await fetch('/api/admin/data');
            const data = await res.json();
            document.getElementById('adminGmailRate').value = data.rates.gmail;
            document.getElementById('adminFbRate').value = data.rates.facebook;
            document.getElementById('adminInstaRate').value = data.rates.instagram;

            let listHTML = '';
            data.tasks.filter(t => t.status === 'pending').forEach(t => {
                listHTML += '<div class="card" style="text-align:left; font-size:12px; background:#f9f9f9;">' +
                    '<b>টাইপ:</b> ' + t.taskType + '<br>' +
                    '👤 <b>নাম:</b> ' + t.submitterName + '<br>' +
                    '📧 <b>জিমেইল:</b> ' + t.gmailAddress + '<br>' +
                    '🔑 <b>পাসওয়ার্ড:</b> ' + t.gmailPass + '<br>' +
                    '<div style="margin-top:8px; display:flex; gap:5px;">' +
                        '<button type="button" ontouchend="reviewTask(\'' + t.id + '\', \'approve\'); event.preventDefault();" onclick="reviewTask(\'' + t.id + '\', \'approve\')" style="padding:6px; margin:0;">Approve</button>' +
                        '<button type="button" ontouchend="reviewTask(\'' + t.id + '\', \'reject\'); event.preventDefault();" onclick="reviewTask(\'' + t.id + '\', \'reject\')" style="padding:6px; margin:0; background:#c0392b;">Reject</button>' +
                    '</div>' +
                '</div>';
            });
            document.getElementById('adminTaskList').innerHTML = listHTML || '<p style="font-size:12px; color:#777;">কোনো পেন্ডিং টাস্ক নেই</p>';

            let wdHTML = '';
            data.withdraws.filter(w => w.status === 'pending').forEach(w => {
                wdHTML += '<div class="card" style="text-align:left; font-size:12px; background:#f1f8e9;">' +
                    '👤 <b>নাম:</b> ' + w.name + ' (' + w.phone + ')<br>' +
                    '💳 <b>মেথড:</b> ' + w.method + ' | <b>নম্বর:</b> ' + w.accountNo + '<br>' +
                    '💰 <b>পরিমাণ:</b> ৳' + w.amount + '<br>' +
                    '<div style="margin-top:8px; display:flex; gap:5px;">' +
                        '<button type="button" ontouchend="reviewWithdraw(\'' + w.id + '\', \'approve\'); event.preventDefault();" onclick="reviewWithdraw(\'' + w.id + '\', \'approve\')" style="padding:6px; margin:0;">Approve</button>' +
                        '<button type="button" ontouchend="reviewWithdraw(\'' + w.id + '\', \'reject\'); event.preventDefault();" onclick="reviewWithdraw(\'' + w.id + '\', \'reject\')" style="padding:6px; margin:0; background:#c0392b;">Reject</button>' +
                    '</div>' +
                '</div>';
            });
            document.getElementById('adminWithdrawList').innerHTML = wdHTML || '<p style="font-size:12px; color:#777;">কোনো উইথড্র রিকোয়েস্ট নেই</p>';
        } catch(e) {
            console.error(e);
        }
    }

    async function reviewTask(taskId, action) {
        await fetch('/api/admin/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId, action })
        });
        openAdminPanel();
    }

    async function reviewWithdraw(withdrawId, action) {
        await fetch('/api/admin/review-withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ withdrawId, action })
        });
        openAdminPanel();
    }

    async function updateTaskRates() {
        try {
            const res = await fetch('/api/admin/rates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gmail: document.getElementById('adminGmailRate').value,
                    facebook: document.getElementById('adminFbRate').value,
                    instagram: document.getElementById('adminInstaRate').value
                })
            });
            const data = await res.json();
            taskRates = data.rates;
            document.getElementById('homeGmailRate').innerText = taskRates.gmail;
            document.getElementById('homeFbRate').innerText = taskRates.facebook;
            document.getElementById('homeInstaRate').innerText = taskRates.instagram;
            alert(data.message);
        } catch(e) {
            alert('রেট আপডেট করতে সমস্যা হয়েছে।');
        }
    }

    function loadProfileData() {
        if(currentUser) {
            document.getElementById('pNameInput').value = currentUser.name || '';
            document.getElementById('profileHeaderName').innerText = currentUser.name || '';
            document.getElementById('pEmailInput').value = currentUser.email || '';
            document.getElementById('pPhoneInput').value = currentUser.phone || '';
            document.getElementById('profileReferCode').innerText = currentUser.referCode || '621672';
            if(currentUser.profilePic) {
                document.getElementById('profileDisplayImg').src = currentUser.profilePic;
            }
        }
    }

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64Image = e.target.result;
                document.getElementById('profileDisplayImg').src = base64Image;
                currentUser.profilePic = base64Image;
                updateUserProfileToServer();
            };
            reader.readAsDataURL(file);
        }
    }

    async function updateUserProfile() {
        currentUser.name = document.getElementById('pNameInput').value;
        currentUser.email = document.getElementById('pEmailInput').value;
        document.getElementById('profileHeaderName').innerText = currentUser.name;
        await updateUserProfileToServer();
    }

    async function updateUserProfileToServer() {
        try {
            const res = await fetch('/api/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: currentUser.phone, name: currentUser.name, email: currentUser.email, profilePic: currentUser.profilePic })
            });
            const data = await res.json();
            if(data.success) {
                currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                alert(data.message);
            }
        } catch(e) {
            alert('প্রোফাইল আপডেট করতে সমস্যা হয়েছে।');
        }
    }

    function updateBalanceUI() {
        if(currentUser) {
            document.getElementById('bTotalBalance').innerText = '৳' + (currentUser.balance || 0);
            document.getElementById('bPendingCount').innerText = (currentUser.pendingCount || 0) + ' টি';
            document.getElementById('bApprovedCount').innerText = (currentUser.approvedCount || 0) + ' টি';
        }
    }
</script>
</body>
</html>`);
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running securely on port ${PORT}`);
});

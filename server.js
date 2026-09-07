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
        });
        return;
    }

    if (pathname === '/api/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const data = JSON.parse(body);
            let user = users.find(u => u.phone === data.phone && u.password === data.password);
            
            if (user) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'সফলভাবে লগইন হয়েছে!', user }));
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'ভুল ফোন নম্বর অথবা পাসওয়ার্ড!' }));
            }
        });
        return;
    }

    if (pathname === '/api/submit-task' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
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
        });
        return;
    }

    if (pathname === '/api/withdraw' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
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
        });
        return;
    }

    if (pathname === '/api/update-profile' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
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
            const data = JSON.parse(body);
            taskRates.gmail = Number(data.gmail);
            taskRates.facebook = Number(data.facebook);
            taskRates.instagram = Number(data.instagram);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'রেট আপডেট করা হয়েছে!', rates: taskRates }));
        });
        return;
    }

    if (pathname === '/api/admin/review' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
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
        });
        return;
    }

    if (pathname === '/api/admin/review-withdraw' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
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
        });
        return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<!DOCTYPE html>\n' +
'<html lang="bn">\n' +
'<head>\n' +
'    <meta charset="UTF-8">\n' +
'    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'    <title>BD Freelancing Academy</title>\n' +
'    <style>\n' +
'        :root {\n' +
'            --bg-color: #fff9f0;\n' +
'            --card-bg: #ffffff;\n' +
'            --accent-color: #ff7b00;\n' +
'            --text-color: #333333;\n' +
'            --header-bg: #ff8c00;\n' +
'        }\n' +
'        body {\n' +
'            font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif;\n' +
'            background-color: var(--bg-color);\n' +
'            color: var(--text-color);\n' +
'            margin: 0;\n' +
'            padding: 0;\n' +
'            display: flex;\n' +
'            flex-direction: column;\n' +
'            align-items: center;\n' +
'            min-height: 100vh;\n' +
'        }\n' +
'        .container {\n' +
'            width: 100%;\n' +
'            max-width: 400px;\n' +
'            padding: 12px;\n' +
'            box-sizing: border-box;\n' +
'            padding-bottom: 90px;\n' +
'        }\n' +
'        .header-top {\n' +
'            background-color: var(--header-bg);\n' +
'            color: white;\n' +
'            padding: 12px 15px;\n' +
'            display: flex;\n' +
'            justify-content: space-between;\n' +
'            align-items: center;\n' +
'            font-weight: bold;\n' +
'            border-radius: 0 0 15px 15px;\n' +
'            margin-bottom: 15px;\n' +
'            box-shadow: 0 4px 10px rgba(255, 140, 0, 0.3);\n' +
'        }\n' +
'        .screen {\n' +
'            display: none;\n' +
'            width: 100%;\n' +
'        }\n' +
'        .screen.active {\n' +
'            display: block;\n' +
'        }\n' +
'        h2, h3 {\n' +
'            text-align: center;\n' +
'            color: var(--accent-color);\n' +
'        }\n' +
'        input, select {\n' +
'            width: 100%;\n' +
'            padding: 12px;\n' +
'            margin: 8px 0;\n' +
'            background: #fff;\n' +
'            border: 1px solid #ddd;\n' +
'            border-radius: 12px;\n' +
'            color: #333;\n' +
'            box-sizing: border-box;\n' +
'        }\n' +
'        button {\n' +
'            width: 100%;\n' +
'            padding: 12px;\n' +
'            background: linear-gradient(135deg, #ff8c00, #ff5500);\n' +
'            border: none;\n' +
'            border-radius: 12px;\n' +
'            color: white;\n' +
'            font-size: 16px;\n' +
'            font-weight: bold;\n' +
'            cursor: pointer;\n' +
'            margin-top: 10px;\n' +
'            box-shadow: 0 4px 10px rgba(255, 123, 0, 0.3);\n' +
'        }\n' +
'        .card {\n' +
'            background: var(--card-bg);\n' +
'            padding: 15px;\n' +
'            border-radius: 15px;\n' +
'            margin: 12px 0;\n' +
'            border: 1px solid #eee;\n' +
'            box-shadow: 0 4px 15px rgba(0,0,0,0.05);\n' +
'            text-align: center;\n' +
'        }\n' +
'        .banner-box {\n' +
'            width: 100%;\n' +
'            height: 160px;\n' +
'            background: url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80") center/cover no-repeat;\n' +
'            border-radius: 15px;\n' +
'            margin-bottom: 15px;\n' +
'            position: relative;\n' +
'            box-shadow: 0 4px 12px rgba(0,0,0,0.15);\n' +
'        }\n' +
'        .banner-overlay {\n' +
'            position: absolute;\n' +
'            bottom: 0;\n' +
'            width: 100%;\n' +
'            background: rgba(0, 0, 0, 0.6);\n' +
'            color: white;\n' +
'            padding: 10px;\n' +
'            box-sizing: border-box;\n' +
'            border-bottom-left-radius: 15px;\n' +
'            border-bottom-right-radius: 15px;\n' +
'            text-align: center;\n' +
'        }\n' +
'        .task-card {\n' +
'            display: flex;\n' +
'            align-items: center;\n' +
'            background: #ffffff;\n' +
'            padding: 14px 15px;\n' +
'            border-radius: 15px;\n' +
'            margin: 12px 0;\n' +
'            border: 1px solid #eee;\n' +
'            box-shadow: 0 2px 8px rgba(0,0,0,0.05);\n' +
'            cursor: pointer;\n' +
'            text-align: left;\n' +
'        }\n' +
'        .task-logo {\n' +
'            width: 45px;\n' +
'            height: 45px;\n' +
'            object-fit: contain;\n' +
'            margin-right: 15px;\n' +
'            flex-shrink: 0;\n' +
'        }\n' +
'        /* Profile Screen Custom Styling */\n' +
'        .profile-header-card {\n' +
'            background: linear-gradient(135deg, #ff8c00, #ff5500);\n' +
'            color: white;\n' +
'            padding: 20px 15px;\n' +
'            border-radius: 18px;\n' +
'            text-align: center;\n' +
'            margin-bottom: 15px;\n' +
'            box-shadow: 0 6px 20px rgba(255, 140, 0, 0.3);\n' +
'        }\n' +
'        .profile-img-container {\n' +
'            position: relative;\n' +
'            width: 90px;\n' +
'            height: 90px;\n' +
'            margin: 0 auto 10px auto;\n' +
'        }\n' +
'        .profile-img {\n' +
'            width: 90px;\n' +
'            height: 90px;\n' +
'            border-radius: 50%;\n' +
'            object-fit: cover;\n' +
'            border: 3px solid #fff;\n' +
'            box-shadow: 0 4px 10px rgba(0,0,0,0.2);\n' +
'        }\n' +
'        .camera-badge {\n' +
'            position: absolute;\n' +
'            bottom: 0;\n' +
'            right: 0;\n' +
'            background: #ff5500;\n' +
'            color: white;\n' +
'            border-radius: 50%;\n' +
'            width: 28px;\n' +
'            height: 28px;\n' +
'            display: flex;\n' +
'            align-items: center;\n' +
'            justify-content: center;\n' +
'            font-size: 14px;\n' +
'            border: 2px solid white;\n' +
'            cursor: pointer;\n' +
'        }\n' +
'        .input-group-box {\n' +
'            text-align: left;\n' +
'            margin-bottom: 12px;\n' +
'        }\n' +
'        .input-group-box label {\n' +
'            font-size: 12px;\n' +
'            font-weight: bold;\n' +
'            color: #555;\n' +
'            margin-left: 5px;\n' +
'        }\n' +
'        .nav-bar {\n' +
'            position: fixed;\n' +
'            bottom: 0;\n' +
'            width: 100%;\n' +
'            max-width: 400px;\n' +
'            background: #ffffff;\n' +
'            display: flex;\n' +
'            justify-content: space-around;\n' +
'            padding: 10px 0;\n' +
'            border-top: 1px solid #eee;\n' +
'            box-shadow: -2px -5px 15px rgba(0,0,0,0.05);\n' +
'            box-sizing: border-box;\n' +
'            z-index: 99;\n' +
'        }\n' +
'        .nav-item {\n' +
'            color: #777;\n' +
'            cursor: pointer;\n' +
'            font-size: 11px;\n' +
'            text-align: center;\n' +
'            font-weight: bold;\n' +
'        }\n' +
'        .nav-item.active-nav {\n' +
'            color: var(--accent-color);\n' +
'        }\n' +
'        .modal-overlay {\n' +
'            position: fixed;\n' +
'            top: 0; left: 0; width: 100%; height: 100%;\n' +
'            background: rgba(0,0,0,0.7);\n' +
'            display: none;\n' +
'            justify-content: center;\n' +
'            align-items: center;\n' +
'            z-index: 9999;\n' +
'            padding: 15px;\n' +
'            box-sizing: border-box;\n' +
'        }\n' +
'        .modal-box {\n' +
'            background: #fff;\n' +
'            width: 100%;\n' +
'            max-width: 350px;\n' +
'            border-radius: 20px;\n' +
'            padding: 20px;\n' +
'            text-align: center;\n' +
'            box-shadow: 0 10px 25px rgba(0,0,0,0.3);\n' +
'            max-height: 90vh;\n' +
'            overflow-y: auto;\n' +
'        }\n' +
'        .switch-text {\n' +
'            text-align: center;\n' +
'            margin-top: 15px;\n' +
'            font-size: 13px;\n' +
'            color: #666;\n' +
'            cursor: pointer;\n' +
'        }\n' +
'        .switch-text span {\n' +
'            color: var(--accent-color);\n' +
'            font-weight: bold;\n' +
'        }\n' +
'    </style>\n' +
'</head>\n' +
'<body>\n' +
'\n' +
'<div id="noticeModal" class="modal-overlay" style="display:flex;">\n' +
'    <div class="modal-box">\n' +
'        <div style="width:60px; height:60px; background:linear-gradient(135deg, #0088cc, #00aced); border-radius:50%; margin:0 auto 10px auto; display:flex; justify-content:center; align-items:center; color:white; font-size:30px;">✈️</div>\n' +
'        <h3 style="margin:10px 0; color:#333;">অফিসিয়াল নোটিশ 🕹️</h3>\n' +
'        <p style="font-size: 13px; color: #555; line-height: 1.5; text-align: left;">\n' +
'            🌻 আপনি কি আমাদের প্রতিষ্ঠান থেকে ইনকাম করতে চান? কাজ করতে আমাদের অফিসিয়াল টেলিগ্রাম চ্যানেলে জয়েন করুন।\n' +
'        </p>\n' +
'        <button onclick="window.open(\'https://t.me/\', \'_blank\')" style="background: linear-gradient(135deg, #0088cc, #00aced); margin-top:10px;">📲 জয়েন করুন 📱</button>\n' +
'        <button onclick="closeNotice()" style="background: #f1f2f6; color: #333; margin-top:8px; border:1px solid #ddd;">Ok SIR 🥰</button>\n' +
'    </div>\n' +
'</div>\n' +
'\n' +
'<div id="receiptModal" class="modal-overlay">\n' +
'    <div class="modal-box" style="text-align: left; padding: 15px;">\n' +
'        <div style="text-align: center; margin-bottom: 10px;">\n' +
'            <div style="width: 40px; height: 40px; background: #e1f5fe; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #0288d1; font-size: 20px;">✓</div>\n' +
'            <p style="font-size: 11px; color: #777; margin: 2px 0;">📍 BD FREELANCING ACADEMY</p>\n' +
'            <h4 style="margin: 0; color: #222; font-size: 16px;">উইথড্র রিকোয়েস্ট নেওয়া হয়েছে</h4>\n' +
'        </div>\n' +
'        <div style="background: #f8f9fa; padding: 10px; border-radius: 10px; text-align: center; margin-bottom: 10px;">\n' +
'            <span style="font-size: 11px; color: #666;">REQUESTED AMOUNT</span>\n' +
'            <h2 id="receiptAmount" style="margin: 2px 0; color: #ff8c00;">৳ 0.00</h2>\n' +
'            <span style="font-size: 10px; background: #fff3e0; color: #d35400; padding: 2px 6px; border-radius: 4px;">⏳ Pending Review</span>\n' +
'        </div>\n' +
'        <button onclick="closeReceipt()" style="margin-top: 0; background: #2196f3;">✔ ঠিক আছে</button>\n' +
'    </div>\n' +
'</div>\n' +
'\n' +
'<div class="container">\n' +
'    <div class="header-top" id="topHeader" style="display:none;">\n' +
'        <span>BD FREELANCING ACADEMY</span>\n' +
'        <span onclick="checkAdminPassword()" style="cursor:pointer; font-size:13px; background:rgba(0,0,0,0.2); padding:4px 8px; border-radius:4px;">⋮ এডমিন</span>\n' +
'    </div>\n' +
'\n' +
'    <!-- Splash Screen -->\n' +
'    <div id="splashScreen" class="screen active">\n' +
'        <div style="text-align:center; margin-top:80px;">\n' +
'            <div style="font-size: 60px; color: var(--accent-color); font-weight:bold;">💼</div>\n' +
'            <h2>BD FREELANCING ACADEMY</h2>\n' +
'            <p>প্রিমিয়ার গ্লোবাল আর্নিং প্ল্যাটফর্ম</p>\n' +
'            <button onclick="checkFirstTimeUser()">শুরু করুন</button>\n' +
'        </div>\n' +
'    </div>\n' +
'\n' +
'    <!-- Registration Screen -->\n' +
'    <div id="registerScreen" class="screen">\n' +
'        <h2>অ্যাকাউন্ট তৈরি (রেজিস্ট্রেশন)</h2>\n' +
'        <p style="font-size:11px; color:#e74c3c; text-align:center; font-weight:bold;">⚠️ একবারই মাত্র রেজিস্ট্রেশন করা যাবে।</p>\n' +
'        <input type="text" id="regName" placeholder="আপনার নাম">\n' +
'        <input type="text" id="regPhone" placeholder="ফোন নম্বর (ইউনিক)">\n' +
'        <input type="email" id="regEmail" placeholder="ইমেইল অ্যাড্রেস">\n' +
'        <input type="password" id="regPassword" placeholder="পাসওয়ার্ড">\n' +
'        <button onclick="handleRegister()">রেজিস্ট্রার করুন</button>\n' +
'        <div class="switch-text" onclick="showLoginScreen()">আগে থেকেই অ্যাকাউন্ট আছে? <span>লগইন করুন</span></div>\n' +
'    </div>\n' +
'\n' +
'    <!-- Login Screen -->\n' +
'    <div id="loginScreen" class="screen">\n' +
'        <h2>লগইন করুন</h2>\n' +
'        <p style="font-size:11px; color:#555; text-align:center;">আপনার নিবন্ধিত ফোন নম্বর ও পাসওয়ার্ড দিয়ে প্রবেশ করুন।</p>\n' +
'        <input type="text" id="loginPhone" placeholder="ফোন নম্বর">\n' +
'        <input type="password" id="loginPassword" placeholder="পাসওয়ার্ড">\n' +
'        <button onclick="handleLogin()">লগইন করুন</button>\n' +
'        <div class="switch-text" onclick="showRegisterScreen()">নতুন অ্যাকাউন্ট খুলতে চান? <span>রেজিস্ট্রেশন করুন</span></div>\n' +
'    </div>\n' +
'\n' +
'    <!-- Home Screen -->\n' +
'    <div id="homeScreen" class="screen">\n' +
'        <div class="banner-box">\n' +
'            <div class="banner-overlay">\n' +
'                <h4 style="margin:0; font-size:14px; color:#ffcc00;">GLOBAL PREMIER EARNING HUB</h4>\n' +
'                <p style="margin:2px 0 0 0; font-size:11px;">Complete tasks globally & earn secure daily payouts!</p>\n' +
'            </div>\n' +
'        </div>\n' +
'\n' +
'        <button onclick="showScreen(\'balanceScreen\')" style="background: linear-gradient(135deg, #0088cc, #00aced); margin-bottom: 12px; font-size: 14px;">📊 কাজের হিস্টরি ও ওয়ালেট দেখুন</button>\n' +
'\n' +
'        <div class="task-card" onclick="openTask(\'Gmail\', taskRates.gmail)">\n' +
'            <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" class="task-logo" alt="Gmail">\n' +
'            <div>\n' +
'                <h4 style="margin:0; font-size:15px;">Gmail Submit Work</h4>\n' +
'                <p style="color: #27ae60; font-weight:bold; margin:3px 0; font-size:13px;">রেট: ৳<span id="homeGmailRate">13</span> প্রতি কাজ</p>\n' +
'            </div>\n' +
'        </div>\n' +
'        <div class="task-card" onclick="openTask(\'Facebook\', taskRates.facebook)">\n' +
'            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" class="task-logo" alt="Facebook">\n' +
'            <div>\n' +
'                <h4 style="margin:0; font-size:15px;">Facebook Follow / Post</h4>\n' +
'                <p style="color: #27ae60; font-weight:bold; margin:3px 0; font-size:13px;">রেট: ৳<span id="homeFbRate">10</span> প্রতি কাজ</p>\n' +
'            </div>\n' +
'        </div>\n' +
'        <div class="task-card" onclick="openTask(\'Instagram\', taskRates.instagram)">\n' +
'            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" class="task-logo" alt="Instagram">\n' +
'            <div>\n' +
'                <h4 style="margin:0; font-size:15px;">Instagram Follow Work</h4>\n' +
'                <p style="color: #27ae60; font-weight:bold; margin:3px 0; font-size:13px;">রেট: ৳<span id="homeInstaRate">10</span> প্রতি কাজ</p>\n' +
'            </div>\n' +
'        </div>\n' +
'    </div>\n' +
'\n' +
'    <div id="taskScreen" class="screen">\n' +
'        <h2 id="taskTitle">Task Submission</h2>\n' +
'        <p style="font-size:12px; color:#555; text-align:center;">তথ্য সাজানো: প্রথমে নাম, পরে জিমেইল, তারপরে পাসওয়ার্ড</p>\n' +
'        <input type="text" id="taskInputName" placeholder="আপনার নাম (যে কাজ করছে)">\n' +
'        <input type="email" id="taskInputGmail" placeholder="জিমেইল অ্যাড্রেস">\n' +
'        <input type="text" id="taskInputPass" placeholder="জিমেইলের পাসওয়ার্ড">\n' +
'        <div style="margin: 10px 0; font-size: 12px; color: #555;">\n' +
'            <input type="checkbox" id="humanCheck" style="width: auto; margin-right: 5px;"> আমি রোবট নই, ম্যানুয়ালি কাজ করছি।\n' +
'        </div>\n' +
'        <button onclick="submitTask()">জমা দিন (পেন্ডিং এ পাঠান)</button>\n' +
'        <button style="background: #7f8c8d;" onclick="showScreen(\'homeScreen\')">ফিরে যান</button>\n' +
'    </div>\n' +
'\n' +
'    <div id="balanceScreen" class="screen">\n' +
'        <h2>💰 ব্যালেন্স ও কাজের হিস্ট্রি</h2>\n' +
'        <div class="card" style="background: linear-gradient(135deg, #ff8c00, #ff5500); color:white;">\n' +
'            <p style="margin:0; font-size:14px;">ইনকাম ব্যালেন্স</p>\n' +
'            <h1 id="bTotalBalance" style="margin:5px 0; font-size:28px;">৳0</h1>\n' +
'        </div>\n' +
'        <div class="card" style="text-align:left; font-size:13px;">\n' +
'            <p>🔄 <strong>পেন্ডিং টাস্ক:</strong> <span id="bPendingCount" style="color:#d35400;">0 টি</span></p>\n' +
'            <p>✅ <strong>অ্যাপ্রুভড টাস্ক:</strong> <span id="bApprovedCount" style="color:#27ae60;">0 টি</span></p>\n' +
'        </div>\n' +
'        <button onclick="showScreen(\'withdrawScreen\')">উইথড্র পেজে যান</button>\n' +
'        <button style="background: #7f8c8d; margin-top:8px;" onclick="showScreen(\'homeScreen\')">হোমে ফিরে যান</button>\n' +
'    </div>\n' +
'\n' +
'    <div id="withdrawScreen" class="screen">\n' +
'        <h2>উইথড্র করুন</h2>\n' +
'        <p style="text-align:center; font-size:12px; color:#e74c3c; font-weight:bold;">⚠️ মিনিমাম উইথড্র ৫০ টাকা হতে হবে!</p>\n' +
'        <select id="withdrawMethod">\n' +
'            <option value="বিকাশ">বিকাশ</option>\n' +
'            <option value="নগদ">নগদ</option>\n' +
'        </select>\n' +
'        <input type="text" id="accountNo" placeholder="বিকাশ/নগদ নম্বর">\n' +
'        <input type="number" id="withdrawAmount" placeholder="টাকার পরিমাণ (কমপক্ষে ৫০ টাকা)">\n' +
'        <button onclick="handleWithdraw()">উইথড্র রিকোয়েস্ট পাঠান</button>\n' +
'        <button style="background: #7f8c8d; margin-top:8px;" onclick="showScreen(\'homeScreen\')">ফিরে যান</button>\n' +
'    </div>\n' +
'\n' +
'    <!-- প্রিমিয়ার প্রোফাইল স্ক্রিন (স্ক্রিনশট অনুযায়ী সাজানো) -->\n' +
'    <div id="profileScreen" class="screen">\n' +
'        <div class="profile-header-card">\n' +
'            <div class="profile-img-container">\n' +
'                <img id="profileDisplayImg" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" class="profile-img" alt="Profile">\n' +
'                <div class="camera-badge" onclick="document.getElementById(\'picUploadInput\').click()">📷</div>\n' +
'            </div>\n' +
'            <input type="file" id="picUploadInput" style="display:none;" accept="image/*" onchange="handleImageUpload(event)">\n' +
'            <h3 style="margin:5px 0 2px 0; color:white;" id="profileHeaderName">User Name</h3>\n' +
'            <p style="font-size:11px; margin:0; opacity:0.9;">আপনার account info এবং Gmail address এক জায়গা থেকে সুন্দরভাবে update করুন।</p>\n' +
'        </div>\n' +
'\n' +
'        <div class="card" style="padding: 12px; background: #fff5eb; border: 1px solid #ffd8b1; display: flex; justify-content: space-between; align-items: center;">\n' +
'            <span style="font-size: 13px; font-weight: bold; color: #555;">রেফার কোড:</span>\n' +
'            <span id="profileReferCode" style="background: #ff7b00; color: white; padding: 6px 15px; border-radius: 8px; font-weight: bold; font-size: 14px; letter-spacing: 1px;">000000</span>\n' +
'        </div>\n' +
'\n' +
'        <div class="card" style="text-align: left; padding: 15px;">\n' +
'            <div class="input-group-box">\n' +
'                <label>আপনার নাম</label>\n' +
'                <input type="text" id="pNameInput" placeholder="আপনার নাম">\n' +
'            </div>\n' +
'            <div class="input-group-box">\n' +
'                <label>জিমেইল অ্যাড্রেস</label>\n' +
'                <input type="email" id="pEmailInput" placeholder="জিমেইল অ্যাড্রেস">\n' +
'            </div>\n' +
'            <div class="input-group-box">\n' +
'                <label>মোবাইল নম্বর (স্থায়ী)</label>\n' +
'                <input type="text" id="pPhoneInput" disabled style="background: #f1f2f6; color: #777;" placeholder="মোবাইল নম্বর">\n' +
'            </div>\n' +
'            <button onclick="updateUserProfile()">প্রোফাইল আপডেট করুন</button>\n' +
'        </div>\n' +
'\n' +
'        <button style="background: #c0392b; margin-top: 10px;" onclick="logout()">লগআউট করুন</button>\n' +
'    </div>\n' +
'\n' +
'    <div id="adminScreen" class="screen">\n' +
'        <h2>🔒 এডমিন প্যানেল</h2>\n' +
'        <div class="card" style="text-align:left; background:#fff3e0;">\n' +
'            <h4>টাস্ক রেট পরিবর্তন:</h4>\n' +
'            Gmail Rate (৳): <input type="number" id="adminGmailRate">\n' +
'            Facebook Rate (৳): <input type="number" id="adminFbRate">\n' +
'            Instagram Rate (৳): <input type="number" id="adminInstaRate">\n' +
'            <button onclick="updateTaskRates()">রেট আপডেট করুন</button>\n' +
'        </div>\n' +
'        <h3 style="color:#d35400; margin-top:15px;">টাস্ক সাবমিশন লিস্ট</h3>\n' +
'        <div id="adminTaskList"></div>\n' +
'        <h3 style="color:#0088cc; margin-top:20px;">উইথড্র রিকোয়েস্ট লিস্ট</h3>\n' +
'        <div id="adminWithdrawList"></div>\n' +
'        <button style="background: #7f8c8d; margin-top:15px;" onclick="showScreen(\'homeScreen\')">হোমে ফিরে যান</button>\n' +
'    </div>\n' +
'</div>\n' +
'\n' +
'<div class="nav-bar" id="navBar" style="display: none;">\n' +
'    <div class="nav-item active-nav" onclick="switchNav(this, \'homeScreen\')">🏠<br>হোম</div>\n' +
'    <div class="nav-item" onclick="switchNav(this, \'balanceScreen\')">💳<br>ওয়ালেট</div>\n' +
'    <div class="nav-item" onclick="switchNav(this, \'withdrawScreen\')">💸<br>উইথড্র</div>\n' +
'    <div class="nav-item" onclick="switchNav(this, \'profileScreen\')">👤<br>প্রোফাইল</div>\n' +
'</div>\n' +
'\n' +
'<script>\n' +
'    let currentUser = null;\n' +
'    let taskRates = { gmail: 13, facebook: 10, instagram: 10 };\n' +
'\n' +
'    window.onload = function() {\n' +
'        let savedUser = localStorage.getItem(\'currentUser\');\n' +
'        if(savedUser) {\n' +
'            currentUser = JSON.parse(savedUser);\n' +
'            showScreen(\'homeScreen\');\n' +
'        }\n' +
'    }\n' +
'\n' +
'    function closeNotice() { document.getElementById(\'noticeModal\').style.display = \'none\'; }\n' +
'    function closeReceipt() { document.getElementById(\'receiptModal\').style.display = \'none\'; showScreen(\'homeScreen\'); }\n' +
'\n' +
'    function showScreen(screenId) {\n' +
'        document.querySelectorAll(\'.screen\').forEach(s => s.classList.remove(\'active\'));\n' +
'        document.getElementById(screenId).classList.add(\'active\');\n' +
'        if(screenId !== \'splashScreen\' && screenId !== \'registerScreen\' && screenId !== \'loginScreen\') {\n' +
'            document.getElementById(\'navBar\').style.display = \'flex\';\n' +
'            document.getElementById(\'topHeader\').style.display = \'flex\';\n' +
'        } else {\n' +
'            document.getElementById(\'navBar\').style.display = \'none\';\n' +
'            document.getElementById(\'topHeader\').style.display = \'none\';\n' +
'        }\n' +
'    }\n' +
'\n' +
'    function checkFirstTimeUser() {\n' +
'        let isRegisteredBefore = localStorage.getItem(\'isRegisteredBefore\');\n' +
'        if(isRegisteredBefore) {\n' +
'            showScreen(\'loginScreen\');\n' +
'        } else {\n' +
'            showScreen(\'registerScreen\');\n' +
'        }\n' +
'    }\n' +
'\n' +
'    function showLoginScreen() { showScreen(\'loginScreen\'); }\n' +
'    function showRegisterScreen() { showScreen(\'registerScreen\'); }\n' +
'\n' +
'    function switchNav(element, screenId) {\n' +
'        document.querySelectorAll(\'.nav-item\').forEach(item => item.classList.remove(\'active-nav\'));\n' +
'        element.classList.add(\'active-nav\');\n' +
'        showScreen(screenId);\n' +
'        if(screenId === \'balanceScreen\') updateBalanceUI();\n' +
'        if(screenId === \'profileScreen\') loadProfileData();\n' +
'    }\n' +
'\n' +
'    async function handleRegister() {\n' +
'        const name = document.getElementById(\'regName\').value;\n' +
'        const phone = document.getElementById(\'regPhone\').value;\n' +
'        const email = document.getElementById(\'regEmail\').value;\n' +
'        const password = document.getElementById(\'regPassword\').value;\n' +
'\n' +
'        if(!phone || !name || !password) { alert(\'সব তথ্য পূরণ করুন!\'); return; }\n' +
'\n' +
'        const res = await fetch(\'/api/register\', {\n' +
'            method: \'POST\',\n' +
'            headers: { \'Content-Type\': \'application/json\' },\n' +
'            body: JSON.stringify({ name, phone, email, password })\n' +
'        });\n' +
'        const data = await res.json();\n' +
'        alert(data.message);\n' +
'        if(data.success) {\n' +
'            currentUser = data.user;\n' +
'            localStorage.setItem(\'currentUser\', JSON.stringify(currentUser));\n' +
'            localStorage.setItem(\'isRegisteredBefore\', \'true\');\n' +
'            showScreen(\'homeScreen\');\n' +
'        }\n' +
'    }\n' +
'\n' +
'    async function handleLogin() {\n' +
'        const phone = document.getElementById(\'loginPhone\').value;\n' +
'        const password = document.getElementById(\'loginPassword\').value;\n' +
'\n' +
'        if(!phone || !password) { alert(\'ফোন নম্বর এবং পাসওয়ার্ড দিন!\'); return; }\n' +
'\n' +
'        const res = await fetch(\'/api/login\', {\n' +
'            method: \'POST\',\n' +
'            headers: { \'Content-Type\': \'application/json\' },\n' +
'            body: JSON.stringify({ phone, password })\n' +
'        });\n' +
'        const data = await res.json();\n' +
'        if(data.success) {\n' +
'            currentUser = data.user;\n' +
'            localStorage.setItem(\'currentUser\', JSON.stringify(currentUser));\n' +
'            localStorage.setItem(\'isRegisteredBefore\', \'true\');\n' +
'            alert(data.message);\n' +
'            showScreen(\'homeScreen\');\n' +
'        } else {\n' +
'            alert(data.message);\n' +
'        }\n' +
'    }\n' +
'\n' +
'    function logout() {\n' +
'        localStorage.removeItem(\'currentUser\');\n' +
'        location.reload();\n' +
'    }\n' +
'\n' +
'    function openTask(platform, reward) {\n' +
'        window.currentTaskType = platform;\n' +
'        window.currentReward = reward;\n' +
'        document.getElementById(\'taskTitle\').innerText = platform + \' Task (রেট: ৳\' + reward + \')\';\n' +
'        document.getElementById(\'taskInputName\').value = currentUser ? currentUser.name : \'\';\n' +
'        showScreen(\'taskScreen\');\n' +
'    }\n' +
'\n' +
'    async function submitTask() {\n' +
'        if(!document.getElementById(\'humanCheck\').checked) { alert(\'রোবট নন টিক দিন!\'); return; }\n' +
'        const submitterName = document.getElementById(\'taskInputName\').value;\n' +
'        const gmailAddress = document.getElementById(\'taskInputGmail\').value;\n' +
'        const gmailPass = document.getElementById(\'taskInputPass\').value;\n' +
'        if(!submitterName || !gmailAddress || !gmailPass) { alert(\'নাম, জিমেইল এবং পাসওয়ার্ড দিন!\'); return; }\n' +
'\n' +
'        const res = await fetch(\'/api/submit-task\', {\n' +
'            method: \'POST\',\n' +
'            headers: { \'Content-Type\': \'application/json\' },\n' +
'            body: JSON.stringify({ phone: currentUser.phone, name: currentUser.name, taskType: window.currentTaskType, submitterName, gmailAddress, gmailPass, reward: window.currentReward })\n' +
'        });\n' +
'        const data = await res.json();\n' +
'        alert(data.message);\n' +
'        if(data.success) { \n' +
'            currentUser = data.user; \n' +
'            localStorage.setItem(\'currentUser\', JSON.stringify(currentUser));\n' +
'            showScreen(\'homeScreen\'); \n' +
'        }\n' +
'    }\n' +
'\n' +
'    async function handleWithdraw() {\n' +
'        const amount = Number(document.getElementById(\'withdrawAmount\').value);\n' +
'        const method = document.getElementById(\'withdrawMethod\').value;\n' +
'        const accountNo = document.getElementById(\'accountNo\').value;\n' +
'        if(amount < 50) { alert(\'মিনিমাম ৫০ টাকা হতে হবে!\'); return; }\n' +
'        if(!accountNo) { alert(\'অ্যাকাউন্ট নম্বর দিন!\'); return; }\n' +
'\n' +
'        const res = await fetch(\'/api/withdraw\', {\n' +
'            method: \'POST\',\n' +
'            headers: { \'Content-Type\': \'application/json\' },\n' +
'            body: JSON.stringify({ phone: currentUser.phone, amount, method, accountNo })\n' +
'        });\n' +
'        const data = await res.json();\n' +
'        if(data.success) {\n' +
'            currentUser = data.user;\n' +
'            localStorage.setItem(\'currentUser\', JSON.stringify(currentUser));\n' +
'            document.getElementById(\'receiptAmount\').innerText = \'৳ \' + amount + \'.00\';\n' +
'            document.getElementById(\'receiptModal\').style.display = \'flex\';\n' +
'        } else { alert(data.message); }\n' +
'    }\n' +
'\n' +
'    function checkAdminPassword() {\n' +
'        if(prompt("এডমিন পাসওয়ার্ড:") === "102050") openAdminPanel();\n' +
'        else alert("ভুল পাসওয়ার্ড!");\n' +
'    }\n' +
'\n' +
'    async function openAdminPanel() {\n' +
'        showScreen(\'adminScreen\');\n' +
'        const res = await fetch(\'/api/admin/data\');\n' +
'        const data = await res.json();\n' +
'        document.getElementById(\'adminGmailRate\').value = data.rates.gmail;\n' +
'        document.getElementById(\'adminFbRate\').value = data.rates.facebook;\n' +
'        document.getElementById(\'adminInstaRate\').value = data.rates.instagram;\n' +
'\n' +
'        let listHTML = \'\';\n' +
'        data.tasks.filter(t => t.status === \'pending\').forEach(t => {\n' +
'            listHTML += \'<div class="card" style="text-align:left; font-size:12px; background:#f9f9f9;">\' +\n' +
'                \'<b>টাইপ:</b> \' + t.taskType + \'<br>\' +\n' +
'                \'👤 <b>নাম:</b> \' + t.submitterName + \'<br>\' +\n' +
'                \'📧 <b>জিমেইল:</b> \' + t.gmailAddress + \'<br>\' +\n' +
'                \'🔑 <b>পাসওয়ার্ড:</b> \' + t.gmailPass + \'<br>\' +\n' +
'                \'<div style="margin-top:8px; display:flex; gap:5px;">\' +\n' +
'                    \'<button style="padding:6px; margin:0;" onclick="reviewTask(\\\'\' + t.id + \'\\\', \\\'approve\\\')">Approve</button>\' +\n' +
'                    \'<button style="padding:6px; margin:0; background:#c0392b;" onclick="reviewTask(\\\'\' + t.id + \'\\\', \\\'reject\\\')">Reject</button>\' +\n' +
'                \'</div>\' +\n' +
'            \'</div>\';\n' +
'        });\n' +
'        document.getElementById(\'adminTaskList\').innerHTML = listHTML || \'<p style="font-size:12px; color:#777;">কোনো পেন্ডিং টাস্ক নেই</p>\';\n' +
'\n' +
'        let wdHTML = \'\';\n' +
'        data.withdraws.filter(w => w.status === \'pending\').forEach(w => {\n' +
'            wdHTML += \'<div class="card" style="text-align:left; font-size:12px; background:#f1f8e9;">\' +\n' +
'                \'👤 <b>নাম:</b> \' + w.name + \' (' + w.phone + \')<br>\' +\n' +
'                \'💳 <b>মেথড:</b> \' + w.method + \' | <b>নম্বর:</b> \' + w.accountNo + \'<br>\' +\n' +
'                \'💰 <b>পরিমাণ:</b> ৳\' + w.amount + \'<br>\' +\n' +
'                \'<div style="margin-top:8px; display:flex; gap:5px;">\' +\n' +
'                    \'<button style="padding:6px; margin:0;" onclick="reviewWithdraw(\\\'\' + w.id + \'\\\', \\\'approve\\\')">Approve</button>\' +\n' +
'                    \'<button style="padding:6px; margin:0; background:#c0392b;" onclick="reviewWithdraw(\\\'\' + w.id + \'\\\', \\\'reject\\\')">Reject</button>\' +\n' +
'                \'</div>\' +\n' +
'            \'</div>\';\n' +
'        });\n' +
'        document.getElementById(\'adminWithdrawList\').innerHTML = wdHTML || \'<p style="font-size:12px; color:#777;">কোনো উইথড্র রিকোয়েস্ট নেই</p>\';\n' +
'    }\n' +
'\n' +
'    async function reviewTask(taskId, action) {\n' +
'        await fetch(\'/api/admin/review\', {\n' +
'            method: \'POST\',\n' +
'            headers: { \'Content-Type\': \'application/json\' },\n' +
'            body: JSON.stringify({ taskId, action })\n' +
'        });\n' +
'        openAdminPanel();\n' +
'    }\n' +
'\n' +
'    async function reviewWithdraw(withdrawId, action) {\n' +
'        await fetch(\'/api/admin/review-withdraw\', {\n' +
'            method: \'POST\',\n' +
'            headers: { \'Content-Type\': \'application/json\' },\n' +
'            body: JSON.stringify({ withdrawId, action })\n' +
'        });\n' +
'        openAdminPanel();\n' +
'    }\n' +
'\n' +
'    async function updateTaskRates() {\n' +
'        const res = await fetch(\'/api/admin/rates\', {\n' +
'            method: \'POST\',\n' +
'            headers: { \'Content-Type\': \'application/json\' },\n' +
'            body: JSON.stringify({\n' +
'                gmail: document.getElementById(\'adminGmailRate\').value,\n' +
'                facebook: document.getElementById(\'adminFbRate\').value,\n' +
'                instagram: document.getElementById(\'adminInstaRate\').value\n' +
'            })\n' +
'        });\n' +
'        const data = await res.json();\n' +
'        taskRates = data.rates;\n' +
'        document.getElementById(\'homeGmailRate\').innerText = taskRates.gmail;\n' +
'        document.getElementById(\'homeFbRate\').innerText = taskRates.facebook;\n' +
'        document.getElementById(\'homeInstaRate\').innerText = taskRates.instagram;\n' +
'        alert(data.message);\n' +
'    }\n' +
'\n' +
'    function loadProfileData() {\n' +
'        if(currentUser) {\n' +
'            document.getElementById(\'pNameInput\').value = currentUser.name;\n' +
'            document.getElementById(\'profileHeaderName\').innerText = currentUser.name;\n' +
'            document.getElementById(\'pEmailInput\').value = currentUser.email || \'\';\n' +
'            document.getElementById(\'pPhoneInput\').value = currentUser.phone || \'\';\n' +
'            document.getElementById(\'profileReferCode\').innerText = currentUser.referCode || \'621672\';\n' +
'            if(currentUser.profilePic) {\n' +
'                document.getElementById(\'profileDisplayImg\').src = currentUser.profilePic;\n' +
'            }\n' +
'        }\n' +
'    }\n' +
'\n' +
'    function handleImageUpload(event) {\n' +
'        const file = event.target.files[0];\n' +
'        if(file) {\n' +
'            const reader = new FileReader();\n' +
'            reader.onload = function(e) {\n' +
'                const base64Image = e.target.result;\n' +
'                document.getElementById(\'profileDisplayImg\').src = base64Image;\n' +
'                currentUser.profilePic = base64Image;\n' +
'                updateUserProfileToServer();\n' +
'            };\n' +
'            reader.readAsDataURL(file);\n' +
'        }\n' +
'    }\n' +
'\n' +
'    async function updateUserProfile() {\n' +
'        currentUser.name = document.getElementById(\'pNameInput\').value;\n' +
'        currentUser.email = document.getElementById(\'pEmailInput\').value;\n' +
'        document.getElementById(\'profileHeaderName\').innerText = currentUser.name;\n' +
'        await updateUserProfileToServer();\n' +
'    }\n' +
'\n' +
'    async function updateUserProfileToServer() {\n' +
'        const res = await fetch(\'/api/update-profile\', {\n' +
'            method: \'POST\',\n' +
'            headers: { \'Content-Type\': \'application/json\' },\n' +
'            body: JSON.stringify({ phone: currentUser.phone, name: currentUser.name, email: currentUser.email, profilePic: currentUser.profilePic })\n' +
'        });\n' +
'        const data = await res.json();\n' +
'        if(data.success) {\n' +
'            currentUser = data.user;\n' +
'            localStorage.setItem(\'currentUser\', JSON.stringify(currentUser));\n' +
'            alert(data.message);\n' +
'        }\n' +
'    }\n' +
'\n' +
'    function updateBalanceUI() {\n' +
'        if(currentUser) {\n' +
'            document.getElementById(\'bTotalBalance\').innerText = \'৳\' + currentUser.balance;\n' +
'            document.getElementById(\'bPendingCount\').innerText = (currentUser.pendingCount || 0) + \' টি\';\n' +
'            document.getElementById(\'bApprovedCount\').innerText = (currentUser.approvedCount || 0) + \' টি\';\n' +
'        }\n' +
'    }\n' +
'</script>\n' +
'</body>\n' +
'</html>');
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running securely on port ${PORT}`);
});

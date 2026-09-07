const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let users = [];
let adminTasks = [];

let taskRates = {
    gmail: 13,
    facebook: 10,
    instagram: 10
};

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
            height: 150px;
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

        .modal-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7);
            display: none;
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
            animation: fadeIn 0.3s ease-in-out;
            max-height: 90vh;
            overflow-y: auto;
        }
        @keyframes fadeIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
    </style>
</head>
<body>

<!-- অফিসিয়াল টেলিগ্রাম নোটিশ পপআপ -->
<div id="noticeModal" class="modal-overlay">
    <div class="modal-box">
        <div style="width:60px; height:60px; background:linear-gradient(135deg, #0088cc, #00aced); border-radius:50%; margin:0 auto 10px auto; display:flex; justify-content:center; align-items:center; color:white; font-size:30px;">
            ✈️
        </div>
        <h3 style="margin:10px 0; color:#333;">অফিসিয়াল নোটিশ 🕹️</h3>
        <p style="font-size: 13px; color: #555; line-height: 1.5; text-align: left;">
            🌻 আপনি কি আমাদের প্রতিষ্ঠান থেকে ইনকাম করতে চান? ! 🎗️ কাজ কোথায় পাবেন? 🎗️ কাজ আমরাই দিবো ✅ 🎗️ ২২ টি প্রজেক্টে কাজ করার সুযোগ 😊 🎗️ তাহলে আর দেরি কিসের আজকেই জয়েন করুন আমাদের অফিসিয়াল চ্যানেলে 📱 সবার আগে কাজ পেতে এখনই Official Telegram Channel-Join করুন। 👇👇👇👇👇👇👇👇👇👇👇
        </p>
        <button onclick="window.open('https://t.me/', '_blank')" style="background: linear-gradient(135deg, #0088cc, #00aced); margin-top:10px;">📲 জয়েন করুন 📱</button>
        <button onclick="closeNotice()" style="background: #f1f2f6; color: #333; margin-top:8px; border:1px solid #ddd;">Ok SIR 🥰</button>
    </div>
</div>

<!-- প্রিমিয়ার উইথড্র রসিদ পপআপ -->
<div id="receiptModal" class="modal-overlay">
    <div class="modal-box" style="text-align: left; padding: 15px;">
        <div style="text-align: center; margin-bottom: 10px;">
            <div style="width: 40px; height: 40px; background: #e1f5fe; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #0288d1; font-size: 20px;">✓</div>
            <p style="font-size: 11px; color: #777; margin: 2px 0;">📍 BD FREELANCING ACADEMY</p>
            <h4 style="margin: 0; color: #222; font-size: 16px;">উইথড্র রিকোয়েস্ট নেওয়া হয়েছে</h4>
            <p style="font-size: 11px; color: #555; margin: 4px 0;">রিকোয়েস্টটি এখন review queue-তে আছে। approve হলে টাকা আপনার selected method-এ পাঠানো হবে।</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 10px; border-radius: 10px; text-align: center; margin-bottom: 10px;">
            <span style="font-size: 11px; color: #666;">REQUESTED AMOUNT</span>
            <h2 id="receiptAmount" style="margin: 2px 0; color: #ff8c00;">৳ 0.00</h2>
            <span style="font-size: 10px; background: #fff3e0; color: #d35400; padding: 2px 6px; border-radius: 4px;">⏳ Pending Review</span>
            <span style="font-size: 10px; background: #e3f2fd; color: #1976d2; padding: 2px 6px; border-radius: 4px; margin-left:4px;">💳 জিমেইল ওয়ালেট</span>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 11px; background: #fff; padding: 8px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 5px;">
            <div>
                <span style="color: #888; display: block;">TRANSACTION ID</span>
                <strong id="receiptTxId" style="color: #333;">XVTV8RME</strong>
            </div>
            <div>
                <span style="color: #888; display: block;">METHOD</span>
                <strong id="receiptMethod" style="color: #333;">বিকাশ</strong>
            </div>
        </div>

        <div style="font-size: 11px; background: #fff; padding: 8px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 5px;">
            <span style="color: #888; display: block;">WALLET SOURCE</span>
            <strong style="color: #333;">জিমেইল ওয়ালেট</strong>
        </div>

        <div style="font-size: 11px; background: #fff; padding: 8px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 10px;">
            <span style="color: #888; display: block;">SUBMITTED AT</span>
            <strong id="receiptTime" style="color: #333;">06 Sep 2026, 04:21 PM</strong>
        </div>

        <div style="text-align: center; font-size: 11px; color: #0088cc; margin-bottom: 10px; cursor: pointer;">
            ✈️ সাপোর্ট এডমিন
        </div>

        <button onclick="closeReceipt()" style="margin-top: 0; background: #2196f3;">✔ ঠিক আছে</button>
    </div>
</div>

<div class="container">
    <div class="header-top" id="topHeader" style="display:none;">
        <span>BD FREELANCING ACADEMY</span>
        <span onclick="checkAdminPassword()" style="cursor:pointer; font-size:13px; background:rgba(0,0,0,0.2); padding:4px 8px; border-radius:4px;">⋮ এডমিন</span>
    </div>

    <!-- ১. স্প্ল্যাশ স্ক্রিন -->
    <div id="splashScreen" class="screen active">
        <div style="text-align:center; margin-top:80px;">
            <div style="font-size: 60px; color: var(--accent-color); font-weight:bold;">💼</div>
            <h2>BD FREELANCING ACADEMY</h2>
            <p>প্রিমিয়ার গ্লোবাল আর্নিং প্ল্যাটফর্ম</p>
            <button onclick="showScreen('authScreen')">শুরু করুন</button>
        </div>
    </div>

    <!-- ২. রেজিস্ট্রেশন স্ক্রিন (একবারই অ্যাকাউন্ট খোলা যাবে) -->
    <div id="authScreen" class="screen">
        <h2>অ্যাকাউন্ট তৈরি</h2>
        <p style="font-size:11px; color:#e74c3c; text-align:center; font-weight:bold;">⚠️ একবারই মাত্র রেজিস্ট্রেশন করা যাবে। একই ফোন নম্বর দিয়ে দ্বিতীয়বার অ্যাকাউন্ট খোলা যাবে না!</p>
        <input type="text" id="name" placeholder="আপনার নাম">
        <input type="text" id="phone" placeholder="ফোন নম্বর (ইউনিক - একবারই ব্যবহারযোগ্য)">
        <input type="email" id="email" placeholder="ইমেইল অ্যাড্রেস">
        <input type="password" id="password" placeholder="পাসওয়ার্ড">
        <button onclick="handleAuth()">রেজিস্ট্রার / লগইন</button>
    </div>

    <!-- ৩. হোম পেজ -->
    <div id="homeScreen" class="screen">
        <div class="card">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c" class="banner-img" alt="Global Banner">
            <h3 style="margin:5px 0; color:var(--accent-color);">PREMIER GLOBAL HUB</h3>
            <p style="font-size: 12px; color: #555; font-weight:500;">সোশ্যাল মিডিয়া টাস্ক সম্পন্ন করে প্রতিদিন ঘরে বসে নিশ্চিত আয় করুন।</p>
        </div>

        <div class="task-card" onclick="openTask('Gmail', taskRates.gmail)">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" class="task-logo" alt="Gmail">
            <div>
                <h4 style="margin:0; font-size:15px; color:#333;">Gmail Submit Work</h4>
                <p style="color: #27ae60; font-weight:bold; margin:3px 0; font-size:13px;">রেট: ৳<span id="homeGmailRate">13</span> প্রতি কাজ</p>
                <p style="font-size:11px; color:#777; margin:0;">জিমেইল নাম ও পাসওয়ার্ড দিয়ে সাবমিট করুন</p>
            </div>
        </div>

        <div class="task-card" onclick="openTask('Facebook', taskRates.facebook)">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" class="task-logo" alt="Facebook">
            <div>
                <h4 style="margin:0; font-size:15px; color:#333;">Facebook Follow / Post</h4>
                <p style="color: #27ae60; font-weight:bold; margin:3px 0; font-size:13px;">রেট: ৳<span id="homeFbRate">10</span> প্রতি কাজ</p>
                <p style="font-size:11px; color:#777; margin:0;">প্রুফ লিংক ও ডিটেইলস দিয়ে সাবমিট করুন</p>
            </div>
        </div>

        <div class="task-card" onclick="openTask('Instagram', taskRates.instagram)">
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" class="task-logo" alt="Instagram">
            <div>
                <h4 style="margin:0; font-size:15px; color:#333;">Instagram Follow Work</h4>
                <p style="color: #27ae60; font-weight:bold; margin:3px 0; font-size:13px;">রেট: ৳<span id="homeInstaRate">10</span> প্রতি কাজ</p>
                <p style="font-size:11px; color:#777; margin:0;">ইনস্টাগ্রাম প্রোফাইল লিংক দিয়ে সাবমিট করুন</p>
            </div>
        </div>
    </div>

    <!-- ৪. টাস্ক সাবমিশন স্ক্রিন -->
    <div id="taskScreen" class="screen">
        <h2 id="taskTitle">Task Submission</h2>
        <input type="text" id="taskInput1" placeholder="প্রুফ লিংক বা ইউজারনেম">
        <input type="text" id="taskInput2" placeholder="পাসওয়ার্ড বা অতিরিক্ত বিবরণী">
        <div style="margin: 10px 0; font-size: 12px; color: #555;">
            <input type="checkbox" id="humanCheck" style="width: auto; margin-right: 5px;"> আমি রোবট নই, ম্যানুয়ালি কাজ করছি।
        </div>
        <button onclick="submitTask()">জমা দিন (পেন্ডিং এ পাঠান)</button>
        <button style="background: #7f8c8d;" onclick="showScreen('homeScreen')">ফিরে যান</button>
    </div>

    <!-- ৫. ব্যালেন্স / ওয়ালেট স্ক্রিন -->
    <div id="balanceScreen" class="screen">
        <h2>💰 ব্যালেন্স ও কাজের হিস্ট্রি</h2>
        <div class="card" style="background: linear-gradient(135deg, #ff8c00, #ff5500); color:white;">
            <p style="margin:0; font-size:14px;">ইনকাম ব্যালেন্স</p>
            <h1 id="bTotalBalance" style="margin:5px 0; font-size:28px;">৳0</h1>
        </div>
        <div class="card" style="text-align:left; font-size:13px;">
            <p>🔄 <strong>কনফার্মেশন / পেন্ডিং:</strong> <span id="bPendingCount" style="color:#d35400; font-weight:bold;">0 টি</span></p>
            <p>✅ <strong>অ্যাপ্রুভ কাজ:</strong> <span id="bApprovedCount" style="color:#27ae60; font-weight:bold;">0 টি</span></p>
            <p>⏳ <strong>রিভিউ কাজ:</strong> <span id="bReviewCount" style="color:#2980b9; font-weight:bold;">0 টি</span></p>
            <p>❌ <strong>রিজেক্ট কাজ:</strong> <span id="bRejectCount" style="color:#c0392b; font-weight:bold;">0 টি</span></p>
        </div>
        <button onclick="showScreen('withdrawScreen')">উইথড্র পেজে যান</button>
    </div>

    <!-- ৬. উইথড্র স্ক্রিন -->
    <div id="withdrawScreen" class="screen">
        <h2>উইথড্র করুন</h2>
        <p style="text-align:center; font-size:12px; color:#e74c3c; font-weight:bold;">⚠️ মিনিমাম উইথড্র ৫০ টাকা হতে হবে! এর কম হলে উইথড্র হবে না।</p>
        <select id="withdrawMethod">
            <option value="বিকাশ">বিকাশ</option>
            <option value="নগদ">নগদ</option>
        </select>
        <input type="text" id="accountNo" placeholder="বিকাশ/নগদ নম্বর">
        <input type="number" id="withdrawAmount" placeholder="টাকার পরিমাণ (কমপক্ষে ৫০ টাকা)">
        <button onclick="handleWithdraw()">উইথড্র রিকোয়েস্ট পাঠান</button>
    </div>

    <!-- ৭. প্রোফাইল স্ক্রিন -->
    <div id="profileScreen" class="screen">
        <div class="card" style="background: linear-gradient(135deg, #ff8c00, #ff5500); color:white; padding:15px; border-radius:15px;">
            <p style="margin:0; font-size:14px; font-weight:bold;">👤 PROFILE</p>
            <p style="font-size:11px; margin:3px 0 10px 0;">আপনার account info এবং Gmail address এক জায়গা থেকে সুন্দরভাবে update করুন।</p>
        </div>

        <div class="card" style="position: relative; padding-top: 20px;">
            <div style="width:90px; height:90px; border-radius:50%; margin:0 auto 10px auto; border:3px solid #ff8c00; overflow:hidden; background:#eee; position:relative;">
                <img id="profileImagePreview" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb" style="width:100%; height:100%; object-fit:cover;">
                <label style="position:absolute; bottom:0; width:100%; background:rgba(0,0,0,0.6); color:white; font-size:10px; cursor:pointer; padding:2px 0;">
                    ক্যামেরা <input type="file" id="imageUploadInput" accept="image/*" style="display:none;" onchange="previewProfileImage(event)">
                </label>
            </div>
            <h3 id="pName" style="margin:5px 0; display:inline-block;">N/A</h3>
            <span style="color:#2980b9; font-size:16px;" title="Verified">✔</span>
        </div>

        <div class="card" style="text-align:left; background:#fff;">
            <p style="font-size:12px; color:#777; margin-bottom:5px;">রেফার কোড:</p>
            <div style="background:#fff3e0; padding:10px; border-radius:8px; text-align:center; font-weight:bold; color:#ff8c00; border:1px dashed #ff8c00;">621672</div>
            
            <p style="font-size:12px; color:#777; margin-top:10px;">আপনার নাম</p>
            <input type="text" id="pNameInput" style="margin:2px 0 10px 0;">

            <p style="font-size:12px; color:#777; margin-top:5px;">জিমেইল এড্রেস</p>
            <input type="email" id="pEmailInput" style="margin:2px 0 10px 0;">

            <p style="font-size:12px; color:#777; margin-top:5px;">মোবাইল নম্বর</p>
            <input type="text" id="pPhoneInput" readonly style="background:#f5f5f5; margin:2px 0 10px 0;">
            
            <button onclick="updateUserProfile()">প্রোফাইল আপডেট করুন</button>
        </div>
        <button style="background: #c0392b; margin-top:10px;" onclick="location.reload()">লগআউট</button>
    </div>

    <!-- ৮. সিকিউরড এডমিন প্যানেল -->
    <div id="adminScreen" class="screen">
        <h2>🔒 এডমিন প্যানেল</h2>
        
        <div class="card" style="text-align:left; background:#fff3e0;">
            <h4 style="margin:0 0 8px 0; color:#ff8c00;">টাস্ক রেট পরিবর্তন করুন:</h4>
            <div style="font-size:12px; margin-bottom:5px;">Gmail Rate (৳):</div>
            <input type="number" id="adminGmailRate" style="margin:0 0 8px 0; padding:8px;">
            
            <div style="font-size:12px; margin-bottom:5px;">Facebook Rate (৳):</div>
            <input type="number" id="adminFbRate" style="margin:0 0 8px 0; padding:8px;">
            
            <div style="font-size:12px; margin-bottom:5px;">Instagram Rate (৳):</div>
            <input type="number" id="adminInstaRate" style="margin:0 0 8px 0; padding:8px;">
            
            <button onclick="updateTaskRates()" style="padding:8px; font-size:14px;">রেট আপডেট করুন</button>
        </div>

        <p style="font-size:12px; text-align:center; color:#666; font-weight:bold;">ইউজারদের পেন্ডিং কাজের তালিকা:</p>
        <div id="adminTaskList" style="max-height: 350px; overflow-y: auto;"></div>
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

    window.onload = function() {
        document.getElementById('noticeModal').style.display = 'flex';
    };

    function closeNotice() {
        document.getElementById('noticeModal').style.display = 'none';
    }

    function closeReceipt() {
        document.getElementById('receiptModal').style.display = 'none';
        showScreen('homeScreen');
    }

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
        if(screenId === 'profileScreen') loadProfileData();
    }

    // একবারের বেশি রেজিস্ট্রেশন ব্লক করার সিকিউরড ফাংশন
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
            showScreen('homeScreen');
        }
    }

    function openTask(platform, reward) {
        window.currentTaskType = platform;
        window.currentReward = reward;
        document.getElementById('taskTitle').innerText = platform + ' Task (রেট: ৳' + reward + ')';
        if(platform === 'Gmail') {
            document.getElementById('taskInput1').placeholder = 'জিমেইল নাম বা ইউজারনেম';
            document.getElementById('taskInput2').placeholder = 'জিমেইল পাসওয়ার্ড';
        } else {
            document.getElementById('taskInput1').placeholder = 'প্রুফ লিংক (Profile/Post Link)';
            document.getElementById('taskInput2').placeholder = 'কাজের বিবরণী বা স্ক্রিনশট লিংক';
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
                taskType: window.currentTaskType,
                input1, 
                input2, 
                reward: window.currentReward 
            })
        });
        const data = await res.json();

        alert(data.message);
        if(data.success) {
            currentUser = data.user;
            document.getElementById('humanCheck').checked = false;
            document.getElementById('taskInput1').value = '';
            document.getElementById('taskInput2').value = '';
            showScreen('homeScreen');
        }
    }

    async function handleWithdraw() {
        const amount = Number(document.getElementById('withdrawAmount').value);
        const accountNo = document.getElementById('accountNo').value;
        const method = document.getElementById('withdrawMethod').value;

        if(!accountNo || !amount) {
            alert('দয়া করে সঠিক নম্বর এবং টাকার পরিমাণ লিখুন!');
            return;
        }

        if(amount < 50) {
            alert('⚠️ দুঃখিত! মিনিমাম উইথড্র ৫০ টাকা হতে হবে। আপনার ব্যালেন্স বা পরিমাণ ৫০ টাকার কম রয়েছে।');
            return;
        }

        if(currentUser.balance < amount) {
            alert('⚠️ আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই!');
            return;
        }

        const res = await fetch('/api/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: currentUser.phone, amount })
        });
        const data = await res.json();

        if(data.success) {
            currentUser = data.user;
            
            document.getElementById('receiptAmount').innerText = '৳ ' + amount + '.00';
            document.getElementById('receiptTxId').innerText = 'TXN' + Math.floor(100000 + Math.random() * 900000);
            document.getElementById('receiptMethod').innerText = method;
            
            const now = new Date();
            document.getElementById('receiptTime').innerText = now.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'}) + ', ' + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            document.getElementById('receiptModal').style.display = 'flex';
        } else {
            alert(data.message);
        }
    }

    function checkAdminPassword() {
        let pass = prompt("এডমিন প্যানেলে প্রবেশ করতে পাসওয়ার্ড দিন:");
        if(pass === "102050") {
            openAdminPanel();
        } else if(pass !== null) {
            alert("ভুল পাসওয়ার্ড!");
        }
    }

    async function openAdminPanel() {
        showScreen('adminScreen');
        const res = await fetch('/api/admin/data');
        const data = await res.json();
        
        document.getElementById('adminGmailRate').value = data.rates.gmail;
        document.getElementById('adminFbRate').value = data.rates.facebook;
        document.getElementById('adminInstaRate').value = data.rates.instagram;

        let listHTML = '';
        const pendingTasks = data.tasks.filter(t => t.status === 'pending');
        
        if(pendingTasks.length === 0) {
            listHTML = '<p style="text-align:center; color:#888;">কোনো পেন্ডিং কাজের রিকোয়েস্ট নেই।</p>';
        } else {
            pendingTasks.forEach((t) => {
                listHTML += `<div class="card" style="text-align:left; font-size:12px; padding:10px;">
                    <p style="margin:2px 0;"><strong>টাস্ক:</strong> ${t.taskType} (৳${t.reward})</p>
                    <p style="margin:2px 0;"><strong>ইউজার:</strong> ${t.userName} (${t.phone})</p>
                    <p style="margin:2px 0; color:#ff8c00;"><strong>তথ্য ১:</strong> ${t.input1}</p>
                    <p style="margin:2px 0;"><strong>তথ্য ২:</strong> ${t.input2}</p>
                    <div style="margin-top:8px; display:flex; gap:5px;">
                        <button style="padding:6px; background:#27ae60; margin:0;" onclick="reviewTask('${t.id}', 'approve')">Approve</button>
                        <button style="padding:6px; background:#c0392b; margin:0;" onclick="reviewTask('${t.id}', 'reject')">Reject</button>
                    </div>
                </div>`;
            });
        }
        document.getElementById('adminTaskList').innerHTML = listHTML;
    }

    async function reviewTask(taskId, action) {
        const res = await fetch('/api/admin/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId, action })
        });
        const data = await res.json();
        alert(data.message);
        openAdminPanel();
    }

    async function updateTaskRates() {
        const gmail = document.getElementById('adminGmailRate').value;
        const facebook = document.getElementById('adminFbRate').value;
        const instagram = document.getElementById('adminInstaRate').value;

        const res = await fetch('/api/admin/rates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gmail, facebook, instagram })
        });
        const data = await res.json();
        alert(data.message);
        taskRates = data.rates;
        updateHomeRatesUI();
    }

    function updateHomeRatesUI() {
        document.getElementById('homeGmailRate').innerText = taskRates.gmail;
        document.getElementById('homeFbRate').innerText = taskRates.facebook;
        document.getElementById('homeInstaRate').innerText = taskRates.instagram;
    }

    function loadProfileData() {
        if(currentUser) {
            document.getElementById('pName').innerText = currentUser.name;
            document.getElementById('pNameInput').value = currentUser.name;
            document.getElementById('pEmailInput').value = currentUser.email || '';
            document.getElementById('pPhoneInput').value = currentUser.phone;
        }
    }

    function previewProfileImage(event) {
        const reader = new FileReader();
        reader.onload = function(){
            document.getElementById('profileImagePreview').src = reader.result;
        }
        reader.readAsDataURL(event.target.files[0]);
    }

    async function updateUserProfile() {
        const newName = document.getElementById('pNameInput').value;
        const newEmail = document.getElementById('pEmailInput').value;

        const res = await fetch('/api/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: currentUser.phone, name: newName, email: newEmail })
        });
        const data = await res.json();
        alert(data.message);
        if(data.success) {
            currentUser = data.user;
            loadProfileData();
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

// ব্যাকএন্ড: দ্বিতীয়বার রেজিস্ট্রেশন করার সুযোগ ব্লক করার লজিক
app.post('/api/auth', (req, res) => {
    const { name, phone, email, password } = req.body;
    let existingUser = users.find(u => u.phone === phone);
    
    if (existingUser) {
        // যদি ইতিমধ্যে একাউন্ট থেকে থাকে, তবে দ্বিতীয়বার রেজিস্ট্রেশন করতে না দিয়ে শুধুমাত্র লগইন করাবে
        return res.json({ 
            success: true, 
            message: 'এই ফোন নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট রেজিস্ট্রেশন করা হয়েছে। সফলভাবে লগইন সম্পন্ন হয়েছে!', 
            user: existingUser 
        });
    }

    // নতুন ইউজারের জন্য প্রথমবার রেজিস্ট্রেশন সম্পন্ন করা
    const newUser = { 
        name, phone, email, password, balance: 0, 
        pendingCount: 0, approvedCount: 0, reviewCount: 0, rejectCount: 0 
    };
    users.push(newUser);
    res.json({ success: true, message: 'সফলভাবে প্রথমবার রেজিস্ট্রেশন সম্পন্ন হয়েছে!', user: newUser });
});

app.post('/api/submit-task', (req, res) => {
    const { phone, name, taskType, input1, input2, reward } = req.body;
    const user = users.find(u => u.phone === phone);
    if (user) {
        const newTask = {
            id: Date.now().toString(),
            phone,
            userName: name,
            taskType,
            input1,
            input2,
            reward: Number(reward),
            status: 'pending'
        };
        adminTasks.push(newTask);
        user.reviewCount = (user.reviewCount || 0) + 1;
        user.pendingCount = (user.pendingCount || 0) + 1;
        
        res.json({ success: true, message: 'টাস্ক সফলভাবে জমা হয়েছে এবং এডমিন প্যানেলে পেন্ডিং রাখা হয়েছে!', user });
    } else {
        res.status(400).json({ success: false, message: 'ইউজার পাওয়া যায়নি!' });
    }
});

app.post('/api/withdraw', (req, res) => {
    const { phone, amount } = req.body;
    const user = users.find(u => u.phone === phone);
    if (user && user.balance >= Number(amount)) {
        user.balance -= Number(amount);
        res.json({ success: true, message: 'উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে!', user });
    } else {
        res.status(400).json({ success: false, message: 'অপর্যাপ্ত ব্যালেন্স বা ভুল পরিমাণ!' });
    }
});

app.post('/api/update-profile', (req, res) => {
    const { phone, name, email } = req.body;
    const user = users.find(u => u.phone === phone);
    if(user) {
        user.name = name;
        user.email = email;
        res.json({ success: true, message: 'প্রোফাইল সফলভাবে আপডেট হয়েছে!', user });
    } else {
        res.status(400).json({ success: false, message: 'ইউজার পাওয়া যায়নি!' });
    }
});

app.get('/api/admin/data', (req, res) => {
    res.json({ success: true, tasks: adminTasks, rates: taskRates });
});

app.post('/api/admin/rates', (req, res) => {
    const { gmail, facebook, instagram } = req.body;
    taskRates.gmail = Number(gmail);
    taskRates.facebook = Number(facebook);
    taskRates.instagram = Number(instagram);
    res.json({ success: true, message: 'টাস্ক রেট সফলভাবে আপডেট করা হয়েছে!', rates: taskRates });
});

app.post('/api/admin/review', (req, res) => {
    const { taskId, action } = req.body;
    const task = adminTasks.find(t => t.id === taskId);
    if(task) {
        const user = users.find(u => u.phone === task.phone);
        if(action === 'approve') {
            task.status = 'approved';
            if(user) {
                user.balance += task.reward;
                user.approvedCount = (user.approvedCount || 0) + 1;
                user.pendingCount = Math.max(0, (user.pendingCount || 1) - 1);
                user.reviewCount = Math.max(0, (user.reviewCount || 1) - 1);
            }
            res.json({ success: true, message: 'টাস্ক সফলভাবে Approve করা হয়েছে এবং ইউজারের ব্যালেন্সে টাকা যোগ হয়ে গেছে।' });
        } else if(action === 'reject') {
            task.status = 'rejected';
            if(user) {
                user.rejectCount = (user.rejectCount || 0) + 1;
                user.pendingCount = Math.max(0, (user.pendingCount || 1) - 1);
                user.reviewCount = Math.max(0, (user.reviewCount || 1) - 1);
            }
            res.json({ success: true, message: 'টাস্ক Reject করা হয়েছে।' });
        }
    } else {
        res.status(404).json({ success: false, message: 'টাস্ক পাওয়া যায়নি!' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running securely on port ${PORT}`);
});

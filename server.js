const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// স্ট্যাটিক ফোল্ডার (ফ্রন্টএন্ড ফাইলের জন্য)
app.use(express.static(path.join(__dirname, 'public')));

// ডেমো ডাটাবেস (বাস্তব প্রজেক্টে MongoDB বা MySQL ব্যবহার করবেন)
let users = [];
let tasks = [
    { id: 1, title: 'Facebook Task', reward: 5 },
    { id: 2, title: 'Gmail Submit', reward: 10 },
    { id: 3, title: 'Instagram Task', reward: 5 }
];

// রেজিস্ট্রেশন বা লগইন API
app.post('/api/auth', (req, res) => {
    const { name, phone, email, password } = req.body;
    let user = users.find(u => u.phone === phone);
    
    if (!user) {
        user = { name, phone, email, password, balance: 0 };
        users.push(user);
    }
    res.json({ success: true, message: 'Login/Registration Successful', user });
});

// ব্যালেন্স ও প্রোফাইল ডাটা ফেচ করার API
app.get('/api/user/:phone', (req, res) => {
    const user = users.find(u => u.phone === req.params.phone);
    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(404).json({ success: false, message: 'User not found' });
    }
});

// উইথড্র রিকোয়েস্ট API
app.post('/api/withdraw', (req, res) => {
    const { phone, method, accountNo, amount } = req.body;
    const user = users.find(u => u.phone === phone);
    
    if (user && user.balance >= amount) {
        user.balance -= Number(amount);
        res.json({ success: true, message: 'Withdrawal request submitted successfully!' });
    } else {
        res.status(400).json({ success: false, message: 'Insufficient balance or invalid user!' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

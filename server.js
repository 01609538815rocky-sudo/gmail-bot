const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// মিডলওয়্যার কনফিগারেশন
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ডেটাবেস বা মেমোরি অ্যারে (এখানে ইউজারের জমা দেওয়া সকল রিকোয়েস্ট জমা থাকবে)
let requestsDatabase = [
    {
        id: 1,
        userId: "7572",
        category: "Gmail Sale",
        info: "anikaxx800@gmail.com / pass1234",
        amount: "10.00",
        status: "PENDING"
    }
];

// ২. এডমিন প্যানেল ইন্টারফেস (ওয়েব ভিউ)
app.get('/', (req, res) => {
    let html = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
        <meta charset="UTF-8">
        <title>Admin Panel - Freelance Hub</title>
        <style>
            body { font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; }
            h2 { color: #333; }
            table { width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #1e293b; color: #fff; }
            .status-pending { color: #d97706; font-weight: bold; }
            .status-approved { color: #16a34a; font-weight: bold; }
            .status-rejected { color: #dc2626; font-weight: bold; }
            select, button { padding: 6px 10px; border-radius: 4px; border: 1px solid #ccc; }
            button { background: #2563eb; color: white; cursor: pointer; border: none; }
            button:hover { background: #1d4ed8; }
        </style>
    </head>
    <body>
        <h2>🛠️ Admin Panel - User Requests</h2>
        <table>
            <tr>
                <th>ID</th>
                <th>User ID</th>
                <th>Category</th>
                <th>Credentials / Info</th>
                <th>Amount (BDT)</th>
                <th>Status</th>
                <th>Action</th>
            </tr>`;

    requestsDatabase.forEach(item => {
        let statusClass = `status-${item.status.toLowerCase()}`;
        html += `
            <tr>
                <td>${item.id}</td>
                <td>${item.userId}</td>
                <td><b>${item.category}</b></td>
                <td>${item.info}</td>
                <td>৳${item.amount}</td>
                <td><span class="${statusClass}">${item.status}</span></td>
                <td>
                    <form action="/update-status" method="POST" style="display:flex; gap:5px;">
                        <input type="hidden" name="id" value="${item.id}">
                        <select name="status">
                            <option value="PENDING" ${item.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                            <option value="APPROVED" ${item.status === 'APPROVED' ? 'selected' : ''}>Approve</option>
                            <option value="REJECTED" ${item.status === 'REJECTED' ? 'selected' : ''}>Reject</option>
                        </select>
                        <button type="submit">✔</button>
                    </form>
                </td>
            </tr>`;
    });

    html += `</table></body></html>`;
    res.send(html);
});

// ৩. মোবাইল অ্যাপ থেকে রিকোয়েস্ট রিসিভ করার API (Gmail Sale / Deposit ইত্যাদি)
app.post('/api/submit-request', (req, res) => {
    const { userId, category, info, amount } = req.body;
    
    if (!userId || !category || !info) {
        return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    const newRequest = {
        id: requestsDatabase.length + 1,
        userId: userId,
        category: category, // যেমন: Gmail Sale, Deposit ইত্যাদি
        info: info,
        amount: amount || "0.00",
        status: "PENDING"
    };

    requestsDatabase.push(newRequest);
    res.json({ success: true, message: "Request submitted successfully!", data: newRequest });
});

// ৪. এডমিন প্যানেল থেকে স্ট্যাটাস আপডেট করার রাউট
app.post('/update-status', (req, res) => {
    const { id, status } = req.body;
    const requestItem = requestsDatabase.find(r => r.id == id);
    
    if (requestItem) {
        requestItem.status = status;
    }
    
    res.redirect('/');
});

// সার্ভার রান করা
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

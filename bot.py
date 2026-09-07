import os
import sqlite3
import threading
from functools import wraps
from flask import Flask, request, redirect, session, url_for, render_template_string, flash
from werkzeug.security import generate_password_hash, check_password_hash
from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "kajghor-secret-key")

DB = "kajghor.db"

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        balance REAL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        budget REAL NOT NULL,
        worker_pay REAL NOT NULL,
        status TEXT DEFAULT 'open',
        buyer_id INTEGER NOT NULL,
        worker_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        worker_id INTEGER NOT NULL,
        proof TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    demo_users = [
        ("Admin", "admin@kajghor.local", "admin123", "admin"),
        ("Demo Buyer", "buyer@kajghor.local", "buyer123", "buyer"),
        ("Demo Worker", "worker@kajghor.local", "worker123", "worker")
    ]
    for name, email, password, role in demo_users:
        try:
            conn.execute("INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)",
                         (name, email, generate_password_hash(password), role))
        except sqlite3.IntegrityError:
            pass
    conn.commit()
    conn.close()

def current_user():
    if "user_id" not in session:
        return None
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE id=?", (session["user_id"],)).fetchone()
    conn.close()
    return user

def login_required(role=None):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            user = current_user()
            if not user:
                return redirect(url_for("login"))
            if role and user["role"] != role:
                return redirect(url_for("home"))
            return func(*args, **kwargs)
        return wrapper
    return decorator

BASE = """
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>কাজঘর</title>
<style>
body{margin:0;font-family:Arial,sans-serif;background:#f4f7fb;color:#172033;}
nav{background:#152238;color:white;padding:16px 6%;display:flex;justify-content:space-between;align-items:center;}
nav a{color:white;text-decoration:none;margin-left:12px;}
.container{max-width:1050px;margin:auto;padding:25px 18px;}
.hero{background:linear-gradient(135deg,#175cff,#673ab7);color:white;padding:40px 25px;border-radius:20px;margin-bottom:25px;}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:18px;}
.card{background:white;padding:20px;border-radius:16px;box-shadow:0 5px 20px rgba(0,0,0,.07);margin-bottom:18px;}
input,textarea,select{width:100%;padding:13px;margin:8px 0;border:1px solid #ccd4e0;border-radius:9px;font-size:15px;}
button,.btn{border:0;background:#1769e0;color:white;padding:11px 17px;border-radius:9px;cursor:pointer;text-decoration:none;display:inline-block;margin-top:8px;}
.danger{background:#d62828;}
.success{background:#198754;}
.flash{padding:13px;border-radius:10px;background:#e8f0ff;margin-bottom:15px;}
.stat{font-size:28px;font-weight:bold;}
</style>
</head>
<body>
<nav>
<div style="font-size:22px;font-weight:bold;">🏠 কাজঘর</div>
<div>
<a href="/">হোম</a>
{% if user %}
<a href="/dashboard">Dashboard</a>
{% if user["role"]=="buyer" %}<a href="/buyer/new">কাজ যোগ</a>{% endif %}
{% if user["role"]=="admin" %}<a href="/admin">Admin</a>{% endif %}
<a href="/logout">Logout</a>
{% else %}
<a href="/login">Login</a>
<a href="/register">Register</a>
{% endif %}
</div>
</nav>
<div class="container">
{% with messages = get_flashed_messages() %}
{% for message in messages %}<div class="flash">{{ message }}</div>{% endfor %}
{% endwith %}
{{ content|safe }}
</div>
<footer style="text-align:center;padding:30px;color:#777;">কাজঘর © 2026</footer>
</body>
</html>
"""

def page(content):
    return render_template_string(BASE, content=content, user=current_user())

@app.route("/")
def home():
    conn = get_db()
    tasks = conn.execute("SELECT tasks.*, users.name AS buyer_name FROM tasks JOIN users ON users.id=tasks.buyer_id WHERE tasks.status='open' ORDER BY tasks.id DESC").fetchall()
    conn.close()
    html = """
    <div class="hero">
    <h1>কাজঘর</h1>
    <p>বৈধ অনলাইন কাজের Buyer ও Worker-কে একটি সহজ প্ল্যাটফর্মে যুক্ত করুন।</p>
    {% if not user %}<a class="btn" href="/register">এখনই শুরু করুন</a>{% endif %}
    </div>
    <h2>📋 Available কাজ</h2>
    <div class="grid">
    {% for task in tasks %}
    <div class="card">
    <h3>{{ task["title"] }}</h3>
    <p>{{ task["description"] }}</p>
    <p>💰 Worker Pay: <b>৳{{ "%.2f"|format(task["worker_pay"]) }}</b></p>
    <a class="btn" href="/task/{{ task["id"] }}">বিস্তারিত</a>
    </div>
    {% else %}
    <div class="card"><p>এখন কোনো কাজ available নেই।</p></div>
    {% endfor %}
    </div>
    """
    return page(render_template_string(html, tasks=tasks, user=current_user()))

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name, email, password, role = request.form["name"].strip(), request.form["email"].strip().lower(), request.form["password"], request.form["role"]
        if len(password) < 6:
            flash("Password কমপক্ষে ৬ অক্ষরের দিন।")
            return redirect(url_for("register"))
        conn = get_db()
        try:
            cur = conn.execute("INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)", (name, email, generate_password_hash(password), role))
            conn.commit()
            session["user_id"] = cur.lastrowid
            flash("অ্যাকাউন্ট তৈরি হয়েছে।")
            return redirect(url_for("home"))
        except sqlite3.IntegrityError:
            flash("এই email ইতিমধ্যে ব্যবহার হয়েছে।")
        finally:
            conn.close()
    return page('<div class="card"><h2>📝 Register</h2><form method="POST"><input name="name" placeholder="আপনার নাম" required><input name="email" type="email" placeholder="Email" required><input name="password" type="password" placeholder="Password" required><select name="role"><option value="worker">Worker</option><option value="buyer">Buyer</option></select><button>Account তৈরি করুন</button></form></div>')

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email, password = request.form["email"].strip().lower(), request.form["password"]
        conn = get_db()
        user = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        conn.close()
        if user and check_password_hash(user["password"], password):
            session["user_id"] = user["id"]
            return redirect(url_for("home"))
        flash("Email অথবা Password ভুল।")
    return page('<div class="card"><h2>🔐 Login</h2><form method="POST"><input name="email" type="email" placeholder="Email" required><input name="password" type="password" placeholder="Password" required><button>Login</button></form><hr><p><b>Demo Worker:</b> worker@kajghor.local / worker123</p><p><b>Demo Buyer:</b> buyer@kajghor.local / buyer123</p><p><b>Demo Admin:</b> admin@kajghor.local / admin123</p></div>')

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("home"))

@app.route("/buyer/new", methods=["GET", "POST"])
@login_required("buyer")
def new_task():
    if request.method == "POST":
        title, description = request.form["title"].strip(), request.form["description"].strip()
        try:
            budget, worker_pay = float(request.form["budget"]), float(request.form["worker_pay"])
        except ValueError:
            flash("টাকার পরিমাণ সঠিকভাবে দিন।")
            return redirect(url_for("new_task"))
        conn = get_db()
        conn.execute("INSERT INTO tasks(title,description,budget,worker_pay,buyer_id) VALUES(?,?,?,?,?)", (title, description, budget, worker_pay, session["user_id"]))
        conn.commit()
        conn.close()
        flash("কাজ সফলভাবে পোস্ট হয়েছে।")
        return redirect(url_for("dashboard"))
    return page('<div class="card"><h2>➕ নতুন কাজ যোগ করুন</h2><form method="POST"><input name="title" placeholder="কাজের নাম" required><textarea name="description" placeholder="কাজের বিস্তারিত" required></textarea><input name="budget" type="number" step="0.01" placeholder="মোট বাজেট" required><input name="worker_pay" type="number" step="0.01" placeholder="Worker কত পাবে" required><button>কাজ পোস্ট করুন</button></form></div>')

@app.route("/task/<int:task_id>")
def task_details(task_id):
    conn = get_db()
    task = conn.execute("SELECT tasks.*, users.name AS buyer_name FROM tasks JOIN users ON users.id=tasks.buyer_id WHERE tasks.id=?", (task_id,)).fetchone()
    conn.close()
    if not task: return "কাজ পাওয়া যায়নি", 404
    html = '<div class="card"><h2>{{ task["title"] }}</h2><p>{{ task["description"] }}</p><hr><p>💵 মোট বাজেট: <b>৳{{ "%.2f"|format(task["budget"]) }}</b></p><p>👷 Worker Pay: <b>৳{{ "%.2f"|format(task["worker_pay"]) }}</b></p>{% if user and user["role"]=="worker" and task["status"]=="open" %}<form method="POST" action="/task/{{ task["id"] }}/take"><button>কাজটি নিন</button></form>{% endif %}</div>'
    return page(render_template_string(html, task=task, user=current_user()))

@app.route("/task/<int:task_id>/take", methods=["POST"])
@login_required("worker")
def take_task(task_id):
    conn = get_db()
    cursor = conn.execute("UPDATE tasks SET worker_id=?, status='working' WHERE id=? AND status='open'", (session["user_id"], task_id))
    conn.commit()
    conn.close()
    if cursor.rowcount == 0:
        flash("কাজটি আর available নেই।")
        return redirect(url_for("home"))
    flash("কাজটি আপনার নামে নেওয়া হয়েছে।")
    return redirect(url_for("dashboard"))

@app.route("/task/<int:task_id>/submit", methods=["POST"])
@login_required("worker")
def submit_task(task_id):
    proof = request.form["proof"].strip()
    conn = get_db()
    conn.execute("INSERT INTO submissions(task_id,worker_id,proof) VALUES(?,?,?)", (task_id, session["user_id"], proof))
    conn.execute("UPDATE tasks SET status='submitted' WHERE id=?", (task_id,))
    conn.commit()
    conn.close()
    flash("কাজের submission পাঠানো হয়েছে।")
    return redirect(url_for("dashboard"))

@app.route("/dashboard")
@login_required()
def dashboard():
    user = current_user()
    conn = get_db()
    if user["role"] == "worker":
        rows = conn.execute("SELECT tasks.*, submissions.id AS submission_id, submissions.status AS submission_status FROM tasks LEFT JOIN submissions ON submissions.task_id=tasks.id AND submissions.worker_id=? WHERE tasks.worker_id=? ORDER BY tasks.id DESC", (user["id"], user["id"])).fetchall()
    else:
        rows = conn.execute("SELECT * FROM tasks WHERE buyer_id=? ORDER BY id DESC", (user["id"],)).fetchall()
    conn.close()
    html = """
    <h2>📊 Dashboard</h2>
    <div class="grid">
    <div class="card"><h3>💰 Balance</h3><div class="stat">৳{{ "%.2f"|format(user["balance"]) }}</div></div>
    <div class="card"><h3>👤 Role</h3><div class="stat">{{ user["role"] }}</div></div>
    </div>
    {% if user["role"]=="worker" %}
    <h2>আমার কাজ</h2>
    {% for task in rows %}
    <div class="card">
    <h3>{{ task["title"] }}</h3>
    <p>Status: <b>{{ task["status"] }}</b></p>
    {% if task["status"]=="working" %}
    <form method="POST" action="/task/{{ task["id"] }}/submit"><textarea name="proof" placeholder="কাজের প্রমাণ লিখুন" required></textarea><button>📤 Submit</button></form>
    {% elif task["submission_status"] %}<p>Submission: <b>{{ task["submission_status"] }}</b></p>{% endif %}
    </div>
    {% endfor %}
    {% else %}
    <h2>আমার পোস্ট করা কাজ</h2>
    {% for task in rows %}<div class="card"><h3>{{ task["title"] }}</h3><p>Status: <b>{{ task["status"] }}</b></p></div>{% endfor %}
    {% endif %}
    """
    return page(render_template_string(html, user=user, rows=rows))

@app.route("/admin")
@login_required("admin")
def admin():
    conn = get_db()
    submissions = conn.execute("SELECT submissions.*, tasks.title, users.name AS worker_name, tasks.worker_pay FROM submissions JOIN tasks ON tasks.id=submissions.task_id JOIN users ON users.id=submissions.worker_id ORDER BY submissions.id DESC").fetchall()
    conn.close()
    html = """
    <h2>👑 Admin Panel - Submission Review</h2>
    {% for s in submissions %}
    <div class="card">
    <h3>{{ s["title"] }}</h3>
    <p>Worker: <b>{{ s["worker_name"] }}</b></p>
    <p>Proof: {{ s["proof"] }}</p>
    <p>Status: <b>{{ s["status"] }}</b></p>
    {% if s["status"]=="pending" %}
    <form method="POST" action="/admin/submission/{{ s["id"] }}/approve" style="display:inline"><button class="success">✅ Approve</button></form>
    <form method="POST" action="/admin/submission/{{ s["id"] }}/reject" style="display:inline"><button class="danger">❌ Reject</button></form>
    {% endif %}
    </div>
    {% else %}<div class="card"><p>কোনো submission নেই।</p></div>{% endfor %}
    """
    return page(render_template_string(html, submissions=submissions))

@app.route("/admin/submission/<int:submission_id>/<action>", methods=["POST"])
@login_required("admin")
def review_submission(submission_id, action):
    conn = get_db()
    sub = conn.execute("SELECT submissions.*, tasks.worker_pay, tasks.id AS task_id FROM submissions JOIN tasks ON tasks.id=submissions.task_id WHERE submissions.id=?", (submission_id,)).fetchone()
    if sub and sub["status"] == "pending":
        if action == "approve":
            conn.execute("UPDATE submissions SET status='approved' WHERE id=?", (submission_id,))
            conn.execute("UPDATE tasks SET status='completed' WHERE id=?", (sub["task_id"],))
            conn.execute("UPDATE users SET balance=balance+? WHERE id=?", (sub["worker_pay"], sub["worker_id"]))
            flash("Approve সফল হয়েছে এবং ব্যালেন্স যোগ হয়েছে।")
        else:
            conn.execute("UPDATE submissions SET status='rejected' WHERE id=?", (submission_id,))
            conn.execute("UPDATE tasks SET status='open', worker_id=NULL WHERE id=?", (sub["task_id"],))
            flash("Reject করা হয়েছে।")
        conn.commit()
    conn.close()
    return redirect(url_for("admin"))

# --- Telegram Bot Setup ---
TELEGRAM_BOT_TOKEN = "8948563757:AAHvkFlRIWd0BSfYCz6BVNHeNnONWJmjJbU"

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("স্বাগতম! কাজঘর টেলিগ্রাম বটে আপনাকে স্বাগতম।")

def run_telegram_bot():
    app_bot = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()
    app_bot.add_handler(CommandHandler("start", start_command))
    app_bot.run_polling()

if __name__ == "__main__":
    init_db()
    # টেলিগ্রাম বট চালানোর জন্য ব্যাকগ্রাউন্ড থ্রেড তৈরি করা হচ্ছে
    bot_thread = threading.Thread(target=run_telegram_bot, daemon=True)
    bot_thread.start()
    
    # Flask ওয়েব অ্যাপ রান করা হচ্ছে
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)

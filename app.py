from flask import Flask, render_template, request, redirect, url_for, jsonify
from manage_disasters import save_report, get_all_reports
import os

app = Flask(__name__)
CRED_FILE = "credentials.txt"

# ------------------------ Auth ----------------------------

def load_users():
    if not os.path.exists(CRED_FILE):
        return {}
    with open(CRED_FILE, "r") as f:
        lines = f.read().splitlines()
    return {line.split(":")[0]: line.split(":")[1] for line in lines if ":" in line}

def save_user(username, password):
    with open(CRED_FILE, "a") as f:
        f.write(f"{username}:{password}\n")

@app.route("/")
def home():
    return redirect(url_for("login"))

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        users = load_users()
        username = request.form["username"]
        password = request.form["password"]
        if username in users and users[username] == password:
            return redirect(url_for("report"))
        else:
            return "<h2 style='color:red;text-align:center;'>Invalid Credentials</h2>"
    return render_template("login.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        users = load_users()
        username = request.form["username"]
        password = request.form["password"]
        if username in users:
            return "<h2 style='color:red;text-align:center;'>Username already exists</h2>"
        save_user(username, password)
        return redirect(url_for("success"))
    return render_template("register.html")

@app.route("/success")
def success():
    return render_template("success.html")

# ------------------- Disaster Reporting -------------------

@app.route("/report")
def report():
    return render_template("index.html")

@app.route("/submit-report", methods=["POST"])
def submit_report():
    try:
        data = request.get_json()
        result = save_report(
            data.get("title"),
            data.get("description"),
            float(data.get("user_lat")),
            float(data.get("user_lng")),
            float(data.get("disaster_lat")),
            float(data.get("disaster_lng")),
        )
        return jsonify(result)
    except Exception as e:
        print("Error occurred:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/get-disasters")
def get_disasters():
    return jsonify(get_all_reports())

# --------------------- Start App --------------------------

if __name__ == "__main__":
    app.run(debug=True)

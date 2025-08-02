from flask import Flask, render_template, request, redirect, url_for
import os

app = Flask(__name__)
FILE = "credentials.txt"

def load_users():
    if not os.path.exists(FILE):
        return {}
    with open(FILE, "r") as f:
        lines = f.read().splitlines()
    return {line.split(":")[0]: line.split(":")[1] for line in lines if ":" in line}

def save_user(username, password):
    with open(FILE, "a") as f:
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
            return "<h2 style='color:green;text-align:center;'>Login Successful!</h2>"
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

if __name__ == "__main__":
    app.run(debug=True)

import os

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

def register():
    users = load_users()
    username = input("Choose username: ")
    if username in users:
        print("Username exists.")
        return
    password = input("Choose password: ")
    save_user(username, password)
    print("Registered successfully.")

def login():
    users = load_users()
    username = input("Username: ")
    password = input("Password: ")
    if username in users and users[username] == password:
        print("Login successful.")
    else:
        print("Invalid credentials.")

def main():
    while True:
        choice = input("1. Register\n2. Login\n3. Exit\nChoice: ")
        if choice == "1":
            register()
        elif choice == "2":
            login()
        elif choice == "3":
            break
        else:
            print("Invalid choice.")

main()

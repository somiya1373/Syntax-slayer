import json
import os
from werkzeug.security import generate_password_hash, check_password_hash

USERS_FILE = 'users.json'

def load_users():
    """Loads users from the JSON file."""
    if not os.path.exists(USERS_FILE):
        return []
    try:
        with open(USERS_FILE, 'r') as f:
            content = f.read()
            if content:
                return json.loads(content)
            return []
    except json.JSONDecodeError:
        return []

def save_users(users):
    """Saves users to the JSON file."""
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=4)

def find_user_by_username_or_email(identifier):
    """Finds a user by username or email."""
    users = load_users()
    for user in users:
        if user['username'] == identifier or user['email'] == identifier:
            return user
    return None

def add_user(username, email, password, phone):
    """Adds a new user to the system."""
    users = load_users()
    if find_user_by_username_or_email(username):
        return {"success": False, "message": "Username already exists."}
    if find_user_by_username_or_email(email):
        return {"success": False, "message": "Email already registered."}

    hashed_password = generate_password_hash(password)
    new_user = {
        "id": len(users) + 1,
        "username": username,
        "email": email,
        "password": hashed_password,
        "phone": phone
    }
    users.append(new_user)
    save_users(users)
    return {"success": True, "message": "Registration successful!", "user": new_user}

def verify_user(identifier, password):
    """Verifies user credentials."""
    user = find_user_by_username_or_email(identifier)
    if user and check_password_hash(user['password'], password):
        return user
    return None
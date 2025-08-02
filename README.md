CivicTrack: Community Issue Tracker
CivicTrack is a web application designed to empower communities by providing a platform to report and track local issues such as potholes, broken streetlights, or environmental concerns. It features an interactive map to visualize reported incidents and a user authentication system.

All core functionalities outlined in the initial problem statement have been successfully implemented.

✨ Features
Interactive Map: View reported issues on a live map powered by Leaflet.js.

Issue Reporting: Authenticated users can report new issues by pinning a location on the map, adding a title, description, category, and uploading photos.

Issue Dashboard: A dedicated dashboard to view nearby reports within a specific radius, with options for filtering.

Detailed Issue View: Click on any report to see comprehensive details, including photos and location on a mini-map.

Spam Reporting: Users can flag inappropriate or spam content.

User Authentication: Secure login and registration system (currently using a JSON file for mock user storage).

Responsive Design: Optimized for various screen sizes, from mobile to desktop.

💻 Technologies Used
Backend:

Flask: Python web framework for handling routes, requests, and rendering templates.

Werkzeug: Used for secure password hashing (generate_password_hash, check_password_hash).

JSON (for mock database): users.json for user data and disasters.json for issue reports.

Frontend:

HTML5: Structure of the web pages.

CSS3: Styling, including a clean, modern design and responsive layouts.

JavaScript: Client-side logic for map interactions, form handling, and page navigation.

Leaflet.js: Open-source JavaScript library for interactive maps.

Other:

Git/GitHub: Version control and collaboration.

🚀 Getting Started
Follow these instructions to set up and run CivicTrack on your local machine.

Prerequisites
Python 3.x: Make sure you have Python installed. You can download it from python.org.

pip: Python's package installer (usually comes with Python).

Installation
Clone the repository:

git clone <repository_url> # Replace <repository_url> with your project's GitHub URL
cd CivicTrack # Navigate into your project directory

Create a Python virtual environment (recommended):
A virtual environment helps manage project dependencies separately.

python -m venv venv

Activate the virtual environment:

On Windows:

.\venv\Scripts\activate

On macOS/Linux:

source venv/bin/activate

Install the required Python packages:

pip install Flask Werkzeug

Create necessary data files:
Ensure these empty files exist in your project's root directory:

users.json (should contain [])

disasters.json (should contain [])

report_reasons.json (should contain [])

Create an uploads directory for storing images:

mkdir uploads

Running the Application
Ensure your virtual environment is activated.

Run the Flask application:

python app.py

Access the application:
Open your web browser and go to http://127.0.0.1:5000/.

Important: If you encounter display issues (e.g., map not showing), perform a hard refresh in your browser (Ctrl+Shift+R on Windows/Linux or Cmd+Shift+R on macOS) to ensure all new files are loaded.

🚦 Usage
Home Page (/): The landing page providing an overview of CivicTrack.

Login (/login): Log in with existing credentials.

Register (/register): Create a new user account.

View Map (/maps): Access the interactive map to see existing reports and report new issues. This page requires login.

Report New Issue (on /maps): Use the "Report New Issue" link on the map page to toggle the issue submission form.

Dashboard (/dashboard/<lat>/<lng>): View detailed reports within a 5km radius of a specific coordinate (accessed by clicking "View Dashboard" on a map popup).

Disaster Details (/disaster-details/<id>): See full details of a specific report.

Report General Spam (/report-spam-page): Report inappropriate content.

📂 Project Structure
CivicTrack/
├── app.py                  # Main Flask application file
├── auth.py                 # User authentication functions (login, register, etc.)
├── manage_disasters.py     # Functions for managing disaster reports (save, get, flag)
├── users.json              # Mock user database (JSON file)
├── disasters.json          # Mock disaster reports database (JSON file)
├── report_reasons.json     # Stores reasons for flagged reports
├── uploads/                # Directory for uploaded images
├── templates/
│   ├── home.html           # New public landing page
│   ├── maps.html           # Main interactive map page (formerly index.html)
│   ├── login.html          # User login form
│   ├── register.html       # User registration form
│   ├── dynamic_civic_dashboard.html # Dashboard for nearby reports
│   ├── disaster_details.html # Page to view individual report details
│   └── report_spam.html    # Form for reporting general spam
└── README.md               # This file

🔐 Authentication Notes (Important)
The current authentication system uses a simple JSON file (users.json) to store user credentials, including hashed passwords. This is for demonstration purposes only and is NOT secure for production environments. For a real-world application, you would use a proper database (e.g., PostgreSQL, MySQL, SQLite) and a more robust authentication library (e.g., Flask-Login, Flask-Security-Too).

💡 Future Enhancements
Database Integration: Migrate user and disaster data to a proper SQL database (e.g., SQLite, PostgreSQL).

"My Issues" Page: Implement a page for users to view and manage their own reported issues.

User Profile: Allow users to view and update their profile information.

Issue Verification/Voting: Allow users to upvote/downvote or verify reports.

Admin Panel: A dedicated interface for administrators to manage users and reports.

Search and Filtering: Advanced search and filtering options for reports on the map and dashboard.

Notifications: Implement email or in-app notifications for status updates on reported issues.

Map Clustering: For many markers, implement clustering to improve performance and readability.

🤝 Contributing
Contributions are welcome! If you have suggestions or want to contribute:

Fork the repository.

Create a new branch (git checkout -b feature/your-feature-name).

Make your changes.

Commit your changes (git commit -m 'Add: Your feature description').

Push to your branch (git push origin feature/your-feature-name).

Create a new Pull Request.

import os
from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from manage_disasters import save_report, get_all_reports, flag_report, get_report_by_id, save_general_spam_report
from auth import load_users, add_user, verify_user, find_user_by_username_or_email

# Configuration for file uploads
UPLOAD_FOLDER = 'uploads'
MAX_PHOTOS = 35

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.secret_key = 'your_super_secret_key_here'

# Make sure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Define a simple login_required decorator
def login_required(view_func):
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('login_page'))
        return view_func(*args, **kwargs)

    wrapper.__name__ = view_func.__name__
    return wrapper


@app.context_processor
def inject_user():
    user = None
    if 'user_id' in session:
        users = load_users()
        user = next((u for u in users if u['id'] == session['user_id']), None)
    return dict(current_user=user)


@app.route('/')
@login_required
def index():
    return render_template('index.html', default_page='report-new-issue')


@app.route('/submit-report', methods=['POST'])
@login_required
def submit_report():
    title = request.form.get('title')
    description = request.form.get('description')
    user_lat = float(request.form.get('user_lat'))
    user_lng = float(request.form.get('user_lng'))
    disaster_lat = float(request.form.get('disaster_lat'))
    disaster_lng = float(request.form.get('disaster_lng'))
    category = request.form.get('category')

    photo_filenames = []
    uploaded_files = request.files.getlist('photos')

    if uploaded_files:
        for i, file in enumerate(uploaded_files[:MAX_PHOTOS]):
            if file.filename:
                filename = f"{os.urandom(8).hex()}_{file.filename}"
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
                photo_filenames.append(filename)

    result = save_report(
        title=title,
        description=description,
        user_lat=user_lat,
        user_lng=user_lng,
        disaster_lat=disaster_lat,
        disaster_lng=disaster_lng,
        category=category,
        photos=photo_filenames
    )

    if result.get('status') == 'success':
        flash(result.get('message'), 'success')
        return redirect(url_for('index'))
    else:
        flash(result.get('message'), 'error')
        return redirect(url_for('index'))


@app.route('/get-disasters')
@login_required
def get_disasters():
    reports = get_all_reports()
    return jsonify(reports)


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    # This route is now correctly importing and using send_from_directory
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/dashboard/<float:lat>/<float:lng>')
@login_required
def dashboard(lat, lng):
    return render_template('dynamic_civic_dashboard.html', center_lat=lat, center_lng=lng)


@app.route('/disaster-details/<int:report_id>')
@login_required
def disaster_details_page(report_id):
    report = get_report_by_id(report_id)
    dashboard_lat = request.args.get('dashboard_lat', type=float)
    dashboard_lng = request.args.get('dashboard_lng', type=float)

    if report:
        return render_template('disaster_details.html', report=report,
                               dashboard_lat=dashboard_lat, dashboard_lng=dashboard_lng)
    flash('Report not found.', 'error')
    return redirect(url_for('index'))


@app.route('/report-spam-page')
@login_required
def report_spam_page():
    report_id = request.args.get('report_id', type=int)
    return render_template('report_spam.html', report_id=report_id)


@app.route('/save-general-spam-report', methods=['POST'])
@login_required
def save_general_spam_report_endpoint():
    category = request.form.get('spam_category')
    details = request.form.get('spam_details')
    report_id = request.form.get('related_disaster_id', type=int)

    result = save_general_spam_report(category, details, report_id)

    flash(result.get('message'), 'success' if result.get('success') else 'error')
    return redirect(url_for('index'))


@app.route('/login', methods=['GET', 'POST'])
def login_page():
    if 'user_id' in session:
        return redirect(url_for('index'))

    if request.method == 'POST':
        identifier = request.form['identifier']
        password = request.form['password']
        user = verify_user(identifier, password)

        if user:
            session['user_id'] = user['id']
            flash('Logged in successfully!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Invalid username/email or password.', 'error')
    return render_template('login.html')


@app.route('/register', methods=['GET', 'POST'])
def register_page():
    if 'user_id' in session:
        return redirect(url_for('index'))

    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        phone = request.form['phone']

        result = add_user(username, email, password, phone)
        if result['success']:
            user = result['user']
            session['user_id'] = user['id']
            flash('Registration successful and you are now logged in!', 'success')
            return redirect(url_for('index'))
        else:
            flash(result['message'], 'error')
    return render_template('register.html')


@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash('You have been logged out.', 'info')
    return redirect(url_for('login_page'))


if __name__ == '__main__':
    app.run(debug=True)
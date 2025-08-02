import json
from math import radians, sin, cos, sqrt, atan2
from datetime import datetime

DUPLICATE_TOLERANCE_KM = 0.05  # 50 meters
FLAG_THRESHOLD = 5  # Number of flags to consider a report "flagged"


def haversine(lat1, lon1, lat2, lon2):
    """
    Calculate the distance between two points on Earth using the Haversine formula.
    Returns distance in kilometers.
    """
    R = 6371  # Earth's radius in kilometers
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


def is_duplicate_report(disaster_lat, disaster_lng, existing_reports):
    """
    Checks if a new report is a duplicate of an existing one.
    """
    for report in existing_reports:
        existing_lat = report['latitude']
        existing_lng = report['longitude']
        distance = haversine(disaster_lat, disaster_lng, existing_lat, existing_lng)
        if distance <= DUPLICATE_TOLERANCE_KM:
            return True
    return False


def get_all_reports(filename='disasters.json'):
    """
    Retrieves all reports from the JSON file.
    """
    try:
        with open(filename, 'r') as f:
            file_content = f.read()
            if file_content:
                return json.loads(file_content)
            else:
                return []
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def get_report_by_id(report_id, filename='disasters.json'):
    """
    Retrieves a single report by its ID.
    """
    reports = get_all_reports(filename)
    for report in reports:
        if report.get('id') == report_id:
            return report
    return None


def save_report(title, description, user_lat, user_lng, disaster_lat, disaster_lng, category, photos,
                filename='disasters.json'):
    """
    Saves a disaster report to a JSON file, including verification status and duplicate check.
    """
    VERIFICATION_DISTANCE_KM = 0.1  # 100 meters
    distance_user_to_disaster = haversine(user_lat, user_lng, disaster_lat, disaster_lng)

    if distance_user_to_disaster <= VERIFICATION_DISTANCE_KM:
        verification_status = "verified"
    else:
        verification_status = "unverified"

    reports = get_all_reports(filename)

    if is_duplicate_report(disaster_lat, disaster_lng, reports):
        return {"status": "error", "message": "This disaster has already been reported."}

    new_report = {
        'id': len(reports),  # Add a unique ID for flagging
        'title': title,
        'description': description,
        'latitude': disaster_lat,
        'longitude': disaster_lng,
        'category': category,
        'photos': photos,
        'verification_status': verification_status,
        'user_location': {
            'latitude': user_lat,
            'longitude': user_lng
        },
        'flags': 0  # Add a flags counter
    }

    reports.append(new_report)

    with open(filename, 'w') as f:
        json.dump(reports, f, indent=2)

    return {"status": "success", "message": f"Report submitted as '{verification_status}'.", "id": new_report['id']}


def flag_report(report_id, filename='disasters.json'):
    """
    Increments the flag counter for a given report ID.
    """
    reports = get_all_reports(filename)
    try:
        # Ensure report_id is within bounds and reports[report_id] is a dict
        if 0 <= report_id < len(reports) and isinstance(reports[report_id], dict):
            reports[report_id]['flags'] += 1
            with open(filename, 'w') as f:
                json.dump(reports, f, indent=2)
            return {"status": "success", "message": "Report flagged successfully."}
        else:
            return {"status": "error", "message": "Report not found or invalid format."}
    except (IndexError, TypeError):
        return {"status": "error", "message": "Report not found."}


def save_report_reason(report_id, reason, filename='report_reasons.json'):
    """
    Saves the reason for a report to a separate file.
    This function is kept for historical data if needed, but no longer called from frontend for flagging.
    """
    try:
        with open(filename, 'r') as f:
            reasons = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        reasons = []

    reasons.append({
        'report_id': report_id,
        'reason': reason
    })

    with open(filename, 'w') as f:
        json.dump(reasons, f, indent=2)

    return {"status": "success", "message": "Report reason saved successfully."}


def save_general_spam_report(category, details, report_id=None, filename='general_spam_reports.json'):
    """
    Saves a general spam report to a separate JSON file.
    If report_id is provided, it also flags the specific disaster.
    """
    try:
        with open(filename, 'r') as f:
            spam_reports = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        spam_reports = []

    new_spam_report = {
        'id': len(spam_reports),
        'category': category,
        'details': details,
        'timestamp': datetime.now().isoformat(),
        'related_disaster_id': report_id  # Store the related disaster ID
    }
    spam_reports.append(new_spam_report)

    with open(filename, 'w') as f:
        json.dump(spam_reports, f, indent=2)

    # If this spam report is related to a specific disaster, flag that disaster
    if report_id is not None:
        flag_report(report_id, filename='disasters.json')  # Call flag_report here

    return {"status": "success", "message": "General spam report submitted."}
import json
import os
from datetime import datetime
from math import radians, cos, sin, sqrt, atan2

FILE_PATH = "disasters.json"

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c

def load_reports():
    if not os.path.exists(FILE_PATH):
        return []
    with open(FILE_PATH, 'r') as f:
        return json.load(f)

def save_reports(data):
    with open(FILE_PATH, 'w') as f:
        json.dump(data, f, indent=4)

def save_report(title, description, user_lat, user_lng, disaster_lat, disaster_lng):
    reports = load_reports()
    for report in reports:
        distance = haversine(disaster_lat, disaster_lng, report["disaster_lat"], report["disaster_lng"])
        if distance < 1 and report["title"] == title:
            report["verified"] = True
            save_reports(reports)
            return {"status": "verified", "message": "Duplicate disaster verified."}

    new_report = {
        "title": title,
        "description": description,
        "user_lat": user_lat,
        "user_lng": user_lng,
        "disaster_lat": disaster_lat,
        "disaster_lng": disaster_lng,
        "timestamp": datetime.now().isoformat(),
        "verified": False
    }

    reports.append(new_report)
    save_reports(reports)
    return {"status": "added", "message": "New disaster reported."}

def get_all_reports():
    return load_reports()

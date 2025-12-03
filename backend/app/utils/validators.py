from typing import Dict, List
import re


def validate_login_event(data: Dict) -> tuple[bool, List[str]]:
    """
    Validate login event data

    Returns:
        Tuple of (is_valid, error_messages)
    """
    errors = []

    # Required fields
    required_fields = ['user_id', 'username', 'ip_address', 'device_info']
    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: {field}")

    # Validate IP address format
    if 'ip_address' in data:
        ip_pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
        if not re.match(ip_pattern, data['ip_address']):
            errors.append("Invalid IP address format")

    # Validate device_info structure
    if 'device_info' in data:
        device_required = ['browser', 'os', 'device_type']
        for field in device_required:
            if field not in data['device_info']:
                errors.append(f"Missing device_info field: {field}")

    # Validate location if provided
    if 'location' in data:
        location = data['location']
        if 'latitude' not in location or 'longitude' not in location:
            errors.append("Location must include latitude and longitude")
        else:
            lat = location['latitude']
            lon = location['longitude']
            if not (-90 <= lat <= 90):
                errors.append("Invalid latitude value")
            if not (-180 <= lon <= 180):
                errors.append("Invalid longitude value")

    return len(errors) == 0, errors


def validate_alert_data(data: Dict) -> tuple[bool, List[str]]:
    """
    Validate alert data

    Returns:
        Tuple of (is_valid, error_messages)
    """
    errors = []

    required_fields = ['alert_type', 'severity', 'user_id', 'username', 'description']
    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: {field}")

    # Validate severity
    valid_severities = ['low', 'medium', 'high', 'critical']
    if 'severity' in data and data['severity'] not in valid_severities:
        errors.append(f"Invalid severity. Must be one of: {valid_severities}")

    return len(errors) == 0, errors
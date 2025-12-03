from typing import Dict, Optional
import requests
import os


class GeolocationService:
    """Service for IP geolocation"""

    def __init__(self):
        self.api_key = os.getenv('IPSTACK_API_KEY', '')

    def get_location_from_ip(self, ip_address: str) -> Optional[Dict]:
        """
        Get location data from IP address

        For development, returns mock data if no API key is set
        """
        # Mock data for development
        if not self.api_key or ip_address.startswith('192.168') or ip_address.startswith('127.0'):
            return self._mock_location()

        try:
            url = f'http://api.ipstack.com/{ip_address}?access_key={self.api_key}'
            response = requests.get(url, timeout=5)
            data = response.json()

            if 'error' in data:
                return self._mock_location()

            return {
                'latitude': data.get('latitude'),
                'longitude': data.get('longitude'),
                'city': data.get('city', 'Unknown'),
                'country': data.get('country_name', 'Unknown')
            }
        except Exception as e:
            print(f"Geolocation error: {e}")
            return self._mock_location()

    def _mock_location(self) -> Dict:
        """Return mock location for development"""
        return {
            'latitude': 37.7749,
            'longitude': -122.4194,
            'city': 'San Francisco',
            'country': 'USA'
        }


# Singleton instance
geolocation_service = GeolocationService()
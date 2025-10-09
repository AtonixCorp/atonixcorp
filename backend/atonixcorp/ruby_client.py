import os
import requests


class RubyClient:
    def __init__(self, host=None, port=None, scheme="http"):
        self.host = host or os.environ.get("RUBY_SERVICE_HOST", "ruby_service")
        self.port = port or os.environ.get("RUBY_SERVICE_PORT", "4567")
        self.scheme = scheme or os.environ.get("RUBY_SERVICE_SCHEME", "http")

    def base_url(self):
        return f"{self.scheme}://{self.host}:{self.port}"

    def ping(self):
        """Ping the ruby service health endpoint."""
        url = f"{self.base_url()}/health"
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        return resp.json() if resp.headers.get("content-type", "").startswith("application/json") else resp.text

    def get_data(self, path="/", params=None):
        url = f"{self.base_url()}{path}"
        resp = requests.get(url, params=params or {}, timeout=10)
        resp.raise_for_status()
        try:
            return resp.json()
        except Exception:
            return resp.text

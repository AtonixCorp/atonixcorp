from django.http import JsonResponse, HttpResponseServerError
from .ruby_client import RubyClient


def ruby_health(request):
    client = RubyClient()
    try:
        data = client.ping()
        return JsonResponse({"status": "ok", "ruby": data})
    except Exception as e:
        return HttpResponseServerError(f"Ruby service error: {e}")

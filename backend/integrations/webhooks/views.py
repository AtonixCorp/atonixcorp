from ..secrets import get_secret
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from requests.adapters import HTTPAdapter, Retry
import requests
import urlparse
import hmac
import hashlib

from .models import WebhookEvent, WebhookSubscription
from .serializers import WebhookEventSerializer


class WebhookEventViewSet(ModelViewSet):
    queryset = WebhookEvent.objects.all()
    serializer_class = WebhookEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def trigger(self, request):
        event_type = request.data.get('event_type')
        payload = request.data.get('payload', {})
        sent = []

        # prepare requests session with retry/backoff
        session = requests.Session()
        retries = Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
        session.mount('https://', HTTPAdapter(max_retries=retries))

        for sub in WebhookSubscription.objects.filter(active=True):
            parsed = urlparse(sub.url)
            if parsed.scheme != 'https':
                WebhookEvent.objects.create(subscription=sub, event_type=event_type, payload=payload, response='skipped: non-https', status_code=0)
                sent.append({'sub': sub.id, 'error': 'non-https url'})
                continue

            headers = {'Content-Type': 'application/json'}
            secret_value = sub.get_secret()
            if secret_value:
                mac = hmac.new(secret_value.encode(), str(payload).encode(), hashlib.sha256).hexdigest()
                headers['X-Signature'] = mac

            try:
                r = session.post(sub.url, json=payload, headers=headers, timeout=10)
                WebhookEvent.objects.create(subscription=sub, event_type=event_type, payload=payload, headers=headers, status_code=r.status_code, response=r.text)
                sent.append({'sub': sub.id, 'status': r.status_code})
            except Exception as e:
                WebhookEvent.objects.create(subscription=sub, event_type=event_type, payload=payload, headers=headers, response=str(e))
                sent.append({'sub': sub.id, 'error': str(e)})
        return Response({'sent': sent})
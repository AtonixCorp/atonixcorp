from django.utils import timezone
from django.db.models import Sum
from rest_framework import permissions, viewsets
from rest_framework.response import Response

from .models import Campaign, CampaignAnalytics, Contact
from ..billing.service import get_billing_overview


class MarketingOverviewViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        owner = request.user

        campaigns = Campaign.objects.filter(owner=owner)
        analytics_qs = CampaignAnalytics.objects.filter(campaign__owner=owner)

        aggregates = analytics_qs.aggregate(
            total_sent=Sum('total_sent'),
            delivered=Sum('delivered'),
            unique_opens=Sum('unique_opens'),
            unique_clicks=Sum('unique_clicks'),
            bounced=Sum('bounced'),
        )

        total_sent = aggregates.get('total_sent') or 0
        delivered = aggregates.get('delivered') or total_sent
        unique_opens = aggregates.get('unique_opens') or 0
        unique_clicks = aggregates.get('unique_clicks') or 0
        bounced = aggregates.get('bounced') or 0

        engagement_rate = round(unique_clicks / delivered, 4) if delivered else 0
        deliverability_score = round(((delivered - bounced) / delivered) * 100) if delivered else 96

        try:
            billing = get_billing_overview(owner)
            monthly_spend = float(billing.get('usage', {}).get('month_to_date', 0) or 0)
        except Exception:
            monthly_spend = 0.0

        running_campaigns = campaigns.filter(status__in=['sending', 'scheduled']).order_by('-updated_at')[:5]
        active_experiments = campaigns.filter(campaign_type='ab_test', status__in=['draft', 'sending', 'scheduled']).order_by('-updated_at')[:3]
        upcoming_content = campaigns.filter(scheduled_at__isnull=False, scheduled_at__gte=timezone.now()).order_by('scheduled_at')[:5]

        overview_payload = {
            'top_metrics': {
                'total_campaigns': campaigns.count(),
                'active_campaigns': campaigns.filter(status__in=['sending', 'scheduled']).count(),
                'audience_size': Contact.objects.filter(contact_list__owner=owner, status='subscribed').count(),
                'monthly_spend': round(monthly_spend, 2),
                'overall_roi': 3.4,
                'seo_score': 82,
                'deliverability_score': deliverability_score,
                'avg_engagement_rate': engagement_rate,
            },
            'live_activity': {
                'running_campaigns': [
                    {
                        'id': item.resource_id,
                        'name': item.name,
                        'channel': 'email',
                    }
                    for item in running_campaigns
                ],
                'active_experiments': [
                    {
                        'id': item.resource_id,
                        'name': item.name,
                    }
                    for item in active_experiments
                ],
                'upcoming_content': [
                    {
                        'id': item.resource_id,
                        'title': item.name,
                        'scheduled_at': item.scheduled_at.isoformat() if item.scheduled_at else None,
                    }
                    for item in upcoming_content
                ],
            },
            'insights': {
                'best_channel': 'email',
                'best_segment': 'High LTV – Africa',
                'seo_opportunities': [
                    'Improve meta descriptions for /pricing',
                    "Target keyword: 'prime source africa news'",
                ],
                'ai_recommendations': [
                    'Increase budget on campaigns with CTR > 5%',
                    "Create lookalike audience from 'High LTV – Africa'",
                ],
            },
            'quick_actions': [
                {'label': 'Create Campaign', 'route': '/marketing-dashboard/campaigns'},
                {'label': 'Create Segment', 'route': '/marketing-dashboard/audience-segmentation'},
                {'label': 'Run A/B Test', 'route': '/marketing-dashboard/ab-testing'},
                {'label': 'Add Domain', 'route': '/marketing-dashboard/seo-domains'},
                {'label': 'Schedule Content', 'route': '/marketing-dashboard/content-distribution'},
            ],
        }

        return Response(overview_payload)

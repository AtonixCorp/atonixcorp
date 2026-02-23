from django.views.generic import TemplateView


class ApiPortalLandingView(TemplateView):
    template_name = 'services/api_portal.html'

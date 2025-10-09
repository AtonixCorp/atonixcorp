from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import MarketplaceApp
from .serializers import MarketplaceAppSerializer


class MarketplaceViewSet(viewsets.ModelViewSet):
    queryset = MarketplaceApp.objects.all()
    serializer_class = MarketplaceAppSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['post'])
    def install(self, request, pk=None):
        app = self.get_object()
        # Placeholder: create connector/credentials and enable
        app.enabled = True
        app.save()
        return Response({'status': 'installed', 'app': app.slug})

    @action(detail=True, methods=['post'])
    def uninstall(self, request, pk=None):
        app = self.get_object()
        app.enabled = False
        app.save()
        return Response({'status': 'uninstalled', 'app': app.slug})

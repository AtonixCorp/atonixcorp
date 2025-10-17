from rest_framework.routers import DefaultRouter
from .views import MarketplaceViewSet

router = DefaultRouter()
router.register(r'', MarketplaceViewSet)

urlpatterns = router.urls

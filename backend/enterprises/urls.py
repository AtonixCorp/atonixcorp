from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EnterpriseViewSet

router = DefaultRouter()
router.register(r'enterprises', EnterpriseViewSet, basename='enterprise')

# NOTE: this module is included at project path('api/', include('enterprises.urls'))
# so router URLs should be mounted at the root here to avoid double '/api/api/' paths.
urlpatterns = [
    path('', include(router.urls)),
]

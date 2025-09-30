from rest_framework import routers
from .views import ScheduleItemViewSet

router = routers.DefaultRouter()
router.register(r'schedule', ScheduleItemViewSet, basename='schedule')

urlpatterns = router.urls


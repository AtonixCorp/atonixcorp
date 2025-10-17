from rest_framework.routers import DefaultRouter
from .views import ChatRoomViewSet, ChatMessageViewSet

router = DefaultRouter()
router.register(r'rooms', ChatRoomViewSet)
router.register(r'messages', ChatMessageViewSet)

urlpatterns = router.urls

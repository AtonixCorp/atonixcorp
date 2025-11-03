from django.urls import path
from .views import ActivityLogViewSet

activity_list = ActivityLogViewSet.as_view({'get': 'list', 'post': 'create'})

urlpatterns = [
    path('logs/', activity_list, name='activity-logs'),
]

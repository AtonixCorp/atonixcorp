from django.urls import path, include

urlpatterns = [
    # ...existing url patterns...
    path('api/', include('backend.dashboard.urls')),
    path('api/automation/', include('backend.automation.urls')),
    path('api/integrations/webhooks/', include('backend.integrations.webhooks.urls')),
    path('api/chat/', include('backend.chat.urls')),
    path('api/', include('backend.enterprises.urls')),
]

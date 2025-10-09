from django.urls import path
from . import views

app_name = 'static_pages'

urlpatterns = [
    path('about/', views.about, name='about'),
    path('privacy/', views.privacy, name='privacy'),
]

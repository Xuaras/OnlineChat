from django.urls import path

from .consumers import WSConsumer
ws_urlpatterns = [
    path('ws/some/',WSConsumer.as_asgi())
]
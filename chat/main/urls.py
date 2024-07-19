from .views import *
from django.urls import path,include
from rest_framework import routers
router = routers.SimpleRouter()
router.register(r'users',UserViewSet,basename='user')
router.register(r'friends',FriendViewSet)
router.register(r'chats',CurrentChatViewSet, basename='chats')
router.register(r'messages',MessageViewSet,basename='messages')
urlpatterns = [
    path('',include(router.urls)),
]
"""
URL configuration for chat project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from main.views import *
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers
router = routers.SimpleRouter()
router.register(r'Users',UserViewSet)
router.register(r'Friend',FriendViewSet)
print(router.urls)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/',include(router.urls)),
    # path('api/v1/Users/<int:pk>/',UserViewSet.as_view({'put':'update'})),
    # path('api/v1/Users',UserViewSet.as_view({'get':'list'})),
    path('api/v1/User_avatar/<str:user_name>/',UserImage.as_view()),
    path('api/v1/Messages/<int:sender_id>/<int:receiver_id>/',MessageListAPIView.as_view()),
    path('api/v1/CurrentChat/<int:user_id>/',CurrentChatUpdateAPIView.as_view()),
    path('api/v1/Friends/<int:user_id>/',UserFriend.as_view()),
    path('api/v1/Register/',RegisterView.as_view()),
    path('api/v1/Login/',LoginView.as_view()),
    path('api/v1/Logout/',LogoutView.as_view()),
    path('api/v1/Current/',CurrentUserView.as_view()),
    path('api/v1/Message/',MessageCreateAPIView.as_view())

]
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
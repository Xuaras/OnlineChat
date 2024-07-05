from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import generics,viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import *
from django.db.models import Q
from .permissions import *
from .models import Friend
from .serializers import *
import os
from django.contrib.auth import login, logout
from django.conf import settings

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()  # Добавлено для устранения ошибки
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = User.objects.all()
        exclude_ids = self.request.query_params.get('exclude_ids')
        
        if exclude_ids:
            exclude_ids = exclude_ids.split(',')
            queryset = queryset.exclude(id__in=exclude_ids)
        
        return queryset


class FriendViewSet(viewsets.ModelViewSet):
    queryset = Friend.objects.all()
    serializer_class = FriendSerializer

# Create your views here.

#class FriendsApiView(generics.ListAPIView):
#    queryset = Friends.objects.all()
#    serializer_class = FriendsSerializer


# class UserApiDetails(generics.RetrieveUpdateDestroyAPIView):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer

# class UserApiList(generics.ListCreateAPIView):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer


class UserImage(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = AvatarSerializer

    def get(self, request, user_name):
        try:
            user = User.objects.get(username__iexact=user_name)
        except User.DoesNotExist:
            return Response({"error": "User not found"})
        serializer = AvatarSerializer(user)
        return Response(serializer.data)

    def put(self, request, user_name):
        try:
            user = User.objects.get(username__iexact=user_name)
        except User.DoesNotExist:
            return Response({"error": "User not found"})
        old_avatar_path = os.path.join(settings.MEDIA_ROOT,f'{user.avatar}')
        print(old_avatar_path)
        if os.path.exists(old_avatar_path):
            os.remove(old_avatar_path)
        serializer = AvatarSerializer(user, data=request.data, partial=True)  # partial=True для обновления частичных данных
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)


class UserFriend(generics.ListAPIView):
    serializer_class = GetFirendSerializer
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return Friend.objects.filter(user1=user_id)
    
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        request.session['user_id'] = user.id
        return Response(serializer.data)

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        request.session['user_id'] = user.id
        return Response({"message": "Вы успешно вошли! "})

class LogoutView(generics.GenericAPIView):

    def post(self, request, *args, **kwargs):
        logout(request)
        return Response({"message": "Вы успешно вышли"})
    
class CurrentUserView(APIView):
    def get(self, request):
        user_id = request.session.get('user_id')
        if user_id:
            try:
                user = User.objects.get(id=user_id)
                return Response({
                    'id':user.id,
                    'username': user.username,
                    'email': user.email,
                    'registration_date': user.registration_date,
                    'avatar': user.avatar.url if user.avatar else None
                },)
            except User.DoesNotExist:
                return Response({'error': 'Пользователь не найден'})
        return Response({'error': 'Пользователь не авторизован'})

class MessageCreateAPIView(generics.CreateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

class MessageListAPIView(generics.ListAPIView):
    serializer_class = MessageSerializer

    def get_queryset(self):
        sender_id = self.kwargs.get('sender_id')
        receiver_id = self.kwargs.get('receiver_id')
        queryset = Message.objects.filter(sender=sender_id,receiver=receiver_id)
        return queryset

class CurrentChatUpdateAPIView(generics.UpdateAPIView):
    serializer_class = CurrentChatSerializer
    queryset = CurrentChat.objects.all()
    lookup_url_kwarg = 'user_id'

    def get_object(self):
        user_id = self.kwargs.get('user_id') or self.request.data.get('user_id')
        obj, created = CurrentChat.objects.get_or_create(user_id=user_id)
        return obj

    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        chatting_with_id = request.data.get('chatting_with_id')
        
        if chatting_with_id is not None:
            instance.chatting_with_id = chatting_with_id
            instance.save()
            return self.update(request, *args, **kwargs)
        else:
            # Handle the case where chatting_with_id is not provided in request.data
            return Response({'error': 'chatting_with_id is required'})

# class FriendsList(generics.ListAPIView):
#     queryset = Friend.objects.all()
#     serializer_class = Friend
# class FriendsApiView(APIView):
#     def get(self, request):
#         friend_list = Friends.objects.all()
#         return Response({'friends':FriendsSerializer(friend_list,many=True).data})
    

    
#     def post(self, request):
#         serializer = FriendsSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         serializer.save()
#         return Response({'new_friend':serializer.data})
    
#     def put(self, request,*args,**kwargs):
#         pk = kwargs.get("pk",None)
#         if not pk:
#             return Response({"error":"Method PUT is not allowed"})
#         try:
#             instance = Friends.objects.get(pk=pk)
#         except:
#               return Response({"error":"Object does not exsists"})  
#         serializer = FriendsSerializer(data=request.data, instance=instance)
#         if serializer.is_valid(raise_exception=True):
#             serializer.save()
#         else:
#             print("error")
#         return Response({"post":serializer.data})
    
#     def delete(self,request,*args,**kwargs):
#         pk = kwargs.get('pk',None)
#         if not pk:
#             return Response({"error":"Method Delete is not allowed"})
#         try:
#             instance = Friends.objects.get(pk=pk)
#         except:
#             return Response({"error":"Object dose not exsists"})
#         instance.delete()
#         return Response({"Success":f"instance was delete pk={pk}"})
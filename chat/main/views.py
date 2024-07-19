from django.db import transaction
from rest_framework import viewsets,status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import action,permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.shortcuts import get_object_or_404
from .permissions import *  
from .models import Friend
from .serializers import *
from main.models import User
from django.conf import settings
import os
class UserViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(methods=['get'],detail=False)
    def users(self, request):
        users = User.objects.all()
        return Response({'users':users})
    
    @action(methods=['get'],detail=False,url_path='exclude_ids')
    def exclude(self,request):
        exclude_ids = request.query_params.get('exclude_ids','')
        try:
            exclude_ids = list(map(int,exclude_ids.split(',')))
        except:
            return Response({'error':'exclude_ids has wrong format'},status=400)
        users = User.objects.exclude(id__in=exclude_ids)
        serializer = self.get_serializer(users,many=True)
        return Response(serializer.data)

    @action(methods=['post'], detail=False, url_path="register")
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = User(
                email=serializer.validated_data['email'],
                username=serializer.validated_data['username'],
            )
            user.set_password(serializer.validated_data['password'])
            user.save()
            token = Token.objects.create(user=user)
            return Response({"user": serializer.data, "token": token.key, "status": f'{status.HTTP_201_CREATED}'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(methods=['post'],detail=False,url_path="login")
    def login(self,request):
        try:
            user = User.objects.get(username=request.data['username'])
            if user.check_password(request.data['password']):
                token, created = Token.objects.get_or_create(user=user)
                serializer = UserSerializer(instance=user)
                return Response({"user":serializer.data,"token":token.key,"status":f'{status.HTTP_201_CREATED}'})
            else:
                return Response({'detail':"incorrect data"},status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({'detail':"Check email or password"},status=status.HTTP_404_NOT_FOUND)
    

    @action(methods=['post'], detail=False, url_path="logout")
    def logout(self, request):
        try:
            token = request.auth
            if token:
                token.delete()
                return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)
            else:
                return Response({'detail': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(methods=['put'], detail=True, url_path='update_avatar')
    def update_avatar(self, request, pk=None):
        user = self.get_object()
        if 'avatar' in request.data:
            avatar = request.data['avatar']
            old_avatar = os.path.join(settings.MEDIA_ROOT,f'{user.avatar}')
            if os.path.exists(old_avatar) and user.avatar!='default_avatar.jpg':
                os.remove(old_avatar)
            user.avatar = avatar
            user.save()
            return Response({'status': 'avatar updated successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'No avatar provided'}, status=status.HTTP_400_BAD_REQUEST)
    
class FriendViewSet(viewsets.ModelViewSet):
    queryset = Friend.objects.all()
    serializer_class = FriendSerializer

    @action(methods=['get'],detail=False)
    def get_friend(self,request):
        friends = Friend.objects.all()
        return Response({'friends':friends})
    
    @action(methods=['get'], detail=False, url_path='your_friend')
    def get_your_friends(self, request):
        your_id = request.query_params.get('your_id', '')
        if not your_id:
            return Response({"error": "your_id parameter is required"}, status=400)
        friends = Friend.objects.filter(user=your_id)
        serializer = self.get_serializer(friends, many=True)
        return Response(serializer.data)
    
class CurrentChatViewSet(viewsets.ModelViewSet):

    queryset = CurrentChat.objects.all()
    serializer_class = CurrentChatSerizlizer
    @action(methods=['get'],detail=False)
    def get_chats(self,request):
        chats = CurrentChat.objects.all()
        return Response({'chats':chats})
    
    def create(self, request, *args, **kwargs):
        user = request.data.get('user')
        chatting_with = request.data.get('chatting_with')
        try:
            current_chat = CurrentChat.objects.get(user_id=user)
            current_chat.chatting_with_id = chatting_with
            current_chat.save()
            serializer = self.get_serializer(current_chat)
            return Response(serializer.data)
        except CurrentChat.DoesNotExist:
            return super().create(request, *args, **kwargs)
    @action(methods=['get'],detail=False,url_path='your_chat')
    def get_yoyr_chat(self,request):
        your_id = request.query_params.get('your_id', '')
        if not your_id:
            return Response({"error": "your_id parameter is required"}, status=400)
        chat = CurrentChat.objects.get(user=your_id)
        serializer = self.get_serializer(chat)
        return Response(serializer.data)
    
class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    @action(methods=['get'],detail=False, permission_classes=[IsAdminUser])
    def get_messages(self,request):
        messages = Message.objects.all()
        return Response({'messages':messages})
    
    @action(methods=['get'],detail=False,url_path='your_messages')
    def get_your_messages(self,request):
        your_id = request.query_params.get('your_id', '')
        if not your_id:
            return Response({"error": "your_id parameter is required"}, status=400)
        messages = Message.objects.filter(sender=your_id)
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)

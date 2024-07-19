from rest_framework import serializers
from .models import *
from django.contrib.auth.hashers import make_password, check_password


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username','email','password','date_joined','avatar']

class FriendSerializer(serializers.ModelSerializer):
    friend = UserSerializer()
    class Meta:
        model = Friend
        fields = ['user','friend','status']

class CurrentChatSerizlizer(serializers.ModelSerializer):
    class Meta:
        model = CurrentChat
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'

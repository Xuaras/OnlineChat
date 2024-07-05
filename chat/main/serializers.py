from rest_framework import serializers
from .models import *
from django.contrib.auth.hashers import make_password, check_password
# class FriendModel:
#     def __init__(self,user_id, friend_id):
#         self.user_id = user_id
#         self.friend_id = friend_id


# class FriendsSerializer(serializers.ModelSerializer):
#     # user_id = serializers.IntegerField()
#     # friend_id = serializers.IntegerField()
#     class Meta:
#         model = Friend
#         fields = "__all__"
        
#     def create(self, validated_data):
#         return Friend.objects.create(**validated_data)
    
#     def update(self, instance, validated_data):
#         instance.user_id = validated_data.get("user1",instance.user1)
#         instance.friend_id = validated_data.get("user2",instance.user2)
#         instance.save()
#         return instance

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username','password','avatar']
    
    def create(self, validated_data):
        return User.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        instance.username = validated_data.get("username",instance.username)
        instance.password = validated_data.get("password",instance.password)
        instance.avatar = validated_data.get("avatar",instance.avatar)
        instance.save()
        return instance
    
class FriendSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friend
        fields = '__all__'

    def create(self, validated_data):
        return Friend.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        instance.user1 = validated_data.get("user1",instance.user1)
        instance.user2 = validated_data.get("user2",instance.user2)
        instance.status = validated_data.get("status",instance.status)
        instance.save()
        return instance
    
        
class AvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['avatar']
    
    def update(self, instance, validated_data):
        instance.avatar = validated_data.get('avatar', instance.avatar)
        instance.save()
        return instance
    

class GetFirendSerializer(serializers.ModelSerializer):
    friend_name = serializers.SerializerMethodField()
    friend_avatar = serializers.SerializerMethodField()
    friend_id = serializers.SerializerMethodField()
    class Meta:
        model = Friend
        fields = ['friend_id','friend_name','friend_avatar','status']

    def get_friend_name(self,obj):
        return obj.user2.username
    
    def get_friend_avatar (self,obj):
        request = self.context.get('request')
        avatar_url = obj.user2.avatar.url
        return avatar_url
    
    def get_friend_id (self,obj):
        return obj.user2.id


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User(
            email=validated_data['email'],
            username=validated_data['username'],
            password=make_password(validated_data['password']),
        )
        user.save()
        return user
    
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            user = User.objects.get(username=data['username'])
            if check_password(data['password'], user.password):
                return user
            else:
                raise serializers.ValidationError("Неверный пароль")
        except User.DoesNotExist:
            raise serializers.ValidationError("Пользователь не найден")

class CurrentChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurrentChat
        fields = '__all__'
        
class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'
# class FrindList(serializers.ModelSerializer):
#     friend_name = serializers.CharField(source="friend.username",read_only=True)
    
#     class Meta:
#         model = Friend
#         fields = ['user1','user2','status','friend_name']

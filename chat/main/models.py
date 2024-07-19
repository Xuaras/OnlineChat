from django.db import models
from django.contrib.auth.models import User,AbstractUser


class User(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', default='avatars/default_avatar.jpg', blank=True)
    
class Friend(models.Model):
    user = models.ForeignKey(User, related_name='you', on_delete=models.CASCADE)
    friend = models.ForeignKey(User, related_name='friend', on_delete=models.CASCADE)
    status = models.CharField(max_length=20)

    def __str__(self) -> str:
        return f'{self.user1.username} - {self.user2.username}'

class Message(models.Model):
    sender = models.ForeignKey(User, related_name='sender', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='receiver', on_delete=models.CASCADE)
    time_of_message = models.DateTimeField(auto_now_add=True)
    content = models.TextField()

    def __str__(self):
        return f'{self.sender} to {self.receiver}: {self.content[:20]}'

class CurrentChat(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='current_user')
    chatting_with = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chatting_with')

    def __str__(self):
        return f'{self.user.username} chatting with {self.chatting_with.username}'



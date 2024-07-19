from channels.generic.websocket import WebsocketConsumer
import json
from .models import Message
from datetime import datetime
from django.db.models import Q
from django.db.models.signals import post_save
from django.dispatch import receiver

class WSConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        print("WebSocket connection accepted")
        # Подключаем сигнал к текущему WebSocket соединению
        self.connect_signal()

    def disconnect(self, close_code):
        print("WebSocket connection closed")
        # Отключаем сигнал при закрытии соединения
        self.disconnect_signal()

    def receive(self, text_data):
        data = json.loads(text_data)
        sender_id = data.get('sender_id')
        receiver_id = data.get('receiver_id')
        content = data.get('content')

        print(f"Received data: {data}")

        if sender_id is None or receiver_id is None:
            self.send(json.dumps({'error': 'Invalid data format'}))
            print("Invalid data format")
            return

        if content is not None:
            # Сохраняем сообщение в базу данных
            message = Message.objects.create(
                sender_id=sender_id,
                receiver_id=receiver_id,
                content=content,
                time_of_message=datetime.now()
            )

            print(f"Message saved: {message.content}")

        # получаем все сообщения
        self.send_all_messages(sender_id, receiver_id)

    def send_all_messages(self, sender_id, receiver_id):
        messages = Message.objects.filter(
            (Q(sender_id=sender_id) & Q(receiver_id=receiver_id)) |
            (Q(sender_id=receiver_id) & Q(receiver_id=sender_id))
        ).order_by('time_of_message')

        # формируем отправные данные
        response_data = [
            {
                'sender_id': message.sender_id,
                'receiver_id': message.receiver_id,
                'time_of_message': message.time_of_message.isoformat(),
                'content': message.content
            } for message in messages
        ]

        self.send(json.dumps(response_data))
        print(f"Sent messages: {response_data}")

    def connect_signal(self):
        @receiver(post_save, sender=Message)
        def message_saved(sender, instance, created, **kwargs):
            if created:
                print(f"New message created: {instance.content}")
                # Отправляем все сообщения заново
                self.send_all_messages(instance.sender_id, instance.receiver_id)
        self.message_saved = message_saved

    def disconnect_signal(self):
        post_save.disconnect(self.message_saved, sender=Message)

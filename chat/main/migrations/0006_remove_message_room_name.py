# Generated by Django 5.0.6 on 2024-07-02 22:51

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0005_message'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='message',
            name='room_name',
        ),
    ]

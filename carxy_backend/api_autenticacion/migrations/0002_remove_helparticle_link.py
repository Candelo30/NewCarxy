# Generated by Django 5.1.1 on 2024-10-15 01:34

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api_autenticacion', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='helparticle',
            name='link',
        ),
    ]

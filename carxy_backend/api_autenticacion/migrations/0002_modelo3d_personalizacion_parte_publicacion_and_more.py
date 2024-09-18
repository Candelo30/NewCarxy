# Generated by Django 5.1.1 on 2024-09-17 23:34

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api_autenticacion', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Modelo3D',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre_modelo', models.CharField(max_length=100)),
                ('fecha_creacion', models.DateField()),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='modelos_3d', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Personalizacion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre_personalizacion', models.CharField(max_length=100)),
                ('fecha_creacion', models.DateField()),
                ('modelo', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='personalizaciones', to='api_autenticacion.modelo3d')),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='personalizaciones', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Parte',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre_parte', models.CharField(max_length=100)),
                ('color', models.CharField(max_length=50)),
                ('modelo', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='partes', to='api_autenticacion.modelo3d')),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='partes', to=settings.AUTH_USER_MODEL)),
                ('personalizacion', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='partes', to='api_autenticacion.personalizacion')),
            ],
        ),
        migrations.CreateModel(
            name='Publicacion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
                ('descripcion', models.TextField()),
                ('megusta', models.IntegerField(default=0)),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='publicaciones', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Comentario',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('comentario', models.TextField()),
                ('fecha_comentario', models.DateTimeField(auto_now_add=True)),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comentarios', to=settings.AUTH_USER_MODEL)),
                ('publicacion', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comentarios', to='api_autenticacion.publicacion')),
            ],
        ),
    ]

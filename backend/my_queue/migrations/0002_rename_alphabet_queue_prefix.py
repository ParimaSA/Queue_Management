# Generated by Django 5.1.2 on 2024-11-02 11:26

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("my_queue", "0001_initial"),
    ]

    operations = [
        migrations.RenameField(
            model_name="queue",
            old_name="alphabet",
            new_name="prefix",
        ),
    ]
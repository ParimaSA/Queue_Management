# Generated by Django 5.1.2 on 2024-10-16 05:26

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0002_entry_queue_name_alter_queue_estimated_time'),
    ]

    operations = [
        migrations.RenameField(
            model_name='entry',
            old_name='queue_name',
            new_name='queue',
        ),
        migrations.AddField(
            model_name='entry',
            name='business',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='business.business'),
        ),
        migrations.AddField(
            model_name='queue',
            name='alphabet',
            field=models.CharField(default='A', max_length=1),
        ),
        migrations.AlterField(
            model_name='entry',
            name='status',
            field=models.CharField(default='waiting', max_length=20),
        ),
        migrations.AlterField(
            model_name='entry',
            name='time_out',
            field=models.DateTimeField(null=True),
        ),
        migrations.AlterField(
            model_name='entry',
            name='tracking_code',
            field=models.CharField(blank=True, max_length=50, null=True, unique=True),
        ),
        migrations.AlterField(
            model_name='queue',
            name='estimated_time',
            field=models.IntegerField(default=None, null=True),
        ),
    ]
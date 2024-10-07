from django.contrib import admin
from queue_app.models import Category, Queue, Business


admin.site.register(Category)
admin.site.register(Queue)
admin.site.register(Business)

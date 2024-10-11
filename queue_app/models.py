from django.db import models
from django.contrib.auth.models import User
from django.forms import ModelForm
from django import forms


class Category(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name


class Business(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    approve_status = models.CharField(max_length=50, default="Pending")
    open_day = models.CharField(max_length=300)
    open_time = models.TimeField()
    close_time = models.TimeField()
    open_status = models.CharField(max_length=50, default='Closed')
    field_name = models.CharField(max_length=100, default=None, null=True)
    field_choice = models.CharField(max_length=350)

    def __str__(self):
        return self.name


class Queue(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    business = models.ForeignKey(Business, on_delete=models.CASCADE)
    reserve_time = models.DateTimeField()
    field_choice = models.CharField(max_length=100)
    status = models.CharField(max_length=50, default="Pending")

    def __str__(self):
        return f"{self.user} reserved at {self.business} status: {self.status}"


class BusinessRegisterForm(ModelForm):
    OPEN_DAYS = [
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    ]

    open_day = forms.MultipleChoiceField(choices=OPEN_DAYS,
                                         widget=forms.CheckboxSelectMultiple)

    class Meta:
        model = Business
        fields = ["name", "category", "open_day", "open_time",
                  "close_time", "field_name", "field_choice"]

    def __init__(self, *args, **kwargs):
        super(BusinessRegisterForm, self).__init__(*args, **kwargs)
        self.fields['name'].widget.attrs.update({'class': 'form-control'})
        self.fields['category'].widget.attrs.update({'class': 'form-select'})
        self.fields['open_time'].widget.attrs.update({'class': 'form-control'})
        self.fields['close_time'].widget.attrs.update({'class': 'form-control'})
        self.fields['field_name'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Ex. Table size'})
        self.fields['field_choice'].widget.attrs.update({'class': 'form-control',
                                                         'placeholder': 'Ex. Big, Medium, Small'})

from django.shortcuts import render, redirect
from .models import BusinessRegisterForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages


@login_required
def business_register(request):
    if request.method == 'POST':
        form = BusinessRegisterForm(request.POST)
        if form.is_valid():
            business = form.save(commit=False)
            business.user = request.user
            business.save()
            messages.success(request,
                             f"{request.user.username}, "
                             f"your request for {business.name} has been successfully submitted!")
            return redirect('queue_app:home')
    else:
        form = BusinessRegisterForm()
    return render(request, 'queue_app/business_register.html', {'form': form})


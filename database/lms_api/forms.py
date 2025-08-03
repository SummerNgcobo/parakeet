from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.models import User
from .models import Invitation
from django import forms
import random
from django.conf import settings
from django.core.mail import send_mail


class CreateUserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']

class RegisterForm(forms.Form):
    email = forms.EmailField()
    password = forms.CharField(widget=forms.PasswordInput)
    confirm_password = forms.CharField(widget=forms.PasswordInput)

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        confirm_password = cleaned_data.get("confirm_password")

        if password != confirm_password:
            raise forms.ValidationError("Passwords do not match.")
        return cleaned_data

def register(request, token):
    invitation = get_object_or_404(Invitation, token=token, is_used=False)
    
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = User.objects.create_user(
                username=form.cleaned_data["email"],
                email=form.cleaned_data["email"],
                password=form.cleaned_data["password"],
            )
            invitation.is_used = True
            invitation.save()

            # Generate and send OTP
            otp = random.randint(100000, 999999)
            request.session["otp"] = otp
            request.session["email"] = user.email
            send_mail(
                "Your OTP Code",
                f"Your OTP is {otp}",
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )

            return JsonResponse({"message": "User registered, proceed to OTP verification."})
    
    return render(request, "register.html", {"form": RegisterForm()})

from django.urls import path
from . import views
from django.urls import path
from .views import (UserProfileView, 
                    UpdateUserProfileView,
                    assign_courses_to_specialization,
                    register_from_invite, verify_otp,
                    send_invitation, 
                    get_email_from_token,
                    generate_invite_url,
                    login_view, logout_view, set_csrf_token)

urlpatterns = [
    path('api/set-csrf-token', views.set_csrf_token, name='set_csrf_token'),
    path('api/login', views.login_view, name='login'),
    path('api/send-invitation', send_invitation, name='send_invitation'),
    path('api/logout', views.logout_view, name='logout'),
    path('api/user', views.user, name='user'),
    path('api/register/<str:token>/', register_from_invite, name='register_from_invite'),
    path("api/register-from-invite/<str:token>/", register_from_invite, name="register_from_invite"),
    path("api/verify-otp/", verify_otp, name="verify_otp"),
    path('update-profile/', UpdateUserProfileView.as_view(), name='update_profile'),
    path('api/get-email-from-token/<uuid:token>/', views.get_email_from_token, name='get_email_from_token'),
    path("api/generate-invite-url/", views.generate_invite_url, name="generate_invite_url"),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('api/assign-courses-to-specialization/', assign_courses_to_specialization, name='assign_courses_to_specialization'),
    path('api/get-user-courses/', views.get_user_courses, name='get_user_courses'),
]
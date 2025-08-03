from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from django.utils.timezone import now
from django.contrib.auth.hashers import make_password
from .models import Invitation, OTPCode, UserProfile, Cohort, Specialization, AdminAssignedCourses, Course
from .serializers import UserProfileSerializer, CourseSerializer  
from datetime import datetime, timedelta
import json
import uuid
from rest_framework import permissions, generics


def get_email_from_token(request, token):
    try:
        invitation = Invitation.objects.get(token=token)
        return JsonResponse({"email": invitation.email})
    except Invitation.DoesNotExist:
        return JsonResponse({"error": "Invalid token"}, status=404)
    
@csrf_exempt
def register_from_invite(request, token):
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")
        confirm_password = data.get("confirm_password")
        cohort_id = data.get("cohort_id")
        specialization_id = data.get("specialization_id")

        if password != confirm_password:
            return JsonResponse({"error": "Passwords do not match"}, status=400)

        try:
            invitation = Invitation.objects.get(token=token, email=email)
        except Invitation.DoesNotExist:
            return JsonResponse({"error": "Invalid or expired invitation"}, status=400)

        cohort = Cohort.objects.get(id=cohort_id)
        specialization = Specialization.objects.get(id=specialization_id)

        user = User.objects.create(
            username=email,
            email=email,
            password=make_password(password),
            is_active=False  
        )

        UserProfile.objects.create(
            user=user,
            email=email,
            cohort=cohort,
            specialization=specialization
        )

        invitation.delete()

        return JsonResponse({"message": "User registered successfully, awaiting OTP verification"}, status=200)

    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def send_invitation(request):
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("email")

        if not email:
            return JsonResponse({"error": "Email is required"}, status=400)

        token = str(uuid.uuid4())  
        invitation = Invitation.objects.create(email=email, token=token, expires_at=now() + timedelta(days=1))

        invite_link = f"{settings.FRONTEND_URL}/register/{token}/"
        send_mail(
            "You're Invited to Register",
            f"Click the link to register: {invite_link}",
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )

        return JsonResponse({"message": "Invitation sent successfully!"}, status=200)
    
    return JsonResponse({"error": "Invalid request method"}, status=405)
    
@csrf_exempt
def verify_otp(request):
    if request.method == "POST":
        data = json.loads(request.body)
        otp = data.get("otp")
        email = data.get("email")

        print("Parsed JSON data:", data)
        print("Raw request body:", request.body)
        print(f"Received OTP: {otp}, Received Email: {email}")

        try:
            otp_record = OTPCode.objects.get(email=email, code=otp, is_used=False)
        except OTPCode.DoesNotExist:
            return JsonResponse({"error": "Invalid OTP or OTP already used"}, status=400)

        if otp_record.expiration_time < now():
            return JsonResponse({"error": "OTP has expired"}, status=400)

        otp_record.is_used = True
        otp_record.save()

        try:
            user = User.objects.get(email=email)
            user.is_active = True
            user.save()

            login(request, user) 
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=400)

        otp_record.delete()

        return JsonResponse({
            "message": "OTP verified successfully. You are now logged in.",
            "email": user.email
        }, status=200)

    return JsonResponse({"error": "Invalid request method"}, status=405)

#Hello this is a test comment
@ensure_csrf_cookie
@require_http_methods(['GET'])
def set_csrf_token(request):
    """
    We set the CSRF cookie on the frontend.
    """
    return JsonResponse({'message': 'CSRF cookie set'})

def login_view(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        email = data['email']
        password = data['password']
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'message': 'Invalid JSON'}, status=400)

    user = authenticate(request, username=email, password=password)

    if user:
        login(request, user)

        if not hasattr(user, "profile"):
            UserProfile.objects.create(user=user, email=user.email, preferred_name=user.username)

        return JsonResponse({'success': True})

    return JsonResponse({'success': False, 'message': 'Invalid credentials'}, status=401)

def logout_view(request):
    logout(request)
    return JsonResponse({'message': 'Logged out'})

@require_http_methods(['GET'])
def user(request):
    if request.user.is_authenticated:
        return JsonResponse(
            {'username': request.user.username, 'email': request.user.email}
        )
    return JsonResponse(
        {'message': 'Not logged in'}, status=401
    )

class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile


@csrf_exempt
def generate_invite_url(request):
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("email")

        if not email:
            return JsonResponse({"error": "Email is required"}, status=400)

        token = str(uuid.uuid4())
        invitation = Invitation.objects.create(email=email, token=token, expires_at=now() + timedelta(days=1))

        invite_link = f"{settings.FRONTEND_URL}/register/{token}/"

        return JsonResponse({"invite_link": invite_link}, status=200)

    return JsonResponse({"error": "Invalid request method"}, status=405)

class UpdateUserProfileView(generics.UpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile
    
@require_http_methods(["GET"])
def get_user_courses(request):
    if request.user.is_authenticated:
        profile = request.user.profile
        courses = profile.registered_courses.all()
        serialized_courses = CourseSerializer(courses, many=True)
        return JsonResponse({"courses": serialized_courses.data}, status=200)
    
    return JsonResponse({"error": "User not logged in"}, status=401)

@csrf_exempt
def assign_courses_to_specialization(request):
    if request.method == "POST":
        data = json.loads(request.body)
        cohort_id = data.get("cohort_id")
        specialization_id = data.get("specialization_id")
        course_ids = data.get("course_ids")

        cohort = Cohort.objects.get(id=cohort_id)
        specialization = Specialization.objects.get(id=specialization_id)
        courses = Course.objects.filter(id__in=course_ids)

        admin_assigned_courses, created = AdminAssignedCourses.objects.get_or_create(
            cohort=cohort,
            specialization=specialization
        )
        admin_assigned_courses.courses.set(courses)

        return JsonResponse({"message": "Courses assigned successfully"}, status=200)

    return JsonResponse({"error": "Invalid request method"}, status=405)
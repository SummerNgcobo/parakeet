from django.db import models
from django.utils.timezone import now
from datetime import timedelta
from django.contrib.auth.models import User

class Cohort(models.Model):
    name = models.CharField(max_length=100, unique=True)
    start_date = models.DateField()
    end_date = models.DateField()
    specializations = models.ManyToManyField('Specialization', related_name='cohort_specializations', blank=True)

    def __str__(self):
        return self.name

class Specialization(models.Model):
    name = models.CharField(max_length=255, unique=True)
    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE, related_name="specialization_cohorts")
    courses = models.ManyToManyField('Course', related_name="specialization_courses", blank=True)
    registered_profiles = models.ManyToManyField('UserProfile', related_name="specialization_profiles", blank=True)

    def __str__(self):
        return self.name

class Course(models.Model):
    PROVIDER_CHOICES = [
        ("Kat Steynberg", "Kat Steynberg"),
        ("Other Provider", "Other Provider"),
    ]

    STATUS_CHOICES = [
        ("Incomplete", "Incomplete"),
        ("In-Progress", "In-Progress"),
        ("Complete", "Complete"),
    ]

    provider = models.CharField(max_length=100, choices=PROVIDER_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Incomplete")
    materials = models.JSONField(default=list)  
    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE, related_name="cohort_courses")
    specialization = models.ForeignKey(Specialization, on_delete=models.CASCADE, related_name="course_specializations")

    def __str__(self):
        return self.title

class AdminAssignedCourses(models.Model):
    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE, related_name="assigned_courses")
    specialization = models.ForeignKey(Specialization, on_delete=models.CASCADE, related_name="assigned_specializations")
    courses = models.ManyToManyField(Course, related_name="admin_assigned_courses")

    def __str__(self):
        return f"{self.specialization.name} - {self.cohort.name}"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    name = models.CharField(max_length=100)
    surname = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    physical_address = models.TextField()
    preferred_name = models.CharField(max_length=100, unique=True)
    cohort = models.ForeignKey(Cohort, on_delete=models.SET_NULL, null=True, related_name="user_profiles")
    specialization = models.ForeignKey(Specialization, on_delete=models.SET_NULL, null=True, related_name="user_specializations")
    registered_courses = models.ManyToManyField(Course, blank=True, related_name="registered_users")

    def assign_courses(self):
        if self.cohort and self.specialization:
            assigned_courses = Course.objects.filter(
                cohort=self.cohort, specialization=self.specialization
            )
            self.registered_courses.set(assigned_courses)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.assign_courses()  

    def __str__(self):
        return self.preferred_name

class Invitation(models.Model):
    email = models.EmailField(unique=True)
    token = models.CharField(max_length=100, unique=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return now() > self.expires_at

class OTPCode(models.Model):
    email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    expiration_time = models.DateTimeField()

    def __str__(self):
        return f"{self.email} - {self.code}"

    def save(self, *args, **kwargs):
        if not self.expiration_time:
            self.expiration_time = self.created_at + timedelta(minutes=10)
        super().save(*args, **kwargs)

from rest_framework import serializers
from .models import UserProfile, Course, Cohort, Specialization, AdminAssignedCourses

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'course_id']

class UserProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    registered_courses = CourseSerializer(many=True, read_only=True)

    class Meta:
        model = UserProfile
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class CohortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cohort
        fields = '__all__'

class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    registered_courses = CourseSerializer(many=True, read_only=True)

    class Meta:
        model = UserProfile
        fields = '__all__'
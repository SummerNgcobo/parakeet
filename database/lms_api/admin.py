from django.contrib import admin
from .models import Cohort, Specialization, Course, AdminAssignedCourses, UserProfile, Invitation, OTPCode

class CohortAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'end_date')
    search_fields = ('name',)

class SpecializationAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'provider', 'status', 'due_date')
    search_fields = ('title', 'provider')
    list_filter = ('status', 'provider')

class AdminAssignedCoursesAdmin(admin.ModelAdmin):
    list_display = ('cohort', 'specialization')
    search_fields = ('cohort__name', 'specialization__name')

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'preferred_name', 'email', 'cohort', 'specialization')
    search_fields = ('user__username', 'email', 'preferred_name')
    list_filter = ('cohort', 'specialization')

class InvitationAdmin(admin.ModelAdmin):
    list_display = ('email', 'token', 'expires_at')
    search_fields = ('email', 'token')

class OTPCodeAdmin(admin.ModelAdmin):
    list_display = ('email', 'code', 'created_at', 'is_used', 'expiration_time')
    search_fields = ('email', 'code')
    list_filter = ('is_used',)

# Register models with custom admin classes
admin.site.register(Cohort, CohortAdmin)
admin.site.register(Specialization, SpecializationAdmin)
admin.site.register(Course, CourseAdmin)
admin.site.register(AdminAssignedCourses, AdminAssignedCoursesAdmin)
admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(Invitation, InvitationAdmin)
admin.site.register(OTPCode, OTPCodeAdmin)

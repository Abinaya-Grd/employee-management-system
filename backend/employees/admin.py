from django.contrib import admin
from .models import Employee


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'name', 'email', 'department', 'designation', 'salary', 'joining_date']
    search_fields = ['name', 'email', 'employee_id']
    list_filter = ['department', 'gender']

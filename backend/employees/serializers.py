from decimal import Decimal
from rest_framework import serializers
from departments.models import Department
from departments.serializers import DepartmentSerializer
from .models import Employee


class EmployeeSerializer(serializers.ModelSerializer):
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all())
    department_detail = DepartmentSerializer(source='department', read_only=True)
    employee_id = serializers.CharField(read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'name', 'email', 'phone', 'gender', 'dob',
            'department', 'department_detail', 'designation', 'salary',
            'joining_date', 'address', 'status', 'profile_image', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'employee_id', 'created_at', 'updated_at']

    def validate_email(self, value):
        value = value.strip().lower()
        qs = Employee.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("An employee with this email already exists.")
        return value

    def validate_phone(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")
        return value

    def validate_salary(self, value):
        if value < Decimal('0'):
            raise serializers.ValidationError("Salary cannot be negative.")
        return value

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Name is required.")
        return value.strip()

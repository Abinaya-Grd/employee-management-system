import csv

from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from departments.models import Department
from .models import Employee
from .serializers import EmployeeSerializer


class EmployeeListCreateView(generics.ListCreateAPIView):
    
    queryset = Employee.objects.select_related('department').all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'gender', 'status', 'designation']
    search_fields = ['name', 'email', 'employee_id']
    ordering_fields = ['name', 'joining_date', 'salary', 'created_at']


class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    
    queryset = Employee.objects.select_related('department').all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]


class DashboardView(APIView):
   
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_employees = Employee.objects.count()
        total_departments = Department.objects.count()
        active_employees = Employee.objects.filter(status='active').count()
        inactive_employees = Employee.objects.filter(status='inactive').count()
        recent_employees = Employee.objects.select_related('department').order_by('-created_at')[:5]

        department_breakdown = [
            {
                'department': dept.name,
                'employee_count': dept.employee_count,
            }
            for dept in Department.objects.all()
        ]

        data = {
            'total_employees': total_employees,
            'total_departments': total_departments,
            'active_employees': active_employees,
            'inactive_employees': inactive_employees,
            'department_breakdown': department_breakdown,
            'recent_employees': EmployeeSerializer(
                recent_employees, many=True, context={'request': request}
            ).data,
        }
        return Response(data)


class EmployeeExportView(generics.ListAPIView):
   
    queryset = Employee.objects.select_related('department').all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'gender', 'status', 'designation']
    search_fields = ['name', 'email', 'employee_id']
    pagination_class = None  # export the full filtered set, not just one page

    def get(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="employees.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Employee ID', 'Name', 'Email', 'Phone', 'Gender', 'Date of Birth',
            'Department', 'Designation', 'Salary', 'Joining Date', 'Address', 'Status',
        ])
        for emp in queryset:
            writer.writerow([
                emp.employee_id, emp.name, emp.email, emp.phone, emp.get_gender_display(),
                emp.dob, emp.department.name if emp.department else '', emp.designation,
                emp.salary, emp.joining_date, emp.address or '', emp.get_status_display(),
            ])
        return response

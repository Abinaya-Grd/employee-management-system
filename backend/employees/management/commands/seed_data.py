from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from departments.models import Department
from employees.models import Employee
import datetime


class Command(BaseCommand):
    help = 'Seed the database with a superuser and sample departments/employees.'

    def handle(self, *args, **options):
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'Admin@123')
            self.stdout.write(self.style.SUCCESS('Created superuser: admin / Admin@123'))
        else:
            self.stdout.write('Superuser "admin" already exists.')

        dept_names = ['Engineering', 'Human Resources', 'Sales', 'Finance', 'Marketing']
        depts = {}
        for name in dept_names:
            dept, _ = Department.objects.get_or_create(name=name, defaults={'description': f'{name} department'})
            depts[name] = dept
        self.stdout.write(self.style.SUCCESS(f'Departments ready: {", ".join(dept_names)}'))

        sample_employees = [
            ('Asha Rao', 'asha.rao@example.com', '9876543210', 'F', 'Engineering', 'Software Engineer', 75000),
            ('Vikram Nair', 'vikram.nair@example.com', '9876543211', 'M', 'Sales', 'Sales Executive', 45000),
            ('Priya Menon', 'priya.menon@example.com', '9876543212', 'F', 'Human Resources', 'HR Manager', 60000),
        ]
        for name, email, phone, gender, dept_name, designation, salary in sample_employees:
            if not Employee.objects.filter(email=email).exists():
                Employee.objects.create(
                    name=name, email=email, phone=phone, gender=gender,
                    dob=datetime.date(1995, 1, 1), department=depts[dept_name],
                    designation=designation, salary=salary,
                    joining_date=datetime.date(2023, 1, 1),
                )
        self.stdout.write(self.style.SUCCESS('Sample employees created.'))

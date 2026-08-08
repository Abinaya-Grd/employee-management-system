from django.db import models
from django.core.validators import RegexValidator, MinValueValidator
from departments.models import Department


def profile_image_path(instance, filename):
    return f'employee_profiles/{instance.employee_id}/{filename}'


class Employee(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]

    phone_validator = RegexValidator(
        regex=r'^\d{10}$',
        message='Phone number must be exactly 10 digits.'
    )

    employee_id = models.CharField(max_length=20, unique=True, editable=False)
    name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=10, validators=[phone_validator])
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    dob = models.DateField(verbose_name='Date of Birth')
    department = models.ForeignKey(
        Department, on_delete=models.SET_NULL, null=True, related_name='employees'
    )
    designation = models.CharField(max_length=100)
    salary = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(0)]
    )
    joining_date = models.DateField()
    address = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    profile_image = models.ImageField(
        upload_to=profile_image_path, blank=True, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.employee_id} - {self.name}'

    def save(self, *args, **kwargs):
        if not self.employee_id:
            last = Employee.objects.order_by('id').last()
            next_num = (last.id + 1) if last else 1
            candidate = f'EMP{next_num:04d}'
            # ensure uniqueness even if rows were deleted
            while Employee.objects.filter(employee_id=candidate).exists():
                next_num += 1
                candidate = f'EMP{next_num:04d}'
            self.employee_id = candidate
        super().save(*args, **kwargs)

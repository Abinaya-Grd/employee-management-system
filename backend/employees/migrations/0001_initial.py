import django.core.validators
import django.db.models.deletion
from django.db import migrations, models

import employees.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('departments', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Employee',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('employee_id', models.CharField(editable=False, max_length=20, unique=True)),
                ('name', models.CharField(max_length=150)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('phone', models.CharField(
                    max_length=10,
                    validators=[django.core.validators.RegexValidator(
                        message='Phone number must be exactly 10 digits.', regex='^\\d{10}$'
                    )]
                )),
                ('gender', models.CharField(choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')], max_length=1)),
                ('dob', models.DateField(verbose_name='Date of Birth')),
                ('designation', models.CharField(max_length=100)),
                ('salary', models.DecimalField(
                    decimal_places=2, max_digits=12,
                    validators=[django.core.validators.MinValueValidator(0)]
                )),
                ('joining_date', models.DateField()),
                ('profile_image', models.ImageField(blank=True, null=True, upload_to=employees.models.profile_image_path)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('department', models.ForeignKey(
                    null=True, on_delete=django.db.models.deletion.SET_NULL,
                    related_name='employees', to='departments.department'
                )),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]

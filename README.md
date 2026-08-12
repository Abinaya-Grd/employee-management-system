# Employee Management System

A full-stack Employee Management System built with **Django REST Framework** (backend),
**React (Vite)** (frontend), and **MySQL** (database), with JWT authentication.

## Features

- **Authentication**: JWT-based login/logout (access + refresh tokens, refresh blacklisting)
- **Department CRUD**: create, list, update, delete
- **Employee CRUD**: Employee ID (auto-generated), Name, Email, Phone, Gender, DOB,
  Department, Designation, Salary, Joining Date, Profile Image
- **Dashboard**: total employees, total departments, 5 most recent employees
- **Search & Filter**: search employees by name, filter by department
- **Validation**: unique email, 10-digit phone, non-negative salary, required fields
- **Bonus**: JWT auth, pagination, image upload, Docker, docker-compose deployment

## Project Structure

```
project/
├── backend/            # Django REST Framework API
│   ├── core/            # settings, urls
│   ├── accounts/        # login/logout (JWT)
│   ├── departments/     # department CRUD
│   ├── employees/       # employee CRUD + dashboard
│   ├── Dockerfile
│   └── entrypoint.sh
├── frontend/            # React (Vite) SPA
│   ├── src/
│   │   ├── pages/        # Login, Dashboard, Employees, EmployeeForm, Departments
│   │   ├── components/   # Layout, ProtectedRoute
│   │   └── api/          # axios client with JWT interceptors
│   └── Dockerfile
└── docker-compose.yml
```

## Quick Start (Docker — recommended)

Requires Docker + Docker Compose.

### 1. Configure backend environment

Copy the example environment file.

On Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

On macOS/Linux:

```bash
cp backend/.env.example backend/.env
```

### 2. Start the application

Run from the repository root:

```bash
docker compose up --build
```

This will:

1. Start MySQL 8 and wait until it is healthy
2. Run Django migrations, collect static files, and seed demo data
3. Start the Django backend (gunicorn) on **http://localhost:8000**
4. Build and serve the React app on **http://localhost:5174**

**Default login:** `admin` / `Admin@123`

API root: `http://localhost:8000/api/`

Django admin: `http://localhost:8000/admin/`

## Local Development (without Docker)

### Backend

Requires Python 3.12+ and a running MySQL server.

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env with your local MySQL credentials (DB_HOST=localhost etc.)

python manage.py migrate
python manage.py seed_data     # creates admin user + sample data
python manage.py runserver 8000
```

### Frontend

Requires Node.js 18+.

```bash
cd frontend
npm install
cp .env.example .env    # VITE_API_BASE_URL=http://localhost:8000/api
npm run dev
```

Visit **http://localhost:5173**.

## API Reference

| Method | Endpoint                 | Description                          | Auth |
|--------|---------------------------|---------------------------------------|------|
| POST   | `/api/login`               | Obtain access + refresh JWT tokens    | No   |
| POST   | `/api/logout`               | Blacklist refresh token                | Yes  |
| POST   | `/api/token/refresh`        | Get a new access token                 | No   |
| GET    | `/api/employees`            | List employees (search/filter/paginate)| Yes  |
| POST   | `/api/employees`            | Create employee                        | Yes  |
| GET    | `/api/employees/{id}`       | Retrieve employee                      | Yes  |
| PUT    | `/api/employees/{id}`       | Update employee                        | Yes  |
| DELETE | `/api/employees/{id}`       | Delete employee                        | Yes  |
| GET    | `/api/departments`          | List departments                       | Yes  |
| POST   | `/api/departments`          | Create department                      | Yes  |
| GET    | `/api/departments/{id}`     | Retrieve department                    | Yes  |
| PUT    | `/api/departments/{id}`     | Update department                      | Yes  |
| DELETE | `/api/departments/{id}`     | Delete department                      | Yes  |
| GET    | `/api/dashboard`            | Dashboard summary stats                | Yes  |

**Query params for `/api/employees`:** `?search=<name>&department=<id>&gender=<M|F|O>&ordering=<field>&page=<n>`

**Auth header:** `Authorization: Bearer <access_token>`

### Sample login request

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "Admin@123"}'
```

## Validation Rules

- Email must be unique across employees (case-insensitive)
- Phone must be exactly 10 digits
- Salary must be zero or positive
- Name, email, phone, gender, DOB, department, designation, salary, and joining date
  are all required fields
- Department name must be unique

## Notes

- Profile images are stored under `backend/media/employee_profiles/<employee_id>/`
  and served via `/media/...` in development, or via the shared Docker volume in production.
- For a real production deployment, put the Django app behind a proper web server/reverse
  proxy (e.g. nginx in front of gunicorn), set `DEBUG=False`, use a strong `SECRET_KEY`,
  and configure `ALLOWED_HOSTS` / `CORS_ALLOWED_ORIGINS` for your real domain.

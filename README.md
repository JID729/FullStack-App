# Django - CPD Assessment Tool (Backend)

A brief description of the project. Mention what it does and its purpose.

## 🚀 Features
- User authentication (Login/Register)
- Database integration with Django ORM
- Template rendering with HTML & CSS
- API integration (if applicable)
- Static files management (CSS, JS, Images)

### 📂 FullStack App - Project Structure

```plaintext
FullStack App              # Root directory
│── .git/                  # Git repository (created after running git init)
│── .gitignore             # Files to exclude from Git
│── manage.py              # Django’s CLI management tool
│── requirements.txt       # Python dependencies (for Git and deployment)
│── db.sqlite3             # Default SQLite database (ignored in production)
│
├── CPD Assessment Tool (Backend)/          # Django project folder (contains settings)
│   │── __init__.py      # Makes this a Python package
│   │── settings.py      # Main Django settings
│   │── urls.py          # Main URL configuration
│   │── asgi.py          # ASGI application entry point
│   │── wsgi.py          # WSGI application entry point
│
├── myapp/                # Django app folder
│   │── __init__.py       # Makes this a Python package
│   │── admin.py          # Admin panel configuration
│   │── apps.py           # App configuration
│   │── models.py         # Database models
│   │── views.py          # View functions (renders templates)
│   │── urls.py           # URL patterns for this app
│   │── tests.py          # Test cases
│   │── migrations/       # Database migrations
│
├── templates/            # Templates folder (HTML files)
│   ├── home.html         # Sample home template
│   ├── base.html         # Base template (for reusability)
│
├── static/               # Static files (CSS, JS, images)
│   ├── css/              # CSS files
│   ├── js/               # JavaScript files
│   ├── images/           # Image assets
│
└── venv/                 # Virtual environment (optional, should be in .gitignore)
---

## 🛠 Installation & Setup

### **Prerequisites**
- Python 3.x installed
- `pip` installed
- Virtual environment (optional but recommended)

📝 Steps to Create This Folder Structure

1. Initialize Django Project
django-admin startproject myproject
cd myproject

2. Create a Django App
python manage.py startapp myapp

3. Create the Templates Folder
mkdir templates
touch templates/home.html

4. Add a Simple Home Page (templates/home.html)
<!DOCTYPE html>
<html>
<head>
    <title>My Django App</title>
</head>
<body>
    <h1>Welcome to Django with Templates</h1>
</body>
</html>

5. Modify myapp/views.py to Render the Template
from django.shortcuts import render

def home(request):
    return render(request, 'home.html')

6. Create a URL Route (myapp/urls.py)
from django.urls import path
from .views import home

urlpatterns = [
    path('', home, name='home'),
]

7. Register URLs in myproject/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('myapp.urls')),
]

8. Initialize Git and Push to GitHub
git init
touch .gitignore

9. Add the Following to .gitignore
# Ignore Python & Django files
*.pyc
__pycache__/
venv/
db.sqlite3
staticfiles/

# Ignore VS Code & System Files
.vscode/
.DS_Store

10. Push to GitHub
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin your-github-repo-url
git push -u origin main

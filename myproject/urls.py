from django.contrib import admin
from django.urls import path, include
from myapp.views import home  # ✅ Import the new homepage view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('myapp.urls')),  # API Endpoints
    path('', home),  # ✅ Default homepage
]
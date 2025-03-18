from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import YourModelViewSet

# ✅ Set up DRF router
router = DefaultRouter()
router.register(r'yourmodel', YourModelViewSet)  # Registers `/api/yourmodel/`

urlpatterns = [
    path('', include(router.urls)),  # ✅ Make sure this is correct
]

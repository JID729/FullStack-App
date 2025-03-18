from rest_framework import viewsets
from .models import YourModel
from .serializers import YourModelSerializer
from django.http import JsonResponse


class YourModelViewSet(viewsets.ModelViewSet):
    queryset = YourModel.objects.all()
    serializer_class = YourModelSerializer

def home(request):
    return JsonResponse({"message": "Welcome to Django REST API!"})
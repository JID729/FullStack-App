from rest_framework import serializers
from .models import YourModel  # Import your model

class YourModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = YourModel
        fields = '__all__'  # Ensure all fields are included

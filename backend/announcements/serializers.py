from rest_framework import serializers
from .models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='posted_by.name', read_only=True)
    date = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = ['id', 'title', 'message', 'audience', 'date', 'author']
        read_only_fields = ['date', 'author']

    def get_date(self, obj):
        """Format datetime as YYYY-MM-DD"""
        return obj.date.strftime('%Y-%m-%d')

    def create(self, validated_data):
        # Set posted_by to the current user
        validated_data['posted_by'] = self.context['request'].user
        return super().create(validated_data)

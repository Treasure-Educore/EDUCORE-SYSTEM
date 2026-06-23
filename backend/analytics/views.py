from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated

from announcements.models import Announcement
from announcements.serializers import AnnouncementSerializer
from staff.models import StaffProfile


@api_view(['GET'])
def dashboard(request):
    """
    Dashboard aggregation endpoint
    Returns different metric card data per role
    """
    user_role = request.user.role
    
    # Get last 5 announcements
    if user_role in ['admin', 'head_teacher', 'dos', 'teacher', 'bursar', 'non_teaching']:
        if user_role in ['teacher', 'head_teacher', 'admin', 'dos']:
            # Teachers, Head Teacher, Admin, DOS can see All and Staff announcements
            announcements = Announcement.objects.filter(
                audience__in=['All', 'Staff']
            )[:5]
        else:
            # Bursar and Non-teaching can see All announcements only
            announcements = Announcement.objects.filter(audience='All')[:5]
    
    announcements_data = AnnouncementSerializer(announcements, many=True).data
    
    # Build metrics based on role
    metrics = []
    
    if user_role in ['admin', 'head_teacher']:
        metrics = [
            {"label": "Total Students", "value": 1248, "trend": "+12 this month"},
            {"label": "Total Staff", "value": 84, "trend": "2 on leave"},
            {"label": "Active Classes", "value": 24, "trend": "All active"},
            {"label": "Fee Collection", "value": "85%", "trend": "+5% vs last term"}
        ]
    elif user_role == 'dos':
        metrics = [
            {"label": "Classes Managed", "value": 24, "trend": "All active"},
            {"label": "Marks Submitted", "value": "68%", "trend": "12 classes pending"},
            {"label": "Top Performing Class", "value": "S.4 A", "trend": "Avg: 82%"},
            {"label": "Total Students", "value": 1248, "trend": "Across all streams"}
        ]
    elif user_role == 'bursar':
        metrics = [
            {"label": "Total Collected", "value": "$124,500", "trend": "+15% vs last month"},
            {"label": "Pending Fees", "value": "$32,400", "trend": "45 students"},
            {"label": "Monthly Expenses", "value": "$45,200", "trend": "Within budget"},
            {"label": "Active Bursaries", "value": 12, "trend": "2 new this term"}
        ]
    elif user_role == 'teacher':
        # Get teacher's subjects count (classes)
        try:
            teacher_profile = StaffProfile.objects.get(user=request.user)
            subjects_count = teacher_profile.subjects.count()
        except StaffProfile.DoesNotExist:
            subjects_count = 0
        
        metrics = [
            {"label": "My Classes", "value": subjects_count, "trend": "Subjects taught"},
            {"label": "Total Students", "value": 215, "trend": "Across all classes"},
            {"label": "Marks Status", "value": "Pending", "trend": "Due in 3 days"},
            {"label": "Avg Attendance", "value": "94%", "trend": "+2% this week"}
        ]
    
    return Response({
        "metrics": metrics,
        "announcements": announcements_data
    })


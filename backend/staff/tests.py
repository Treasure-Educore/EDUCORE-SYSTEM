from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone

from .models import StaffProfile


class StaffNumberTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(email='staff1@example.com', password='pass1234', name='Staff One', role=User.Role.TEACHER)

    def test_staff_number_auto_generated(self):
        sp = StaffProfile.objects.create(user=self.user)
        year_short = str(timezone.now().year)[-2:]
        self.assertTrue(sp.staff_number.startswith(f"{year_short}/STA/"))
        # check sequential 001
        self.assertTrue(sp.staff_number.endswith('001'))
from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from accounts.models import User
from .models import Department, Subject, StaffProfile
from announcements.models import Announcement


class StaffAPITestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create test users
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            name='Admin User',
            role='admin',
            password='testpass123'
        )
        self.head_teacher_user = User.objects.create_user(
            email='headteacher@test.com',
            name='Head Teacher',
            role='head_teacher',
            password='testpass123'
        )
        self.teacher_user = User.objects.create_user(
            email='teacher@test.com',
            name='Teacher',
            role='teacher',
            password='testpass123'
        )
        
        # Create test department and subject
        self.department = Department.objects.create(name='Sciences')
        self.subject = Subject.objects.create(
            name='Mathematics',
            code='MATH',
            department=self.department
        )
        
        # Create a staff profile for teacher
        self.staff_profile = StaffProfile.objects.create(
            user=self.teacher_user,
            phone='+256701234567',
            gender='Male',
            tin='1002345678',
            bank_account='1234567890',
            department=self.department,
            status='Active',
            class_teacher_stream='S.1 A'
        )
        self.staff_profile.subjects.add(self.subject)

    def test_get_staff_list_returns_200(self):
        """Test GET /api/staff/ returns 200 with correct staff list shape"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/staff/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        
        staff_item = response.data['results'][0]
        self.assertIn('id', staff_item)
        self.assertIn('fullName', staff_item)
        self.assertIn('email', staff_item)
        self.assertIn('role', staff_item)
        self.assertIn('tin', staff_item)
        self.assertIn('subjects', staff_item)
        self.assertIn('classTeacher', staff_item)
        self.assertIn('status', staff_item)
        
        self.assertEqual(staff_item['fullName'], 'Teacher')
        self.assertEqual(staff_item['email'], 'teacher@test.com')
        self.assertEqual(staff_item['role'], 'teacher')
        self.assertEqual(staff_item['subjects'], ['Mathematics'])
        self.assertEqual(staff_item['classTeacher'], 'S.1 A')
        self.assertEqual(staff_item['status'], 'Active')

    def test_post_staff_creates_user_and_profile(self):
        """Test POST /api/staff/ creates both User and StaffProfile"""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {
            'full_name': 'New Staff',
            'email': 'newstaff@test.com',
            'password': 'securepass123',
            'phone': '+256701234568',
            'gender': 'Female',
            'tin': '1002345679',
            'bank_account': '0987654321',
            'role': 'teacher',
            'department_id': str(self.department.id),
            'subject_ids': [str(self.subject.id)],
            'class_teacher_stream': 'S.2 B',
            'patron_club': 'Science Club'
        }
        
        response = self.client.post('/api/staff/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check User was created
        user = User.objects.get(email='newstaff@test.com')
        self.assertEqual(user.name, 'New Staff')
        self.assertEqual(user.role, 'teacher')
        
        # Check StaffProfile was created and linked
        staff_profile = StaffProfile.objects.get(user=user)
        self.assertEqual(staff_profile.tin, '1002345679')
        self.assertEqual(staff_profile.class_teacher_stream, 'S.2 B')

    def test_post_staff_by_teacher_returns_403(self):
        """Test POST /api/staff/ by teacher role returns 403"""
        self.client.force_authenticate(user=self.teacher_user)
        
        data = {
            'full_name': 'Another Staff',
            'email': 'anotherstaff@test.com',
            'password': 'securepass123',
            'role': 'teacher'
        }
        
        response = self.client.post('/api/staff/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_staff_unauthenticated_returns_401(self):
        """Test GET /api/staff/ without authentication returns 401"""
        response = self.client.get('/api/staff/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class AnnouncementAPITestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create test users
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            name='Admin User',
            role='admin',
            password='testpass123'
        )
        self.teacher_user = User.objects.create_user(
            email='teacher@test.com',
            name='Teacher',
            role='teacher',
            password='testpass123'
        )
        
        # Create announcements
        self.announcement1 = Announcement.objects.create(
            title='Announcement 1',
            message='Message 1',
            audience='All',
            posted_by=self.admin_user
        )
        self.announcement2 = Announcement.objects.create(
            title='Announcement 2',
            message='Message 2',
            audience='Staff',
            posted_by=self.admin_user
        )

    def test_get_announcements_returns_ordered_by_date(self):
        """Test GET /api/announcements/ returns announcements ordered by -date"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/announcements/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        
        # Check ordering (newest first)
        self.assertEqual(response.data['results'][0]['title'], 'Announcement 2')
        self.assertEqual(response.data['results'][1]['title'], 'Announcement 1')

    def test_post_announcements_by_admin_returns_201(self):
        """Test POST /api/announcements/ by admin returns 201"""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {
            'title': 'New Announcement',
            'message': 'New Message',
            'audience': 'All'
        }
        
        response = self.client.post('/api/announcements/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Announcement')

    def test_post_announcements_by_teacher_returns_403(self):
        """Test POST /api/announcements/ by teacher returns 403"""
        self.client.force_authenticate(user=self.teacher_user)
        
        data = {
            'title': 'Unauthorized Announcement',
            'message': 'Should not create',
            'audience': 'All'
        }
        
        response = self.client.post('/api/announcements/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class DashboardAPITestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create test users
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            name='Admin User',
            role='admin',
            password='testpass123'
        )
        self.bursar_user = User.objects.create_user(
            email='bursar@test.com',
            name='Bursar',
            role='bursar',
            password='testpass123'
        )
        self.teacher_user = User.objects.create_user(
            email='teacher@test.com',
            name='Teacher',
            role='teacher',
            password='testpass123'
        )
        
        # Create announcements
        Announcement.objects.create(
            title='All Announcement',
            message='Message',
            audience='All',
            posted_by=self.admin_user
        )
        Announcement.objects.create(
            title='Staff Announcement',
            message='Message',
            audience='Staff',
            posted_by=self.admin_user
        )

    def test_get_dashboard_as_admin_returns_4_metric_cards(self):
        """Test GET /api/dashboard/ as admin returns 4 metric cards"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/dashboard/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['metrics']), 4)
        
        labels = [metric['label'] for metric in response.data['metrics']]
        self.assertIn('Total Students', labels)
        self.assertIn('Total Staff', labels)
        self.assertIn('Active Classes', labels)
        self.assertIn('Fee Collection', labels)

    def test_get_dashboard_as_bursar_returns_bursar_specific_metrics(self):
        """Test GET /api/dashboard/ as bursar returns bursar-specific metrics"""
        self.client.force_authenticate(user=self.bursar_user)
        response = self.client.get('/api/dashboard/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['metrics']), 4)
        
        labels = [metric['label'] for metric in response.data['metrics']]
        self.assertIn('Total Collected', labels)
        self.assertIn('Pending Fees', labels)
        self.assertIn('Active Bursaries', labels)
        self.assertIn('Fee Collection', labels)

    def test_get_dashboard_unauthenticated_returns_401(self):
        """Test GET /api/dashboard/ without authentication returns 401"""
        response = self.client.get('/api/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

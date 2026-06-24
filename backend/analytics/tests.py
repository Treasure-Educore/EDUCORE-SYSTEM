from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient


class DashboardTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.User = get_user_model()

		self.admin = self.User.objects.create_user(
			email="admin@example.com",
			password="password",
			name="Admin",
			role=self.User.Role.ADMIN,
		)

		self.dos = self.User.objects.create_user(
			email="dos@example.com",
			password="password",
			name="DOS",
			role=self.User.Role.DOS,
		)

		self.bursar = self.User.objects.create_user(
			email="bursar@example.com",
			password="password",
			name="Bursar",
			role=self.User.Role.BURSAR,
		)

		self.teacher = self.User.objects.create_user(
			email="teacher@example.com",
			password="password",
			name="Teacher",
			role=self.User.Role.TEACHER,
		)

	def test_admin_dashboard_returns_4_metrics_with_keys(self):
		self.client.force_authenticate(user=self.admin)
		resp = self.client.get("/api/dashboard/")
		self.assertEqual(resp.status_code, 200)
		metrics = resp.data.get("metrics", [])
		self.assertEqual(len(metrics), 4)
		for m in metrics:
			self.assertIn("label", m)
			self.assertIn("value", m)
			self.assertIn("trend", m)

	def test_dos_dashboard_contains_expected_labels(self):
		self.client.force_authenticate(user=self.dos)
		resp = self.client.get("/api/dashboard/")
		self.assertEqual(resp.status_code, 200)
		labels = [m.get("label") for m in resp.data.get("metrics", [])]
		self.assertIn("Classes Managed", labels)
		self.assertIn("Marks Submitted", labels)

	def test_bursar_dashboard_contains_total_collected(self):
		self.client.force_authenticate(user=self.bursar)
		resp = self.client.get("/api/dashboard/")
		self.assertEqual(resp.status_code, 200)
		labels = [m.get("label") for m in resp.data.get("metrics", [])]
		self.assertIn("Total Collected", labels)

	def test_teacher_dashboard_contains_my_classes(self):
		self.client.force_authenticate(user=self.teacher)
		resp = self.client.get("/api/dashboard/")
		self.assertEqual(resp.status_code, 200)
		labels = [m.get("label") for m in resp.data.get("metrics", [])]
		self.assertIn("My Classes", labels)

	def test_unauthenticated_dashboard_returns_401(self):
		client = APIClient()
		resp = client.get("/api/dashboard/")
		self.assertEqual(resp.status_code, 401)

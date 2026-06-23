from django.db import models

from core.base_model import BaseModel


class SchemeOfWork(BaseModel):
	subject = models.ForeignKey('staff.Subject', on_delete=models.CASCADE, related_name='schemes')
	stream = models.ForeignKey('students.Stream', on_delete=models.CASCADE, related_name='schemes')
	term = models.CharField(max_length=20)
	week = models.PositiveIntegerField()
	period = models.PositiveIntegerField(default=1)
	theme_topic = models.CharField(max_length=500)
	competency = models.TextField()
	learning_outcomes = models.TextField()
	learning_activities = models.TextField()
	teaching_resources = models.TextField(blank=True)
	references = models.TextField(blank=True)
	remarks = models.TextField(blank=True)
	assessment_methods = models.TextField()
	status = models.CharField(
		max_length=25,
		choices=[
			('Draft', 'Draft'),
			('Submitted', 'Submitted'),
			('Approved', 'Approved'),
			('Revision Requested', 'Revision Requested'),
		],
		default='Draft',
	)
	teacher = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='schemes')
	submitted_to = models.CharField(max_length=30, blank=True)
	submitted_date = models.DateField(null=True, blank=True)
	reviewed_date = models.DateField(null=True, blank=True)
	feedback = models.TextField(blank=True)

	class Meta:
		ordering = ['-created_at']

	def __str__(self):
		return f"{self.subject.name} - {self.stream.display_name()} ({self.term} W{self.week})"


class LessonPlan(BaseModel):
	scheme = models.ForeignKey(SchemeOfWork, on_delete=models.SET_NULL, null=True, blank=True, related_name='lesson_plans')
	date = models.DateField()
	subject = models.ForeignKey('staff.Subject', on_delete=models.CASCADE, related_name='lesson_plans')
	stream = models.ForeignKey('students.Stream', on_delete=models.CASCADE, related_name='lesson_plans')
	term = models.CharField(max_length=20)
	week = models.PositiveIntegerField()
	periods = models.PositiveIntegerField(default=1)
	topic = models.CharField(max_length=500)
	competencies = models.TextField()
	learning_outcomes = models.TextField()
	indicators = models.TextField()
	values = models.TextField()
	generic_skills = models.TextField()
	introduction = models.TextField()
	teacher_activities = models.TextField()
	learner_activities = models.TextField()
	main_activity = models.TextField()
	assessment = models.TextField()
	reflection = models.TextField(blank=True)
	homework = models.TextField(blank=True)
	teaching_materials = models.TextField(blank=True)
	references = models.TextField(blank=True)
	status = models.CharField(
		max_length=25,
		choices=[
			('Draft', 'Draft'),
			('Submitted', 'Submitted'),
			('Approved', 'Approved'),
			('Revision Requested', 'Revision Requested'),
		],
		default='Draft',
	)
	teacher = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='lesson_plans')
	submitted_to = models.CharField(max_length=30, blank=True)
	submitted_date = models.DateField(null=True, blank=True)
	reviewed_date = models.DateField(null=True, blank=True)
	feedback = models.TextField(blank=True)

	class Meta:
		ordering = ['-created_at']

	def __str__(self):
		return f"{self.topic} - {self.stream.display_name()} ({self.date})"

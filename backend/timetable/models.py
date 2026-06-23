from django.db import models

from core.base_model import BaseModel


class Period(BaseModel):
	number = models.PositiveIntegerField()  # 1 through 8
	start_time = models.TimeField()
	end_time = models.TimeField()

	class Meta:
		ordering = ["number"]

	def __str__(self):
		return f"Period {self.number} ({self.start_time} - {self.end_time})"


class TimetableSlot(BaseModel):
	DAY_CHOICES = [
		("Monday", "Monday"),
		("Tuesday", "Tuesday"),
		("Wednesday", "Wednesday"),
		("Thursday", "Thursday"),
		("Friday", "Friday"),
	]
	day = models.CharField(max_length=10, choices=DAY_CHOICES)
	period = models.ForeignKey(Period, on_delete=models.CASCADE, related_name="slots")
	stream = models.ForeignKey(
		"students.Stream", on_delete=models.CASCADE, related_name="timetable_slots"
	)
	subject = models.ForeignKey("staff.Subject", on_delete=models.SET_NULL, null=True, blank=True)
	teacher = models.ForeignKey("accounts.User", on_delete=models.SET_NULL, null=True, blank=True)
	academic_year = models.CharField(max_length=9, default="2025/2026")

	class Meta:
		unique_together = ("day", "period", "stream", "academic_year")

	def clean(self):
		from django.core.exceptions import ValidationError

		# Conflict check: teacher cannot be in two streams at same day+period+year
		if self.teacher and self.period and self.day:
			conflict = TimetableSlot.objects.filter(
				day=self.day,
				period=self.period,
				teacher=self.teacher,
				academic_year=self.academic_year,
			).exclude(pk=self.pk).exclude(stream=self.stream)
			if conflict.exists():
				other = conflict.first()
				raise ValidationError(
					f"{self.teacher.name} is already assigned Period {self.period.number} "
					f"on {self.day} to stream {other.stream}."
				)

	def __str__(self):
		return f"{self.day} P{self.period.number} - {self.stream}"

from django.db import models
from core.base_model import BaseModel


class Announcement(BaseModel):
    title = models.CharField(max_length=255)
    message = models.TextField()
    audience = models.CharField(
        max_length=20,
        choices=[('All', 'All'), ('Staff', 'Staff'), ('Students', 'Students')]
    )
    posted_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.title} ({self.audience})"
